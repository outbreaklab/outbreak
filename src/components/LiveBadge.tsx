interface LiveBadgeProps {
  text?: string;
  color?: string;
}

export default function LiveBadge({ text = 'SYSTEM ONLINE', color = 'var(--accent-amber)' }: LiveBadgeProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
        }}
        className="animate-pulse-amber"
      />
      <span
        className="font-data"
        style={{
          fontSize: 10,
          letterSpacing: '0.08em',
          color,
          textTransform: 'uppercase',
        }}
      >
        {text}
      </span>
    </div>
  );
}
