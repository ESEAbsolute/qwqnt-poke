import { defineConfig } from 'rolldown';

const external = [
    'electron',
    'fs',
    'path',
    'os',
    'child_process',
    'crypto',
    'net',
    'http',
    'https',
    'stream',
    'util',
    'events',
    'buffer',
    'url',
    'typeproto'
];

export default defineConfig([
    // Main
    {
        input: 'src/main/index.ts',
        output: {
            format: 'cjs',
            dir: 'dist/main',
            // minify: true,
            // cleanDir: true,
            // sourcemap: true,
        },
        platform: 'node',
        tsconfig: './tsconfig.json',
        external,
    },
    // Preload
    {
        input: 'src/preload/index.ts',
        output: {
            format: 'cjs',
            dir: 'dist/preload',
            // minify: true,
            // cleanDir: true,
            // sourcemap: true,
        },
        platform: 'node',
        tsconfig: './tsconfig.json',
        external,
    },
    // Renderer
    {
        input: 'src/renderer/index.ts',
        output: {
            format: 'cjs',
            dir: 'dist/renderer',
            // minify: true,
            // cleanDir: true,
            // sourcemap: true,
        },
        platform: 'browser',
        tsconfig: './tsconfig.json',
        external,
    },
]);
