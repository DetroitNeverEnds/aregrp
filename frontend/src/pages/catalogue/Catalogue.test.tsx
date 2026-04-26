import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Catalogue } from './Catalogue';
import * as queries from '@/queries';

vi.mock('@/hooks/useLayoutSettings', () => ({
    useLayoutSettings: vi.fn(),
}));

vi.mock('@/queries', () => ({
    usePremises: vi.fn(),
}));

const mockUsePremises = vi.mocked(queries.usePremises);

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

describe('Catalogue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUsePremises.mockReturnValue({
            data: undefined,
            isFetching: false,
            error: null,
        } as ReturnType<typeof queries.usePremises>);
    });

    it('рендерит заголовок для продажи при sale_type=sale', () => {
        mockUsePremises.mockReturnValue({
            data: {
                data: { items: [], page: 1, total: 0, page_size: 12, total_pages: 0 },
            },
            isFetching: false,
            error: null,
        } as ReturnType<typeof queries.usePremises>);

        render(<Catalogue />, {
            wrapper: createWrapper([
                '/catalogue?filter=' + encodeURIComponent(JSON.stringify({ sale_type: 'sale' })),
            ]),
        });

        const saleTitles = screen.getAllByText('Продажа офисов');
        expect(saleTitles.length).toBeGreaterThan(0);
    });

    it('рендерит заголовок для аренды при sale_type=rent', () => {
        mockUsePremises.mockReturnValue({
            data: {
                data: { items: [], page: 1, total: 0, page_size: 12, total_pages: 0 },
            },
            isFetching: false,
            error: null,
        } as ReturnType<typeof queries.usePremises>);

        render(<Catalogue />, {
            wrapper: createWrapper([
                '/catalogue?filter=' + encodeURIComponent(JSON.stringify({ sale_type: 'rent' })),
            ]),
        });

        const rentTitles = screen.getAllByText('Аренда офисов');
        expect(rentTitles.length).toBeGreaterThan(0);
    });

    it('показывает Loader при загрузке', () => {
        mockUsePremises.mockReturnValue({
            data: undefined,
            isFetching: true,
            error: null,
        } as ReturnType<typeof queries.usePremises>);

        const { container } = render(<Catalogue />, { wrapper: createWrapper() });

        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('показывает сообщение об ошибке при ошибке API', () => {
        mockUsePremises.mockReturnValue({
            data: { error: { code: 'ACCOUNTS_INVALID_CREDENTIALS', detail: 'Error' } },
            isFetching: false,
            error: null,
        } as ReturnType<typeof queries.usePremises>);

        render(<Catalogue />, { wrapper: createWrapper() });

        expect(screen.getByText(/Неверный email или пароль/)).toBeInTheDocument();
    });

    it('показывает "Ничего не найдено" при пустом списке', () => {
        mockUsePremises.mockReturnValue({
            data: {
                data: { items: [], page: 1, total: 0, page_size: 12, total_pages: 0 },
            },
            isFetching: false,
            error: null,
        } as ReturnType<typeof queries.usePremises>);

        render(<Catalogue />, { wrapper: createWrapper() });

        expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
    });

    it('рендерит карточки офисов при наличии данных', () => {
        mockUsePremises.mockReturnValue({
            data: {
                data: {
                    items: [
                        {
                            uuid: '1',
                            name: 'Офис 1',
                            address: 'ул. Тестовая 1',
                            area: '50',
                            price: 1_000_000,
                            floor: 1,
                            has_tenant: false,
                            media: [],
                            building_uuid: 'b1',
                        },
                    ],
                    page: 1,
                    total: 1,
                    page_size: 12,
                    total_pages: 1,
                },
            },
            isFetching: false,
            error: null,
        } as ReturnType<typeof queries.usePremises>);

        render(<Catalogue />, { wrapper: createWrapper() });

        // Адрес отображается в карточке как "Адрес: ул. Тестовая 1"
        expect(screen.getByText('Адрес: ул. Тестовая 1')).toBeInTheDocument();
    });
});
