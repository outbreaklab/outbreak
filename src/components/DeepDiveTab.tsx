import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/providers/trpc';
import LiquidGlass from '@/components/LiquidGlass';
import SequentialBlurReveal from '@/components/SequentialBlurReveal';
import { FALLBACK_DATA } from '@/data/outbreakData';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function DeepDiveTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const aiAsk = trpc.ai.ask.useMutation();
  const sectionRef = useRef<HTMLDivElement>(null);

  const askAI = async () => {
    if (!question.trim()) return;
    setAiLoading(true);
    const result = await aiAsk.mutateAsync({ question });
    setAiAnswer(result.answer || 'No response');
    setAiLoading(false);
  };

  const maxVal = Math.max(...FALLBACK_DATA.epiCurve.map(d => d[1] + d[2])) || 1;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cards = section.querySelectorAll('.animate-card');
    gsap.fromTo(
      cards,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
        },
      }
    );
  }, []);

  return (
    <div ref={sectionRef} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="font-data" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--accent-amber)', textTransform: 'uppercase', marginBottom: 6 }}>Deep Analysis</div>
        <SequentialBlurReveal
          text="DEEP DIVE"
          as="h2"
          className="font-display"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.1 }}
          scrollTrigger={false}
          stagger={0.04}
        />
      </div>

      {/* Epi Curve + Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 16 }}>
        <LiquidGlass className="animate-card" style={{ padding: 24 }}>
          <div className="font-data" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 16 }}>EPIDEMIC CURVE</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 160, paddingBottom: 24, position: 'relative' }}>
            {FALLBACK_DATA.epiCurve.map((row, i) => {
              const [, cases, deaths] = row;
              const total = cases + deaths;
              const h = total ? Math.max(10, Math.round((total / maxVal) * 130)) : 4;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }} title={`${row[0]}: ${cases} case(s), ${deaths} death(s)`}>
                  {cases > 0 && <div style={{ width: '100%', height: Math.round((cases / total) * h) || 4, background: 'linear-gradient(to top, rgba(255,159,28,0.4), rgba(255,159,28,0.85))', borderRadius: '3px 3px 0 0', minWidth: 6 }} />}
                  {deaths > 0 && <div style={{ width: '100%', height: Math.round((deaths / total) * h) || 4, background: 'linear-gradient(to top, rgba(230,57,70,0.4), rgba(230,57,70,0.85))', borderRadius: '0 0 3px 3px', minWidth: 6 }} />}
                  {!cases && !deaths && <div style={{ width: '100%', height: 4, background: 'rgba(143,163,175,0.1)', borderRadius: 2, minWidth: 6 }} />}
                  <div className="font-data" style={{ fontSize: '0.4rem', color: 'var(--text-dim)', textAlign: 'center', position: 'absolute', bottom: 0, transform: `translateX(${(i - FALLBACK_DATA.epiCurve.length / 2) * 5}px)`, whiteSpace: 'nowrap', opacity: i % 2 === 0 ? 1 : 0.4 }}>{row[0]}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255,159,28,0.6)' }} /><span className="font-data" style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>Cases</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(230,57,70,0.6)' }} /><span className="font-data" style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>Deaths</span></div>
          </div>
        </LiquidGlass>

        <LiquidGlass className="animate-card" style={{ padding: 24 }}>
          <div className="font-data" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 16 }}>EVENT TIMELINE</div>
          {FALLBACK_DATA.timeline.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '8px 0', borderLeft: '2px solid rgba(255,159,28,0.2)', paddingLeft: 14, position: 'relative' }}>
              <span style={{ position: 'absolute', left: -4, top: 12, width: 6, height: 6, borderRadius: '50%', background: i === 0 || i === FALLBACK_DATA.timeline.length - 1 ? 'var(--accent-amber)' : 'rgba(143,163,175,0.4)', boxShadow: i === 0 || i === FALLBACK_DATA.timeline.length - 1 ? '0 0 8px rgba(255,159,28,0.4)' : 'none' }} />
              <span className="font-data" style={{ fontSize: '0.6rem', color: 'var(--accent-amber)', fontWeight: 500, flexShrink: 0, minWidth: 68 }}>{item.date}</span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{item.event}</span>
            </div>
          ))}
        </LiquidGlass>
      </div>

      {/* AI Ask */}
      <LiquidGlass className="animate-card" style={{ padding: 24, marginBottom: 16 }}>
        <div className="font-data" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--accent-amber)', textTransform: 'uppercase', marginBottom: 16 }}>ASK AI EPIDEMIOLOGIST</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askAI()}
            placeholder="Ask about symptoms, transmission, risk assessment..."
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(245,245,240,0.1)', background: 'rgba(6,15,21,0.5)', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none', fontFamily: 'Inter, sans-serif' }}
          />
          <button onClick={askAI} disabled={aiLoading}
            className="font-data"
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--accent-amber)', color: '#020a0e', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase', opacity: aiLoading ? 0.6 : 1 }}>
            {aiLoading ? 'Thinking...' : 'Ask'}
          </button>
        </div>
        {aiAnswer && (
          <div style={{ marginTop: 14, padding: '14px 18px', borderRadius: 10, background: 'rgba(6,15,21,0.5)', border: '1px solid rgba(245,245,240,0.08)' }}>
            <div className="font-data" style={{ fontSize: '0.5rem', color: 'var(--accent-amber)', marginBottom: 6, textTransform: 'uppercase' }}>AI Response</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiAnswer}</div>
          </div>
        )}
      </LiquidGlass>

      {/* Strains */}
      <LiquidGlass className="animate-card" style={{ padding: 24, marginBottom: 16 }}>
        <div className="font-data" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 16 }}>STRAIN DATABASE</div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
          {FALLBACK_DATA.strains.map((strain, i) => {
            const cfrNum = parseFloat(strain.cfr.replace(/[^0-9.]/g, ''));
            return (
              <div key={i} className="liquid-glass" style={{ borderRadius: 14, padding: 16, minWidth: 170, flex: '0 0 auto', cursor: 'default', transition: 'transform 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ height: 3, borderRadius: 2, background: strain.color, marginBottom: 12, boxShadow: `0 0 12px ${strain.color}40` }} />
                <div className="font-display" style={{ fontSize: '1.1rem', fontWeight: 500, color: strain.color, lineHeight: 1.1, marginBottom: 2 }}>{strain.name}</div>
                <div className="font-data" style={{ fontSize: '0.55rem', color: 'var(--text-dim)', marginBottom: 10 }}>({strain.abbr})</div>
                <div className="font-data" style={{ fontSize: '0.5rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 2 }}>Region</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-primary)', marginBottom: 8 }}>{strain.region}</div>
                <div className="font-data" style={{ fontSize: '0.5rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 2 }}>CFR</div>
                <div className="font-data" style={{ fontSize: '0.8rem', color: cfrNum >= 20 ? 'var(--alert-red)' : 'var(--text-primary)', fontWeight: 600 }}>{strain.cfr}</div>
                <div className="font-data" style={{ fontSize: '0.5rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginTop: 6, marginBottom: 2 }}>H-to-H</div>
                <div className="font-data" style={{ fontSize: '0.8rem', color: strain.h2h ? 'var(--alert-red)' : 'var(--text-dim)', fontWeight: 600 }}>{strain.h2h ? 'YES' : 'No'}</div>
              </div>
            );
          })}
        </div>
      </LiquidGlass>

      {/* FAQ */}
      <LiquidGlass className="animate-card" style={{ padding: 24, marginBottom: 16 }}>
        <div className="font-data" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 16 }}>FREQUENTLY ASKED QUESTIONS</div>
        {FALLBACK_DATA.faq.map((item, i) => (
          <div key={i} className="liquid-glass" style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, flex: 1 }}>{item.q}</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginLeft: 12, transition: 'transform 0.3s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
            </button>
            <div style={{ maxHeight: openFaq === i ? 300 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease, padding 0.4s ease', padding: openFaq === i ? '0 18px 14px' : '0 18px' }}>
              <p style={{ fontSize: '0.78rem', lineHeight: 1.7, color: 'var(--text-dim)' }}>{item.a}</p>
            </div>
          </div>
        ))}
      </LiquidGlass>
    </div>
  );
}
