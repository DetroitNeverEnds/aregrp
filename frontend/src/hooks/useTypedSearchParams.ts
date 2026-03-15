import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export type SearchParamsParser<T> = (raw: Record<string, string | undefined>) => T;

/**
 * Типизированная обёртка над useSearchParams.
 * Парсит searchParams в заданный тип с помощью переданной функции.
 *
 * @param parser - функция, преобразующая сырые параметры (Record<string, string | undefined>) в типизированный объект
 * @returns [params, rawParams, setSearchParams] - типизированные параметры, сырой объект для мержа и сеттер
 */
export function useTypedSearchParams<T>(
    parser: SearchParamsParser<T>,
): [T, Record<string, string>, ReturnType<typeof useSearchParams>[1]] {
    const [searchParams, setSearchParams] = useSearchParams();

    const rawParams = useMemo(
        () => Object.fromEntries(searchParams.entries()) as Record<string, string>,
        [searchParams],
    );

    const params = useMemo(
        () => parser(rawParams as Record<string, string | undefined>),
        [parser, rawParams],
    );

    return [params, rawParams, setSearchParams];
}
