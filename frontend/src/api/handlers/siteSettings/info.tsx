import { api } from '../../base/api';

export type InfoResponse = {
    phone: string;
    display_phone: string;
    email: string;
    max_link: string;
    telegram_link: string;
    description: string;
    inn: string;
    org_name: string;
    cases: string;
};

export const siteInfo = api.get<void, InfoResponse>('/site-settings/main-info');
