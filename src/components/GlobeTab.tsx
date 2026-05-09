import { trpc } from '@/providers/trpc';
import LiquidGlass from '@/components/LiquidGlass';
import Globe3D from '@/components/Globe3D';
import SequentialBlurReveal from '@/components/SequentialBlurReveal';
import { getSeverityColor, GLOBE_ROUTE, GLOBE_HOTSPOTS, GLOBE_STRAINS, ACTIVE_OUTBREAKS } from '@/data/outbreakData';

export default function GlobeTab() {
  const routeQuery = trpc.ship.getRoute.useQuery();
  const shipQuery = trpc.ship.getCurrent.useQuery();
  const globalQuery = trpc.outbreak.getGlobal.useQuery();
  const route = routeQuery.data || [];
  const ship = shipQuery.data;
  const outbreaks = globalQuery.data?.outbreaks || ACTIVE_OUTBREAKS;

  // Convert real outbreaks to globe points
  const outbreakPoints = outbreaks.map((o) => ({
    lat: o.lat,
    lng: o.lng,
    color: getSeverityColor(o.severity),
    radius: o.severity === 'critical' ? 1.0 : o.severity === 'high' ? 0.85 : 0.6,
    label: `${o.disease} — ${o.location} (${o.casesConfirmed?.toLocaleString()} cases, ${o.deaths} deaths)`,
  }));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="font-data" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--accent-amber)', textTransform: 'uppercase', marginBottom: 6 }}>Global Tracking</div>
        <SequentialBlurReveal
          text="LIVE GLOBE"
          as="h2"
          className="font-display"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.1 }}
          scrollTrigger={false}
          stagger={0.04}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        {/* Globe */}
        <LiquidGlass style={{ borderRadius: 24, overflow: 'hidden', aspectRatio: '1', position: 'relative' }}>
          <Globe3D route={GLOBE_ROUTE} hotspots={GLOBE_HOTSPOTS} strains={GLOBE_STRAINS} outbreakPoints={outbreakPoints} />
        </LiquidGlass>

        {/* Ship Status */}
        <LiquidGlass style={{ borderRadius: 24, padding: 24 }}>
          <div className="font-data" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 16 }}>MV HONDIUS STATUS</div>
          <div style={{ marginBottom: 20 }}>
            {[
              { k: 'Vessel', v: ship?.vesselName || 'MV Hondius' },
              { k: 'Operator', v: ship?.operator || 'Oceanwide Expeditions' },
              { k: 'Status', v: ship?.status || 'En route Tenerife', c: 'var(--accent-amber)' },
              { k: 'Onboard', v: `${ship?.peopleOnboard || 150} people` },
              { k: 'Destination', v: ship?.destination || 'Tenerife, Canary Islands' },
              { k: 'Coordinates', v: `${(ship?.latitude || 28.05).toFixed(2)}\u00b0, ${(ship?.longitude || -15.6).toFixed(2)}\u00b0` },
              { k: 'In ICU', v: String(ship?.inIcu || 2), c: 'var(--alert-red)' },
              { k: 'Evacuated', v: String(ship?.evacuated || 3), c: 'var(--sky)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(245,245,240,0.04)' }}>
                <span className="font-data" style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{item.k}</span>
                <span className="font-data" style={{ fontSize: '0.7rem', color: item.c || 'var(--text-primary)', fontWeight: 500 }}>{item.v}</span>
              </div>
            ))}
          </div>

          {/* Tracked Hotspots */}
          <div className="font-data" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 12 }}>TRACKED HOTSPOTS</div>
          {outbreaks.slice(0, 6).map((spot, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(245,245,240,0.04)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: getSeverityColor(spot.severity), flexShrink: 0, boxShadow: `0 0 10px ${getSeverityColor(spot.severity)}80` }} className="animate-pulse-amber" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spot.disease}</div>
                <div className="font-data" style={{ fontSize: '0.5rem', color: 'var(--text-dim)' }}>{spot.location} — {spot.casesConfirmed?.toLocaleString()} cases</div>
              </div>
              <span className="font-data" style={{ fontSize: '0.5rem', color: getSeverityColor(spot.severity), textTransform: 'uppercase', fontWeight: 500, flexShrink: 0 }}>{spot.severity}</span>
            </div>
          ))}

          {/* Route */}
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,159,28,0.05)', border: '1px solid rgba(255,159,28,0.1)' }}>
            <div className="font-data" style={{ fontSize: '0.5rem', color: 'var(--accent-amber)', textTransform: 'uppercase', marginBottom: 4 }}>SHIP ROUTE</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              {route.map((r: any, i: number) => (
                <span key={i}><span style={{ color: i === route.length - 1 ? 'var(--accent-amber)' : 'var(--text-dim)' }}>{r.name.split(' \u2014 ')[0]}</span>{i < route.length - 1 ? ' \u2192 ' : ''}</span>
              ))}
            </div>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}
