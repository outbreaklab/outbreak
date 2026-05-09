import { useEffect, useRef, useState } from 'react';

interface StatCounterProps {
  value: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function StatCounter({ value, duration = 1500, className = '', style }: StatCounterProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const prevValueRef = useRef<number>(value);

  useEffect(() => {
    // Restart animation when value changes meaningfully
    if (value === prevValueRef.current && display === value) return;
    prevValueRef.current = value;
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span className={`font-display ${className}`} style={style}>
      {String(display).padStart(3, '0')}
    </span>
  );
}
