import { api } from '../../base/api';

type ContactsRequest = {
    params: undefined;
    body: undefined;
};

type ContactsResponse = {
    ogrn: string;
    legal_address: string;
    coordinates: null;
    sales_center_address: string;
};

export const siteContacts = api.get<ContactsRequest, ContactsResponse>('/site-settings/contacts');
