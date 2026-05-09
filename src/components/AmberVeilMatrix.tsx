import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number; prevX: number; prevY: number;
  vx: number; vy: number; speedScale: number; brightness: number;
}

const BASE_SPEED = 0.4;
const MOUSE_SPEED = 0.8;
const LINE_DENSITY = 2.5;
const MOUSE_RADIUS = 150;
const MOUSE_THRESHOLD = 0.3;
const COLORS = ['#ff9f1c', '#e63946', '#f5f5f0'];

export default function AmberVeilMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const PARTICLE_COUNT = window.innerWidth < 768 ? 30 : 80;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticle(): Particle {
      const speedScale = 0.8 + Math.random() * 0.7;
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      return {
        x, y, prevX: x, prevY: y,
        vx: (BASE_SPEED + Math.random() * 0.6) * speedScale,
        vy: ((Math.random() - 0.5) * 0.3) * speedScale,
        speedScale,
        brightness: 0.3 + Math.random() * 0.7,
      };
    }

    function initParticles() {
      particlesRef.current = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) particlesRef.current.push(createParticle());
    }

    function updateParticles() {
      const mouse = mouseRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (const p of particlesRef.current) {
        p.prevX = p.x; p.prevY = p.y;
        p.x += p.vx; p.y += p.vy;
        p.y = (p.y + h) % h;
        if (p.x > w) {
          p.x = 0; p.prevX = 0;
          p.vy = ((Math.random() - 0.5) * 0.3) * p.speedScale;
          p.speedScale = 0.8 + Math.random() * 0.7;
        }
        const dx = mouse.x - p.prevX;
        const dy = mouse.y - p.prevY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          if (force > MOUSE_THRESHOLD) {
            const angle = Math.atan2(dy, dx);
            p.prevX -= Math.cos(angle) * MOUSE_SPEED * force;
            p.prevY -= Math.sin(angle) * MOUSE_SPEED * force;
          }
        }
      }
    }

    function drawLines() {
      const particles = particlesRef.current;
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);
      // Pass 1: trails
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx!.strokeStyle = COLORS[i % COLORS.length];
        ctx!.globalAlpha = p.brightness * 0.5;
        ctx!.lineWidth = p.speedScale > 1.2 ? 1.5 : 0.8;
        ctx!.beginPath();
        ctx!.moveTo(p.prevX, p.prevY);
        ctx!.lineTo(p.x, p.y);
        ctx!.stroke();
      }
      // Pass 2: proximity connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100 * LINE_DENSITY) {
            const alpha = (1 - dist / (100 * LINE_DENSITY)) * 0.4;
            if (alpha > 0) {
              ctx!.strokeStyle = `rgba(255, 159, 28, ${alpha})`;
              ctx!.lineWidth = 0.5;
              ctx!.globalAlpha = 1.0;
              ctx!.beginPath();
              ctx!.moveTo(particles[i].x, particles[i].y);
              ctx!.lineTo(particles[j].x, particles[j].y);
              ctx!.stroke();
            }
          }
        }
      }
    }

    function animate() {
      updateParticles();
      drawLines();
      rafRef.current = requestAnimationFrame(animate);
    }

    resize(); initParticles(); animate();

    const onResize = () => { resize(); };
    const onMouseMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onVisChange = () => { document.hidden ? cancelAnimationFrame(rafRef.current) : (rafRef.current = requestAnimationFrame(animate)); };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', mixBlendMode: 'screen' }}
    />
  );
}
