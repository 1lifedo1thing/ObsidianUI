# ObsidianUI — Arrow Fill Button

[Canonical page](https://www.obsidianui.dev/docs/arrow-fill-button) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

A rounded button with an expanding color fill and a sliding arrow on hover or keyboard focus.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/arrow-fill-button)

Hover or focus the button to see its fill animation.

```tsx
"use client";
import { ArrowFillButton } from "@/components/block/arrow-fill-button";

export default function Demo() {
  return <ArrowFillButton href="/components">Explore ObsidianUI</ArrowFillButton>;
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/arrow-fill-button.json"
```

## Usage

```jsx
"use client";
import { ArrowFillButton } from "@/components/block/arrow-fill-button";

export default function Demo() {
  return <ArrowFillButton href="/components">Explore ObsidianUI</ArrowFillButton>;
}
```

## Install manually — complete source

Download the complete manifest: [arrow-fill-button.json](https://www.obsidianui.dev/r/arrow-fill-button.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install clsx tailwind-merge
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/arrow-fill-button.css

Installation target: `@components/block/arrow-fill-button.css`

```css
.obsidian-arrow-fill-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 3rem;
  padding-right: 3.5rem;
  padding-left: 1.5rem;
  position: relative;
  width: fit-content;
  border-radius: 1000px;
  background: var(--btn-bg);
  color: var(--btn-text);
  font-size: 0.875rem;
  font-weight: 500;
  text-rendering: geometricPrecision;
  white-space: nowrap;
  overflow: hidden;
  text-decoration: none;
  cursor: pointer;
  border: none;
}

.obsidian-arrow-fill-btn__text {
  position: relative;
  z-index: 1;
}

.obsidian-arrow-fill-btn__circle {
  clip-path: inset(0.4rem 0.4rem 0.4rem calc(100% - 2.5rem) round 2rem);
  position: absolute;
  inset: -1px;
  border-radius: 1000px;
  display: flex;
  align-items: center;
  padding-right: 3.5rem;
  padding-left: 1.5rem;
  z-index: 2;
  background-color: var(--btn-fill-bg);
  color: var(--btn-fill-text);
  transition: clip-path 0.45s cubic-bezier(0.785, 0.135, 0.15, 0.86), background-color 0.45s cubic-bezier(0.785, 0.135, 0.15, 0.86), color 0.45s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.obsidian-arrow-fill-btn__circle-text {
  padding: 0 1px 0 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  white-space: nowrap;
}

.obsidian-arrow-fill-btn__icon {
  width: 0.75rem;
  height: 0.75rem;
  position: absolute;
  right: 1rem;
  overflow: hidden;
  flex: 0 0 auto;
  color: var(--btn-arrow);
}

.obsidian-arrow-fill-btn:is(:hover, :focus-visible):not(:disabled) .obsidian-arrow-fill-btn__icon {
  color: var(--btn-arrow-hover);
}

.obsidian-arrow-fill-btn__path {
  transition: transform 0.45s cubic-bezier(0.785, 0.135, 0.15, 0.86);
  transform-origin: center center;
  fill: currentColor;
}

.obsidian-arrow-fill-btn__path:first-child {
  transform: translateX(-120%) scale(0);
}

.obsidian-arrow-fill-btn:is(:hover, :focus-visible):not(:disabled) .obsidian-arrow-fill-btn__path:first-child {
  transform: translateX(0) scale(1);
}

.obsidian-arrow-fill-btn:is(:hover, :focus-visible):not(:disabled) .obsidian-arrow-fill-btn__path:last-child {
  transform: translateX(120%) scale(0);
}

.obsidian-arrow-fill-btn:is(:hover, :focus-visible):not(:disabled) .obsidian-arrow-fill-btn__circle {
  clip-path: inset(0 round 2rem);
  background-color: var(--btn-fill-bg-hover);
  color: var(--btn-fill-text-hover);
}
.obsidian-arrow-fill-btn { font-family: var(--font-inter), var(--font-geist), sans-serif; }
.obsidian-arrow-fill-btn:focus-visible { outline: 2px solid var(--ring); outline-offset: 4px; }
.obsidian-arrow-fill-btn:disabled { cursor: not-allowed; opacity: 0.5; }
@media (prefers-reduced-motion: reduce) { .obsidian-arrow-fill-btn__circle, .obsidian-arrow-fill-btn__path { transition: none; } }
```

### components/block/arrow-fill-button.jsx

Installation target: `@components/block/arrow-fill-button.jsx`

```jsx
"use client";

import { cn } from "@/lib/utils";
import "./arrow-fill-button.css";

/**
 * @param {import('react').ButtonHTMLAttributes<HTMLButtonElement> & import('react').AnchorHTMLAttributes<HTMLAnchorElement> & {
 *   as?: import('react').ElementType,
 *   bgColor?: string, textColor?: string, fillBgColor?: string, fillTextColor?: string,
 *   hoverFillBgColor?: string, hoverFillTextColor?: string,
 *   arrowColor?: string, hoverArrowColor?: string
 * }} props
 */
export function ArrowFillButton({
  children = "Explore components",
  className = "",
  bgColor = "#ff6b00",
  textColor = "#ffffff",
  fillBgColor = "#ffffff",
  fillTextColor = "#ff6b00",
  hoverFillBgColor = "#ffffff",
  hoverFillTextColor = "#ff6b00",
  arrowColor,
  hoverArrowColor,
  as: Component = "a",
  style,
  ...props
}) {
  return (
    <Component
      type={Component === "button" ? "button" : undefined}
      {...props}
      className={cn("obsidian-arrow-fill-btn", className)}
      style={{
        "--btn-bg": bgColor,
        "--btn-text": textColor,
        "--btn-fill-bg": fillBgColor,
        "--btn-fill-text": fillTextColor,
        "--btn-fill-bg-hover": hoverFillBgColor,
        "--btn-fill-text-hover": hoverFillTextColor,
        "--btn-arrow": arrowColor || fillTextColor,
        "--btn-arrow-hover": hoverArrowColor || hoverFillTextColor,
        ...style,
      }}
    >
      <span className="obsidian-arrow-fill-btn__text">{children}</span>

      <div aria-hidden="true" className="obsidian-arrow-fill-btn__circle">
        <span>{children}</span>

        <div className="obsidian-arrow-fill-btn__circle-text">
          <svg
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="obsidian-arrow-fill-btn__icon"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.82475e-07 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 -4.37114e-07L4.125 0.874999L7.625 4.375L4.91753e-07 4.375L3.82475e-07 5.625Z"
              className="obsidian-arrow-fill-btn__path"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.82475e-07 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 -4.37114e-07L4.125 0.874999L7.625 4.375L4.91753e-07 4.375L3.82475e-07 5.625Z"
              className="obsidian-arrow-fill-btn__path"
            />
          </svg>
        </div>
      </div>
    </Component>
  );
}
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

## Preview behavior

Hover or focus the button to see its fill animation. The effect stays inside its container and respects reduced motion preferences.
