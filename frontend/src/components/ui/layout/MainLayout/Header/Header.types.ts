import type { BreadCrumbsDescription } from '@/components/ui/common/Breadcrumbs/Breadcrumbs';

export type HeaderTheme = 'light' | 'dark';

export type HeaderProps = {
    breadcrumbs?: BreadCrumbsDescription;
    theme: HeaderTheme;
};
