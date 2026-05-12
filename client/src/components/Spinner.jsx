export default function Spinner({ size = 'md' }) {
  const dim = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6';
  const thick = size === 'sm' ? 'border-2' : 'border-[3px]';
  return (
    <div
      className={`${dim} ${thick} animate-spin rounded-full`}
      style={{
        borderColor: '#e0e7ff',
        borderTopColor: '#4f46e5',
        borderRightColor: '#0d9488',
      }}
    />
  );
}
