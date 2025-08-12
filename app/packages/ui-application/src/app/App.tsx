import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { ProjectProvider, ProjectContext } from '../state/ProjectContext.js';
import { Tier00Page } from '../features/tier00/Tier00Page.js';
import { Tier01Page } from '../features/tier01/Tier01Page.js';
import { TierXXPage } from '../features/tierXX/TierXXPage.js';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { Home } from '../views/Home.js';

function Header() {
    const ctx = React.useContext(ProjectContext);
    if (!ctx) return null;
    const { settings, setSettings } = ctx;
    const [recent, setRecent] = React.useState<string[]>(() => {
        try { return JSON.parse(localStorage.getItem('docs-as-code.recentRoots') || '[]'); } catch { return []; }
    });
    const addRecent = React.useCallback((root: string) => {
        const next = [root, ...recent.filter((r) => r !== root)].slice(0, 5);
        setRecent(next);
        localStorage.setItem('docs-as-code.recentRoots', JSON.stringify(next));
    }, [recent]);
    React.useEffect(() => { if (settings.projectRoot) addRecent(settings.projectRoot); }, [settings.projectRoot]);
    const [health, setHealth] = React.useState<'unknown' | 'ok' | 'error'>('unknown');
    React.useEffect(() => {
        const client = new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl });
        let mounted = true;
        client
            .health()
            .then((ok) => mounted && setHealth(ok ? 'ok' : 'error'))
            .catch(() => mounted && setHealth('error'));
        return () => {
            mounted = false;
        };
    }, [settings.bridgeBaseUrl]);
    return (
        <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center gap-3">
                <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900 hover:text-slate-700">
                    Cognite Docs-as-Code UI
                </Link>
                <nav className="flex gap-1 ml-2">
                    <Link to="/" className="rounded-md px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100">Home</Link>
                    <Link to="/tier00" className="rounded-md px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100">Tier 00</Link>
                    <Link to="/tier01" className="rounded-md px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100">Tier 01</Link>
                    <Link to="/tierXX" className="rounded-md px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100">Tier XX</Link>
                    <a href="https://docs.cognitedata.com/" target="_blank" rel="noreferrer" className="rounded-md px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100">Docs</a>
                </nav>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                    <input
                        placeholder="Project root (repo)"
                        className="rounded-md px-2 py-1 min-w-[18rem] ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none bg-white"
                        value={settings.projectRoot}
                        onChange={(e) => setSettings({ ...settings, projectRoot: e.target.value })}
                    />
                    <input
                        placeholder="File-bridge URL"
                        className="rounded-md px-2 py-1 min-w-[14rem] ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 outline-none bg-white"
                        value={settings.bridgeBaseUrl}
                        onChange={(e) => setSettings({ ...settings, bridgeBaseUrl: e.target.value })}
                    />
                    <span
                        className={
                            health === 'ok'
                                ? 'text-green-700 text-sm'
                                : health === 'error'
                                ? 'text-red-700 text-sm'
                                : 'text-gray-500 text-sm'
                        }
                    >
                        {health === 'ok' ? 'bridge: ok' : health === 'error' ? 'bridge: error' : 'bridge: ...'}
                    </span>
                    {recent.length > 0 && (
                        <select
                            className="rounded-md px-2 py-1 ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500/40 bg-white"
                            onChange={(e) => setSettings({ ...settings, projectRoot: e.target.value })}
                            value=""
                        >
                            <option value="" disabled>
                                Recent
                            </option>
                            {recent.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>
        </header>
    );
}

export default function App() {
    return (
        <ProjectProvider>
            <BrowserRouter>
                <Header />
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/tier00" element={<Tier00Page />} />
                        <Route path="/tier01" element={<Tier01Page />} />
                        <Route path="/tierXX" element={<TierXXPage />} />
                        <Route path="*" element={<Home />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </ProjectProvider>
    );
}
