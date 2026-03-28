import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    DataTable,
    type TableColumn,
} from './Table';

describe('Table primitives', () => {
    it('renders semantic table and cells', () => {
        render(
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeaderCell>Заголовок</TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>Ячейка</TableCell>
                    </TableRow>
                </TableBody>
            </Table>,
        );

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Заголовок' })).toBeInTheDocument();
        expect(screen.getByRole('cell', { name: 'Ячейка' })).toBeInTheDocument();
    });

    it('renders cell with content passed as children (e.g. action button)', () => {
        const onClick = vi.fn();
        render(
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <button type="button" onClick={onClick}>
                                Подробнее
                            </button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>,
        );

        const btn = screen.getByRole('button', { name: 'Подробнее' });
        expect(btn).toBeInTheDocument();
        btn.click();
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});

type TestRow = { id: string; title: string };

describe('DataTable', () => {
    const rows: TestRow[] = [
        { id: 'a', title: 'First' },
        { id: 'b', title: 'Second' },
    ];

    it('renders columns and row values from data', () => {
        const columns: TableColumn<TestRow>[] = [
            { id: 'title', header: 'Название', accessorKey: 'title' },
        ];

        render(<DataTable data={rows} columns={columns} getRowId={r => r.id} />);

        expect(screen.getByRole('columnheader', { name: 'Название' })).toBeInTheDocument();
        expect(screen.getByText('First')).toBeInTheDocument();
        expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('calls sortable when sort control is activated', async () => {
        const user = userEvent.setup();
        const onSort = vi.fn();

        const columns: TableColumn<TestRow>[] = [
            {
                id: 'title',
                header: 'Название',
                accessorKey: 'title',
                sortable: onSort,
                sortDirection: 'asc',
            },
        ];

        render(<DataTable data={rows} columns={columns} />);

        await user.click(screen.getByRole('button', { name: 'Сортировка' }));

        expect(onSort).toHaveBeenCalledTimes(1);
    });

    it('shows loader when isLoading and hides data rows', () => {
        const columns: TableColumn<TestRow>[] = [
            { id: 'title', header: 'Название', accessorKey: 'title' },
        ];

        const { container } = render(
            <DataTable data={rows} columns={columns} isLoading getRowId={r => r.id} />,
        );

        expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
        expect(screen.queryByText('First')).not.toBeInTheDocument();
        expect(screen.queryByText('Second')).not.toBeInTheDocument();
    });

    it('shows emptyContent when no data', () => {
        const columns: TableColumn<TestRow>[] = [
            { id: 'title', header: 'Название', accessorKey: 'title' },
        ];

        render(<DataTable data={[]} columns={columns} emptyContent={<span>Пусто</span>} />);

        expect(screen.getByText('Пусто')).toBeInTheDocument();
    });
});
