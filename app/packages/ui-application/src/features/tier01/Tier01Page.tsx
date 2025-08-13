import React from 'react';
import { emitYaml, parseYaml } from '@docs-as-code/yaml-emitter';
import { WizardShell } from '../../components/wizard/WizardShell.js';
import { Tier01ConceptualModelZ } from '@docs-as-code/shared-types';
import { tier01Steps } from './steps.js';
import { ProjectContext } from '../../state/ProjectContext.js';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { tier01Paths } from '../../utils/paths.js';
import { ModulePicker, type ModuleRef } from '../../components/common/ModulePicker.js';
import { ProjectPicker } from '../../components/common/ProjectPicker.js';
import { JsonExplorer } from '../../components/common/JsonExplorer.js';

type Tier01 = typeof Tier01ConceptualModelZ extends infer T ? T : never;

export function Tier01Page() {
    const ctx = React.useContext(ProjectContext);
    if (!ctx) return null;
    const { settings } = ctx;
    const client = React.useMemo(() => new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl }), [settings.bridgeBaseUrl]);
    const [defaults, setDefaults] = React.useState<any>({ schemaVersion: 1, moduleId: '', objects: [{ name: '', objectId: '', space: '' }], relationships: [], dataModel: { externalId: '', version: '', groupedViews: [] } });
    const [formKey, setFormKey] = React.useState(0);
    const [yaml, setYaml] = React.useState('');
    const [picked, setPicked] = React.useState<ModuleRef | null | undefined>(undefined);
    const [projectId, setProjectId] = React.useState<string | null>(null);
    const [working, setWorking] = React.useState<any>(defaults);

    React.useEffect(() => {
        (async () => {
            const moduleId = picked?.moduleId || defaults.moduleId;
            const proj = picked?.projectId || projectId || '';
            if (!settings.projectRoot || !moduleId || !proj) return;
            const { yaml: yamlPath, uiState } = tier01Paths(settings.projectRoot, proj, moduleId);
            try {
                const raw = await client.read(uiState);
                if (raw && raw.trim().length > 0) {
                    const parsed = JSON.parse(raw);
                    setDefaults(parsed);
                    setWorking(parsed);
                    setFormKey((k) => k + 1);
                    return;
                }
            } catch {}
            try {
                const text = await client.read(yamlPath);
                if (text && text.trim().length > 0) {
                    const parsed = parseYaml<any>(text);
                    setDefaults(parsed);
                    setWorking(parsed);
                    setFormKey((k) => k + 1);
                }
            } catch {}
        })();
    }, [settings.projectRoot, client, picked, projectId]);

    React.useEffect(() => {
        setWorking(defaults);
    }, [defaults]);

    async function handleSaveStep(data: any) {
        if (!settings.projectRoot) return;
        const proj = projectId || picked?.projectId;
        const moduleId = data.moduleId || picked?.moduleId;
        if (!proj || !moduleId) return;
        const { uiState, yaml } = tier01Paths(settings.projectRoot, proj, moduleId);
        await client.mkdirp(uiState.slice(0, uiState.lastIndexOf('/')));
        await client.mkdirp(yaml.slice(0, yaml.lastIndexOf('/')));
        // Write a stub YAML if not present to surface draft file location early
        try { await client.read(yaml); } catch { await client.write(yaml, emitYaml({ schemaVersion: data.schemaVersion ?? 1, moduleId, objects: data.objects ?? [] }, { indent: 2 })); }
        await client.write(uiState, JSON.stringify(data, null, 2) + '\n');
    }

    async function handleFinish(data: any) {
        if (!settings.projectRoot) return alert('Select a project root in settings');
        if (!data.moduleId || !projectId) return alert('Select a project and enter a moduleId');
        const { yaml: yamlPath, uiState } = tier01Paths(settings.projectRoot, projectId, data.moduleId);
        const yamlText = emitYaml(data, { indent: 2 });
        await client.mkdirp(uiState.slice(0, uiState.lastIndexOf('/')));
        await client.mkdirp(yamlPath.slice(0, yamlPath.lastIndexOf('/')));
        await client.write(uiState, JSON.stringify(data, null, 2) + '\n');
        await client.write(yamlPath, yamlText);
        setYaml(yamlText);
        try { await navigator.clipboard.writeText(yamlText); } catch {}
    }

    // Require project selection, then module selection
    if (!projectId) {
        return <ProjectPicker onPick={(p) => setProjectId(p || null)} />;
    }
    if (picked === undefined || (!defaults.moduleId && !picked)) {
        return (
            <div className="space-y-4">
                <ModulePicker projectId={projectId} onPick={(m) => {
                    setPicked(m);
                    if (m) setDefaults((d: any) => ({ ...d, moduleId: m.moduleId }));
                }} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                        <WizardShell
                        key={formKey}
                        steps={tier01Steps}
                        initialData={defaults}
                        onChange={(d: any) => setWorking(d)}
                        onSaveStep={handleSaveStep}
                        onFinish={handleFinish}
                    />
                </div>
                <aside className="space-y-4">
                    <JsonExplorer title="Current 01 (working data)" data={working} defaultOpenDepth={1} />
                </aside>
            </div>
            {yaml && <pre className="border rounded p-3 whitespace-pre-wrap leading-5 text-sm mt-3">{yaml}</pre>}
        </div>
    );
}

