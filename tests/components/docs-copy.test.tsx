import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodeBlock, Dependencies } from '@/components/docs/component-installation';

describe('documentation installation copy', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('copies nested installation code instead of clearing the clipboard', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
        render(<Dependencies title="Install dependencies"><CodeBlock code="npm install motion" /></Dependencies>);
        fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
        await waitFor(() => expect(writeText).toHaveBeenCalledWith('npm install motion'));
        await waitFor(() => expect(screen.getAllByRole('status').some(element => element.textContent === 'Copied')).toBe(true));
    });

    it('reports clipboard errors and does not claim success', async () => {
        const writeText = vi.fn().mockRejectedValueOnce(new Error('denied')).mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
        render(<Dependencies title="Install dependencies"><CodeBlock code="npm install motion" /></Dependencies>);
        fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
        await waitFor(() => expect(screen.getAllByRole('status').some(element => element.textContent?.includes('Unable to copy'))).toBe(true));
        expect(screen.queryByText('Copied')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
        await waitFor(() => expect(screen.getAllByRole('status').some(element => element.textContent === 'Copied')).toBe(true));
        expect(writeText).toHaveBeenLastCalledWith('npm install motion');
    });

    it('keeps one copy action when MDX wraps a code block in another component', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
        function MdxCode({ code }: { code: string }) { return <CodeBlock code={code} />; }
        render(<Dependencies title="Install dependencies"><MdxCode code="npm install motion" /></Dependencies>);
        expect(screen.getAllByRole('button', { name: 'Copy code' })).toHaveLength(1);
        fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
        await waitFor(() => expect(writeText).toHaveBeenCalledWith('npm install motion'));
    });

    it('loads same-origin source files on demand and copies the selected companion stylesheet', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
        const fetchSource = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ name: 'demo', files: [
            { path: 'components/block/demo.tsx', content: 'export const Demo = () => null;' },
            { path: 'components/block/demo.css', content: '.demo { color: red; }' },
        ] }) });
        vi.stubGlobal('fetch', fetchSource);
        render(<Dependencies title="Copy the source code" source="demo"><p>Copy each file.</p></Dependencies>);
        expect(fetchSource).not.toHaveBeenCalled();
        expect(screen.queryByRole('button', { name: 'Copy code' })).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'View source files' }));
        await screen.findByLabelText('Source file');
        expect(fetchSource).toHaveBeenCalledWith('/r/demo.json', expect.objectContaining({ cache: 'no-store', signal: expect.any(AbortSignal) }));
        fireEvent.change(screen.getByLabelText('Source file'), { target: { value: 'components/block/demo.css' } });
        fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
        await waitFor(() => expect(writeText).toHaveBeenCalledWith('.demo { color: red; }'));
    });

    it('offers retry when the local source manifest is unavailable', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
        render(<Dependencies title="Copy the source code" source="demo" />);
        fireEvent.click(screen.getByRole('button', { name: 'View source files' }));
        expect(await screen.findByRole('button', { name: 'Retry loading source' })).toBeEnabled();
        expect(screen.getByText(/Source files could not be loaded/)).toBeInTheDocument();
        expect(screen.queryByLabelText('Source file')).not.toBeInTheDocument();
    });
});
