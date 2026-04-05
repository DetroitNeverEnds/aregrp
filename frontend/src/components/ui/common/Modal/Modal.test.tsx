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
        expect(screen.queryByText('Содержимое')).not.toBeInTheDocument();
    });

    it('рендерит содержимое при open={true}', () => {
        render(
            <Modal open onClose={vi.fn()}>
                <p>Контент</p>
            </Modal>,
        );
        expect(screen.getByText('Контент')).toBeInTheDocument();
    });

    it('вызывает onClose при клике по фону', async () => {
        const onClose = vi.fn();
        const user = userEvent.setup();
        render(
            <Modal closeOnBackdropClick open onClose={onClose}>
                <p>Внутри</p>
            </Modal>,
        );
        const backdrop = document.querySelector('[class*="backdrop"]');
        expect(backdrop).not.toBeNull();
        await user.click(backdrop!);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('не вызывает onClose по фону при closeOnBackdropClick={false}', () => {
        const onClose = vi.fn();
        render(
            <Modal open onClose={onClose} closeOnBackdropClick={false}>
                <p>Внутри</p>
            </Modal>,
        );
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
});
