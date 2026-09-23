'use client';

import { useEffect, useState } from 'react';

const REPOSITORY_URL = 'https://gitlab.com/Atharvsinh-codez/ObsidianUI';
const PROJECT_API_URL = 'https://gitlab.com/api/v4/projects/Atharvsinh-codez%2FObsidianUI';
const GITLAB_LOGO_PATH = 'M282.83,170.73l-.27-.69-26.14-68.22a6.81,6.81,0,0,0-2.69-3.24,7,7,0,0,0-8,.43,7,7,0,0,0-2.32,3.52l-17.65,54H154.29l-17.65-54A6.86,6.86,0,0,0,134.32,99a7,7,0,0,0-8-.43,6.87,6.87,0,0,0-2.69,3.24L97.44,170l-.26.69a48.54,48.54,0,0,0,16.1,56.1l.09.07.24.17,39.82,29.82,19.7,14.91,12,9.06a8.07,8.07,0,0,0,9.76,0l12-9.06,19.7-14.91,40.06-30,.1-.08A48.56,48.56,0,0,0,282.83,170.73Z';

export function GitHubStarCounter() {
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        fetch(PROJECT_API_URL, { signal: controller.signal })
            .then(res => {
                if (!res.ok) throw new Error('GitLab unavailable');
                return res.json();
            })
            .then(data => {
                if (typeof data.star_count === 'number') {
                    setStars(data.star_count);
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
            aria-label={stars === null ? "View ObsidianUI on GitLab" : `View ObsidianUI on GitLab, ${stars} stars`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-2 text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
            {/* GitLab logo: dark ink in light mode, white in dark mode */}
            <svg
                viewBox="0 0 380 380"
                className="size-5 shrink-0"
                aria-hidden="true"
            >
                <path d={GITLAB_LOGO_PATH} className="fill-[#171321] dark:fill-white" />
            </svg>
            {stars !== null && (
                <span className="text-sm font-medium tabular-nums">{stars}</span>
            )}
        </a>
    );
}

export default GitHubStarCounter;
