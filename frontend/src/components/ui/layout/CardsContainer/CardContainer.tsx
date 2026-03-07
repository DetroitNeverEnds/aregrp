import type { PropsWithChildren } from 'react';
import { Button } from '@/components/ui/common/Button';
import { Pagination } from '@/components/ui/common/Pagination';
import Container from '@/components/ui/layout/Container';

import styles from './CardContainer.module.scss';

export type PaginationConfig = {
    currentPage?: number;
    totalPages?: number;
    onPageChange: (page: number) => void;
};

export type CardContainerProps = PropsWithChildren & {
    children: React.ReactNode;
    pagination?: PaginationConfig;
    loadMore?: () => void;
};

export const CardContainer = (props: CardContainerProps) => {
    return (
        <Container align="center">
            <div className={styles.container}>{props.children}</div>
            {props.pagination && (
                <Pagination
                    currentPage={props.pagination.currentPage || 1}
                    totalPages={props.pagination.totalPages || 1}
                    onPageChange={props.pagination.onPageChange}
                />
            )}
            {props.loadMore && (
                <Button variant="outlined" onClick={props.loadMore}>
                    Показать еще
                </Button>
            )}
        </Container>
    );
};
