import React from 'react';
import classNames from 'classnames';
import styles from './TablePrimitives.module.scss';
import { Icon } from '@/components/ui/common/Icon';
import { Flex } from '@/components/ui/common/Flex';
import type { TableProps, TableHeaderCellProps, TableCellProps } from './types';
import { horizontalPlacementFromHeaderAlign, sortIconName } from './types';

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

    const ariaSort: React.AriaAttributes['aria-sort'] = !sortable
        ? undefined
        : sortDirection === 'asc'
          ? 'ascending'
          : sortDirection === 'desc'
            ? 'descending'
            : 'none';

    return (
        <th
            scope={scope}
            aria-sort={ariaSort}
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
                        aria-label="Сортировка"
                    >
                        <Icon
                            name={sortIconName(sortDirection)}
                            size={16}
                            color={iconColor}
                            aria-hidden
                        />
                    </button>
                )}
                <span className={styles.headerLabel}>{children}</span>
            </Flex>
        </th>
    );
};

/** Ячейка данных: текст, две строки или действие */
export const TableCell = ({
    children,
    className,
    size = 'md',
    align = 'left',
    muted = false,
    ...rest
}: TableCellProps) => {
    return (
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
};
