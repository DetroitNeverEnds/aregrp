import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { Benefits } from '@/components/ui/cards/Benefits/Benefits';
import { FeedbackFormRow } from '@/components/ui/layout/FeedbackFormRow';
import { Page } from '@/components/ui/layout/Page/Page';
import { QueryBoundary } from '@/components/ui/layout/QueryBoundary/QueryBoundary';
import { VerticalMainContainer } from '@/components/ui/layout/VerticalMainContainer';
import { ErrorLoading } from '@/components/ui/layout/ErrorLoading/ErrorLoading';
import { useBuildingDetail } from '@/queries';

import { BuildingContent } from './BuildingPage.components';
import { useEffect } from 'react';

type Params = { buildingUuid: string };

export const BuildingPage = () => {
    const { t } = useTranslation();
    const { buildingUuid } = useParams<Params>();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [buildingUuid]);

    const buildingDetailQ = useBuildingDetail(buildingUuid || '');

    return (
        <Page>
            <VerticalMainContainer>
                {buildingUuid ? (
                    <QueryBoundary query={buildingDetailQ} Component={BuildingContent} />
                ) : (
                    <ErrorLoading message={t('errors.somethingWrong')} />
                )}
                <Benefits variant="sale" />
                <FeedbackFormRow />
            </VerticalMainContainer>
        </Page>
    );
};
