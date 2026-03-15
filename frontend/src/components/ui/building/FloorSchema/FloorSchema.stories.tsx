import type { Meta, StoryObj } from '@storybook/react-vite';

import { FloorSchema } from './FloorSchema';
import { fetchFloorRoomsMock, fetchFloorSvgMock } from './mocks';

const meta = {
    title: 'Buildings/FloorSchema',
    component: FloorSchema,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof FloorSchema>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <FloorSchema
            svg={fetchFloorSvgMock()}
            rooms={fetchFloorRoomsMock()}
            onRoomSelect={data =>
                alert(
                    Object.entries(data)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('\n'),
                )
            }
        />
    ),
};
