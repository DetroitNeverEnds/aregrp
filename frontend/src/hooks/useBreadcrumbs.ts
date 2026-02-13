import { useEffect } from 'react';
import type { BreadCrumbsDescription } from '../components/ui/common/Breadcrumbs/Breadcrumbs';
import { useOutletContext } from 'react-router-dom';
import type { OutletContext } from '../components/ui/layout/MainLayout/Layout';

export const useBreadcrumbs = (breadcrumbs: BreadCrumbsDescription | undefined) => {
    const { setBreadcrumbs } = useOutletContext<OutletContext>();
    // console.log('called useBC', breadcrumbs);
    useEffect(() => {
        setBreadcrumbs(breadcrumbs);
    }, [setBreadcrumbs, breadcrumbs]);
};
