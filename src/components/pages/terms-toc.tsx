"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

type TocItem = { id: string; title: string };

export function TermsToc({ items }: { items: readonly TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const navRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  // While a clicked link smooth-scrolls, sections passing through the band must not move the indicator.
  const lockRef = useRef(false);
  const unlockTimer = useRef<number | undefined>(undefined);
  const activeIndex = items.findIndex(item => item.id === active);

  useEffect(() => {
    const order = items.map(item => item.id);
    const visible = new Set<string>();
    // The band starts below the sticky site header and ends 60% down the viewport.
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      }
      if (lockRef.current) return;
      const first = order.find(id => visible.has(id));
      if (first) setActive(first);
    }, { rootMargin: "-96px 0px -60% 0px" });

    for (const id of order) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => {
      observer.disconnect();
      window.clearTimeout(unlockTimer.current);
    };
  }, [items]);

  // Position the indicator through CSS variables so moving it never re-renders the list.
  useLayoutEffect(() => {
    const nav = navRef.current;
    const track = trackRef.current;
    const list = listRef.current;
    if (!nav || !track || !list) return;

    const place = () => {
      const item = list.children[activeIndex] as HTMLElement | undefined;
      if (!item) return;
      const top = item.offsetTop;
      const height = item.offsetHeight;
      track.style.setProperty("--toc-y", `${top}px`);
      track.style.setProperty("--toc-h", `${height}px`);
      track.style.setProperty("--toc-progress", String((top + height) / list.offsetHeight));
      if (!track.dataset.ready) requestAnimationFrame(() => { track.dataset.ready = "true"; });

      const listTop = list.offsetTop;
      if (nav.scrollHeight > nav.clientHeight) {
        const itemTop = listTop + top;
        if (itemTop < nav.scrollTop || itemTop + height > nav.scrollTop + nav.clientHeight) {
          nav.scrollTo({ top: itemTop - nav.clientHeight / 3, behavior: "smooth" });
        }
      }
    };

    place();
    const resize = new ResizeObserver(place);
    resize.observe(list);
    return () => resize.disconnect();
  }, [activeIndex]);

  const select = (id: string) => {
    lockRef.current = true;
    setActive(id);
    const release = () => {
      lockRef.current = false;
      window.clearTimeout(unlockTimer.current);
      window.removeEventListener("scrollend", release);
    };
    window.clearTimeout(unlockTimer.current);
    window.addEventListener("scrollend", release, { once: true });
    unlockTimer.current = window.setTimeout(release, 1200);
  };

  return (
    <nav ref={navRef} className="obsidianui-terms-toc" aria-label="Terms sections">
      <p>On this page</p>
      <div ref={trackRef} className="obsidianui-terms-toc-track">
        <span className="obsidianui-terms-toc-rail" aria-hidden="true" />
        <span className="obsidianui-terms-toc-fill" aria-hidden="true" />
        <span className="obsidianui-terms-toc-pill" aria-hidden="true" />
        <span className="obsidianui-terms-toc-bar" aria-hidden="true" />
        <ol ref={listRef}>
          {items.map((item, index) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={index === activeIndex ? "location" : undefined}
                data-state={index < activeIndex ? "read" : undefined}
                onClick={() => select(item.id)}
              >
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span>{item.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
