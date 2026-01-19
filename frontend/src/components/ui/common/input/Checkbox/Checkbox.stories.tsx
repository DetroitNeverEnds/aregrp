import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, type CheckboxProps, type CheckboxSize } from './Checkbox';
import { useState } from 'react';

const meta = {
    title: 'Components/Checkbox',
    component: Checkbox,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['lg', 'md', 'sm'],
            description: 'Размер чекбокса: lg (24px), md (20px), sm (16px)',
        },
        label: {
            control: 'text',
            description: 'Текст или компонент метки рядом с чекбоксом',
        },
        checked: {
            control: 'boolean',
            description: 'Состояние checked',
        },
        disabled: {
            control: 'boolean',
            description: 'Состояние disabled',
        },
        errorMessage: {
            control: 'text',
            description: 'Сообщение об ошибке (при наличии чекбокс становится в состоянии error)',
        },
    },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Контролируемый компонент для stories
const ControlledCheckboxInput = ({ checked, ...props }: CheckboxProps) => {
    return <Checkbox name="test" {...props} defaultValue={checked} />;
};

export const Default: Story = {
    args: {
        size: 'lg',
    },
    render: () => <ControlledCheckboxInput size="lg" label="Label" checked={false} />,
};

// Все размеры
export const AllSizes: Story = {
    args: {
        size: 'lg',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(['lg', 'md', 'sm'] as CheckboxSize[]).map(size => (
                <div key={size} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <ControlledCheckboxInput
                        size={size}
                        label={`Size ${size}`}
                        onChange={() => {}}
                    />
                    <ControlledCheckboxInput
                        size={size}
                        label={`Size ${size}`}
                        checked
                        onChange={() => {}}
                    />
                </div>
            ))}
        </div>
    ),
};

// Состояния checked/unchecked
export const CheckedStates: Story = {
    args: {
        size: 'lg',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ControlledCheckboxInput
                size="lg"
                label="Unchecked"
                checked={false}
                onChange={() => {}}
            />
            <ControlledCheckboxInput size="lg" label="Checked" checked={true} onChange={() => {}} />
        </div>
    ),
};

// Состояние disabled
export const DisabledStates: Story = {
    args: {
        size: 'lg',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ControlledCheckboxInput
                size="lg"
                label="Disabled unchecked"
                disabled
                checked={false}
                onChange={() => {}}
            />
            <ControlledCheckboxInput
                size="lg"
                label="Disabled checked"
                disabled
                checked={true}
                onChange={() => {}}
            />
        </div>
    ),
};

// Состояние error
export const ErrorStates: Story = {
    args: {
        size: 'lg',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ControlledCheckboxInput
                size="lg"
                label="Error unchecked"
                errorMessage="Error caption"
                onChange={() => {}}
            />
            <ControlledCheckboxInput
                size="lg"
                label="Error checked"
                checked
                errorMessage="Error caption"
                onChange={() => {}}
            />
        </div>
    ),
};

// Без label
export const WithoutLabel: Story = {
    args: {
        size: 'lg',
    },
    render: () => (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <ControlledCheckboxInput size="lg" onChange={() => {}} />
            <ControlledCheckboxInput size="lg" checked onChange={() => {}} />
            <ControlledCheckboxInput size="lg" disabled onChange={() => {}} />
        </div>
    ),
};

// С ReactNode как label
export const WithCustomLabel: Story = {
    args: {
        size: 'lg',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ControlledCheckboxInput
                size="lg"
                label={
                    <span>
                        Я согласен с{' '}
                        <a href="#" style={{ color: '#5d91ad' }}>
                            условиями использования
                        </a>
                    </span>
                }
                onChange={() => {}}
            />
            <ControlledCheckboxInput
                size="lg"
                label={
                    <span>
                        <strong>Важное</strong> уведомление
                    </span>
                }
                checked
                onChange={() => {}}
            />
        </div>
    ),
};

// Все состояния для одного размера
export const AllStatesLarge: Story = {
    args: {
        size: 'lg',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <ControlledCheckboxInput size="lg" label="Default" onChange={() => {}} />
                <ControlledCheckboxInput size="lg" label="Checked" checked onChange={() => {}} />
                <ControlledCheckboxInput size="lg" label="Disabled" disabled onChange={() => {}} />
                <ControlledCheckboxInput
                    size="lg"
                    label="Disabled checked"
                    disabled
                    checked
                    onChange={() => {}}
                />
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <ControlledCheckboxInput
                    size="lg"
                    label="Error"
                    errorMessage="Error text"
                    onChange={() => {}}
                />
                <ControlledCheckboxInput
                    size="lg"
                    label="Error checked"
                    checked
                    errorMessage="Error text"
                    onChange={() => {}}
                />
            </div>
        </div>
    ),
};

// Все состояния для среднего размера
export const AllStatesMedium: Story = {
    args: {
        size: 'md',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <ControlledCheckboxInput size="md" label="Default" onChange={() => {}} />
                <ControlledCheckboxInput size="md" label="Checked" checked onChange={() => {}} />
                <ControlledCheckboxInput size="md" label="Disabled" disabled onChange={() => {}} />
                <ControlledCheckboxInput
                    size="md"
                    label="Disabled checked"
                    disabled
                    checked
                    onChange={() => {}}
                />
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <ControlledCheckboxInput
                    size="md"
                    label="Error"
                    errorMessage="Error text"
                    onChange={() => {}}
                />
                <ControlledCheckboxInput
                    size="md"
                    label="Error checked"
                    checked
                    errorMessage="Error text"
                    onChange={() => {}}
                />
            </div>
        </div>
    ),
};

// Все состояния для маленького размера
export const AllStatesSmall: Story = {
    args: {
        size: 'sm',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <ControlledCheckboxInput size="sm" label="Default" onChange={() => {}} />
                <ControlledCheckboxInput size="sm" label="Checked" checked onChange={() => {}} />
                <ControlledCheckboxInput size="sm" label="Disabled" disabled onChange={() => {}} />
                <ControlledCheckboxInput
                    size="sm"
                    label="Disabled checked"
                    disabled
                    checked
                    onChange={() => {}}
                />
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <ControlledCheckboxInput
                    size="sm"
                    label="Error"
                    errorMessage="Error text"
                    onChange={() => {}}
                />
                <ControlledCheckboxInput
                    size="sm"
                    label="Error checked"
                    checked
                    errorMessage="Error text"
                    onChange={() => {}}
                />
            </div>
        </div>
    ),
};

// Матрица всех комбинаций
export const AllCombinations: Story = {
    args: {
        size: 'lg',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 600 }}>
                    Large (24px)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <ControlledCheckboxInput size="lg" label="Default" onChange={() => {}} />
                        <ControlledCheckboxInput
                            size="lg"
                            label="Checked"
                            checked
                            onChange={() => {}}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <ControlledCheckboxInput
                            size="lg"
                            label="Disabled"
                            disabled
                            onChange={() => {}}
                        />
                        <ControlledCheckboxInput
                            size="lg"
                            label="Disabled checked"
                            disabled
                            checked
                            onChange={() => {}}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <ControlledCheckboxInput
                            size="lg"
                            label="Error"
                            errorMessage="Error caption"
                            onChange={() => {}}
                        />
                        <ControlledCheckboxInput
                            size="lg"
                            label="Error checked"
                            checked
                            errorMessage="Error caption"
                            onChange={() => {}}
                        />
                    </div>
                </div>
            </div>

            <div>
                <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 600 }}>
                    Medium (20px)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <ControlledCheckboxInput size="md" label="Default" onChange={() => {}} />
                        <ControlledCheckboxInput
                            size="md"
                            label="Checked"
                            checked
                            onChange={() => {}}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <ControlledCheckboxInput
                            size="md"
                            label="Disabled"
                            disabled
                            onChange={() => {}}
                        />
                        <ControlledCheckboxInput
                            size="md"
                            label="Disabled checked"
                            disabled
                            checked
                            onChange={() => {}}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <ControlledCheckboxInput
                            size="md"
                            label="Error"
                            errorMessage="Error caption"
                            onChange={() => {}}
                        />
                        <ControlledCheckboxInput
                            size="md"
                            label="Error checked"
                            checked
                            errorMessage="Error caption"
                            onChange={() => {}}
                        />
                    </div>
                </div>
            </div>

            <div>
                <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 600 }}>
                    Small (16px)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <ControlledCheckboxInput size="sm" label="Default" onChange={() => {}} />
                        <ControlledCheckboxInput
                            size="sm"
                            label="Checked"
                            checked
                            onChange={() => {}}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <ControlledCheckboxInput
                            size="sm"
                            label="Disabled"
                            disabled
                            onChange={() => {}}
                        />
                        <ControlledCheckboxInput
                            size="sm"
                            label="Disabled checked"
                            disabled
                            checked
                            onChange={() => {}}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <ControlledCheckboxInput
                            size="sm"
                            label="Error"
                            errorMessage="Error caption"
                            onChange={() => {}}
                        />
                        <ControlledCheckboxInput
                            size="sm"
                            label="Error checked"
                            checked
                            errorMessage="Error caption"
                            onChange={() => {}}
                        />
                    </div>
                </div>
            </div>
        </div>
    ),
};
