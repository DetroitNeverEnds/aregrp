/**
 * Базовая схема медиа (OpenAPI: BaseMediaItemOut)
 */
export interface BaseMediaItem {
    type: 'photo' | 'video';
    /** Превью для галереи */
    url: string;
    /** Полноразмерное фото или видео для полного просмотра */
    full_url?: string;
}
