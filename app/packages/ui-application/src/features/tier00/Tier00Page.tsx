import React from 'react';
import { WizardShell } from '../../components/wizard/WizardShell.js';
import { tier00Steps } from './steps.js';
import { Tier00SolutionDesignZ } from '@docs-as-code/shared-types';
import { emitYaml, parseYaml } from '@docs-as-code/yaml-emitter';
import { ProjectContext } from '../../state/ProjectContext.js';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { tier00Paths } from '../../utils/paths.js';

export function Tier00Page() {
    const ctx = React.useContext(ProjectContext);
    if (!ctx) return null;
    const { settings } = ctx;
    const [yaml, setYaml] = React.useState('');
    const [formKey, setFormKey] = React.useState(0);
    const [defaults, setDefaults] = React.useState<any>({ schemaVersion: 1, environments: [{ name: '', cdf_cluster: '', cdf_region: '' }] });
    const client = React.useMemo(() => new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl }), [settings.bridgeBaseUrl]);

    const steps = React.useMemo(() => tier00Steps, []);

    React.useEffect(() => {
        if (!settings.projectRoot) return;
        const { yaml: yamlPath, uiState } = tier00Paths(settings.projectRoot);
        (async () => {
            try {
                // Prefer UI-state JSON
                const raw = await client.read(uiState);
                if (raw && raw.trim().length > 0) {
                    const json = JSON.parse(raw);
                    setDefaults(json);
                    setFormKey((k) => k + 1);
                    return;
                }
            } catch {}
            try {
                const text = await client.read(yamlPath);
                if (text && text.trim().length > 0) {
                    const obj = parseYaml<any>(text);
                    if (obj && typeof obj === 'object') {
                        setDefaults(obj);
                        setFormKey((k) => k + 1);
                    }
                }
            } catch {}
        })();
    }, [settings.projectRoot, client]);

    async function handleSave(data: any, writeYaml = false) {
        if (!settings.projectRoot) return alert('Select a project root in settings');
        const { yaml: yamlPath, uiState } = tier00Paths(settings.projectRoot);
        const yamlText = emitYaml(data, { indent: 2 });
        // Ensure dirs
        const uiDir = uiState.slice(0, uiState.lastIndexOf('/'));
        const yamlDir = yamlPath.slice(0, yamlPath.lastIndexOf('/'));
        await client.mkdirp(uiDir);
        await client.mkdirp(yamlDir);
        await client.write(uiState, JSON.stringify(data, null, 2) + '\n');
        if (writeYaml) {
            await client.write(yamlPath, yamlText);
            setYaml(yamlText);
            try { await navigator.clipboard.writeText(yamlText); } catch {}
        }
    }

    return (
        <div className="space-y-4">
            <WizardShell
                steps={steps}
                initialData={defaults}
                onChange={(d: any) => setDefaults(d)}
                onSaveStep={(d) => handleSave(d, false)}
                onFinish={(d) => handleSave(d, true)}
            />
            {yaml && (
                <div>
                    <h2 className="text-lg font-semibold mb-2">YAML Preview</h2>
                    <pre className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200 whitespace-pre-wrap leading-5 text-sm">{yaml}</pre>
                </div>
            )}
        </div>
    );
}

