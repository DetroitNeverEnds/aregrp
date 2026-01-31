/**
 * API модуль для работы с backend
 */

// Базовые типы
export type { ApiError as ProblemDetail } from './types';
export { type ApiError } from './types';

// Базовые классы (для расширенного использования)
export { BaseApiClient } from './base/BaseApiClient';
export type { BaseApiClientConfig } from './base/BaseApiClient';

export { AuthApiClient } from './base/AuthApiClient';
export type { AuthApiClientConfig } from './base/AuthApiClient';

// API фабрика и утилиты
export { api, initializeApiClient } from './base/api';
