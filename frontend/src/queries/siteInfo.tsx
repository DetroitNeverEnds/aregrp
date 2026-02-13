import { useQuery } from '@tanstack/react-query';
import { siteInfo } from '../api/handlers/siteSettings/info';

export const useSiteInfo = () => {
    return useQuery({
        queryKey: ['site-info'],
        queryFn: () =>
            siteInfo({
                params: undefined,
                body: undefined,
            }),
    });
};
