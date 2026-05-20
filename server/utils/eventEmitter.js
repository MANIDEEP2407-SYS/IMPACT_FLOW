/**
 * eventEmitter.js
 * Single place to create ContributionEvents — all controllers import from here.
 * Handles: deduplication, anti-spam, suspicious-flag, final score computation.
 */
import ContributionEvent from '../models/ContributionEvent.js';
import {
  SCORE_WEIGHTS, computeFinalScore,
  MAX_DISCUSSION_REPLIES_PER_HOUR, VALIDATION_MULTIPLIERS,
} from './scoreWeights.js';

/**
 * Determine quality level from event metadata.
 * Rules: files > 50KB → high; tasks with description → medium/high; GitHub PRs merged → high
 */
function deriveQuality(eventType, metadata = {}) {
  if (['GITHUB_PR_MERGED', 'MILESTONE_SUBMITTED'].includes(eventType)) return 'high';
  if (['DOCUMENTATION_UPLOAD'].includes(eventType)) return 'high';
  if (eventType === 'README_EDIT_MAJOR') return 'high';
  if (eventType === 'README_EDIT_MINOR') return 'low';
  if (eventType === 'TASK_COMPLETED' && metadata.wordCount >= 30) return 'high';
  if (eventType === 'TASK_COMPLETED') return 'medium';
  if (eventType === 'GITHUB_COMMIT' && metadata.commitMessage?.length > 20) return 'high';
  if (['GITHUB_PR_OPENED', 'GITHUB_COMMIT'].includes(eventType)) return 'medium';
  if (metadata.fileSize > 50000) return 'high';
  if (metadata.fileSize > 5000)  return 'medium';
  return 'medium';
}

/**
 * Anti-spam: check discussion reply rate for this user+team.
 * Returns true if this reply should be flagged as suspicious.
 */
async function isDiscussionReplySpam(userId, teamId) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const count = await ContributionEvent.countDocuments({
    userId,
    teamId,
    eventType: 'DISCUSSION_REPLY',
    createdAt: { $gte: oneHourAgo },
    validationState: { $ne: 'invalid' },
  });
  return count >= MAX_DISCUSSION_REPLIES_PER_HOUR;
}

/**
 * Dedup: check if a GitHub commit SHA already exists for this project.
 */
async function isDuplicateCommit(projectId, commitSha) {
  if (!commitSha) return false;
  const exists = await ContributionEvent.findOne({
    projectId,
    eventType: 'GITHUB_COMMIT',
    'metadata.commitSha': commitSha,
  });
  return !!exists;
}

/**
 * Dedup: check if same file hash already uploaded in this project by same user.
 */
async function isDuplicateFile(userId, projectId, fileHash) {
  if (!fileHash) return false;
  const exists = await ContributionEvent.findOne({
    userId,
    projectId,
    eventType: { $in: ['FILE_UPLOAD', 'DOCUMENTATION_UPLOAD'] },
    'metadata.fileHash': fileHash,
  });
  return !!exists;
}

/**
 * Main emit function. Call this from any controller to record a contribution event.
 *
 * @param {Object} opts
 * @param {ObjectId} opts.userId
 * @param {ObjectId} opts.projectId
 * @param {ObjectId} opts.teamId
 * @param {string}   opts.sourceType
 * @param {string}   opts.eventType
 * @param {ObjectId} [opts.referenceId]
 * @param {string}   [opts.referenceModel]
 * @param {Object}   [opts.metadata]
 */
export async function emitContributionEvent(opts) {
  try {
    const {
      userId, projectId, teamId,
      sourceType, eventType,
      referenceId, referenceModel,
      metadata = {},
    } = opts;

    // ── Deduplication checks ──
    if (eventType === 'GITHUB_COMMIT') {
      if (await isDuplicateCommit(projectId, metadata.commitSha)) return null;
    }
    if (['FILE_UPLOAD', 'DOCUMENTATION_UPLOAD'].includes(eventType)) {
      if (metadata.fileHash && await isDuplicateFile(userId, projectId, metadata.fileHash)) return null;
    }

    // ── Anti-spam check ──
    let isSuspicious = false;
    let suspicionReason = '';
    let validationState = 'verified';

    if (eventType === 'DISCUSSION_REPLY') {
      const spam = await isDiscussionReplySpam(userId, teamId);
      if (spam) {
        isSuspicious = true;
        suspicionReason = `More than ${MAX_DISCUSSION_REPLIES_PER_HOUR} replies in 1 hour`;
        validationState = 'suspicious';
      }
    }

    // ── Task quality gate ──
    if (eventType === 'TASK_CREATED' && (!metadata.description || metadata.description.trim().length < 20)) {
      validationState = 'invalid';
    }

    // ── Compute score ──
    const baseScore = SCORE_WEIGHTS[eventType] ?? 0;
    const qualityLevel = deriveQuality(eventType, metadata);
    const validationMultiplier = VALIDATION_MULTIPLIERS[validationState];
    const qualityMultiplier = qualityLevel === 'high' ? 1.5 : qualityLevel === 'low' ? 0.5 : 1.0;
    const finalScore = computeFinalScore(baseScore, validationState, qualityLevel);

    const event = await ContributionEvent.create({
      userId,
      projectId,
      teamId,
      sourceType,
      eventType,
      referenceId,
      referenceModel,
      baseScore,
      validationMultiplier,
      qualityMultiplier,
      finalScore,
      qualityLevel,
      validationState,
      metadata,
      isSuspicious,
      suspicionReason,
      isValidated: validationState !== 'invalid',
    });

    return event;
  } catch (err) {
    // Non-fatal — never break the main request
    console.error('[eventEmitter] Failed to emit event:', err.message);
    return null;
  }
}
