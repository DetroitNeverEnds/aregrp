import { api } from '../../base/api';

export type InfoResponse = {
    phone: string;
    display_phone: string;
    email: string;
    max_link?: string | null;
    telegram_link?: string | null;
    description?: string | null;
    inn?: string | null;
    org_name?: string | null;
};

export const siteInfo = api.get<void, InfoResponse>('/site-settings/main-info');
