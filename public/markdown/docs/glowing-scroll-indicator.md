# ObsidianUI — Glowing Scroll Indicator

[Canonical page](https://www.obsidianui.dev/docs/glowing-scroll-indicator) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

An animated scroll progress indicator with glowing bars that light up as you scroll.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/glowing-scroll-indicator)

```tsx
import { GlowingScrollIndicator } from '@/components/block/glowing-scroll-indicator'

export function Demo() {
return (
  <>
    <GlowingScrollIndicator scrollContainerId="scroll-area" />
    <div id="scroll-area" className="h-[400px] overflow-y-auto">
      {/* Scrollable content */}
    </div>
  </>
)
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/glowing-scroll-indicator.json"
```

## Install manually — complete source

Download the complete manifest: [glowing-scroll-indicator.json](https://www.obsidianui.dev/r/glowing-scroll-indicator.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install motion
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/glowing-scroll-indicator.tsx

Installation target: `@components/block/glowing-scroll-indicator.tsx`

```tsx
'use client';

import { motion, MotionValue, useScroll, useTransform } from 'motion/react';
import React, { useSyncExternalStore } from 'react';

const subscribeToDom = (notify: () => void) => {
    const observer = new MutationObserver(notify);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
};

const BARS = 40;

const ScrollBar = ({
    index,
    scrollProgress
}: {
    index: number;
    scrollProgress: MotionValue<number>;
}) => {
    const thisBarPosition = index / BARS;
    const preStep = Math.max(0, (index - 3) / BARS);
    const postStep = Math.min(1, (index + 3) / BARS);

    const height = useTransform(
        scrollProgress,
        [0, preStep, thisBarPosition, postStep, 1],
        [5, 15, 35, 15, 5]
    );
    const opacity = useTransform(
        scrollProgress,
        [0, preStep, thisBarPosition, postStep, 1],
        [0.1, 0.4, 1, 0.4, 0.1]
    );
    const width = useTransform(scrollProgress, [0, thisBarPosition, 1], [1.5, 5, 1.5]);

    return (
        <motion.div
            className="bg-white dark:bg-white"
            style={{
                height: height,
                opacity: useTransform(opacity, (value) => `${value}`),
                width: useTransform(width, (value) => `${value}px`)
            }}
        />
    );
};

const ScrollIndicatorBars = ({
    container,
    direction
}: {
    container: HTMLElement;
    direction: 'vertical' | 'horizontal';
}) => {
    const ref = React.useRef<HTMLElement>(container);

    React.useEffect(() => {
        ref.current = container;
    }, [container]);

    const { scrollXProgress, scrollYProgress } = useScroll({ container: ref });

    const scrollProgress = direction === 'vertical' ? scrollYProgress : scrollXProgress;
    const left = useTransform(scrollProgress, [0, 1], [0, 100]);

    return (
        <div className="flex items-end justify-center gap-1 md:gap-2 relative w-fit">
            {Array.from({ length: BARS }).map((_, index) => (
                <ScrollBar
                    key={`scroll-bar-${index}`}
                    index={index}
                    scrollProgress={scrollProgress}
                />
            ))}
            <motion.div
                className="h-20 bg-red-700 w-1 absolute bottom-0 left-1/2 -translate-x-1/2"
                style={{ left: useTransform(left, (value) => `${value}%`) }}
            >
                <div className="w-3.5 h-3.5 rounded-full shadow-sm bg-red-500 absolute top-0 left-1/2 -translate-x-1/2" />
            </motion.div>
        </div>
    );
};

interface GlowingScrollIndicatorProps {
    scrollContainerId?: string;
    direction?: 'vertical' | 'horizontal';
}

export function GlowingScrollIndicator({
    scrollContainerId = 'scroll-target',
    direction = 'vertical'
}: GlowingScrollIndicatorProps) {
    const container = useSyncExternalStore(
        subscribeToDom,
        () => document.getElementById(scrollContainerId),
        () => null
    );

    if (!container) return null;

    return <ScrollIndicatorBars container={container} direction={direction} />;
}

export default GlowingScrollIndicator;
```

## Usage

```tsx
import { GlowingScrollIndicator } from "@/components/block/glowing-scroll-indicator"

export function Demo() {
return (
  <>
    <GlowingScrollIndicator scrollContainerId="scroll-area" direction="vertical" />
    <div id="scroll-area" className="h-[400px] overflow-y-auto">
      {/* Scrollable content */}
    </div>
  </>
)
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| scrollContainerId | string | 'scroll-target' | Container ID |
| direction | 'vertical' \| 'horizontal' | 'vertical' | Direction |
