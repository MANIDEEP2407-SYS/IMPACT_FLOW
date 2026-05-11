export function getAIFlagScore(text) {
  if (!text || text.trim().length < 20) return 0;
  let score = 0;
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
  const avgLen = sentences.reduce((a, s) => a + s.length, 0) / Math.max(sentences.length, 1);
  if (avgLen > 25) score += 30;
  if (/furthermore|moreover|consequently|thus|hence/gi.test(text)) score += 25;
  if (/it is important to note|in conclusion|in summary|it is worth noting/gi.test(text)) score += 25;
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const ratio = uniqueWords.size / Math.max(words.length, 1);
  if (ratio < 0.4) score += 20;
  return Math.min(score, 100);
}

export function getAIFlagDetails(score) {
  if (score < 30) return 'Low AI likelihood';
  if (score < 60) return 'Moderate AI likelihood — review recommended';
  return 'High AI likelihood — manual review required';
}
