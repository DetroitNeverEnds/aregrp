import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useTypedSearchParams } from './useTypedSearchParams';

const createWrapper = (initialEntries: string[] = ['/']) => {
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
    };
};

describe('useTypedSearchParams', () => {
    it('возвращает типизированные параметры из URL', () => {
        const parser = (raw: Record<string, string | undefined>) => ({
            page: Number(raw.page) || 1,
            query: raw.query ?? '',
        });

        const { result } = renderHook(() => useTypedSearchParams(parser), {
            wrapper: createWrapper(['/?page=5&query=test']),
        });

        const [params] = result.current;
        expect(params).toEqual({ page: 5, query: 'test' });
    });

    it('возвращает значения по умолчанию при пустом URL', () => {
        const parser = (raw: Record<string, string | undefined>) => ({
            page: Number(raw.page) || 1,
            query: raw.query ?? '',
        });

        const { result } = renderHook(() => useTypedSearchParams(parser), {
            wrapper: createWrapper(['/']),
        });

        const [params] = result.current;
        expect(params).toEqual({ page: 1, query: '' });
    });

    it('setSearchParams обновляет параметры', async () => {
        const parser = (raw: Record<string, string | undefined>) => ({
            floor: Number(raw.floor) || 1,
        });

        const { result } = renderHook(() => useTypedSearchParams(parser), {
            wrapper: createWrapper(['/?floor=2']),
        });

        const [, rawParams, setSearchParams] = result.current;
        expect(result.current[0]).toEqual({ floor: 2 });

        await act(async () => {
            setSearchParams({ ...rawParams, floor: '3' });
        });

        expect(result.current[0]).toEqual({ floor: 3 });
    });

    it('rawParams содержит все параметры из URL', () => {
        const parser = (raw: Record<string, string | undefined>) => ({
            a: raw.a ?? '',
        });

        const { result } = renderHook(() => useTypedSearchParams(parser), {
            wrapper: createWrapper(['/?a=1&b=2&c=3']),
        });

        const [, rawParams] = result.current;
        expect(rawParams).toEqual({ a: '1', b: '2', c: '3' });
    });
});
