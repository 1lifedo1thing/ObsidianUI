# ObsidianUI — SVG Pixel Reveal

[Canonical page](https://www.obsidianui.dev/docs/svg-pixel-reveal) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

An SVG pixel filter dissolves into a crisp photograph as it enters the scroll area.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/svg-pixel-reveal)

Scroll inside the preview to reveal the photograph.

```tsx
"use client";
import { useRef } from "react";
import { SvgPixelReveal } from "@/components/block/svg-pixel-reveal";


export default function Demo() {
  const scroller = useRef<HTMLDivElement>(null);
  return <div ref={scroller} tabIndex={0} aria-label="Scroll effect preview" className="relative h-[400px] overflow-y-auto overscroll-contain" style={{ containerType: "size" }}>
    <div className="flex h-[45cqh] items-center justify-center">Scroll to reveal</div>
    <SvgPixelReveal src="https://www.obsidianui.dev/effects/svg-pixel-reveal/svg-pixel-reveal-img01.png" alt="Landscape photograph" scroller={scroller} start="top 35%" style={{ width: "86%", height: "70cqh", margin: "0 auto" }} />
    <div className="h-[50cqh]" />
  </div>;
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/svg-pixel-reveal.json"
```

## Usage

```jsx
"use client";
import { useRef } from "react";
import { SvgPixelReveal } from "@/components/block/svg-pixel-reveal";


export default function Demo() {
  const scroller = useRef<HTMLDivElement>(null);
  return <div ref={scroller} tabIndex={0} aria-label="Scroll effect preview" className="relative h-[400px] overflow-y-auto overscroll-contain" style={{ containerType: "size" }}>
    <div className="flex h-[45cqh] items-center justify-center">Scroll to reveal</div>
    <SvgPixelReveal src="https://www.obsidianui.dev/effects/svg-pixel-reveal/svg-pixel-reveal-img01.png" alt="Landscape photograph" scroller={scroller} start="top 35%" style={{ width: "86%", height: "70cqh", margin: "0 auto" }} />
    <div className="h-[50cqh]" />
  </div>;
}
```

## Install manually — complete source

Download the complete manifest: [svg-pixel-reveal.json](https://www.obsidianui.dev/r/svg-pixel-reveal.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install gsap
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/svg-pixel-reveal.jsx

Installation target: `@components/block/svg-pixel-reveal.jsx`

```jsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "@/lib/effects/svg-pixel-reveal/styles.css";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

function PixelateSvgFilter({ id, size, crossLayers }) {
  return (
    <svg aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", height: 0, width: 0, overflow: "hidden" }}>
      <defs>
        <filter id={id} x="0" y="0" width="1" height="1">
          <feConvolveMatrix kernelMatrix="1 1 1 1 1 1 1 1 1" result="AVG" />
          <feFlood x="1" y="1" width="1" height="1" />
          <feComposite operator="arithmetic" k1="0" k2="1" k3="0" k4="0" width={size} height={size} />
          <feTile result="TILE" />
          <feComposite in="AVG" in2="TILE" operator="in" />
          <feMorphology operator="dilate" radius={size / 2} result="NORMAL" />

          {crossLayers && (
            <>
              <feConvolveMatrix kernelMatrix="1 1 1 1 1 1 1 1 1" result="AVG" />
              <feFlood x="1" y="1" width="1" height="1" />
              <feComposite in2="SourceGraphic" operator="arithmetic" k1="0" k2="1" k3="0" k4="0" width={size / 2} height={size} />
              <feTile result="TILE" />
              <feComposite in="AVG" in2="TILE" operator="in" />
              <feMorphology operator="dilate" radius={size / 2} result="FALLBACKX" />

              <feConvolveMatrix kernelMatrix="1 1 1 1 1 1 1 1 1" result="AVG" />
              <feFlood x="1" y="1" width="1" height="1" />
              <feComposite in2="SourceGraphic" operator="arithmetic" k1="0" k2="1" k3="0" k4="0" width={size} height={size / 2} />
              <feTile result="TILE" />
              <feComposite in="AVG" in2="TILE" operator="in" />
              <feMorphology operator="dilate" radius={size / 2} result="FALLBACKY" />

              <feMerge>
                <feMergeNode in="FALLBACKX" />
                <feMergeNode in="FALLBACKY" />
                <feMergeNode in="NORMAL" />
              </feMerge>
            </>
          )}

          {!crossLayers && <feMergeNode in="NORMAL" />}
        </filter>
      </defs>
    </svg>
  );
}

/** @param {{src?: string, alt?: string, initialPixelSize?: number, finalPixelSize?: number, start?: string, end?: string,
 * crossLayers?: boolean, style?: import('react').CSSProperties, scroller?: HTMLElement | import('react').RefObject<HTMLElement | null>}} props */
export function SvgPixelReveal({
  src,
  alt = "Image",
  initialPixelSize = 22,
  finalPixelSize = 1,
  start = "top 50%",
  end = "bottom 35%",
  crossLayers = true,
  style = {},
  scroller,
}) {
  const containerRef = useRef(null);
  const filterId = useId().replace(/:/g, "");
  const [pixelSize, setPixelSize] = useState(initialPixelSize);
  const shouldApplyFilter = pixelSize > finalPixelSize + 0.01;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {

    const animatedState = { size: initialPixelSize };

    const tween = gsap.to(animatedState, {
      size: finalPixelSize,
      duration: 1.0,
      ease: "none",
      paused: true,
      onUpdate: () => setPixelSize(animatedState.size),
    });

    const trigger = ScrollTrigger.create({
      trigger: container,
      scroller: scroller?.current !== undefined ? scroller.current : scroller,
      start,
      end,
      animation: tween,
      invalidateOnRefresh: true,
    });

    return () => { trigger.kill(); tween.kill(); };
    }, containerRef);
    return () => media.revert();
  }, [end, finalPixelSize, initialPixelSize, start, scroller]);

  return (
    <div ref={containerRef} style={{ position: "relative", ...style }}>
      <PixelateSvgFilter id={filterId} size={pixelSize} crossLayers={crossLayers} />
      <div
        className="obsidian-svg-pixel-image"
        style={{
          position: "relative", height: "100%", width: "100%", overflow: "hidden",
          filter: shouldApplyFilter ? `url(#${filterId})` : undefined,
        }}
      >
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    </div>
  );
}
```

### lib/effects/svg-pixel-reveal/styles.css

Installation target: `@lib/effects/svg-pixel-reveal/styles.css`

```css
@media (prefers-reduced-motion: reduce) {
  .obsidian-svg-pixel-image { filter: none !important; }
}
```

## Preview behavior

Scroll inside the preview to reveal the photograph. The effect stays inside its container and respects reduced motion preferences.
