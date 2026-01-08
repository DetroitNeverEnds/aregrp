import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
    it('должен рендериться без ошибок', () => {
        render(<App />);
        expect(document.body).toBeTruthy();
    });

    it('должен содержать основной контент', () => {
        const { container } = render(<App />);
        expect(container.firstChild).toBeTruthy();
    });
});
