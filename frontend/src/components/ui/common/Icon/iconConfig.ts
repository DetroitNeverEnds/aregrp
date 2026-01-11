// Импорт всех иконок
import ArrowButton from '@/icons/arrow_button.svg?react';
import ArrowNarrowDown from '@/icons/arrow-narrow-down.svg?react';
import ArrowNarrowLeft from '@/icons/arrow-narrow-left.svg?react';
import ArrowNarrowRight from '@/icons/arrow-narrow-right.svg?react';
import Benefit1 from '@/icons/benefit_1.svg?react';
import Benefit2 from '@/icons/benefit_2.svg?react';
import Benefit3 from '@/icons/benefit_3.svg?react';
import Benefit4 from '@/icons/benefit_4.svg?react';
import Benefit5 from '@/icons/benefit_5.svg?react';
import Benefit6 from '@/icons/benefit_6.svg?react';
import Benefit7 from '@/icons/benefit_7.svg?react';
import Benefit8 from '@/icons/benefit_8.svg?react';
import Benefit9 from '@/icons/benefit_9.svg?react';
import Benefit10 from '@/icons/benefit_10.svg?react';
import Benefit11 from '@/icons/benefit_11.svg?react';
import Benefit12 from '@/icons/benefit_12.svg?react';
import Check from '@/icons/check.svg?react';
import ChevronDown from '@/icons/chevron-down.svg?react';
import ChevronLeft from '@/icons/chevron-left.svg?react';
import ChevronRight from '@/icons/chevron-right.svg?react';
import ChevronUp from '@/icons/chevron-up.svg?react';
import DotsMenu from '@/icons/dots_menu.svg?react';
import DotsTag from '@/icons/dots_tag.svg?react';
import DownloadRounded from '@/icons/download-rounded.svg?react';
import EyeSlash from '@/icons/eye-slash.svg?react';
import Eye from '@/icons/eye.svg?react';
import Loader from '@/icons/loader.svg?react';
import MailSimple from '@/icons/mail-simple.svg?react';
import MarkerPin from '@/icons/marker-pin.svg?react';
import Menu from '@/icons/menu.svg?react';
import Minus from '@/icons/minus.svg?react';
import Plus from '@/icons/plus.svg?react';
import Refresh from '@/icons/refresh.svg?react';
import Regulator from '@/icons/regulator.svg?react';
import Sample from '@/icons/sample.svg?react';
import Search from '@/icons/search.svg?react';
import Settings from '@/icons/settings.svg?react';
import SwitchVertical from '@/icons/switch-vertical.svg?react';
import UserSimple from '@/icons/user-simple.svg?react';
import WalletBuy from '@/icons/wallet-buy.svg?react';
import XClose from '@/icons/x-close.svg?react';
import XmarkGrayCircle from '@/icons/xmark-gray-circle.svg?react';

/**
 * Маппинг всех доступных иконок
 * Ключ - название иконки, значение - React компонент SVG
 */
export const iconMap = {
    'arrow-button': ArrowButton,
    'arrow-narrow-down': ArrowNarrowDown,
    'arrow-narrow-left': ArrowNarrowLeft,
    'arrow-narrow-right': ArrowNarrowRight,
    'benefit-1': Benefit1,
    'benefit-2': Benefit2,
    'benefit-3': Benefit3,
    'benefit-4': Benefit4,
    'benefit-5': Benefit5,
    'benefit-6': Benefit6,
    'benefit-7': Benefit7,
    'benefit-8': Benefit8,
    'benefit-9': Benefit9,
    'benefit-10': Benefit10,
    'benefit-11': Benefit11,
    'benefit-12': Benefit12,
    check: Check,
    'chevron-down': ChevronDown,
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
    'chevron-up': ChevronUp,
    'dots-menu': DotsMenu,
    'dots-tag': DotsTag,
    'download-rounded': DownloadRounded,
    'eye-slash': EyeSlash,
    eye: Eye,
    loader: Loader,
    'mail-simple': MailSimple,
    'marker-pin': MarkerPin,
    menu: Menu,
    minus: Minus,
    plus: Plus,
    refresh: Refresh,
    regulator: Regulator,
    sample: Sample,
    search: Search,
    settings: Settings,
    'switch-vertical': SwitchVertical,
    'user-simple': UserSimple,
    'wallet-buy': WalletBuy,
    'x-close': XClose,
    'xmark-gray-circle': XmarkGrayCircle,
} as const;

/**
 * Тип для названий иконок, автоматически генерируется из ключей iconMap
 */
export type IconName = keyof typeof iconMap;

/**
 * Массив всех доступных названий иконок
 */
export const iconNames = Object.keys(iconMap) as IconName[];
