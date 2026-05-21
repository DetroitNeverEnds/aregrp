import { api } from '@/api/base/api';

/** OpenAPI: AgentSettingsOut */
export type AgentSettingsOut = {
    table_link?: string | null;
};

export const siteAgentSettings = api.get<void, AgentSettingsOut>('/site-settings/agents');
