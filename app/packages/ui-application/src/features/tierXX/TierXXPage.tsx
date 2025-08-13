import React from 'react';
import { emitYaml, parseYaml } from '@docs-as-code/yaml-emitter';
import { WizardShell } from '../../components/wizard/WizardShell.js';
import { TierXXObjectSpecificationZ } from '@docs-as-code/shared-types';
import { tierXXSteps } from './steps.js';
import { ProjectContext } from '../../state/ProjectContext.js';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { tierXXPaths, tier01Paths, tier00Paths } from '../../utils/paths.js';
import { ModulePicker, type ModuleRef } from '../../components/common/ModulePicker.js';
import { ObjectPicker, type ObjectRef } from '../../components/common/ObjectPicker.js';
import { ProjectPicker } from '../../components/common/ProjectPicker.js';
import { useSearchParams } from 'react-router-dom';
import { JsonExplorer } from '../../components/common/JsonExplorer.js';
 

export function TierXXPage() {
    const ctx = React.useContext(ProjectContext);
    if (!ctx) return null;
    const { settings } = ctx;
    const client = React.useMemo(() => new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl }), [settings.bridgeBaseUrl]);
    const [defaults, setDefaults] = React.useState<any>({ schemaVersion: 1, moduleId: '', objectId: '', description: { summary: '', externalId: '' }, identifiers: { viewExternalId: '', containerExternalId: '' }, dataSource: { sourceSystem: '', space: '', primaryRawTable: '' }, properties: [], relationships: [], containerSpecification: {} });
    const [formKey, setFormKey] = React.useState(0);
    const [yaml, setYaml] = React.useState('');
    const [pickedModule, setPickedModule] = React.useState<ModuleRef | null | undefined>(undefined);
    const [pickedObject, setPickedObject] = React.useState<ObjectRef | null | undefined>(undefined);
    const [projectId, setProjectId] = React.useState<string | null>(null);
    const [params] = useSearchParams();
    const [inherited, setInherited] = React.useState<{ tier00?: any; tier01?: any }>({});

    // Optional init from URL
    React.useEffect(() => {
        const p = params.get('projectId');
        const m = params.get('moduleId');
        const o = params.get('objectId');
        if (p) setProjectId(p);
        if (p && m) {
            setPickedModule({ projectId: p, moduleId: m, path: `project_templates/projects/${p}/modules/${m}` });
            setDefaults((d: any) => ({ ...d, moduleId: m }));
        }
        if (p && m && o) {
            setPickedObject({ projectId: p, moduleId: m, objectId: o, yamlPath: `project_templates/projects/${p}/modules/${m}/XX_Object_Specs/${o}.yaml`, uiStatePath: `project_templates/projects/${p}/modules/${m}/ui-state/xx/${o}.json` });
            setDefaults((d: any) => ({ ...d, objectId: o }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        (async () => {
            const moduleId = pickedModule?.moduleId || defaults.moduleId;
            const objectId = pickedObject?.objectId || defaults.objectId;
            const proj = pickedModule?.projectId || projectId || '';
            if (!settings.projectRoot || !moduleId || !objectId || !proj) return;
            const { yaml: yamlPath, uiState } = tierXXPaths(settings.projectRoot, proj, moduleId, objectId);
            try {
                const raw = await client.read(uiState);
                if (raw && raw.trim().length > 0) {
                    setDefaults(JSON.parse(raw));
                    setFormKey((k) => k + 1);
                    return;
                }
            } catch {}
            try {
                const text = await client.read(yamlPath);
                if (text && text.trim().length > 0) {
                    setDefaults(parseYaml<any>(text));
                    setFormKey((k) => k + 1);
                }
            } catch {}
        })();
    }, [settings.projectRoot, client, pickedModule, pickedObject, projectId]);

    // load inherited context once module is known
    React.useEffect(() => {
        (async () => {
            const moduleId = pickedModule?.moduleId || defaults.moduleId;
            const proj = pickedModule?.projectId || projectId || '';
            if (!settings.projectRoot || !moduleId || !proj) return;
            try {
                const t00 = tier00Paths(settings.projectRoot);
                const t01 = tier01Paths(settings.projectRoot, proj, moduleId);
                const [t00json, t01json] = await Promise.all([
                    client.read(t00.uiState).catch(() => ''),
                    client.read(t01.uiState).catch(() => '')
                ]);
                setInherited({
                    tier00: t00json ? JSON.parse(t00json) : undefined,
                    tier01: t01json ? JSON.parse(t01json) : undefined
                });
            } catch {}
        })();
    }, [client, defaults.moduleId, pickedModule, projectId, settings.projectRoot]);

    async function handleSaveStep(data: any) {
        if (!settings.projectRoot) return;
        const proj = projectId || pickedModule?.projectId;
        const moduleId = data.moduleId || pickedModule?.moduleId;
        const objectId = data.objectId || pickedObject?.objectId;
        if (!proj || !moduleId || !objectId) return;
        const { uiState, yaml } = tierXXPaths(settings.projectRoot, proj, moduleId, objectId);
        await client.mkdirp(uiState.slice(0, uiState.lastIndexOf('/')));
        await client.mkdirp(yaml.slice(0, yaml.lastIndexOf('/')));
        // Write a stub YAML if not present to enable draft persistence visibility
        try { await client.read(yaml); } catch { await client.write(yaml, emitYaml({ schemaVersion: data.schemaVersion ?? 1, moduleId, objectId }, { indent: 2 })); }
        await client.write(uiState, JSON.stringify(data, null, 2) + '\n');
    }

    async function handleFinish(data: any) {
        if (!settings.projectRoot) return alert('Select a project root in settings');
        if (!data.moduleId || !data.objectId || !projectId) return alert('Select a project & enter moduleId and objectId');
        const { yaml: yamlPath, uiState } = tierXXPaths(settings.projectRoot, projectId, data.moduleId, data.objectId);
        const yamlText = emitYaml(data, { indent: 2 });
        await client.mkdirp(uiState.slice(0, uiState.lastIndexOf('/')));
        await client.mkdirp(yamlPath.slice(0, yamlPath.lastIndexOf('/')));
        await client.write(uiState, JSON.stringify(data, null, 2) + '\n');
        await client.write(yamlPath, yamlText);
        setYaml(yamlText);
        try { await navigator.clipboard.writeText(yamlText); } catch {}
    }

    // Require project, then module, then object
    if (!projectId) {
        return <ProjectPicker onPick={(p) => setProjectId(p || null)} />;
    }
    if (pickedModule === undefined || (!defaults.moduleId && !pickedModule)) {
        return (
            <div className="space-y-4">
                <ModulePicker projectId={projectId} onPick={(m) => {
                    setPickedModule(m);
                    if (m) setDefaults((d: any) => ({ ...d, moduleId: m.moduleId }));
                }} />
            </div>
        );
    }

    if (pickedObject === undefined || (!defaults.objectId && !pickedObject)) {
        return (
            <div className="space-y-4">
                <ObjectPicker projectId={pickedModule!.projectId} moduleId={pickedModule?.moduleId || defaults.moduleId} onPick={(o) => {
                    setPickedObject(o);
                    if (o) setDefaults((d: any) => ({ ...d, moduleId: o.moduleId, objectId: o.objectId }));
                }} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <WizardShell key={formKey} steps={tierXXSteps} initialData={defaults} onChange={(d: any) => setDefaults(d)} onSaveStep={handleSaveStep} onFinish={handleFinish} />
                </div>
                <aside className="space-y-4">
                    <a href={`/tier01?step=objects&projectId=${projectId ?? pickedModule?.projectId ?? ''}`} className="inline-flex items-center px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50">Open 01 (module)</a>
                    <JsonExplorer title="Current XX (working data)" data={defaults} defaultOpenDepth={1} />
                    {inherited.tier01 && <JsonExplorer title="Inherited: Tier 01" data={inherited.tier01} defaultOpenDepth={1} />}
                    {inherited.tier00 && <JsonExplorer title="Inherited: Tier 00" data={inherited.tier00} defaultOpenDepth={0} />}
                </aside>
            </div>
            {yaml && <pre className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200 whitespace-pre-wrap leading-5 text-sm">{yaml}</pre>}
        </div>
    );
}

