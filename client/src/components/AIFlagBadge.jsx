export default function AIFlagBadge({ score }) {
  if (score == null) return null;

  const isLow = score < 30;
  const isMid = score < 60;
  const icon  = isLow ? '✅' : isMid ? '⚠️' : '🚨';
  const label = isLow ? 'Low AI' : isMid ? 'Moderate AI' : 'High AI';
  const styles = isLow
    ? { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' }
    : isMid
    ? { bg: '#fffbeb', border: '#fde68a', color: '#b45309' }
    : { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' };

  return (
    <span
      title={`AI Transparency Score: ${score}/100`}
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold cursor-help transition-transform hover:scale-105"
      style={{ background: styles.bg, border: `1.5px solid ${styles.border}`, color: styles.color }}
    >
      {icon} {label} · {score}%
    </span>
  );
}
