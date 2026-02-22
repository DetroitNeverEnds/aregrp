import type { PropsWithChildren } from 'react';
import { Button } from '@/components/ui/common/Button';
import { Flex } from '@/components/ui/common/Flex';
import { Pagination } from '@/components/ui/common/Pagination';
import Container from '@/components/ui/layout/Container';

export type PaginationConfig = {
    currentPage: number;
    totalPages: number;
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
            <Flex direction="row" justify="between" gap={24} fullWidth>
                {props.children}
            </Flex>
            {props.pagination && (
                <Pagination
                    initialPage={props.pagination.currentPage}
                    totalPages={props.pagination.totalPages}
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
