import React from 'react';

export type ProjectSettings = {
    projectRoot: string;
    bridgeBaseUrl: string;
};

const defaultSettings: ProjectSettings = {
    projectRoot: '',
    bridgeBaseUrl: 'http://127.0.0.1:45678'
};

export const ProjectContext = React.createContext<{ settings: ProjectSettings; setSettings: (s: ProjectSettings) => void } | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettingsState] = React.useState<ProjectSettings>(() => {
        const raw = localStorage.getItem('docs-as-code.projectSettings');
        if (raw) {
            try { return JSON.parse(raw) as ProjectSettings; } catch {}
        }
        return defaultSettings;
    });

    const setSettings = React.useCallback((s: ProjectSettings) => {
        setSettingsState(s);
        localStorage.setItem('docs-as-code.projectSettings', JSON.stringify(s));
    }, []);

    return <ProjectContext.Provider value={{ settings, setSettings }}>{children}</ProjectContext.Provider>;
}

