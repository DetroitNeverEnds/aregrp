import { useEffect } from 'react';

/** Блокирует прокрутку страницы под оверлеем (position: fixed — работает на iOS). */
export const useBodyScrollLock = (locked: boolean) => {
    useEffect(() => {
        if (!locked) {
            return;
        }

        const scrollY = window.scrollY;
        const { body, documentElement: html } = document;
        const saved = {
            bodyOverflow: body.style.overflow,
            htmlOverflow: html.style.overflow,
            bodyPosition: body.style.position,
            bodyTop: body.style.top,
            bodyWidth: body.style.width,
        };

        body.style.overflow = 'hidden';
        html.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.width = '100%';

        return () => {
            body.style.overflow = saved.bodyOverflow;
            html.style.overflow = saved.htmlOverflow;
            body.style.position = saved.bodyPosition;
            body.style.top = saved.bodyTop;
            body.style.width = saved.bodyWidth;
            window.scrollTo(0, scrollY);
        };
    }, [locked]);
};
