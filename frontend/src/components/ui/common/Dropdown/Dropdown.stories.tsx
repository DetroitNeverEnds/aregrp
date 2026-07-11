import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dropdown, type DropdownProps } from './Dropdown';
import { useState } from 'react';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text/Text';

function DropdownWithState({
    defaultOpened = false,
    ...props
}: Omit<DropdownProps, 'isOpened' | 'onOpenChange'> & { defaultOpened?: boolean }) {
    const [isOpened, setIsOpened] = useState(defaultOpened);

    return <Dropdown {...props} isOpened={isOpened} onOpenChange={setIsOpened} />;
}

const menuItems = (
    <Flex gap={8} align="start" direction="column">
        <Text variant="14-reg">Пункт меню 1</Text>
        <Text variant="14-reg">Пункт меню 2</Text>
        <Text variant="14-reg">Пункт меню 3</Text>
    </Flex>
);

const meta = {
    title: 'UI/Common/Dropdown',
    component: Dropdown,
    parameters: {
        layout: 'centered',
        viewport: {
            defaultViewport: 'responsive',
        },
    },
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['lg', 'sm', 'tiny'],
            description: 'Размер триггера',
        },
        disabled: {
            control: 'boolean',
            description: 'Отключенное состояние',
        },
        fullWidth: {
            control: 'boolean',
            description: 'Растянуть на всю ширину контейнера',
        },
        isError: {
            control: 'boolean',
            description: 'Состояние ошибки',
        },
        maxHeight: {
            control: 'number',
            description: 'Максимальная высота выпадающего списка',
        },
    },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <DropdownWithState trigger={<Text variant="16-reg">Выберите значение</Text>}>
            {menuItems}
        </DropdownWithState>
    ),
};

export const WithPlaceholder: Story = {
    render: () => (
        <DropdownWithState
            trigger={
                <Text variant="16-reg" color="gray-50">
                    Выберите значение
                </Text>
            }
        >
            {menuItems}
        </DropdownWithState>
    ),
};

export const Small: Story = {
    render: () => (
        <DropdownWithState size="sm" trigger={<Text variant="14-reg">Компактный dropdown</Text>}>
            {menuItems}
        </DropdownWithState>
    ),
};

export const FullWidth: Story = {
    render: () => (
        <DropdownWithState
            fullWidth
            trigger={
                <Text variant="16-reg" ellipsis>
                    Длинное значение в широком контейнере
                </Text>
            }
        >
            {menuItems}
        </DropdownWithState>
    ),
};

export const Disabled: Story = {
    render: () => (
        <DropdownWithState
            disabled
            trigger={
                <Text variant="16-reg" color="gray-50">
                    Недоступно
                </Text>
            }
        >
            {menuItems}
        </DropdownWithState>
    ),
};

export const WithError: Story = {
    render: () => (
        <DropdownWithState isError trigger={<Text variant="16-reg">Обязательное поле</Text>}>
            {menuItems}
        </DropdownWithState>
    ),
};

export const WithMaxHeight: Story = {
    render: () => (
        <DropdownWithState
            maxHeight={200}
            trigger={<Text variant="16-reg">Список с прокруткой</Text>}
        >
            <Flex gap={8} align="start" direction="column">
                {Array.from({ length: 20 }, (_, i) => (
                    <Text key={i} variant="14-reg">
                        Пункт меню {i + 1}
                    </Text>
                ))}
            </Flex>
        </DropdownWithState>
    ),
};

export const WithoutMatchingWidth: Story = {
    render: () => (
        <DropdownWithState
            contentSameTriggerWidth={false}
            trigger={<Text variant="16-reg">Узкий триггер</Text>}
        >
            <Flex gap={8} align="start" direction="column" style={{ minWidth: '280px' }}>
                <Text variant="14-reg">Широкое содержимое без привязки к ширине триггера</Text>
                <Text variant="12-reg" color="gray-50">
                    contentSameTriggerWidth=false
                </Text>
            </Flex>
        </DropdownWithState>
    ),
};

export const Controlled: Story = {
    render: () => {
        const [isOpened, setIsOpened] = useState(false);

        return (
            <Flex gap={16} align="start" direction="column">
                <Dropdown
                    isOpened={isOpened}
                    onOpenChange={setIsOpened}
                    trigger={<Text variant="16-reg">Контролируемый dropdown</Text>}
                >
                    <Flex gap={8} align="start" direction="column">
                        <Text variant="14-reg">Содержимое меню</Text>
                        <Text
                            variant="14-reg"
                            color="primary-700"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setIsOpened(false)}
                        >
                            Закрыть
                        </Text>
                    </Flex>
                </Dropdown>

                <Text
                    variant="14-reg"
                    color="primary-700"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setIsOpened(!isOpened)}
                >
                    {isOpened ? 'Закрыть' : 'Открыть'} извне
                </Text>
            </Flex>
        );
    },
};

export const WithSelectableItems: Story = {
    render: () => {
        const [isOpened, setIsOpened] = useState(false);
        const [selected, setSelected] = useState('Пункт меню 1');

        return (
            <Dropdown
                isOpened={isOpened}
                onOpenChange={setIsOpened}
                trigger={<Text variant="16-reg">{selected}</Text>}
            >
                <Flex gap={8} align="start" direction="column">
                    {['Пункт меню 1', 'Пункт меню 2', 'Пункт меню 3'].map(item => (
                        <Text
                            key={item}
                            variant="14-reg"
                            color={selected === item ? 'primary-700' : undefined}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                setSelected(item);
                                setIsOpened(false);
                            }}
                        >
                            {item}
                        </Text>
                    ))}
                </Flex>
            </Dropdown>
        );
    },
};

export const ComplexContent: Story = {
    render: () => {
        const [isOpened, setIsOpened] = useState(false);

        return (
            <Dropdown
                isOpened={isOpened}
                onOpenChange={setIsOpened}
                trigger={<Text variant="16-reg">Иван Иванов</Text>}
            >
                <Flex gap={12} align="start" direction="column" style={{ minWidth: '240px' }}>
                    <Flex gap={4} align="start" direction="column">
                        <Text variant="16-med">Иван Иванов</Text>
                        <Text variant="12-reg" color="gray-50">
                            ivan@example.com
                        </Text>
                    </Flex>

                    <Flex gap={8} align="start" direction="column">
                        <Text
                            variant="14-reg"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setIsOpened(false)}
                        >
                            Настройки
                        </Text>
                        <Text
                            variant="14-reg"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setIsOpened(false)}
                        >
                            Выйти
                        </Text>
                    </Flex>
                </Flex>
            </Dropdown>
        );
    },
};
