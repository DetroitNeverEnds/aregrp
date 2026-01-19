import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from './Form';

describe('Form', () => {
    it('рендерится с children', () => {
        render(
            <Form>
                <input type="text" placeholder="Test input" />
            </Form>,
        );

        expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
    });

    it('применяет пользовательский className', () => {
        const { container } = render(
            <Form className="custom-class">
                <div>Content</div>
            </Form>,
        );

        const form = container.querySelector('form');
        expect(form).toHaveClass('custom-class');
    });

    it('вызывает onSubmit при отправке формы', async () => {
        const handleSubmit = vi.fn(e => e.preventDefault());
        const user = userEvent.setup();

        render(
            <Form onSubmit={handleSubmit}>
                <button type="submit">Submit</button>
            </Form>,
        );

        await user.click(screen.getByRole('button', { name: 'Submit' }));

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('передает все HTML-атрибуты формы', () => {
        const { container } = render(
            <Form id="test-form" method="post" action="/submit">
                <div>Content</div>
            </Form>,
        );

        const form = container.querySelector('form');
        expect(form).toHaveAttribute('id', 'test-form');
        expect(form).toHaveAttribute('method', 'post');
        expect(form).toHaveAttribute('action', '/submit');
    });
});
