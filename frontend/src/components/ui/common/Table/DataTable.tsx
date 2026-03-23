import React from 'react';
import classNames from 'classnames';
import {
    Table,
    TableBody,
    TableHead,
    TableHeaderCell,
    TableCell,
    TableRow,
} from './TablePrimitives';
import type { DataTableProps } from './types';
import {
    headerSortActive,
    headerSizeForTableSize,
    horizontalPlacementFromCellAlign,
    resolveDataTableRowKey,
} from './types';
import { Pagination } from '@/components/ui/common/Pagination';
import { Loader } from '@/components/ui/common/Loader/Loader';
import { Flex } from '@/components/ui/common/Flex';
import styles from './DataTable.module.scss';
import Text from '@/components/ui/common/Text';

/**
 * Таблица по данным: `columns` описывает шапку и способ чтения полей из `data`.
 */
export function DataTable<T>({
    data,
    columns,
    size = 'md',
    striped = false,
    hoverableRows = false,
    pagination,
    emptyContent,
    isLoading = false,
    getRowId,
    className,
    tableProps,
}: DataTableProps<T>) {
    const colCount = columns.length;
    const defaultHeaderSize = headerSizeForTableSize(size);

    return (
        <Flex align="start" gap={16} aria-busy={isLoading || undefined}>
            <Table
                striped={striped}
                hoverableRows={hoverableRows}
                className={className}
                {...tableProps}
            >
                <TableHead>
                    <TableRow>
                        {columns.map(column => (
                            <TableHeaderCell
                                key={column.id}
                                size={column.headerSize ?? defaultHeaderSize}
                                align={column.headerAlign ?? 'left'}
                                active={headerSortActive(column)}
                                sortable={!!column.sortable}
                                onSort={column.sortable}
                                sortDirection={column.sortDirection}
                                interactionDisabled={isLoading}
                                className={column.thClassName}
                            >
                                {column.header}
                            </TableHeaderCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={colCount} align="center" size="auto">
                                <Loader variant="block" height={120} spinnerSize="lg" />
                            </TableCell>
                        </TableRow>
                    ) : data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={colCount} align="left" size="auto">
                                {emptyContent || <Text color="gray-50">Нет данных</Text>}
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row, rowIndex) => (
                            <TableRow key={resolveDataTableRowKey(row, rowIndex, getRowId)}>
                                {columns.map(column => (
                                    <TableCell
                                        key={column.id}
                                        size={size}
                                        align={column.cellAlign ?? 'left'}
                                        variant="supporting"
                                        muted={column.muted}
                                        className={column.tdClassName}
                                    >
                                        {column.cell ? (
                                            column.cell({ row, index: rowIndex })
                                        ) : (
                                            <Flex
                                                direction="column"
                                                align={horizontalPlacementFromCellAlign(
                                                    column.cellAlign ?? 'left',
                                                )}
                                                gap={2}
                                            >
                                                <Text variant="12-reg">
                                                    {column.accessorKey &&
                                                        (row[
                                                            column.accessorKey
                                                        ] as React.ReactNode)}
                                                </Text>
                                                <Text variant="10-reg" color="gray-50">
                                                    {column.supportingAccessorKey &&
                                                        (row[
                                                            column.supportingAccessorKey
                                                        ] as React.ReactNode)}
                                                </Text>
                                            </Flex>
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            {pagination && (
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={page => {
                        if (!isLoading) {
                            pagination.onPageChange(page);
                        }
                    }}
                    className={classNames(pagination.className, {
                        [styles['dataTablePagination--disabled']]: isLoading,
                    })}
                />
            )}
        </Flex>
    );
}
