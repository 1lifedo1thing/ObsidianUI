export const webglEffects = [
  { slug: "book-flip", title: "Book Flip", description: "A tactile 3D book with bending pages, realistic light, and interactive page turns.", hint: "Select a page or click the book to turn it." },
  { slug: "curved-plane", title: "Curved Plane", description: "An image carousel whose edges curve and stretch with your drag and scroll velocity.", hint: "Drag the images or scroll over the canvas." },
  { slug: "fractal-glass", title: "Fractal Glass", description: "Glass strips refract an image with fractal distortion and pointer-driven parallax.", hint: "Move your pointer across the glass." },
  { slug: "grid-lift", title: "Grid Lift", description: "A fine grid lifts into a dimensional text or SVG mask around your pointer.", hint: "Move across the grid to reveal the raised wordmark." },
  { slug: "interactive-hover-slider", title: "Hover Slider", description: "An editorial list reveals a curved image stack with elastic image transitions.", hint: "Hover or focus a project row to reveal its image." },
] as const;

export type WebglSlug = typeof webglEffects[number]["slug"];

export const webglExamples: Record<WebglSlug, string> = {
  "book-flip": `import { BookFlip } from "@/components/block/book-flip";

export default function Demo() {
  return <BookFlip className="h-[400px]" />;
}`,
  "curved-plane": `import { CurvedPlane } from "@/components/block/curved-plane";

export default function Demo() {
  return <CurvedPlane className="h-[400px]" />;
}`,
  "fractal-glass": `import { FractalGlass } from "@/components/block/fractal-glass";

export default function Demo() {
  return <FractalGlass className="h-[400px]" stripesFrequency={8} glassStrength={0.8} />;
}`,
  "grid-lift": `import { GridLift } from "@/components/block/grid-lift";

export default function Demo() {
  return <GridLift className="h-[400px]" text="OBSIDIANUI" />;
}`,
  "interactive-hover-slider": `import { InteractiveHoverSlider } from "@/components/block/interactive-hover-slider";

export default function Demo() {
  return <InteractiveHoverSlider className="h-[400px]" />;
}`,
};
