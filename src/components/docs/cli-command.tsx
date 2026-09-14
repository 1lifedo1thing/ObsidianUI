"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCopy } from "./use-copy";
import { CopyButton } from "./animated-copy-icon";

interface CLICommandProps {
    componentName: string;
    className?: string;
}

type PackageManager = "npm" | "pnpm" | "bun" | "yarn";

const packageManagerConfig: Record<PackageManager, { icon: React.ReactNode; command: string; label: string }> = {
    npm: {
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" fill="#CB3837" />
            </svg>
        ),
        command: "npx",
        label: "npm",
    },
    pnpm: {
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path d="M0 0v7.5h7.5V0zm8.25 0v7.5h7.498V0zm8.25 0v7.5H24V0zM8.25 8.25v7.5h7.498v-7.5zm8.25 0v7.5H24v-7.5zM0 16.5V24h7.5v-7.5zm8.25 0V24h7.498v-7.5zm8.25 0V24H24v-7.5z" fill="#F69220" />
            </svg>
        ),
        command: "pnpm dlx",
        label: "pnpm",
    },
    bun: {
        icon: (
            <svg viewBox="0 0 80 70" className="h-4 w-4">
                <path d="M71.09 20.74c-.16-.17-.33-.34-.5-.5s-.33-.34-.5-.5c-.12-.12-.24-.24-.37-.35a17.89 17.89 0 0 0-2.4-1.87c-.55-.35-1.12-.68-1.71-1a38.16 38.16 0 0 0-16.93-4.18h-.25c-5.6 0-11.13 1.45-16.12 4.18-.59.32-1.16.65-1.71 1a18.11 18.11 0 0 0-2.4 1.87c-.13.11-.24.23-.37.35-.17.16-.34.33-.5.5s-.34.33-.5.5a16.21 16.21 0 0 0-4 10.69 15.78 15.78 0 0 0 .18 2.37c.9 7.03 5.75 13.05 12.73 16.9.35.19.7.38 1.06.55a38.16 38.16 0 0 0 16.12 4.19h.25a38.16 38.16 0 0 0 16.93-4.18c.36-.18.71-.36 1.06-.55 7-3.86 11.84-9.87 12.73-16.9a15.78 15.78 0 0 0 .18-2.37 16.21 16.21 0 0 0-4-10.69z" fill="#FBEDDC" />
                <path d="M26.18 31.09a3.09 3.09 0 0 1 3-3.19 3.09 3.09 0 0 1 3 3.19 3.09 3.09 0 0 1-3 3.19 3.09 3.09 0 0 1-3-3.19zm15 0a3.09 3.09 0 0 1 3-3.19 3.09 3.09 0 0 1 3 3.19 3.09 3.09 0 0 1-3 3.19 3.09 3.09 0 0 1-3-3.19z" fill="#3E3E3E" />
                <path d="M38.16 38.42c-3.5 0-6.24 2.1-6.24 4.77s2.74 4.77 6.24 4.77 6.24-2.1 6.24-4.77-2.74-4.77-6.24-4.77z" fill="#F59794" />
            </svg>
        ),
        command: "bunx",
        label: "bun",
    },
    yarn: {
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm.768 4.105c.183 0 .363.053.525.157.125.083.287.185.755 1.154.31-.088.468-.042.551-.019.204.056.366.19.463.375.477.917.542 2.553.334 3.605-.241 1.232-.755 2.029-1.131 2.576.324.329.778.899 1.117 1.825.278.774.31 1.478.273 2.015a5.51 5.51 0 0 0 .602-.329c.593-.366 1.487-.917 2.553-.931.714-.009 1.269.445 1.353 1.103a1.23 1.23 0 0 1-.945 1.362c-.649.158-.95.278-1.821.843-1.232.797-2.539 1.242-3.012 1.39a1.686 1.686 0 0 1-.704.343c-.737.181-3.266.315-3.466.315h-.046c-.783 0-1.214-.241-1.45-.491-.658.329-1.51.19-2.122-.134a1.078 1.078 0 0 1-.58-1.153 1.243 1.243 0 0 1-.153-.195c-.162-.25-.528-.936-.454-1.946.056-.723.556-1.367.88-1.71a5.522 5.522 0 0 1 .408-2.256c.306-.727.885-1.348 1.32-1.737-.32-.537-.644-1.367-.329-2.21.227-.602.412-.936.82-1.08h-.005c.199-.074.389-.153.486-.259a3.418 3.418 0 0 1 2.298-1.103c.037-.093.079-.185.125-.283.31-.658.639-1.029 1.024-1.168a.94.94 0 0 1 .328-.06z" fill="#2C8EBB" />
            </svg>
        ),
        command: "yarn dlx",
        label: "yarn",
    },
};

export function CLICommand({ componentName, className }: CLICommandProps) {
    const [activeTab, setActiveTab] = React.useState<PackageManager>("npm");
    const { hasCopied, status, copy } = useCopy();
    const reduce = useReducedMotion();
    const tabId = React.useId();
    const transition = { duration: reduce ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] as const };

    const getFullCommand = (manager: PackageManager) =>
        packageManagerConfig[manager].command + ' shadcn@latest add "https://www.obsidianui.dev/r/' + componentName + '.json"';

    return (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PackageManager)} className={cn("min-w-0 gap-0 rounded-2xl bg-muted p-1", className)}>
            <span className="sr-only" role="status">{status}</span>
            <div className="flex min-h-10 items-center justify-between gap-1 px-1 pb-1">
                <TabsList aria-label="Package manager" className="h-8 gap-0 rounded-none bg-transparent p-0">
                    {(Object.keys(packageManagerConfig) as PackageManager[]).map((manager) => (
                        <TabsTrigger
                            key={manager}
                            value={manager}
                            className="group/manager relative h-8 flex-none gap-1.5 rounded-none border-0 px-2 text-xs font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent [&_svg]:size-3.5"
                        >
                            <span aria-hidden="true" className="inline-flex transition-transform duration-150 motion-safe:group-hover/manager:-translate-y-0.5 motion-reduce:transition-none">{packageManagerConfig[manager].icon}</span>
                            {packageManagerConfig[manager].label}
                            {activeTab === manager && <motion.span aria-hidden="true" layoutId={`${tabId}-underline`} className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-foreground" transition={transition} />}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <CopyButton
                    copied={hasCopied}
                    onClick={() => copy(getFullCommand(activeTab))}
                    aria-label="Copy command"
                    className="size-8 shrink-0 rounded-md text-muted-foreground transition-colors hover:text-foreground"
                />
            </div>
            <div className="min-w-0 overflow-x-auto rounded-xl border border-border bg-background p-3">
                {(Object.keys(packageManagerConfig) as PackageManager[]).map((manager) => (
                    <TabsContent key={manager} value={manager} className="font-mono text-[13px] leading-relaxed text-muted-foreground">
                        <motion.code className="block whitespace-nowrap font-mono" initial={reduce ? false : { opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={transition}>{getFullCommand(manager)}</motion.code>
                    </TabsContent>
                ))}
            </div>
        </Tabs>
    );
}
