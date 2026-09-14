# ObsidianUI — Jelly Loader

[Canonical page](https://www.obsidianui.dev/docs/jelly-loader) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

A beautiful loading animation with stacked, rotating elliptical shapes that create a mesmerizing jelly-like effect. Uses a gradient color palette from light pink to deep magenta.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/jelly-loader)

```tsx
import JellyLoader from '@/components/block/jelly-loader'

export function Demo() {
return <JellyLoader />
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/jelly-loader.json"
```

## Install manually — complete source

Download the complete manifest: [jelly-loader.json](https://www.obsidianui.dev/r/jelly-loader.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install motion
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/jelly-loader.tsx

Installation target: `@components/block/jelly-loader.tsx`

```tsx
'use client';

import React from 'react';
import { motion, Transition } from 'motion/react';

type JellyLoaderProps = {
    numberOfCubes?: number;
    colors?: string[];
};

export function JellyLoader({
    numberOfCubes = 8,
    colors = ['#FFE4E1', '#FFB6C1', '#FF8A95', '#FF6B8A', '#E91E63', '#C2185B', '#AD1457', '#880E4F']
}: JellyLoaderProps) {
    const transition: Transition = {
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 0.5,
        ease: 'easeOut'
    };

    return (
        <div className="-translate-x-1/5 flex items-center justify-center">
            {Array.from({ length: numberOfCubes }).map((_, index) => {
                const x = index * 10;
                const y = -index * 10;

                return (
                    <motion.span
                        key={index}
                        className="h-[70px] w-[100px] absolute rounded-full"
                        style={{
                            x,
                            y,
                            zIndex: numberOfCubes - index,
                            backgroundColor: colors[index % colors.length],
                            opacity: 1 - index * 0.05
                        }}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 0.75, 1], rotate: [0, 360] }}
                        transition={{
                            ...transition,
                            delay: index * 0.05
                        }}
                    />
                );
            })}
        </div>
    );
}

export default JellyLoader;
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| numberOfCubes | number | 8 | Number of stacked ellipses |
| colors | string[] | [...pinkGradient] | Array of colors for each layer |

## Examples

### Custom Colors

```tsx
<JellyLoader 
  numberOfCubes={6}
  colors={['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#EFF6FF']}
/>
```

### Fewer Layers

```tsx
<JellyLoader numberOfCubes={4} />
```
