export const webglEffects = [
  { slug: "art-gallery", title: "Art Gallery", description: "A lensed photo grid you can drag through, with barrel distortion and infinite tiled studies.", hint: "Drag inside the preview to pan the gallery." },
] as const;

export type WebglSlug = typeof webglEffects[number]["slug"];

export const webglExamples: Record<WebglSlug, string> = {
  "art-gallery": `import { ArtGallery } from "@/components/block/art-gallery";

export default function Demo() {
  return <ArtGallery className="h-[400px]" />;
}`,
};
