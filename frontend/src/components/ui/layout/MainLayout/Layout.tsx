import { Header, type HeaderProps } from './Header/Header';
import styles from './Layout.module.scss';
import { Footer } from './Footer';
import { Flex } from '../../common/Flex';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import classNames from 'classnames';

/** Фон области под хедером (main). */
export type MainLayoutContentBackground = 'gray-0' | 'gray-10';

export type LayoutSettings = {
    header: HeaderProps;
    mainContentBackground: MainLayoutContentBackground;
};

const defaultLayoutSettings: LayoutSettings = {
    header: {
        theme: 'light',
        breadcrumbs: [],
    },
    mainContentBackground: 'gray-0',
};

export type OutletContext = {
    setLayoutSettings: (s: LayoutSettings) => void;
};

export const MainLayout = () => {
    const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(defaultLayoutSettings);

    return (
        <Flex
            fullWidth
            className={classNames(
                styles.root,
                layoutSettings.mainContentBackground === 'gray-10' && styles.contentGray10,
            )}
        >
            <Header {...layoutSettings.header} />
            <div className={styles.content}>
                <Outlet context={{ setLayoutSettings }} />
            </div>
            <Footer />
        </Flex>
    );
};
