/**
 * similarity.controller.js
 *
 * README-first similarity engine.
 * Uses weighted multi-factor analysis — NOT raw code comparison.
 *
 * Weight Matrix:
 *   Problem Statement   30%
 *   Feature Similarity  25%
 *   Workflow Similarity 20%
 *   Differentiators     15%
 *   Tech Stack          10%
 */
import { z } from 'zod';
import ProjectREADMEMeta, { VALID_README_DOMAINS } from '../models/ProjectREADMEMeta.js';
import Project from '../models/Project.js';
import Course from '../models/Course.js';
import Team from '../models/Team.js';
import { idsEqual } from '../utils/access.js';
import { VAGUE_PHRASES, VALID_DIFFERENTIATOR_KEYWORDS } from '../utils/scoreWeights.js';

/* ──────────────────────────────────────────────
   TEXT SIMILARITY ENGINE
   Uses Jaccard similarity on normalized token sets.
   No ML — purely deterministic.
────────────────────────────────────────────── */

const STOPWORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','are','was','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'can','this','that','these','those','it','its','we','our','they','their',
  'i','my','you','your','he','his','she','her','not','no','as','so','if',
  'then','than','also','which','who','what','when','where','how','all','any',
  'each','every','both','few','more','most','other','such','into','through',
  'during','before','after','above','between','out','off','over','under',
  'again','further','about','against','up','down',
]);

/* Semantic equivalence groups */
const SEMANTIC_GROUPS = [
  ['login', 'auth', 'authentication', 'signin', 'signup', 'register', 'registration'],
  ['task', 'todo', 'assignment', 'work', 'activity', 'job'],
  ['chat', 'discussion', 'messaging', 'message', 'forum', 'communication'],
  ['dashboard', 'panel', 'overview', 'analytics', 'report', 'statistics', 'stats'],
  ['file', 'upload', 'document', 'attachment', 'storage', 'media'],
  ['notification', 'alert', 'reminder', 'email', 'sms'],
  ['team', 'group', 'collaboration', 'collaborative', 'cooperative'],
  ['ai', 'ml', 'machine learning', 'deep learning', 'neural', 'model', 'prediction'],
  ['recommendation', 'suggest', 'suggestion', 'personalized', 'personalization'],
  ['tracking', 'monitor', 'monitoring', 'track', 'logs', 'logging'],
  ['payment', 'transaction', 'billing', 'invoice', 'checkout'],
  ['search', 'filter', 'query', 'find', 'discover'],
  ['user', 'student', 'faculty', 'teacher', 'professor', 'member', 'profile'],
  ['project', 'course', 'module', 'subject', 'class'],
  ['score', 'grade', 'rating', 'evaluation', 'assessment', 'marks'],
];

function buildSemanticMap() {
  const map = {};
  for (const group of SEMANTIC_GROUPS) {
    const canonical = group[0];
    for (const word of group) {
      map[word] = canonical;
    }
  }
  return map;
}
const SEMANTIC_MAP = buildSemanticMap();

function normalise(word) {
  const lower = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  return SEMANTIC_MAP[lower] || lower;
}

function tokenize(text) {
  if (!text) return new Set();
  const raw = text.toLowerCase().match(/[a-z0-9]+/g) || [];
  return new Set(
    raw
      .filter(w => w.length > 2 && !STOPWORDS.has(w))
      .map(normalise)
  );
}

function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 0;
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

/* Feature list similarity — compare each feature from A to each in B */
function featureListSimilarity(featuresA, featuresB) {
  if (!featuresA.length || !featuresB.length) return 0;
  let totalSim = 0;
  let comparisons = 0;
  for (const fA of featuresA) {
    const tokA = tokenize(fA.title + ' ' + (fA.description || ''));
    let bestMatch = 0;
    for (const fB of featuresB) {
      const tokB = tokenize(fB.title + ' ' + (fB.description || ''));
      bestMatch = Math.max(bestMatch, jaccardSimilarity(tokA, tokB));
    }
    totalSim += bestMatch;
    comparisons++;
  }
  return comparisons > 0 ? totalSim / comparisons : 0;
}

/* Tech stack overlap (simple set intersection) */
function techStackSimilarity(stackA, stackB) {
  if (!stackA.length || !stackB.length) return 0;
  const setA = new Set(stackA.map(s => s.toLowerCase().trim()));
  const setB = new Set(stackB.map(s => s.toLowerCase().trim()));
  const intersection = [...setA].filter(s => setB.has(s)).length;
  return intersection / Math.max(setA.size, setB.size);
}

/* ──────────────────────────────────────────────
   SIMILARITY THRESHOLDS
────────────────────────────────────────────── */
function getSimilarityLevel(score) {
  if (score >= 0.86) return { level: 'critical',     label: 'Possible Duplication',  color: 'red' };
  if (score >= 0.66) return { level: 'high',         label: 'High Similarity',       color: 'orange' };
  if (score >= 0.46) return { level: 'significant',  label: 'Significant Overlap',   color: 'yellow' };
  if (score >= 0.26) return { level: 'mild',         label: 'Mild Similarity',       color: 'blue' };
  return               { level: 'normal',            label: 'Normal Overlap',        color: 'green' };
}

/* ──────────────────────────────────────────────
   VALIDATION HELPERS
────────────────────────────────────────────── */
function countWords(text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

function hasVagueDifferentiators(text) {
  const lower = (text || '').toLowerCase();
  return VAGUE_PHRASES.some(p => lower.includes(p));
}

function hasValidDifferentiators(text) {
  const lower = (text || '').toLowerCase();
  return VALID_DIFFERENTIATOR_KEYWORDS.some(k => lower.includes(k));
}

/* ──────────────────────────────────────────────
   VALIDATION SCHEMA for upsert
────────────────────────────────────────────── */
const readmeMetaSchema = z.object({
  problemStatement: z.string().min(1),
  projectDomain: z.string(),
  techStack: z.array(z.string()).min(1),
  coreFeatures: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
  })).min(1),
  systemWorkflow: z.string().min(1),
  uniqueDifferentiators: z.string().min(1),
});

/* ─── POST /api/projects/:projectId/readme-meta ─── */
export async function upsertREADMEMeta(req, res, next) {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const team = await Team.findOne({
      project: req.params.projectId,
      'members.user': req.user._id,
      status: 'active',
    });
    if (!team) return res.status(403).json({ error: 'You must be in an active team' });

    const body = readmeMetaSchema.parse(req.body);

    const psWords   = countWords(body.problemStatement);
    const swWords   = countWords(body.systemWorkflow);
    const udWords   = countWords(body.uniqueDifferentiators);
    const vague     = hasVagueDifferentiators(body.uniqueDifferentiators);
    const hasValid  = hasValidDifferentiators(body.uniqueDifferentiators);

    const warnings = [];
    if (psWords < 150) warnings.push(`Problem statement should be ≥ 150 words (currently ${psWords})`);
    if (body.coreFeatures.length < 5) warnings.push(`Add at least 5 core features (currently ${body.coreFeatures.length})`);
    if (swWords < 100) warnings.push(`System workflow should be ≥ 100 words (currently ${swWords})`);
    if (udWords < 100) warnings.push(`Unique differentiators should be ≥ 100 words (currently ${udWords})`);
    if (vague && !hasValid)
      warnings.push('Differentiators contain vague phrases. Be more specific about what makes your project unique.');

    // Tokenize features for later similarity
    const tokenizedFeatures = body.coreFeatures.map(f => ({
      title: f.title,
      description: f.description || '',
      tokens: [...tokenize(f.title + ' ' + (f.description || ''))],
    }));

    // Completion score
    let completionScore = 0;
    if (psWords >= 150) completionScore += 25;
    else completionScore += Math.round((psWords / 150) * 25);
    if (body.coreFeatures.length >= 5) completionScore += 20;
    else completionScore += Math.round((body.coreFeatures.length / 5) * 20);
    if (swWords >= 100) completionScore += 20;
    else completionScore += Math.round((swWords / 100) * 20);
    if (udWords >= 100) completionScore += 20;
    else completionScore += Math.round((udWords / 100) * 20);
    if (body.techStack.length >= 3) completionScore += 15;
    else completionScore += Math.round((body.techStack.length / 3) * 15);

    const existing = await ProjectREADMEMeta.findOne({ projectId: project._id });
    const editEntry = {
      editedBy: req.user._id,
      editedAt: new Date(),
      section:  'full',
      wordsBefore: existing
        ? countWords(existing.problemStatement?.text) + countWords(existing.systemWorkflow?.text)
        : 0,
      wordsAfter: psWords + swWords,
    };

    const meta = await ProjectREADMEMeta.findOneAndUpdate(
      { projectId: project._id },
      {
        $set: {
          teamId: team._id,
          updatedBy: req.user._id,
          'problemStatement.text':      body.problemStatement,
          'problemStatement.wordCount': psWords,
          'problemStatement.isValid':   psWords >= 150,
          projectDomain:                body.projectDomain,
          techStack:                    body.techStack,
          coreFeatures:                 tokenizedFeatures,
          'systemWorkflow.text':        body.systemWorkflow,
          'systemWorkflow.wordCount':   swWords,
          'systemWorkflow.isValid':     swWords >= 100,
          'uniqueDifferentiators.text':          body.uniqueDifferentiators,
          'uniqueDifferentiators.wordCount':     udWords,
          'uniqueDifferentiators.isValid':       udWords >= 100,
          'uniqueDifferentiators.hasVaguePhrases': vague,
          completionScore,
          isComplete: completionScore >= 80,
        },
        $push: { editHistory: editEntry },
      },
      { upsert: true, new: true }
    );

    res.json({ meta, warnings, completionScore });
  } catch (err) { next(err); }
}

/* ─── GET /api/projects/:projectId/readme-meta ─── */
export async function getREADMEMeta(req, res, next) {
  try {
    const meta = await ProjectREADMEMeta.findOne({ projectId: req.params.projectId });
    res.json({ meta });
  } catch (err) { next(err); }
}

/* ─── GET /api/courses/:courseId/similarity ─── */
/* Faculty only — compute pairwise similarity across all projects in course */
export async function getCourseSimilarityMatrix(req, res, next) {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (!idsEqual(course.faculty, req.user._id))
      return res.status(403).json({ error: 'Faculty only' });

    const projects = await Project.find({ course: course._id });
    const projectIds = projects.map(p => p._id);
    const metas = await ProjectREADMEMeta.find({ projectId: { $in: projectIds } }).lean();

    // Index by projectId
    const metaMap = {};
    for (const m of metas) metaMap[String(m.projectId)] = m;

    const pairs = [];

    for (let i = 0; i < projects.length; i++) {
      for (let j = i + 1; j < projects.length; j++) {
        const pA = projects[i];
        const pB = projects[j];
        const mA = metaMap[String(pA._id)];
        const mB = metaMap[String(pB._id)];

        if (!mA || !mB) continue;

        const ps  = jaccardSimilarity(
          tokenize(mA.problemStatement?.text),
          tokenize(mB.problemStatement?.text)
        );
        const feat = Math.min(
          featureListSimilarity(mA.coreFeatures || [], mB.coreFeatures || []),
          1
        );
        const wf = jaccardSimilarity(
          tokenize(mA.systemWorkflow?.text),
          tokenize(mB.systemWorkflow?.text)
        );
        const diff = jaccardSimilarity(
          tokenize(mA.uniqueDifferentiators?.text),
          tokenize(mB.uniqueDifferentiators?.text)
        );
        const stack = techStackSimilarity(mA.techStack || [], mB.techStack || []);

        const overallScore =
          ps   * 0.30 +
          feat * 0.25 +
          wf   * 0.20 +
          diff * 0.15 +
          stack * 0.10;

        const rounded = Math.round(overallScore * 100);
        const level = getSimilarityLevel(overallScore);

        // Only include pairs with at least mild similarity
        if (rounded < 10) continue;

        // Build evidence
        const evidence = [];
        if (ps > 0.3)   evidence.push(`Problem statements are ${Math.round(ps*100)}% similar`);
        if (feat > 0.4) evidence.push(`${Math.round(feat*100)}% feature overlap detected`);
        if (wf > 0.3)   evidence.push(`System workflows are ${Math.round(wf*100)}% similar`);
        if (diff > 0.4) evidence.push(`Differentiators are ${Math.round(diff*100)}% similar`);
        if (stack > 0.7) evidence.push(`Tech stacks are ${Math.round(stack*100)}% identical`);

        // Find overlapping features
        const overlappingFeatures = [];
        for (const fA of (mA.coreFeatures || [])) {
          const tokA = new Set(fA.tokens || []);
          for (const fB of (mB.coreFeatures || [])) {
            const tokB = new Set(fB.tokens || []);
            if (jaccardSimilarity(tokA, tokB) > 0.5) {
              overlappingFeatures.push({ a: fA.title, b: fB.title });
            }
          }
        }

        pairs.push({
          projectA: { _id: pA._id, title: pA.title, domain: mA.projectDomain },
          projectB: { _id: pB._id, title: pB.title, domain: mB.projectDomain },
          scores: {
            overall:      rounded,
            problemStatement: Math.round(ps * 100),
            features:     Math.round(feat * 100),
            workflow:     Math.round(wf * 100),
            differentiators: Math.round(diff * 100),
            techStack:    Math.round(stack * 100),
          },
          level,
          evidence,
          overlappingFeatures: overlappingFeatures.slice(0, 5),
        });
      }
    }

    // Sort by overall similarity descending
    pairs.sort((a, b) => b.scores.overall - a.scores.overall);

    res.json({
      courseId: course._id,
      totalProjects: projects.length,
      analyzedProjects: metas.length,
      pairs,
      weightMatrix: {
        problemStatement: '30%',
        features:         '25%',
        workflow:         '20%',
        differentiators:  '15%',
        techStack:        '10%',
      },
    });
  } catch (err) { next(err); }
}

/* ─── GET /api/projects/:projectId/similarity ─── */
/* Compare this project against all others in the same course */
export async function getProjectSimilarity(req, res, next) {
  try {
    const project = await Project.findById(req.params.projectId).populate('course');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isFaculty = req.user.role === 'faculty' && idsEqual(project.course?.faculty, req.user._id);
    if (!isFaculty) return res.status(403).json({ error: 'Faculty only' });

    // Redirect to course-level for consistency
    req.params.courseId = String(project.course._id);
    return getCourseSimilarityMatrix(req, res, next);
  } catch (err) { next(err); }
}

/* ─── GET /api/readme-meta/domains ─── */
export async function getValidDomains(req, res) {
  res.json({ domains: VALID_README_DOMAINS });
}
