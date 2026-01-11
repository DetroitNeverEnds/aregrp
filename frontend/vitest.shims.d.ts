/* eslint-disable */
/// <reference types="vitest/globals" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
    interface Assertion<T = any>
        extends TestingLibraryMatchers<
            ReturnType<typeof expect.stringContaining>,
            T
        > {}
}
