import { trpc } from '@/providers/trpc';
import SequentialBlurReveal from '@/components/SequentialBlurReveal';
import { FALLBACK_DATA, getSeverityColor, timeAgo } from '@/data/outbreakData';
import { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function NewsTab() {
  const newsQuery = trpc.news.fetchLatest.useQuery();
  const gdeltQuery = trpc.gdelt.fetchOutbreaks.useQuery();
  const sectionRef = useRef<HTMLDivElement>(null);

  const articles = useMemo(() => {
    const newsArticles = (newsQuery.data?.articles?.length ? newsQuery.data.articles : FALLBACK_DATA.news).map((a: any) => ({ ...a, _source: 'newsapi' as const }));
    const gdeltArticles = (gdeltQuery.data?.articles?.length ? gdeltQuery.data.articles : []).map((a: any) => ({
      ...a,
      _source: 'gdelt' as const,
      source: a.source || 'GDELT',
      publishedAt: a.date,
      severity: 'medium',
    }));
    // Merge & dedupe by URL
    const seen = new Set<string>();
    const merged = [...newsArticles, ...gdeltArticles].filter((a: any) => {
      const url = a.url || a.link || '';
      if (!url || seen.has(url)) return false;
      seen.add(url);
      return true;
    });
    return merged.slice(0, 24);
  }, [newsQuery.data, gdeltQuery.data]);

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
        stagger: 0.08,
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
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="font-data" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--accent-amber)', textTransform: 'uppercase', marginBottom: 6 }}>Intelligence Feed</div>
          <SequentialBlurReveal
            text="LIVE NEWS"
            as="h2"
            className="font-display"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.1 }}
            scrollTrigger={false}
            stagger={0.04}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {(newsQuery.isFetching || gdeltQuery.isFetching) && (
            <span className="font-data" style={{ fontSize: '0.55rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-amber)', animation: 'pulse 1.5s infinite' }} />
              Updating...
            </span>
          )}
          <span className="font-data" style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>
            {gdeltQuery.data?.articles?.length ? `GDELT + NewsAPI` : newsQuery.data?.source === 'fallback' ? 'Fallback Data' : 'NewsAPI'}
          </span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {articles.map((article: any, i: number) => (
          <a key={i} href={article.url || '#'} target="_blank" rel="noopener noreferrer" className="liquid-glass animate-card" style={{ borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, textDecoration: 'none', cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = ''; }}>
            {(article.image || article.socialimage) && (
              <div style={{ width: '100%', height: 120, borderRadius: 10, overflow: 'hidden', marginBottom: 4 }}>
                <img src={article.image || article.socialimage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-data" style={{ fontSize: '0.55rem', color: 'var(--text-dim)', letterSpacing: '0.08em', fontWeight: 500 }}>
                {article.source?.name || article.source}
                {article._source === 'gdelt' && <span style={{ marginLeft: 6, fontSize: '0.5rem', color: 'var(--accent-amber)' }}>● LIVE</span>}
              </span>
              <span className="font-data" style={{ fontSize: '0.5rem', color: 'rgba(143,163,175,0.5)' }}>{timeAgo(article.publishedAt || article.date)}</span>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>{article.title}</div>
            {article.description && <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.45 }}>{article.description}</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: getSeverityColor(article.severity || 'medium'), boxShadow: `0 0 8px ${getSeverityColor(article.severity || 'medium')}60` }} />
              <span className="font-data" style={{ fontSize: '0.55rem', color: getSeverityColor(article.severity || 'medium'), letterSpacing: '0.05em', textTransform: 'uppercase' }}>{article.severity || 'medium'}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
