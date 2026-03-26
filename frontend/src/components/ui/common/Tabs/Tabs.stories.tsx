import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { useState } from 'react';
import { Tabs } from './Tabs';
import Text from '../Text';
// import Text from '@/components/ui/common/Text';

const meta = {
    title: 'UI/Common/Tabs',
    component: Tabs,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'Горизонтальные вкладки с нижней границей и подчёркиванием активной. Дочерние элементы — только `Tab`.',
            },
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: function TabsStory() {
        const [value, setValue] = useState('rent');
        return (
            <div style={{ maxWidth: 480 }}>
                <Tabs
                    value={value}
                    onChange={setValue}
                    tabs={[
                        { value: 'rent', label: 'Аренда' },
                        { value: 'sale', label: 'Продажа' },
                    ]}
                />
                <Text variant="12-reg" color="gray-50" style={{ marginTop: 16 }}>
                    Выбрано: {value}
                </Text>
            </div>
        );
    },
};
