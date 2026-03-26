import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import React, { useState } from 'react';
import { DataTable, type DataTableProps, type TableColumn, type TableSortDirection } from './Table';
import { Button } from '@/components/ui/common/Button';

const meta = {
    title: 'UI/Common/Table',
    component: DataTable,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'Примитивы (`Table`, `TableRow`, `TableCell`, …) для ручной вёрстки и `DataTable` для таблицы по данным и колонкам.',
            },
        },
    },
    argTypes: {
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg', 'xl'],
            description:
                'Плотность строк по вертикали (и шапки; для `xl` в шапке используется `lg`).',
        },
        striped: { control: 'boolean' },
        hoverableRows: { control: 'boolean' },
        isLoading: { control: 'boolean' },
        width: {
            control: 'select',
            options: ['max', 'auto'],
            description: '`max` — 100% ширины контейнера, `auto` — по содержимому.',
        },
        data: { control: false },
        columns: { control: false },
        pagination: { control: false },
        emptyContent: { control: false },
        tableProps: { control: false },
        className: { control: false },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

type Row = { id: string; name: string; building: string; area: number; rent: string };

const sampleRows: Row[] = [
    { id: '1', name: 'Офис 12', building: 'БЦ «Север»', area: 120, rent: '450 000 ₽' },
    { id: '2', name: 'Переговорная A', building: 'БЦ «Юг»', area: 45, rent: '—' },
];

const dataTableExampleColumns: TableColumn<Row>[] = [
    {
        id: 'name',
        header: 'Название',
        accessorKey: 'name',
        supportingAccessorKey: 'building',
    },
    {
        id: 'area',
        header: 'Площадь, м²',
        accessorKey: 'area',
        headerAlign: 'right',
        cellAlign: 'right',
    },
    {
        id: 'rent',
        header: 'Аренда',
        accessorKey: 'rent',
        headerAlign: 'right',
        cellAlign: 'right',
    },
    {
        id: 'action',
        header: '',
        headerAlign: 'right',
        cellAlign: 'right',
        render: ({ row }) => (
            <Button
                variant="outlined"
                theme="light"
                size="sm"
                type="button"
                aria-label={`Открыть: ${row.name}`}
            >
                Открыть
            </Button>
        ),
    },
];

type DataTablePlaygroundArgs = Pick<
    DataTableProps<Row>,
    'size' | 'striped' | 'hoverableRows' | 'isLoading' | 'width'
>;

/** Сторис с `args` — в этом режиме в панели Controls доступны `size`, `striped` и др. */
export const DataTablePlayground: Story = {
    args: {
        size: 'md',
        striped: false,
        hoverableRows: true,
        isLoading: false,
        width: 'max',
    },
    render: () => {
        const [args] = useArgs<DataTablePlaygroundArgs>();

        return (
            <div style={{ maxWidth: 720 }}>
                <DataTable
                    data={sampleRows}
                    columns={dataTableExampleColumns}
                    size={args.size ?? 'md'}
                    striped={args.striped ?? false}
                    hoverableRows={args.hoverableRows ?? true}
                    isLoading={args.isLoading ?? false}
                    width={args.width ?? 'max'}
                />
            </div>
        );
    },
};

/**
 * Двухстрочная ячейка: основной текст из `accessorKey`, вторая строка из `supportingAccessorKey`.
 * Колонка с `render` этот режим отключает.
 */
export const DataTableSupportingAccessorKey: Story = {
    parameters: {
        controls: { disable: true },
    },
    render: () => {
        const columns: TableColumn<Row>[] = [
            {
                id: 'object',
                header: 'Объект',
                accessorKey: 'name',
                supportingAccessorKey: 'building',
            },
            {
                id: 'area',
                header: 'Площадь, м²',
                accessorKey: 'area',
                headerAlign: 'right',
                cellAlign: 'right',
            },
            {
                id: 'rent',
                header: 'Аренда',
                accessorKey: 'rent',
                headerAlign: 'right',
                cellAlign: 'right',
            },
        ];

        return (
            <div style={{ maxWidth: 720 }}>
                <DataTable data={sampleRows} columns={columns} striped hoverableRows />
            </div>
        );
    },
};

export const DataTableExample: Story = {
    parameters: {
        controls: { disable: true },
    },
    render: () => (
        <div style={{ maxWidth: 720 }}>
            <DataTable
                data={sampleRows}
                columns={dataTableExampleColumns}
                hoverableRows
                size="sm"
            />
        </div>
    ),
};

export const DataTableSort: Story = {
    parameters: {
        controls: { disable: true },
    },
    render: () => {
        const [sortDirection, setSortDirection] = useState<TableSortDirection>(null);

        const columns: TableColumn<Row>[] = [
            {
                id: 'name',
                header: 'Название',
                accessorKey: 'name',
                supportingAccessorKey: 'building',
                sortable: () => {
                    setSortDirection(prev => {
                        if (prev === null) {
                            return 'asc';
                        }
                        if (prev === 'asc') {
                            return 'desc';
                        }
                        return null;
                    });
                },
                sortDirection,
            },
            {
                id: 'area',
                header: 'Площадь, м²',
                accessorKey: 'area',
                headerAlign: 'right',
                cellAlign: 'right',
            },
        ];

        const sorted =
            sortDirection === null
                ? sampleRows
                : [...sampleRows].sort((a, b) => {
                    const cmp = a.name.localeCompare(b.name, 'ru');
                    return sortDirection === 'asc' ? cmp : -cmp;
                });

        return (
            <div style={{ maxWidth: 720 }}>
                <DataTable data={sorted} columns={columns} hoverableRows />
            </div>
        );
    },
};

export const DataTableEmpty: Story = {
    parameters: {
        controls: { disable: true },
    },
    render: () => {
        const columns: TableColumn<Row>[] = [
            { id: 'name', header: 'Название', accessorKey: 'name' },
            { id: 'area', header: 'Площадь', accessorKey: 'area', cellAlign: 'right' },
        ];

        return (
            <div style={{ maxWidth: 720 }}>
                <DataTable
                    data={[]}
                    columns={columns}
                    emptyContent={<span>Нет строк для отображения</span>}
                />
            </div>
        );
    },
};

export const DataTableLoadingAndPagination: Story = {
    parameters: {
        controls: { disable: true },
    },
    render: () => {
        const [page, setPage] = useState(1);
        const [loading, setLoading] = useState(false);

        const columns: TableColumn<Row>[] = [
            { id: 'name', header: 'Название', accessorKey: 'name' },
            {
                id: 'area',
                header: 'Площадь',
                accessorKey: 'area',
                cellAlign: 'right',
            },
        ];

        return (
            <div style={{ maxWidth: 720 }}>
                <button
                    type="button"
                    onClick={() => setLoading(l => !l)}
                    style={{ marginBottom: 12 }}
                >
                    {loading ? 'Симулировать готово' : 'Симулировать загрузку'}
                </button>
                <DataTable
                    data={sampleRows}
                    columns={columns}
                    isLoading={loading}
                    size="xl"
                    pagination={{
                        currentPage: page,
                        totalPages: 5,
                        onPageChange: setPage,
                    }}
                />
            </div>
        );
    },
};
