/** Медиа для галереи (самостоятельный контракт UI, без привязки к типам API). */
export type GalleryMedia = {
    type: 'photo' | 'video';
    url: string;
    full_url?: string;
};
