import React from 'react';
import { emitYaml, parseYaml } from '@docs-as-code/yaml-emitter';
import { WizardShell } from '../../components/wizard/WizardShell.js';
import { TierXXObjectSpecificationZ } from '@docs-as-code/shared-types';
import { tierXXSteps } from './steps.js';
import { ProjectContext } from '../../state/ProjectContext.js';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { tierXXPaths } from '../../utils/paths.js';
import { ModulePicker, type ModuleRef } from '../../components/common/ModulePicker.js';
import { ObjectPicker, type ObjectRef } from '../../components/common/ObjectPicker.js';
import { useSearchParams } from 'react-router-dom';
import { JsonExplorer } from '../../components/common/JsonExplorer.js';
import { tier00Paths, tier01Paths } from '../../utils/paths.js';

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
    const [params] = useSearchParams();
    const [inherited, setInherited] = React.useState<{ tier00?: any; tier01?: any }>({});

    // Optional init from URL
    React.useEffect(() => {
        const m = params.get('moduleId');
        const o = params.get('objectId');
        if (m) {
            setPickedModule({ moduleId: m, path: `project_templates/modules/${m}` });
            setDefaults((d: any) => ({ ...d, moduleId: m }));
        }
        if (m && o) {
            setPickedObject({ moduleId: m, objectId: o, yamlPath: `project_templates/modules/${m}/XX_Object_Specs/${o}.yaml`, uiStatePath: `project_templates/modules/${m}/ui-state/xx/${o}.json` });
            setDefaults((d: any) => ({ ...d, objectId: o }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        (async () => {
            const moduleId = pickedModule?.moduleId || defaults.moduleId;
            const objectId = pickedObject?.objectId || defaults.objectId;
            if (!settings.projectRoot || !moduleId || !objectId) return;
            const { yaml: yamlPath, uiState } = tierXXPaths(settings.projectRoot, moduleId, objectId);
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
    }, [settings.projectRoot, client, pickedModule, pickedObject]);

    // load inherited context once module is known
    React.useEffect(() => {
        (async () => {
            const moduleId = pickedModule?.moduleId || defaults.moduleId;
            if (!settings.projectRoot || !moduleId) return;
            try {
                const t00 = tier00Paths(settings.projectRoot);
                const t01 = tier01Paths(settings.projectRoot, moduleId);
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
    }, [client, defaults.moduleId, pickedModule, settings.projectRoot]);

    async function handleSaveStep(data: any) {
        if (!settings.projectRoot) return;
        if (!data.moduleId || !data.objectId) return;
        const { uiState } = tierXXPaths(settings.projectRoot, data.moduleId, data.objectId);
        await client.mkdirp(uiState.slice(0, uiState.lastIndexOf('/')));
        await client.write(uiState, JSON.stringify(data, null, 2) + '\n');
    }

    async function handleFinish(data: any) {
        if (!settings.projectRoot) return alert('Select a project root in settings');
        if (!data.moduleId || !data.objectId) return alert('Enter moduleId and objectId');
        const { yaml: yamlPath, uiState } = tierXXPaths(settings.projectRoot, data.moduleId, data.objectId);
        const yamlText = emitYaml(data, { indent: 2 });
        await client.mkdirp(uiState.slice(0, uiState.lastIndexOf('/')));
        await client.mkdirp(yamlPath.slice(0, yamlPath.lastIndexOf('/')));
        await client.write(uiState, JSON.stringify(data, null, 2) + '\n');
        await client.write(yamlPath, yamlText);
        setYaml(yamlText);
        try { await navigator.clipboard.writeText(yamlText); } catch {}
    }

    // Pickers for module and object
    if (pickedModule === undefined || (!defaults.moduleId && !pickedModule)) {
        return (
            <div className="space-y-4">
                <ModulePicker onPick={(m) => {
                    setPickedModule(m);
                    if (m) setDefaults((d: any) => ({ ...d, moduleId: m.moduleId }));
                }} />
            </div>
        );
    }

    if (pickedObject === undefined || (!defaults.objectId && !pickedObject)) {
        return (
            <div className="space-y-4">
                <ObjectPicker moduleId={pickedModule?.moduleId || defaults.moduleId} onPick={(o) => {
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
                    <a href={`/tier01?step=objects`} className="inline-flex items-center px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50">Open 01 (module)</a>
                    <JsonExplorer title="Current XX (working data)" data={defaults} defaultOpenDepth={1} />
                    {inherited.tier01 && <JsonExplorer title="Inherited: Tier 01" data={inherited.tier01} defaultOpenDepth={1} />}
                    {inherited.tier00 && <JsonExplorer title="Inherited: Tier 00" data={inherited.tier00} defaultOpenDepth={0} />}
                </aside>
            </div>
            {yaml && <pre className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200 whitespace-pre-wrap leading-5 text-sm">{yaml}</pre>}
        </div>
    );
}

