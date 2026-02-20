import { Header, type HeaderProps } from './Header';
import styles from './Layout.module.scss';
import { Footer } from './Footer';
import { Flex } from '../../common/Flex';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';

export type OutletContext = {
    setHeaderSettings: (h: HeaderProps) => void;
};

export const MainLayout = () => {
    const [headerSettings, setHeaderSettings] = useState<HeaderProps>({
        theme: 'light',
        breadcrumbs: [],
    });

    return (
        <Flex className={styles.root}>
            <Header {...headerSettings} />
            <div className={styles.content}>
                <Outlet context={{ setHeaderSettings }} />
            </div>
            <Footer />
        </Flex>
    );
};
