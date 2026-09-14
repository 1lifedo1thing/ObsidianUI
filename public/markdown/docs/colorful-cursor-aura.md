# ObsidianUI — Colorful Cursor Aura

[Canonical page](https://www.obsidianui.dev/docs/colorful-cursor-aura) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

Three colored masks follow the pointer through bold typography with staggered easing.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/colorful-cursor-aura)

Move across the lettering to reveal the colored aura.

```tsx
"use client";
import { ColorfulCursorAura } from "@/components/block/colorful-cursor-aura";

export default function Demo() {
  return <ColorfulCursorAura height={400} text="ObsidianUI, in full color." />;
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/colorful-cursor-aura.json"
```

## Usage

```jsx
"use client";
import { ColorfulCursorAura } from "@/components/block/colorful-cursor-aura";

export default function Demo() {
  return <ColorfulCursorAura height={400} text="ObsidianUI, in full color." />;
}
```

## Install manually — complete source

Download the complete manifest: [colorful-cursor-aura.json](https://www.obsidianui.dev/r/colorful-cursor-aura.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install clsx gsap motion tailwind-merge
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/colorful-cursor-aura.jsx

Installation target: `@components/block/colorful-cursor-aura.jsx`

```jsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";



/** @param {{ text?: string, colors?: {color1: string, color2: string, color3: string}, enableEntryAnimation?: boolean, textColor?: string, className?: string, height?: import("react").CSSProperties["height"], style?: import("react").CSSProperties }} props */
export function ColorfulCursorAura({
  text = "ObsidianUI, in full color.",
  colors = {
    color1: "#7f7de4",
    color2: "#f79694",
    color3: "#f5dd94",
  },
  enableEntryAnimation = false,
  textColor = "#000000",
  className = "",
  height = 400,
  style,
} = {}) {
  const container = useRef(null);
  const auraText = useRef(null);
  const maskedText = useRef(null);
  const motionEnabled = !useReducedMotion();
  const circleTrackers = useRef([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);


  useEffect(() => {
    const el = container.current;
    const maskEl = maskedText.current;
    const trackers = circleTrackers.current;
    if (!el || !maskEl || !motionEnabled) {
      gsap.killTweensOf(trackers);
      return;
    }

    const syncMaskVars = () => {
      maskEl.style.setProperty("--x-color1", `${circleTrackers.current[0].x}px`);
      maskEl.style.setProperty("--y-color1", `${circleTrackers.current[0].y}px`);
      maskEl.style.setProperty("--x-color2", `${circleTrackers.current[1].x}px`);
      maskEl.style.setProperty("--y-color2", `${circleTrackers.current[1].y}px`);
      maskEl.style.setProperty("--x-color3", `${circleTrackers.current[2].x}px`);
      maskEl.style.setProperty("--y-color3", `${circleTrackers.current[2].y}px`);
    };

    const rect = maskEl.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    circleTrackers.current.forEach((item) => {
      item.x = cx;
      item.y = cy;
    });
    syncMaskVars();

    const onMove = (event) => {
      const maskRect = maskEl.getBoundingClientRect();
      const localX = event.clientX - maskRect.left;
      const localY = event.clientY - maskRect.top;

      gsap.to(circleTrackers.current, {
        x: localX,
        y: localY,
        duration: 0.5,
        ease: "power1.out",
        stagger: -0.1,
        overwrite: "auto",
        onUpdate: syncMaskVars,
      });
    };

    el.addEventListener("mousemove", onMove);
    return () => {
      el.removeEventListener("mousemove", onMove);
      gsap.killTweensOf(trackers);
    };
  }, [motionEnabled]);

  useEffect(() => {
    if (!enableEntryAnimation || !motionEnabled) return;

    const ctx = gsap.context(() => {
      gsap.from(auraText.current, {
        opacity: 0,
        yPercent: 320,
        skewY: 30,
        duration: 3,
        ease: "expo.out",
      });
    }, container);

    return () => ctx.revert();
  }, [enableEntryAnimation, motionEnabled]);

  return (
    <section
      ref={container}
      className={cn("relative isolate w-full overflow-hidden bg-[#ececec]", className)}
      style={{ height, containerType: "inline-size", ...style }}
    >
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <div ref={auraText} className="relative w-[70%] max-lg:w-[80%]">
          <p
            className="text-center text-[clamp(24px,6cqw,72px)] font-medium leading-none"
            style={{ color: textColor }}
          >
            {text}
          </p>

          {motionEnabled && (
            <p
              ref={maskedText}
              aria-hidden
              className="pointer-events-none absolute inset-0 text-center text-[clamp(24px,6cqw,72px)] font-medium leading-none text-transparent [background-clip:text] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
              style={{
                "--x-color1": "50%",
                "--y-color1": "50%",
                "--x-color2": "50%",
                "--y-color2": "50%",
                "--x-color3": "50%",
                "--y-color3": "50%",
                backgroundImage: `
                  radial-gradient(circle min(135px, 14cqw) at var(--x-color3) var(--y-color3), ${colors.color3} 0 99%, transparent 100%),
                  radial-gradient(circle min(220px, 23cqw) at var(--x-color2) var(--y-color2), ${colors.color2} 0 99%, transparent 100%),
                  radial-gradient(circle min(325px, 34cqw) at var(--x-color1) var(--y-color1), ${colors.color1} 0 99%, transparent 100%)
                `,
              }}
            >
              {text}
            </p>
          )}
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

Move across the lettering to reveal the colored aura. The effect stays inside its container and respects reduced motion preferences.
