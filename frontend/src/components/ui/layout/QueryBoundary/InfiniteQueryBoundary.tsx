import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Loader } from '@/components/ui/common/Loader';
import { ErrorLoading } from '@/components/ui/layout/ErrorLoading/ErrorLoading';

type QueryPage<TItem> = { data?: { items: TItem[] }; error?: { code: string; detail?: string } };

type InfiniteQueryBoundaryProps<TItem> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: UseInfiniteQueryResult<any>;
    children: (props: {
        items: TItem[];
        loadMore?: () => void;
        hasNextPage: boolean;
        isFetchingNextPage: boolean;
    }) => ReactNode;
    loadingFallback?: ReactNode;
    onRetry?: 'default' | (() => void);
};

export function InfiniteQueryBoundary<TItem>(props: InfiniteQueryBoundaryProps<TItem>) {
    const { query, children, loadingFallback, onRetry } = props;

    const { t } = useTranslation();

    const handleRetry = () => {
        if (!onRetry) return;
        if (onRetry === 'default') {
            query.refetch();
        } else {
            onRetry();
        }
    };

    const pages = (query.data?.pages ?? []) as QueryPage<TItem>[];
    const items = pages.flatMap(page => page.data?.items ?? []);
    const hasNextPage = query.hasNextPage ?? false;
    const isFetchingNextPage = query.isFetchingNextPage ?? false;
    const firstPageError = pages[0]?.error;

    if (query.isFetching && items.length === 0) {
        return loadingFallback ?? <Loader />;
    }

    if (firstPageError) {
        return (
            <ErrorLoading
                message={t(`errors.${firstPageError.code}`, `Error: ${firstPageError.detail}`)}
                onRetry={handleRetry}
            />
        );
    }

    return (
        <>
            {children({
                items,
                loadMore: hasNextPage ? () => query.fetchNextPage() : undefined,
                hasNextPage,
                isFetchingNextPage,
            })}
        </>
    );
}
