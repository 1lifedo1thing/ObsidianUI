"use client";
import { r2 } from "@/lib/r2";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CommandMenu } from "./command-menu";
import { GitHubStarCounter } from "./github-star-counter";
import { ModeToggle } from "./mode-toggle";
import "./site-header.css";

const destinations = [
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Docs", href: "/docs/installation" },
];

function isActive(pathname: string, href: string) {
  if (href.startsWith("/docs")) return pathname.startsWith("/docs");
  if (href === "/templates") return pathname === href || pathname === "/project-one";
  return pathname === href;
}

function MobileNavigation({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="site-menu-trigger" aria-label="Open site navigation"><Menu aria-hidden="true" /></Button>
      </SheetTrigger>
      <SheetContent className="site-menu" side="right">
        <SheetHeader>
          <SheetTitle className="font-heading font-normal">ObsidianUI</SheetTitle>
          <SheetDescription>Explore components, documentation, and templates.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile site navigation" className="site-menu-links">
          {[...destinations, { label: "Templates", href: "/templates" }].map(item => (
            <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined} onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
        </nav>
        <div className="site-menu-footer">
          <GitHubStarCounter />
          <a href="https://athrix.me" target="_blank" rel="noopener noreferrer">Built by Atharv</a>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Shared frame adapted from EvilCharts. See THIRD_PARTY_NOTICES.md. */
export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="site-header-panel" aria-hidden="true" />
      <svg className="site-header-left-join" viewBox="-16 0 258 8" fill="none" aria-hidden="true">
        <path d="M-16 8H224Q240 8 240 0H242V8H-16Z" fill="var(--background)" />
        <path d="M-16 8H224Q240 8 240 0" stroke="var(--border)" vectorEffect="non-scaling-stroke" />
      </svg>
      <svg className="site-header-curve" viewBox="0 0 400 44" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <path d="M410 0H1.5" stroke="var(--site-chrome)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path d="M0 0q10 0 20 10l24 24q10 10 20 10H410V0Z" fill="var(--site-chrome)" />
        <path d="M0 0q10 0 20 10l24 24q10 10 20 10H410" stroke="var(--border)" vectorEffect="non-scaling-stroke" />
      </svg>
      <Link href="/" aria-label="ObsidianUI home" className="site-brand">
        <Image src={r2("/logo/bg-less.png")} alt="" width={28} height={28} priority />
        <span>ObsidianUI</span>
      </Link>
      <div className="site-header-navigation">
        <nav aria-label="Main navigation">
          {destinations.map(item => <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>{item.label}</Link>)}
        </nav>
        <div className="site-header-search"><CommandMenu /></div>
      </div>
      <div className="site-header-actions">
        <Link href="/templates" className="site-templates" aria-current={isActive(pathname, "/templates") ? "page" : undefined}>Templates</Link>
        <div className="site-header-github"><GitHubStarCounter /></div>
        <span className="site-header-divider" aria-hidden="true" />
        <ModeToggle />
        <span className="site-header-divider" aria-hidden="true" />
        <a href="https://athrix.me" target="_blank" rel="noopener noreferrer" className="site-builder">Built by Atharv</a>
        <MobileNavigation key={pathname} pathname={pathname} />
      </div>
    </header>
  );
}
