import { Document, isMap, YAMLMap, parse } from 'yaml';

export type EmitOptions = {
    indent?: number;
};

function sortMapDeep(node: unknown): void {
    if (!isMap(node)) return;
    const map = node as YAMLMap<unknown, unknown>;
    map.items.sort((a: any, b: any) => String(a.key?.value ?? a.key).localeCompare(String(b.key?.value ?? b.key)));
    for (const item of map.items) {
        sortMapDeep(item.value as any);
    }
}

export function emitYaml(value: unknown, options: EmitOptions = {}): string {
    const doc = new Document(value as any);
    if (isMap(doc.contents)) sortMapDeep(doc.contents);
    const text = doc.toString({ indent: options.indent ?? 2 });
    return text.endsWith('\n') ? text : text + '\n';
}

export function parseYaml<T = unknown>(text: string): T {
    return parse(text) as T;
}
