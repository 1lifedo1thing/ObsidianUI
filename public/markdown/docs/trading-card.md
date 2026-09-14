# ObsidianUI — Trading Card

[Canonical page](https://www.obsidianui.dev/docs/trading-card) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

A 3D interactive trading card with perspective transforms that respond to mouse movement. Features smooth reveal animations and a premium holographic feel.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/trading-card)

```tsx
import TradingCard from '@/components/block/trading-card'

export function Demo() {
return (
  <TradingCard 
    imageUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb"
    rank={1}
    name="Elena Martinez"
    description="World Champion 2024"
  />
)
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/trading-card.json"
```

## Install manually — complete source

Download the complete manifest: [trading-card.json](https://www.obsidianui.dev/r/trading-card.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install motion
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/trading-card.tsx

Installation target: `@components/block/trading-card.tsx`

```tsx
"use client";

import { motion, useAnimationControls } from 'motion/react';
import Image from 'next/image';
import React, { useRef } from 'react';

interface TradingCardProps {
  imageUrl: string;
  rank: number;
  name: string;
  description: string;
}

const TradingCard: React.FC<TradingCardProps> = ({ imageUrl, rank, name, description }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const backgroundControls = useAnimationControls();
  const contentControls = useAnimationControls();
  const cardControls = useAnimationControls();

  const onMouseEnter: React.MouseEventHandler<HTMLDivElement> = () => {
    contentControls.start({ x: -300 });
    backgroundControls.start({ scale: 1.05, opacity: 1 });
  };

  const onMouseLeave = () => {
    contentControls.start({ x: 0, transition: { delay: 0.5 } });
    backgroundControls.start({ scale: 0.95, opacity: 0.4 });
    cardControls.start({ transform: `rotateY(0deg) rotateX(0deg)` });
  };

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;

    const xd = (mx - width / 2) / 10;
    const yd = (height / 2 - my) / 10;

    cardRef.current.style.transform = `perspective(1000px) rotateY(${xd}deg) rotateX(${yd}deg)`;
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={{
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
      }}
      style={{
        transformStyle: 'preserve-3d'
      }}
      animate={cardControls}
      className="flex flex-col hover:scale-105 transition-all duration-200 ease-linear items-start justify-end rounded-lg relative shadow-xl overflow-hidden h-[400px] w-[300px] cursor-pointer border-[1px] border-neutral-800"
    >
      <motion.div
        className="h-full w-full absolute z-0"
        initial={{
          opacity: 0.4,
          scale: 0.95
        }}
        animate={backgroundControls}
        transition={{ duration: 0.7, ease: 'backOut' }}
      >
        <div className="h-full w-full inset-0 bg-cover bg-center">
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>
      </motion.div>
      <div className="font-semibold absolute top-5 right-5 z-10 text-white/70">#{rank}</div>
      <motion.div
        animate={contentControls}
        transition={{ duration: 0.5, ease: 'backOut' }}
        className="p-5 h-full w-full flex flex-col justify-end bg-transparent z-10 opacity-90"
      >
        <div className="font-medium">
          {name.split(' ').map((word) => {
            return (
              <div
                key={word}
                className="flex flex-col items-start justify-start text-4xl font-bold"
              >
                {word} <br />
              </div>
            );
          })}
        </div>
        <p className="text-sm text-white/90">{description}</p>
      </motion.div>
    </motion.div>
  );
};

export default TradingCard;
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| imageUrl | string | - | URL of the card background image |
| rank | number | - | Rank number displayed in corner |
| name | string | - | Name/title of the card |
| description | string | - | Description text |
