import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Lenis from 'lenis';
import SmoothScroll from '@/components/block/smooth-scroll';

describe('SmoothScroll lifecycle', () => {
    let reduced: boolean;
    let listeners: Set<() => void>;
    let frames: Map<number, FrameRequestCallback>;

    beforeEach(() => {
        reduced = false;
        listeners = new Set();
        frames = new Map();
        let nextFrame = 1;
        vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
            get matches() { return reduced; },
            media: query,
            addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
            removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
        }) as unknown as MediaQueryList);
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            const id = nextFrame++;
            frames.set(id, callback);
            return id;
        });
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => { frames.delete(id); });
    });

    it('cancels its frame and destroys Lenis on unmount, including Strict Mode', async () => {
        const destroy = vi.spyOn(Lenis.prototype, 'destroy');
        const { unmount } = render(<React.StrictMode><SmoothScroll>Content</SmoothScroll></React.StrictMode>);
        await waitFor(() => expect(document.documentElement).toHaveClass('lenis'));
        expect(frames.size).toBe(1);
        const [id, callback] = [...frames.entries()][0];
        frames.delete(id);
        act(() => callback(100));
        expect(frames.size).toBe(1);
        unmount();
        expect(frames.size).toBe(0);
        expect(destroy).toHaveBeenCalledTimes(1);
        expect(document.documentElement).not.toHaveClass('lenis');
        expect(listeners.size).toBe(0);
    });

    it('starts without an animation loop for reduced motion and follows preference changes', async () => {
        reduced = true;
        const { unmount } = render(<SmoothScroll>Content</SmoothScroll>);
        await act(async () => {});
        expect(document.documentElement).not.toHaveClass('lenis');
        expect(frames.size).toBe(0);
        reduced = false;
        act(() => listeners.forEach((listener) => listener()));
        await waitFor(() => expect(document.documentElement).toHaveClass('lenis'));
        expect(frames.size).toBe(1);
        reduced = true;
        act(() => listeners.forEach((listener) => listener()));
        expect(document.documentElement).not.toHaveClass('lenis');
        expect(frames.size).toBe(0);
        unmount();
    });

    it('does not create Lenis after an unmount during the dynamic import', async () => {
        const { unmount } = render(<SmoothScroll>Content</SmoothScroll>);
        unmount();
        await act(async () => {});
        expect(document.documentElement).not.toHaveClass('lenis');
        expect(frames.size).toBe(0);
    });
});
