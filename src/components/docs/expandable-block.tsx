"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

interface ExpandableBlockProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    initialHeight?: string
}

export function ExpandableBlock({
    children,
    initialHeight = "400px",
    className,
    ...props
}: ExpandableBlockProps) {
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [hasOverflow, setHasOverflow] = React.useState<boolean | null>(null)
    const contentRef = React.useRef<HTMLDivElement>(null)
    const heightLimitRef = React.useRef<HTMLDivElement>(null)
    const contentId = React.useId()
    const reduceMotion = useReducedMotion()
    const transition = { duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] as const }

    React.useEffect(() => {
        const content = contentRef.current
        const heightLimit = heightLimitRef.current
        if (!content || !heightLimit) return

        const observer = new ResizeObserver(() => {
            const contentHeight = Math.max(content.scrollHeight, content.getBoundingClientRect().height)
            const collapsedHeight = heightLimit.getBoundingClientRect().height
            const overflows = contentHeight > collapsedHeight + 1
            setHasOverflow(overflows)
            if (!overflows) setIsExpanded(false)
        })

        // Both the source and CSS height limit can change with content or viewport size.
        observer.observe(content)
        observer.observe(heightLimit)
        return () => observer.disconnect()
    }, [])

    return (
        <div
            className={cn("docs-expandable relative min-w-0 rounded-lg", className)}
            {...props}
        >
            <div
                ref={heightLimitRef}
                aria-hidden="true"
                className="docs-expandable-limit pointer-events-none invisible absolute top-0 w-px"
                style={{ height: initialHeight }}
            />
            <div className="relative">
                <motion.div
                    id={contentId}
                    className="overflow-hidden"
                    initial={false}
                    animate={{ height: hasOverflow && !isExpanded ? initialHeight : "auto" }}
                    style={{ maxHeight: hasOverflow === null ? initialHeight : undefined }}
                    transition={transition}
                >
                    <div ref={contentRef} className="docs-expandable-content flow-root min-w-0">
                        {children}
                    </div>
                </motion.div>
                <AnimatePresence initial={false}>
                    {hasOverflow && !isExpanded && (
                        <motion.div
                            aria-hidden="true"
                            className="docs-expandable-fade pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background via-background/85 to-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: reduceMotion ? 0 : 0.15 }}
                        />
                    )}
                </AnimatePresence>
            </div>
            {hasOverflow && <div className={cn(
                "docs-expandable-controls z-10 flex w-full justify-center",
                isExpanded ? "relative py-3" : "absolute inset-x-0 bottom-3"
            )}>
                <Button
                    asChild
                    type="button"
                    variant="secondary"
                    size="sm"
                    aria-expanded={isExpanded}
                    aria-controls={contentId}
                    onClick={() => setIsExpanded(previous => !previous)}
                    className="gap-2 rounded-lg border border-border bg-background px-3 text-foreground shadow-sm transition-colors hover:bg-muted"
                >
                    <motion.button whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: 0.96 }} transition={transition}>
                        {isExpanded ? "Show Less" : "Show More"}
                        <motion.span aria-hidden="true" className="inline-flex" animate={{ rotate: isExpanded ? 180 : 0 }} transition={transition}>
                            <ChevronDown className="size-3.5" />
                        </motion.span>
                    </motion.button>
                </Button>
            </div>}
        </div>
    )
}
