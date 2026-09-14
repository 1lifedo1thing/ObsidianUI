# ObsidianUI — Scroll Stack

[Canonical page](https://www.obsidianui.dev/docs/scroll-stack) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

Successive cards scale into focus and fade as the next section takes their place.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/scroll-stack)

Scroll inside the preview to reveal each card.

```tsx
"use client";
import { useRef } from "react";
import { ScrollStack } from "@/components/block/scroll-stack";

const cards = [
  {
    "id": "design",
    "title": "Start with an idea.",
    "description": "Give your next interface a clear purpose and room to breathe.",
    "bgColor": "#e6d5f7",
    "textColor": "#30233c"
  },
  {
    "id": "motion",
    "title": "Make it feel right.",
    "description": "Use motion to guide attention and connect every interaction.",
    "bgColor": "#d5e8b5",
    "textColor": "#24351c"
  },
  {
    "id": "build",
    "title": "Make it yours.",
    "description": "Build something worth sharing with ObsidianUI.",
    "bgColor": "#f7c698",
    "textColor": "#432d1c"
  }
];
export default function Demo() {
  const scroller = useRef<HTMLDivElement>(null);
  return <div ref={scroller} tabIndex={0} aria-label="Scroll effect preview" className="relative h-[400px] overflow-y-auto overscroll-contain" style={{ containerType: "size" }}>
    <ScrollStack cards={cards} scroller={scroller} viewportHeight="100cqh" contained />
  </div>;
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/scroll-stack.json"
```

## Usage

```jsx
"use client";
import { useRef } from "react";
import { ScrollStack } from "@/components/block/scroll-stack";

const cards = [
  {
    "id": "design",
    "title": "Start with an idea.",
    "description": "Give your next interface a clear purpose and room to breathe.",
    "bgColor": "#e6d5f7",
    "textColor": "#30233c"
  },
  {
    "id": "motion",
    "title": "Make it feel right.",
    "description": "Use motion to guide attention and connect every interaction.",
    "bgColor": "#d5e8b5",
    "textColor": "#24351c"
  },
  {
    "id": "build",
    "title": "Make it yours.",
    "description": "Build something worth sharing with ObsidianUI.",
    "bgColor": "#f7c698",
    "textColor": "#432d1c"
  }
];
export default function Demo() {
  const scroller = useRef<HTMLDivElement>(null);
  return <div ref={scroller} tabIndex={0} aria-label="Scroll effect preview" className="relative h-[400px] overflow-y-auto overscroll-contain" style={{ containerType: "size" }}>
    <ScrollStack cards={cards} scroller={scroller} viewportHeight="100cqh" contained />
  </div>;
}
```

## Install manually — complete source

Download the complete manifest: [scroll-stack.json](https://www.obsidianui.dev/r/scroll-stack.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install gsap
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/scroll-stack.jsx

Installation target: `@components/block/scroll-stack.jsx`

```jsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "@/lib/effects/scroll-stack/styles.css";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/** @param {{bgColor?: string, cards?: Array<{id: string | number, title: string, description: string, bgColor: string, textColor: string}>,
 * scroller?: HTMLElement | import('react').RefObject<HTMLElement | null>, viewportHeight?: string, contained?: boolean, className?: string}} props */
export function ScrollStack({ bgColor = "bg-white", cards = [], scroller, viewportHeight = "100vh", contained = false, className = "" }) {
  const sectionRef = useRef(null);
  const rowRefs = useRef([]);
  const cardRefs = useRef([]);

  useEffect(() => {
    rowRefs.current = rowRefs.current.slice(0, cards.length);
    cardRefs.current = cardRefs.current.slice(0, cards.length);

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const currentCards = cardRefs.current.filter(Boolean);
      const currentRows = rowRefs.current.filter(Boolean);

      currentCards.forEach((card, index) => {
        gsap.set(card, {
          autoAlpha: 1,
          scale: index === 0 ? 1 : 1.1,
          transformOrigin: "center center",
        });
      });

      currentCards.slice(0, -1).forEach((card, index) => {
        const nextRow = currentRows[index + 1];
        const nextCard = currentCards[index + 1];
        if (!nextRow || !nextCard) return;

        const handoff = gsap.timeline({
          scrollTrigger: {
            trigger: nextRow,
            scroller: scroller?.current !== undefined ? scroller.current : scroller,
            start: "top bottom+=20%",
            end: "top top-=28%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        handoff.to(nextCard, { scale: 1, ease: "none" }, 0);

        gsap.to(card, {
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: nextRow,
            scroller: scroller?.current !== undefined ? scroller.current : scroller,
            start: "top top+=14%",
            end: "top top+=2%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });

    }, sectionRef);

    return () => media.revert();
  }, [cards, scroller]);

  return (
    <section
      ref={sectionRef}
      data-contained={contained || undefined}
      className={`obsidian-scroll-stack py-[7%] max-sm:py-[15%] font-body ${bgColor} ${className}`}
      style={{ '--scroll-stack-viewport': viewportHeight, containerType: 'inline-size' }}
    >
      <div className="flex w-full flex-col items-center px-[5%] py-[10cqw]">
        {cards.map((item, index) => (
          <div
            key={item.id}
            ref={(element) => {
              rowRefs.current[index] = element;
            }}
            className={`scroll-stack-row relative w-full min-h-[calc(var(--scroll-stack-viewport)*1.8)] max-sm:min-h-[calc(var(--scroll-stack-viewport)*1.3)] ${
              index === 0 ? "" : "-mt-[calc(var(--scroll-stack-viewport)*0.7)] max-sm:-mt-[calc(var(--scroll-stack-viewport)*0.5)]"
            }`}
          >
            <div className="scroll-stack-sticky sticky top-[calc(var(--scroll-stack-viewport)*0.15)] max-sm:top-[calc(var(--scroll-stack-viewport)*0.1)]" style={{ zIndex: index + 1 }}>
              <div
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                className="scroll-stack-card mx-auto flex h-[32cqw] w-[80%] items-center justify-between gap-[4cqw] rounded-[45px] px-[4cqw] py-[3cqw] max-sm:h-auto max-sm:min-h-[50cqw] max-sm:w-full max-sm:flex-col max-sm:rounded-[9cqw] max-sm:px-[8cqw] max-sm:py-[15cqw]"
                style={{ backgroundColor: item.bgColor }}
              >
                <div className="w-[50%] max-sm:w-full">
                  <h2
                    className="scroll-stack-title w-full font-heading text-[5.5cqw] font-medium leading-[1.1] max-sm:text-[10cqw]"
                    style={{ color: item.textColor }}
                  >
                    {item.title}
                  </h2>
                </div>
                <div className="flex w-[50%] flex-col justify-center gap-[2cqw] max-sm:w-full max-sm:gap-[7cqw]">
                  <p
                    className="scroll-stack-description w-full text-justify text-[1.3cqw] leading-[1.5] max-sm:text-center max-sm:text-[4.5cqw]"
                    style={{ color: item.textColor }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### lib/effects/scroll-stack/styles.css

Installation target: `@lib/effects/scroll-stack/styles.css`

```css
.obsidian-scroll-stack[data-contained] .scroll-stack-card {
  width: 94%;
  height: calc(var(--scroll-stack-viewport) * 0.64);
  min-height: 150px;
  border-radius: 24px;
  padding: 6%;
  flex-direction: row;
}
.obsidian-scroll-stack[data-contained] .scroll-stack-title { font-size: clamp(22px, 5.5cqw, 44px); }
.obsidian-scroll-stack[data-contained] .scroll-stack-description { font-size: clamp(12px, 2cqw, 17px); text-align: left; }
@media (prefers-reduced-motion: reduce) {
  .obsidian-scroll-stack .scroll-stack-row { min-height: 0; margin-top: 0; padding-bottom: 24px; }
  .obsidian-scroll-stack .scroll-stack-sticky { position: relative; top: 0; }
}
.obsidian-scroll-stack[data-contained] { padding: 0; }
.obsidian-scroll-stack[data-contained] > div { padding: 8% 4%; }
```

## Preview behavior

Scroll inside the preview to reveal each card. The effect stays inside its container and respects reduced motion preferences.
