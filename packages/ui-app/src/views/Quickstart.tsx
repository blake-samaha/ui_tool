export function Quickstart() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Quickstart</h1>
      <div className="relative rounded-xl bg-white p-6 ring-1 ring-slate-200">
        <div className="pointer-events-none absolute inset-x-8 top-[42px] hidden h-px bg-slate-200 md:block" />
        <ol className="grid gap-4 md:grid-cols-4">
          <li className="relative flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold shadow-sm">1</span>
              <div className="font-medium text-slate-900">Install and point to your CDF repository</div>
            </div>
            <div className="pl-11 text-sm text-slate-700">Place the app anywhere on your machine. In the header, choose your local repo root.</div>
          </li>
          <li className="relative flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold shadow-sm">2</span>
              <div className="font-medium text-slate-900">Use the wizard to capture connection and model details</div>
            </div>
            <div className="pl-11 text-sm text-slate-700">Enter CDF connection context and define your data objects and relationships.</div>
          </li>
          <li className="relative flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold shadow-sm">3</span>
              <div className="font-medium text-slate-900">Use the AI assistant and Cognite docs in Cursor to update your CDF project</div>
            </div>
            <div className="pl-11 text-sm text-slate-700">Leverage the generated YAML/JSON to create or modify the targeted parts of your repository.</div>
          </li>
          <li className="relative flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold shadow-sm">4</span>
              <div className="font-medium text-slate-900">Deploy to CDF</div>
            </div>
            <div className="pl-11 text-sm text-slate-700">Apply changes with Cognite Toolkit. Iterate by refining inputs → regenerating YAML/JSON → redeploying.</div>
          </li>
        </ol>
      </div>
    </div>
  );
}


