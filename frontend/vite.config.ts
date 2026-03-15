/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dirname =
    typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const apiHost = env.VITE_API_HOST;

    return {
        plugins: [
            svgr({
                include: '**/*.svg?react',
            }),
            react(),
        ],
        server: {
            proxy: {
                '/api/v1': {
                    target: apiHost,
                    changeOrigin: true,
                    secure: false,
                },
                '/media': {
                    target: apiHost,
                    changeOrigin: true,
                    secure: false,
                },
                '/yandex-maps-api': {
                    target: 'https://api-maps.yandex.ru',
                    changeOrigin: true,
                    secure: true,
                    rewrite: path => path.replace(/^\/yandex-maps-api/, ''),
                    configure: (proxy, _options) => {
                        proxy.on('proxyReq', (proxyReq, _req, _res) => {
                            // Устанавливаем кастомный заголовок Referer
                            proxyReq.setHeader('Referer', 'http://localhost/');
                        });
                    },
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
    };
});
