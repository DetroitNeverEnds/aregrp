import { api } from '../../base/api';

export type InvestorSettingsOut = {
    document_1?: string | null;
    document_2?: string | null;
    document_3?: string | null;
};

export const siteInvestorSettings = api.get<void, InvestorSettingsOut>('/site-settings/investors');
