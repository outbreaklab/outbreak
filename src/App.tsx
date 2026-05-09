import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AmberVeilMatrix from '@/components/AmberVeilMatrix';
import Header from '@/components/Header';
import DashboardTab from '@/components/DashboardTab';
import NewsTab from '@/components/NewsTab';
import GlobeTab from '@/components/GlobeTab';
import DeepDiveTab from '@/components/DeepDiveTab';


gsap.registerPlugin(ScrollTrigger);

type Tab = 'dashboard' | 'news' | 'globe' | 'deepdive';

const TABS: { key: Tab; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'news', label: 'News Feed' },
  { key: 'globe', label: 'Live Globe' },
  { key: 'deepdive', label: 'Deep Dive' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const tabContentRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  /* Fade in tab content on switch */
  useEffect(() => {
    const el = tabContentRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
  }, [activeTab]);

  /* Fade in cards on first load */
  useEffect(() => {
    const section = contentRef.current;
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
        delay: 0.2,
      }
    );
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--base-deep)', position: 'relative' }}>
      {/* Background layers */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage: 'url(/bio-texture.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.12,
          mixBlendMode: 'luminosity',
        }}
      />
      <AmberVeilMatrix />

      <Header />

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 56 }}>
        {/* Tab navigation */}
        <div
          style={{
            position: 'sticky',
            top: 56,
            zIndex: 50,
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            padding: '10px 0',
            background: 'rgba(2,10,14,0.75)',
            backdropFilter: 'blur(16px) saturate(140%)',
            WebkitBackdropFilter: 'blur(16px) saturate(140%)',
            borderBottom: '1px solid rgba(245,245,240,0.06)',
            borderTop: '1px solid rgba(245,245,240,0.04)',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 22px',
                borderRadius: 6,
                background: activeTab === tab.key ? 'rgba(255,159,28,0.08)' : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div ref={contentRef} style={{ paddingTop: 24, paddingBottom: 32, minHeight: '50vh' }}>
          <div ref={tabContentRef}>
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'news' && <NewsTab />}
            {activeTab === 'globe' && <GlobeTab />}
            {activeTab === 'deepdive' && <DeepDiveTab />}
          </div>
        </div>

        {/* Footer */}
        <footer
          style={{
            position: 'relative',
            zIndex: 1,
            borderTop: '1px solid rgba(245,245,240,0.06)',
            padding: '36px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div
              className="font-display"
              style={{
                fontSize: '1.1rem',
                fontWeight: 500,
                letterSpacing: '0.1em',
                color: 'var(--text-primary)',
                marginBottom: 6,
              }}
            >
              OUTBREAK
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 6 }}>
              Real-time epidemic intelligence powered by AI
            </div>
            <div className="font-data" style={{ fontSize: '0.55rem', color: 'var(--accent-amber)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', marginBottom: 16 }}>
              CA: 0x000000000
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
              {['X @outbreak_AI', 'GitHub', 'WHO DON'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="hover-underline"
                  style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textDecoration: 'none' }}
                >
                  {link}
                </a>
              ))}
            </div>
            <div
              className="font-data"
              style={{ fontSize: '0.5rem', color: 'rgba(143,163,175,0.35)', lineHeight: 1.8 }}
            >
              Data: WHO Disease Outbreak News \u00b7 GDELT \u00b7 NewsAPI \u00b7 ECDC \u00b7 Africa CDC \u00b7
              Anthropic AI
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
