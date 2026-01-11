import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

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
        });
    },
};
export default config;
