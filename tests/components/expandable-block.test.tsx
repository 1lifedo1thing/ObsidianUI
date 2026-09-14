import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('motion/react', async importOriginal => ({
  ...await importOriginal<typeof import('motion/react')>(),
  useReducedMotion: () => true,
}));

import { ExpandableBlock } from '@/components/docs/expandable-block';

describe('expandable documentation source', () => {
  let contentHeight: number;
  let heightLimit: number | undefined;
  let notifyResize: () => void;
  let observers: Set<() => void>;

  beforeEach(() => {
    contentHeight = 800;
    heightLimit = undefined;
    observers = new Set();
    vi.stubGlobal('ResizeObserver', class {
      notify: () => void;
      constructor(callback: ResizeObserverCallback) {
        this.notify = () => callback([], this as unknown as ResizeObserver);
        observers.add(this.notify);
      }
      observe() {}
      disconnect() { observers.delete(this.notify); }
    });
    const originalBounds = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const bounds = originalBounds.call(this);
      if (this.classList.contains('docs-expandable-content')) {
        return { ...bounds, height: contentHeight };
      }
      if (this.classList.contains('docs-expandable-limit')) {
        return { ...bounds, height: heightLimit ?? parseFloat(this.style.height) };
      }
      return bounds;
    });
    notifyResize = () => act(() => observers.forEach(notify => notify()));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps a short supporting snippet at its natural height without a fade or disclosure control', () => {
    contentHeight = 128;
    const source = 'export function cn(...inputs) {\n  return twMerge(clsx(inputs));\n}';
    const { container, unmount } = render(<ExpandableBlock><pre><code>{source}</code></pre></ExpandableBlock>);
    notifyResize();
    const content = container.querySelector('.docs-expandable-content')!;
    expect(content.parentElement).toHaveStyle({ height: 'auto' });
    expect(content.parentElement?.style.maxHeight).toBe('');
    expect(screen.queryByRole('button', { name: /Show More|Show Less/ })).not.toBeInTheDocument();
    expect(container.querySelector('.docs-expandable-fade')).not.toBeInTheDocument();
    expect(content.textContent).toBe(source);
    unmount();
    expect(observers.size).toBe(0);
  });

  it('expands and collapses from the keyboard while keeping the original code and control relationship', async () => {
    const user = userEvent.setup();
    render(<ExpandableBlock initialHeight="160px"><pre><code>{'const example = 1;\nexport default example;'}</code></pre></ExpandableBlock>);
    notifyResize();
    const button = screen.getByRole('button', { name: 'Show More' });
    const content = document.getElementById(button.getAttribute('aria-controls')!);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(content).toHaveStyle({ height: '160px' }));
    button.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Show Less' })).toBe(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(content).toHaveStyle({ height: 'auto' }));
    expect(content?.textContent).toBe('const example = 1;\nexport default example;');
    await user.keyboard(' ');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(content).toHaveStyle({ height: '160px' }));
    expect(button).toHaveFocus();
  });

  it('gives separate code blocks independent disclosure controls', async () => {
    const user = userEvent.setup();
    render(<><ExpandableBlock><pre>First source</pre></ExpandableBlock><ExpandableBlock><pre>Second source</pre></ExpandableBlock></>);
    notifyResize();
    const [first, second] = screen.getAllByRole('button', { name: 'Show More' });
    expect(first.getAttribute('aria-controls')).not.toBe(second.getAttribute('aria-controls'));
    await user.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(second).toHaveAttribute('aria-expanded', 'false');
  });

  it('removes disclosure after content shrinks and starts collapsed when longer content returns', async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<ExpandableBlock><pre>Long source</pre></ExpandableBlock>);
    notifyResize();
    await user.click(screen.getByRole('button', { name: 'Show More' }));
    expect(screen.getByRole('button', { name: 'Show Less' })).toBeInTheDocument();

    contentHeight = 120;
    rerender(<ExpandableBlock><pre>Short source</pre></ExpandableBlock>);
    notifyResize();
    expect(screen.queryByRole('button', { name: /Show More|Show Less/ })).not.toBeInTheDocument();
    const content = container.querySelector('.docs-expandable-content')!.parentElement;
    await waitFor(() => expect(content).toHaveStyle({ height: 'auto' }));

    contentHeight = 600;
    rerender(<ExpandableBlock><pre>Longer source</pre></ExpandableBlock>);
    notifyResize();
    expect(screen.getByRole('button', { name: 'Show More' })).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(content).toHaveStyle({ height: '400px' }));
  });

  it('remeasures responsive height limits and content wrapping without replacing the source', async () => {
    heightLimit = 400;
    const { container, rerender } = render(<ExpandableBlock initialHeight="50vh"><pre>Unchanged source</pre></ExpandableBlock>);
    notifyResize();
    expect(screen.getByRole('button', { name: 'Show More' })).toBeInTheDocument();

    heightLimit = 900;
    notifyResize();
    expect(screen.queryByRole('button', { name: 'Show More' })).not.toBeInTheDocument();
    const content = container.querySelector('.docs-expandable-content')!.parentElement;
    await waitFor(() => expect(content).toHaveStyle({ height: 'auto' }));

    heightLimit = undefined;
    rerender(<ExpandableBlock initialHeight="200px"><pre>Unchanged source</pre></ExpandableBlock>);
    notifyResize();
    expect(screen.getByRole('button', { name: 'Show More' })).toBeInTheDocument();
    await waitFor(() => expect(content).toHaveStyle({ height: '200px' }));
    expect(content?.textContent).toBe('Unchanged source');
  });
});
