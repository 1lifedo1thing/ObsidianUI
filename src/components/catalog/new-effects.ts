import { scrollEffects } from "./scroll-effects";
import { cursorEffects } from "./cursor-effects";
import { webglEffects } from "./webgl-effects";

export const newEffects = [
    ...scrollEffects,
    ...cursorEffects,
    ...webglEffects,
    { slug: "magnetic-image-trail", title: "Magnetic Image Trail", description: "A cluster of images follows your cursor with magnetic momentum and a diagonal orbit.", hint: "Move your cursor across the preview." },
    { slug: "arrow-fill-button", title: "Arrow Fill Button", description: "A rounded button with an expanding color fill and a sliding arrow on hover or keyboard focus.", hint: "Hover or focus the button to see its fill animation." },
    { slug: "dotted-grid", title: "Dotted Grid", description: "An animated dot field transforms between geometric shapes and responds to your cursor with a glowing trail.", hint: "Move across the grid to draw a trail." },
    { slug: "interactive-blur-reveal", title: "Interactive Blur Reveal", description: "A frosted image becomes clear beneath a fluid cursor trail, with noise distortion and subtle grain.", hint: "Move over the image to reveal its detail." },
    { slug: "text-fill-animation", title: "Text Fill Animation", description: "A scroll-driven color sweep brings text into focus one character at a time.", hint: "Scroll inside the preview to fill the text." },
    { slug: "rectangular-text-reveal", title: "Rectangular Text Reveal", description: "Colored rectangles sweep across each line before revealing the text underneath.", hint: "Use Reload component to replay the reveal." },
    { slug: "text-stream", title: "Text Stream", description: "A continuous vertical text stream changes speed and direction with your scroll.", hint: "Scroll the page to change the stream’s momentum." },
    { slug: "dither-canvas", title: "Dither Canvas", description: "A video becomes a bright blue and cyan dither texture on white, with fluid distortion that follows your pointer.", hint: "Move across the canvas to disturb the texture." },
] as const;

export type NewEffectSlug = (typeof newEffects)[number]["slug"];
