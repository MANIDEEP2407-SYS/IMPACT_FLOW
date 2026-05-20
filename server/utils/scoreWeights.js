/* ── Score weight matrix — publicly visible, deterministic ── */
export const SCORE_WEIGHTS = {
  // LOW VALUE
  DISCUSSION_REPLY:      1,
  DISCUSSION_POSTED:     2,
  README_EDIT_MINOR:     2,
  TASK_CREATED:          2,
  // MEDIUM VALUE
  FILE_UPLOAD:           4,
  README_EDIT_MAJOR:     5,
  TASK_COMPLETED:        6,
  TASK_REVIEWED:         5,
  DOCUMENTATION_UPLOAD:  6,
  // HIGH VALUE
  MILESTONE_SUBMITTED:   12,
  MILESTONE_REVISED:     8,
  GITHUB_PR_OPENED:      10,
  GITHUB_PR_MERGED:      15,
  GITHUB_COMMIT:         12,
  GITHUB_ISSUE_COMMENT:  3,
};

export const VALIDATION_MULTIPLIERS = {
  verified:   1.0,
  suspicious: 0.5,
  invalid:    0.0,
};

export const QUALITY_MULTIPLIERS = {
  low:    0.5,
  medium: 1.0,
  high:   1.5,
};

export const SOURCE_CATEGORIES = {
  TASK:        ['TASK_CREATED', 'TASK_COMPLETED', 'TASK_REVIEWED'],
  WORKSPACE:   ['FILE_UPLOAD', 'FILE_UPDATE', 'DOCUMENTATION_UPLOAD'],
  README:      ['README_EDIT_MINOR', 'README_EDIT_MAJOR'],
  DISCUSSION:  ['DISCUSSION_POSTED', 'DISCUSSION_REPLY'],
  MILESTONE:   ['MILESTONE_SUBMITTED', 'MILESTONE_REVISED'],
  GITHUB:      ['GITHUB_COMMIT', 'GITHUB_PR_OPENED', 'GITHUB_PR_MERGED', 'GITHUB_ISSUE_COMMENT'],
};

export const CATEGORY_LABELS = {
  TASK:       'Task Work',
  WORKSPACE:  'Files & Docs',
  README:     'Documentation',
  DISCUSSION: 'Collaboration',
  MILESTONE:  'Milestones',
  GITHUB:     'GitHub Activity',
};

/* Compute final score from components */
export function computeFinalScore(baseScore, validationState, qualityLevel) {
  const v = VALIDATION_MULTIPLIERS[validationState] ?? 1.0;
  const q = QUALITY_MULTIPLIERS[qualityLevel] ?? 1.0;
  return Math.round(baseScore * v * q * 10) / 10;
}

/* Anti-spam: max replies per hour per user per team */
export const MAX_DISCUSSION_REPLIES_PER_HOUR = 3;

/* Vague differentiator phrases to reject */
export const VAGUE_PHRASES = [
  'user-friendly', 'modern ui', 'easy to use', 'intuitive', 'simple',
  'clean design', 'responsive', 'fast', 'efficient', 'innovative',
  'state of the art', 'cutting edge', 'next generation',
];

/* Valid differentiator keywords */
export const VALID_DIFFERENTIATOR_KEYWORDS = [
  'workflow', 'architecture', 'algorithm', 'integration', 'model',
  'pipeline', 'protocol', 'mechanism', 'detection', 'analysis',
  'optimization', 'automation', 'authentication', 'validation',
];
