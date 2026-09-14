# ObsidianUI — Text Fill Animation

[Canonical page](https://www.obsidianui.dev/docs/text-fill-animation) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

A scroll-driven color sweep brings text into focus one character at a time.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/text-fill-animation)

Scroll inside the preview to fill the text.

```tsx
"use client";
import { useRef } from "react";
import { TextFillAnimation } from "@/components/block/text-fill-animation";

export default function Demo() {
  const scroller = useRef(null);
  return (
    <div ref={scroller} tabIndex={0} aria-label="Scroll to preview the text fill" className="h-[400px] overflow-y-auto overscroll-contain">
      <TextFillAnimation
        scroller={scroller}
        height="850px"
        viewportHeight="400px"
        showDetails={false}
        text="Make something worth remembering. Build your next idea with ObsidianUI."
        textSize="2rem"
        mobileTextSize="1.6rem"
        tabletTextSize="2rem"
      />
    </div>
  );
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/text-fill-animation.json"
```

## Usage

```jsx
"use client";
import { useRef } from "react";
import { TextFillAnimation } from "@/components/block/text-fill-animation";

export default function Demo() {
  const scroller = useRef(null);
  return (
    <div ref={scroller} tabIndex={0} aria-label="Scroll to preview the text fill" className="h-[400px] overflow-y-auto overscroll-contain">
      <TextFillAnimation
        scroller={scroller}
        height="850px"
        viewportHeight="400px"
        showDetails={false}
        text="Make something worth remembering. Build your next idea with ObsidianUI."
        textSize="2rem"
        mobileTextSize="1.6rem"
        tabletTextSize="2rem"
      />
    </div>
  );
}
```

## Install manually — complete source

Download the complete manifest: [text-fill-animation.json](https://www.obsidianui.dev/r/text-fill-animation.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install clsx gsap tailwind-merge
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/text-fill-animation.css

Installation target: `@components/block/text-fill-animation.css`

```css
@keyframes obsidian-text-fill-color {
  0% { color: var(--tfa-dim-color); }
  30% { color: var(--tfa-primary-color); }
  100% { color: var(--tfa-text-color); }
}

.obsidian-text-fill .split__wrapper .split-chars {
  transition: color 0.4s;
  color: var(--tfa-dim-color);
}

.obsidian-text-fill .split__wrapper .split-chars.show {
  animation: obsidian-text-fill-color 0.5s;
  color: var(--tfa-text-color);
}

.obsidian-text-fill .tfa-viewport { height: var(--tfa-viewport-height); }
.obsidian-text-fill .tfa-text-wrapper { width: var(--tfa-text-width); }
.obsidian-text-fill .tfa-heading { font-size: var(--tfa-text-size); color: var(--tfa-text-color); }
.obsidian-text-fill .tfa-glow {
  height: calc(var(--tfa-viewport-height) * 0.7);
  width: calc(var(--tfa-viewport-height) * 0.7);
  background: color-mix(in srgb, var(--tfa-primary-color) 5%, transparent);
}

@media (min-width: 768px) and (max-width: 1024px) {
  .obsidian-text-fill .tfa-text-wrapper { width: var(--tfa-tablet-text-width); }
  .obsidian-text-fill .tfa-heading { font-size: var(--tfa-tablet-text-size); }
}

@media (max-width: 767px) {
  .obsidian-text-fill .tfa-text-wrapper { width: var(--tfa-mobile-text-width); }
  .obsidian-text-fill .tfa-heading { font-size: var(--tfa-mobile-text-size); }
}

@media (prefers-reduced-motion: reduce) {
  .obsidian-text-fill { height: auto !important; }
  .obsidian-text-fill .split__wrapper .split-chars {
    animation: none;
    transition: none;
    color: var(--tfa-text-color);
  }
}
```

### components/block/text-fill-animation.jsx

Installation target: `@components/block/text-fill-animation.jsx`

```jsx
'use client';

import { useEffect, useId, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';
import { cn } from '@/lib/utils';
import './text-fill-animation.css';

const SPLIT_CHARACTER_SELECTOR = '.split-chars';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/**
 * @param {{
 *   text?: string, textColor?: string, primaryColor?: string, dimColor?: string,
 *   backgroundColor?: string, className?: string, id?: string,
 *   textSize?: string, textWidth?: string, containerClassName?: string,
 *   mobileTextSize?: string, mobileTextWidth?: string,
 *   tabletTextSize?: string, tabletTextWidth?: string,
 *   scroller?: HTMLElement | Window | import('react').RefObject<HTMLElement | null>,
 *   trigger?: HTMLElement | import('react').RefObject<HTMLElement | null>,
 *   start?: string, end?: string, scrub?: number | boolean,
 *   height?: string | number, viewportHeight?: string, showDetails?: boolean,
 *   style?: import('react').CSSProperties
 * }} props
 */
export function TextFillAnimation({
  text = 'Build thoughtful interfaces, bring your ideas to life, and make every interaction feel right with ObsidianUI.',
  textColor = 'var(--foreground)',
  primaryColor = '#ff6b00',
  dimColor = 'color-mix(in srgb, var(--foreground) 20%, var(--background))',
  backgroundColor = 'var(--background)',
  className = '',
  id,
  textSize = '5vw',
  textWidth = '80%',
  containerClassName = '',
  mobileTextSize = '8vw',
  mobileTextWidth = '95%',
  tabletTextSize = '6.5vw',
  tabletTextWidth = '88%',
  scroller,
  trigger,
  start = 'top top',
  end = 'bottom bottom',
  scrub = 0.25,
  height = '250vh',
  viewportHeight = '100vh',
  showDetails = true,
  style,
}) {
  // State and refs
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const generatedId = useId();

  // Effects
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const textElement = textRef.current;

      if (!textElement) {
        return;
      }

      const split = SplitText.create(textElement, {
        type: 'words chars',
        aria: 'auto',
        tag: 'span',
        charsClass: 'split-chars',
      });

      gsap.set(textElement, {
        opacity: 1,
      });

      const characters = Array.from(
        textElement.querySelectorAll(SPLIT_CHARACTER_SELECTOR)
      );

      gsap
        .timeline({
          scrollTrigger: {
            trigger: (trigger?.current !== undefined ? trigger.current : trigger) ?? sectionRef.current,
            scroller: scroller?.current !== undefined ? scroller.current : scroller,
            start,
            end,
            scrub,
            invalidateOnRefresh: true,
          },
        })
        .to(
          characters,
          {
            className: 'split-chars show',
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.inOut',
          },
          0
        );

      return () => {
        split.revert();
      };
    }, sectionRef);

    return () => {
      media.revert();
    };
  }, [
    text,
    trigger,
    scroller,
    start,
    end,
    scrub,
  ]);

  // Return
  return (
    <section
      id={id ?? `obsidian-text-fill-${generatedId}`}
      ref={sectionRef}
      className={cn('obsidian-text-fill relative w-full font-body text-foreground', containerClassName)}
      style={{
        backgroundColor,
        height,
        '--tfa-viewport-height': viewportHeight,
        '--tfa-text-color': textColor,
        '--tfa-primary-color': primaryColor,
        '--tfa-dim-color': dimColor,
        '--tfa-text-size': textSize,
        '--tfa-text-width': textWidth,
        '--tfa-tablet-text-size': tabletTextSize,
        '--tfa-tablet-text-width': tabletTextWidth,
        '--tfa-mobile-text-size': mobileTextSize,
        '--tfa-mobile-text-width': mobileTextWidth,
        ...style,
      }}
    >
      <div className="tfa-viewport sticky top-0 flex items-center justify-center overflow-x-hidden">
        <div aria-hidden="true" className="tfa-glow pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

        {showDetails && (
          <>
            <div className="absolute left-[5vw] top-[5vh]">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground max-md:text-sm max-sm:text-xs">
                Design Philosophy
              </p>
            </div>
    
            <div className="absolute right-[5vw] top-[5vh] text-right">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground max-md:text-sm max-sm:text-xs">
                Scroll ↓
              </p>
            </div>
    
            <div className="absolute bottom-[6vh] left-[5vw] max-w-55">
              <p className="text-sm leading-relaxed text-muted-foreground max-md:text-lg max-sm:text-sm">
                Less friction.
                <br />
                More building.
              </p>
            </div>
    
            <div className="absolute bottom-[6vh] right-[5vw] text-right">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground max-md:text-lg max-sm:text-sm">
                  Systems
                </p>
                <p className="text-sm text-muted-foreground max-md:text-lg max-sm:text-sm">
                  Motion
                </p>
                <p className="text-sm text-muted-foreground max-md:text-lg max-sm:text-sm">
                  Clarity
                </p>
              </div>
            </div>
          </>
        )}

        <div className="split__wrapper tfa-text-wrapper relative z-10 mx-auto text-center">
          <h2
            ref={textRef}
            className={cn('tfa-heading font-heading font-medium leading-[1.18] tracking-[-0.03em]', className)}
          >
            {text}
          </h2>
        </div>
      </div>
    </section>
  );
}
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

## Preview behavior

Scroll inside the preview to fill the text. The effect stays inside its container and respects reduced motion preferences.
