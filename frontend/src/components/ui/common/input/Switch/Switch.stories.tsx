import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Switch } from './Switch';

const meta = {
    title: 'UI/Input/Switch',
    component: Switch,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

const SwitchWithState = (args: any) => {
    const [value, setValue] = useState(args.value || args.options[0].value);

    return <Switch {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
    render: SwitchWithState,
    args: {
        options: [
            { value: 'rent', label: 'Аренда' },
            { value: 'buy', label: 'Покупка' },
        ],
        value: 'rent',
    },
};

export const SecondOptionActive: Story = {
    render: SwitchWithState,
    args: {
        options: [
            { value: 'rent', label: 'Аренда' },
            { value: 'buy', label: 'Покупка' },
        ],
        value: 'buy',
    },
};

export const Disabled: Story = {
    render: SwitchWithState,
    args: {
        options: [
            { value: 'rent', label: 'Аренда' },
            { value: 'buy', label: 'Покупка' },
        ],
        value: 'rent',
        disabled: true,
    },
};

export const LongLabels: Story = {
    render: SwitchWithState,
    args: {
        options: [
            { value: 'option1', label: 'Длинная опция 1' },
            { value: 'option2', label: 'Длинная опция 2' },
        ],
        value: 'option1',
    },
};

export const ShortLabels: Story = {
    render: SwitchWithState,
    args: {
        options: [
            { value: 'yes', label: 'Да' },
            { value: 'no', label: 'Нет' },
        ],
        value: 'yes',
    },
};
