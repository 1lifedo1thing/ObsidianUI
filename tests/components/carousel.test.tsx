import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const embla = vi.hoisted(() => {
    const listeners = new Map<string, Set<() => void>>();
    return {
        listeners,
        ref: () => {},
        api: {
            canScrollPrev: vi.fn(() => false),
            canScrollNext: vi.fn(() => true),
            scrollPrev: vi.fn(),
            scrollNext: vi.fn(),
            on: vi.fn((event: string, listener: () => void) => {
                if (!listeners.has(event)) listeners.set(event, new Set());
                listeners.get(event)!.add(listener);
            }),
            off: vi.fn((event: string, listener: () => void) => { listeners.get(event)?.delete(listener); }),
        },
    };
});

vi.mock('embla-carousel-react', () => ({ default: () => [embla.ref, embla.api] }));

import { Carousel, CarouselContent, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

describe('carousel state and keyboard handling', () => {
    beforeEach(() => {
        embla.listeners.clear();
        embla.api.canScrollPrev.mockReturnValue(false);
        embla.api.canScrollNext.mockReturnValue(true);
        embla.api.scrollNext.mockClear();
        embla.api.scrollPrev.mockClear();
    });

    it('updates navigation from select and reInit events and removes both subscriptions', () => {
        const { unmount } = render(<Carousel><CarouselContent /><CarouselPrevious /><CarouselNext /></Carousel>);
        expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Next slide' })).toBeEnabled();

        embla.api.canScrollPrev.mockReturnValue(true);
        embla.api.canScrollNext.mockReturnValue(false);
        act(() => embla.listeners.get('select')?.forEach((listener) => listener()));
        expect(screen.getByRole('button', { name: 'Previous slide' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled();

        embla.api.canScrollNext.mockReturnValue(true);
        act(() => embla.listeners.get('reInit')?.forEach((listener) => listener()));
        expect(screen.getByRole('button', { name: 'Next slide' })).toBeEnabled();
        unmount();
        expect(embla.listeners.get('select')?.size).toBe(0);
        expect(embla.listeners.get('reInit')?.size).toBe(0);
    });

    it('leaves arrow keys to native inputs and every editable HTML mode', () => {
        const { container } = render(<Carousel><input aria-label="Caption" /><div data-editor /><div contentEditable="plaintext-only" data-editor /></Carousel>);
        const editors = container.querySelectorAll<HTMLElement>('[data-editor]');
        editors[0].setAttribute('contenteditable', '');
        for (const element of [screen.getByRole('textbox', { name: 'Caption' }), ...editors]) {
            expect(fireEvent.keyDown(element, { key: 'ArrowRight' })).toBe(true);
        }
        expect(embla.api.scrollNext).not.toHaveBeenCalled();
        fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
        expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
    });

    it('uses vertical arrow keys for vertical navigation', () => {
        render(<Carousel orientation="vertical" />);
        fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowDown' });
        fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowUp' });
        fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
        expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
        expect(embla.api.scrollPrev).toHaveBeenCalledTimes(1);
    });
});
