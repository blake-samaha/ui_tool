import React from 'react';

type BirdsOptions = {
  el: HTMLElement;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  scale?: number;
  scaleMobile?: number;
  backgroundColor?: number;
  backgroundAlpha?: number;
  color1?: number;
  color2?: number;
  colorMode?: 'lerp' | 'variance' | 'lerpGradient';
  quantity?: number;
  cohesion?: number;
  separation?: number;
  birdSize?: number;
  wingSpan?: number;
  speedLimit?: number;
};

export function VantaBackground({
  className = '',
}: {
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const effectRef = React.useRef<any | null>(null);
  const [reduced, setReduced] = React.useState(false);

  function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
      if (existing) {
        if (existing.getAttribute('data-loaded') === 'true') return resolve();
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => { s.setAttribute('data-loaded', 'true'); resolve(); };
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  }

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  React.useEffect(() => {
    if (!ref.current || effectRef.current) return;
    if (reduced) return; // respect reduced motion
    (async () => {
      try {
        const w = window as any;
        // Load scripts from CDN as recommended by Vanta docs
        if (!w.THREE) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
        }
        if (!w.VANTA) {
          await loadScript('https://cdn.jsdelivr.net/npm/vanta/dist/vanta.birds.min.js');
        }
        if (!w.VANTA?.BIRDS) throw new Error('VANTA.BIRDS not available');
        effectRef.current = w.VANTA.BIRDS({
          el: ref.current as HTMLElement,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 1,
          backgroundColor: 0xbbbbbb,
          backgroundAlpha: 0.394,
          quantity: 3,
          birdSize: 1,
          wingSpan: 30,
          cohesion: 20,
          separation: 20,
          speedLimit: 5,
          colorMode: 'lerp',
          color1: 0x6e6e6e,
          color2: 0x394f29,
        } as BirdsOptions);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[vanta.js] birds init error: ', e);
      }
    })();
    return () => {
      try { effectRef.current?.destroy?.(); } catch {}
      effectRef.current = null;
    };
  }, [reduced]);

  return <div ref={ref} className={className} aria-hidden />;
}


