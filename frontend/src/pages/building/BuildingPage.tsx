import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { Benefits } from '@/components/ui/cards/Benefits/Benefits';
import { FeedbackFormRow } from '@/components/ui/layout/FeedbackFormRow';
import { Page } from '@/components/ui/layout/Page/Page';
import { QueryBoundary } from '@/components/ui/layout/QueryBoundary/QueryBoundary';
import { VerticalMainContainer } from '@/components/ui/layout/VerticalMainContainer';
import { ErrorLoading } from '@/components/ui/layout/ErrorLoading/ErrorLoading';
import { useBuildingDetail } from '@/queries';

import { BuildingDetailBoundaryContent } from './BuildingPage.components';

type Params = { buildingUuid: string };

export const BuildingPage = () => {
    const { t } = useTranslation();
    const { buildingUuid } = useParams<Params>();

    const buildingDetailQ = useBuildingDetail(buildingUuid || '');

    if (!buildingUuid) {
        return (
            <Page>
                <VerticalMainContainer>
                    <ErrorLoading message={t('errors.somethingWrong')} />
                    <Benefits variant="sale" />
                    <FeedbackFormRow />
                </VerticalMainContainer>
            </Page>
        );
    }

    return <QueryBoundary query={buildingDetailQ} Component={BuildingDetailBoundaryContent} />;
};
