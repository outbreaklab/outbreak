import { useState, useEffect, useRef, useMemo } from 'react';
import { trpc } from '@/providers/trpc';
import LiquidGlass from '@/components/LiquidGlass';
import StatCounter from '@/components/StatCounter';
import { FALLBACK_DATA, daysSince } from '@/data/outbreakData';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function DashboardTab() {
  const newsQuery = trpc.news.fetchLatest.useQuery(undefined, { refetchInterval: 5 * 60 * 1000 });
  const gdeltQuery = trpc.gdelt.fetchOutbreaks.useQuery(undefined, { refetchInterval: 5 * 60 * 1000 });
  const shipQuery = trpc.ship.getCurrent.useQuery(undefined, { refetchInterval: 2 * 60 * 1000 });
  const globalQuery = trpc.outbreak.getGlobal.useQuery(undefined, { refetchInterval: 10 * 60 * 1000 });
  // Latest DB record from Claude AI extraction (refreshes every 30 min)
  const latestCaseQuery = trpc.outbreak.getLatest.useQuery(undefined, { refetchInterval: 30 * 60 * 1000 });
  const aiQuery = trpc.ai.analyze.useMutation();

  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const ship = shipQuery.data;
  // Live DB data from Claude AI extraction overlays the static fallback
  const liveCase = latestCaseQuery.data as any;
  const FALLBACK = FALLBACK_DATA.metrics;
  const METRICS = {
    casesTotal: liveCase ? (liveCase.casesConfirmed ?? 0) + (liveCase.casesSuspected ?? 0) : FALLBACK.casesTotal,
    casesConfirmed: liveCase?.casesConfirmed ?? FALLBACK.casesConfirmed,
    casesSuspected: liveCase?.casesSuspected ?? FALLBACK.casesSuspected,
    deaths: liveCase?.deaths ?? FALLBACK.deaths,
    cfrPct: liveCase?.cfr ?? FALLBACK.cfrPct,
    symptomaticNow: ship?.symptomatic ?? FALLBACK.symptomaticNow,
    evacuated: ship?.evacuated ?? FALLBACK.evacuated,
    inIcu: ship?.inIcu ?? FALLBACK.inIcu,
    nationalities: FALLBACK.nationalities,
    peopleOnboard: ship?.peopleOnboard ?? FALLBACK.peopleOnboard,
    shipStatus: ship?.status ?? FALLBACK.shipStatus,
    strain: FALLBACK.strain,
  };
  const isLiveData = liveCase != null;
  const DAY_COUNT = daysSince(FALLBACK_DATA.indexDate);

  // Ship data rows — prefer live query, fall back to static
  const shipData = useMemo(() => [
    { label: 'Vessel', value: ship?.vesselName || 'MV Hondius' },
    { label: 'Operator', value: (ship as any)?.operator || 'Oceanwide Expeditions' },
    { label: 'Ship status', value: ship?.status || METRICS.shipStatus, color: '#38bdf8' },
    { label: 'People onboard', value: ship?.peopleOnboard != null ? `~${ship.peopleOnboard}` : `~${METRICS.peopleOnboard}` },
    { label: 'Symptomatic now', value: String(ship?.symptomatic ?? METRICS.symptomaticNow), color: '#34d399' },
    { label: 'PCR confirmed', value: String(METRICS.casesConfirmed), color: '#ff9f1c' },
    { label: 'Suspected', value: String(METRICS.casesSuspected) },
    { label: 'Evacuated', value: String(ship?.evacuated ?? METRICS.evacuated), color: '#38bdf8' },
    { label: 'In ICU', value: String(ship?.inIcu ?? METRICS.inIcu), color: '#e63946' },
    { label: 'Strain', value: METRICS.strain, color: '#ff9f1c' },
    { label: 'Nationalities', value: String(METRICS.nationalities) },
    { label: 'Incubation', value: '7-39 days' },
  ], [ship, METRICS]);

  // Merge news sources; dedupe by URL
  const articles = useMemo(() => {
    const newsArt = newsQuery.data?.articles ?? [];
    const gdeltArt = (gdeltQuery.data?.articles ?? []).map((a: any) => ({
      ...a, source: { name: a.source || 'GDELT' }, publishedAt: a.date, severity: 'medium',
    }));
    const all = newsArt.length || gdeltArt.length
      ? [...newsArt, ...gdeltArt]
      : FALLBACK_DATA.news;
    const seen = new Set<string>();
    return all.filter((a: any) => {
      const key = (a.url || a.link || a.title || '').trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 6);
  }, [newsQuery.data, gdeltQuery.data]);

  // WHO DON real alerts from getGlobal
  const whoAlerts = globalQuery.data?.whoAlerts ?? [];
  const whoAvailable = globalQuery.data?.whoAvailable ?? false;

  const runAI = async () => {
    setAiLoading(true);
    const result = await aiQuery.mutateAsync({
      disease: 'Andes orthohantavirus (ANDV)',
      location: 'MV Hondius Antarctic cruise ship',
      cases: METRICS.casesConfirmed,
      deaths: METRICS.deaths,
      symptoms: 'Fever, fatigue, muscle aches, respiratory symptoms',
    });
    setAiAnalysis(result.analysis);
    setAiLoading(false);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cards = section.querySelectorAll('.animate-card');
    gsap.fromTo(
      cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 85%' },
      }
    );
  }, []);

  return (
    <div ref={sectionRef} style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
      {/* Live data badge */}
      {isLiveData && (
        <div className="font-data animate-card" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: '0.5rem', color: '#34d399' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', animation: 'pulse 1.5s infinite' }} />
          LIVE — data extracted by Claude AI from WHO DON &amp; ProMED ·{' '}
          {liveCase?.updatedAt ? new Date(liveCase.updatedAt).toLocaleTimeString() : ''}
        </div>
      )}

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
        {[
          { label: 'CONFIRMED CASES', value: METRICS.casesTotal, sub: `${METRICS.casesConfirmed} confirmed · ${METRICS.casesSuspected} suspected`, color: '#ff9f1c' },
          { label: 'DEATHS', value: METRICS.deaths, sub: `Case fatality ${METRICS.cfrPct}%`, color: '#e63946' },
          { label: 'COUNTRIES EXPOSED', value: METRICS.nationalities, sub: 'nationalities on board', color: '#38bdf8' },
          { label: 'DAYS SINCE INDEX', value: DAY_COUNT, sub: `First symptom ${new Date(FALLBACK_DATA.indexDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, color: '#f5f5f0' },
        ].map((s, i) => (
          <LiquidGlass key={i} className="animate-card" style={{ padding: '20px 16px', textAlign: 'center', borderRadius: 10 }}>
            <div className="font-data" style={{ fontSize: '0.5rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: 8 }}>{s.label}</div>
            <StatCounter
              value={s.value}
              className="font-display"
              style={{ fontSize: '2.4rem', fontWeight: 500, lineHeight: 1, color: s.color, textShadow: `0 0 30px ${s.color}25` }}
            />
            <div className="font-data" style={{ fontSize: '0.55rem', color: 'var(--text-dim)', marginTop: 6, letterSpacing: '0.03em' }}>{s.sub}</div>
          </LiquidGlass>
        ))}
      </div>

      {/* Risk Banner */}
      <LiquidGlass className="animate-card" style={{ borderRadius: 10, padding: '10px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem' }}>&#x26A0;</span>
        <strong className="font-data" style={{ fontSize: '0.6rem', color: 'var(--accent-amber)', letterSpacing: '0.05em' }}>WHO Risk Assessment:</strong>
        <span className="font-data" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{FALLBACK_DATA.riskAssessment.level}</span>
        <span style={{ color: 'rgba(245,245,240,0.15)' }}>|</span>
        <span className="font-data" style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>{FALLBACK_DATA.riskAssessment.detail}</span>
        <span style={{ color: 'rgba(245,245,240,0.15)' }}>|</span>
        <span className="font-data" style={{ fontSize: '0.55rem', color: 'rgba(143,163,175,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {(newsQuery.isFetching || gdeltQuery.isFetching || globalQuery.isFetching) && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-amber)', animation: 'pulse 1.5s infinite' }} />
          )}
          {globalQuery.isFetching ? 'Syncing WHO...' : whoAvailable ? `WHO DON live · synced ${new Date(globalQuery.data?.lastUpdated ?? '').toLocaleTimeString()}` : 'Auto-syncs every 10 min'}
        </span>
      </LiquidGlass>

      {/* CURRENT SITUATION */}
      <LiquidGlass className="animate-card" style={{ padding: '24px 28px', marginBottom: 16, borderRadius: 12 }}>
        <div className="font-data" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--accent-amber)', textTransform: 'uppercase', marginBottom: 12 }}>CURRENT SITUATION</div>
        <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--text-dim)', maxWidth: 900 }}>
          {FALLBACK_DATA.situation.summary.split(/(\d+ cases?|\d+ PCR-confirmed|\d+ suspected|\d+ deaths?|Andes orthohantavirus \(ANDV\))/).map((part, i) => {
            if (/^\d+/.test(part) || part.includes('ANDV')) {
              return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part}</strong>;
            }
            return <span key={i}>{part}</span>;
          })}
        </p>
      </LiquidGlass>

      {/* Two column: Ship Data + Key Facts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* SHIP & CASE DATA */}
        <LiquidGlass className="animate-card" style={{ padding: 24, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div className="font-data" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--accent-amber)', textTransform: 'uppercase' }}>SHIP & CASE DATA</div>
            {shipQuery.isFetching && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-amber)', animation: 'pulse 1.5s infinite' }} />}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 16px' }}>
            {shipData.map((item, i) => (
              <div key={i}>
                <div className="font-data" style={{ fontSize: '0.5rem', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>{item.label}</div>
                <div className="font-data" style={{ fontSize: '0.9rem', color: item.color || 'var(--text-primary)', fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </LiquidGlass>

        {/* WHAT YOU NEED TO KNOW */}
        <LiquidGlass className="animate-card" style={{ padding: 24, borderRadius: 12 }}>
          <div className="font-data" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--accent-amber)', textTransform: 'uppercase', marginBottom: 14 }}>WHAT YOU NEED TO KNOW</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FALLBACK_DATA.keyFacts.map((fact, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: i === FALLBACK_DATA.keyFacts.length - 1 ? '#34d399' : 'var(--accent-amber)', marginTop: 6, flexShrink: 0, boxShadow: `0 0 6px ${i === FALLBACK_DATA.keyFacts.length - 1 ? '#34d39980' : 'rgba(255,159,28,0.5)'}` }} />
                <span style={{ fontSize: '0.76rem', lineHeight: 1.55, color: i === 0 || i === FALLBACK_DATA.keyFacts.length - 1 ? 'var(--text-primary)' : 'var(--text-dim)', fontWeight: i === 0 || i === FALLBACK_DATA.keyFacts.length - 1 ? 600 : 400 }}>{fact}</span>
              </div>
            ))}
          </div>
        </LiquidGlass>
      </div>

      {/* WHO DON LIVE ALERTS */}
      {whoAlerts.length > 0 && (
        <LiquidGlass className="animate-card" style={{ padding: '20px 24px', marginBottom: 16, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div className="font-data" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: '#e63946', textTransform: 'uppercase' }}>WHO DISEASE OUTBREAK NEWS</div>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e63946', animation: 'pulse 1.5s infinite' }} />
            <span className="font-data" style={{ fontSize: '0.5rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>LIVE · who.int/don</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {whoAlerts.slice(0, 5).map((alert: any, i: number) => (
              <a key={i} href={alert.link || '#'} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', flexDirection: 'column', gap: 3, textDecoration: 'none', paddingBottom: 10, borderBottom: i < Math.min(whoAlerts.length, 5) - 1 ? '1px solid rgba(245,245,240,0.04)' : 'none' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>{alert.title}</div>
                {alert.description && (
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>{alert.description.slice(0, 140)}{alert.description.length > 140 ? '…' : ''}</div>
                )}
                <div className="font-data" style={{ fontSize: '0.5rem', color: 'rgba(143,163,175,0.5)' }}>
                  {alert.pubDate ? new Date(alert.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </div>
              </a>
            ))}
          </div>
        </LiquidGlass>
      )}

      {/* AI Analysis + Alert Buttons */}
      <div className="animate-card" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={runAI} disabled={aiLoading}
          className="font-data"
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,159,28,0.3)', background: 'rgba(255,159,28,0.08)', color: 'var(--accent-amber)', fontSize: '0.6rem', cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase', opacity: aiLoading ? 0.6 : 1 }}>
          {aiLoading ? 'Analyzing...' : 'AI Risk Analysis'}
        </button>
      </div>
      {aiAnalysis && (
        <LiquidGlass className="animate-card" style={{ marginBottom: 16, padding: '14px 18px', borderRadius: 10 }}>
          <div className="font-data" style={{ fontSize: '0.5rem', color: 'var(--accent-amber)', marginBottom: 6, textTransform: 'uppercase' }}>AI Analysis ({aiAnalysis.riskLevel?.toUpperCase()})</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{aiAnalysis.generalPublic}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', marginTop: 6 }}>Score: {aiAnalysis.riskScore}/100</div>
        </LiquidGlass>
      )}

      {/* LATEST NEWS */}
      <LiquidGlass className="animate-card" style={{ padding: '24px 28px', marginBottom: 16, borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="font-data" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--accent-amber)', textTransform: 'uppercase' }}>LATEST NEWS</div>
          <span className="font-data" style={{ fontSize: '0.5rem', color: 'var(--text-dim)' }}>
            {(newsQuery.data as any)?.sources || (newsQuery.isFetching ? 'Fetching...' : 'NewsAPI + GDELT')}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {articles.map((article: any, i: number) => (
            <a key={i} href={article.url || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', gap: 4, textDecoration: 'none', paddingBottom: 12, borderBottom: i < articles.length - 1 ? '1px solid rgba(245,245,240,0.04)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-data" style={{ fontSize: '0.55rem', color: 'var(--accent-amber)', letterSpacing: '0.08em', fontWeight: 500 }}>{article.source?.name || article.source}</span>
                <span className="font-data" style={{ fontSize: '0.5rem', color: 'rgba(143,163,175,0.5)' }}>
                  {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>{article.title}</div>
            </a>
          ))}
        </div>
      </LiquidGlass>
    </div>
  );
}
