import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../Button';
import { FlatButton } from '../FlatButton';
import { Flex } from '../Flex';
import { Icon } from '../Icon';
import { TextInput } from '../input/TextInput';
import Text from '../Text/Text';
import storyStyles from './Modal.stories.module.scss';

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
        const titleId = useId();
        const onClose = () => setOpen(false);

        return (
            <div style={{ padding: 24 }}>
                <Button variant="primary" onClick={() => setOpen(true)}>
                    Открыть модальное окно
                </Button>
                <Modal open={open} onClose={onClose} aria-labelledby={titleId}>
                    <div className={storyStyles.demo}>
                        <div className={storyStyles.header}>
                            <FlatButton type="button" aria-label="Закрыть" onClick={onClose}>
                                <Icon name="x-close" size={30} aria-hidden />
                            </FlatButton>
                        </div>
                        <div className={storyStyles.body}>
                            <div className={storyStyles.block}>
                                <div className={storyStyles.titleBlock} id={titleId}>
                                    <Text variant="h3" color="gray-100">
                                        Объект:
                                    </Text>
                                    <Text variant="h3" color="gray-100">
                                        Роторная 1д
                                    </Text>
                                </div>
                                <div className={storyStyles.details}>
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
                                </div>
                                <Text variant="14-med" color="gray-50">
                                    Нет письма? Проверьте папку «Спам»
                                </Text>
                                <Text variant="24-med" color="gray-100">
                                    Создание ссылки
                                </Text>
                                <div className={storyStyles.fields}>
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
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                theme="light"
                                size="lg"
                                width="max"
                                type="button"
                            >
                                Сгенерировать ссылку
                            </Button>
                        </div>
                    </div>
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
