import type React from 'react';
import type { IconName } from '@/components/ui/common/Icon';
import type { PaginationProps } from '@/components/ui/common/Pagination';

/** Ширина корневой таблицы: на всю ширину контейнера или по содержимому */
export type TableWidth = 'auto' | 'max';

/** Пропсы корневого элемента `<table>` плюс опции оформления */
export interface TableProps extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'width'> {
    /** Чередование фона строк (зебра) в `tbody` */
    striped?: boolean;
    /** Подсветка строки при наведении курсора */
    hoverableRows?: boolean;
    /**
     * Ширина таблицы: `max` — 100% контейнера, `auto` — по содержимому (`width: auto`).
     * @default 'max'
     */
    width?: TableWidth;
}

/** Направление сортировки для отображения в шапке колонки */
export type TableSortDirection = 'asc' | 'desc' | null;
/** Высота / плотность ячейки заголовка */
export type TableHeaderCellSize = 'sm' | 'md' | 'lg';
/** Горизонтальное выравнивание заголовка колонки */
export type TableHeaderCellAlign = 'left' | 'right';
/** Высота / плотность ячейки тела таблицы */
export type TableCellSize = 'sm' | 'md' | 'lg' | 'xl' | 'auto';
/** Горизонтальное выравнивание содержимого ячейки */
export type TableCellAlign = 'left' | 'right' | 'center';
/** Вариант отображения содержимого ячейки */
export type TableCellVariant = 'text' | 'supporting' | 'action';

type HorizontalPlacement = 'start' | 'end' | 'center';

export function horizontalPlacementFromCellAlign(align: TableCellAlign): HorizontalPlacement {
    if (align === 'right') {
        return 'end';
    }
    if (align === 'center') {
        return 'center';
    }
    return 'start';
}

export function horizontalPlacementFromHeaderAlign(
    align: TableHeaderCellAlign,
): HorizontalPlacement {
    return align === 'right' ? 'end' : 'start';
}

export function sortIconName(dir: 'asc' | 'desc' | null | undefined): IconName {
    if (dir === 'asc') {
        return 'chevron-up';
    }
    if (dir === 'desc') {
        return 'chevron-down';
    }
    return 'switch-vertical';
}

/** Пропсы ячейки заголовка `<th>` */
export interface TableHeaderCellProps extends Omit<
    React.ThHTMLAttributes<HTMLTableCellElement>,
    'align'
> {
    /** Размер (высота) ячейки шапки */
    size?: TableHeaderCellSize;
    /** Выравнивание текста и контролов в шапке */
    align?: TableHeaderCellAlign;
    /** Акцентная подсветка колонки (активная сортировка и т.п.) */
    active?: boolean;
    /** Показывать контрол сортировки (иконка) */
    sortable?: boolean;
    /** Текущее направление сортировки для иконки */
    sortDirection?: TableSortDirection;
    /** Обработчик клика по сортировке */
    onSort?: () => void;
    /** Отключить кнопку сортировки (например на время загрузки) */
    interactionDisabled?: boolean;
}

/** Пропсы ячейки тела таблицы `<td>` */
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    /** Размер (высота) ячейки */
    size?: TableCellSize;
    /** Выравнивание содержимого */
    align?: TableCellAlign;
    /**
     * Вариант содержимого: одна строка, две строки с подписью или кнопка действия.
     * При `action` можно передать `children` вместо стандартной кнопки.
     */
    variant?: TableCellVariant;
    /** Вторичная строка под основным текстом (для `variant="supporting"`) */
    supportingText?: React.ReactNode;
    /** Подпись кнопки при `variant="action"` и отсутствии `children` */
    actionLabel?: string;
    /** Обработчик клика по кнопке при `variant="action"` */
    onAction?: () => void;
    /** Приглушённый фон ячейки */
    muted?: boolean;
}

/** Пропсы пагинации под таблицей (как у компонента `Pagination`) */
export type DataTablePaginationProps = PaginationProps;

/**
 * Плотность строк и шапки по вертикали (`min-height` у ячеек).
 * Соответствует `TableCellSize`, кроме `auto` (он только для отдельных ячеек).
 */
export type DataTableSize = Exclude<TableCellSize, 'auto'>;

/**
 * Колонка `DataTable`.
 *
 * Контент ячейки: `render`, `accessorKey` и/или `supportingAccessorKey`.
 * Приоритет: `render` → иначе при наличии `supportingAccessorKey` двухстрочная ячейка (основной текст из `accessorKey`, вторичный из `supportingAccessorKey`) → иначе значение по `accessorKey`.
 */
export interface TableColumn<T> {
    /** Стабильный идентификатор колонки (в т.ч. для `key` у ячеек в строке) */
    id: string;
    /** Заголовок в `<th>` */
    header: React.ReactNode;
    /** Высота / плотность шапки колонки; перекрывает `size` у `DataTable` */
    headerSize?: TableHeaderCellSize;
    /** Выравнивание заголовка */
    headerAlign?: TableHeaderCellAlign;
    /** Колбэк при клике по сортировке в шапке (если задан — показывается контрол сортировки) */
    sortable?: () => void;
    /** Направление сортировки для иконки в шапке (задаёт родитель) */
    sortDirection?: TableSortDirection;
    /** Подсветка активной колонки в шапке */
    sortActive?: boolean;
    /** Дополнительный CSS-класс для `<th>` этой колонки */
    thClassName?: string;
    /** Дополнительный CSS-класс для `<td>` этой колонки */
    tdClassName?: string;
    /** Размер ячейки тела таблицы; перекрывает `size` у `DataTable` */
    cellSize?: TableCellSize;
    /** Выравнивание содержимого ячейки */
    cellAlign?: TableCellAlign;
    /** Приглушённый фон ячейки */
    muted?: boolean;

    /** Поле строки `T` для основного текста (одна строка или первая при двухстрочном режиме) */
    accessorKey?: keyof T;
    /** Поле строки `T` для второй строки; не используется, если задан `render` */
    supportingAccessorKey?: keyof T;
    /** Полный контент ячейки; имеет приоритет над полями `accessorKey` */
    render?: (ctx: { row: T; index: number }) => React.ReactNode;
}

export interface DataTableProps<T> {
    /** Строки текущей страницы (или весь список без постраничности) */
    data: T[];
    /** Описание колонок */
    columns: TableColumn<T>[];
    /**
     * Плотность строк и шапки: задаёт `min-height` для всех колонок, пока не переопределено
     * через `cellSize` / `headerSize` у колонки.
     */
    size?: DataTableSize;
    /** Чередование фона строк (зебра) */
    striped?: boolean;
    /** Подсветка строки при наведении */
    hoverableRows?: boolean;
    /** Пагинация под таблицей */
    pagination?: DataTablePaginationProps;
    /** Содержимое при пустом `data` и `!isLoading` */
    emptyContent?: React.ReactNode;
    /** Загрузка: тело таблицы заменяется строкой с лоадером */
    isLoading?: boolean;
    /**
     * Явный ключ строки в `tbody`. Если не задан, для объектов берётся поле `id`
     * (строка / число / bigint), для примитивных строк данных — само значение.
     * Индекс используется только если иначе извлечь ключ нельзя (в dev — предупреждение в консоль).
     */
    getRowId?: (row: T, index: number) => React.Key;
    /** CSS-класс на `<table>` */
    className?: string;
    /**
     * Ширина таблицы: `max` — на всю ширину контейнера, `auto` — по содержимому.
     * @default 'max'
     */
    width?: TableWidth;
    /** Остальные атрибуты `<table>` (кроме `className`, `children` и `width`) */
    tableProps?: Omit<
        React.TableHTMLAttributes<HTMLTableElement>,
        'className' | 'children' | 'width'
    >;
}

/**
 * Ключ строки для `DataTable`: `getRowId` → поле `id` у объекта → примитив как строка данных → индекс (крайний случай).
 */
export function resolveDataTableRowKey<T>(
    row: T,
    index: number,
    getRowId?: (row: T, index: number) => React.Key,
): React.Key {
    if (getRowId) {
        return getRowId(row, index);
    }
    if (row !== null && typeof row === 'object' && 'id' in (row as object)) {
        const id = (row as unknown as { id: unknown }).id;
        if (
            id != null &&
            (typeof id === 'string' || typeof id === 'number' || typeof id === 'bigint')
        ) {
            return id;
        }
    }
    if (typeof row === 'string' || typeof row === 'number' || typeof row === 'bigint') {
        return row;
    }
    if (import.meta.env.DEV) {
        console.warn(
            '[DataTable] Нет стабильного ключа строки: передайте `getRowId` или поле `id` у каждой строки. Используется индекс.',
        );
    }
    return index;
}

export function headerSortActive<T>(column: TableColumn<T>): boolean {
    return (
        column.sortActive === true ||
        column.sortDirection === 'asc' ||
        column.sortDirection === 'desc'
    );
}

/** В шапке нет токена `xl`; для согласованной высоты с строками `xl` используем `lg`. */
export function headerSizeForTableSize(tableSize: DataTableSize): TableHeaderCellSize {
    return tableSize === 'xl' ? 'lg' : tableSize;
}
