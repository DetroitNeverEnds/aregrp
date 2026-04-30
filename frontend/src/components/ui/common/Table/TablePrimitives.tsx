import React from 'react';
import classNames from 'classnames';
import styles from './TablePrimitives.module.scss';
import { Icon } from '@/components/ui/common/Icon';
import { Flex } from '@/components/ui/common/Flex';
import type { TableProps, TableHeaderCellProps, TableCellProps } from './types';
import { horizontalPlacementFromHeaderAlign, sortIconName } from './types';
import Text from '../Text';

/** Обёртка над нативным `<table>` с токенами проекта */
export const Table = ({
    children,
    className,
    striped = false,
    hoverableRows = false,
    width = 'max',
    ...rest
}: TableProps) => (
    <table
        className={classNames(
            styles.table,
            styles[`table--width-${width}`],
            striped && styles['table--striped'],
            hoverableRows && styles['table--hoverableRows'],
            className,
        )}
        {...rest}
    >
        {children}
    </table>
);

/** Секция `<thead>` */
export const TableHead = ({
    children,
    className,
    ...rest
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className={className} {...rest}>
        {children}
    </thead>
);

/** Секция `<tbody>` */
export const TableBody = ({
    children,
    className,
    ...rest
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className={className} {...rest}>
        {children}
    </tbody>
);

/** Строка `<tr>` */
export const TableRow = ({
    children,
    className,
    ...rest
}: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className={classNames(styles.row, className)} {...rest}>
        {children}
    </tr>
);

/** Ячейка заголовка с опциональной сортировкой */
export const TableHeaderCell = ({
    children,
    className,
    size = 'md',
    align = 'left',
    active = false,
    sortable = false,
    sortDirection = null,
    onSort,
    interactionDisabled = false,
    scope = 'col',
    ...rest
}: TableHeaderCellProps) => {
    const iconColor = active ? 'primary-700' : 'gray-70';

    return (
        <th
            scope={scope}
            className={classNames(
                styles.th,
                styles[`th--size-${size}`],
                styles[`th--align-${align}`],
                active && styles['th--active'],
                className,
            )}
            {...rest}
        >
            <Flex
                direction="row"
                align="center"
                justify={horizontalPlacementFromHeaderAlign(align)}
                gap={6}
                fullWidth
                className={styles.headerCellInner}
            >
                {sortable && (
                    <button
                        type="button"
                        className={styles.headerIconButton}
                        disabled={interactionDisabled}
                        onClick={e => {
                            e.stopPropagation();
                            if (!interactionDisabled) {
                                onSort?.();
                            }
                        }}
                    >
                        <Icon name={sortIconName(sortDirection)} size={16} color={iconColor} />
                    </button>
                )}
                <Text variant="14-reg" color="gray-70" className={styles.headerLabel}>
                    {children}
                </Text>
            </Flex>
        </th>
    );
};

/** Ячейка данных: разметка и интерактив — через `children` */
export const TableCell = ({
    children,
    className,
    size = 'md',
    align = 'left',
    muted = false,
    ...rest
}: TableCellProps) => (
    <td
        className={classNames(
            styles.cell,
            styles[`cell--size-${size}`],
            styles[`cell--align-${align}`],
            muted && styles['cell--muted'],
            className,
        )}
        {...rest}
    >
        {children}
    </td>
);
