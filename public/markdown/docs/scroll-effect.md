# ObsidianUI — Scroll Effect

[Canonical page](https://www.obsidianui.dev/docs/scroll-effect) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

A stacking card scroll effect where cards stack on top of each other as you scroll.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/scroll-effect)

```tsx
import { ScrollEffect } from '@/components/block/scroll-effect'

export function Demo() {
return <ScrollEffect images={{ start: ["/images/one.jpg", "/images/two.jpg"], middle: ["/images/three.jpg", "/images/four.jpg"], featured: "/images/featured.jpg" }} />
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/scroll-effect.json"
```

## Install manually — complete source

Download the complete manifest: [scroll-effect.json](https://www.obsidianui.dev/r/scroll-effect.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install clsx motion tailwind-merge
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/scroll-effect.css

Installation target: `@components/block/scroll-effect.css`

```css
@property --ace-scroll-progress {
  syntax: '<number>';
  initial-value: 0;
  inherits: true;
}

.ace-scroll-root {
  --g: 1rem;
  --n: 2;
  position: sticky;
  top: 0;
  height: 110dvh;
  padding: var(--g);
  display: grid;
  grid-template: repeat(3, 1fr) / repeat(3, 1fr);
  grid-auto-rows: 1fr;
  gap: var(--g);
  overflow: hidden;
  container-type: inline-size;
}

.ace-scroll-image {
  --_j: var(--j, 0);
  --p: calc(2 * var(--_j) + 1);
  --s: calc(2 * var(--_j) - 1);
  grid-area: 2 / var(--p);
  justify-self: end;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--g);
  contain: size;
}
.ace-scroll-image:nth-child(n + 3) { --j: 1; }
.ace-scroll-image.feat {
  grid-area: 1 / 1 / -1 / -1;
  height: 200%;
  border-radius: 2px;
  clip-path: inset(0 calc(min(1, 2 * var(--ace-scroll-progress)) * (100% + var(--g)) / 3) round var(--g));
  z-index: 1;
}
.ace-scroll-image:not(.feat) {
  --d: calc(clamp(0, var(--i) + (1 - 2 * var(--ace-scroll-progress)) * (var(--n) - 1), 1) * 33cqw);
  transform: translate(calc(var(--s) * var(--d)), calc(0.5 * var(--d)));
  z-index: 0;
}
.ace-scroll-image.mid, .ace-scroll-image.end {
  --j: 1;
  grid-column: var(--p);
  grid-row: calc(var(--i) + 1);
}
.ace-scroll-image.mid:nth-child(5) { width: 80%; height: 150px; }
.ace-scroll-image.mid:nth-child(4) { margin-top: -200px; width: 40%; height: 200px; }
.ace-scroll-image.end:nth-child(1) { width: 80%; height: 200px; }
.ace-scroll-image.end:nth-child(2) { width: 40%; height: 200px; }

@media (prefers-reduced-motion: reduce) {
  .ace-scroll-section { height: auto; }
  .ace-scroll-root { position: relative; height: auto; grid-template: none / repeat(2, minmax(0, 1fr)); }
  .ace-scroll-root .ace-scroll-image {
    grid-area: auto;
    width: 100%;
    height: 240px;
    margin: 0;
    clip-path: none;
    transform: none;
  }
}
```

### components/block/scroll-effect.tsx

Installation target: `@components/block/scroll-effect.tsx`

```tsx
"use client";
import React, { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionStyle } from 'motion/react'
import { cn } from '@/lib/utils'
import '@/components/block/scroll-effect.css'


type ImageProps = {

        start: string[];
        middle: string[];
        featured: string
}

interface ScrollEffectProps{
    images: ImageProps;
    className?: string
}

 export function ScrollEffect  ({ images , className }: ScrollEffectProps)  {



    const sectionRef = useRef<HTMLDivElement>(null);


    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end start']
    })



    const k = useTransform(scrollYProgress, [0, 1], [0, 1])

    const {start , middle , featured}= images




    return (

        <section ref={sectionRef}
            className={cn('ace-scroll-section relative h-[400dvh]' , className)}
        >

            <motion.div className='ace-scroll-root' style={{
                '--ace-scroll-progress': k
            } as MotionStyle}>

                {start.map((src, i) => (

                    <img key={`start-${i}`}
                        src={src}
                        className={cn('ace-scroll-image end')}
                        style={{
                            '--i': i,
                            '--j': 0
                        } as React.CSSProperties}
                        alt={`start-image${i}`}
                    />
                ))
                }

              


                {/* featured image */}
                <img src={featured}
                    className='ace-scroll-image feat'
                    alt='featured-image'
                />

                {/* middle images */}


                {
                    middle.map((src, i) =>

                    (
                        <img key={`mid-${i}`}
                            src={src}
                            className={cn('ace-scroll-image mid' , 
                               
                            )}
                            style={{
                                '--i': i + start.length,
                                '--j': 1
                            } as React.CSSProperties}
                            alt={`middle-image${i}`}

                        />
                    ))
                }
            </motion.div>

        </section>

    );
};
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
| images | { start: string[]; middle: string[]; featured: string } | Required | Image groups and the featured image revealed during scrolling |
| className | string | - | Additional classes for the scroll section |
