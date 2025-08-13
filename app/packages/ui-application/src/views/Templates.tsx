import React from 'react';
import { Link } from 'react-router-dom';

export function Templates() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Templates</h1>
        <p className="text-sm text-slate-700">
          Use these Markdown templates as working documents to gather and finalize the information needed for each tier.
          They serve as checklists for contract negotiations, workshops, and SME discussions. Once the details are agreed,
          transfer them into the wizard to generate deterministic YAML and UI-state JSON.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl bg-white p-5 ring-1 ring-slate-200 space-y-2">
          <h2 className="text-base font-semibold text-slate-900">00 — Solution Design Principles</h2>
          <p className="text-sm text-slate-700">
            High-level solution scope, environments, security, governance, and standards.
          </p>
          <Link className="inline-flex items-center px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50" to="/templates/solution-design">
            View template
          </Link>
        </article>

        <article className="rounded-xl bg-white p-5 ring-1 ring-slate-200 space-y-2">
          <h2 className="text-base font-semibold text-slate-900">01 — Conceptual Model</h2>
          <p className="text-sm text-slate-700">
            Core business objects and their relationships, plus the module-level data model.
          </p>
          <Link className="inline-flex items-center px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50" to="/templates/conceptual-model">
            View template
          </Link>
        </article>

        <article className="rounded-xl bg-white p-5 ring-1 ring-slate-200 space-y-2">
          <h2 className="text-base font-semibold text-slate-900">XX — Object Specification</h2>
          <p className="text-sm text-slate-700">
            Detailed spec for a single object: properties, lineage, relationships, and quality rules.
          </p>
          <Link className="inline-flex items-center px-3 py-1.5 rounded-md ring-1 ring-slate-300 hover:bg-slate-50" to="/templates/object-specification">
            View template
          </Link>
        </article>
      </section>

      <aside className="rounded-xl bg-sky-50 p-5 ring-1 ring-sky-200">
        <div className="text-sm text-slate-800">
          Tip: Treat these as living checklists. Capture decisions, placeholders, and open questions. When ready, use the
          wizard to validate inputs and emit YAML for version control.
        </div>
      </aside>
    </div>
  );
}


