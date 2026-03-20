import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { LayoutSettings, OutletContext } from '../components/ui/layout/MainLayout/Layout';

export const useLayoutSettings = (settings: LayoutSettings) => {
    const { setLayoutSettings } = useOutletContext<OutletContext>();
    useEffect(() => {
        setLayoutSettings(settings);
    }, [settings, setLayoutSettings]);
};
