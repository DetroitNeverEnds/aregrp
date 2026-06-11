/** OpenAPI: ReferralLinkCreateIn */
export interface ReferralLinkCreateIn {
    premise_uuid: string;
    phone: string;
}

/** OpenAPI: ReferralLinkOut */
export interface ReferralLinkOut {
    code: string;
    url: string;
    premise_uuid: string;
    created_at: string;
}
