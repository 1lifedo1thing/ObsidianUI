"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface PreviewVideoProps {
  src: string;
  label: string;
  poster?: string;
  className?: string;
  playOnHover?: boolean;
  showControls?: boolean;
}

/** Previews pause offscreen and start paused when reduced motion is requested. */
export function PreviewVideo(props: PreviewVideoProps) {
  return <PreviewVideoPlayer key={props.src} {...props} />;
}

function PreviewVideoPlayer({
  src,
  label,
  poster,
  className,
  playOnHover = false,
  showControls = true,
}: PreviewVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [playRequested, setPlayRequested] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);
  const shouldPlay = inView && !failed && (
    playRequested ?? (reduceMotion === false && (!playOnHover || hovered))
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let active = true;
    if (shouldPlay) {
      void video.play().catch(() => { if (active) setPlayRequested(false); });
    } else {
      video.pause();
    }
    return () => { active = false; video.pause(); };
  }, [shouldPlay, src]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden bg-muted", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <video
        key={src}
        ref={videoRef}
        src={src}
        poster={poster}
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
        loop
        muted
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
      />
      {failed ? (
        <p role="status" className="absolute inset-0 flex items-center justify-center bg-background/90 p-4 text-center text-sm text-muted-foreground">
          Preview unavailable. Open the component details to explore it.
        </p>
      ) : showControls ? (
        <button
          type="button"
          onClick={() => setPlayRequested(!shouldPlay)}
          aria-label={`${shouldPlay ? "Pause" : "Play"} ${label}`}
          className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {shouldPlay ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
        </button>
      ) : null}
    </div>
  );
}
