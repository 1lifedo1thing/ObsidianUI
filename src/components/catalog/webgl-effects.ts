export const webglEffects = [
  {
    slug: "v-prism",
    title: "v-prism",
    description: "An interactive glass prism that bends a beam into a spectrum of color. The source setup includes vGPU tooling; this component renders with Three.js. Recreated from Vercel's v-prism.",
    hint: "Click and drag inside the preview to aim the beam at the prism.",
    docs: `## Scene settings

The reference project exposes these values in its scene tuning panel. Adjust them to change the lighting, spectrum, glass, and background.

\`\`\`json
{
  "ambientLight": 0.015,
  "pointLights": 0.05,
  "spotIntensity": 1,
  "rainbowGlow": 2.5,
  "bloom": 0.5,
  "reflections": 2.5,
  "roughness": 0,
  "ior": 1.5,
  "thickness": 0.9,
  "background": "#000000",
  "prismTint": "#ffffff"
}
\`\`\`

<VPrismSettings />

The settings above match the reference project's tuning panel. The published ObsidianUI VPrism currently accepts the other values through its settings prop; reflections is only supported by the full reference implementation and is ignored by the published component.`
  },
  { slug: "art-gallery", title: "Art Gallery", description: "A lensed photo grid you can drag through, with barrel distortion and infinite tiled studies.", hint: "Drag inside the preview to pan the gallery." },
] as const;

export type WebglSlug = typeof webglEffects[number]["slug"];

export const webglExamples: Record<WebglSlug, string> = {
  "v-prism": `import { VPrism } from "@/components/block/v-prism";

export default function Demo() {
  return <div className="h-[500px] overflow-hidden rounded-3xl"><VPrism /></div>;
}`,
  "art-gallery": `import { ArtGallery } from "@/components/block/art-gallery";

export default function Demo() {
  return <ArtGallery className="h-[400px]" />;
}`,
};
