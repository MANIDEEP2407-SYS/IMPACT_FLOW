/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  DSA UTILITY: Merge Sort — Student Contribution Ranking
 *  Used in: Faculty Project Dashboard, Team Workspace Leaderboard
 *
 *  Time  Complexity: O(n log n)
 *  Space Complexity: O(n)
 *
 *  Why Merge Sort?
 *  - Stable sort — students with equal scores retain original order
 *  - Predictable O(n log n) worst case unlike Quick Sort
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Merge two sorted halves back into one sorted array.
 * @param {Array} left
 * @param {Array} right
 * @param {string} key  — property to sort by (default: 'contributionScore')
 * @returns {Array}
 */
function merge(left, right, key) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    // Sort DESCENDING — highest score first
    if (left[i][key] >= right[j][key]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}

/**
 * Recursive Merge Sort.
 * @param {Array}  arr  — array of student/member objects
 * @param {string} key  — numeric property to sort by
 * @returns {Array}     — new sorted array (non-mutating)
 */
export function mergeSort(arr, key = 'contributionScore') {
  if (arr.length <= 1) return arr;
  const mid   = Math.floor(arr.length / 2);
  const left  = mergeSort(arr.slice(0, mid), key);
  const right = mergeSort(arr.slice(mid),    key);
  return merge(left, right, key);
}

/**
 * Rank students in a team by their contribution score.
 * Returns array with `rank` field added (1 = top contributor).
 *
 * @param {Array} members — [{name, contributionScore, ...}]
 * @returns {Array}       — sorted + ranked members
 */
export function rankByContribution(members) {
  const sorted = mergeSort(
    members.map(m => ({ ...m, contributionScore: m.contributionScore ?? 0 })),
    'contributionScore',
  );
  return sorted.map((m, i) => ({ ...m, rank: i + 1 }));
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  DSA UTILITY: TF-IDF + Cosine Similarity — README Plagiarism Detection
 *  Used in: Faculty Similarity Report, Team Workspace README tab
 *
 *  Time  Complexity: O(n × |V|)  where |V| = vocabulary size
 *  Space Complexity: O(|V|)
 *
 *  Pipeline:
 *  1. Tokenise text → normalised lowercase words
 *  2. Build TF (term frequency) vector per document
 *  3. Compute IDF (inverse doc frequency) across corpus
 *  4. Multiply TF × IDF per term → TF-IDF vector
 *  5. Cosine similarity = dot(A, B) / (|A| × |B|)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'is','are','was','were','be','been','being','have','has','had','do','does',
  'did','will','would','could','should','may','might','shall','this','that',
  'these','those','it','its','we','our','they','their','i','my','you','your',
]);

/**
 * Tokenise text — lowercase, strip punctuation, remove stop words.
 */
function tokenise(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Term Frequency vector for a single document.
 * TF(t, d) = count(t in d) / total_terms(d)
 */
function termFrequency(tokens) {
  const freq = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  const total = tokens.length || 1;
  Object.keys(freq).forEach(k => (freq[k] /= total));
  return freq;
}

/**
 * Inverse Document Frequency for vocabulary across all docs.
 * IDF(t) = log(N / df(t) + 1)
 */
function inverseDocFrequency(docs) {
  const N   = docs.length;
  const idf = {};
  const vocab = new Set(docs.flatMap(Object.keys));
  for (const term of vocab) {
    const df = docs.filter(d => term in d).length;
    idf[term] = Math.log((N + 1) / (df + 1));
  }
  return idf;
}

/**
 * Build TF-IDF vector for one document.
 */
function tfidfVector(tf, idf) {
  const vec = {};
  for (const term of Object.keys(idf)) {
    vec[term] = (tf[term] || 0) * idf[term];
  }
  return vec;
}

/**
 * Cosine similarity between two vectors.
 * Returns 0.0 → 1.0
 */
function cosine(vecA, vecB) {
  const keys  = Object.keys(vecA);
  let   dot   = 0, magA = 0, magB = 0;
  for (const k of keys) {
    dot  += (vecA[k] || 0) * (vecB[k] || 0);
    magA += vecA[k] ** 2;
    magB += (vecB[k] || 0) ** 2;
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Calculate cosine similarity percentage between two strings.
 * @param {string} textA
 * @param {string} textB
 * @returns {number} 0–100
 */
export function calculateCosineSimilarity(textA, textB) {
  if (!textA || !textB) return 0;
  const tokA = tokenise(textA);
  const tokB = tokenise(textB);
  if (!tokA.length || !tokB.length) return 0;

  const tfA   = termFrequency(tokA);
  const tfB   = termFrequency(tokB);
  const idf   = inverseDocFrequency([tfA, tfB]);
  const vecA  = tfidfVector(tfA, idf);
  const vecB  = tfidfVector(tfB, idf);
  return Math.round(cosine(vecA, vecB) * 100);
}

/**
 * Pairwise similarity report for an array of team documents.
 * @param {Array<{teamId, teamName, content}>} teamDocs
 * @returns {Array<{teamA, teamB, similarity, flagged}>}
 */
export function buildSimilarityReport(teamDocs) {
  const results = [];
  for (let i = 0; i < teamDocs.length; i++) {
    for (let j = i + 1; j < teamDocs.length; j++) {
      const sim = calculateCosineSimilarity(teamDocs[i].content, teamDocs[j].content);
      results.push({
        teamA:      teamDocs[i].teamName,
        teamB:      teamDocs[j].teamName,
        teamAId:    teamDocs[i].teamId,
        teamBId:    teamDocs[j].teamId,
        similarity: sim,
        flagged:    sim > 50,
        risk:       sim > 75 ? 'High' : sim > 50 ? 'Medium' : 'Low',
      });
    }
  }
  // Sort by similarity descending — highest risk first (Merge Sort)
  return mergeSort(results, 'similarity');
}
