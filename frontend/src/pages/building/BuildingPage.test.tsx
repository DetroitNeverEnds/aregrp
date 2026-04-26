import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BuildingPage } from './BuildingPage';
import * as queries from '@/queries';

vi.mock('@/hooks/useLayoutSettings', () => ({
    useLayoutSettings: vi.fn(),
}));

vi.mock('@/queries', async importOriginal => {
    const actual = await importOriginal<typeof import('@/queries')>();
    return {
        ...actual,
        useBuildingDetail: vi.fn(),
        usePremisesInfinite: vi.fn(),
        useFloor: vi.fn(),
        usePremiseDetail: vi.fn(),
    };
});

const mockUseBuildingDetail = vi.mocked(queries.useBuildingDetail);
const mockUsePremisesInfinite = vi.mocked(queries.usePremisesInfinite);
const mockUseFloor = vi.mocked(queries.useFloor);
const mockUsePremiseDetail = vi.mocked(queries.usePremiseDetail);

const createWrapper = (initialEntries: string[] = ['/building/test-uuid']) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });

    return function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={initialEntries}>
                    <Routes>
                        <Route path="/building/:buildingUuid" element={children} />
                        <Route path="/building" element={children} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );
    };
};

const mockBuildingDetail = {
    uuid: 'test-uuid',
    title: 'Тестовое здание',
    address: 'ул. Тестовая 1',
    total_floors: 3,
    media: [],
    media_categories: ['Фото', 'Планировки'],
};

describe('BuildingPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseBuildingDetail.mockReturnValue({
            data: undefined,
            isPending: true,
            error: null,
        } as ReturnType<typeof queries.useBuildingDetail>);
        mockUsePremisesInfinite.mockReturnValue({
            data: {
                pages: [{ data: { items: [], page: 1, total: 0, page_size: 6, total_pages: 0 } }],
            },
            isFetching: false,
            isFetchingNextPage: false,
            hasNextPage: false,
            fetchNextPage: vi.fn(),
        } as ReturnType<typeof queries.usePremisesInfinite>);
        mockUseFloor.mockReturnValue({
            data: { data: { premises: [], schema_svg: '' } },
            isPending: false,
            error: null,
        } as ReturnType<typeof queries.useFloor>);
        mockUsePremiseDetail.mockReturnValue({
            data: undefined,
            isPending: false,
            error: null,
        } as ReturnType<typeof queries.usePremiseDetail>);
    });

    it('показывает Loader при загрузке', () => {
        mockUseBuildingDetail.mockReturnValue({
            data: undefined,
            isPending: true,
            error: null,
        } as ReturnType<typeof queries.useBuildingDetail>);

        const { container } = render(<BuildingPage />, {
            wrapper: createWrapper(['/building/test-uuid']),
        });

        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('показывает ErrorLoading при отсутствии buildingUuid', () => {
        render(<BuildingPage />, {
            wrapper: createWrapper(['/building']),
        });

        expect(screen.getByText(/Что-то пошло не так/)).toBeInTheDocument();
    });

    it('рендерит контент здания при успешной загрузке', () => {
        mockUseBuildingDetail.mockReturnValue({
            data: { data: mockBuildingDetail },
            isPending: false,
            error: null,
        } as ReturnType<typeof queries.useBuildingDetail>);

        render(<BuildingPage />, {
            wrapper: createWrapper(['/building/test-uuid']),
        });

        const nameEls = screen.getAllByText(/Тестовое здание/);
        expect(nameEls.length).toBeGreaterThan(0);
    });

    it('показывает ErrorLoading при ошибке API', () => {
        mockUseBuildingDetail.mockReturnValue({
            data: {
                error: {
                    code: 'SITE_SETTINGS_NOT_FOUND',
                    detail: 'Not found',
                    status: 404,
                    title: 'Error',
                    type: 'about:blank',
                    instance: null,
                },
            },
            isPending: false,
            error: null,
        } as ReturnType<typeof queries.useBuildingDetail>);

        render(<BuildingPage />, {
            wrapper: createWrapper(['/building/test-uuid']),
        });

        expect(screen.getByText(/Настройки сайта не найдены/)).toBeInTheDocument();
    });
});
