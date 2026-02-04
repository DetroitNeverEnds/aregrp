// Импорт всех иконок

// Outlined
import ArrowButton from '@/icons/outlined/arrow_button.svg?react';
import ArrowNarrowDown from '@/icons/outlined/arrow-narrow-down.svg?react';
import ArrowNarrowLeft from '@/icons/outlined/arrow-narrow-left.svg?react';
import ArrowNarrowRight from '@/icons/outlined/arrow-narrow-right.svg?react';
import Benefit1 from '@/icons/outlined/benefit_1.svg?react';
import Benefit2 from '@/icons/outlined/benefit_2.svg?react';
import Benefit3 from '@/icons/outlined/benefit_3.svg?react';
import Benefit4 from '@/icons/outlined/benefit_4.svg?react';
import Benefit5 from '@/icons/outlined/benefit_5.svg?react';
import Benefit6 from '@/icons/outlined/benefit_6.svg?react';
import Benefit7 from '@/icons/outlined/benefit_7.svg?react';
import Benefit8 from '@/icons/outlined/benefit_8.svg?react';
import Benefit9 from '@/icons/outlined/benefit_9.svg?react';
import Benefit10 from '@/icons/outlined/benefit_10.svg?react';
import Benefit11 from '@/icons/outlined/benefit_11.svg?react';
import Benefit12 from '@/icons/outlined/benefit_12.svg?react';
import Check from '@/icons/outlined/check.svg?react';
import ChevronDown from '@/icons/outlined/chevron-down.svg?react';
import ChevronLeft from '@/icons/outlined/chevron-left.svg?react';
import ChevronRight from '@/icons/outlined/chevron-right.svg?react';
import ChevronUp from '@/icons/outlined/chevron-up.svg?react';
import DotsMenu from '@/icons/outlined/dots_menu.svg?react';
import DotsTag from '@/icons/outlined/dots_tag.svg?react';
import DownloadRounded from '@/icons/outlined/download-rounded.svg?react';
import EyeSlash from '@/icons/outlined/eye-slash.svg?react';
import Eye from '@/icons/outlined/eye.svg?react';
import Loader from '@/icons/outlined/loader.svg?react';
import MailSimple from '@/icons/outlined/mail-simple.svg?react';
import MarkerPin from '@/icons/outlined/marker-pin.svg?react';
import Menu from '@/icons/outlined/menu.svg?react';
import Minus from '@/icons/outlined/minus.svg?react';
import Plus from '@/icons/outlined/plus.svg?react';
import Refresh from '@/icons/outlined/refresh.svg?react';
import Regulator from '@/icons/outlined/regulator.svg?react';
import Sample from '@/icons/outlined/sample.svg?react';
import Search from '@/icons/outlined/search.svg?react';
import Settings from '@/icons/outlined/settings.svg?react';
import SwitchVertical from '@/icons/outlined/switch-vertical.svg?react';
import UserSimple from '@/icons/outlined/user-simple.svg?react';
import WalletBuy from '@/icons/outlined/wallet-buy.svg?react';
import XClose from '@/icons/outlined/x-close.svg?react';
import XmarkGrayCircle from '@/icons/outlined/xmark-gray-circle.svg?react';

// bolt.svg
// city.svg
// cottage.svg
// cup.svg
// district.svg
// download.svg
// edit.svg
// exit.svg
// geolocal.svg
// key.svg
// laurel.svg
// marker-pin.svg
// medal.svg
// medical-cross.svg
// pedestal.svg
// person.svg
// phone.svg
// play.svg
// puzzle.svg
// school.svg
// search.svg
// star.svg

// Social Media
import Ajax from '@/icons/socialMedia/ayax_logo_2.svg?react';
import OK from '@/icons/socialMedia/ok_logo.svg?react';
import Telegram from '@/icons/socialMedia/telegram_logo.svg?react';
import TG from '@/icons/socialMedia/tg.svg?react';
import Viber from '@/icons/socialMedia/viber_logo.svg?react';
import VK from '@/icons/socialMedia/vk_logo.svg?react';
import Whatsapp from '@/icons/socialMedia/whatsapp_logo.svg?react';
import Youtube from '@/icons/socialMedia/youtube_logo.svg?react';

/**
 * Маппинг всех доступных иконок
 * Ключ - название иконки, значение - React компонент SVG
 */
export const iconMap = {
    // outlined
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

    // social media
    ayax: Ajax,
    ok: OK,
    telegram: Telegram,
    tg: TG,
    viber: Viber,
    vk: VK,
    whatsapp: Whatsapp,
    youtube: Youtube,
} as const;

/**
 * Тип для названий иконок, автоматически генерируется из ключей iconMap
 */
export type IconName = keyof typeof iconMap;

/**
 * Массив всех доступных названий иконок
 */
export const iconNames = Object.keys(iconMap) as IconName[];
