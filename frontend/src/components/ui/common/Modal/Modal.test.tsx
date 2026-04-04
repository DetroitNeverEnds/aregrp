import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
    it('не рендерит диалог при open={false}', () => {
        render(
            <Modal open={false} onClose={vi.fn()}>
                <p>Содержимое</p>
            </Modal>,
        );
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('рендерит dialog при open={true}', () => {
        render(
            <Modal open onClose={vi.fn()}>
                <p>Контент</p>
            </Modal>,
        );
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Контент')).toBeInTheDocument();
    });

    it('вызывает onClose при клике по фону', async () => {
        const onClose = vi.fn();
        const user = userEvent.setup();
        render(
            <Modal open onClose={onClose}>
                <p>Внутри</p>
            </Modal>,
        );
        await user.click(screen.getByTestId('modal-backdrop'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('не вызывает onClose по фону при closeOnBackdropClick={false}', async () => {
        const onClose = vi.fn();
        const user = userEvent.setup();
        render(
            <Modal open onClose={onClose} closeOnBackdropClick={false}>
                <p>Внутри</p>
            </Modal>,
        );
        await user.click(screen.getByTestId('modal-backdrop'));
        expect(onClose).not.toHaveBeenCalled();
    });

    it('вызывает onClose по Escape', async () => {
        const onClose = vi.fn();
        const user = userEvent.setup();
        render(
            <Modal open onClose={onClose}>
                <p>Контент</p>
            </Modal>,
        );
        await user.keyboard('{Escape}');
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('прокидывает aria-labelledby на dialog', () => {
        render(
            <Modal open onClose={vi.fn()} aria-labelledby="modal-title">
                <h2 id="modal-title">Заголовок</h2>
            </Modal>,
        );
        expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title');
    });
});
