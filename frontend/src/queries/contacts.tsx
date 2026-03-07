import { useQuery } from '@tanstack/react-query';
import { siteContacts } from '../api/handlers/siteSettings/contacts';
import { wrapApiCall } from '../lib/queryHelpers';

export const useSiteContacts = () => {
    return useQuery({
        queryKey: ['site-contacts'],
        queryFn: () => wrapApiCall(siteContacts)(),
    });
};
