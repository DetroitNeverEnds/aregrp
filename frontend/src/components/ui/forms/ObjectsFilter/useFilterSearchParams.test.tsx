import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFilterSearchParams } from './useFilterSearchParams';

const createWrapper = (initialEntries: string[] = ['/catalogue']) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });

    return function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
            </QueryClientProvider>
        );
    };
};

describe('useFilterSearchParams', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('возвращает filter по умолчанию при пустом URL', () => {
        const { result } = renderHook(() => useFilterSearchParams(), {
            wrapper: createWrapper(['/catalogue']),
        });

        expect(result.current.filter).toEqual({});
    });

    it('парсит filter из URL', () => {
        const filterParam = encodeURIComponent(JSON.stringify({ sale_type: 'rent', page: 2 }));
        const { result } = renderHook(() => useFilterSearchParams(), {
            wrapper: createWrapper([`/catalogue?filter=${filterParam}`]),
        });

        expect(result.current.filter).toEqual({ sale_type: 'rent', page: 2 });
    });

    it('getLinkToCatalogue возвращает корректную ссылку', () => {
        const { result } = renderHook(() => useFilterSearchParams(), {
            wrapper: createWrapper(['/catalogue']),
        });

        const link = result.current.getLinkToCatalogue({ sale_type: 'sale', page: 1 });
        expect(link).toContain('/catalogue');
        expect(link).toContain('filter=');
        expect(link).toContain('sale_type');
        expect(link).toContain('sale');
    });

    it('setFilter обновляет URL', async () => {
        const { result } = renderHook(() => useFilterSearchParams(), {
            wrapper: createWrapper(['/catalogue']),
        });

        await act(async () => {
            await result.current.setFilter({ sale_type: 'rent', order_by: 'price_asc' });
        });

        expect(result.current.filter.sale_type).toBe('rent');
        expect(result.current.filter.order_by).toBe('price_asc');
    });

    it('gotoFilter не выбрасывает ошибку', async () => {
        const { result } = renderHook(() => useFilterSearchParams(), {
            wrapper: createWrapper(['/catalogue']),
        });

        await act(async () => {
            await result.current.gotoFilter({ sale_type: 'sale' });
        });

        // gotoFilter вызывает navigate — при использовании MemoryRouter
        // навигация происходит внутри памяти, ошибок быть не должно
        expect(result.current.filter).toBeDefined();
    });
});
