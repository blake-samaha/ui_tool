// Lazy-load yaml to avoid pulling it into initial bundles
let yamlPromise: Promise<any> | null = null;
async function getYaml() {
    if (!yamlPromise) {
        yamlPromise = import('yaml');
    }
    return yamlPromise;
}

export type EmitOptions = {
    indent?: number;
};

async function sortMapDeep(node: unknown): Promise<void> {
    const { isMap, YAMLMap } = await getYaml();
    if (!isMap(node)) return;
    const map = node as InstanceType<typeof YAMLMap> as any;
    map.items.sort((a: any, b: any) => String(a.key?.value ?? a.key).localeCompare(String(b.key?.value ?? b.key)));
    for (const item of map.items) {
        await sortMapDeep(item.value as any);
    }
}

export async function emitYaml(value: unknown, options: EmitOptions = {}): Promise<string> {
    const { Document, isMap } = await getYaml();
    const doc = new Document(value as any);
    if (isMap(doc.contents)) await sortMapDeep(doc.contents);
    const text = doc.toString({ indent: options.indent ?? 2 });
    return text.endsWith('\n') ? text : text + '\n';
}

export async function parseYaml<T = unknown>(text: string): Promise<T> {
    const { parse } = await getYaml();
    return parse(text) as T;
}
