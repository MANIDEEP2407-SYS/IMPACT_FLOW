/**
 * Jaccard similarity between two strings (word-level)
 * Returns 0.0 → 1.0
 */
export function jaccardSimilarity(a, b) {
  if (!a || !b) return 0;
  const tokensA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const tokensB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  const intersection = [...tokensA].filter(t => tokensB.has(t)).length;
  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : Math.round((intersection / union) * 100);
}

/**
 * Run README similarity check across all teams in same project
 * Returns array of { teamA, teamB, similarity }
 */
import ReadmeVersion from '../models/ReadmeVersion.js';
import Team          from '../models/Team.js';

export async function calcProjectSimilarity(projectId) {
  /* Get latest README per team */
  const teams = await Team.find({ project: projectId });
  const latests = await Promise.all(
    teams.map(async t => {
      const v = await ReadmeVersion.findOne({ team: t._id }).sort('-versionNumber');
      return { teamId: t._id, teamName: t.name, content: v?.content || '' };
    }),
  );

  const results = [];
  for (let i = 0; i < latests.length; i++) {
    for (let j = i + 1; j < latests.length; j++) {
      const sim = jaccardSimilarity(latests[i].content, latests[j].content);
      results.push({
        teamA:      latests[i].teamName,
        teamB:      latests[j].teamName,
        teamAId:    latests[i].teamId,
        teamBId:    latests[j].teamId,
        similarity: sim,
        flagged:    sim > 50,
      });
    }
  }
  return results;
}
