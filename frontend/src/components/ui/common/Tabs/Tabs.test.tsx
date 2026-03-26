import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tabs } from './Tabs';

describe('Tabs', () => {
    it('renders tablist and tabs with labels', () => {
        render(
            <Tabs
                value="a"
                onChange={() => undefined}
                tabs={[
                    { value: 'a', label: 'First' },
                    { value: 'b', label: 'Second' },
                ]}
            ></Tabs>,
        );

        expect(screen.getByRole('tablist')).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('tab', { name: 'Second' })).toHaveAttribute(
            'aria-selected',
            'false',
        );
    });

    it('calls onChange when switching tab', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(
            <Tabs
                value="a"
                onChange={onChange}
                tabs={[
                    { value: 'a', label: 'First' },
                    { value: 'b', label: 'Second' },
                ]}
            />,
        );

        await user.click(screen.getByRole('tab', { name: 'Second' }));

        expect(onChange).toHaveBeenCalledWith('b');
    });

    it('does not call onValueChange when clicking already selected tab', async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();

        render(
            <Tabs
                value="a"
                onChange={onValueChange}
                tabs={[
                    { value: 'a', label: 'First' },
                    { value: 'b', label: 'Second' },
                ]}
            ></Tabs>,
        );

        await user.click(screen.getByRole('tab', { name: 'First' }));

        expect(onValueChange).not.toHaveBeenCalled();
    });
});
