import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: './src/main.ts',
            formats: ['cjs'],
            fileName: 'extension',
        },
        rollupOptions: {
            external: ['vscode'],
        },
        sourcemap: true,
        outDir: 'dist',
    },
    plugins: [],
});
