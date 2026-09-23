"use client";

import { Check, Heart, Plus, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { RaisedButton } from "@/components/ui/raised-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CLICommand } from "@/components/docs/cli-command";
import "./sponsors-page.css";

const sponsorshipInquiry =
  "mailto:jadavatharv2010@gmail.com?subject=ObsidianUI%20sponsorship%20inquiry";
const platformLinks = {
  vercel: "http://vercel.com?utm_source=obsidianui.dev&utm_medium=web&utm_campaign=obsidianui-sponsor",
  tracwell: "https://tracwell.app?utm_source=obsidianui.dev&utm_medium=web&utm_campaign=obsidianui-sponsor",
};

const tiers = [
  {
    id: "platinum",
    name: "Platinum",
    price: 150,
    featured: true,
    perks: [
      "Largest logo on the sponsors page",
      "Largest logo on the home page",
      "Largest logo in the README",
      "Shoutout on X",
      "Direct line for feedback and requests",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: 100,
    featured: false,
    perks: [
      "Larger logo on the sponsors page",
      "Logo on the home page",
      "Larger logo in the README",
      "Shoutout on X",
      "Direct line for feedback and requests",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    price: 50,
    featured: false,
    perks: [
      "Logo in the README",
      "Direct line for feedback and requests",
    ],
  },
] as const;

const pricingTiers = [
  tiers[1], // Gold ($100/month) - Left box
  tiers[0], // Platinum ($150/month, "Most impact") - Center box
  tiers[2], // Silver ($50/month) - Right box
] as const;

function SponsorCta({
  href,
  children,
  subtle = false,
  raised = false,
}: {
  href: string;
  children: ReactNode;
  subtle?: boolean;
  raised?: boolean;
}) {
  const external = href.startsWith("http");

  if (raised) {
    return (
      <RaisedButton asChild color="#000000" className="no-underline">
        <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
          {children}
        </a>
      </RaisedButton>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`obsidianui-sponsor-cta${subtle ? " obsidianui-sponsor-cta-subtle" : ""}`}
    >
      {children}
    </a>
  );
}

function ContactIcon({ kind }: { kind: "email" | "x" | "telegram" }) {
  if (kind === "email") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path opacity=".5" d="M14.2 3H9.8C5.65164 3 3.57746 3 2.28873 4.31802C1 5.63604 1 7.75736 1 12C1 16.2426 1 18.364 2.28873 19.682C3.57746 21 5.65164 21 9.8 21H14.2C18.3484 21 20.4225 21 21.7113 19.682C23 18.364 23 16.2426 23 12C23 7.75736 23 5.63604 21.7113 4.31802C20.4225 3 18.3484 3 14.2 3Z" fill="currentColor" />
        <path d="M19.1284 8.03302C19.4784 7.74133 19.5257 7.22112 19.234 6.87109C18.9423 6.52106 18.4221 6.47377 18.0721 6.76546L15.6973 8.74444C14.671 9.59966 13.9585 10.1915 13.357 10.5784C12.7747 10.9529 12.3798 11.0786 12.0002 11.0786C11.6206 11.0786 11.2258 10.9529 10.6435 10.5784C10.0419 10.1915 9.32941 9.59966 8.30315 8.74444L5.92837 6.76546C5.57834 6.47377 5.05812 6.52106 4.76643 6.87109C4.47474 7.22112 4.52204 7.74133 4.87206 8.03302L7.28821 10.0465C8.2632 10.859 9.05344 11.5176 9.75091 11.9661C10.4775 12.4334 11.185 12.7286 12.0002 12.7286C12.8154 12.7286 13.523 12.4334 14.2495 11.9661C14.947 11.5176 15.7372 10.859 16.7122 10.0465L19.1284 8.03302Z" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "x") {
    return (
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" aria-hidden="true">
      <path d="M40.83 8.48c1.14 0 2 1 1.54 2.86l-5.58 26.3c-.39 1.87-1.52 2.32-3.08 1.45L20.4 29.26a.4.4 0 0 1 0-.65L35.77 14.73c.7-.62-.15-.92-1.07-.36L15.41 26.54a.46.46 0 0 1-.4.05L6.82 24C5 23.47 5 22.22 7.23 21.33L40 8.69a2.16 2.16 0 0 1 .83-.21Z" />
    </svg>
  );
}

function InquiryDialog({ name, children }: { name: string; children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="obsidianui-sponsor-inquiry-dialog" overlayClassName="obsidianui-sponsor-inquiry-overlay">
        <DialogTitle>Let’s talk for {name}</DialogTitle>
        <DialogDescription>Choose where you’d like to chat about sponsoring ObsidianUI.</DialogDescription>
        <div className="obsidianui-sponsor-contact-options">
          <div className="obsidianui-sponsor-contact-option">
            <a href={`mailto:jadavatharv2010@gmail.com?subject=${encodeURIComponent(`ObsidianUI ${name} sponsorship`)}`}>
              <ContactIcon kind="email" /><span>Email me</span>
            </a>
          </div>
          <div className="obsidianui-sponsor-contact-option">
            <a href="https://x.com/athrix_codes" target="_blank" rel="noreferrer">
              <ContactIcon kind="x" /><span>DM on X</span>
            </a>
          </div>
          <div className="obsidianui-sponsor-contact-option">
            <a href="https://t.me/athrix" target="_blank" rel="noreferrer">
              <ContactIcon kind="telegram" /><span>Telegram</span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SponsorInquiry({ name, featured }: { name: string; featured: boolean }) {
  return (
    <InquiryDialog name={name}>
      <Button className={`obsidianui-sponsor-cta obsidianui-sponsor-inquiry${featured ? "" : " obsidianui-sponsor-cta-subtle"}`}>
        Enquire about {name}
      </Button>
    </InquiryDialog>
  );
}

function OpenSlot({
  name,
  tier,
  mobileLabel,
}: {
  name: string;
  tier: string;
  mobileLabel?: string;
}) {
  return (
    <a href="#tiers" className={`obsidianui-sponsor-slot obsidianui-sponsor-slot-${tier}`}>
      <span className="obsidianui-slot-label">
        <span>
          <Plus aria-hidden="true" />
          {mobileLabel ? (
            <>
              <span className="obsidianui-slot-name-desktop">Be the first {name} sponsor</span>
              <span className="obsidianui-slot-name-mobile">{mobileLabel}</span>
            </>
          ) : (
            `Be the first ${name} sponsor`
          )}
        </span>
        <span aria-hidden="true">
          <Plus />
          Take this spot <Heart className="obsidianui-slot-heart" />
        </span>
      </span>
    </a>
  );
}

function VercelLogo() {
  return (
    <svg
      className="obsidianui-sponsor-vercel-logo text-black dark:text-white"
      viewBox="0 0 261 52"
      height="52"
      width="261"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M59.8 52H0L29.9 0zm67.82-38.45q4.9 0 8.81 2.13a15.5 15.5 0 0 1 6.22 6.32q2.3 4.2 2.38 10.26v2.06h-26.35q.27 4.4 2.58 6.92 2.38 2.47 6.36 2.47a8.4 8.4 0 0 0 7.76-4.93l9.16.67q-1.68 4.98-6.29 7.99t-10.63 3q-5.53 0-9.64-2.27a16 16 0 0 1-6.43-6.46 20 20 0 0 1-2.31-9.72q0-5.52 2.3-9.72a16 16 0 0 1 6.44-6.46 20 20 0 0 1 9.64-2.26m62.55 0q4.47 0 8.18 1.66a15.3 15.3 0 0 1 6.15 4.6q2.38 3 2.87 7.05l-9.23.47a8 8 0 0 0-2.8-5 7.7 7.7 0 0 0-5.17-1.86q-4.33 0-6.7 3-2.4 3-2.39 8.52t2.38 8.52q2.37 3 6.71 3 3.15 0 5.39-1.87 2.24-1.92 2.72-5.46l9.3.4a14.7 14.7 0 0 1-2.87 7.33 16 16 0 0 1-6.15 4.86 21 21 0 0 1-8.39 1.66q-5.53 0-9.64-2.26a16 16 0 0 1-6.44-6.46 20 20 0 0 1-2.3-9.72q0-5.52 2.3-9.72a16 16 0 0 1 6.44-6.46 20 20 0 0 1 9.64-2.26m38.66 0q4.9 0 8.8 2.13a15.5 15.5 0 0 1 6.22 6.32q2.31 4.2 2.38 10.26v2.06h-26.35q.28 4.4 2.58 6.92 2.38 2.47 6.36 2.47a8.4 8.4 0 0 0 7.77-4.93l9.15.67q-1.68 5-6.29 7.99t-10.62 3q-5.53 0-9.65-2.27a16 16 0 0 1-6.43-6.46 20 20 0 0 1-2.31-9.72q0-5.52 2.3-9.72a16 16 0 0 1 6.44-6.46 20 20 0 0 1 9.64-2.26M86.9 36.69l17.24-34.33h10.8L89.96 49.63h-6.12L58.85 2.36h10.81zm71.62-15.55a11 11 0 0 1 2.47-4.48q2.28-2.31 6.38-2.31h3.4v7.26h-3.47q-2.91 0-4.79.8a5.8 5.8 0 0 0-2.77 2.5q-.9 1.72-.9 4.37v20.35h-8.89V14.35h8.33zm101.73 28.5h-8.95V2.35h8.95zM127.62 20.26q-3.7 0-6 2.2-2.32 2.2-2.87 6.2h17.05q-.48-4.34-2.72-6.33a7.8 7.8 0 0 0-5.46-2.07m101.2 0q-3.7 0-6 2.2-2.31 2.2-2.87 6.2H237q-.5-4.34-2.73-6.33a7.8 7.8 0 0 0-5.46-2.07"
      />
    </svg>
  );
}

function TracwellLogo() {
  return (
    <span className="obsidianui-sponsor-tracwell-logo" aria-hidden="true">
      <svg viewBox="0 0 96 96">
        <title>Tracwell</title>
        <g transform="translate(0 7)">
          <path d="M12 75c-5 0-8-5-5-10l19-35c3-6 10-8 16-5s8 10 5 16L29 72c-1 2-4 3-7 3H12Z" fill="#8CB4FF" />
          <path d="M43 75c-5 0-8-5-5-10L67 12c3-6 10-8 16-5s8 10 5 16L60 72c-1 2-4 3-7 3H43Z" fill="#357DFF" />
          <circle cx="82" cy="67" r="9" fill="#174EA6" />
        </g>
      </svg>
      <span>Tracwell</span>
    </span>
  );
}

function ComponentInstallIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      className={className}
      color="currentColor"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.19671 6.83999C9.33456 7.11818 9.59244 7.37605 10.1082 7.89181C10.6239 8.40756 10.8818 8.66544 11.16 8.80329C11.6922 9.06692 12.3078 9.06692 12.84 8.80329C13.1182 8.66544 13.3761 8.40756 13.8918 7.89181C14.4076 7.37605 14.6654 7.11818 14.8033 6.83999C15.0669 6.30781 15.0669 5.69219 14.8033 5.16001C14.6654 4.88182 14.4076 4.62395 13.8918 4.10819C13.3761 3.59244 13.1182 3.33456 12.84 3.19671C12.3078 2.93308 11.6922 2.93308 11.16 3.19671C10.8818 3.33456 10.6239 3.59244 10.1082 4.10819C9.59244 4.62395 9.33456 4.88182 9.19671 5.16001C8.93308 5.69219 8.93308 6.30781 9.19671 6.83999Z" />
      <path d="M4.10819 10.1082C4.62395 9.59244 4.88182 9.33456 5.16001 9.19671C5.69219 8.93308 6.30781 8.93308 6.83999 9.19671C7.11818 9.33456 7.37605 9.59244 7.89181 10.1082C8.40756 10.6239 8.66544 10.8818 8.80329 11.16C9.06692 11.6922 9.06692 12.3078 8.80329 12.84C8.66544 13.1182 8.40756 13.3761 7.89181 13.8918C7.37605 14.4076 7.11818 14.6654 6.83999 14.8033C6.30781 15.0669 5.69219 15.0669 5.16001 14.8033C4.88182 14.6654 4.62395 14.4076 4.10819 13.8918C3.59244 13.3761 3.33456 13.1182 3.19671 12.84C2.93308 12.3078 2.93308 11.6922 3.19671 11.16C3.33456 10.8818 3.59244 10.6239 4.10819 10.1082Z" />
      <path d="M16.1082 10.1082C16.6239 9.59244 16.8818 9.33456 17.16 9.19671C17.6922 8.93308 18.3078 8.93308 18.84 9.19671C19.1182 9.33456 19.3761 9.59244 19.8918 10.1082C20.4076 10.6239 20.6654 10.8818 20.8033 11.16C21.0669 11.6922 21.0669 12.3078 20.8033 12.84C20.6654 13.1182 20.4076 13.3761 19.8918 13.8918C19.3761 14.4076 19.1182 14.6654 18.84 14.8033C18.3078 15.0669 17.6922 15.0669 17.16 14.8033C16.8818 14.6654 16.6239 14.4076 16.1082 13.8918C15.5924 13.3761 15.3346 13.1182 15.1967 12.84C14.9331 12.3078 14.9331 11.6922 15.1967 11.16C15.3346 10.8818 15.5924 10.6239 16.1082 10.1082Z" />
      <path d="M9.19671 17.16C9.33456 16.8818 9.59244 16.6239 10.1082 16.1082C10.6239 15.5924 10.8818 15.3346 11.16 15.1967C11.6922 14.9331 12.3078 14.9331 12.84 15.1967C13.1182 15.3346 13.3761 15.5924 13.8918 16.1082C14.4076 16.6239 14.6654 16.8818 14.8033 17.16C15.0669 17.6922 15.0669 18.3078 14.8033 18.84C14.6654 19.1182 14.4076 19.3761 13.8918 19.8918C13.3761 20.4076 13.1182 20.6654 12.84 20.8033C12.3078 21.0669 11.6922 21.0669 11.16 20.8033C10.8818 20.6654 10.6239 20.4076 10.1082 19.8918C9.59244 19.3761 9.33456 19.1182 9.19671 18.84C8.93308 18.3078 8.93308 17.6922 9.19671 17.16Z" />
    </svg>
  );
}

function CLIInstallDialog({
  open,
  onClose,
  componentName,
}: {
  open: boolean;
  onClose: () => void;
  componentName: string;
}) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cli-install-dialog-title"
        >
          {/* Backdrop with Fluid Radial Apple Blur */}
          <motion.div
            className="obsidianui-cli-modal-overlay fixed inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={onClose}
          />

          {/* Modal Surface with Apple spring physics */}
          <motion.div
            className="relative z-10 w-full max-w-xl rounded-3xl border border-border/80 bg-background/95 p-6 shadow-2xl shadow-black/25 backdrop-blur-2xl sm:p-7"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 10 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 8 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 380,
                    damping: 28,
                    mass: 0.8,
                  }
            }
          >
            <div className="flex items-center justify-between pb-3">
              <h3
                id="cli-install-dialog-title"
                className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
              >
                Install using CLI
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close dialog"
              >
                <X className="size-4.5" />
              </button>
            </div>
            <p className="pb-4 text-sm text-muted-foreground">
              Add this component to your project with the shadcn CLI.
            </p>
            <CLICommand componentName={componentName} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function SponsorsPage() {
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const statsRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const moveCards = (root: HTMLDivElement | null, activeIndex: number | null) => {
    if (!root) return;
    const styles = getComputedStyle(root);
    const lift = parseFloat(styles.getPropertyValue("--avatar-lift"));
    const scale = styles.getPropertyValue("--avatar-scale").trim();
    const easing = styles.getPropertyValue(activeIndex === null ? "--avatar-ease-out" : "--avatar-ease-in").trim();
    root.querySelectorAll<HTMLElement>(".t-avatar").forEach((item, index) => {
      const active = index === activeIndex;
      const itemShift = parseFloat(getComputedStyle(item).getPropertyValue("--card-shift"));
      const shift = Number.isFinite(itemShift) ? itemShift : lift;
      item.dataset.active = String(active);
      item.style.transitionTimingFunction = easing;
      item.style.setProperty("--shift", !active || reduceMotion ? "0px" : `${shift}px`);
      const horizontalShift = parseFloat(getComputedStyle(item).getPropertyValue("--card-shift-x")) || 0;
      item.style.setProperty("--shift-x", !active || reduceMotion ? "0px" : `${horizontalShift}px`);
      item.style.setProperty("--scale-active", !active || reduceMotion ? "1" : scale);
    });
  };
  const heroMotion = (index: number) => ({
    initial: reduceMotion ? false : { y: 18, filter: "blur(4px)" },
    animate: { y: 0, filter: "blur(0px)" },
    transition: reduceMotion
      ? { duration: 0 }
      : { type: "spring" as const, stiffness: 300, damping: 22, delay: index * 0.09 },
  });

  return (
    <main id="main-content" className="obsidianui-sponsors">
      <section className="obsidianui-sponsor-hero-wrap">
        <div className="obsidianui-sponsor-hero">
          <span className="obsidianui-sponsor-watermark" aria-hidden="true">
            ObsidianUI
          </span>
          <div className="obsidianui-sponsor-hero-content">
            <motion.h1 {...heroMotion(0)}>Sponsors</motion.h1>
            <motion.p {...heroMotion(1)}>
              Your support keeps ObsidianUI free and open-source for developers everywhere.
            </motion.p>
            <motion.div {...heroMotion(2)} className="obsidianui-sponsor-hero-action">
              <SponsorCta href="#tiers" raised>Become a Sponsor</SponsorCta>
            </motion.div>
          </div>
          <motion.aside {...heroMotion(3)} className="obsidianui-sponsor-hero-partners" aria-label="Platform Partners">
            <span>Platform Partners</span>
            <span className="sr-only">Platform Partners - Vercel [ Hosting Sponsor ] &amp; Tracwell [Analytics Sponsor ]</span>
            <a href={platformLinks.vercel} target="_blank" rel="noreferrer" aria-label="Vercel">
              <VercelLogo />
            </a>
            <a href={platformLinks.tracwell} target="_blank" rel="noreferrer" aria-label="Tracwell">
              <TracwellLogo />
            </a>
          </motion.aside>
          <motion.aside {...heroMotion(4)} className="obsidianui-sponsor-hero-slots" aria-label="Sponsors of ObsidianUI">
            <span>Sponsors of ObsidianUI</span>
            {tiers.map((tier) => (
              <OpenSlot
                key={tier.id}
                name={tier.name}
                tier={tier.id}
                mobileLabel={tier.id === "platinum" ? "Be the first Sponsor" : undefined}
              />
            ))}
          </motion.aside>
        </div>
      </section>

      <section className="obsidianui-sponsor-container obsidianui-sponsor-stats" aria-label="About ObsidianUI">
        <div ref={statsRef} className="obsidianui-sponsor-stats-grid t-avatar-group" onPointerLeave={() => moveCards(statsRef.current, null)} onPointerCancel={() => moveCards(statsRef.current, null)}>
          {[
            { value: "Open source", label: "Built in public on GitLab" },
            { value: "40+", label: "Components" },
            { value: "Free", label: "Available to everyone" },
            { value: "150k+", label: "Pageviews last 7 days" },
          ].map((stat, index) => (
            <div className="obsidianui-sponsor-stat-slot" key={stat.label} onPointerEnter={(event) => { if (event.pointerType === "mouse") moveCards(statsRef.current, index); }}>
            <div className="obsidianui-sponsor-stat t-avatar">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
            </div>
          ))}
        </div>
      </section>

      <section className="obsidianui-sponsor-container obsidianui-sponsor-wall" aria-label="Our sponsors">
        <div className="obsidianui-sponsor-wall-label">
          <span>Sponsors</span>
        </div>
        {tiers.map((tier) => {
          const count = tier.id === "platinum" ? 2 : tier.id === "gold" ? 3 : 4;
          return (
            <div className="obsidianui-sponsor-group" key={tier.id}>
              <h2>{tier.name}</h2>
              <div className="obsidianui-sponsor-slot-row">
                {Array.from({ length: count }, (_, i) => (
                  <OpenSlot key={i} name={tier.name} tier={tier.id} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="obsidianui-sponsor-container obsidianui-sponsor-platform">
        <div className="obsidianui-sponsor-group">
          <h2>Platform Sponsors</h2>
          <span className="sr-only">Platform Partners - Vercel [ Hosting Sponsor ] &amp; Tracwell [Analytics Sponsor ]</span>
          <p>Products that back ObsidianUI through their open-source programs.</p>
          <div className="obsidianui-sponsor-platform-grid">
            <div className="obsidianui-sponsor-platform-slot">
            <a className="obsidianui-sponsor-platform-card" href={platformLinks.vercel} target="_blank" rel="noreferrer" aria-label="Vercel — Hosting Sponsor">
              <VercelLogo />
              <span>Hosting Sponsor</span>
            </a>
            </div>
            <div className="obsidianui-sponsor-platform-slot">
            <a className="obsidianui-sponsor-platform-card" href={platformLinks.tracwell} target="_blank" rel="noreferrer" aria-label="Tracwell — Analytics Sponsor">
              <TracwellLogo />
              <span>Analytics Sponsor</span>
            </a>
            </div>
          </div>
          <div className="obsidianui-sponsor-platform-footer">
            <div className="obsidianui-sponsor-install-wrapper">
              <Link
                href="/docs/split-showcase"
                className="obsidianui-sponsor-platform-install-btn"
                aria-label="View Split Showcase component documentation"
                aria-describedby="install-tooltip"
              >
                <ComponentInstallIcon />
              </Link>
              <div
                id="install-tooltip"
                className="obsidianui-sponsor-install-tooltip"
                role="tooltip"
                aria-hidden="true"
              >
                <span>Install Component</span>
                <span className="obsidianui-sponsor-install-tooltip-caret" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="tiers" className="obsidianui-sponsor-container obsidianui-sponsor-pricing">
        <div className="obsidianui-sponsor-section-heading">
          <h2>Power a growing open-source UI library</h2>
          <p>Pick a tier, get your logo in front of the developers building with ObsidianUI.</p>
        </div>
        <div ref={pricingRef} className="obsidianui-sponsor-price-grid t-avatar-group" onPointerLeave={() => moveCards(pricingRef.current, null)} onPointerCancel={() => moveCards(pricingRef.current, null)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) moveCards(pricingRef.current, null); }}>
          {pricingTiers.map((tier, index) => (
            <div className="obsidianui-sponsor-price-slot" key={tier.id} onPointerEnter={(event) => { if (event.pointerType === "mouse") moveCards(pricingRef.current, index); }} onFocus={() => moveCards(pricingRef.current, index)}>
            <article
              className={`obsidianui-sponsor-price-card t-avatar${tier.featured ? " obsidianui-sponsor-featured" : ""}`}
            >
              {tier.featured && <span className="obsidianui-sponsor-badge">Most impact</span>}
              <div>
                <h3>{tier.name}</h3>
                <p className="obsidianui-sponsor-price">
                  <sup>$</sup>
                  {tier.price}
                  <span>/month</span>
                </p>
              </div>
              <div className="obsidianui-sponsor-divider" />
              <ul>
                {tier.perks.map((perk) => (
                  <li key={perk}>
                    <Check aria-hidden="true" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <SponsorInquiry name={tier.name} featured={tier.featured} />
            </article>
            </div>
          ))}
        </div>
      </section>

      <section className="obsidianui-sponsor-container obsidianui-sponsor-contact">
        <h2>Looking for a custom partnership?</h2>
        <p>Whether you want tailored brand placements, co-branded interactive components, or custom sponsorships — let’s build something together that puts your product in front of thousands of builders.</p>
        <div>
          <SponsorCta href={sponsorshipInquiry} subtle>
            Get in touch
          </SponsorCta>
          <SponsorCta href="https://x.com/athrix_codes" subtle>
            DM on X
          </SponsorCta>
        </div>
      </section>

      <CLIInstallDialog
        open={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        componentName="split-showcase"
      />
    </main>
  );
}
