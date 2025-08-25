import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Node ESM does not have __dirname, reconstruct it for use in path.resolve below
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react()],
    define: {
        'import.meta.env.VITE_VERBOSE': JSON.stringify(process.env.VITE_VERBOSE || ''),
    },
    resolve: {
        dedupe: ['react', 'react-dom'],
        alias: [
            // Docs raw imports (optional)
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
