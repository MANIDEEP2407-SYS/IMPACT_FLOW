import { z } from 'zod';
import GitHubLink from '../models/GitHubLink.js';
import Team from '../models/Team.js';
import Project from '../models/Project.js';
import { emitContributionEvent } from '../utils/eventEmitter.js';
import { idsEqual } from '../utils/access.js';

const GITHUB_API = 'https://api.github.com';
const GITHUB_HEADERS = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'ImpactFlow-App/1.0',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
};

const linkSchema = z.object({
  githubUsername: z.string().min(1).max(100).regex(/^[a-zA-Z0-9-]+$/),
  repoUrl: z.string().url().includes('github.com'),
});

/* ─── Extract owner + repo from GitHub URL ─── */
function parseRepoUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
  if (!match) throw new Error('Invalid GitHub repo URL');
  return { repoOwner: match[1], repoName: match[2].replace(/\.git$/, '') };
}

/* ─── POST /api/projects/:projectId/github-link ─── */
export async function linkGitHub(req, res, next) {
  try {
    const { githubUsername, repoUrl } = linkSchema.parse(req.body);
    const { repoOwner, repoName } = parseRepoUrl(repoUrl);

    // Verify user is in an active team for this project
    const team = await Team.findOne({
      project: req.params.projectId,
      'members.user': req.user._id,
      status: 'active',
    });
    if (!team) return res.status(400).json({ error: 'You must be in an active team' });

    // Verify repo exists and is accessible via GitHub API
    const repoRes = await fetch(`${GITHUB_API}/repos/${repoOwner}/${repoName}`, {
      headers: GITHUB_HEADERS,
    });
    if (!repoRes.ok) {
      return res.status(400).json({ error: 'GitHub repo not found or inaccessible. Make sure it is public.' });
    }

    const link = await GitHubLink.findOneAndUpdate(
      { userId: req.user._id, projectId: req.params.projectId },
      { githubUsername, repoOwner, repoName, repoUrl, isVerified: true },
      { upsert: true, new: true }
    );

    res.status(201).json({ link });
  } catch (err) { next(err); }
}

/* ─── GET /api/projects/:projectId/github-link ─── */
export async function getGitHubLink(req, res, next) {
  try {
    const link = await GitHubLink.findOne({
      userId: req.user._id,
      projectId: req.params.projectId,
    });
    res.json({ link });
  } catch (err) { next(err); }
}

/* ─── POST /api/projects/:projectId/github-sync ─── */
/* Fetch latest commits + PRs from GitHub and create contribution events */
export async function syncGitHub(req, res, next) {
  try {
    const link = await GitHubLink.findOne({
      userId: req.user._id,
      projectId: req.params.projectId,
    });
    if (!link) return res.status(400).json({ error: 'No GitHub account linked for this project' });

    const team = await Team.findById(link.teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const { repoOwner, repoName, githubUsername } = link;
    const results = { commits: 0, prs: 0, errors: [] };

    /* ── Fetch commits authored by this user ── */
    try {
      const commitsRes = await fetch(
        `${GITHUB_API}/repos/${repoOwner}/${repoName}/commits?author=${githubUsername}&per_page=100`,
        { headers: GITHUB_HEADERS }
      );
      if (commitsRes.ok) {
        const commits = await commitsRes.json();
        for (const c of commits) {
          const sha = c.sha;
          const message = c.commit?.message || '';
          // Skip empty / merge commits
          if (!message || message.startsWith('Merge ')) continue;

          const event = await emitContributionEvent({
            userId:    req.user._id,
            projectId: req.params.projectId,
            teamId:    team._id,
            sourceType: 'GITHUB',
            eventType:  'GITHUB_COMMIT',
            metadata: {
              commitSha:     sha,
              description:   `Commit: ${message.slice(0, 100)}`,
              repoUrl:       link.repoUrl,
              commitMessage: message,
            },
          });
          if (event) results.commits++;
        }
      }
    } catch (e) { results.errors.push(`Commits: ${e.message}`); }

    /* ── Fetch merged PRs by this user ── */
    try {
      const prsRes = await fetch(
        `${GITHUB_API}/repos/${repoOwner}/${repoName}/pulls?state=closed&per_page=50`,
        { headers: GITHUB_HEADERS }
      );
      if (prsRes.ok) {
        const prs = await prsRes.json();
        for (const pr of prs) {
          if (pr.user?.login?.toLowerCase() !== githubUsername.toLowerCase()) continue;
          const eventType = pr.merged_at ? 'GITHUB_PR_MERGED' : 'GITHUB_PR_OPENED';
          await emitContributionEvent({
            userId:    req.user._id,
            projectId: req.params.projectId,
            teamId:    team._id,
            sourceType: 'GITHUB',
            eventType,
            metadata: {
              prNumber:    pr.number,
              description: `PR #${pr.number}: ${pr.title?.slice(0, 100)}`,
              repoUrl:     link.repoUrl,
            },
          });
          results.prs++;
        }
      }
    } catch (e) { results.errors.push(`PRs: ${e.message}`); }

    link.lastSyncedAt = new Date();
    link.syncError = results.errors.length ? results.errors.join('; ') : null;
    await link.save();

    res.json({ synced: true, results });
  } catch (err) { next(err); }
}

/* ─── GET /api/projects/:projectId/github-links/team ─── */
/* Get all team members' GitHub links (faculty or team members) */
export async function getTeamGitHubLinks(req, res, next) {
  try {
    const project = await Project.findById(req.params.projectId).populate('course');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isFaculty = req.user.role === 'faculty' && idsEqual(project.course?.faculty, req.user._id);
    const team = await Team.findOne({ project: req.params.projectId, 'members.user': req.user._id });
    if (!isFaculty && !team) return res.status(403).json({ error: 'Access denied' });

    const links = await GitHubLink.find({ projectId: req.params.projectId })
      .populate('userId', 'name rollNo');
    res.json({ links });
  } catch (err) { next(err); }
}
