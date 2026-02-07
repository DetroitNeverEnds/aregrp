/**
 * Динамическая загрузка Яндекс.Карт API с использованием переменной окружения
 */

const YANDEX_MAPS_API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY;

if (!YANDEX_MAPS_API_KEY) {
    console.error('VITE_YANDEX_MAPS_API_KEY не установлен. Пожалуйста, добавьте его в .env файл.');
}

/**
 * Загружает скрипт Яндекс.Карт API
 * @param lang - Язык интерфейса (по умолчанию 'en_US')
 * @returns Promise, который резолвится когда скрипт загружен
 */
export function loadYandexMapsScript(lang: string = 'en_US'): Promise<void> {
    return new Promise((resolve, reject) => {
        // Проверяем, не загружен ли уже скрипт
        if (document.querySelector('script[src*="yandex-maps-api"]')) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = `/yandex-maps-api/v3/?apikey=${YANDEX_MAPS_API_KEY}&lang=${lang}`;
        script.async = true;

        script.onload = () => {
            resolve();
        };

        script.onerror = () => {
            reject(new Error('Не удалось загрузить Яндекс.Карты API'));
        };

        document.head.appendChild(script);
    });
}
