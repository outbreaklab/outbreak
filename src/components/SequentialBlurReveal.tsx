import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SequentialBlurRevealProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  className?: string;
  style?: React.CSSProperties;
  scrollTrigger?: boolean;
  stagger?: number;
}

export default function SequentialBlurReveal({
  text,
  as: Tag = 'div',
  className = '',
  style,
  scrollTrigger = true,
  stagger = 0.03,
}: SequentialBlurRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chars = el.querySelectorAll('.sbr-char');
    if (!chars.length) return;

    gsap.set(chars, { opacity: 0, filter: 'blur(12px)', scale: 1.2 });

    const tl = gsap.to(chars, {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      duration: 0.6,
      stagger,
      ease: 'power2.out',
      scrollTrigger: scrollTrigger
        ? {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        : undefined,
    });

    return () => {
      tl.kill();
    };
  }, [text, stagger, scrollTrigger]);

  const words = text.split(' ');

  return (
    <Tag
      ref={containerRef as any}
      className={className}
      style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.3em', ...style }}
    >
      {words.map((word, wi) => (
        <span key={wi} style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}>
          {word.split('').map((char, ci) => (
            <span
              key={ci}
              className="sbr-char"
              style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
