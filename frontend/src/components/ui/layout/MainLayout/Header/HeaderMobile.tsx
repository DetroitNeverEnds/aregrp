import { useNavigate } from 'react-router-dom';
import FlatButton from '@/components/ui/common/FlatButton';
import { Icon } from '@/components/ui/common/Icon';
import LogoPic from '@/icons/logo/logoPic.svg?react';
import LogoText from '@/icons/logo/logoText.svg?react';
import LogoPicDark from '@/icons/logo/logoPicDark.svg?react';
import LogoTextDark from '@/icons/logo/logoTextDark.svg?react';
import { Flex } from '@/components/ui/common/Flex';
import breakpointStyles from '@/styles/breakpoint-utilities.module.scss';
import sharedStyles from './HeaderShared.module.scss';
import type { HeaderTheme } from './Header.types';

export type HeaderMobileProps = {
    theme: HeaderTheme;
    onOpenMenu: () => void;
};

export const HeaderMobile = ({ theme, onOpenMenu }: HeaderMobileProps) => {
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    return (
        <Flex
            direction="row"
            align="center"
            justify="between"
            fullWidth
            gap={4}
            className={breakpointStyles['mobile-only']}
        >
            <div className={sharedStyles.mobileBar__spacer} />
            <Flex direction="row" align="center" gap={16} onClick={() => navigate('/')}>
                {isDark ? <LogoPicDark /> : <LogoPic />}
                {isDark ? <LogoTextDark /> : <LogoText />}
            </Flex>
            <FlatButton type="button" onClick={onOpenMenu} className={sharedStyles.headerIconBtn}>
                <Icon name="menu" size={24} color={isDark ? 'gray-0' : 'gray-100'} />
            </FlatButton>
        </Flex>
    );
};
