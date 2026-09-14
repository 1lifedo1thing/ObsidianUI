import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DocsCopyPage } from '@/components/docs/docs-copy-page';

const sourceCode = '# Hover Image\n\n```tsx\n<HoverImg />\n```\n';

describe('documentation Copy Page menu', () => {
  it('copies the complete page with confirmation and supports clipboard retry', async () => {
    const writeText = vi.fn().mockRejectedValueOnce(new Error('denied')).mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(<DocsCopyPage sourceCode={sourceCode} pathname="/docs/hover-img" />);
    const copy = screen.getByRole('button', { name: 'Copy page' });
    fireEvent.click(copy);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Unable to copy'));
    expect(writeText).toHaveBeenCalledWith(sourceCode);
    fireEvent.click(copy);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/^Copied$/));
    expect(copy).toBeEnabled();
    expect(writeText).toHaveBeenCalledTimes(2);
  });

  it('offers the five reference actions with local Markdown and canonical assistant URLs', async () => {
    const user = userEvent.setup();
    render(<DocsCopyPage sourceCode={sourceCode} pathname="/docs/hover-img" />);
    await user.click(screen.getByRole('button', { name: 'Open page actions' }));
    const items = await screen.findAllByRole('menuitem');
    expect(items.map(item => item.textContent?.trim())).toEqual(['View as Markdown', 'Open in v0', 'Open in ChatGPT', 'Open in Claude', 'Open in Scira']);
    expect(items[0]).toHaveAttribute('href', '/api/docs/hover-img/markdown');
    for (const [index, origin] of ['https://v0.dev', 'https://chatgpt.com', 'https://claude.ai', 'https://scira.ai'].entries()) {
      const url = new URL(items[index + 1].getAttribute('href')!);
      expect(url.origin).toBe(origin);
      expect(url.searchParams.get('q')).toContain('ObsidianUI documentation: https://www.obsidianui.dev/docs/hover-img');
      expect(url.searchParams.get('q')).not.toContain('localhost');
    }
    for (const item of items) {
      expect(item).toHaveAttribute('target', '_blank');
      expect(item).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('opens from the keyboard, moves through the options, and returns focus on Escape', async () => {
    const user = userEvent.setup();
    render(<DocsCopyPage sourceCode={sourceCode} pathname="/docs/hover-img" />);
    const trigger = screen.getByRole('button', { name: 'Open page actions' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(await screen.findByRole('menuitem', { name: 'View as Markdown' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Open in v0' })).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});
