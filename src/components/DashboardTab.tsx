import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/providers/trpc';
import LiquidGlass from '@/components/LiquidGlass';
import StatCounter from '@/components/StatCounter';
import { FALLBACK_DATA, daysSince, getSeverityColor } from '@/data/outbreakData';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const METRICS = FALLBACK_DATA.metrics;
const DAY_COUNT = daysSince(FALLBACK_DATA.indexDate);

export default function DashboardTab() {
  const newsQuery = trpc.news.fetchLatest.useQuery();
  const gdeltQuery = trpc.gdelt.fetchOutbreaks.useQuery();
  const aiQuery = trpc.ai.analyze.useMutation();

  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const newsArt = newsQuery.data?.articles;
  const gdeltArt = gdeltQuery.data?.articles;
  const articles = (newsArt?.length ? newsArt : gdeltArt?.length ? gdeltArt : FALLBACK_DATA.news).slice(0, 6);

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
          {(newsQuery.isFetching || gdeltQuery.isFetching) && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-amber)', animation: 'pulse 1.5s infinite' }} />}
          {newsQuery.isFetching ? 'Syncing...' : FALLBACK_DATA.riskAssessment.syncNote}
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
          <div className="font-data" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--accent-amber)', textTransform: 'uppercase', marginBottom: 18 }}>SHIP & CASE DATA</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 16px' }}>
            {FALLBACK_DATA.shipData.map((item, i) => (
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
        <div className="font-data" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--accent-amber)', textTransform: 'uppercase', marginBottom: 16 }}>LATEST NEWS</div>
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
