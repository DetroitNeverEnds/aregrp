import { api } from '@/api/base/api';

/** OpenAPI: AgentPartnerOut */
export type AgentPartnerOut = {
    full_name: string;
    /** URL фото из storage, либо null — фото необязательное */
    photo?: string | null;
    deals_count: number;
};

/** OpenAPI: AgentSettingsOut */
export type AgentSettingsOut = {
    table_link?: string | null;
    /** До 10 карточек, уже отсортированы по порядку из админки */
    partners?: AgentPartnerOut[];
    /** Пункты блока «Преимущества дилера» */
    dealer_advantages?: string[];
    /** Пункты блока «Что нужно делать» */
    dealer_duties?: string[];
};

export const siteAgentSettings = api.get<void, AgentSettingsOut>('/site-settings/agents');
