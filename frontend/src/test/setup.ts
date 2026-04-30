import { expect, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import i18n from '@/i18n/config';

// Расширяем expect с matchers от @testing-library/jest-dom
expect.extend(matchers);

// jsdom не реализует matchMedia; нужен для useViewportBreakpoint и компонентов вроде AuthForm
function createMatchMediaMock() {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }),
    });
}

// Инициализируем i18n перед всеми тестами
beforeAll(async () => {
    createMatchMediaMock();
    await i18n.init();
});

// Очищаем после каждого теста
afterEach(() => {
    cleanup();
});
