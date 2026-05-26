const YANDEX_METRIKA_ID = Number(import.meta.env.VITE_YANDEX_METRIKA_ID);
const METRIKA_SCRIPT_URL = 'https://mc.yandex.ru/metrika/tag.js';

let loadPromise: Promise<void> | null = null;
let isInitialized = false;

function isMetrikaEnabled(): boolean {
    return Number.isFinite(YANDEX_METRIKA_ID) && YANDEX_METRIKA_ID > 0;
}

function ensureYmQueue(): void {
    if (typeof window.ym === 'function') {
        return;
    }

    const queue: unknown[][] = [];

    window.ym = (...args: unknown[]) => {
        queue.push(args);
    };

    window.ym.a = queue;
}

export function loadYandexMetrikaScript(): Promise<void> {
    if (!isMetrikaEnabled()) {
        return Promise.resolve();
    }

    if (loadPromise) {
        return loadPromise;
    }

    ensureYmQueue();

    loadPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${METRIKA_SCRIPT_URL}"]`);

        if (existingScript) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = METRIKA_SCRIPT_URL;
        script.async = true;

        script.onload = () => {
            resolve();
        };

        script.onerror = () => {
            loadPromise = null;
            reject(new Error('Не удалось загрузить скрипт Яндекс Метрики'));
        };

        document.head.appendChild(script);
    });

    return loadPromise;
}

export function initYandexMetrika(): void {
    if (!isMetrikaEnabled() || isInitialized) {
        return;
    }

    window.ym(YANDEX_METRIKA_ID, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
    });

    isInitialized = true;
}

export function trackYandexMetrikaPageView(url: string): void {
    if (!isMetrikaEnabled() || !isInitialized) {
        return;
    }

    window.ym(YANDEX_METRIKA_ID, 'hit', url);
}
