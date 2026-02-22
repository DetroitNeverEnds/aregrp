import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import styles from './Pagination.module.scss';
import { Flex } from '@/components/ui/common/Flex';
import { Button } from '@/components/ui/common/Button';
import Text from '@/components/ui/common/Text';

export type PaginationProps = {
    /** Текущая страница (1-based) */
    initialPage: number;
    /** Общее количество страниц */
    totalPages: number;
    /** Callback при выборе страницы */
    onPageChange: (page: number) => void;
    /** Дополнительный CSS класс */
    className?: string;
};

/**
 * Компонент пагинации
 * Отображает навигацию по страницам с кнопками перехода
 */
export const Pagination: React.FC<PaginationProps> = ({
    initialPage,
    totalPages,
    onPageChange,
    className,
}) => {
    const [currentPage, setCurrentPage] = useState(initialPage || 1);
    const pages = useMemo(
        () => ({
            hasLeadingEclipsis: totalPages >= 5 && currentPage > 3,
            hasTrailingEclipsis: totalPages >= 5 && currentPage < totalPages - 2,
            pageNumbers: [currentPage - 1, currentPage, currentPage + 1].filter(
                page => page > 1 && page < totalPages,
            ),
        }),
        [currentPage, totalPages],
    );

    const handlePageClick = (page: number) => {
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            onPageChange(page);
        }
    };

    return (
        <Flex
            direction="row"
            align="center"
            gap={4}
            className={classNames(styles.pagination, className)}
        >
            <Button
                variant="outlined"
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
                icon="chevron-left"
                onlyIcon
            />

            <Button
                variant={currentPage === 1 ? 'primary' : 'flat'}
                onClick={() => handlePageClick(1)}
            >
                1
            </Button>
            {pages.hasLeadingEclipsis && <Text>...</Text>}
            {pages.pageNumbers.map(page => (
                <Button
                    key={page}
                    variant={currentPage === page ? 'primary' : 'flat'}
                    onClick={() => handlePageClick(page)}
                >
                    {page}
                </Button>
            ))}
            {pages.hasTrailingEclipsis && <Text>...</Text>}
            {totalPages > 1 && (
                <Button
                    variant={currentPage === totalPages ? 'primary' : 'flat'}
                    onClick={() => handlePageClick(totalPages)}
                >
                    {totalPages}
                </Button>
            )}

            <Button
                variant="outlined"
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
                icon="chevron-right"
                onlyIcon
            />
        </Flex>
    );
};

export default Pagination;
