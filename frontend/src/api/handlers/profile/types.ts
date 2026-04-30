/**
 * Типы для profile handlers
 */

// Реэкспорт типов из auth для избежания дублирования
export type { UserData, Message } from '@/api/handlers/auth/types';

/**
 * Данные для обновления профиля
 */
export interface UpdateProfileData {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    organization_name?: string | null;
    inn?: string | null;
}

/**
 * Данные для смены пароля
 */
export interface ChangePasswordData {
    current_password: string;
    new_password1: string;
    new_password2: string;
}

/** OpenAPI: PremiseBriefOut */
export interface PremiseBriefOut {
    uuid: string;
    name: string;
}

/** OpenAPI: BuildingBriefOut */
export interface BuildingBriefOut {
    uuid: string;
    name: string;
}

/** OpenAPI: ProfilePremiseRowOut */
export interface ProfilePremiseRowOut {
    premise: PremiseBriefOut;
    building: BuildingBriefOut;
    commission?: number | null;
    rent_expires_at?: string | null;
    contract_type?: string | null;
    contract_signed_on?: string | null;
}

/** OpenAPI: ProfilePremisesListResponse */
export interface ProfilePremisesListResponse {
    items: ProfilePremiseRowOut[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

/** Параметры GET /profile/premises */
export interface ProfilePremisesQueryParams {
    query: 'rent' | 'sale';
    page?: number;
    page_size?: number;
}
