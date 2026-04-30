import { type PropsWithChildren } from 'react';
import { useSiteInfo } from '@/queries/siteInfo';
import _ from 'lodash';
import { Loader } from '@/components/ui/common/Loader';
import { useUser } from '@/queries/profile';
import { ErrorLoading } from '@/components/ui/layout/ErrorLoading/ErrorLoading';
import { useTranslation } from 'react-i18next';

export const QueryWaiter = (props: PropsWithChildren) => {
    const siteInfo = useSiteInfo();
    const user = useUser();
    const { t } = useTranslation();

    // Ждём завершения всех запросов
    if (_.some([siteInfo.isPending, user.isPending])) {
        return <Loader variant="overlay" />;
    }

    // Fail if errors (только критичные запросы)
    if (siteInfo.data?.error) {
        return (
            <ErrorLoading
                message={t(
                    `errors.${siteInfo.data.error.code}`,
                    `code: ${siteInfo.data.error.code}`,
                )}
            />
        );
    }

    return props.children;
};
