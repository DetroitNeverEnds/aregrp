/**
 * Типы для обратной связи (OpenAPI: FeedbackCreateIn, FeedbackOut)
 */

export interface FeedbackCreateIn {
    name: string;
    email?: string;
    phone: string;
    subject: string;
    message?: string;
}

export interface FeedbackOut {
    id: number;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: string;
    created_at: string;
}
