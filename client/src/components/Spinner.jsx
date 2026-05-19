export default function Spinner({ size = 'md' }) {
  const dim = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6';
  const thick = size === 'sm' ? 'border-2' : 'border-[3px]';
  return (
    <div
      className={`${dim} ${thick} animate-spin rounded-full`}
      style={{
        borderColor: 'var(--border-glass)',
        borderTopColor: 'var(--neon-500)',
        borderRightColor: 'var(--cyber-500)',
        filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.2))',
      }}
    />
  );
}
