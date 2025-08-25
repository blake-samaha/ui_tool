export type FileBridgeClientOptions = {
    baseUrl: string;
};
export declare class FileBridgeClient {
    private readonly baseUrl;
    constructor(options: FileBridgeClientOptions);
    health(): Promise<boolean>;
    read(path: string): Promise<string>;
    write(path: string, content: string): Promise<void>;
    list(path: string): Promise<Array<{
        name: string;
        path: string;
        type: 'file' | 'dir';
    }>>;
    mkdirp(path: string): Promise<void>;
    setRoot(root: string): Promise<void>;
    pickRoot(): Promise<string | null>;
    exec(command: string, cwd: string): Promise<{
        ok: boolean;
        stdout: string;
        stderr: string;
        code?: number;
    }>;
}
