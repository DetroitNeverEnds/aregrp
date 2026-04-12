import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Loader } from '@/components/ui/common/Loader';
import { ErrorLoading } from '@/components/ui/layout/ErrorLoading/ErrorLoading';
import type { QueryResult } from '@/lib/queryHelpers';

type SharedProps = {
    loadingFallback?: ReactNode;
    errorMessage?: string;

    /**
     * Если передан — показываем его вместо стандартной ошибки.
     */
    customError?: ReactNode;

    /**
     * Поведение кнопки "повторить" в ErrorLoading.
     * - 'default': refetch текущего query
     * - callback: кастомная логика
     */
    onRetry?: 'default' | (() => void);
};

type Props<TData> = SharedProps & {
    query: UseQueryResult<QueryResult<TData>, Error>;
    render: (data: TData) => ReactNode;
};

export function QueryBoundary<TData>(props: Props<TData>) {
    const { query, render, loadingFallback, errorMessage, customError, onRetry } = props;

    const { t } = useTranslation();

    const handleRetry = () => {
        if (!onRetry) {
            return;
        }

        if (onRetry === 'default') {
            query.refetch();
        } else {
            onRetry();
        }
    };

    if (query.isPending) {
        return loadingFallback ?? <Loader />;
    }

    const apiError = query.data?.error;
    if (apiError) {
        return (
            customError ?? (
                <ErrorLoading
                    message={
                        errorMessage || t(`errors.${apiError.code}`, `Error: ${apiError.detail}`)
                    }
                    onRetry={handleRetry}
                />
            )
        );
    }

    return render(query.data!.data!);
}
