import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { OutletContext } from '../components/ui/layout/MainLayout/Layout';
import type { HeaderProps } from '../components/ui/layout/MainLayout/Header';

export const useHeaderSettings = (h: HeaderProps) => {
    const { setHeaderSettings } = useOutletContext<OutletContext>();
    useEffect(() => {
        setHeaderSettings(h);
    }, [h, setHeaderSettings]);
};
