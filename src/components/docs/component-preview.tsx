"use client";

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Code2, RotateCcw } from "lucide-react";
import { animate, AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./component-installation";
import { useCopy } from "./use-copy";
import { CopyButton } from "./animated-copy-icon";

interface ComponentPreviewProps {
    component: React.ReactNode;
    code: string;
    title?: string;
    className?: string;
    description?: string;
    previewClassName?: string;
    /** Adds a button that opens the preview full screen. */
    expandable?: boolean;
    /** Classes for the box around an expandable preview, such as its inline height. */
    frameClassName?: string;
}

type FullscreenPhase = "idle" | "expanding" | "expanded" | "collapsing";

const FULLSCREEN_SPRING: Transition = { type: "spring", visualDuration: 0.5, bounce: 0.12 };
const MINIMIZE_SPRING: Transition = { type: "spring", visualDuration: 0.42, bounce: 0.04 };
const FULLSCREEN_STYLE_PROPERTIES = ["position", "z-index", "margin", "top", "left", "right", "bottom", "width", "height", "border-radius"];
const TABBABLE = ["a[href]", "button:not([disabled])", "input:not([disabled])", "select:not([disabled])", "textarea:not([disabled])", "[tabindex]"]
    .map((selector) => `${selector}:not([tabindex="-1"])`)
    .join(",");

function pinCard(card: HTMLElement, rect: DOMRect) {
    Object.assign(card.style, {
        position: "fixed",
        zIndex: "45",
        margin: "0",
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        right: "auto",
        bottom: "auto",
        width: `${rect.width}px`,
        height: `${rect.height}px`,
    });
}

function FullscreenIcon({ open, transition }: { open: boolean; transition: Transition }) {
    const pivot = { transformBox: "fill-box", transformOrigin: "center" } as const;
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
            <motion.rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" opacity={0.3} style={pivot} animate={{ scale: open ? 0.86 : 1 }} transition={transition} />
            <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <motion.g style={pivot} animate={{ rotate: open ? 180 : 0 }} transition={transition}>
                    <path d="M14 7h3v3" />
                    <path d="m17 7-3.5 3.5" />
                </motion.g>
                <motion.g style={pivot} animate={{ rotate: open ? 180 : 0 }} transition={transition}>
                    <path d="M10 17H7v-3" />
                    <path d="m7 17 3.5-3.5" />
                </motion.g>
            </g>
        </svg>
    );
}

export function ComponentPreview({
    component,
    code,
    title = "Component preview",
    className,
    description,
    previewClassName,
    expandable = false,
    frameClassName,
}: ComponentPreviewProps) {
    const [activeTab, setActiveTab] = useState("preview");
    const { hasCopied, status, copy } = useCopy();
    const [renderKey, setRenderKey] = useState(0);
    const reduce = useReducedMotion();
    const tabId = useId();
    const transition = { duration: reduce ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] as const };

    const [phase, setPhase] = useState<FullscreenPhase>("idle");
    const [slotHeight, setSlotHeight] = useState<number>();
    const phaseRef = useRef(phase);
    const cardRef = useRef<HTMLDivElement>(null);
    const slotRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const startRectRef = useRef<DOMRect | null>(null);
    const restRadiusRef = useRef(12);
    const isOpen = phase === "expanding" || phase === "expanded";
    const isLifted = phase !== "idle";

    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    const openFullscreen = useCallback(() => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        if (phaseRef.current === "idle") {
            restRadiusRef.current = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0;
            setSlotHeight(rect.height);
        }
        startRectRef.current = rect;
        setPhase("expanding");
    }, []);

    const minimize = useCallback(() => {
        const card = cardRef.current;
        if (!card || phaseRef.current === "idle" || phaseRef.current === "collapsing") return;
        startRectRef.current = card.getBoundingClientRect();
        setPhase("collapsing");
    }, []);

    // Locks page scroll while the preview covers it; a stable gutter stops the page from shifting when the scrollbar hides.
    useLayoutEffect(() => {
        if (!isLifted) return;
        const root = document.documentElement;
        const previous = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter };
        if (window.innerWidth > root.clientWidth) root.style.scrollbarGutter = "stable";
        root.style.overflow = "hidden";
        return () => {
            root.style.overflow = previous.overflow;
            root.style.scrollbarGutter = previous.gutter;
        };
    }, [isLifted]);

    // Sizes animate instead of scale, so the preview reflows like a resized window rather than stretching.
    useLayoutEffect(() => {
        const card = cardRef.current;
        const from = startRectRef.current;
        if (!card || !from || (phase !== "expanding" && phase !== "collapsing")) return;
        const target = phase === "expanding" ? backdropRef.current : slotRef.current;
        if (!target) return;
        const currentRadius = card.style.borderRadius ? parseFloat(card.style.borderRadius) : restRadiusRef.current;
        pinCard(card, from);
        const to = target.getBoundingClientRect();
        const controls = animate(
            card,
            {
                top: [from.top, to.top],
                left: [from.left, to.left],
                width: [from.width, to.width],
                height: [from.height, to.height],
                borderRadius: [currentRadius, phase === "expanding" ? 0 : restRadiusRef.current],
            },
            reduce ? { duration: 0 } : phase === "expanding" ? FULLSCREEN_SPRING : MINIMIZE_SPRING,
        );
        let active = true;
        controls.then(() => {
            if (!active) return;
            if (phase === "expanding") {
                // Inset sizing keeps the preview full screen when the viewport resizes or a mobile toolbar moves.
                Object.assign(card.style, { top: "0", left: "0", right: "0", bottom: "0", width: "auto", height: "auto" });
                setPhase("expanded");
            } else {
                setPhase("idle");
            }
        });
        return () => {
            active = false;
            controls.stop();
        };
    }, [phase, reduce]);

    // Runs before paint, so the card returns to the page flow in the same frame its layout classes revert.
    useLayoutEffect(() => {
        const card = cardRef.current;
        if (phase !== "idle" || !card) return;
        for (const property of FULLSCREEN_STYLE_PROPERTIES) card.style.removeProperty(property);
    }, [phase]);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            // Open menus inside the preview mark Escape as handled when they close.
            if (event.key === "Escape" && !event.defaultPrevented) minimize();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, minimize]);

    const keepFocusInside = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!isLifted || event.key !== "Tab" || event.defaultPrevented || !card || !card.contains(event.target as Node)) return;
        const items = Array.from(card.querySelectorAll<HTMLElement>(TABBABLE)).filter((item) => item.getClientRects().length > 0);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    const fullscreenLabel = isOpen ? "Minimize preview" : "Open preview full screen";

    return (
        <div className={cn("group relative my-6 mb-10 min-w-0", className)}>
            <span className="sr-only" role="status">{status}</span>
            {description && (
                <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            )}
            {expandable && (
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={backdropRef}
                            aria-hidden="true"
                            className="pointer-events-none fixed inset-0 z-[44] bg-background/85"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                        />
                    )}
                </AnimatePresence>
            )}
            <div ref={slotRef} style={isLifted ? { height: slotHeight } : undefined}>
                <Tabs
                    ref={cardRef}
                    value={activeTab}
                    onValueChange={setActiveTab}
                    onKeyDown={expandable ? keepFocusInside : undefined}
                    data-fullscreen={isLifted ? "" : undefined}
                    className="gap-0 rounded-xl bg-muted p-1"
                >
                    <div className="flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-x-2 px-2 pb-1">
                        <span className="flex min-w-0 items-center gap-1.5 font-mono text-xs text-muted-foreground">
                            <Code2 aria-hidden="true" className="size-3.5 shrink-0" />
                            <span className="truncate">{title}</span>
                        </span>
                        <div className="ml-auto flex items-center gap-1">
                            {activeTab === "preview" && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => setRenderKey((previous) => previous + 1)}
                                    className="size-8 rounded-full text-muted-foreground transition-colors hover:text-foreground"
                                    title="Reload component"
                                    aria-label="Reload component"
                                >
                                    <motion.span className="inline-flex" animate={{ rotate: reduce ? 0 : -180 * renderKey }} transition={transition}>
                                        <RotateCcw aria-hidden="true" className="size-3.5" />
                                    </motion.span>
                                </Button>
                            )}
                            {activeTab === "code" && (
                                <CopyButton
                                    copied={hasCopied}
                                    onClick={() => copy(code, {
                                        eventName: "source_code_copied",
                                        properties: { context: "component_preview", title },
                                    })}
                                    className="size-8 rounded-full text-muted-foreground transition-colors hover:text-foreground"
                                    aria-label="Copy example code"
                                />
                            )}
                            <TabsList aria-label="Component view" className="h-8 gap-0 rounded-none bg-transparent p-0">
                                {["preview", "code"].map((tab) => (
                                    <TabsTrigger
                                        key={tab}
                                        value={tab}
                                        className="relative h-8 flex-none rounded-none border-0 px-2 text-xs font-medium capitalize text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent"
                                    >
                                        {tab}
                                        {activeTab === tab && <motion.span aria-hidden="true" layoutId={`${tabId}-underline`} className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-foreground" transition={transition} />}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {expandable && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={isOpen ? minimize : openFullscreen}
                                    className="ml-1 size-8 rounded-full bg-foreground/[0.06] text-foreground/80 transition-colors hover:bg-foreground/10 hover:text-foreground dark:bg-foreground/[0.08] dark:hover:bg-foreground/[0.14]"
                                    title={fullscreenLabel}
                                    aria-label={fullscreenLabel}
                                >
                                    <FullscreenIcon open={isOpen} transition={reduce ? { duration: 0 } : FULLSCREEN_SPRING} />
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className={cn("min-w-0 overflow-hidden rounded-lg border border-border bg-background", isLifted && "flex min-h-0 flex-1 flex-col")}>
                        <TabsContent value="preview" className={cn("min-w-0", isLifted && "min-h-0")}>
                            <div className={cn("relative mx-auto w-full overflow-hidden bg-background", isLifted && "h-full")}>
                                <motion.div
                                    key={renderKey}
                                    initial={reduce ? false : { opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={transition}
                                    className={cn("docs-preview-body flex min-h-[400px] w-full items-center justify-center p-4 sm:p-6", previewClassName, isLifted && "h-full min-h-0")}
                                >
                                    <div className={cn("flex w-full items-center justify-center", isLifted && "h-full")}>
                                        {expandable ? (
                                            <div className={cn("w-full", frameClassName, isLifted && "h-full")}>{component}</div>
                                        ) : component}
                                    </div>
                                </motion.div>
                            </div>
                        </TabsContent>
                        <TabsContent value="code" className={cn("h-[400px] min-w-0 overflow-auto", isLifted && "h-auto min-h-0")}>
                            <motion.div initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
                                <CodeBlock code={code} language="tsx" hideCopy nested className="mb-0 p-4" />
                            </motion.div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
