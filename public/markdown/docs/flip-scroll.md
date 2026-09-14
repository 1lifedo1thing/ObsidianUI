# ObsidianUI — Flip Scroll

[Canonical page](https://www.obsidianui.dev/docs/flip-scroll) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

A scroll-triggered flip animation where elements rotate and transform as you scroll. Creates a dynamic, engaging scroll experience.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/flip-scroll)

```tsx
import FlipScroll from '@/components/block/flip-scroll'

export function Demo() {
const items = [
  { image: '/images/one.jpg' },
  { image: '/images/two.jpg' },
  { image: '/images/three.jpg' },
  { image: '/images/four.jpg' },
]

return <div className="h-[600px]"><FlipScroll items={items} /></div>
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/flip-scroll.json"
```

## Install manually — complete source

Download the complete manifest: [flip-scroll.json](https://www.obsidianui.dev/r/flip-scroll.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install motion
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/flip-scroll.tsx

Installation target: `@components/block/flip-scroll.tsx`

```tsx
'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, MotionValue, useScroll, useTransform } from 'motion/react';

const BackFace = () => (
    <div
        className="border border-white/15 h-[500px] w-full absolute rounded-3xl top-0 left-0 flex items-center justify-center bg-black text-white font-bold text-7xl"
        style={{ transform: 'rotateY(180deg) translateZ(-1px)', backfaceVisibility: 'hidden' }}
    >
        ?
    </div>
);

const FlipScrollItem = ({
    image,
    index,
    isLeft,
    scrollYProgress,
    totalItems,
    mode
}: {
    image: string;
    index: number;
    isLeft: boolean;
    scrollYProgress: MotionValue<number>;
    totalItems: number;
    mode: 'alternate' | 'normal';
}) => {
    const direction = isLeft ? -1 : 1;
    const position = index / totalItems;

    const translateX = useTransform(
        scrollYProgress,
        [0, position, 1],
        [-index * 400 * direction, 0, (totalItems - index) * 400 * direction]
    );

    const normalRotateY = useTransform(
        scrollYProgress,
        [0, position - 0.04, position - 0.015, position + 0.015, position + 0.04, 1],
        [180, 180, 0, 0, -180, -180]
    );
    const alternateRotateY = useTransform(
        scrollYProgress,
        [0, position, 1],
        [index * -180 * direction, 0, (totalItems - index) * 180 * direction]
    );

    return (
        <motion.div
            style={{ translateX, perspective: 1000, transformStyle: 'preserve-3d' }}
            className="h-[500px] max-w-sm w-full absolute rounded-3xl overflow-visible"
        >
            <motion.div
                style={{ rotateY: mode === 'normal' ? normalRotateY : alternateRotateY, transformStyle: 'preserve-3d' }}
                className="relative"
            >
                <Image
                    src={image}
                    alt={image}
                    width={1000}
                    height={1000}
                    style={{ backfaceVisibility: 'hidden', transform: 'translateZ(1px)' }}
                    className="object-cover h-[500px] w-full rounded-3xl absolute top-0 left-0"
                />
                <BackFace />
            </motion.div>
        </motion.div>
    );
};

interface FlipScrollProps {
    items: { image: string }[];
    mode?: 'alternate' | 'normal';
}

export function FlipScroll({ items, mode = 'normal' }: FlipScrollProps) {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        container: ref,
        offset: ['start start', 'end end']
    });

    return (
        <div ref={ref} className="h-full w-full overflow-y-auto relative" style={{ minHeight: '400px' }}>
            <div className="h-full w-full absolute top-0 left-0">
                <div className="w-full" style={{ height: (items.length - 3) * 500 }} />
            </div>
            <div className="grid grid-cols-1 h-full w-full sticky top-0 left-0">
                <div className="flex flex-col h-full justify-center w-full items-center relative">
                    {items.map((image, index) => (
                        <FlipScrollItem
                            key={`flip-scroll-item-${index}`}
                            image={image.image}
                            index={index}
                            isLeft={true}
                            scrollYProgress={scrollYProgress}
                            totalItems={items.length}
                            mode={mode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FlipScroll;
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| items | { image: string }[] | Required | Images to flip through inside a parent with a fixed height |
| mode | 'normal' \| 'alternate' | 'normal' | Animation mode |
