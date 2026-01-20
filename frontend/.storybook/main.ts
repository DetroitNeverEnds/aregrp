import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname =
    typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: [
        '@chromatic-com/storybook',
        '@storybook/addon-vitest',
        '@storybook/addon-a11y',
        '@storybook/addon-docs',
        '@storybook/addon-onboarding',
    ],
    framework: '@storybook/react-vite',
    core: {
        builder: '@storybook/builder-vite',
    },
    async viteFinal(config) {
        // Поддержка SCSS/SASS через @use в файлах компонентов
        // Добавляем поддержку SVG как React компонентов
        return mergeConfig(config, {
            plugins: [
                svgr({
                    include: '**/*.svg?react',
                }),
            ],
            resolve: {
                alias: {
                    '@': path.resolve(dirname, '../src'),
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
    },
};
export default config;
