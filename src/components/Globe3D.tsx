import { useEffect, useRef, useState } from 'react';
import type { GlobePoint } from '@/data/outbreakData';

interface Globe3DProps {
  route: [number, number][];
  hotspots: GlobePoint[];
  strains: GlobePoint[];
  outbreakPoints?: GlobePoint[];
}

export default function Globe3D({ route, hotspots, strains, outbreakPoints = [] }: Globe3DProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [showArcs, setShowArcs] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showStrains, setShowStrains] = useState(true);
  const [showOutbreaks, setShowOutbreaks] = useState(true);
  const [failed, setFailed] = useState(false);

  /* Init globe — vanilla globe.gl via CDN (same as original site) */
  useEffect(() => {
    const box = boxRef.current;
    if (!box || globeRef.current) return;

    const Globe = (window as any).Globe;
    if (typeof Globe !== 'function') {
      setFailed(true);
      return;
    }

    const globe = Globe()(box)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('rgba(56,189,248,.18)')
      .atmosphereAltitude(0.15)
      .width(box.clientWidth)
      .height(box.clientHeight);

    globe.pointOfView({ lat: 10, lng: 20, altitude: 2.2 });
    const ctl = globe.controls();
    ctl.autoRotate = true;
    ctl.autoRotateSpeed = 0.45;
    ctl.enableDamping = true;

    globeRef.current = globe;

    const onPointerDown = () => {
      ctl.autoRotate = false;
    };
    box.addEventListener('pointerdown', onPointerDown);

    const onResize = () => {
      if (globe && box.clientWidth) {
        globe.width(box.clientWidth).height(box.clientHeight);
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      box.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onResize);
      if (globe && globe._destructor) globe._destructor();
      globeRef.current = null;
    };
  }, []);

  /* Update arcs & points when toggles/data change */
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const arcs: any[] = [];
    if (showArcs) {
      for (let i = 0; i < route.length - 1; i++) {
        arcs.push({
          startLat: route[i][0],
          startLng: route[i][1],
          endLat: route[i + 1][0],
          endLng: route[i + 1][1],
        });
      }
    }
    globe
      .arcsData(arcs)
      .arcColor(() => 'rgba(56,189,248,0.55)')
      .arcAltitude(0.18)
      .arcDashLength(0.4)
      .arcDashGap(1)
      .arcDashAnimateTime(2200);

    const pts: any[] = [];
    if (showHotspots) {
      hotspots.forEach((p) =>
        pts.push({ lat: p.lat, lng: p.lng, color: p.color, radius: p.radius, label: p.label })
      );
    }
    if (showStrains) {
      strains.forEach((s) =>
        pts.push({ lat: s.lat, lng: s.lng, color: s.color, radius: s.radius, label: s.label })
      );
    }
    if (showOutbreaks) {
      outbreakPoints.forEach((o) =>
        pts.push({ lat: o.lat, lng: o.lng, color: o.color, radius: o.radius || 0.85, label: o.label })
      );
    }
    globe
      .pointsData(pts)
      .pointColor((d: any) => d.color)
      .pointRadius((d: any) => d.radius || 0.55)
      .pointAltitude(0.02)
      .pointLabel(
        (d: any) =>
          `<div style="font:600 13px Inter,system-ui;background:rgba(0,0,0,.85);padding:6px 10px;border-radius:6px;color:#f4f4f5;max-width:280px">${d.label}</div>`
      )
      .pointResolution(16);
  }, [showArcs, showHotspots, showStrains, showOutbreaks, route, hotspots, strains, outbreakPoints]);

  if (failed) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        3D Globe loading failed. Try refreshing the page.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={boxRef} style={{ width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          padding: '8px 16px',
          background: 'rgba(6,15,21,0.9)',
          borderTop: '1px solid rgba(245,245,240,0.06)',
          fontSize: '0.63rem',
          color: 'var(--text-dim)',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            fontWeight: 500,
            color: 'var(--text-dim)',
            fontSize: '0.63rem',
          }}
        >
          <input
            type="checkbox"
            checked={showArcs}
            onChange={(e) => setShowArcs(e.target.checked)}
            style={{ accentColor: 'var(--accent-amber)' }}
          />
          Ship route
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            fontWeight: 500,
            color: 'var(--text-dim)',
            fontSize: '0.63rem',
          }}
        >
          <input
            type="checkbox"
            checked={showHotspots}
            onChange={(e) => setShowHotspots(e.target.checked)}
            style={{ accentColor: 'var(--accent-amber)' }}
          />
          Case hotspots
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            fontWeight: 500,
            color: 'var(--text-dim)',
            fontSize: '0.63rem',
          }}
        >
          <input
            type="checkbox"
            checked={showStrains}
            onChange={(e) => setShowStrains(e.target.checked)}
            style={{ accentColor: 'var(--accent-amber)' }}
          />
          Strain reservoirs
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            fontWeight: 500,
            color: 'var(--text-dim)',
            fontSize: '0.63rem',
          }}
        >
          <input
            type="checkbox"
            checked={showOutbreaks}
            onChange={(e) => setShowOutbreaks(e.target.checked)}
            style={{ accentColor: 'var(--accent-amber)' }}
          />
          Live outbreaks
        </label>
        <span style={{ marginLeft: 'auto', fontSize: '0.6rem' }}>
          Drag to rotate · Scroll to zoom · Click points for details
        </span>
      </div>
    </div>
  );
}
