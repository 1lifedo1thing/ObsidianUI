'use client';

import { useEffect, useState } from 'react';
import { GitHubIcon } from './github-icon';
import { cn } from '@/lib/utils';

interface GithubButtonProps {
    href?: string;
    showStars?: boolean;
    className?: string;
}

const REPOSITORY_URL = 'https://github.com/Atharvsinh-codez/ObsidianUI';
const PROJECT_API_URL = 'https://api.github.com/repos/Atharvsinh-codez/ObsidianUI';

export function GithubButton({
    href = REPOSITORY_URL,
    showStars = true,
    className = '',
}: GithubButtonProps) {
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
        if (!showStars) return;
        if (href !== REPOSITORY_URL) return;

        const controller = new AbortController();
        fetch(PROJECT_API_URL, { signal: controller.signal })
            .then(res => {
                if (!res.ok) throw new Error('GitHub unavailable');
                return res.json();
            })
            .then(data => {
                if (typeof data.stargazers_count === 'number') {
                    setStars(data.stargazers_count);
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) setStars(null);
            });
        return () => controller.abort();
    }, [href, showStars]);

    const handleClick = () => {
        window.open(href, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={stars === null ? "View GitHub repository" : `View GitHub repository, ${stars} stars`}
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
            <GitHubIcon className="h-6 w-6 shrink-0" aria-hidden="true" />

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
