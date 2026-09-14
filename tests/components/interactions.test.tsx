import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Keep native controls and event bubbling intact while skipping visual timelines.
vi.mock('motion/react', async () => {
    const ReactModule = await import('react');
    const components = new Map<string, React.ComponentType>();
    const visualProps = new Set(['initial', 'animate', 'exit', 'transition', 'layout', 'layoutId', 'whileInView', 'whileHover', 'whileTap', 'viewport', 'variants', 'custom']);
    return {
        motion: new Proxy({}, { get: (_target, tag: string) => {
            if (!components.has(tag)) {
                components.set(tag, ReactModule.forwardRef<HTMLElement, Record<string, unknown>>((props, ref) => {
                    const nativeProps = Object.fromEntries(Object.entries(props).filter(([key]) => !visualProps.has(key)));
                    return ReactModule.createElement(tag, { ...nativeProps, ref });
                }));
            }
            return components.get(tag);
        } }),
        AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
        useReducedMotion: () => true,
        useAnimationControls: () => ({ start: () => Promise.resolve(), stop: () => {}, set: () => {} }),
    };
});
vi.mock('@paper-design/shaders-react', () => ({ LiquidMetal: () => null }));

import FileInput from '@/components/block/file-input';
import { OTPInput } from '@/components/block/otp-input';
import { LiquidMetalButton } from '@/components/block/liquid-metal';

describe('component interactions', () => {
    it('renders a liquid metal navigation control as one native link', () => {
        render(<LiquidMetalButton href="/docs" target="_blank" rel="noopener noreferrer">Read docs</LiquidMetalButton>);
        const link = screen.getByRole('link', { name: 'Read docs' });
        expect(link).toHaveAttribute('href', '/docs');
        expect(link).toHaveAttribute('target', '_blank');
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('keeps a disabled liquid metal link out of the tab order and blocks activation', () => {
        const onClick = vi.fn();
        render(<LiquidMetalButton href="/docs" disabled onClick={onClick}>Read docs</LiquidMetalButton>);
        const control = screen.getByText('Read docs').closest('a')!;
        expect(control).not.toHaveAttribute('href');
        expect(control).toHaveAttribute('aria-disabled', 'true');
        expect(control).toHaveAttribute('tabindex', '-1');
        fireEvent.click(control);
        expect(onClick).not.toHaveBeenCalled();
    });

    it('opens the native file picker from a keyboard-focusable upload button', async () => {
        const user = userEvent.setup();
        const { container } = render(<FileInput />);
        const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
        const openPicker = vi.spyOn(input, 'click');
        await user.tab();
        expect(screen.getByRole('button', { name: 'Upload a file' })).toHaveFocus();
        await user.keyboard('{Enter}');
        expect(openPicker).toHaveBeenCalledTimes(1);
    });

    it('rejects multiple dropped files in single-file mode', () => {
        const onFileChange = vi.fn();
        render(<FileInput onFileChange={onFileChange} />);
        const files = [new File(['first'], 'first.png', { type: 'image/png' }), new File(['second'], 'second.png', { type: 'image/png' })];
        fireEvent.drop(screen.getByRole('button', { name: 'Upload a file' }), { dataTransfer: { files } });
        expect(screen.getByRole('alert')).toHaveTextContent('Choose only one file.');
        expect(onFileChange).not.toHaveBeenCalled();
    });

    it('accepts wildcard file types and forwards all files when enabled', async () => {
        const onFileChange = vi.fn().mockResolvedValue(undefined);
        render(<FileInput accept="image/*" allowMultiple onFileChange={onFileChange} />);
        const files = [new File(['first'], 'first.webp', { type: 'image/webp' }), new File(['second'], 'second.png', { type: 'image/png' })];
        fireEvent.drop(screen.getByRole('button', { name: 'Upload a file' }), { dataTransfer: { files } });
        await waitFor(() => expect(onFileChange).toHaveBeenCalledWith(files));
    });

    it('keeps OTP instances independent and supports pasting a complete code', async () => {
        const user = userEvent.setup();
        const firstSuccess = vi.fn();
        const secondSuccess = vi.fn();
        render(<><OTPInput onSuccess={firstSuccess} /><OTPInput correctOTP="123456" onSuccess={secondSuccess} /></>);
        const groups = screen.getAllByRole('group', { name: 'OTP Verification' });
        const firstInputs = within(groups[0]).getAllByRole('textbox');
        const secondInputs = within(groups[1]).getAllByRole('textbox');
        expect(firstInputs[0].id).not.toBe(secondInputs[0].id);
        await user.click(secondInputs[0]);
        await user.paste('123456');
        expect(secondSuccess).toHaveBeenCalledTimes(1);
        expect(firstSuccess).not.toHaveBeenCalled();
        firstInputs.forEach((input) => expect(input).toHaveValue(''));
        expect(within(groups[1]).getByRole('status')).toHaveTextContent('OTP Verified Successfully!');
    });

});
