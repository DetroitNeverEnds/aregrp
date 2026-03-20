import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { Icon } from '@/components/ui/common/Icon';
import { VerticalMainContainer } from '@/components/ui/layout/VerticalMainContainer';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import type { LayoutSettings } from '@/components/ui/layout/MainLayout/Layout';
import { useUser } from '@/queries/profile';
import { useLogoutMutation } from '@/mutations/auth';
import { useQueryClient } from '@tanstack/react-query';

import styles from './Profile.module.scss';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';
import _ from 'lodash';
import FlatButton from '@/components/ui/common/FlatButton';
import { Card } from '@/components/ui/common/Card/Card';
import { Page } from '@/components/ui/layout/Page/Page';
import { QueryBoundary } from '@/components/ui/layout/QueryBoundary/QueryBoundary';
import type { UserData } from '@/api';

// const displayFallback = (value: string | null | undefined, fallback: string) =>
//     value?.trim() ? value : fallback;

type MenuItems = {
    label: string;
    icon: string;
    key: string;
};
type MenuItemsParams = {
    section?: string;
};
const parseMenuItems = (params: Record<string, string | undefined>): MenuItemsParams => {
    return {
        section: params.section,
    };
};

export const ProfileContent = ({ data: user }: { data: UserData }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const layoutSettings = useMemo<LayoutSettings>(
        () => ({
            header: {
                theme: 'light',
                breadcrumbs: [
                    { to: '/', label: t('bc.main') },
                    { to: '/profile', label: t('bc.profile') },
                ],
            },
            mainContentBackground: 'gray-10',
        }),
        [t],
    );
    useLayoutSettings(layoutSettings);

    const menuItems: MenuItems[] = useMemo(
        () => [
            {
                label: t('pages.profile.menuProfile'),
                icon: 'key',
                key: 'profile',
            },
            {
                label: t('pages.profile.menuObjects'),
                icon: 'objects',
                key: 'objects',
            },
            {
                label: t('pages.profile.menuBooking'),
                icon: 'booking',
                key: 'booking',
            },
        ],
        [t],
    );

    const [searchParams] = useTypedSearchParams<MenuItemsParams>(parseMenuItems);

    const currentItem = useMemo(() => {
        return searchParams.section || 'profile';
    }, [searchParams]);

    const logoutMutation = useLogoutMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', 'user'] });
            navigate('/');
        },
    });

    const userTypeLabel = t(`pages.profile.userType.${user.user_type}`, {
        defaultValue: user.user_type,
    });
    const sidebarTitle =
        (user.user_type === 'agent' ? user.organization_name : user.full_name) || '-';

    const infoItems = useMemo(
        () =>
            user.user_type === 'agent'
                ? [
                      {
                          label: t('pages.profile.orgNameLabel'),
                          value: user.organization_name,
                      },
                      {
                          label: t('pages.profile.fullNameLabel'),
                          value: user.full_name,
                      },
                      {
                          label: t('pages.profile.phoneLabel'),
                          value: user.phone,
                      },
                      {
                          label: t('pages.profile.innLabel'),
                          value: user.inn,
                      },
                  ]
                : [
                      {
                          label: t('pages.profile.fullNameLabel'),
                          value: user.full_name,
                      },
                      {
                          label: t('pages.profile.phoneLabel'),
                          value: user.phone,
                      },
                  ],
        [user, t],
    );

    return (
        <VerticalMainContainer className={styles.page}>
            <Flex direction="row" gap={60} fullWidth align="start">
                {/* Menu Items */}
                <Flex direction="column" className={styles.menu} fullWidth align="start">
                    <Flex direction="column" className={styles.menu__head} align="start" fullWidth>
                        <Flex direction="row" gap={12} align="start" fullWidth>
                            <Icon name="key" size={20} color="gray-0" />
                            <Flex direction="column" gap={16} align="start" fullWidth>
                                <Flex direction="column" gap={8} align="start">
                                    <Text variant="16-med" color="gray-0">
                                        {sidebarTitle}
                                    </Text>
                                    <Text variant="12-reg" color="gray-50">
                                        {userTypeLabel}
                                    </Text>
                                </Flex>
                                <Text variant="12-reg" color="gray-0">
                                    {user.email}
                                </Text>
                            </Flex>
                        </Flex>
                    </Flex>
                    <Flex direction="column" gap={8} fullWidth align="start">
                        <Flex direction="column" fullWidth>
                            {menuItems.map(item => (
                                <RouterLink
                                    key={item.key}
                                    to={`/profile?section=${item.key}`}
                                    className={classNames(styles.menu__body__item, {
                                        [styles.menu__body__item__active]: currentItem === item.key,
                                    })}
                                >
                                    <Text variant="14-reg" color="gray-100">
                                        {item.label}
                                    </Text>
                                </RouterLink>
                            ))}
                        </Flex>
                        <FlatButton
                            className={styles.menu__logout}
                            onClick={() => logoutMutation.mutate()}
                            disabled={logoutMutation.isPending}
                        >
                            <Icon name="exit" size={14} aria-hidden />
                            <Text variant="12-med" color="gray-100">
                                {t('pages.profile.logout')}
                            </Text>
                        </FlatButton>
                    </Flex>
                </Flex>

                <Card
                    size="xl"
                    direction="column"
                    gap={30}
                    className={styles.mainPanel}
                    align="start"
                >
                    <Flex direction="row" justify="between" align="start" fullWidth>
                        <Text variant="24-med">{t('pages.profile.mainInfo')}</Text>
                        <FlatButton>
                            <Flex direction="row" gap={8} align="center">
                                <Icon name="edit" size={14} aria-hidden />
                                <Text variant="12-med" color="gray-70">
                                    {t('pages.profile.edit')}
                                </Text>
                            </Flex>
                        </FlatButton>
                    </Flex>
                    <Flex direction="column" gap={24} align="start" fullWidth>
                        {infoItems.map(item => (
                            <Flex direction="row" gap={8} align="start" key={item.label}>
                                <Text variant="14-reg">
                                    {item.label}: {item.value}
                                </Text>
                            </Flex>
                        ))}
                    </Flex>
                </Card>
            </Flex>
        </VerticalMainContainer>
    );
};

export const Profile = () => {
    const userQ = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (userQ.data && !userQ.data.data) {
            navigate(`/auth/login?redirect=${encodeURIComponent('/profile')}`, { replace: true });
        }
    }, [navigate, userQ.data]);

    return (
        <Page>
            <QueryBoundary query={userQ} Component={ProfileContent} />
        </Page>
    );
};
