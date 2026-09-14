"use client";
import { useHydrated } from "@/hooks/use-hydrated";
import React, { useRef, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, useReducedMotion } from "motion/react";
import { WeeklyComponentBadge } from "@/components/landing/weekly-component-badge";
import GlassSearchBar from "@/components/landing/glass-search-bar";
import { MotionButtonLink } from "@/components/site/motion-button-link";
import { useVisitorCount } from "@/hooks/use-visitor-count";
import "./landing-motion.css";

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Removed state to prevent re-renders on every mouse move
  const mouseFrameRef = useRef<number | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const reduceMotion = useReducedMotion();
  const mounted = useHydrated();
  const { resolvedTheme } = useTheme();

  const isDark = mounted && resolvedTheme === "dark";

  const { count, loading, error } = useVisitorCount();

  useEffect(() => () => {
    if (mouseFrameRef.current !== null) cancelAnimationFrame(mouseFrameRef.current);
  }, []);

  // Direct DOM update for best performance without re-renders
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || reduceMotion !== false) return;
    mousePositionRef.current = { x: e.clientX, y: e.clientY };
    if (mouseFrameRef.current !== null) return;

    // Throttle via requestAnimationFrame for smoother 60fps tracking
    mouseFrameRef.current = requestAnimationFrame(() => {
      mouseFrameRef.current = null;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = mousePositionRef.current.x - rect.left;
      const y = mousePositionRef.current.y - rect.top;

      container.style.setProperty('--mouse-x', `${x}px`);
      container.style.setProperty('--mouse-y', `${y}px`);
    });
  }, [reduceMotion]);


  return (
    <div className="w-full flex justify-center items-center pb-8 md:pb-12 bg-[var(--site-chrome)] transition-colors duration-300">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative h-[calc(100svh-var(--site-header-height))] min-h-[550px] md:min-h-[600px] max-h-[900px] w-full flex flex-col items-center justify-center overflow-hidden rounded-b-3xl md:rounded-b-[32px] transition-colors duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]"
        style={{
          background: isDark
            ? `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.03), transparent 40%),
               linear-gradient(to bottom, var(--background) 0%, #0d0d0d 50%, #111111 100%)`
            : `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 0, 0, 0.02), transparent 40%),
               linear-gradient(to bottom, #ffffff 0%, #f9fafb 50%, #f6f7f9 100%)`,
        } as React.CSSProperties}
      >
        {/* Vertical Lines Pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: isDark
              ? "linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)"
              : "linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: "80px 100%",
          }}
        />

        {/* Subtle Grain Texture */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Hero Content */}
        <div className="w-full max-w-7xl z-10 flex flex-col md:flex-row items-center justify-center mb-12 px-4 pt-16 md:pt-0">
          {/* Left Column */}
          <div className="flex flex-col items-start justify-center w-full md:w-1/2 px-4 sm:px-6 py-8 md:p-6 lg:p-12 md:pt-0 z-10 text-pretty">
            <div className="landing-intro mb-4 md:mb-6">
              <WeeklyComponentBadge />
            </div>

            <h1 className="landing-intro landing-intro-title hero-original-title text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-200 dark:to-zinc-400 mb-4 md:mb-6 leading-[1.1]">
              Design Less. <br /> Ship Better.
            </h1>

            <p className="landing-intro landing-intro-copy landing-copy text-base sm:text-lg md:text-xl font-normal md:hidden mb-6 md:mb-8 leading-relaxed">
              Spend less time designing and tweaking UI, and more time shipping reliable, visually refined interfaces.
            </p>

            <div className="mb-8 flex flex-col items-start gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center -space-x-2">
                  {[
                    { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Sophia", name: "Sophia", delay: 0 },
                    { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Liliana", name: "Liliana", delay: 0.15 },
                    { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Brian", name: "Brian", delay: 0.3 },
                    { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Robert", name: "Robert", delay: 0.45 },
                  ].map((user) => (
                    <motion.div
                      key={user.name}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: user.delay,
                        ease: "easeOut",
                      }}
                      className="relative group"
                      style={{ willChange: "transform" }}
                    >
                      {/* DiceBear generates SVG avatars; keep the original SVG URL instead of rasterizing it. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={user.avatar}
                        alt=""
                        width={40}
                        height={40}
                        decoding="async"
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm transform transition-transform duration-200 ease-out group-hover:-translate-y-2 group-hover:scale-110 group-hover:shadow-lg"
                        style={{ willChange: "transform" }}
                      />
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="flex flex-col"
                >
                  <div className="flex items-center gap-1">
                    <span className="landing-copy text-sm font-semibold tabular-nums">
                      {loading ? (
                        <span className="inline-block w-8 h-4 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded"></span>
                      ) : (
                        <span>{error ? "Welcome" : count.toLocaleString()}</span>
                      )}
                    </span>
                    <span className="landing-copy text-sm">{error ? "to ObsidianUI" : "unique visitors"}</span>
                  </div>
                  <span className="landing-copy text-xs font-medium">Explore the component library</span>
                </motion.div>
              </div>

              <div className="landing-copy flex items-center gap-3 text-xs font-medium border-t border-zinc-200 dark:border-zinc-700 pt-3 mt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"></span>
                  React
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"></span>
                  TypeScript
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"></span>
                  Tailwind
                </span>
              </div>
            </div>

            <div className="landing-intro landing-intro-actions hero-actions md:hidden mt-4">
              <MotionButtonLink href="/components" size="lg" className="rounded-xl">
                Browse Components
              </MotionButtonLink>
              <GlassSearchBar />
            </div>
          </div>

          {/* Right Column (Desktop) */}
          <div className="hidden md:flex flex-col items-start justify-center w-1/2 pl-0 p-12 z-10">
            <p className="landing-intro landing-intro-copy landing-copy text-xl font-normal mb-10 leading-relaxed max-w-lg">
              Spend less time designing and tweaking UI, and more time shipping reliable, visually refined interfaces.
            </p>
            <div className="flex flex-col gap-8 w-full">
              <div className="landing-intro landing-intro-actions hero-actions">
                <MotionButtonLink href="/components" size="lg" className="rounded-xl">
                  Browse Components
                </MotionButtonLink>
                <GlassSearchBar />
              </div>
            </div>
          </div>
        </div>

        {/* Large Background Text */}
        <div className="w-full h-[3vh] absolute md:bottom-12 bottom-2 sm:bottom-4 flex items-center justify-center pointer-events-none" aria-hidden="true">
          {/* Mobile version - smaller and hidden overflow */}
          <span className="md:hidden text-[60px] sm:text-[100px] z-5 tracking-tighter text-center text-transparent bg-clip-text bg-gradient-to-r from-zinc-200/40 via-zinc-300/30 to-transparent dark:from-zinc-700/50 dark:via-zinc-600/40 dark:to-transparent select-none whitespace-nowrap">
            ObsidianUI
          </span>
          {/* Desktop version - original styling */}
          <span className="hidden md:block text-[230px] lg:text-[300px] z-5 tracking-tighter text-center text-transparent bg-clip-text bg-gradient-to-r from-zinc-200/40 via-zinc-300/30 to-transparent dark:from-zinc-700/50 dark:via-zinc-600/40 dark:to-transparent select-none">
            ObsidianUI
          </span>
        </div>
      </div>
    </div>
  );
};
