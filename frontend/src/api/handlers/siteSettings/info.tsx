import { api } from '../../base/api';

export type InfoRequest = {
    params: undefined;
    body: undefined;
};

export type InfoResponse = {
    phone: string;
    display_phone: string;
    email: string;
    whatsapp_link: string;
    telegram_link: string;
    description: string;
    inn: string;
    org_name: string;
};

export const siteInfo = api.get<InfoRequest, InfoResponse>('/site-settings/main-info');
