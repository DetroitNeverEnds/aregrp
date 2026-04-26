import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sheet } from './Sheet';

describe('Sheet', () => {
    it('не рендерит панель при open={false}', () => {
        render(
            <Sheet open={false} onClose={vi.fn()}>
                <p>Содержимое</p>
            </Sheet>,
        );
        expect(screen.queryByText('Содержимое')).not.toBeInTheDocument();
    });

    it('рендерит содержимое при open={true}', () => {
        render(
            <Sheet open onClose={vi.fn()}>
                <p>Контент</p>
            </Sheet>,
        );
        expect(screen.getByText('Контент')).toBeInTheDocument();
    });

    it('вызывает onClose при клике по фону', async () => {
        const onClose = vi.fn();
        const user = userEvent.setup();
        render(
            <Sheet closeOnBackdropClick open onClose={onClose}>
                <p>Внутри</p>
            </Sheet>,
        );
        const backdrop = document.querySelector('[class*="backdrop"]');
        expect(backdrop).not.toBeNull();
        await user.click(backdrop!);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('не вызывает onClose по фону при closeOnBackdropClick={false}', () => {
        const onClose = vi.fn();
        render(
            <Sheet open onClose={onClose} closeOnBackdropClick={false}>
                <p>Внутри</p>
            </Sheet>,
        );
        expect(onClose).not.toHaveBeenCalled();
    });

    it('вызывает onClose по Escape', async () => {
        const onClose = vi.fn();
        const user = userEvent.setup();
        render(
            <Sheet open onClose={onClose}>
                <p>Контент</p>
            </Sheet>,
        );
        await user.keyboard('{Escape}');
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('рендерит title', () => {
        render(
            <Sheet open onClose={vi.fn()} title="Заголовок">
                <p>Тело</p>
            </Sheet>,
        );
        expect(screen.getByText('Заголовок')).toBeInTheDocument();
    });
});
