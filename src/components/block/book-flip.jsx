"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Experience } from "@/lib/effects/book-flip/Experience";
import { PageProvider, usePage } from "@/lib/effects/book-flip/PageContext";
import { WebGLSurface, useEffectReducedMotion } from "@/lib/effects/shared/webgl-surface";

const defaultImages = Array.from({ length: 14 }, (_, index) => `book-flip-img${String(index + 1).padStart(2, "0")}`);
const defaultCameraDistance = { mobile: 5.5, desktop: 4 };

function CameraFit({ cameraDistance }) {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.set(-0.5, 1, size.width < 480 ? cameraDistance.mobile : cameraDistance.desktop);
    camera.updateProjectionMatrix();
  }, [camera, size.width, cameraDistance]);
  return null;
}

function BookNavigation({ images }) {
  const { page, setPage } = usePage();
  const count = Math.ceil(images.length / 2);
  return <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-3">
    <div role="group" aria-label="Book pages" className="pointer-events-auto flex max-w-full gap-2 overflow-x-auto rounded-full bg-black/20 p-1">
      {Array.from({ length: count + 1 }, (_, index) => <button
        key={index}
        type="button"
        aria-pressed={index === page}
        onClick={() => setPage(index)}
        className={`shrink-0 rounded-full px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${index === page ? "bg-white/90 text-black" : "bg-black/30 text-white"}`}
      >{index === 0 ? "Cover" : index === count ? "Back cover" : `Page ${index}`}</button>)}
    </div>
  </div>;
}

function BookScene({ images, pathPattern, bgColor, cameraDistance, showUI }) {
  const reducedMotion = useEffectReducedMotion();
  return <PageProvider>
    <Canvas
      frameloop={reducedMotion ? "demand" : "always"}
      dpr={[1, 2]}
      style={{ position: "absolute", inset: 0, background: bgColor }}
      camera={{ position: [-0.5, 1, cameraDistance.desktop], fov: 45 }}
    >
      <CameraFit cameraDistance={cameraDistance} />
      <Suspense fallback={null}>
        <Experience images={images} pathPattern={pathPattern} orbitControls={{ minAzimuthAngle: -Math.PI * 0.06, maxAzimuthAngle: Math.PI * 0.06, minPolarAngle: 1.07, maxPolarAngle: 1.58, rotateSpeed: 0.2, enableDamping: !reducedMotion }} />
      </Suspense>
    </Canvas>
    {showUI && <BookNavigation images={images} />}
  </PageProvider>;
}

/**
 * Images are PNG page names without their extension, resolved against pathPattern.
 * @param {{ images?: string[], pathPattern?: string, bgColor?: string, cameraDistance?: { mobile: number, desktop: number }, showUI?: boolean, className?: string, style?: import("react").CSSProperties }} props
 */
export function BookFlip({ images = defaultImages, pathPattern = "https://pub-830233752de349e29c6104a501b309d4.r2.dev/effects/book-flip", bgColor = "#000000", cameraDistance = defaultCameraDistance, showUI = true, className, style } = {}) {
  return <WebGLSurface className={className} style={style} imageSrc={`${pathPattern}/${images[0] || "book-flip-img01"}.png`} label="ObsidianUI interactive nature book">
    <BookScene images={images} pathPattern={pathPattern} bgColor={bgColor} cameraDistance={cameraDistance} showUI={showUI} />
  </WebGLSurface>;
}
