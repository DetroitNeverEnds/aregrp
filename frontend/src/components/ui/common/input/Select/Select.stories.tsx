import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select, type SelectProps } from './Select';
import { useState } from 'react';

const meta = {
    title: 'UI/Input/Select',
    component: Select,
    parameters: {
        layout: 'centered',
        viewport: {
            defaultViewport: 'responsive',
        },
        chromatic: {
            viewports: [400],
        },
    },
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['lg', 'sm', 'tiny'],
            description: 'Размер компонента',
        },
        disabled: {
            control: 'boolean',
            description: 'Отключенное состояние',
        },
        clearable: {
            control: 'boolean',
            description: 'Возможность очистить выбранное значение',
        },
        filterable: {
            control: 'boolean',
            description: 'Поле поиска и фильтрация опций в выпадающем списке',
        },
        errorMessage: {
            control: 'text',
            description: 'Сообщение об ошибке',
        },
        value: {
            control: 'text',
            description: 'Значение по умолчанию',
        },
    },
    args: {
        value: undefined,
    },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOptions = [
    { value: '1', label: { title: 'Опция 1', description: 'Описание опции 1' } },
    { value: '2', label: { title: 'Опция 2', description: 'Описание опции 2' } },
    { value: '3', label: { title: 'Опция 3', description: 'Описание опции 3' } },
    { value: '4', label: { title: 'Опция 4', description: 'Описание опции 4' } },
    { value: '5', label: { title: 'Опция 5', description: 'Описание опции 5' } },
];

const simpleOptions = [
    { value: '1', label: { title: 'Москва' } },
    { value: '2', label: { title: 'Санкт-Петербург' } },
    { value: '3', label: { title: 'Новосибирск' } },
    { value: '4', label: { title: 'Екатеринбург' } },
    { value: '5', label: { title: 'Казань' } },
];

function normalizeSelectValue(value: string | string[] | undefined): string[] {
    if (!value) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

// Контролируемый компонент для интерактивных примеров
const ControlledSelect = (args: SelectProps<string>) => {
    const { value: argsValue, ...rest } = args;
    const [value, setValue] = useState<string[]>(() => normalizeSelectValue(argsValue));

    return (
        <div style={{ width: '400px' }}>
            <Select {...rest} value={value} onChange={setValue} />
        </div>
    );
};

// Контролируемый компонент для мультиселекта
const ControlledMultiSelect = (args: SelectProps<string>) => {
    const { value: argsValue, ...rest } = args;
    const [value, setValue] = useState<string[]>(() =>
        args.multiple ? normalizeSelectValue(argsValue) : [],
    );

    return (
        <div style={{ width: '400px' }}>
            <Select {...rest} multiple value={value} onChange={setValue} />
        </div>
    );
};

export const Default: Story = {
    render: args => <ControlledSelect {...args} />,
    args: {
        options: sampleOptions,
        placeholder: 'Выберите опцию',
        size: 'lg',
    },
};

export const Small: Story = {
    render: args => <ControlledSelect {...args} />,
    args: {
        options: sampleOptions,
        placeholder: 'Выберите опцию',
        size: 'sm',
    },
};

export const Tiny: Story = {
    render: args => <ControlledSelect {...args} />,
    args: {
        options: sampleOptions,
        placeholder: 'Выберите опцию',
        size: 'tiny',
    },
};

export const WithoutDescription: Story = {
    render: args => <ControlledSelect {...args} />,
    args: {
        options: simpleOptions,
        placeholder: 'Выберите город',
        size: 'lg',
    },
};

export const Clearable: Story = {
    render: args => <ControlledSelect {...args} />,
    args: {
        options: simpleOptions,
        placeholder: 'Выберите город',
        size: 'lg',
        value: simpleOptions[0].value,
        clearable: true,
    },
};

export const WithError: Story = {
    render: args => <ControlledSelect {...args} />,
    args: {
        options: simpleOptions,
        placeholder: 'Выберите город',
        size: 'lg',
        errorMessage: 'Это поле обязательно для заполнения',
    },
};

export const Disabled: Story = {
    render: args => <ControlledSelect {...args} />,
    args: {
        options: simpleOptions,
        placeholder: 'Выберите город',
        size: 'lg',
        disabled: true,
    },
};

export const DisabledWithValue: Story = {
    render: args => {
        const [value] = useState<string[]>(['2']);
        return (
            <div style={{ width: '400px' }}>
                <Select {...args} value={value} />
            </div>
        );
    },
    args: {
        options: simpleOptions,
        size: 'lg',
        disabled: true,
    },
};

export const ManyOptions: Story = {
    render: args => <ControlledSelect {...args} />,
    args: {
        options: Array.from({ length: 20 }, (_, i) => ({
            value: String(i + 1),
            label: {
                title: `Опция ${i + 1}`,
                description: `Описание опции ${i + 1}`,
            },
        })),
        placeholder: 'Выберите опцию',
        size: 'lg',
        maxHeight: 300,
    },
};

export const InForm: Story = {
    render: () => {
        const [city, setCity] = useState<string[]>([]);
        const [country, setCountry] = useState<string[]>([]);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            alert(`Город: ${city[0] ?? ''}, Страна: ${country[0] ?? ''}`);
        };

        return (
            <form onSubmit={handleSubmit} style={{ width: '400px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <Select
                        options={simpleOptions}
                        value={city}
                        onChange={setCity}
                        placeholder="Выберите город"
                        name="city"
                        required
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <Select
                        options={[
                            { value: 'ru', label: { title: 'Россия' } },
                            { value: 'us', label: { title: 'США' } },
                            { value: 'uk', label: { title: 'Великобритания' } },
                        ]}
                        value={country}
                        onChange={setCountry}
                        placeholder="Выберите страну"
                        name="country"
                        required
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        padding: '10px 20px',
                        background: '#48768f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                    }}
                >
                    Отправить
                </button>
            </form>
        );
    },
};

export const MultiSelect: Story = {
    render: args => <ControlledMultiSelect {...args} />,
    args: {
        options: sampleOptions,
        placeholder: 'Выберите опции',
        size: 'lg',
        multiple: true,
    },
};

export const MultiSelectSmall: Story = {
    render: args => <ControlledMultiSelect {...args} />,
    args: {
        options: sampleOptions,
        placeholder: 'Выберите опции',
        size: 'sm',
        multiple: true,
    },
};

export const MultiSelectWithPreselected: Story = {
    render: args => <ControlledMultiSelect {...args} />,
    args: {
        options: sampleOptions,
        placeholder: 'Выберите опции',
        size: 'lg',
        multiple: true,
        value: ['1', '3'],
    },
};

export const MultiSelectDisabled: Story = {
    render: args => <ControlledMultiSelect {...args} />,
    args: {
        options: sampleOptions,
        placeholder: 'Выберите опции',
        size: 'lg',
        multiple: true,
        disabled: true,
        value: ['1', '2'],
    },
};

export const Filterable: Story = {
    render: args => <ControlledSelect {...args} />,
    args: {
        options: simpleOptions,
        placeholder: 'Выберите город',
        filterable: true,
    },
};

export const AllStates: Story = {
    args: {
        options: simpleOptions,
    },
    render: () => {
        const [value1, setValue1] = useState<string[]>([]);
        const [value2, setValue2] = useState<string[]>(['2']);
        const [multiValue1, setMultiValue1] = useState<string[]>([]);
        const [multiValue2, setMultiValue2] = useState<string[]>(['1', '3']);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '400px' }}>
                <div>
                    <h3>Single Select - Default (пустой)</h3>
                    <Select
                        options={simpleOptions}
                        value={value1}
                        onChange={setValue1}
                        placeholder="Выберите город"
                    />
                </div>
                <div>
                    <h3>Single Select - Filled (заполненный)</h3>
                    <Select
                        options={simpleOptions}
                        value={value2}
                        onChange={setValue2}
                        placeholder="Выберите город"
                    />
                </div>
                <div>
                    <h3>Single Select - Filled + Clearable</h3>
                    <Select
                        options={simpleOptions}
                        value={value2}
                        onChange={setValue2}
                        placeholder="Выберите город"
                        clearable
                    />
                </div>
                <div>
                    <h3>Single Select - Error</h3>
                    <Select
                        options={simpleOptions}
                        value={value1}
                        onChange={setValue1}
                        placeholder="Выберите город"
                        errorMessage="Это поле обязательно"
                    />
                </div>
                <div>
                    <h3>Single Select - Disabled (пустой)</h3>
                    <Select
                        options={simpleOptions}
                        value={value1}
                        onChange={setValue1}
                        placeholder="Выберите город"
                        disabled
                    />
                </div>
                <div>
                    <h3>Single Select - Disabled (заполненный)</h3>
                    <Select options={simpleOptions} value={value2} onChange={setValue2} disabled />
                </div>
                <div>
                    <h3>Multi Select - Default (пустой)</h3>
                    <Select
                        options={simpleOptions}
                        value={multiValue1}
                        onChange={setMultiValue1}
                        placeholder="Выберите города"
                        multiple
                    />
                </div>
                <div>
                    <h3>Multi Select - Filled (заполненный)</h3>
                    <Select
                        options={simpleOptions}
                        value={multiValue2}
                        onChange={setMultiValue2}
                        placeholder="Выберите города"
                        multiple
                    />
                </div>
                <div>
                    <h3>Multi Select - Disabled</h3>
                    <Select
                        options={simpleOptions}
                        value={multiValue2}
                        onChange={setMultiValue2}
                        placeholder="Выберите города"
                        multiple
                        disabled
                    />
                </div>
            </div>
        );
    },
};
