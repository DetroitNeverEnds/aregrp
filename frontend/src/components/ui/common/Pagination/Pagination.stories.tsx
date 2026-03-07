import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Pagination } from './Pagination';
import _ from 'lodash';

const meta = {
    title: 'UI/Common/Pagination',
    component: Pagination,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper для управления состоянием
const PaginationWithState = (args: { totalPages: number; initialPage?: number }) => {
    const [currentPage, setCurrentPage] = useState(args.initialPage || 1);

    return (
        <Pagination
            currentPage={currentPage}
            totalPages={args.totalPages}
            onPageChange={setCurrentPage}
        />
    );
};

export const Default: Story = {
    render: () => <PaginationWithState totalPages={10} />,
};

export const FewPages: Story = {
    render: () => <PaginationWithState totalPages={5} />,
};

export const ManyPages: Story = {
    render: () => <PaginationWithState totalPages={102} />,
};

export const CurrentPageNearStart: Story = {
    render: () => <PaginationWithState totalPages={50} initialPage={3} />,
};

export const CurrentPageInMiddle: Story = {
    render: () => <PaginationWithState totalPages={50} initialPage={25} />,
};

export const CurrentPageNearEnd: Story = {
    render: () => <PaginationWithState totalPages={50} initialPage={48} />,
};

export const OneSixPages: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {_.range(1, 7).map(i => (
                <PaginationWithState totalPages={i} key={i} />
            ))}
        </div>
    ),
};
