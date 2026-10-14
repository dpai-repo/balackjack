import React, { useRef, useEffect } from 'react';

export interface ParticleEvent {
  type: 'spark' | 'shard' | 'dust' | 'bust';
  x: number;
  y: number;
  color?: string;
  count?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  shape: 'square' | 'spark' | 'ring';
  gravity: number;
}

interface ParticleCanvasProps {
  events?: ParticleEvent[];
  className?: string;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ events = [], className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const processedEventsCountRef = useRef<number>(0);

  // Spawn new particles from incoming event queue
  useEffect(() => {
    if (events.length > processedEventsCountRef.current) {
      const newEvents = events.slice(processedEventsCountRef.current);
      processedEventsCountRef.current = events.length;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      newEvents.forEach(evt => {
        const count = evt.count || 12;
        const targetX = (evt.x / 100) * rect.width;
        const targetY = (evt.y / 100) * rect.height;

        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 3 + 1.5;

          if (evt.type === 'bust') {
            particlesRef.current.push({
              x: targetX,
              y: targetY,
              vx: Math.cos(angle) * (speed * 1.8),
              vy: Math.sin(angle) * (speed * 1.8) - 1.5,
              size: Math.random() * 3.5 + 2,
              life: 0,
              maxLife: Math.random() * 25 + 25,
              color: Math.random() > 0.4 ? '#ef4444' : '#f97316',
              shape: 'square',
              gravity: 0.18,
            });
          } else if (evt.type === 'shard') {
            particlesRef.current.push({
              x: targetX,
              y: targetY,
              vx: (Math.random() - 0.5) * 4,
              vy: -Math.random() * 3 - 1,
              size: Math.random() * 2.5 + 1.5,
              life: 0,
              maxLife: Math.random() * 20 + 20,
              color: evt.color || '#38bdf8',
              shape: 'spark',
              gravity: 0.12,
            });
          } else {
            // Spark
            particlesRef.current.push({
              x: targetX,
              y: targetY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: Math.random() * 2.5 + 1,
              life: 0,
              maxLife: Math.random() * 18 + 14,
              color: evt.color || '#ffd700',
              shape: Math.random() > 0.5 ? 'spark' : 'square',
              gravity: 0.04,
            });
          }
        }
      });
    }
  }, [events]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;

        const progress = p.life / p.maxLife;
        const alpha = Math.max(0, 1 - progress);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        if (p.shape === 'spark') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'square') {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }

        ctx.restore();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-30 ${className}`}
    />
  );
};
