import React, { Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useI18nReady } from '../../i18n/hooks';
import { queryClient } from '../../lib/queryClient';
import '../../lib/apiClient';
import { Loader } from '../ui/common/Loader';
import styles from './AppWrapper.module.scss';
import { QueryWaiter } from './queryWaiter';

interface AppWrapperProps {
    children: React.ReactNode;
}

/**
 * Компонент-страж для проверки готовности i18n
 * Используется внутри Suspense для блокировки рендера до загрузки переводов
 */
const I18nReadyGuard: React.FC<AppWrapperProps> = ({ children }) => {
    useI18nReady();
    return <>{children}</>;
};

/**
 * Центральная обертка приложения для всех провайдеров
 *
 * Текущий функционал:
 * - QueryClientProvider для React Query
 * - BrowserRouter для роутинга
 * - Suspense с ожиданием загрузки переводов (i18n)
 *
 * Будущие провайдеры:
 * - Redux Store Provider
 * - Theme Provider
 * - Auth Provider
 */
export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
    return (
        <Suspense
            fallback={
                <div className={styles.appWrapper__fallback}>
                    <Loader spinnerSize="lg" aria-label="Загрузка приложения" />
                </div>
            }
        >
            <I18nReadyGuard>
                <QueryClientProvider client={queryClient}>
                    <QueryWaiter>{children}</QueryWaiter>
                </QueryClientProvider>
            </I18nReadyGuard>
        </Suspense>
    );
};

export default AppWrapper;
