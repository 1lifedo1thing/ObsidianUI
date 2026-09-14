"use client";

import React, { useState, useEffect, useRef, useId, useMemo } from "react";
import { Search, Command, CornerUpRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { componentLinks as COMPONENTS } from "@/components/site/component-links";

export default function GlassSearchBar() {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const listId = `${inputId}-results`;

  const filteredComponents = useMemo(() => query
    ? COMPONENTS.filter((c) =>
        `${c.name} ${c.href}`.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : COMPONENTS.slice(0, 4), [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/" && inputRef.current?.getClientRects().length) {
        e.preventDefault();
        inputRef.current?.focus();
      }

      if (isFocused && document.activeElement === inputRef.current) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (filteredComponents.length) setSelectedIndex((prev) => (prev + 1) % filteredComponents.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (filteredComponents.length) setSelectedIndex(
            (prev) =>
              (prev - 1 + filteredComponents.length) % filteredComponents.length
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (filteredComponents[selectedIndex]) {
            router.push(filteredComponents[selectedIndex].href);
            setIsFocused(false);
          }
        } else if (e.key === "Escape") {
          setIsFocused(false);
          inputRef.current?.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, filteredComponents, selectedIndex, router]);

  const handleItemClick = (href: string) => {
    router.push(href);
    setIsFocused(false);
  };

  return (
    <div data-slot="component-search" className="relative z-50 flex flex-col items-center md:items-start w-[90%] md:w-[360px] max-w-full">
      {/* Search Input - Glass Wrapper */}
      <div
        className={cn("relative w-full p-2 bg-foreground/5 backdrop-blur-3xl border border-border/60 rounded-[24px] shadow-sm overflow-hidden transition-shadow duration-300", isFocused && "ring-2 ring-ring shadow-md")}
      >
        {/* Inner Solid Core */}
        <div data-slot="search-core" className="landing-copy relative flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all w-full bg-card shadow-sm">
          <div className="flex items-center gap-3 w-full min-w-0">
            <Search className="w-5 h-5 text-neutral-500" />
            <label htmlFor={inputId} className="sr-only">Search components</label>
            <input
              id={inputId}
              ref={inputRef}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isFocused}
              aria-controls={isFocused ? listId : undefined}
              aria-activedescendant={isFocused && filteredComponents[selectedIndex] ? `${listId}-${selectedIndex}` : undefined}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search components..."
              className="bg-transparent border-none outline-none text-base sm:text-sm w-full min-w-0 transition-colors font-body not-italic text-current placeholder:text-current font-normal"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </div>

          {/* Keyboard Shortcut Hint */}
          <div data-slot="search-shortcut" className="flex items-center gap-1.5 text-neutral-400">
            <Command className="w-4 h-4" />
            <span className="text-xs font-medium">+</span>
            <span className="text-xs font-medium">/</span>
          </div>
        </div>
      </div>

      {/* Dropdown Suggestions - Separate Island */}
      <AnimatePresence>
        {isFocused && (filteredComponents.length > 0 || query) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 w-full p-2 bg-foreground/5 backdrop-blur-3xl border border-border/60 rounded-[28px] shadow-2xl mt-1.5"
          >
            {/* Inner List Core with Max Height */}
            <div className="rounded-[20px] overflow-hidden bg-card shadow-sm">
              <div
                id={listId}
                role="listbox"
                aria-label="Matching components"
                className="max-h-[280px] overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {filteredComponents.length > 0 ? (
                  filteredComponents.map((item, i) => (
                    <div
                      key={item.href}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={selectedIndex === i}
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={() => handleItemClick(item.href)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={cn("group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors",
                        selectedIndex === i
                          ? "bg-accent shadow-sm"
                          : "hover:bg-accent/50"
                      )}
                    >
                      <span
                        className={cn("text-sm font-medium transition-colors",
                          selectedIndex === i
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.name}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <div
                          className={cn("h-7 w-7 flex items-center justify-center rounded-lg transition-colors",
                            selectedIndex === i
                              ? "bg-card shadow-sm text-foreground"
                              : "bg-muted/50 text-muted-foreground"
                          )}
                        >
                          <CornerUpRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div role="status" className="px-4 py-3 text-sm text-neutral-500 text-center font-medium">
                    No components found for &ldquo;{query}&rdquo;. Try another name.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
