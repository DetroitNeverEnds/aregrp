/**
 * Базовая схема медиа (OpenAPI: BaseMediaItemOut)
 */
export interface BaseMediaItem {
    type: 'photo' | 'video';
    url: string;
}
