import React from 'react';
import { WizardShell } from '../../components/wizard/index.js';
import { ProjectContext } from '../../state/ProjectContext.js';
import { FileBridgeClient } from '@docs-as-code/file-bridge-client';
import { ModelDesignZ, type ModelDesign } from '@docs-as-code/shared-types/dist/schemas/index.js';
import { readModelDesign, writeModelDesign, createModelDesignSkeleton, generateModelingContextMarkdown, writeModelingContextMarkdown, addModuleToEnvironments, assignDataModelToEnvironments } from './services/index.js';
import { scanLocalEntities, scanLocalRelationshipLabels, scanLocalImplements, type LocalEntityRef } from '../../services/catalog.js';
import { JsonExplorer } from '../../components/common/JsonExplorer.js';
import { useSearchParams } from 'react-router-dom';
import { scanToolkitRepo } from '../../services/toolkit/index.js';
import { useModuleNames } from './hooks/useModuleNames.js';
import { buildTier01Steps } from './steps.js';
import { getImplementableCoreTypes, formatCdmTemplateValue } from '../../services/cdmCatalog.js';

// moved to hooks/useModuleNames.ts

export function Tier01Page() {
  const ctx = React.useContext(ProjectContext);
  if (!ctx) return null;
  const { settings } = ctx;
  const client = React.useMemo(() => new FileBridgeClient({ baseUrl: settings.bridgeBaseUrl }), [settings.bridgeBaseUrl]);
  const modules = useModuleNames(client);

  const [currentModule, setCurrentModule] = React.useState<string | null>(null);
  const [defaults, setDefaults] = React.useState<ModelDesign | null>(null);
  const [catalog, setCatalog] = React.useState<LocalEntityRef[]>([]);
  const [envNames, setEnvNames] = React.useState<string[]>([]);
  const [labelSuggestions, setLabelSuggestions] = React.useState<string[]>([]);
  const [cdmTypes, setCdmTypes] = React.useState<Array<{ value: string; label: string }>>([]);
  const [localImplOptions, setLocalImplOptions] = React.useState<Array<{ value: string; label: string }>>([]);
  const [params] = useSearchParams();

  React.useEffect(() => {
    (async () => {
      if (!currentModule && modules.length > 0) setCurrentModule(modules[0] || null);
      if (!currentModule) return;
      const existing = await readModelDesign(client, currentModule);
      if (existing) setDefaults(existing);
      else {
        const skeleton = createModelDesignSkeleton(currentModule);
        setDefaults(skeleton);
      }
    })();
  }, [client, currentModule, modules]);

  React.useEffect(() => {
    (async () => {
      try {
        const ents = await scanLocalEntities(client);
        setCatalog(ents);
      } catch {}
    })();
  }, [client]);

  React.useEffect(() => {
    (async () => {
      try {
        const labels = await scanLocalRelationshipLabels(client);
        setLabelSuggestions(labels);
      } catch {}
    })();
  }, [client]);

  React.useEffect(() => {
    (async () => {
      try {
        const all = await getImplementableCoreTypes();
        setCdmTypes(all.map((t) => ({ value: formatCdmTemplateValue(t), label: `CDM: ${t.label}` })));
      } catch {}
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const triples = await scanLocalImplements(client);
        setLocalImplOptions(triples.map((tr) => ({ value: `${tr.space}:${tr.externalId}${tr.version ? '@' + tr.version : ''}`, label: `Local: ${tr.space}:${tr.externalId}${tr.version ? ' @ ' + tr.version : ''}` })));
      } catch {}
    })();
  }, [client]);

  React.useEffect(() => {
    (async () => {
      try {
        const scan = await scanToolkitRepo(client);
        setEnvNames(scan.environments.map((e) => e.name).filter(Boolean));
      } catch {}
    })();
  }, [client]);

  const steps = React.useMemo(() => buildTier01Steps({ modules, envNames, defaults, labelSuggestions, cdmTypes, localImplOptions, catalog }), [modules, envNames, defaults, labelSuggestions, cdmTypes, localImplOptions, catalog]);

  async function onSaveStep(data: any) {
    try {
      const moduleName = String(data?.module || currentModule || '').trim() || 'module';
      const cloned = JSON.parse(JSON.stringify(data || {}));
      if (cloned && cloned.uiSuggestions) delete cloned.uiSuggestions;
      let merged: ModelDesign = { ...(defaults || createModelDesignSkeleton(moduleName)), ...cloned, module: moduleName } as any;

      // Resolve cross-module copy references (objects.copyFrom: string[] of module:object)
      const copyFrom: string[] = Array.isArray((data as any)?.copyFrom) ? (data as any).copyFrom as string[] : [];
      if (copyFrom.length > 0) {
        const toAdd: Array<{ name: string; description?: string; implements?: any[] }> = [];
        for (const ref of copyFrom) {
          const [mod, obj] = String(ref).split(':');
          if (!mod || !obj) continue;
          try {
            const donor = await readModelDesign(client, mod);
            const found = donor?.objects?.find((o) => String(o?.name) === obj);
            if (found) toAdd.push({ name: found.name, description: found.description, implements: found.implements });
          } catch (e: any) {
            console.warn('[phase2] Failed to copy object from', ref, e?.message || e);
          }
        }
        if (toAdd.length > 0) {
          const existingNames = new Set((Array.isArray(merged.objects) ? merged.objects : []).map((o) => o.name));
          const unique = toAdd.filter((o) => !existingNames.has(o.name));
          merged = { ...merged, objects: [ ...(merged.objects || []), ...unique ] } as any;
        }
      }

      const normalized = ModelDesignZ.parse(merged);
      await writeModelDesign(client, normalized.module, normalized);
      // Also emit split overview JSON for compatibility
      try { await (await import('../../services/tier01.js')).writeModelOverview(client, normalized.module, normalized); } catch {}
      const md = generateModelingContextMarkdown(normalized);
      await writeModelingContextMarkdown(client, normalized.module, md);
      setDefaults(normalized);
      console.info('[phase2] Saved model_design.json for module:', normalized.module);
    } catch (e: any) {
      console.error('[phase2] Save failed:', e?.message || e);
      throw e;
    }
  }

  async function onFinish(data: any) {
    await onSaveStep(data);
    // Auto-add module to selected environments (if user chose any earlier in Phase 1/2; for now, add to dev if exists)
    try {
      const moduleName = String((defaults as any)?.module || data?.module || currentModule || '').trim();
      const selected = Array.isArray((data as any)?.selectedEnvironments) ? (data as any).selectedEnvironments as string[] : [];
      const assignTo = Array.isArray((data as any)?.assignToEnvironments) ? (data as any).assignToEnvironments as string[] : [];
      const envs = selected.length ? selected : (envNames.includes('dev') ? ['dev'] : []);
      if (moduleName && envs.length) {
        const { updated } = await addModuleToEnvironments(client, moduleName, envs);
        if (updated.length) console.info('[phase2] Module added to environments:', updated.join(', '));
      }
      // Assign data model and space to selected env configs
      const dm = (data as any)?.dataModelAssignment || {};
      const externalId = String(dm?.externalId || '').trim();
      const space = String(dm?.space || '').trim();
      const version = String(dm?.version || '').trim() || undefined;
      const envsForAssign = assignTo.length ? assignTo : envs;
      if (externalId && space && envsForAssign.length) {
        const { updated: envsUpdated } = await assignDataModelToEnvironments(client, { externalId, space, version }, envsForAssign);
        if (envsUpdated.length) console.info('[phase2] Data model assigned to environments:', envsUpdated.join(', '));
      }
    } catch (e: any) {
      console.warn('[phase2] Environment update skipped due to error:', e?.message || e);
    }
  }

  if (!defaults) return <div className="px-2 text-sm text-slate-600">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className="px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50" onClick={async () => { const ents = await scanLocalEntities(client); setCatalog(ents); }}>
          Refresh Catalog
        </button>
        <button className="px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50" onClick={async () => {
          try {
            const moduleName = String((defaults as any)?.module || currentModule || '').trim();
            if (!moduleName) return;
            const fresh = await readModelDesign(client, moduleName);
            setDefaults(fresh || createModelDesignSkeleton(moduleName));
          } catch {}
        }}>
          Refresh Objects
        </button>
        <button className="px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50" onClick={async () => {
          try {
            const scan = await scanToolkitRepo(client);
            setEnvNames(scan.environments.map((e) => e.name).filter(Boolean));
          } catch {}
        }}>
          Refresh Environments
        </button>
      </div>
      <WizardShell
        steps={steps as any}
        initialData={{ ...defaults, uiSuggestions: { relLabels: Object.fromEntries(labelSuggestions.map((s) => [s, s])) } as any }}
        onChange={() => {}}
        onSaveStep={onSaveStep}
        onFinish={onFinish}
        phase="phase2"
      />
      {params.get('step') === 'review' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <div className="text-sm font-semibold text-slate-900 mb-2">Markdown Preview</div>
            <pre className="whitespace-pre-wrap text-sm leading-5">{generateModelingContextMarkdown(defaults)}</pre>
          </div>
          <JsonExplorer title="model_design.json" data={defaults} defaultOpenDepth={2} />
        </div>
      )}
    </div>
  );
}


