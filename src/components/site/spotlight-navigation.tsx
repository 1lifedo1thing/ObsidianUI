"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { cn } from "@/lib/utils";

export interface NavItem {
    label: string;
    href: string;
}

interface SiteNavigationProps {
    items?: NavItem[];
    className?: string;
    onItemClick?: (item: NavItem, index: number) => void;
    defaultActiveIndex?: number;
    logo?: React.ReactNode;
}

export function SiteNavigation({
    items = [
        { label: "Home", href: "#home" },
        { label: "About", href: "#about" },
        { label: "Events", href: "#events" },
        { label: "Sponsors", href: "#sponsors" },
        { label: "Pricing", href: "#pricing" },
    ],
    className,
    onItemClick,
    defaultActiveIndex = 0,
    logo,
}: SiteNavigationProps) {
    const navRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
    const [hoverX, setHoverX] = useState<number | null>(null);

    // Refs for the "light" positions so we can animate them imperatively
    const spotlightX = useRef(0);
    const ambienceX = useRef(0);


    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = nav.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setHoverX(x);
            // Direct update for immediate feedback (no spring for the mouse itself, feels snappier)
            spotlightX.current = x;
            nav.style.setProperty("--spotlight-x", `${x}px`);
        };

        const handleMouseLeave = () => {
            setHoverX(null);
            // When mouse leaves, spring the spotlight back to the active item
            const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
            if (activeItem) {
                const navRect = nav.getBoundingClientRect();
                const itemRect = activeItem.getBoundingClientRect();
                const targetX = itemRect.left - navRect.left + itemRect.width / 2;

                animate(spotlightX.current, targetX, {
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    onUpdate: (v) => {
                        spotlightX.current = v;
                        nav.style.setProperty("--spotlight-x", `${v}px`);
                    }
                });
            }
        };

        nav.addEventListener("mousemove", handleMouseMove);
        nav.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            nav.removeEventListener("mousemove", handleMouseMove);
            nav.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [activeIndex]);

    // Handle the "Ambience" (Active Item) Movement
    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;

        // Use requestAnimationFrame to ensure DOM is ready
        const updatePosition = () => {
            const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
            if (activeItem) {
                const navRect = nav.getBoundingClientRect();
                const itemRect = activeItem.getBoundingClientRect();
                const targetX = itemRect.left - navRect.left + itemRect.width / 2;

                // Set initial position immediately on first render
                if (ambienceX.current === 0) {
                    ambienceX.current = targetX;
                    nav.style.setProperty("--ambience-x", `${targetX}px`);
                } else {
                    animate(ambienceX.current, targetX, {
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        onUpdate: (v) => {
                            ambienceX.current = v;
                            nav.style.setProperty("--ambience-x", `${v}px`);
                        },
                    });
                }
            }
        };

        // Small delay to ensure elements are rendered
        requestAnimationFrame(updatePosition);
    }, [activeIndex]);

    const handleItemClick = (item: NavItem, index: number) => {
        setActiveIndex(index);
        onItemClick?.(item, index);
        // Navigate to the href
        if (item.href.startsWith('#')) {
            // Scroll to section for anchor links
            const element = document.querySelector(item.href);
            element?.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Navigate for regular links
            window.location.assign(item.href);
        }
    };

    return (
        <div className={cn("relative flex justify-center pt-4", className)}>
            <nav
                ref={navRef}
                className={cn(
                    "spotlight-nav spotlight-nav-bg glass-border spotlight-nav-shadow",
                    "relative h-11 rounded-full transition-all duration-300 overflow-hidden"
                )}
            >
                {/* Content */}
                <ul className="relative flex items-center h-full px-2 gap-0 z-[10]">
                    {/* Left nav items */}
                    {items.slice(0, Math.ceil(items.length / 2)).map((item, idx) => (
                        <li key={idx} className="relative h-full flex items-center justify-center">
                            <a
                                href={item.href}
                                data-index={idx}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleItemClick(item, idx);
                                }}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-full",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-white/30",
                                    activeIndex === idx
                                        ? "text-black dark:text-white"
                                        : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                                )}
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}

                    {/* Center Logo */}
                    {logo && (
                        <li className="relative h-full flex items-center justify-center px-3">
                            {logo}
                        </li>
                    )}

                    {/* Right nav items */}
                    {items.slice(Math.ceil(items.length / 2)).map((item, idx) => {
                        const actualIdx = idx + Math.ceil(items.length / 2);
                        return (
                            <li key={actualIdx} className="relative h-full flex items-center justify-center">
                                <a
                                    href={item.href}
                                    data-index={actualIdx}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleItemClick(item, actualIdx);
                                    }}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-full",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-white/30",
                                        activeIndex === actualIdx
                                            ? "text-black dark:text-white"
                                            : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                                    )}
                                >
                                    {item.label}
                                </a>
                            </li>
                        );
                    })}
                </ul>

                {/* LIGHTING LAYERS 
           We use CSS variables --spotlight-x and --ambience-x updated by JS
        */}

                {/* 1. The Moving Spotlight (Follows Mouse) */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 w-full h-full z-[1] opacity-0 transition-opacity duration-300"
                    style={{
                        opacity: hoverX !== null ? 1 : 0,
                        background: `
              radial-gradient(
                120px circle at var(--spotlight-x) 100%, 
                var(--spotlight-color, rgba(0,0,0,0.1)) 0%, 
                transparent 50%
              )
            `
                    }}
                />

                {/* 2. The Active State Ambience (Stays on Active) */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 w-full h-[3px] z-[2]"
                    style={{
                        background: `
                  radial-gradient(
                    80px circle at var(--ambience-x, 50%) 0%, 
                    var(--ambience-color, rgba(0,0,0,1)) 0%, 
                    transparent 100%
                  )
                `
                    }}
                />

            </nav>

            {/* STYLE BLOCK for Dynamic Colors 
        This allows us to switch the gradient colors cleanly using Tailwind classes 
        without messy inline conditionals.
      */}
            <style jsx>{`
        nav {
          /* Light Mode Colors: Dark Gray/Black lights */
          --spotlight-color: rgba(0,0,0,0.08);
          --ambience-color: rgba(0,0,0,0.8);
        }
        :global(.dark) nav {
          /* Dark Mode Colors: White lights */
          --spotlight-color: rgba(255,255,255,0.15);
          --ambience-color: rgba(255,255,255,1);
        }
      `}</style>
        </div>
    );
}


export default SiteNavigation;

