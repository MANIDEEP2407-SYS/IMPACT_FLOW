export default function ContributionBadge({ score }) {
  const isHigh = score >= 70;
  const isMid  = score >= 40;

  const styles = isHigh
    ? { bg: 'var(--success-bg)', border: 'var(--success-border)', color: 'var(--success-text)', icon: '🔥', label: 'High' }
    : isMid
    ? { bg: 'var(--warning-bg)', border: 'var(--warning-border)', color: 'var(--warning-text)', icon: '⚡', label: 'Mid' }
    : { bg: 'var(--danger-bg)', border: 'var(--danger-border)', color: 'var(--danger-text)', icon: '📉', label: 'Low' };

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums"
      style={{ background: styles.bg, border: `1px solid ${styles.border}`, color: styles.color }}
    >
      {styles.icon} {score}/100
    </span>
  );
}
