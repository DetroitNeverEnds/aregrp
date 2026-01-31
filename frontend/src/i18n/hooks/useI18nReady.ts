import { useEffect, useState } from 'react';
import i18n from '../config';

/**
 * Хук для проверки готовности i18n
 * Используется в Suspense для ожидания загрузки переводов
 *
 * @returns true когда i18n полностью инициализирован
 * @throws Promise если i18n еще не готов (для Suspense)
 */
export const useI18nReady = (): boolean => {
    const [isReady, setIsReady] = useState(() => i18n.isInitialized);

    useEffect(() => {
        if (i18n.isInitialized) {
            return;
        }

        const handleInitialized = () => {
            setIsReady(true);
        };

        i18n.on('initialized', handleInitialized);

        return () => {
            i18n.off('initialized', handleInitialized);
        };
    }, []);

    if (!isReady) {
        throw new Promise(resolve => {
            if (i18n.isInitialized) {
                resolve(true);
                return;
            }
            i18n.on('initialized', () => resolve(true));
        });
    }

    return true;
};
