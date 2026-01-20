import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Divider } from './Divider';
import styles from './Divider.module.scss';

describe('Divider', () => {
    it('рендерится без ошибок', () => {
        const { container } = render(<Divider />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('применяет горизонтальную ориентацию по умолчанию', () => {
        const { container } = render(<Divider />);
        const divider = container.firstChild as HTMLElement;
        expect(divider).toHaveClass(styles['divider--horizontal']);
    });

    it('применяет вертикальную ориентацию', () => {
        const { container } = render(<Divider orientation="vertical" />);
        const divider = container.firstChild as HTMLElement;
        expect(divider).toHaveClass(styles['divider--vertical']);
    });

    it('применяет дополнительный className', () => {
        const { container } = render(<Divider className="custom-class" />);
        const divider = container.firstChild as HTMLElement;
        expect(divider).toHaveClass('custom-class');
    });
});
