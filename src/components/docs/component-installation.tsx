"use client";

import * as React from "react";
import { ChevronDown, FileCode2, Terminal } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Highlight, type PrismTheme } from "prism-react-renderer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getCodeToCopy, useCopy } from "./use-copy";
import { CopyButton } from "./animated-copy-icon";
import { CodeCardContext, useCodeCard } from "./code-card-context";

const InstallationCopyContext = React.createContext(false);

const codeTheme: PrismTheme = {
    plain: { color: "var(--foreground)", backgroundColor: "transparent" },
    styles: [
        { types: ["comment", "prolog", "doctype", "cdata"], style: { color: "var(--muted-foreground)" } },
        { types: ["punctuation", "operator"], style: { color: "var(--muted-foreground)" } },
        { types: ["keyword", "atrule", "boolean"], style: { color: "var(--foreground)", fontWeight: "500" } },
        { types: ["string", "attr-value"], style: { color: "var(--muted-foreground)" } },
    ],
};

interface CodeBlockProps {
    code: string;
    language?: string;
    className?: string;
    expandable?: boolean;
    title?: string;
    hideCopy?: boolean;
    nested?: boolean;
}

export function CodeBlock({ code, language = "bash", className, expandable = false, title, hideCopy: hideCopyProp, nested: nestedProp }: CodeBlockProps) {
    const managedCopy = React.useContext(InstallationCopyContext);
    const insideCard = useCodeCard();
    const hideCopy = hideCopyProp ?? managedCopy;
    const nested = nestedProp ?? insideCard;
    const { hasCopied, status, copy } = useCopy();
    const [isExpanded, setIsExpanded] = React.useState(false);
    const reduce = useReducedMotion();

    return (
        <div className={cn(
            "group/code relative min-w-0 overflow-hidden",
            nested ? "m-0 rounded-none border-0 bg-transparent p-0" : "mb-4 rounded-2xl bg-muted p-1",
            className,
        )}>
            <span className="sr-only" role="status">{status}</span>
            {!nested ? (
                <div className="flex min-h-10 items-center justify-between gap-2 px-3 pb-1">
                    <span className="flex min-w-0 items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        {title && <FileCode2 aria-hidden="true" className="size-3.5 shrink-0" />}
                        <span className={cn("truncate", !title && "font-sans text-sm font-medium text-foreground")}>{title ?? "Code"}</span>
                    </span>
                    {!hideCopy && <CopyButton copied={hasCopied} onClick={() => copy(code)} aria-label="Copy code" />}
                </div>
            ) : !hideCopy ? (
                <CopyButton copied={hasCopied} onClick={() => copy(code)} aria-label="Copy code" className="absolute right-2 top-2 z-20 bg-background" />
            ) : null}
            <div className={cn(
                "relative overflow-x-auto font-mono text-[13px] leading-relaxed",
                !nested && "rounded-xl border border-border bg-background p-4",
                nested && !hideCopy && "pr-12",
                expandable && !isExpanded && "max-h-40 overflow-hidden",
            )}>
                <Highlight theme={codeTheme} code={code} language={language}>
                    {({ style, tokens, getLineProps, getTokenProps }) => (
                        <pre className="font-mono text-[13px] leading-relaxed" style={{ ...style, backgroundColor: "transparent", margin: 0, padding: 0 }}>
                            {tokens.map((line, index) => (
                                <div key={index} {...getLineProps({ line })} className="table-row">
                                    {!nested && <span aria-hidden="true" className="table-cell w-8 select-none pr-4 text-right text-xs tabular-nums text-muted-foreground/60">{index + 1}</span>}
                                    <span className="table-cell">{line.map((token, key) => <span key={key} {...getTokenProps({ token })} />)}</span>
                                </div>
                            ))}
                        </pre>
                    )}
                </Highlight>
            </div>
            {expandable && (
                <div className="flex justify-center border-t border-border bg-muted/50 p-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsExpanded((previous) => !previous)} aria-expanded={isExpanded} className="h-8 rounded-md text-xs text-muted-foreground transition-colors hover:text-foreground">
                        {isExpanded ? "Collapse" : "Expand code"}
                        <motion.span aria-hidden="true" className="inline-flex" animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: reduce ? 0 : 0.18 }}><ChevronDown className="size-3.5" /></motion.span>
                    </Button>
                </div>
            )}
        </div>
    );
}

interface DependenciesProps {
    step?: number;
    title?: string;
    children?: React.ReactNode;
    copyText?: string;
    id?: string;
    source?: string;
    className?: string;
}

export const Dependencies = ({ step, title, children, copyText, id, source, className }: DependenciesProps) => {
    const { hasCopied, status, copy } = useCopy();
    const textToCopy = copyText ?? getCodeToCopy(children);

    return (
        <div id={id} className={cn("relative mb-6 w-full min-w-0 scroll-mt-24 rounded-2xl bg-muted p-1", className)}>
            <span className="sr-only" role="status">{status}</span>
            <div className="flex min-h-10 items-center justify-between gap-2 px-2 pb-1">
                <div className="flex min-w-0 items-center gap-2">
                    {step !== undefined ? <span className="flex size-5 shrink-0 items-center justify-center rounded border border-border bg-background font-mono text-xs tabular-nums text-muted-foreground">{step}</span> : <Terminal aria-hidden="true" className="size-3.5 text-muted-foreground" />}
                    {title && <h3 className="m-0 text-sm font-medium leading-relaxed text-foreground">{title}</h3>}
                </div>
                {textToCopy && <CopyButton copied={hasCopied} onClick={() => copy(textToCopy)} aria-label="Copy code" />}
            </div>
            <div className="min-w-0 rounded-xl border border-border bg-background p-4">
                <CodeCardContext.Provider value={true}>
                    <InstallationCopyContext.Provider value={Boolean(textToCopy)}>
                        <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
                    </InstallationCopyContext.Provider>
                    {source && <RegistrySource key={source} componentName={source} />}
                </CodeCardContext.Provider>
            </div>
        </div>
    );
};

interface SourceFile { path: string; content: string }

function isSourceFile(value: unknown): value is SourceFile {
    return typeof value === "object" && value !== null && "path" in value && typeof value.path === "string" &&
        "content" in value && typeof value.content === "string"
}

/** Load the generated manifest from this same build only when its source is requested. */
function RegistrySource({ componentName }: { componentName: string }) {
    const [files, setFiles] = React.useState<SourceFile[]>([])
    const [selectedPath, setSelectedPath] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState("")
    const [notes, setNotes] = React.useState("")
    const controller = React.useRef<AbortController | null>(null)
    const selectId = React.useId()
    const reduce = useReducedMotion()
    React.useEffect(() => () => controller.current?.abort(), [])

    async function loadSource() {
        controller.current?.abort()
        const request = new AbortController()
        controller.current = request
        setLoading(true)
        setError("")
        try {
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(componentName)) throw new Error("Invalid component name")
            const response = await fetch(`/r/${componentName}.json`, { signal: request.signal, cache: "no-store" })
            if (!response.ok) throw new Error("Source unavailable")
            const manifest: unknown = await response.json()
            if (!manifest || typeof manifest !== "object" || !("name" in manifest) || manifest.name !== componentName ||
                !("files" in manifest) || !Array.isArray(manifest.files) || !manifest.files.length || !manifest.files.every(isSourceFile)) {
                throw new Error("Invalid source manifest")
            }
            if (request.signal.aborted) return
            setFiles(manifest.files)
            setSelectedPath(manifest.files.find(file => file.path.endsWith(`/${componentName}.tsx`))?.path ?? manifest.files[0].path)
            setNotes("docs" in manifest && typeof manifest.docs === "string" ? manifest.docs : "")
        } catch {
            if (!request.signal.aborted) setError("Source files could not be loaded. Try again or use the installation command above.")
        } finally {
            if (!request.signal.aborted) setLoading(false)
        }
    }

    const selectedFile = files.find(file => file.path === selectedPath)
    return (
        <div className="space-y-3">
            {!files.length && <Button type="button" variant="outline" onClick={loadSource} disabled={loading}>
                {loading ? "Loading source…" : error ? "Retry loading source" : "View source files"}
            </Button>}
            <p role="status" className={cn("text-sm text-muted-foreground", !error && !loading && "sr-only")}>{error || (loading ? "Loading source files" : "")}</p>
            {selectedFile && <>
                <p className="text-sm text-muted-foreground">Copy each required file to the displayed path in your project. You can skip files you already have.</p>
                <label htmlFor={selectId} className="block text-sm font-medium text-foreground">Source file</label>
                <select id={selectId} value={selectedPath} onChange={event => setSelectedPath(event.target.value)} className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring">
                    {files.map(file => <option key={file.path} value={file.path}>{file.path}</option>)}
                </select>
                <motion.div key={selectedFile.path} initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}>
                    <CodeBlock code={selectedFile.content} language={selectedFile.path.endsWith(".css") ? "css" : selectedFile.path.endsWith(".json") ? "json" : selectedFile.path.endsWith(".svg") ? "markup" : "tsx"} title={selectedFile.path} className="max-h-[28rem] overflow-auto" />
                </motion.div>
                {notes && <p className="whitespace-pre-line text-sm text-muted-foreground">{notes}</p>}
            </>}
        </div>
    )
}

