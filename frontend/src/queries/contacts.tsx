import { useQuery } from '@tanstack/react-query';
import { siteContacts } from '../api/handlers/siteSettings/contacts';

export const useSiteContacts = () => {
    return useQuery({
        queryKey: ['site-contacts'],
        queryFn: () =>
            siteContacts({
                params: undefined,
                body: undefined,
            }),
    });
};
