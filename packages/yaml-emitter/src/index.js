// Lazy-load yaml to avoid pulling it into initial bundles
let yamlPromise = null;
async function getYaml() {
    if (!yamlPromise) {
        yamlPromise = import('yaml');
    }
    return yamlPromise;
}
async function sortMapDeep(node) {
    const { isMap, YAMLMap } = await getYaml();
    if (!isMap(node))
        return;
    const map = node;
    map.items.sort((a, b) => String(a.key?.value ?? a.key).localeCompare(String(b.key?.value ?? b.key)));
    for (const item of map.items) {
        await sortMapDeep(item.value);
    }
}
export async function emitYaml(value, options = {}) {
    const { Document, isMap } = await getYaml();
    const doc = new Document(value);
    if (isMap(doc.contents))
        await sortMapDeep(doc.contents);
    const text = doc.toString({ indent: options.indent ?? 2 });
    return text.endsWith('\n') ? text : text + '\n';
}
export async function parseYaml(text) {
    const { parse } = await getYaml();
    return parse(text);
}
