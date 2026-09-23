"use client";

import Link from "next/link";
import "./platform-sponsors.css";

const platformLinks = {
  vercel: "http://vercel.com?utm_source=obsidianui.dev&utm_medium=web&utm_campaign=obsidianui-sponsor",
  tracwell: "https://tracwell.app?utm_source=obsidianui.dev&utm_medium=web&utm_campaign=obsidianui-sponsor",
};

export function VercelLogo() {
  return (
    <svg
      className="obsidianui-sponsor-vercel-logo text-black dark:text-white"
      viewBox="0 0 261 52"
      height="52"
      width="261"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M59.8 52H0L29.9 0zm67.82-38.45q4.9 0 8.81 2.13a15.5 15.5 0 0 1 6.22 6.32q2.3 4.2 2.38 10.26v2.06h-26.35q.27 4.4 2.58 6.92 2.38 2.47 6.36 2.47a8.4 8.4 0 0 0 7.76-4.93l9.16.67q-1.68 4.98-6.29 7.99t-10.63 3q-5.53 0-9.64-2.27a16 16 0 0 1-6.43-6.46 20 20 0 0 1-2.31-9.72q0-5.52 2.3-9.72a16 16 0 0 1 6.44-6.46 20 20 0 0 1 9.64-2.26m62.55 0q4.47 0 8.18 1.66a15.3 15.3 0 0 1 6.15 4.6q2.38 3 2.87 7.05l-9.23.47a8 8 0 0 0-2.8-5 7.7 7.7 0 0 0-5.17-1.86q-4.33 0-6.7 3-2.4 3-2.39 8.52t2.38 8.52q2.37 3 6.71 3 3.15 0 5.39-1.87 2.24-1.92 2.72-5.46l9.3.4a14.7 14.7 0 0 1-2.87 7.33 16 16 0 0 1-6.15 4.86 21 21 0 0 1-8.39 1.66q-5.53 0-9.64-2.26a16 16 0 0 1-6.44-6.46 20 20 0 0 1-2.3-9.72q0-5.52 2.3-9.72a16 16 0 0 1 6.44-6.46 20 20 0 0 1 9.64-2.26m38.66 0q4.9 0 8.8 2.13a15.5 15.5 0 0 1 6.22 6.32q2.31 4.2 2.38 10.26v2.06h-26.35q.28 4.4 2.58 6.92 2.38 2.47 6.36 2.47a8.4 8.4 0 0 0 7.77-4.93l9.15.67q-1.68 5-6.29 7.99t-10.62 3q-5.53 0-9.65-2.27a16 16 0 0 1-6.43-6.46 20 20 0 0 1-2.31-9.72q0-5.52 2.3-9.72a16 16 0 0 1 6.44-6.46 20 20 0 0 1 9.64-2.26M86.9 36.69l17.24-34.33h10.8L89.96 49.63h-6.12L58.85 2.36h10.81zm71.62-15.55a11 11 0 0 1 2.47-4.48q2.28-2.31 6.38-2.31h3.4v7.26h-3.47q-2.91 0-4.79.8a5.8 5.8 0 0 0-2.77 2.5q-.9 1.72-.9 4.37v20.35h-8.89V14.35h8.33zm101.73 28.5h-8.95V2.35h8.95zM127.62 20.26q-3.7 0-6 2.2-2.32 2.2-2.87 6.2h17.05q-.48-4.34-2.72-6.33a7.8 7.8 0 0 0-5.46-2.07m101.2 0q-3.7 0-6 2.2-2.31 2.2-2.87 6.2H237q-.5-4.34-2.73-6.33a7.8 7.8 0 0 0-5.46-2.07"
      />
    </svg>
  );
}

export function TracwellLogo() {
  return (
    <span className="obsidianui-sponsor-tracwell-logo" aria-hidden="true">
      <svg viewBox="0 0 96 96">
        <title>Tracwell</title>
        <g transform="translate(0 7)">
          <path d="M12 75c-5 0-8-5-5-10l19-35c3-6 10-8 16-5s8 10 5 16L29 72c-1 2-4 3-7 3H12Z" fill="#8CB4FF" />
          <path d="M43 75c-5 0-8-5-5-10L67 12c3-6 10-8 16-5s8 10 5 16L60 72c-1 2-4 3-7 3H43Z" fill="#357DFF" />
          <circle cx="82" cy="67" r="9" fill="#174EA6" />
        </g>
      </svg>
      <span>Tracwell</span>
    </span>
  );
}

export function PlatformSponsors() {
  return (
    <section className="landing-platform-sponsors" aria-labelledby="platform-sponsors-title">
      <div className="landing-platform-sponsors-inner">
        <div className="landing-platform-sponsor-header">
          <h2 id="platform-sponsors-title" className="landing-platform-sponsor-title">
            Platform Sponsors
          </h2>
          <span className="sr-only">Platform Partners - Vercel [ Hosting Sponsor ] &amp; Tracwell [Analytics Sponsor ]</span>
          <p className="landing-platform-sponsor-desc">
            Products that back ObsidianUI through their open-source programs.
          </p>
        </div>

        <div className="landing-platform-sponsor-grid">
          <div className="landing-platform-sponsor-slot">
            <a
              className="landing-platform-sponsor-card"
              href={platformLinks.vercel}
              target="_blank"
              rel="noreferrer"
              aria-label="Vercel — Hosting Sponsor"
            >
              <VercelLogo />
              <span>Hosting Sponsor</span>
            </a>
          </div>
          <div className="landing-platform-sponsor-slot">
            <a
              className="landing-platform-sponsor-card"
              href={platformLinks.tracwell}
              target="_blank"
              rel="noreferrer"
              aria-label="Tracwell — Analytics Sponsor"
            >
              <TracwellLogo />
              <span>Analytics Sponsor</span>
            </a>
          </div>
        </div>

        <div className="landing-platform-sponsor-action">
          <Link
            href="/sponsors"
            className="font-runde text-sm font-semibold text-muted-foreground underline underline-offset-4 transition-colors duration-150 ease-out hover:text-foreground"
          >
            Become a sponsor →
          </Link>
        </div>
      </div>
    </section>
  );
}
