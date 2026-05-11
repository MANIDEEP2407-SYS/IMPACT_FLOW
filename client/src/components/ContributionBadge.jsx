export default function ContributionBadge({ score }) {
  const color = score >= 70
    ? 'bg-green-100 text-green-700'
    : score >= 40
    ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {score}/100
    </span>
  );
}
