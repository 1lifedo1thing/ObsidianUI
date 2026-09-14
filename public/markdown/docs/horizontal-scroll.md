# ObsidianUI — Horizontal Scroll

[Canonical page](https://www.obsidianui.dev/docs/horizontal-scroll) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

A smooth horizontal scrolling section that transforms vertical scroll into horizontal movement. Perfect for portfolios, galleries, and feature showcases.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/horizontal-scroll)

```tsx
import HorizontalScroll from '@/components/block/horizontal-scroll'

export function Demo() {
return (
  <div className="h-[600px]">
    <HorizontalScroll items={[{ image: "/images/one.jpg" }, { image: "/images/two.jpg" }, { image: "/images/three.jpg" }, { image: "/images/four.jpg" }]} />
  </div>
)
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/horizontal-scroll.json"
```

## Install manually — complete source

Download the complete manifest: [horizontal-scroll.json](https://www.obsidianui.dev/r/horizontal-scroll.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install motion
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/horizontal-scroll.tsx

Installation target: `@components/block/horizontal-scroll.tsx`

```tsx
'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, MotionValue, useScroll, useTransform } from 'motion/react';

const HorizontalScrollItem = ({
    image,
    index,
    isLeft,
    scrollYProgress,
    totalItems
}: {
    image: string;
    index: number;
    isLeft: boolean;
    scrollYProgress: MotionValue<number>;
    totalItems: number;
}) => {
    const direction = isLeft ? -1 : 1;
    const position = index / totalItems;

    const translateX = useTransform(
        scrollYProgress,
        [0, position, 1],
        [-index * 500 * direction, 0, (totalItems - index) * 500 * direction]
    );
    const rotateY = useTransform(
        scrollYProgress,
        [0, position, 1],
        [index * 35 * direction, 0, (totalItems - index) * -35 * direction]
    );
    const blur = useTransform(scrollYProgress, [0, position, 1], [index * 2, 0, (totalItems - index) * 2]);
    const contrast = useTransform(scrollYProgress, [0, position, 1], [index * 0.5, 1, (totalItems - index) * 0.5]);

    const translateY = useTransform(
        scrollYProgress,
        [0, position, 1],
        [(totalItems - index) * 20, totalItems * 20, index * 20]
    );

    const filter = useTransform([blur, contrast], ([blur, contrast]) => `blur(${blur}px) contrast(${contrast})`);

    return (
        <motion.div
            style={{
                translateX,
                filter,
                translateY: useTransform(translateY, (value) => `${value - 400}px`),
                perspective: 1000,
                transformStyle: 'preserve-3d'
            }}
            className="h-[300px] max-w-sm w-full absolute rounded-xl overflow-visible"
        >
            <motion.div style={{ rotateY }}>
                <Image src={image} alt={image} width={1000} height={1000} className="object-cover h-[300px] w-full rounded-xl" />
            </motion.div>
        </motion.div>
    );
};

interface HorizontalScrollProps {
    items: { image: string }[];
}

export function HorizontalScroll({ items }: HorizontalScrollProps) {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        container: ref,
        offset: ['start start', 'end end']
    });

    return (
        <div ref={ref} className="h-full w-full overflow-y-auto relative" style={{ minHeight: '400px' }}>
            <div className="h-full w-full absolute top-0 left-0">
                <div className="w-full" style={{ height: (items.length - 3) * 300 }} />
            </div>
            <div className="grid grid-cols-1 gap-12 h-full w-full sticky top-0 left-0">
                <div className="flex flex-col h-full justify-center w-full items-center relative">
                    {items.map((image, index) => (
                        <HorizontalScrollItem
                            key={`horizontal-scroll-item-${index}`}
                            image={image.image}
                            index={index}
                            isLeft={true}
                            scrollYProgress={scrollYProgress}
                            totalItems={items.length}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HorizontalScroll;
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| items | { image: string }[] | Required | Image items. Give the parent a fixed height to enable scrolling. |
