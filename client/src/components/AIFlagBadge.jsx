export default function AIFlagBadge({ score }) {
  if (score == null) return null;

  const isLow = score < 30;
  const isMid = score < 60;
  const icon  = isLow ? '✅' : isMid ? '⚠️' : '🚨';
  const label = isLow ? 'Low AI' : isMid ? 'Moderate AI' : 'High AI';
  const styles = isLow
    ? { bg: 'var(--success-bg)', border: 'var(--success-border)', color: 'var(--success-text)' }
    : isMid
    ? { bg: 'var(--warning-bg)', border: 'var(--warning-border)', color: 'var(--warning-text)' }
    : { bg: 'var(--danger-bg)', border: 'var(--danger-border)', color: 'var(--danger-text)' };

  return (
    <span
      title={`AI Transparency Score: ${score}/100`}
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold cursor-help transition-transform hover:scale-105"
      style={{ background: styles.bg, border: `1px solid ${styles.border}`, color: styles.color }}
    >
      {icon} {label} · {score}%
    </span>
  );
}
