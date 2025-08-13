import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Node ESM does not have __dirname, reconstruct it for use in path.resolve below
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react()],
    resolve: {
        dedupe: ['react', 'react-dom'],
        alias: [
            // Use source of local workspace packages during dev to avoid requiring a build
            { find: '@docs-as-code/form-renderer', replacement: path.resolve(__dirname, '../form-renderer/src/index.tsx') },
            { find: '@docs-as-code/shared-types', replacement: path.resolve(__dirname, '../shared-types/src/index.ts') },
            { find: '@docs-as-code/ui-components', replacement: path.resolve(__dirname, '../ui-components/src/index.ts') },
            { find: '@docs-as-code/yaml-emitter', replacement: path.resolve(__dirname, '../yaml-emitter/src/index.ts') },
            { find: '@docs-as-code/file-bridge-client', replacement: path.resolve(__dirname, '../file-bridge-client/src/index.ts') },
            // Support internal alias used inside packages
            { find: '@ui-components', replacement: path.resolve(__dirname, '../ui-components/src') },
            // Docs raw imports
            { find: '@docs-md', replacement: path.resolve(__dirname, '../../docs') }
        ]
    },
    server: {
        fs: {
            // allow importing from monorepo root (../.. = app)
            allow: [path.resolve(__dirname, '..', '..')]
        }
    }
});
