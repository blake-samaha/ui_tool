const TERMS: Array<{ term: string; def: string; link?: string }> = [
  { term: 'Organization', def: 'Top-level scope containing one or more CDF projects.' },
  { term: 'CDF Project', def: 'Logical workspace for deploying configurations and managing data in CDF.', link: 'https://docs.cognite.com/cdf/deploy/cdf_toolkit/guides/usage' },
  { term: 'Module', def: 'Self-contained bundle of configuration files implementing a cohesive capability.', link: 'https://docs.cognite.com/cdf/deploy/cdf_toolkit/guides/modules/custom' },
  { term: 'Data Model (CDM)', def: 'Graph-first modeling with spaces, views, containers, and typed edges.', link: 'https://docs.cognite.com/cdf/dm/dm_reference/dm_core_data_model' },
  { term: 'View', def: 'Schema over one or more containers; can implement core views.' },
  { term: 'Container', def: 'Typed storage with indexes and constraints.' },
  { term: 'Typed edge', def: 'Graph relation between instances, optionally typed and labeled.' },
  { term: 'Environment', def: 'Deployment context (for example dev/prod) used by Toolkit.' },
  { term: 'Workspace (UI)', def: 'Selected local repository root used by this app for project_templates/**.' }
];

export function Glossary() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Glossary</h1>
      <div className="rounded-xl bg-white p-6 ring-1 ring-slate-200">
        <ul className="space-y-2">
          {TERMS.map((t) => (
            <li key={t.term} className="">
              <div className="text-base font-medium text-slate-900">{t.term}</div>
              <div className="text-sm text-slate-700">
                {t.def}
                {t.link && (
                  <>
                    {' '}<a className="text-blue-700 underline" href={t.link} target="_blank" rel="noreferrer">Learn more</a>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


