# ObsidianUI — Mask Cursor Effect

[Canonical page](https://www.obsidianui.dev/docs/mask-cursor-effect) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

A cursor-following mask effect that reveals hidden content on hover. Creates an engaging reveal experience.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/mask-cursor-effect)

```tsx
import { MaskCursorEffect } from '@/components/block/mask-cursor-effect'

export function Demo() {
return (
  <MaskCursorEffect
    hiddenComponent={<h1 className="text-6xl font-bold">SECRET</h1>}
    backgroundColor="#EA5A47"
  >
    <h1 className="text-6xl font-bold">HOVER ME</h1>
  </MaskCursorEffect>
)
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/mask-cursor-effect.json"
```

## Install manually — complete source

Download the complete manifest: [mask-cursor-effect.json](https://www.obsidianui.dev/r/mask-cursor-effect.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install clsx motion tailwind-merge
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/mask-cursor-effect.tsx

Installation target: `@components/block/mask-cursor-effect.tsx`

```tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

const getMaskDataUrl = () => {
    const svgString = `<svg width="526" height="526" viewBox="0 0 526 526" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="263" cy="263" r="263" fill="black" />
  </svg>`;
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
};

interface MaskCursorEffectProps {
    children: React.ReactNode;
    hiddenComponent?: React.ReactNode;
    className?: string;
    compressedMaskSize?: number;
    expandedMaskSize?: number;
    backgroundColor?: string;
}

export function MaskCursorEffect({
    children,
    hiddenComponent,
    className,
    compressedMaskSize = 40,
    expandedMaskSize = 350,
    backgroundColor = '#EA5A47'
}: MaskCursorEffectProps) {
    const [mousePosition, setMousePosition] = useState({ x: 20, y: 20 });
    const [isHovered, setIsHovered] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const MASK_SIZE = isHovered ? expandedMaskSize : compressedMaskSize;

    const maskX = useSpring(useMotionValue(mousePosition.x - MASK_SIZE / 2), { stiffness: 500, damping: 50 });
    const maskY = useSpring(useMotionValue(mousePosition.y - MASK_SIZE / 2), { stiffness: 500, damping: 50 });
    const maskSizeSpring = useSpring(useMotionValue(MASK_SIZE), { stiffness: 500, damping: 50 });

    useEffect(() => {
        maskX.set(mousePosition.x - MASK_SIZE / 2);
        maskY.set(mousePosition.y - MASK_SIZE / 2);
        maskSizeSpring.set(MASK_SIZE);
    }, [mousePosition, MASK_SIZE, maskX, maskY, maskSizeSpring]);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const handleMouseMove = (e: MouseEvent) => {
            const { left, top } = wrapper.getBoundingClientRect();
            setMousePosition({ x: e.clientX - left, y: e.clientY - top });
        };
        wrapper.addEventListener('mousemove', handleMouseMove);
        return () => wrapper.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div ref={wrapperRef} className="h-full w-full relative flex flex-col">
            <motion.div
                style={{
                    maskImage: `url("${getMaskDataUrl()}")`,
                    WebkitMaskImage: `url("${getMaskDataUrl()}")`,
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: `${mousePosition.x - MASK_SIZE / 2}px ${mousePosition.y - MASK_SIZE / 2}px`,
                    maskPosition: `${mousePosition.x - MASK_SIZE / 2}px ${mousePosition.y - MASK_SIZE / 2}px`,
                    WebkitMaskSize: `${MASK_SIZE}px ${MASK_SIZE}px`,
                    maskSize: `${MASK_SIZE}px ${MASK_SIZE}px`,
                    backgroundColor,
                    color: 'black',
                    transition: 'mask-size 0.3s ease, -webkit-mask-size 0.3s ease'
                }}
                className={cn('h-[800px] w-full flex items-center justify-center absolute z-10', className)}
            >
                <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                    {hiddenComponent}
                </div>
            </motion.div>
            <div className={cn('h-[800px] w-full flex items-center justify-center text-white/70', className)}>
                {children}
            </div>
        </div>
    );
}

export default MaskCursorEffect;
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

## Usage

```tsx
import { MaskCursorEffect } from "@/components/block/mask-cursor-effect"

export function Demo() {
return (
  <MaskCursorEffect
    hiddenComponent={<h1 className="text-6xl font-bold">SECRET</h1>}
    backgroundColor="#EA5A47"
    expandedMaskSize={350}
  >
    <h1 className="text-6xl font-bold">HOVER ME</h1>
  </MaskCursorEffect>
)
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | React.ReactNode | - | Visible content |
| hiddenComponent | React.ReactNode | - | Content revealed on hover |
| backgroundColor | string | '#EA5A47' | Mask background color |
| expandedMaskSize | number | 350 | Mask size on hover |
