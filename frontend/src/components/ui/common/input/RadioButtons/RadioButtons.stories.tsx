import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
    RadioButtons,
    type RadioButtonsProps,
    type RadioButtonSize,
    type RadioButtonDirection,
} from './RadioButtons';

const meta = {
    title: 'Components/RadioButtons',
    component: RadioButtons,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['lg', 'md', 'sm'],
            description: 'Размер радио-кнопок: lg (24px), md (20px), sm (16px)',
        },
        direction: {
            control: 'select',
            options: ['vertical', 'horizontal'],
            description: 'Направление расположения кнопок',
        },
        value: {
            control: 'text',
            description: 'Выбранное значение',
        },
        disabled: {
            control: 'boolean',
            description: 'Отключить весь компонент',
        },
        errorMessage: {
            control: 'text',
            description: 'Сообщение об ошибке (при наличии компонент становится в состоянии error)',
        },
    },
} satisfies Meta<typeof RadioButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

// Контролируемый компонент для stories
const ControlledRadioButtons = (props: Omit<RadioButtonsProps, 'onChange'>) => {
    const [value, setValue] = useState(props.value || '');
    return <RadioButtons {...props} value={value} onChange={setValue} />;
};

const defaultOptions = [
    { value: 'option1', label: 'Опция 1' },
    { value: 'option2', label: 'Опция 2' },
    { value: 'option3', label: 'Опция 3' },
];

export const Default: Story = {
    args: {
        size: 'lg',
        options: defaultOptions,
        value: 'option1',
        onChange: () => {},
    },
    render: args => <ControlledRadioButtons {...args} />,
};

// Все размеры
export const AllSizes: Story = {
    args: { options: defaultOptions },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {(['lg', 'md', 'sm'] as RadioButtonSize[]).map(size => (
                <div key={size}>
                    <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                        Size: {size}
                    </h4>
                    <ControlledRadioButtons size={size} options={defaultOptions} value="option1" />
                </div>
            ))}
        </div>
    ),
};

// Направления
export const Directions: Story = {
    args: { options: defaultOptions },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {(['vertical', 'horizontal'] as RadioButtonDirection[]).map(direction => (
                <div key={direction}>
                    <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                        Direction: {direction}
                    </h4>
                    <ControlledRadioButtons
                        size="lg"
                        direction={direction}
                        options={defaultOptions}
                        value="option1"
                    />
                </div>
            ))}
        </div>
    ),
};

// Состояние disabled
export const DisabledStates: Story = {
    args: { options: defaultOptions },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                    Весь компонент disabled
                </h4>
                <ControlledRadioButtons
                    size="lg"
                    options={defaultOptions}
                    value="option1"
                    disabled
                />
            </div>
            <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                    Отдельные опции disabled
                </h4>
                <ControlledRadioButtons
                    size="lg"
                    options={[
                        { value: 'option1', label: 'Опция 1' },
                        { value: 'option2', label: 'Опция 2 (disabled)', disabled: true },
                        { value: 'option3', label: 'Опция 3' },
                    ]}
                    value="option1"
                />
            </div>
        </div>
    ),
};

// Состояние error
export const ErrorState: Story = {
    args: { options: defaultOptions },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ControlledRadioButtons
                size="lg"
                options={defaultOptions}
                value="option1"
                errorMessage="Пожалуйста, выберите опцию"
            />
        </div>
    ),
};

// С кастомными метками
export const WithCustomLabels: Story = {
    args: { options: defaultOptions },
    render: () => (
        <ControlledRadioButtons
            size="lg"
            options={[
                {
                    value: 'option1',
                    label: (
                        <span>
                            <strong>Важная</strong> опция
                        </span>
                    ),
                },
                {
                    value: 'option2',
                    label: (
                        <span>
                            Опция с{' '}
                            <a href="#" style={{ color: '#5d91ad' }}>
                                ссылкой
                            </a>
                        </span>
                    ),
                },
                { value: 'option3', label: 'Обычная опция' },
            ]}
            value="option1"
        />
    ),
};

// Все состояния для большого размера
export const AllStatesLarge: Story = {
    args: { options: defaultOptions },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Default</h4>
                <ControlledRadioButtons size="lg" options={defaultOptions} value="option1" />
            </div>
            <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Disabled</h4>
                <ControlledRadioButtons
                    size="lg"
                    options={defaultOptions}
                    value="option1"
                    disabled
                />
            </div>
            <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Error</h4>
                <ControlledRadioButtons
                    size="lg"
                    options={defaultOptions}
                    value="option1"
                    errorMessage="Ошибка валидации"
                />
            </div>
            <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                    Horizontal
                </h4>
                <ControlledRadioButtons
                    size="lg"
                    direction="horizontal"
                    options={defaultOptions}
                    value="option1"
                />
            </div>
        </div>
    ),
};

// Все состояния для среднего размера
export const AllStatesMedium: Story = {
    args: { options: defaultOptions },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Default</h4>
                <ControlledRadioButtons size="md" options={defaultOptions} value="option1" />
            </div>
            <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Disabled</h4>
                <ControlledRadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option1"
                    disabled
                />
            </div>
            <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Error</h4>
                <ControlledRadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option1"
                    errorMessage="Ошибка валидации"
                />
            </div>
            <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                    Horizontal
                </h4>
                <ControlledRadioButtons
                    size="md"
                    direction="horizontal"
                    options={defaultOptions}
                    value="option1"
                />
            </div>
        </div>
    ),
};

// Все состояния для маленького размера
export const AllStatesSmall: Story = {
    args: { options: defaultOptions },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Default</h4>
                <ControlledRadioButtons size="sm" options={defaultOptions} value="option1" />
            </div>
            <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Disabled</h4>
                <ControlledRadioButtons
                    size="sm"
                    options={defaultOptions}
                    value="option1"
                    disabled
                />
            </div>
            <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Error</h4>
                <ControlledRadioButtons
                    size="sm"
                    options={defaultOptions}
                    value="option1"
                    errorMessage="Ошибка валидации"
                />
            </div>
            <div>
                <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                    Horizontal
                </h4>
                <ControlledRadioButtons
                    size="sm"
                    direction="horizontal"
                    options={defaultOptions}
                    value="option1"
                />
            </div>
        </div>
    ),
};

// Матрица всех комбинаций
export const AllCombinations: Story = {
    args: { options: defaultOptions },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
                <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
                    Large (24px)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <ControlledRadioButtons size="lg" options={defaultOptions} value="option1" />
                    <ControlledRadioButtons
                        size="lg"
                        options={defaultOptions}
                        value="option1"
                        disabled
                    />
                    <ControlledRadioButtons
                        size="lg"
                        options={defaultOptions}
                        value="option1"
                        errorMessage="Ошибка валидации"
                    />
                    <ControlledRadioButtons
                        size="lg"
                        direction="horizontal"
                        options={defaultOptions}
                        value="option1"
                    />
                </div>
            </div>

            <div>
                <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
                    Medium (20px)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <ControlledRadioButtons size="md" options={defaultOptions} value="option1" />
                    <ControlledRadioButtons
                        size="md"
                        options={defaultOptions}
                        value="option1"
                        disabled
                    />
                    <ControlledRadioButtons
                        size="md"
                        options={defaultOptions}
                        value="option1"
                        errorMessage="Ошибка валидации"
                    />
                    <ControlledRadioButtons
                        size="md"
                        direction="horizontal"
                        options={defaultOptions}
                        value="option1"
                    />
                </div>
            </div>

            <div>
                <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
                    Small (16px)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <ControlledRadioButtons size="sm" options={defaultOptions} value="option1" />
                    <ControlledRadioButtons
                        size="sm"
                        options={defaultOptions}
                        value="option1"
                        disabled
                    />
                    <ControlledRadioButtons
                        size="sm"
                        options={defaultOptions}
                        value="option1"
                        errorMessage="Ошибка валидации"
                    />
                    <ControlledRadioButtons
                        size="sm"
                        direction="horizontal"
                        options={defaultOptions}
                        value="option1"
                    />
                </div>
            </div>
        </div>
    ),
};
