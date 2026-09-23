import { scrollExamples } from "./scroll-effects";
import { webglExamples } from "./webgl-effects";
import type { NewEffectSlug } from "./new-effects";

export const effectExamples: Record<NewEffectSlug, string> = {
    ...scrollExamples,
    ...webglExamples,
    "text-stream": `"use client";
import { TextStream } from "@/components/block/text-stream";

export default function Demo() {
  return <TextStream items={["Create", "Explore", "Build", "Ship"]} prefix="Let’s" height="400px" fontSize="2.25rem" />;
}`,
};
