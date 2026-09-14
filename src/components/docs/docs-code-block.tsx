"use client";

import { useRef, type ComponentProps } from "react";
import { Pre } from "nextra/mdx-components/pre/index";
import { cn } from "@/lib/utils";
import { CopyButton } from "./animated-copy-icon";
import { useCopy } from "./use-copy";
import { useCodeCard } from "./code-card-context";

/** Preserve Nextra's highlighted markup and controls, with the site's shared copy feedback. */
export function DocsCodeBlock({ "data-copy": copyEnabled, ...props }: ComponentProps<typeof Pre>) {
    const container = useRef<HTMLDivElement>(null);
    const { hasCopied, status, copy } = useCopy();
    const filename = props["data-filename"];
    const hasWordWrap = props["data-word-wrap"] === "";
    const nested = useCodeCard();

    function copyCode() {
        const code = container.current?.querySelector("pre code");
        if (code) void copy(code.textContent ?? "");
    }

    return (
        <div ref={container} className={cn("docs-code-block relative min-w-0", nested ? "docs-code-block-nested" : "docs-code-card rounded-2xl bg-muted p-1 not-first:mt-5")}>
            {!nested && !filename && <div className="flex min-h-10 items-center px-3 pb-1 text-sm font-medium text-foreground">Code</div>}
            <div className="relative min-w-0">
                <Pre {...props} data-copy={undefined} />
                {copyEnabled === "" && <>
                    <span className="sr-only" role="status">{status}</span>
                    <CopyButton copied={hasCopied} onClick={copyCode} aria-label="Copy code" title="Copy code" className={cn("absolute right-3 bg-background", filename ? "top-3" : "top-2", !filename && hasWordWrap && "max-md:right-12")} />
                </>}
            </div>
        </div>
    );
}
