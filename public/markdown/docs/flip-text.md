# ObsidianUI — Flip Text

[Canonical page](https://www.obsidianui.dev/docs/flip-text) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

An animated text component where each character flips and rotates on hover. Creates a playful, interactive typography effect.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/flip-text)

```tsx
import FlipText from '@/components/block/flip-text'

export function Demo() {
return (
  <FlipText className="text-4xl font-bold">
    Hover Me
  </FlipText>
)
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/flip-text.json"
```

## Install manually — complete source

Download the complete manifest: [flip-text.json](https://www.obsidianui.dev/r/flip-text.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install clsx tailwind-merge
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/flip-text.tsx

Installation target: `@components/block/flip-text.tsx`

```tsx
"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface FlipTextProps {
    /**
     * Additional CSS classes for the wrapper
     */
    className?: string;

    /**
     * The text content to animate (will be split by spaces)
     */
    children: string;

    /**
     * Duration of the flip animation in seconds
     * @default 2.2
     */
    duration?: number;

    /**
     * Initial delay before animation starts in seconds
     * @default 0
     */
    delay?: number;

    /**
     * Whether the animation should loop infinitely
     * @default true
     */
    loop?: boolean;

    /**
     * Custom separator for splitting text (default is space)
     * @default " "
     */
    separator?: string;

    /**
     * Whether all characters should animate together (no stagger)
     * @default false
     */
    together?: boolean;
}

export function FlipText({
    className,
    children,
    duration = 2.2,
    delay = 0,
    loop = true,
    separator = " ",
    together = false,
}: FlipTextProps) {
    const words = useMemo(() => children.split(separator), [children, separator]);
    const totalChars = children.length;

    // Calculate character index for each position
    const getCharIndex = (wordIndex: number, charIndex: number) => {
        let index = 0;
        for (let i = 0; i < wordIndex; i++) {
            index += words[i].length + (separator === " " ? 1 : separator.length);
        }
        return index + charIndex;
    };

    return (
        <div
            className={cn(
                "flip-text-wrapper inline-block leading-none",
                className
            )}
            style={{ perspective: "1000px" }}
        >
            {words.map((word, wordIndex) => {
                const chars = word.split("");

                return (
                    <span
                        key={wordIndex}
                        className="word inline-block whitespace-nowrap"
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        {chars.map((char, charIndex) => {
                            const currentGlobalIndex = getCharIndex(wordIndex, charIndex);

                            // Calculate delay - if together, use same delay for all
                            let calculatedDelay = delay;
                            if (!together) {
                                const normalizedIndex = currentGlobalIndex / totalChars;
                                const sineValue = Math.sin(normalizedIndex * (Math.PI / 2));
                                calculatedDelay = sineValue * (duration * 0.25) + delay;
                            }

                            return (
                                <span
                                    key={charIndex}
                                    className="flip-char inline-block relative"
                                    data-char={char}
                                    style={
                                        {
                                            "--flip-duration": `${duration}s`,
                                            "--flip-delay": `${calculatedDelay}s`,
                                            "--flip-iteration": loop ? "infinite" : "1",
                                            transformStyle: "preserve-3d",
                                        } as React.CSSProperties
                                    }
                                >
                                    {char}
                                </span>
                            );
                        })}
                        {separator === " " && wordIndex < words.length - 1 && (
                            <span className="whitespace inline-block">&nbsp;</span>
                        )}
                        {separator !== " " && wordIndex < words.length - 1 && (
                            <span className="separator inline-block">{separator}</span>
                        )}
                    </span>
                );
            })}
        </div>
    );
}

export default FlipText;
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
| children | string | - | Text content to display |
| className | string | - | Additional CSS classes |
