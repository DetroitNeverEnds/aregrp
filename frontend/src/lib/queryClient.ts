import { QueryClient } from '@tanstack/react-query';

/**
 * Глобальный экземпляр QueryClient для React Query
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 минут
        },
        mutations: {
            retry: 0,
        },
    },
});
