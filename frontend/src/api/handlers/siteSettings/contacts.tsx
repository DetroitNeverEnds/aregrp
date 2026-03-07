import { api } from '../../base/api';

type ContactsRequest = {
    params: undefined;
    body: undefined;
};

type ContactsResponse = {
    ogrn?: string | null;
    legal_address?: string | null;
    coordinates?: {
        lat: number;
        lng: number;
    } | null;
    sales_center_address?: string | null;
};

export const siteContacts = api.get<ContactsRequest, ContactsResponse>('/site-settings/contacts');
