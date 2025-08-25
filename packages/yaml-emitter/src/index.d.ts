export type EmitOptions = {
    indent?: number;
};
export declare function emitYaml(value: unknown, options?: EmitOptions): Promise<string>;
export declare function parseYaml<T = unknown>(text: string): Promise<T>;
