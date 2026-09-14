"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useSyncExternalStore, type ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const SPRING_PRESS = { type: "spring", stiffness: 400, damping: 28 } as const;

function subscribeToHover(onChange: () => void) {
  const media = window.matchMedia(HOVER_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const getHoverSnapshot = () => window.matchMedia(HOVER_QUERY).matches;
const getServerHoverSnapshot = () => false;

const sizes = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-5 text-sm",
  lg: "h-12 gap-2 px-6 text-base",
  icon: "size-8 rounded-lg p-0",
};

type MotionButtonLinkProps = Omit<ComponentProps<typeof MotionLink>, "size"> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: keyof typeof sizes;
  pressScale?: number;
};

/** The supplied beui press/hover treatment, composed with our owned button styles. */
export function MotionButtonLink({
  variant = "primary",
  size = "md",
  pressScale = 0.93,
  className,
  children,
  ...props
}: MotionButtonLinkProps) {
  const reduceMotion = useReducedMotion();
  const canHover = useSyncExternalStore(subscribeToHover, getHoverSnapshot, getServerHoverSnapshot);

  return (
    <MotionLink
      {...props}
      data-slot="button"
      whileTap={reduceMotion ? undefined : { scale: pressScale }}
      whileHover={reduceMotion || !canHover ? undefined : { scale: 1.02 }}
      transition={SPRING_PRESS}
      className={cn(
        buttonVariants({ variant: variant === "primary" ? "default" : variant }),
        "rounded-full font-body font-medium not-italic transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring",
        sizes[size],
        className,
      )}
    >
      {children}
    </MotionLink>
  );
}
