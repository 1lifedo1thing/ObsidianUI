'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface GithubButtonProps {
    href?: string;
    showStars?: boolean;
    className?: string;
}

export function GithubButton({
    href = 'https://github.com/Atharvsinh-codez/ObsidianUI',
    showStars = true,
    className = '',
}: GithubButtonProps) {
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
        if (!showStars) return;

        const match = href.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) return;

        const [, owner, repo] = match;

        fetch(`https://api.github.com/repos/${owner}/${repo}`)
            .then(res => res.json())
            .then(data => {
                if (typeof data.stargazers_count === 'number') {
                    setStars(data.stargazers_count);
                }
            })
            .catch(() => setStars(null));
    }, [href, showStars]);

    const handleClick = () => {
        window.open(href, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label="View GitHub repository"
            className={cn(`
                inline-flex items-center gap-2
                px-4 py-2.5 rounded-full
                bg-white dark:bg-zinc-900
                border border-neutral-200 dark:border-zinc-700
                text-neutral-700 dark:text-neutral-300
                shadow-sm
                cursor-pointer
                transition-all duration-200 ease-out
                hover:scale-105 hover:shadow-md
                hover:bg-neutral-50 dark:hover:bg-zinc-800
                hover:border-neutral-300 dark:hover:border-zinc-600
                active:scale-100
                focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 focus:ring-offset-2
            `, className)}
        >
            {/* GitHub Icon */}
            <svg
                viewBox="0 0 16 16"
                className="w-5 h-5 flex-shrink-0"
                fill="currentColor"
                aria-hidden="true"
            >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>

            {/* Star count */}
            {showStars && stars !== null && (
                <span className="text-sm font-medium tabular-nums">
                    {stars}
                </span>
            )}
        </button>
    );
}

export default GithubButton;
