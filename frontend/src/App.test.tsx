import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App', () => {
    it('должен рендериться без ошибок', () => {
        render(
            <BrowserRouter>
                <App />
            </BrowserRouter>,
        );
        expect(document.body).toBeTruthy();
    });

    it('должен содержать основной контент', () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/auth/login']}>
                <App />
            </MemoryRouter>,
        );
        expect(container.querySelector('form')).toBeInTheDocument();
    });
});
