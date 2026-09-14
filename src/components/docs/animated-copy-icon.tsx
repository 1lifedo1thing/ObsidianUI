"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AnimatedCopyIcon({ copied }: { copied: boolean }) {
    const reduce = useReducedMotion();
    const transition = { duration: reduce ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] as const };

    return (
        <span aria-hidden="true" className="inline-grid size-4 shrink-0">
            <motion.svg viewBox="0 0 18 18" fill="currentColor" className="col-start-1 row-start-1 size-4" initial={false} animate={{ opacity: copied ? 0 : 1, scale: copied && !reduce ? 0.8 : 1 }} transition={transition}>
                <path d="M11.75 14.5H4.25C3.5605 14.5 3 13.9395 3 13.25V6.75C3 6.3359 2.6641 6 2.25 6C1.8359 6 1.5 6.3359 1.5 6.75V13.25C1.5 14.7666 2.7334 16 4.25 16H11.75C12.1641 16 12.5 15.6641 12.5 15.25C12.5 14.8359 12.1641 14.5 11.75 14.5Z" opacity="0.4" />
                <path d="M13.75 2H7.25C5.73122 2 4.5 3.23122 4.5 4.75V10.25C4.5 11.7688 5.73122 13 7.25 13H13.75C15.2688 13 16.5 11.7688 16.5 10.25V4.75C16.5 3.23122 15.2688 2 13.75 2Z" opacity="0.5" />
            </motion.svg>
            <motion.svg viewBox="-1 -2 20 20" fill="currentColor" className="col-start-1 row-start-1 size-4" initial={false} animate={{ opacity: copied ? 1 : 0, scale: !copied && !reduce ? 0.8 : 1 }} transition={transition}>
                <path d="M6.5001 14C6.3077 14 6.1163 13.9268 5.9698 13.7803L2.21981 10.0303C1.92681 9.7373 1.92681 9.2627 2.21981 8.9698C2.51281 8.6769 2.98741 8.6768 3.28031 8.9698L6.50001 12.1895L14.7197 3.9698C15.0127 3.6768 15.4873 3.6768 15.7802 3.9698C16.0731 4.2628 16.0732 4.7374 15.7802 5.0303L7.03022 13.7803C6.88372 13.9268 6.6925 14 6.5001 14Z" />
            </motion.svg>
        </span>
    );
}

/** Keep the same named button and live status while the confirmation icon changes. */
export function CopyButton({ copied, className, ...props }: Omit<ComponentProps<typeof Button>, "asChild" | "children"> & { copied: boolean }) {
    const reduce = useReducedMotion();

    return (
        <Button type="button" variant="ghost" size="icon-sm" className={cn("size-6 shrink-0 rounded text-muted-foreground transition-colors hover:text-foreground", className)} {...props} asChild>
            <motion.button whileTap={reduce ? undefined : { scale: 0.9 }} transition={{ duration: reduce ? 0 : 0.15 }}>
                <AnimatedCopyIcon copied={copied} />
            </motion.button>
        </Button>
    );
}
