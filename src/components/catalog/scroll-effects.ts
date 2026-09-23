export const scrollEffects = [
  { slug: "draggable-marquee", title: "Draggable Marquee", description: "A continuous image marquee with drag momentum and a seamless looping track.", hint: "Drag the images, or focus the marquee and use the left and right arrow keys." },
] as const;

export type ScrollSlug = typeof scrollEffects[number]["slug"];

export const scrollMarqueeImages = [1, 2, 3, 4].map(index => ({
  id: index,
  src: `https://cdn-new.obsidianui.dev/imagess/${index}.png`,
  alt: `Landscape photograph ${index}`,
  width: 420,
  height: 520,
  imageClassName: "h-[260px] w-[200px] rounded-2xl object-cover",
}));

export const scrollExamples: Record<ScrollSlug, string> = {
  "draggable-marquee": `"use client";\nimport { DraggableMarquee } from "@/components/block/draggable-marquee";\n\nconst items = ${JSON.stringify(scrollMarqueeImages, null, 2)};\n\nexport default function Demo() {\n  return <DraggableMarquee items={items} speed={1} className="py-8" />;\n}`,
};
