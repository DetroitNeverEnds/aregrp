import type { Meta, StoryObj } from '@storybook/react';
import { YandexMap } from './YandexMap';

const meta = {
    title: 'UI/Common/YandexMap',
    component: YandexMap,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'Компонент для отображения Яндекс.Карт с возможностью добавления меток. Использует API Яндекс.Карт 2.1.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        markerCoordinates: {
            description: 'Координаты метки [широта, долгота]',
            control: 'object',
        },
        zoom: {
            description: 'Уровень масштабирования карты (0-19)',
            control: { type: 'range', min: 0, max: 19, step: 1 },
        },
        center: {
            description: 'Координаты центра карты [широта, долгота]',
            control: 'object',
        },
        markerHint: {
            description: 'Текст подсказки при наведении на метку',
            control: 'text',
        },
        markerBalloon: {
            description: 'Текст в балуне метки (поддерживает HTML)',
            control: 'text',
        },
        apiKey: {
            description: 'API ключ Яндекс.Карт',
            control: 'text',
        },
        className: {
            description: 'Дополнительный CSS класс',
            control: 'text',
        },
    },
} satisfies Meta<typeof YandexMap>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Базовый пример карты с меткой в центре Москвы
 */
export const Default: Story = {
    args: {
        markerCoordinates: [55.751574, 37.573856],
        zoom: 10,
        markerHint: 'Москва',
        markerBalloon: '<strong>Москва</strong><br/>Столица России',
    },
    decorators: [
        Story => (
            <div style={{ width: '100%', height: '500px' }}>
                <Story />
            </div>
        ),
    ],
};

/**
 * Карта с высоким уровнем масштабирования
 */
export const ZoomedIn: Story = {
    args: {
        markerCoordinates: [55.751574, 37.573856],
        zoom: 15,
        markerHint: 'Красная площадь',
        markerBalloon: '<strong>Красная площадь</strong><br/>Центр Москвы',
    },
    decorators: [
        Story => (
            <div style={{ width: '100%', height: '500px' }}>
                <Story />
            </div>
        ),
    ],
};

/**
 * Карта с пользовательским центром
 */
export const CustomCenter: Story = {
    args: {
        markerCoordinates: [55.751574, 37.573856],
        center: [55.755, 37.58],
        zoom: 12,
        markerHint: 'Метка',
        markerBalloon: 'Метка находится не в центре карты',
    },
    decorators: [
        Story => (
            <div style={{ width: '100%', height: '500px' }}>
                <Story />
            </div>
        ),
    ],
};

/**
 * Карта Санкт-Петербурга
 */
export const SaintPetersburg: Story = {
    args: {
        markerCoordinates: [59.9343, 30.3351],
        zoom: 12,
        markerHint: 'Санкт-Петербург',
        markerBalloon: '<strong>Санкт-Петербург</strong><br/>Культурная столица России',
    },
    decorators: [
        Story => (
            <div style={{ width: '100%', height: '500px' }}>
                <Story />
            </div>
        ),
    ],
};

/**
 * Компактная карта
 */
export const Compact: Story = {
    args: {
        markerCoordinates: [55.751574, 37.573856],
        zoom: 10,
        markerHint: 'Москва',
    },
    decorators: [
        Story => (
            <div style={{ width: '400px', height: '300px' }}>
                <Story />
            </div>
        ),
    ],
};

/**
 * Карта во всю ширину
 */
export const FullWidth: Story = {
    args: {
        markerCoordinates: [55.751574, 37.573856],
        zoom: 10,
        markerHint: 'Москва',
        markerBalloon: '<strong>Москва</strong>',
    },
    decorators: [
        Story => (
            <div style={{ width: '100%', height: '400px' }}>
                <Story />
            </div>
        ),
    ],
};
