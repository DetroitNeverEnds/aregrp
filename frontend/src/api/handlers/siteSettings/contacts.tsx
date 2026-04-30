import { api } from '@/api/base/api';

export type ContactsResponse = {
    ogrn?: string | null;
    legal_address?: string | null;
    coordinates?: {
        lat: number;
        lng: number;
    } | null;
    sales_center_address?: string | null;
};

export const siteContacts = api.get<void, ContactsResponse>('/site-settings/contacts');
