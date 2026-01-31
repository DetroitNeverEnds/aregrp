/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dirname =
    typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        svgr({
            include: '**/*.svg?react',
        }),
        react(),
    ],
    server: {
        proxy: {
            '/api/v1': {
                target: 'http://176.98.176.204',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules', 'dist', '.storybook'],
        typecheck: {
            tsconfig: './tsconfig.test.json',
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(dirname, './src'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "@/styles/variables.scss" as *;`,
            },
        },
    },
});
