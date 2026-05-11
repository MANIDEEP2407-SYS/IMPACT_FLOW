export default function AIFlagBadge({ score }) {
  if (score == null) return null;
  const color = score < 30
    ? 'bg-green-100 text-green-700'
    : score < 60
    ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700';
  const label = score < 30 ? 'Low AI' : score < 60 ? 'Moderate AI' : 'High AI';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      AI: {score}% — {label}
    </span>
  );
}
