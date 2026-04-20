import type { Preview } from '@storybook/react-vite';

// Подключение шрифта Montserrat для Storybook
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href =
    'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap';
document.head.appendChild(link);

// Preconnect для оптимизации
const preconnect1 = document.createElement('link');
preconnect1.rel = 'preconnect';
preconnect1.href = 'https://fonts.googleapis.com';
document.head.appendChild(preconnect1);

const preconnect2 = document.createElement('link');
preconnect2.rel = 'preconnect';
preconnect2.href = 'https://fonts.gstatic.com';
preconnect2.crossOrigin = 'anonymous';
document.head.appendChild(preconnect2);

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        a11y: {
            // 'todo' - show a11y violations in the test UI only
            // 'error' - fail CI on a11y violations
            // 'off' - skip a11y checks entirely
            test: 'todo',
        },
        viewport: {
            viewports: {
                mobile375: {
                    name: 'Mobile 375',
                    styles: { width: '375px', height: '667px' },
                },
                mobile390: {
                    name: 'Mobile 390',
                    styles: { width: '390px', height: '844px' },
                },
                tablet768: {
                    name: 'Tablet 768',
                    styles: { width: '768px', height: '1024px' },
                },
            },
        },
    },
};

export default preview;
