# ObsidianUI — Discover Button

[Canonical page](https://www.obsidianui.dev/docs/discover-button) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

A rounded call-to-action with an arrow circle that expands across the label on hover. The default label is **Discover Components**. It works as a link when you provide `href`, or as a button when you provide `onClick`.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/discover-button)

```tsx
import { DiscoverButton } from '@/components/block/discover-button'

export function Demo() {
return <DiscoverButton href="/components" />
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/discover-button.json"
```

## Usage

```tsx
import { DiscoverButton } from '@/components/block/discover-button'

<DiscoverButton href="/components" />
```

Provide `onClick` instead of `href` to use it as a button. Change the label with the `label` prop. The hover and focus effects respect reduced-motion preferences.

## Customize colors

The button uses neutral ObsidianUI colors by default. Override its CSS variables with `className` when you need a different surface or fill:

```tsx
<DiscoverButton href="/components" className="custom-discover-button" />
```

```css
.custom-discover-button {
  --obsidian-discover-surface: #e5e7eb;
  --obsidian-discover-text: #171717;
  --obsidian-discover-fill: #171717;
  --obsidian-discover-active-text: #ffffff;
}
```

## Install manually — complete source

Download the complete manifest: [discover-button.json](https://www.obsidianui.dev/r/discover-button.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install clsx lucide-react tailwind-merge
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/discover-button.css

Installation target: `@components/block/discover-button.css`

```css
.obsidian-discover-button {
  position: relative;
  display: inline-flex;
  min-height: 66px;
  max-width: 100%;
  align-items: center;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 30%);
  border-radius: 999px;
  background: var(--obsidian-discover-surface, rgb(237 237 237 / 92%));
  backdrop-filter: blur(10px);
  color: var(--obsidian-discover-text, #171717);
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.1;
  text-decoration: none;
  white-space: nowrap;
  animation: obsidian-discover-enter 500ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.obsidian-discover-button__fill {
  position: absolute;
  inset: 2px auto 2px 2px;
  width: 60px;
  border-radius: inherit;
  background: var(--obsidian-discover-fill, #171717);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 12%);
  transition: width 480ms cubic-bezier(0.65, 0, 0.076, 1);
}

.obsidian-discover-button__icon {
  position: relative;
  z-index: 1;
  display: grid;
  width: 64px;
  height: 64px;
  flex: none;
  place-items: center;
  color: var(--obsidian-discover-active-text, #fff);
  transition: transform 480ms cubic-bezier(0.65, 0, 0.076, 1);
}

.obsidian-discover-button__text {
  position: relative;
  z-index: 1;
  padding: 0 27px 0 15px;
  text-align: center;
  transition: color 320ms ease;
}

.obsidian-discover-button:hover .obsidian-discover-button__fill,
.obsidian-discover-button:focus-visible .obsidian-discover-button__fill {
  width: calc(100% - 4px);
}

.obsidian-discover-button:hover .obsidian-discover-button__icon,
.obsidian-discover-button:focus-visible .obsidian-discover-button__icon {
  transform: translateX(7px);
}

.obsidian-discover-button:hover .obsidian-discover-button__text,
.obsidian-discover-button:focus-visible .obsidian-discover-button__text {
  color: var(--obsidian-discover-active-text, #fff);
}

.obsidian-discover-button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 4px;
}

@keyframes obsidian-discover-enter {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .obsidian-discover-button { animation: none; }
  .obsidian-discover-button__fill,
  .obsidian-discover-button__icon,
  .obsidian-discover-button__text { transition: none; }
}
```

### components/block/discover-button.tsx

Installation target: `@components/block/discover-button.tsx`

```tsx
"use client";

import { ArrowRight } from "lucide-react";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";
import "./discover-button.css";

export interface DiscoverButtonProps {
  label?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export function DiscoverButton({
  label = "Discover Components",
  href,
  onClick,
  className,
}: DiscoverButtonProps) {
  const buttonFace = (
    <>
      <span className="obsidian-discover-button__fill" aria-hidden="true" />
      <span className="obsidian-discover-button__icon" aria-hidden="true">
        <ArrowRight size={25} strokeWidth={2.25} />
      </span>
      <span className="obsidian-discover-button__text">{label}</span>
    </>
  );

  if (href) {
    return (
      <a className={cn("obsidian-discover-button", className)} href={href}>
        {buttonFace}
      </a>
    );
  }

  return (
    <button className={cn("obsidian-discover-button", className)} type="button" onClick={onClick}>
      {buttonFace}
    </button>
  );
}

export default DiscoverButton;
```

### lib/utils.ts

Installation target: `@lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| label | string | Discover Components | Text shown beside the arrow. |
| href | string | - | Destination when rendered as a link. |
| onClick | MouseEventHandler<HTMLButtonElement> | - | Click handler when rendered as a button. |
| className | string | - | Additional classes for the outer pill. |
