import type { Meta, StoryObj } from '@storybook/react-vite';
import { Flex } from './Flex';
import { Button } from '../Button';
import { Text } from '../Text';

const meta = {
    title: 'UI/Common/Flex',
    component: Flex,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    argTypes: {
        direction: {
            control: 'select',
            options: ['row', 'column', 'row-reverse', 'column-reverse'],
            description: 'Направление flex',
        },
        justify: {
            control: 'select',
            options: ['start', 'end', 'center', 'between', 'around', 'evenly'],
            description: 'Выравнивание по главной оси (justify-content)',
        },
        align: {
            control: 'select',
            options: ['start', 'end', 'center', 'stretch', 'baseline'],
            description: 'Выравнивание по поперечной оси (align-items)',
        },
        wrap: {
            control: 'select',
            options: ['nowrap', 'wrap', 'wrap-reverse'],
            description: 'Перенос элементов (flex-wrap)',
        },
        gap: {
            control: 'text',
            description: 'Расстояние между элементами (число или строка)',
        },
        inline: {
            control: 'boolean',
            description: 'Использовать inline-flex вместо flex',
        },
        fullWidth: {
            control: 'boolean',
            description: 'Ширина 100%',
        },
    },
} satisfies Meta<typeof Flex>;

export default meta;
type Story = StoryObj<typeof meta>;

const BoxItem = ({ children }: { children: React.ReactNode }) => (
    <div
        style={{
            padding: '16px',
            backgroundColor: '#5d91ad',
            color: 'white',
            borderRadius: '4px',
        }}
    >
        {children}
    </div>
);

export const Default: Story = {
    args: {
        gap: 16,
        children: (
            <>
                <BoxItem>Элемент 1</BoxItem>
                <BoxItem>Элемент 2</BoxItem>
                <BoxItem>Элемент 3</BoxItem>
            </>
        ),
    },
};

export const Column: Story = {
    args: {
        direction: 'column',
        gap: 16,
        children: (
            <>
                <BoxItem>Элемент 1</BoxItem>
                <BoxItem>Элемент 2</BoxItem>
                <BoxItem>Элемент 3</BoxItem>
            </>
        ),
    },
};

export const JustifyCenter: Story = {
    args: {
        justify: 'center',
        gap: 16,
        children: (
            <>
                <BoxItem>Элемент 1</BoxItem>
                <BoxItem>Элемент 2</BoxItem>
                <BoxItem>Элемент 3</BoxItem>
            </>
        ),
    },
};

export const JustifyBetween: Story = {
    args: {
        justify: 'between',
        fullWidth: true,
        children: (
            <>
                <BoxItem>Слева</BoxItem>
                <BoxItem>Справа</BoxItem>
            </>
        ),
    },
};

export const AlignCenter: Story = {
    args: {
        align: 'center',
        gap: 16,
        style: { minHeight: '200px', border: '1px dashed #ccc' },
        children: (
            <>
                <BoxItem>Элемент 1</BoxItem>
                <BoxItem>
                    Элемент 2<br />с двумя строками
                </BoxItem>
                <BoxItem>Элемент 3</BoxItem>
            </>
        ),
    },
};

export const Wrap: Story = {
    args: {
        wrap: 'wrap',
        gap: 16,
        style: { maxWidth: '400px', border: '1px dashed #ccc' },
        children: (
            <>
                <BoxItem>Элемент 1</BoxItem>
                <BoxItem>Элемент 2</BoxItem>
                <BoxItem>Элемент 3</BoxItem>
                <BoxItem>Элемент 4</BoxItem>
                <BoxItem>Элемент 5</BoxItem>
                <BoxItem>Элемент 6</BoxItem>
            </>
        ),
    },
};

export const WithButtons: Story = {
    args: {
        gap: 16,
        align: 'center',
        children: (
            <>
                <Button variant="primary" size="lg">
                    Основная
                </Button>
                <Button variant="outlined" size="lg">
                    Вторичная
                </Button>
                <Button variant="secondary" size="lg">
                    Третичная
                </Button>
            </>
        ),
    },
};

export const FormLayout: Story = {
    args: {
        direction: 'column',
        gap: 24,
        fullWidth: true,
        children: (
            <>
                <Flex direction="column" gap={8}>
                    <Text variant="14-med">Email</Text>
                    <div
                        style={{
                            padding: '12px',
                            border: '1px solid #cdd1d5',
                            borderRadius: '4px',
                        }}
                    >
                        email@example.com
                    </div>
                </Flex>
                <Flex direction="column" gap={8}>
                    <Text variant="14-med">Пароль</Text>
                    <div
                        style={{
                            padding: '12px',
                            border: '1px solid #cdd1d5',
                            borderRadius: '4px',
                        }}
                    >
                        ••••••••
                    </div>
                </Flex>
                <Flex justify="between" align="center">
                    <Text variant="14-reg">Запомнить меня</Text>
                    <Button variant="primary" size="lg">
                        Войти
                    </Button>
                </Flex>
            </>
        ),
    },
};

export const Inline: Story = {
    args: {
        inline: true,
        gap: 8,
        children: (
            <>
                <BoxItem>Inline 1</BoxItem>
                <BoxItem>Inline 2</BoxItem>
            </>
        ),
    },
};

export const NestedFlex: Story = {
    args: {
        direction: 'column',
        gap: 16,
        fullWidth: true,
        children: (
            <>
                <Flex justify="between" align="center" fullWidth>
                    <Text variant="h4">Заголовок</Text>
                    <Flex gap={8}>
                        <Button variant="outlined" size="md">
                            Отмена
                        </Button>
                        <Button variant="primary" size="md">
                            Сохранить
                        </Button>
                    </Flex>
                </Flex>
                <Flex gap={16}>
                    <BoxItem>Контент 1</BoxItem>
                    <BoxItem>Контент 2</BoxItem>
                    <BoxItem>Контент 3</BoxItem>
                </Flex>
            </>
        ),
    },
};
