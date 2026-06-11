import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    initYandexMetrika,
    loadYandexMetrikaScript,
    trackYandexMetrikaPageView,
} from '@/lib/yandexMetrika';

export const YandexMetrika = () => {
    const location = useLocation();
    const isInitializedRef = useRef(false);

    useEffect(() => {
        loadYandexMetrikaScript()
            .then(() => {
                initYandexMetrika();
                isInitializedRef.current = true;
            })
            .catch((error: unknown) => {
                console.error(error);
            });
    }, []);

    useEffect(() => {
        if (!isInitializedRef.current) {
            return;
        }

        trackYandexMetrikaPageView(`${location.pathname}${location.search}`);
    }, [location.pathname, location.search]);

    return null;
};
