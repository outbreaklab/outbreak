import LiveBadge from './LiveBadge';

export default function Header() {
  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 56, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(2, 10, 14, 0.75)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        borderBottom: '1px solid rgba(245, 245, 240, 0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <LiveBadge text="LIVE" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className="font-data" style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.03em' }}>
          WHO synced 8 min ago
        </span>
        <a href="https://www.who.int/emergencies/disease-outbreak-news" target="_blank" rel="noopener noreferrer"
          className="font-data hover-underline"
          style={{ fontSize: 10, color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '0.05em', border: '1px solid rgba(245,245,240,0.1)', padding: '3px 8px', borderRadius: 4 }}>
          WHO DON
        </a>
        <a href="https://x.com" target="_blank" rel="noopener noreferrer"
          className="font-data hover-underline"
          style={{ fontSize: 10, color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '0.05em' }}>
          X
        </a>
        <a href="https://github.com/outbreaklab/outbreak" target="_blank" rel="noopener noreferrer"
          className="font-data hover-underline"
          style={{ fontSize: 10, color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '0.05em' }}>
          GitHub
        </a>
        <a href="https://flaunch.gg" target="_blank" rel="noopener noreferrer"
          className="font-data"
          style={{ fontSize: 10, color: '#020a0e', background: 'var(--accent-amber)', textDecoration: 'none', letterSpacing: '0.06em', fontWeight: 600, padding: '4px 12px', borderRadius: 5, textTransform: 'uppercase' }}>
          Buy
        </a>
      </div>
    </header>
  );
}
