import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Sheet } from './Sheet';
import { Button } from '@/components/ui/common/Button';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text/Text';

const meta = {
    title: 'UI/Common/Sheet',
    component: Sheet,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BottomSheet: Story = {
    name: 'Bottom sheet',
    render: function BottomSheetRender() {
        const [open, setOpen] = useState(false);
        return (
            <div style={{ padding: 24 }}>
                <Button variant="primary" onClick={() => setOpen(true)}>
                    Открыть sheet
                </Button>
                <Sheet
                    open={open}
                    onClose={() => setOpen(false)}
                    title={<Text variant="18-med">Действие</Text>}
                    direction="column"
                    gap={16}
                    align="start"
                >
                    <Text variant="14-reg" color="gray-70">
                        Контент выезжает снизу, как на мобильных экранах.
                    </Text>
                    <Button variant="primary" width="max" type="button" onClick={() => setOpen(false)}>
                        Готово
                    </Button>
                </Sheet>
            </div>
        );
    },
};

export const WithoutTitle: Story = {
    render: function WithoutTitleRender() {
        const [open, setOpen] = useState(false);
        return (
            <div style={{ padding: 24 }}>
                <Button variant="primary" onClick={() => setOpen(true)}>
                    Открыть
                </Button>
                <Sheet open={open} onClose={() => setOpen(false)} direction="column" gap={12}>
                    <Flex direction="column" gap={8} fullWidth align="start">
                        <Text variant="16-reg">Только контент и крестик</Text>
                    </Flex>
                </Sheet>
            </div>
        );
    },
};
