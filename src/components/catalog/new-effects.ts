import { scrollEffects } from "./scroll-effects";
import { webglEffects } from "./webgl-effects";

export const newEffects = [
    ...scrollEffects,
    ...webglEffects,
    { slug: "text-stream", title: "Text reel", description: "A continuous vertical text stream changes speed and direction with your scroll.", hint: "Scroll the page to change the stream's momentum." },
] as const;

export type NewEffectSlug = (typeof newEffects)[number]["slug"];
