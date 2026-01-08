import { expect, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import i18n from '../i18n/config';

// Расширяем expect с matchers от @testing-library/jest-dom
expect.extend(matchers);

// Инициализируем i18n перед всеми тестами
beforeAll(async () => {
    await i18n.init();
});

// Очищаем после каждого теста
afterEach(() => {
    cleanup();
});
