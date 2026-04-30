import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/ui/common/Button';
import { Flex } from '@/components/ui/common/Flex';
import { TextInput } from '@/components/ui/common/input/TextInput';
import Text from '@/components/ui/common/Text/Text';

const meta = {
    title: 'UI/Common/Modal',
    component: Modal,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FigmaGenerateLinkDemo: Story = {
    name: 'Figma: создание ссылки',
    render: function FigmaGenerateLinkDemoRender() {
        const [open, setOpen] = useState(false);
        const [clientName, setClientName] = useState('');
        const [phone, setPhone] = useState('');
        const onClose = () => setOpen(false);

        return (
            <div style={{ padding: 24 }}>
                <Button variant="primary" onClick={() => setOpen(true)}>
                    Открыть модальное окно
                </Button>
                <Modal open={open} onClose={onClose} direction="column" gap={20} align="start">
                    <div>
                        <Flex direction="column" gap={0} fullWidth align="start">
                            <Text variant="h3" color="gray-100">
                                Объект:
                            </Text>
                            <Text variant="h3" color="gray-100">
                                Роторная 1д
                            </Text>
                        </Flex>
                    </div>
                    <Flex direction="column" gap={8} fullWidth align="start">
                        <Text variant="14-reg" style={{ color: '#333333' }}>
                            Площадь: 19,7 м2
                        </Text>
                        <Text variant="14-reg" style={{ color: '#333333' }}>
                            Этаж: 2
                        </Text>
                        <Text variant="14-reg" style={{ color: '#333333' }}>
                            Арендатор: отсутствует
                        </Text>
                        <Text variant="14-reg" style={{ color: '#333333' }}>
                            Цена: 4 287 000 ₽
                        </Text>
                    </Flex>
                    <Text variant="14-med" color="gray-50">
                        Нет письма? Проверьте папку «Спам»
                    </Text>
                    <Text variant="24-med" color="gray-100">
                        Создание ссылки
                    </Text>
                    <Flex direction="column" gap={8} fullWidth>
                        <TextInput
                            size="lg"
                            width="max"
                            placeholder="Имя клиента"
                            value={clientName}
                            onChange={setClientName}
                        />
                        <TextInput
                            size="lg"
                            width="max"
                            placeholder="Телефон"
                            value={phone}
                            onChange={setPhone}
                        />
                    </Flex>
                    <Button variant="primary" theme="light" size="lg" width="max" type="button">
                        Сгенерировать ссылку
                    </Button>
                </Modal>
            </div>
        );
    },
};

export const Minimal: Story = {
    render: function MinimalRender() {
        const [open, setOpen] = useState(false);
        return (
            <div style={{ padding: 24 }}>
                <Button variant="primary" onClick={() => setOpen(true)}>
                    Открыть
                </Button>
                <Modal open={open} onClose={() => setOpen(false)}>
                    <Flex direction="column" gap={16} style={{ padding: 40 }}>
                        <Text variant="16-reg">Произвольное содержимое</Text>
                        <Button variant="primary" onClick={() => setOpen(false)}>
                            Закрыть
                        </Button>
                    </Flex>
                </Modal>
            </div>
        );
    },
};
