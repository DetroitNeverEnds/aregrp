/**
 * API модуль для работы с backend
 */

// Базовые типы
export type { ApiError as ProblemDetail } from './types';
export { type ApiError } from './types';

// Базовые классы (для расширенного использования)
export { ApiClient as BaseApiClient } from './base/ApiClient';
export type { ApiClientConfig as BaseApiClientConfig } from './base/ApiClient';

export { ApiClient, type ApiClientConfig } from './base/ApiClient';

// API фабрика и утилиты
export { api, initializeApiClient } from './base/api';

// Handlers
export * from './handlers/auth';
export * from './handlers/premises';

// Profile handlers (экспортируем только функции, типы уже экспортированы из auth)
export { getUser, updateProfile, changePassword } from './handlers/profile';
export type { UpdateProfileData, ChangePasswordData } from './handlers/profile';
