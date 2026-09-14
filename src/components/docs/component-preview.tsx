"use client";

import React, { useId, useState } from "react";
import { Code2, RotateCcw } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./component-installation";
import { useCopy } from "./use-copy";
import { CopyButton } from "./animated-copy-icon";

interface ComponentPreviewProps {
    component: React.ReactNode;
    code: string;
    title?: string;
    className?: string;
    description?: string;
    previewClassName?: string;
}

export function ComponentPreview({
    component,
    code,
    title = "Component preview",
    className,
    description,
    previewClassName,
}: ComponentPreviewProps) {
    const [activeTab, setActiveTab] = useState("preview");
    const { hasCopied, status, copy } = useCopy();
    const [renderKey, setRenderKey] = useState(0);
    const reduce = useReducedMotion();
    const tabId = useId();
    const transition = { duration: reduce ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] as const };

    return (
        <div className={cn("group relative my-6 mb-10 min-w-0", className)}>
            <span className="sr-only" role="status">{status}</span>
            {description && (
                <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            )}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-0 rounded-xl bg-muted p-1">
                <div className="flex min-h-10 flex-wrap items-center justify-between gap-x-2 px-2 pb-1">
                    <span className="flex min-w-0 items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        <Code2 aria-hidden="true" className="size-3.5 shrink-0" />
                        <span className="truncate">{title}</span>
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                        {activeTab === "preview" && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setRenderKey((previous) => previous + 1)}
                                className="size-8 rounded-full text-muted-foreground transition-colors hover:text-foreground"
                                title="Reload component"
                                aria-label="Reload component"
                            >
                                <motion.span className="inline-flex" animate={{ rotate: reduce ? 0 : -180 * renderKey }} transition={transition}>
                                    <RotateCcw aria-hidden="true" className="size-3.5" />
                                </motion.span>
                            </Button>
                        )}
                        {activeTab === "code" && (
                            <CopyButton
                                copied={hasCopied}
                                onClick={() => copy(code)}
                                className="size-8 rounded-full text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="Copy example code"
                            />
                        )}
                        <TabsList aria-label="Component view" className="h-8 gap-0 rounded-none bg-transparent p-0">
                            {["preview", "code"].map((tab) => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    className="relative h-8 flex-none rounded-none border-0 px-2 text-xs font-medium capitalize text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent"
                                >
                                    {tab}
                                    {activeTab === tab && <motion.span aria-hidden="true" layoutId={`${tabId}-underline`} className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-foreground" transition={transition} />}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                </div>
                <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-background">
                    <TabsContent value="preview" className="min-w-0">
                        <div className="relative mx-auto w-full overflow-hidden bg-background">
                            <motion.div
                                key={renderKey}
                                initial={reduce ? false : { opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={transition}
                                className={cn("docs-preview-body flex min-h-[400px] w-full items-center justify-center p-4 sm:p-6", previewClassName)}
                            >
                                <div className="flex w-full items-center justify-center">{component}</div>
                            </motion.div>
                        </div>
                    </TabsContent>
                    <TabsContent value="code" className="h-[400px] min-w-0 overflow-auto">
                        <motion.div initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
                            <CodeBlock code={code} language="tsx" hideCopy nested className="mb-0 p-4" />
                        </motion.div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
