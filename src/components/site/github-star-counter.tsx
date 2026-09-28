'use client';

import { useEffect, useState } from 'react';
import { GitHubIcon } from './github-icon';

const REPOSITORY_URL = 'https://github.com/Atharvsinh-codez/ObsidianUI';
const PROJECT_API_URL = 'https://api.github.com/repos/Atharvsinh-codez/ObsidianUI';

export function GitHubStarCounter() {
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
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
    }, []);

    return (
        <a
            href={REPOSITORY_URL}
            aria-label={stars === null ? "View ObsidianUI on GitHub" : `View ObsidianUI on GitHub, ${stars} stars`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-2 text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
            <GitHubIcon className="size-5 shrink-0" aria-hidden="true" />
            {stars !== null && (
                <span className="text-sm font-medium tabular-nums">{stars}</span>
            )}
        </a>
    );
}

export default GitHubStarCounter;
