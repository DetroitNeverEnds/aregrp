import { Header } from './Header';
import styles from './Layout.module.scss';
import { Footer } from './Footer';
import { Flex } from '../../common/Flex';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import type { BreadCrumbsDescription } from '../../common/Breadcrumbs/Breadcrumbs';

export type OutletContext = {
    setBreadcrumbs: (b: BreadCrumbsDescription | undefined) => void;
};

export const MainLayout = () => {
    const [breadcrumbs, setBreadcrumbs] = useState<BreadCrumbsDescription | undefined>([]);
    return (
        <Flex className={styles.root}>
            <Header breadcrumbs={breadcrumbs} />
            <div className={styles.content}>
                <Outlet context={{ setBreadcrumbs }} />
            </div>
            <Footer />
        </Flex>
    );
};
