import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dropdown } from './Dropdown';
import { useState } from 'react';
import { Button } from '../Button';
import { Flex } from '../Flex';
import Text from '../Text/Text';

const meta = {
    title: 'UI/Common/Dropdown',
    component: Dropdown,
    parameters: {
        layout: 'centered',
        viewport: {
            defaultViewport: 'responsive',
        },
    },
    decorators: [
        Story => (
            <div
                style={{
                    height: '400px',
                    width: '400px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: '20px',
                }}
            >
                <Story />
            </div>
        ),
    ],
    tags: ['autodocs'],
    argTypes: {
        disabled: {
            control: 'boolean',
            description: 'Отключенное состояние',
        },
        maxHeight: {
            control: 'number',
            description: 'Максимальная высота содержимого',
        },
        matchTriggerWidth: {
            control: 'boolean',
            description: 'Должен ли dropdown соответствовать ширине триггера',
        },
    },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Базовый пример использования Dropdown с простым триггером и содержимым
 */
export const Default: Story = {
    args: {
        trigger: <Button variant="primary">Открыть меню</Button>,
        children: (
            <Flex gap={8}>
                <Text variant="14-reg">Пункт меню 1</Text>
                <Text variant="14-reg">Пункт меню 2</Text>
                <Text variant="14-reg">Пункт меню 3</Text>
            </Flex>
        ),
    },
};

/**
 * Dropdown с render function для триггера, который меняется в зависимости от состояния
 */
export const WithRenderTrigger: Story = {
    render: () => (
        <Dropdown
            trigger={isOpen => (
                <Button variant={isOpen ? 'secondary' : 'primary'}>
                    {isOpen ? 'Закрыть' : 'Открыть'} меню
                </Button>
            )}
        >
            <Flex gap={12}>
                <Text variant="14-reg">Опция 1</Text>
                <Text variant="14-reg">Опция 2</Text>
                <Text variant="14-reg">Опция 3</Text>
            </Flex>
        </Dropdown>
    ),
};

/**
 * Dropdown с render function для содержимого, которое получает функцию закрытия
 */
export const WithRenderContent: Story = {
    render: () => (
        <Dropdown trigger={<Button variant="primary">Действия</Button>}>
            {close => (
                <Flex gap={8}>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            alert('Действие 1');
                            close();
                        }}
                    >
                        Действие 1
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            alert('Действие 2');
                            close();
                        }}
                    >
                        Действие 2
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            alert('Действие 3');
                            close();
                        }}
                    >
                        Действие 3
                    </Button>
                </Flex>
            )}
        </Dropdown>
    ),
};

/**
 * Контролируемый режим - состояние управляется извне
 */
export const Controlled: Story = {
    render: () => {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <Flex gap={16}>
                <Dropdown
                    trigger={<Button variant="primary">Контролируемое меню</Button>}
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                >
                    <Flex gap={8}>
                        <Text variant="14-reg">Содержимое меню</Text>
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>
                            Закрыть
                        </Button>
                    </Flex>
                </Dropdown>

                <Button variant="secondary" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? 'Закрыть' : 'Открыть'} извне
                </Button>
            </Flex>
        );
    },
};

/**
 * Отключенное состояние
 */
export const Disabled: Story = {
    args: {
        trigger: <Button variant="primary">Отключенное меню</Button>,
        children: (
            <Flex gap={8}>
                <Text variant="14-reg">Это содержимое не будет показано</Text>
            </Flex>
        ),
        disabled: true,
    },
};

/**
 * Dropdown с ограниченной высотой и прокруткой
 */
export const WithMaxHeight: Story = {
    args: {
        trigger: <Button variant="primary">Меню с прокруткой</Button>,
        children: (
            <Flex gap={8}>
                {Array.from({ length: 20 }, (_, i) => (
                    <Text key={i} variant="14-reg">
                        Пункт меню {i + 1}
                    </Text>
                ))}
            </Flex>
        ),
        maxHeight: 200,
    },
};

/**
 * Кастомный триггер - не кнопка
 */
export const CustomTrigger: Story = {
    render: () => (
        <Dropdown
            trigger={
                <div
                    style={{
                        padding: '12px 20px',
                        background: '#f0f0f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                    }}
                >
                    <Text variant="14-med">Кликните для открытия</Text>
                </div>
            }
        >
            <Flex gap={8}>
                <Text variant="14-reg">Содержимое с кастомным триггером</Text>
            </Flex>
        </Dropdown>
    ),
};

/**
 * Dropdown без привязки к ширине триггера
 */
export const WithoutMatchingWidth: Story = {
    render: () => (
        <Dropdown
            trigger={<Button variant="primary">Маленькая кнопка</Button>}
            matchTriggerWidth={false}
        >
            <Flex gap={8} style={{ minWidth: '300px' }}>
                <Text variant="14-reg">
                    Это содержимое шире триггера, потому что matchTriggerWidth=false
                </Text>
                <Text variant="12-reg" color="gray-50">
                    Dropdown может быть любой ширины
                </Text>
            </Flex>
        </Dropdown>
    ),
};

/**
 * Комплексное содержимое с различными элементами
 */
export const ComplexContent: Story = {
    render: () => (
        <Dropdown trigger={<Button variant="primary">Профиль</Button>}>
            {close => (
                <Flex gap={16} style={{ minWidth: '250px' }}>
                    <Flex gap={4}>
                        <Text variant="16-med">Иван Иванов</Text>
                        <Text variant="12-reg" color="gray-50">
                            ivan@example.com
                        </Text>
                    </Flex>

                    <div style={{ height: '1px', background: '#e0e0e0' }} />

                    <Flex gap={8}>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                alert('Настройки');
                                close();
                            }}
                        >
                            Настройки
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                alert('Выход');
                                close();
                            }}
                        >
                            Выйти
                        </Button>
                    </Flex>
                </Flex>
            )}
        </Dropdown>
    ),
};