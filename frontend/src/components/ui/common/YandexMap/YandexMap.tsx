// import { useEffect, useRef } from 'react';
import styles from './YandexMap.module.scss';

// import { YMaps, Map } from '@pbe/react-yandex-maps';
import {
    YMap,
    YMapDefaultFeaturesLayer,
    YMapDefaultSchemeLayer,
    YMapMarker,
    // reactify,
} from '../../../../lib/yamaps';
import { YaMapsCustomization } from './customization';
import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
// import { YMapDefaultMarker } from '@yandex/ymaps3-default-ui-theme';

// import type { YMap } from '@yandex/ymaps3-types';

export type YandexMapProps = {
    /**
     * Координаты метки [широта, долгота]
     */
    markerCoordinates: [number, number];
    /**
     * Уровень масштабирования карты (0-19)
     */
    zoom?: number;
    /**
     * Координаты центра карты [широта, долгота]
     */
    center?: [number, number];
    /**
     * Текст подсказки при наведении на метку
     */
    markerHint?: string;
    /**
     * Текст в балуне метки
     */
    markerBalloon?: string;
    /**
     * API ключ Яндекс.Карт
     */
    apiKey?: string;
    /**
     * Дополнительный CSS класс
     */
    className?: string;
} & PropsWithChildren;

export const YandexMap = ({
    markerCoordinates,
    zoom = 10,
    center = undefined,
    // markerHint = '',
    // markerBalloon = '',
    apiKey,
    className,
    children,
}: YandexMapProps) => {
    return (
        <YMap
            location={{ center: center || markerCoordinates, zoom }}
            className={classNames(styles.map, className)}
            key={apiKey}
            behaviors={[]}
        >
            <YMapDefaultSchemeLayer customization={YaMapsCustomization} />
            <YMapDefaultFeaturesLayer />

            {/* <YMapDefaultMarker coordinates={markerCoordinates}>
                <div className={styles.marker}>{children}</div>
            </YMapDefaultMarker> */}
            <YMapMarker coordinates={markerCoordinates}>
                <div className={styles.marker}>{children}</div>
            </YMapMarker>
        </YMap>
    );
};
