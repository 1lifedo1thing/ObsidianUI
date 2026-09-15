import { r2 } from "@/lib/r2";

export const scrollEffects = [
  { slug: "draggable-marquee", title: "Draggable Marquee", description: "A continuous image marquee with drag momentum and a seamless looping track.", hint: "Drag the images, or focus the marquee and use the left and right arrow keys." },
  { slug: "parallax-gallery", title: "Parallax Gallery", description: "A framed gallery with rotating photographs, moving side thumbnails, and scroll snapping.", hint: "Scroll inside the preview to move through the photographs." },
  { slug: "scroll-stack", title: "Scroll Stack", description: "Successive cards scale into focus and fade as the next section takes their place.", hint: "Scroll inside the preview to reveal each card." },
  { slug: "svg-path-marquee", title: "Marquee on SVG Path", description: "Images follow a looping SVG curve with drag momentum and scroll-responsive speed.", hint: "Drag the images or use the arrow keys while the path is focused." },
  { slug: "svg-pixel-reveal", title: "SVG Pixel Reveal", description: "An SVG pixel filter dissolves into a crisp photograph as it enters the scroll area.", hint: "Scroll inside the preview to reveal the photograph." },
] as const;

export type ScrollSlug = typeof scrollEffects[number]["slug"];

export const scrollGalleryImages = [1, 2, 3, 4].map(index => r2(`/effects/parallax-gallery/parallax-gallery-img${String(index).padStart(2, "0")}.jpg`));
export const scrollMarqueeImages = [1, 2, 3, 4].map(index => ({
  id: index,
  src: r2(`/effects/draggable-marquee/draggable-marquee-img${String(index).padStart(2, "0")}.jpg`),
  alt: `Landscape photograph ${index}`,
  width: 420,
  height: 520,
  imageClassName: "h-[260px] w-[200px] rounded-2xl object-cover",
}));
export const scrollStackCards = [
  { id: "design", title: "Start with an idea.", description: "Give your next interface a clear purpose and room to breathe.", bgColor: "#e6d5f7", textColor: "#30233c" },
  { id: "motion", title: "Make it feel right.", description: "Use motion to guide attention and connect every interaction.", bgColor: "#d5e8b5", textColor: "#24351c" },
  { id: "build", title: "Make it yours.", description: "Build something worth sharing with ObsidianUI.", bgColor: "#f7c698", textColor: "#432d1c" },
];
export const svgMarqueePath = "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5";
export const svgMarqueeImages = Array.from({ length: 8 }, (_, index) => r2(`/effects/svg-path-marquee/svg-path-marquee-img${String(index + 1).padStart(2, "0")}.png`));

const hosted = (value: unknown) => JSON.stringify(value, null, 2).replaceAll('"/effects/', '"https://www.obsidianui.dev/effects/');
const scrollFrame = (content: string) => `"use client";\nimport { useRef } from "react";\nIMPORT\n\nDATA\nexport default function Demo() {\n  const scroller = useRef<HTMLDivElement>(null);\n  return <div ref={scroller} tabIndex={0} aria-label="Scroll effect preview" className="relative h-[400px] overflow-y-auto overscroll-contain" style={{ containerType: "size" }}>\n    ${content}\n  </div>;\n}`;

export const scrollExamples: Record<ScrollSlug, string> = {
  "draggable-marquee": `"use client";\nimport { DraggableMarquee } from "@/components/block/draggable-marquee";\n\nconst items = ${hosted(scrollMarqueeImages)};\n\nexport default function Demo() {\n  return <DraggableMarquee items={items} speed={1} className="py-8" />;\n}`,
  "parallax-gallery": scrollFrame('<ParallaxGallery images={images} scroller={scroller} viewportHeight="100cqh" frameWidth={240} frameHeight={280} thumbnailWidth={90} thumbnailHeight={130} />').replace("IMPORT", 'import { ParallaxGallery } from "@/components/block/parallax-gallery";').replace("DATA", `const images = ${hosted(scrollGalleryImages)};`),
  "scroll-stack": scrollFrame('<ScrollStack cards={cards} scroller={scroller} viewportHeight="100cqh" contained />').replace("IMPORT", 'import { ScrollStack } from "@/components/block/scroll-stack";').replace("DATA", `const cards = ${hosted(scrollStackCards)};`),
  "svg-path-marquee": `"use client";\nimport { SvgPathMarquee } from "@/components/block/svg-path-marquee";\n\nconst path = ${JSON.stringify(svgMarqueePath)};\nconst images = ${hosted(svgMarqueeImages)};\n\nexport default function Demo() {\n  return <SvgPathMarquee path={path} viewBox="0 0 996 330" className="h-[400px] w-full overflow-hidden bg-black" responsive draggable grabCursor baseVelocity={8} repeat={2}>\n    {images.map((src, index) => <img key={src} src={src} alt={\`Landscape \${index + 1}\`} width={100} height={140} draggable={false} />)}\n  </SvgPathMarquee>;\n}`,
  "svg-pixel-reveal": scrollFrame('<div className="flex h-[45cqh] items-center justify-center">Scroll to reveal</div>\n    <SvgPixelReveal src="https://cdn-athrix.milliondollarinternet.lol/effects/svg-pixel-reveal/svg-pixel-reveal-img01.png" alt="Landscape photograph" scroller={scroller} start="top 35%" style={{ width: "86%", height: "70cqh", margin: "0 auto" }} />\n    <div className="h-[50cqh]" />').replace("IMPORT", 'import { SvgPixelReveal } from "@/components/block/svg-pixel-reveal";').replace("DATA", ""),
};
