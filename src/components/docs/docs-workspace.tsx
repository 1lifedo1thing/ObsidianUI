"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import navigation from "@/content/_meta";
import { cn } from "@/lib/utils";
import { useNewComponentVisits } from "./use-new-component-visits";
import "./new-component-dot.css";

type NavItem = { title: string; href: string };
type NavGroup = { title: string; items: NavItem[] };
type TocRailState = {
  container: HTMLUListElement;
  path: string;
  length: number;
  distance: number;
  height: number;
  endX: number;
  endY: number;
};

const SIDEBAR_EASE = [0.22, 1, 0.36, 1] as const;

function TocRail({ path, length, distance, height, endX, endY }: TocRailState) {
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(distance);
  const offsetDistance = useTransform(progress, value => `${value}px`);
  const dashOffset = useTransform(progress, value => Math.max(0, length - value));

  useEffect(() => {
    if (reduceMotion) {
      progress.set(distance);
      return;
    }
    const animation = animate(progress, distance, { duration: 0.25, ease: SIDEBAR_EASE });
    return () => animation.stop();
  }, [distance, progress, reduceMotion]);

  return (
    <li className="docs-toc-rail" role="presentation" aria-hidden="true" style={{ height }}>
      <svg width="100%" height={height} fill="none" aria-hidden="true">
        <path className="docs-toc-track" d={path} strokeWidth="1" strokeLinejoin="round" />
        <motion.path className="docs-toc-progress" d={path} strokeWidth="1" strokeLinejoin="round" strokeDasharray={length} style={{ strokeDashoffset: dashOffset }} />
        <circle className="docs-toc-end" cx={endX} cy={endY} r="2" />
      </svg>
      <motion.span className="docs-toc-marker" style={{ offsetPath: `path('${path}')`, offsetDistance, offsetRotate: "0deg", rotate: 45 }} />
    </li>
  );
}

const groups: NavGroup[] = [];
for (const [slug, entry] of Object.entries(navigation)) {
  if (typeof entry === "object" && entry.type === "separator") {
    groups.push({ title: entry.title === "Installation" ? "Get started" : entry.title, items: [] });
  } else if (typeof entry === "string") {
    groups.at(-1)?.items.push({ title: entry, href: `/docs/${slug}` });
  }
}

export function DocsNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { isNew, markSeen } = useNewComponentVisits();
  return (
    <nav className="docs-navigation" aria-label="Documentation">
      {groups.map((group, index) => (
        <section key={group.title} className="docs-nav-group" style={{ "--docs-group-index": Math.min(index, 3) } as CSSProperties}>
          <h2 className="docs-nav-label">{group.title}</h2>
          <ul>
            {group.items.map(item => {
              const active = pathname === item.href;
              const unread = isNew(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={event => {
                      if (event.defaultPrevented) return;
                      markSeen(item.href);
                      onNavigate?.();
                    }}
                    onAuxClick={event => {
                      if (event.button === 1 && !event.defaultPrevented) markSeen(item.href);
                    }}
                    aria-current={active ? "page" : undefined}
                    aria-label={unread ? `${item.title}, new component` : undefined}
                    data-new={unread}
                    className={cn("docs-nav-link", active && "is-active")}
                  >
                    <span className="docs-nav-title">{item.title}</span>
                    <span className="t-badge docs-nav-new-indicator" data-open={unread} aria-hidden="true">
                      <span className="t-badge-dot docs-nav-new-dot" data-visible={unread} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}

function DocsBrand() {
  return (
    <Link className="docs-brand" href="/" aria-label="ObsidianUI home">
      <Image src="/logo/bg-less.png" alt="" width={26} height={26} />
      <span>ObsidianUI</span>
    </Link>
  );
}

function MobileDocsMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild><Button variant="ghost" size="sm" className="docs-mobile-trigger" aria-label="Open documentation menu">Menu</Button></SheetTrigger>
      <SheetContent side="left" className="obsidian-docs docs-mobile-sheet">
        <SheetHeader><SheetTitle><DocsBrand /></SheetTitle><SheetDescription className="sr-only">Browse the ObsidianUI documentation.</SheetDescription></SheetHeader>
        <div className="docs-sidebar-scroll"><DocsNavigation onNavigate={() => setOpen(false)} /></div>
        <div className="docs-sidebar-footer"><Link href="/components" onClick={() => setOpen(false)}>Component showcase</Link><Link href="/" onClick={() => setOpen(false)}>Back to home</Link></div>
      </SheetContent>
    </Sheet>
  );
}

/** Inset reading workspace adapted from EvilCharts. See THIRD_PARTY_NOTICES.md. */
export function DocsWorkspace({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [tocRail, setTocRail] = useState<TocRailState | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const currentPage = groups.flatMap(group => group.items).find(item => item.href === pathname);

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;
    const entries = Array.from(workspace.querySelectorAll<HTMLAnchorElement>('.nextra-toc a[href^="#"]')).flatMap(link => {
      let id;
      try { id = decodeURIComponent(link.hash.slice(1)); } catch { return []; }
      const heading = document.getElementById(id);
      return heading ? [{ link, heading, depth: Number(heading.tagName.slice(1)) || 2 }] : [];
    });
    if (!entries.length) {
      const clearFrame = requestAnimationFrame(() => setTocRail(null));
      return () => cancelAnimationFrame(clearFrame);
    }
    const list = entries[0].link.closest("ul");
    const minDepth = Math.min(...entries.map(entry => entry.depth));
    for (const entry of entries) {
      entry.link.style.setProperty('--toc-indent', `${(entry.depth - minDepth) * 12}px`);
    }
    let frame = 0;
    let needsMeasurement = true;
    let geometry: Omit<TocRailState, 'distance'> | null = null;
    let centerDistances: number[] = [];

    // Use each link's real box, including wrapping, rather than a fixed row height.
    const measureRail = () => {
      needsMeasurement = false;
      if (!list || !list.isConnected) return;
      const origin = list.getBoundingClientRect();
      const rows = entries.map(({ link, depth }) => {
        const rect = link.getBoundingClientRect();
        return { x: 5 + (depth - minDepth) * 12, top: rect.top - origin.top + list.scrollTop, height: rect.height };
      });
      if (!rows.some(row => row.height > 0)) return;
      const points: string[] = [];
      let x = rows[0].x;
      let y = Math.max(0, rows[0].top - 8);
      let length = 0;
      centerDistances = [];
      points.push(`M ${x} ${y}`);
      const lineTo = (nextX: number, nextY: number) => {
        length += Math.hypot(nextX - x, nextY - y);
        points.push(`L ${nextX} ${nextY}`);
        x = nextX;
        y = nextY;
      };
      rows.forEach((row, index) => {
        const center = row.top + row.height / 2;
        lineTo(row.x, center);
        centerDistances.push(length);
        const next = rows[index + 1];
        if (next) {
          lineTo(row.x, row.top + row.height);
          if (next.x !== row.x) lineTo(next.x, next.top);
        }
      });
      geometry = { container: list, path: points.join(' '), length, height: y + 4, endX: x, endY: y };
    };

    const updateActiveHeading = () => {
      frame = 0;
      if (needsMeasurement) measureRail();
      const toolbarBottom = workspace.querySelector('.docs-toolbar')?.getBoundingClientRect().bottom ?? 0;
      const scrollPadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      let active = entries[0];
      for (const entry of entries) {
        const scrollMargin = parseFloat(getComputedStyle(entry.heading).scrollMarginTop) || 0;
        const readingLine = Math.max(toolbarBottom + 24, scrollMargin + scrollPadding) + 4;
        if (entry.heading.getBoundingClientRect().top <= readingLine) active = entry;
      }
      const pageHeight = document.documentElement.scrollHeight;
      if (pageHeight > window.innerHeight && window.scrollY + window.innerHeight >= pageHeight - 2) {
        active = entries[entries.length - 1];
      }
      if (geometry) {
        const next = { ...geometry, distance: centerDistances[entries.indexOf(active)] ?? 0 };
        setTocRail(previous => previous?.container === next.container && previous.path === next.path && previous.distance === next.distance ? previous : next);
      }
      for (const entry of entries) {
        if (entry === active) entry.link.setAttribute('aria-current', 'location');
        else entry.link.removeAttribute('aria-current');
      }
    };

    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(updateActiveHeading);
    };
    const scheduleMeasure = () => {
      needsMeasurement = true;
      scheduleUpdate();
    };
    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleMeasure);
    window.addEventListener('hashchange', scheduleUpdate);
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleMeasure);
    resizeObserver?.observe(workspace);
    if (list) resizeObserver?.observe(list);
    entries.forEach(({ link }) => resizeObserver?.observe(link));
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener('hashchange', scheduleUpdate);
      resizeObserver?.disconnect();
      entries.forEach(({ link }) => {
        link.removeAttribute('aria-current');
        link.style.removeProperty('--toc-indent');
      });
    };
  }, [pathname, children]);

  return (
    <div ref={workspaceRef} className="docs-workspace" data-sidebar-collapsed={collapsed}>
      <aside className="docs-sidebar" aria-label="Documentation sidebar">
        <div className="docs-sidebar-header">
          <span className="docs-sidebar-title" aria-hidden={collapsed}>Documentation</span>
          <Button variant="ghost" size="icon-sm" className="docs-sidebar-toggle" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand documentation sidebar" : "Collapse documentation sidebar"} aria-expanded={!collapsed} aria-controls="docs-desktop-navigation">
            <span className="docs-sidebar-toggle-icons" aria-hidden="true">
              <PanelLeftClose className={cn("docs-sidebar-toggle-icon", !collapsed && "is-visible")} />
              <PanelLeftOpen className={cn("docs-sidebar-toggle-icon", collapsed && "is-visible")} />
            </span>
          </Button>
        </div>
        <div id="docs-desktop-navigation" className="docs-sidebar-content" aria-hidden={collapsed} inert={collapsed}>
          <div className="docs-sidebar-scroll"><DocsNavigation /></div>
          <div className="docs-sidebar-footer">
            <Link href="/components">Component showcase</Link>
            <Link href="/">Back to home</Link>
          </div>
        </div>
      </aside>

      <div className="docs-surface">
        <header className="docs-toolbar">
          <div className="docs-toolbar-leading">
            <MobileDocsMenu key={pathname} />
            <div className="docs-breadcrumb" aria-label="Breadcrumb"><span>Docs</span><span className="docs-breadcrumb-separator" aria-hidden="true">/</span><span>{currentPage?.title ?? "Documentation"}</span></div>
          </div>
        </header>
        <div className="docs-document">{children}</div>
      </div>
      {tocRail?.container.isConnected && createPortal(<TocRail {...tocRail} />, tocRail.container)}
    </div>
  );
}
