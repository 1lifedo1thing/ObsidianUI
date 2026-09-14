import { scrollExamples } from "./scroll-effects";
import { cursorExamples } from "./cursor-effects";
import { webglExamples } from "./webgl-effects";
import type { NewEffectSlug } from "./new-effects";

export const effectExamples: Record<NewEffectSlug, string> = {
    ...scrollExamples,
    ...cursorExamples,
    ...webglExamples,
    "magnetic-image-trail": `"use client";
import { MagneticImageTrail } from "@/components/block/magnetic-image-trail";

export default function Demo() {
  return <MagneticImageTrail height="400px" className="w-full rounded-lg" />;
}`,
    "arrow-fill-button": `"use client";
import { ArrowFillButton } from "@/components/block/arrow-fill-button";

export default function Demo() {
  return <ArrowFillButton href="/components">Explore ObsidianUI</ArrowFillButton>;
}`,
    "dotted-grid": `"use client";
import { DottedGrid } from "@/components/block/dotted-grid";

export default function Demo() {
  return <DottedGrid className="h-[400px] w-full rounded-lg" />;
}`,
    "interactive-blur-reveal": `"use client";
import { InteractiveBlurReveal } from "@/components/block/interactive-blur-reveal";

export default function Demo() {
  return <InteractiveBlurReveal className="h-[400px] w-full rounded-lg" />;
}`,
    "text-fill-animation": `"use client";
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
}`,
    "rectangular-text-reveal": `"use client";
import { RectangularTextReveal } from "@/components/block/rectangular-text-reveal";

export default function Demo() {
  return (
    <RectangularTextReveal className="text-3xl leading-tight text-foreground" overlayColor="var(--background)">
      Design less.<br />Ship better.
    </RectangularTextReveal>
  );
}`,
    "text-stream": `"use client";
import { TextStream } from "@/components/block/text-stream";

export default function Demo() {
  return <TextStream items={["Create", "Explore", "Build", "Ship"]} prefix="Let’s" height="400px" fontSize="2.25rem" />;
}`,
    "dither-canvas": `"use client";
import { DitherCanvas } from "@/components/block/dither-canvas";

export default function Demo() {
  return <DitherCanvas className="h-[400px] w-full rounded-lg" />;
}`,
};
