import React from 'react';

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: unknown }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }
  override componentDidCatch(error: unknown, info: unknown) {
    try { console.error('Wizard error boundary caught:', error, info); } catch {}
  }
  override render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl bg-red-50 p-4 ring-1 ring-red-200">
          <div className="text-red-800 font-medium mb-2">Something went wrong rendering this step.</div>
          <div className="text-sm text-red-700 mb-3">Try reloading the page. If it keeps happening, please check the console for details.</div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-md ring-1 ring-slate-300 bg-white hover:bg-slate-50" onClick={() => this.setState({ hasError: false, error: undefined })}>Try again</button>
            <button className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}


