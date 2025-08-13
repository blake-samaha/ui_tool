import React from 'react';
import { Link, Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProjectProvider, ProjectContext } from '../state/ProjectContext.js';
import { Tier00Page } from '../features/tier00/Tier00Page.js';
import { Tier01Page } from '../features/tier01/Tier01Page.js';
import { TierXXPage } from '../features/tierXX/TierXXPage.js';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { Home } from '../views/Home.js';
import { Quickstart } from '../views/Quickstart.js';
import { VantaBackground } from '../components/common/VantaBackground.js';
import { Templates } from '../views/Templates.js';
import { TemplateViewer } from '../views/TemplateViewer.js';

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

    // Keep file bridge root in sync globally when projectRoot changes
    React.useEffect(() => {
        if (!settings.projectRoot) return;
        const client = new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl });
        client.setRoot(settings.projectRoot).catch(() => {});
    }, [settings.projectRoot, settings.bridgeBaseUrl]);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        function handleClickOutside(ev: MouseEvent) {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(ev.target as Node)) setMenuOpen(false);
        }
        function handleEsc(ev: KeyboardEvent) {
            if (ev.key === 'Escape') setMenuOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const bridgeLabel = health === 'ok' ? 'Bridge: Connected' : health === 'error' ? 'Bridge: Error' : 'Bridge: …';

    return (
        <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center gap-3">
                <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900 hover:text-slate-700">
                    Cognite Docs-as-Code UI
                </Link>
                <nav className="flex gap-2 ml-2">
                    <Link
                        to="/templates"
                        className="rounded-md px-3 py-1.5 text-sm font-medium bg-white text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50"
                        aria-label="Open templates"
                    >
                        Templates
                    </Link>
                    <Link
                        to="/quickstart"
                        className="rounded-md px-3 py-1.5 text-sm font-medium bg-white text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50"
                        aria-label="Open quickstart"
                    >
                        Quickstart
                    </Link>
                    <a
                        href="https://docs.cognitedata.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md px-3 py-1.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                        aria-label="Open Official Cognite Documentation in a new tab"
                    >
                        Official Cognite Documentation
                    </a>
                </nav>
                <div className="relative ml-auto flex items-center gap-3">
                    {/* Bridge status chip */}
                    <span
                        className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs ring-1 ${
                            health === 'ok'
                                ? 'text-green-700 ring-green-200'
                                : health === 'error'
                                ? 'text-red-700 ring-red-200'
                                : 'text-slate-600 ring-slate-200'
                        }`}
                        title={settings.bridgeBaseUrl}
                        aria-live="polite"
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${
                                health === 'ok' ? 'bg-green-600' : health === 'error' ? 'bg-red-600' : 'bg-slate-400'
                            }`}
                        />
                        {bridgeLabel}
                    </span>

                    {/* Project root pill and dropdown */}
                    <div className="relative" ref={menuRef}>
                        <button
                            className={`max-w-xs truncate rounded-md px-3 py-1.5 text-sm ring-1 ${!settings.projectRoot ? 'bg-amber-50 ring-amber-200 text-amber-800' : 'ring-slate-300 hover:bg-slate-50'}`}
                            onClick={() => setMenuOpen((v) => !v)}
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            title={settings.projectRoot || 'No project selected — click to choose a repository'}
                        >
                            <span className="mr-2 align-middle" aria-hidden>
                                <svg viewBox="0 0 20 20" className="h-4 w-4 inline" fill="currentColor">
                                    <path d="M2.5 5a1.5 1.5 0 0 1 1.5-1.5h3l1.2 1.2c.28.28.66.3.8.3h6.5A1.5 1.5 0 0 1 17 6.5v7A2.5 2.5 0 0 1 14.5 16h-9A2.5 2.5 0 0 1 3 13.5V5Z" />
                                </svg>
                            </span>
                            {settings.projectRoot || 'No project selected'}
                            <span className="ml-2 opacity-70">▾</span>
                        </button>
                        {menuOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 mt-2 w-[28rem] max-w-[90vw] rounded-md bg-white p-1 shadow-lg ring-1 ring-slate-200"
                            >
                                <button
                                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-50"
                                    onClick={async () => {
                                        const client = new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl });
                                        const picked = await client.pickRoot();
                                        if (picked) setSettings({ ...settings, projectRoot: picked });
                                        setMenuOpen(false);
                                    }}
                                >
                                    Browse…
                                </button>
                                {recent.length > 0 && (
                                    <div className="my-1 border-t border-slate-200" />
                                )}
                                {recent.map((r) => (
                                    <button
                                        key={r}
                                        className="w-full truncate rounded px-3 py-2 text-left text-sm hover:bg-slate-50"
                                        onClick={() => {
                                            setSettings({ ...settings, projectRoot: r });
                                            setMenuOpen(false);
                                        }}
                                        title={r}
                                    >
                                        {r}
                                    </button>
                                ))}
                                {recent.length > 0 && (
                                    <button
                                        className="w-full rounded px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"
                                        onClick={() => {
                                            localStorage.removeItem('docs-as-code.recentRoots');
                                            setRecent([]);
                                            setMenuOpen(false);
                                        }}
                                    >
                                        Clear recent roots
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

function RootLayout() {
    return (
        <div className="relative min-h-screen">
            <VantaBackground className="fixed inset-0 -z-10" />
            <div className="fixed inset-0 -z-10 bg-white/70" />
            <Header />
            <div className="mx-auto max-w-7xl px-6 py-8">
                <Outlet />
            </div>
        </div>
    );
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            { index: true, element: <Home /> },
                { path: 'quickstart', element: <Quickstart /> },
            { path: 'templates', element: <Templates /> },
            { path: 'templates/:id', element: <TemplateViewer /> },
            { path: 'tier00', element: <Tier00Page /> },
            { path: 'tier01', element: <Tier01Page /> },
            { path: 'tierXX', element: <TierXXPage /> },
            { path: '*', element: <Home /> }
        ]
    }
]);

export default function App() {
    return (
        <ProjectProvider>
            <RouterProvider router={router} future={{ v7_startTransition: true }} />
        </ProjectProvider>
    );
}
