import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FloorView } from './FloorView';
import { Loader } from '../Loader';
import { fetchFloorRoomsMock, fetchFloorSvgMock } from './mocks';
import type { FloorRoom } from './types';

const FloorViewStoryWrapper: React.FC = () => {
    const [svg, setSvg] = useState<string | null>(null);
    const [rooms, setRooms] = useState<FloorRoom[] | null>(null);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            const [svgResult, roomsResult] = await Promise.all([
                fetchFloorSvgMock(),
                fetchFloorRoomsMock(),
            ]);

            if (!isMounted) {
                return;
            }

            setSvg(svgResult);
            setRooms(roomsResult);
        };

        void load();

        return () => {
            isMounted = false;
        };
    }, []);

    if (!svg || !rooms) {
        return <Loader variant="block" height={470} />;
    }

    return <FloorView svg={svg} rooms={rooms} />;
};

const meta = {
    title: 'UI/Common/FloorView',
    component: FloorView,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof FloorView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <FloorViewStoryWrapper />,
};
