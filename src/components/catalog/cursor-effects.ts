export const cursorEffects = [
  { slug: "butterfly-trail-cursor", title: "Butterfly Trail Cursor", description: "Animated butterflies lift away from the pointer with soft wing motion and fading trails.", hint: "Move the pointer across the preview to release butterflies." },
  { slug: "colorful-cursor-aura", title: "Colorful Cursor Aura", description: "Three colored masks follow the pointer through bold typography with staggered easing.", hint: "Move across the lettering to reveal the colored aura." },
  { slug: "interactive-arrows", title: "Interactive Arrows", description: "Six canvas arrow and line patterns respond to the pointer with rotation, spacing, and opacity.", hint: "Move across the arrows. In the full preview, choose another behavior." },
  { slug: "rope-cursor", title: "Rope Cursor", description: "A smooth segmented rope follows the pointer with progressively delayed motion.", hint: "Move across the preview to draw a flowing rope trail." },
] as const;

export type CursorSlug = typeof cursorEffects[number]["slug"];

export const cursorExamples: Record<CursorSlug, string> = {
  "butterfly-trail-cursor": `"use client";
import { ButterflyTrailCursor } from "@/components/block/butterfly-trail-cursor";

export default function Demo() {
  return <ButterflyTrailCursor height={400} text="ObsidianUI, in flight." />;
}`,
  "colorful-cursor-aura": `"use client";
import { ColorfulCursorAura } from "@/components/block/colorful-cursor-aura";

export default function Demo() {
  return <ColorfulCursorAura height={400} text="ObsidianUI, in full color." />;
}`,
  "interactive-arrows": `"use client";
import { InteractiveArrows } from "@/components/block/interactive-arrows";

export default function Demo() {
  return <InteractiveArrows height={400} variant="arrows" showControls />;
}`,
  "rope-cursor": `"use client";
import { RopeCursor } from "@/components/block/rope-cursor";

export default function Demo() {
  return <RopeCursor height={400} ropeColor="#d0b88c" ropeWidth={3} className="bg-[#151714]">
    <p className="pointer-events-none grid h-full place-items-center text-3xl text-[#d0b88c]">Follow your curiosity.</p>
  </RopeCursor>;
}`,
};
