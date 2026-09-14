"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EffectPreview } from "@/components/catalog/effect-preview";
import { PreviewVideo } from "@/components/media/preview-video";
import { Button } from "@/components/ui/button";
import "./weekly-component-badge.css";

const previews = [
  { name: "Apple Spotlight video", x: -14, y: -4, rotate: -15 },
  { name: "Arrow Fill Button", x: 0, y: -9, rotate: -1 },
  { name: "Rectangular Text Reveal", x: 18, y: -3, rotate: 14 },
] as const;

export function WeeklyComponentBadge() {
  const [open, setOpen] = useState(false);
  const keyboardFocus = useRef(false);
  const detailsId = useId();
  const reduceMotion = useReducedMotion();
  const transition = {
    duration: reduceMotion ? 0 : 0.28,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <div
      className="relative isolate inline-flex"
      data-folder-open={open}
      onPointerEnter={event => {
        if (event.pointerType !== "touch") setOpen(true);
      }}
      onPointerLeave={event => {
        if (event.pointerType !== "touch" && !keyboardFocus.current) setOpen(false);
      }}
    >
      <Button
        type="button"
        variant="secondary"
        className="landing-copy h-8 gap-2 rounded-full border border-border bg-muted px-2.5 text-xs font-normal shadow-xs transition-colors hover:bg-muted"
        aria-expanded={open}
        aria-controls={detailsId}
        onFocus={event => {
          keyboardFocus.current = event.currentTarget.matches(":focus-visible");
          if (keyboardFocus.current) setOpen(true);
        }}
        onBlur={() => {
          keyboardFocus.current = false;
          setOpen(false);
        }}
        onClick={event => setOpen(current => event.detail === 0 ? !current : true)}
        onKeyDown={event => {
          if (event.key === "Escape") {
            event.stopPropagation();
            setOpen(false);
          }
        }}
      >
        <span aria-hidden="true" className="h-[18px] w-6 shrink-0" />
        New Component every week
      </Button>

      {/* Decorative live previews stay outside the button and out of the tab order. */}
      <div className="weekly-folder" aria-hidden="true" inert>
        <div className="weekly-folder-back">
          <div className="weekly-folder-tab" />
        </div>
        {previews.map((preview, index) => (
          <motion.div
            key={preview.name}
            className="weekly-folder-card bg-card ring-1 ring-border"
            style={{ zIndex: 10 + index }}
            initial={false}
            animate={open
              ? { x: preview.x, y: preview.y, rotate: preview.rotate, scale: 1 }
              : { x: 0, y: -4.5 + index * 0.75, rotate: -3 + index * 3, scale: 1 / 3 }}
            transition={transition}
          >
            <div className="absolute inset-x-2 top-2 h-0.5 rounded-full bg-muted" />
            <div className="absolute left-2 top-4 h-0.5 w-7 rounded-full bg-muted" />
            <AnimatePresence>
              {open && (
                <motion.div
                  className="weekly-folder-preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.12 }}
                >
                  {index === 0 ? (
                    <PreviewVideo
                      src="https://cdn.obsidianui.dev/demos/apple-spotlight.mp4"
                      label="Apple Spotlight video"
                      showControls={false}
                      className="h-full w-full"
                    />
                  ) : (
                    <EffectPreview slug={index === 1 ? "arrow-fill-button" : "rectangular-text-reveal"} compact />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        <motion.div
          className="weekly-folder-front"
          initial={false}
          animate={{ rotateX: open ? -42 : -18 }}
          transition={transition}
        >
          <div className="weekly-folder-highlight" />
        </motion.div>
      </div>
      <ul id={detailsId} hidden={!open} className="sr-only">
        {previews.map(preview => <li key={preview.name}>{preview.name}</li>)}
      </ul>
    </div>
  );
}
