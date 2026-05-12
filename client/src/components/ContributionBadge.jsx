export default function ContributionBadge({ score }) {
  const isHigh = score >= 70;
  const isMid  = score >= 40;

  const styles = isHigh
    ? { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', icon: '🔥', label: 'High' }
    : isMid
    ? { bg: '#fffbeb', border: '#fde68a', color: '#b45309', icon: '⚡', label: 'Mid' }
    : { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', icon: '📉', label: 'Low' };

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums"
      style={{ background: styles.bg, border: `1.5px solid ${styles.border}`, color: styles.color }}
    >
      {styles.icon} {score}/100
    </span>
  );
}
