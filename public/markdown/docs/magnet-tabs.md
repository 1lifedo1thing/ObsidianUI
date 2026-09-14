# ObsidianUI — Magnet Tabs

[Canonical page](https://www.obsidianui.dev/docs/magnet-tabs) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

Animated tab navigation with magnetic hover effect and smooth indicator transitions.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/magnet-tabs)

```tsx
import { MagnetTabs } from '@/components/block/magnet-tabs'
import { useState } from 'react'

export function Demo() {
const [activeTab, setActiveTab] = useState("All")
return (
  <MagnetTabs
    slug="demo"
    options={["All", "Latest", "Popular", "Featured"]}
    activeTab={activeTab}
    onSelect={setActiveTab}
  />
)
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/magnet-tabs.json"
```

## Install manually — complete source

Download the complete manifest: [magnet-tabs.json](https://www.obsidianui.dev/r/magnet-tabs.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install motion
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/magnet-tabs.tsx

Installation target: `@components/block/magnet-tabs.tsx`

```tsx
'use client';

import React from 'react';
import { motion } from 'motion/react';

interface MagnetTabsProps {
    slug: string;
    options: string[];
    onSelect: (option: string) => void;
    activeTab: string;
}

export function MagnetTabs({ slug, options, onSelect, activeTab }: MagnetTabsProps) {
    const [hovered, setHovered] = React.useState<string | undefined>(undefined);

    return (
        <div className="flex items-start justify-start">
            <ul className="flex border-[1px] border-black/10 dark:border-white/10 border-b-0">
                {options.map((option) => {
                    const isActive = activeTab === option;
                    return (
                        <li
                            onMouseEnter={() => setHovered(option)}
                            onMouseLeave={() => setHovered(undefined)}
                            key={slug + option}
                            onClick={() => onSelect(option)}
                            className="relative cursor-pointer shrink-0"
                        >
                            <p
                                className={`z-10 relative px-3 py-2 transition-all text-sm ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-100'
                                    }`}
                            >
                                {option}
                            </p>

                            {isActive && (
                                <motion.div
                                    layout
                                    layoutId={slug + 'magnet'}
                                    transition={{ duration: 0.2, type: 'spring', bounce: 0.2 }}
                                    className="w-full h-1 absolute bottom-full left-0 bg-blue-500 rounded-sm"
                                />
                            )}

                            {(hovered === option || (hovered === undefined && isActive)) && (
                                <motion.div
                                    layout
                                    layoutId={slug + 'tab-bar-highlight'}
                                    transition={{ duration: 0.2, type: 'spring', bounce: 0 }}
                                    className="w-full h-full absolute bottom-0 left-0 bg-black/5 dark:bg-white/10 rounded-sm"
                                />
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default MagnetTabs;
```

## Usage

```tsx
import { MagnetTabs } from "@/components/block/magnet-tabs"
import { useState } from "react"

export function Demo() {
const [activeTab, setActiveTab] = useState("All")

return (
  <MagnetTabs
    slug="my-tabs"
    options={["All", "Latest", "Popular", "Featured"]}
    activeTab={activeTab}
    onSelect={setActiveTab}
  />
)
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| slug | string | - | Unique ID for animations |
| options | string[] | - | Array of tab labels |
| activeTab | string | - | Currently selected tab |
| onSelect | (option: string) => void | - | Callback when selected |
