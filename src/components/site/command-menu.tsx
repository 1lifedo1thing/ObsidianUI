"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command as CommandPrimitive } from "cmdk"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Search, Moon, Sun, Laptop, FileText, Home, ArrowRight, Sparkles } from "lucide-react"
import { useTheme } from "next-themes"

import { componentLinks as components } from "@/components/site/component-links";

export function CommandMenu({ open: controlledOpen, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void } = {}) {
    const router = useRouter()
    const [localOpen, setLocalOpen] = React.useState(false)
    const returnFocusRef = React.useRef<HTMLElement | null>(null)
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const reduceMotion = useReducedMotion()
    const open = controlledOpen ?? localOpen
    const setOpen = React.useCallback((next: boolean) => {
        if (next && document.activeElement instanceof HTMLElement && !document.activeElement.closest("[data-command-dialog]")) {
            returnFocusRef.current = document.activeElement
        }
        if (controlledOpen === undefined) setLocalOpen(next)
        onOpenChange?.(next)
    }, [controlledOpen, onOpenChange])
    const { setTheme } = useTheme()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen(!open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [open, setOpen])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [setOpen])

    const itemClass = "relative flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm text-foreground outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"

    return (
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger asChild>
                <button
                    ref={triggerRef}
                    type="button"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-foreground/5"
                    aria-label="Open command menu"
                >
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Search...</span>
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-foreground/10 rounded">
                        <span>⌘</span>
                        <span>K</span>
                    </kbd>
                </button>
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal forceMount>
                <AnimatePresence>
                    {open && (
                        <React.Fragment key="command-menu">
                            <DialogPrimitive.Overlay forceMount asChild>
                                <motion.div
                                    className="fixed inset-0 z-[100] bg-foreground/25 backdrop-blur-[2px]"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.15 } }}
                                    transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                                />
                            </DialogPrimitive.Overlay>
                            <DialogPrimitive.Content
                                forceMount
                                asChild
                                onOpenAutoFocus={() => {
                                    if (document.activeElement instanceof HTMLElement && !document.activeElement.closest("[data-command-dialog]")) {
                                        returnFocusRef.current = document.activeElement
                                    }
                                }}
                                onCloseAutoFocus={event => {
                                    event.preventDefault()
                                    const target = returnFocusRef.current
                                    if (target?.isConnected) target.focus()
                                    else triggerRef.current?.focus()
                                }}
                            >
                                <motion.div
                                    data-command-dialog=""
                                    className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-2xl outline-none"
                                    initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96, y: reduceMotion ? 0 : 8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.98, y: reduceMotion ? 0 : 4, transition: { duration: reduceMotion ? 0 : 0.15 } }}
                                    transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <DialogPrimitive.Title className="sr-only">Search ObsidianUI</DialogPrimitive.Title>
                                    <DialogPrimitive.Description className="sr-only">Find components and pages, or change your theme.</DialogPrimitive.Description>
                                    <CommandPrimitive label="Search components and commands">
                                        <div className="flex items-center border-b border-border px-3 pb-2">
                                            <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
                                            <CommandPrimitive.Input
                                                placeholder="Type a command or search..."
                                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-base outline-none text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                        </div>

                                        <CommandPrimitive.List className="max-h-[min(400px,60dvh)] overflow-y-auto overflow-x-hidden overscroll-contain p-2">
                                            <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
                                                No results found. Try another component name.
                                            </CommandPrimitive.Empty>

                                            <CommandPrimitive.Group heading="General" className="overflow-hidden px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                                <CommandPrimitive.Item
                                                    onSelect={() => runCommand(() => router.push("/"))}
                                                    className={itemClass}
                                                >
                                                    <Home className="mr-2 h-4 w-4" />
                                                    <span>Home</span>
                                                </CommandPrimitive.Item>
                                                <CommandPrimitive.Item
                                                    onSelect={() => runCommand(() => router.push("/components"))}
                                                    className={itemClass}
                                                >
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    <span>Components Overview</span>
                                                </CommandPrimitive.Item>
                                                <CommandPrimitive.Item
                                                    onSelect={() => runCommand(() => router.push("/docs"))}
                                                    className={itemClass}
                                                >
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    <span>Documentation</span>
                                                </CommandPrimitive.Item>
                                                <CommandPrimitive.Item
                                                    onSelect={() => runCommand(() => router.push("/templates"))}
                                                    className={itemClass}
                                                >
                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                    <span>Templates</span>
                                                </CommandPrimitive.Item>
                                            </CommandPrimitive.Group>

                                            <CommandPrimitive.Group heading="Components" className="overflow-hidden px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                                {components.map((component) => (
                                                    <CommandPrimitive.Item
                                                        key={component.href}
                                                        value={`${component.name} ${component.href}`}
                                                        onSelect={() => runCommand(() => router.push(component.href))}
                                                        className={itemClass}
                                                    >
                                                        <ArrowRight className="mr-2 h-4 w-4" />
                                                        <span>{component.name}</span>
                                                    </CommandPrimitive.Item>
                                                ))}
                                            </CommandPrimitive.Group>

                                            <CommandPrimitive.Group heading="Theme" className="overflow-hidden px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                                <CommandPrimitive.Item
                                                    onSelect={() => runCommand(() => setTheme("light"))}
                                                    className={itemClass}
                                                >
                                                    <Sun className="mr-2 h-4 w-4" />
                                                    <span>Light</span>
                                                </CommandPrimitive.Item>
                                                <CommandPrimitive.Item
                                                    onSelect={() => runCommand(() => setTheme("dark"))}
                                                    className={itemClass}
                                                >
                                                    <Moon className="mr-2 h-4 w-4" />
                                                    <span>Dark</span>
                                                </CommandPrimitive.Item>
                                                <CommandPrimitive.Item
                                                    onSelect={() => runCommand(() => setTheme("system"))}
                                                    className={itemClass}
                                                >
                                                    <Laptop className="mr-2 h-4 w-4" />
                                                    <span>System</span>
                                                </CommandPrimitive.Item>
                                            </CommandPrimitive.Group>
                                        </CommandPrimitive.List>
                                    </CommandPrimitive>
                                </motion.div>
                            </DialogPrimitive.Content>
                        </React.Fragment>
                    )}
                </AnimatePresence>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}
