/**
 * Типы для Яндекс.Карт API 2.1
 */

declare namespace ymaps {
    interface IMapState {
        center: [number, number];
        zoom: number;
        controls?: string[];
        type?: string;
    }

    interface IMapOptions {
        duration?: number;
    }

    interface IPlacemarkProperties {
        hintContent?: string;
        balloonContent?: string;
        iconContent?: string;
    }

    interface IPlacemarkOptions {
        preset?: string;
        iconLayout?: string;
        iconImageHref?: string;
        iconImageSize?: [number, number];
        iconImageOffset?: [number, number];
    }

    interface IGeoObjectCollection {
        add(object: Placemark): void;
        remove(object: Placemark): void;
        removeAll(): void;
    }

    class Map {
        constructor(element: HTMLElement, state: IMapState, options?: any);
        geoObjects: IGeoObjectCollection;
        setCenter(center: [number, number], zoom?: number, options?: IMapOptions): Promise<void>;
        destroy(): void;
    }

    class Placemark {
        constructor(
            coordinates: [number, number],
            properties?: IPlacemarkProperties,
            options?: IPlacemarkOptions,
        );
    }

    function ready(callback: () => void): void;
}

interface Window {
    ymaps?: typeof ymaps;
}
