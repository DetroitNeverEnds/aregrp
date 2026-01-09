import type { StorybookConfig } from '@storybook/react-vite';

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
        return {
            ...config,
        };
    },
};
export default config;
