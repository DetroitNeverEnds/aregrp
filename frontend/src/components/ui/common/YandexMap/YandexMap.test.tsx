import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { YandexMap } from './YandexMap';

describe('YandexMap', () => {
    let mockMap: any;
    let MockMapConstructor: any;
    let MockPlacemarkConstructor: any;

    beforeEach(() => {
        // Мокаем Yandex Maps API
        mockMap = {
            geoObjects: {
                add: vi.fn(),
                remove: vi.fn(),
                removeAll: vi.fn(),
            },
            setCenter: vi.fn().mockResolvedValue(undefined),
            destroy: vi.fn(),
        };

        // Создаем шпионов для конструкторов
        MockMapConstructor = vi.fn(function (this: any) {
            this.geoObjects = mockMap.geoObjects;
            this.setCenter = mockMap.setCenter;
            this.destroy = mockMap.destroy;
        });

        MockPlacemarkConstructor = vi.fn();

        window.ymaps = {
            ready: vi.fn(callback => callback()),
            Map: MockMapConstructor,
            Placemark: MockPlacemarkConstructor,
        };
    });

    afterEach(() => {
        delete window.ymaps;
    });

    it('рендерит контейнер карты', () => {
        const { container } = render(<YandexMap markerCoordinates={[55.751574, 37.573856]} />);
        const mapElement = container.querySelector('div');
        expect(mapElement).toBeInTheDocument();
    });

    it('показывает состояние загрузки', () => {
        delete window.ymaps;
        render(<YandexMap markerCoordinates={[55.751574, 37.573856]} />);
        expect(screen.getByText('Загрузка карты...')).toBeInTheDocument();
    });

    it('инициализирует карту с правильными параметрами', async () => {
        render(
            <YandexMap
                markerCoordinates={[55.751574, 37.573856]}
                zoom={15}
                center={[55.751574, 37.573856]}
            />,
        );

        await waitFor(() => {
            expect(window.ymaps?.Map).toHaveBeenCalledWith(
                expect.any(HTMLElement),
                expect.objectContaining({
                    center: [55.751574, 37.573856],
                    zoom: 15,
                }),
            );
        });
    });

    it('создает метку с правильными параметрами', async () => {
        render(
            <YandexMap
                markerCoordinates={[55.751574, 37.573856]}
                markerHint="Test Hint"
                markerBalloon="Test Balloon"
            />,
        );

        await waitFor(() => {
            expect(window.ymaps?.Placemark).toHaveBeenCalledWith(
                [55.751574, 37.573856],
                expect.objectContaining({
                    hintContent: 'Test Hint',
                    balloonContent: 'Test Balloon',
                }),
                expect.objectContaining({
                    preset: 'islands#redDotIcon',
                }),
            );
        });
    });

    it('применяет дополнительный CSS класс', () => {
        const { container } = render(
            <YandexMap markerCoordinates={[55.751574, 37.573856]} className="custom-class" />,
        );
        const mapElement = container.querySelector('.custom-class');
        expect(mapElement).toBeInTheDocument();
    });

    it('использует координаты метки как центр по умолчанию', async () => {
        render(<YandexMap markerCoordinates={[55.751574, 37.573856]} />);

        await waitFor(() => {
            expect(window.ymaps?.Map).toHaveBeenCalledWith(
                expect.any(HTMLElement),
                expect.objectContaining({
                    center: [55.751574, 37.573856],
                }),
            );
        });
    });
});
