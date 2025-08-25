import React from 'react';
export function Mermaid({ chart, className = '' }: { chart: string; className?: string }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const mermaidRef = React.useRef<any | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        if (!mermaidRef.current) {
          const mod = await import('mermaid');
          const mermaid = (mod as any).default || mod;
          mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'default' });
          mermaidRef.current = mermaid;
        }
        if (!ref.current) return;
        const { svg } = await mermaidRef.current.render(
          `mmd-${Math.random().toString(36).slice(2)}`,
          chart
        );
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message ?? e));
      }
    })();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return <pre className="text-xs text-red-700 whitespace-pre-wrap">{error}</pre>;
  }
  return <div ref={ref} className={className} />;
}


