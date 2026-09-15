# Acebuilder — UI + animation reference

Saved from the user's instructions on 2026-09-14. Markdown formatting and escaped characters have been normalized. Use this reference for future shadcn, Aceternity, and motion work.

## Project assumptions in the supplied template

- Next.js App Router, React 19, Tailwind CSS v4.
- Theme CSS: `src/app/globals.css`.
- Utils: `src/lib/utils.ts`; `cn()` combines clsx and tailwind-merge.
- shadcn config: `components.json`, `new-york`, `cssVariables: true`.
- Icons: `lucide-react` for shadcn, `@tabler/icons-react` for Aceternity blocks.
- Motion package: `motion`; import from `motion/react`.
- Aceternity blocks: `src/components/block/`.
- Template product UI: `src/components/ara-dashboard.tsx`.
- Home route: `src/app/page.tsx`.

**Repository context:** The initial checkout used Next.js 14 and React 18. The user subsequently authorized upgrading to **Next.js 16.3.4 and React 19**, migrating Nextra documentation to App Router, and restructuring the project around these conventions. The product remains ObsidianUI; the Ara dashboard path is a template example. See `AGENTS.md` and `PROJECT_REVIEW.md` for the current architecture and verification status.

## 1. How shadcn components are used

### 1.1 What shadcn is in this project

shadcn/ui is a copy-into-your-repo system, not a package imported from `shadcn`:

- Config: `components.json`.
- Installed source: `src/components/ui/`, aliased as `@/components/ui`.
- Helpers: `@/lib/utils` (`cn`).
- Styling: CSS variables in `globals.css` and Tailwind utility classes.
- Preset: `new-york`; base color: neutral; `cssVariables: true`.

You own the source. Edit the files under `components/ui` after installation.

### 1.2 Adding shadcn components

Do **not** run `npx shadcn add ...` in this workflow. Use the platform `install_user_registry_component` tool with IDs such as `@shadcn/button`, a pasted registry URL, or a full pasted `npx shadcn add https://...` string as its input.

After installation:

- Import from `@/components/ui/<name>`.
- Wire the component into the visible page or feature.
- Prefer semantic theme classes.

Tool names in this reference are platform dependent. If a named tool is unavailable, report that accurately; do not claim it ran or silently substitute the prohibited command.

### 1.3 Imports and component boundaries

```tsx
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
```

Files using hooks, browser APIs, or motion start with `"use client"`. Server Components can import client children but cannot use `useState`, `useEffect`, or motion directly.

### 1.4 Composition

- Prefer shadcn primitives for Button, Input, Textarea, Dialog, Dropdown, Sheet, Tabs, Avatar, Separator, ScrollArea, Tooltip, Badge, Card, and Form.
- Prefer Aceternity blocks for marketing heroes, special sidebars, beams, bento grids, and special navigation; align them to the theme.
- Do not duplicate a shadcn Button with a raw button unless the one-off needs cannot be covered by shadcn. Exact Figma chrome can use custom buttons; migrate when accessibility and variant consistency are the objective.
- Extend existing `class-variance-authority` patterns and `buttonVariants` in the primitive file instead of forking copies.
- Merge classes with `cn(baseClasses, condition && "extra", className)`.

### 1.5 Theming

Define the semantic variables in `src/app/globals.css`, under `:root` and `.dark`:

```css
/* Semantic roles to define, not a second palette. */
/* --background, --foreground */
/* --card, --card-foreground */
/* --primary, --primary-foreground */
/* --secondary, --muted, --accent */
/* --destructive, --border, --input, --ring */
/* --radius, and sidebar-* tokens where used */
```

Use `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, and `ring-ring`.

Avoid scattered hardcoded product colors such as `bg-white`, `text-black`, `bg-zinc-900`, `text-neutral-400`, and `bg-blue-500` when a design system is attached. Theme-align imported Aceternity blocks. For a requested dark product, use `.dark` on `<html>` or dark defaults in `:root`.

### 1.6 When custom components are appropriate

- Exact Figma chrome such as sidebar rails, chat bubbles, and composers can use custom components with `cn()` and motion.
- Full marketing sections can use Aceternity blocks.
- Keep one design-token source and one coherent radius system within the product. Do not invent a second design system mid-page.

## 2. How animations are used

### 2.1 Libraries and responsibilities

```tsx
import { motion, AnimatePresence } from "motion/react";
```

- `motion`: layout width, entrance/exit, staggered lists, micro-interactions.
- Tailwind and `tw-animate-css`: simple loops, skeleton pulses, and one-shot CSS entrances where available.
- CSS transitions: hover/focus/active colors and borders, e.g. `transition-colors duration-150`.

Prefer motion for structure and presence, CSS transitions for hover.

### 2.2 Core motion patterns

#### A. Collapsible sidebar width

```tsx
<motion.div
  animate={{ width: open ? 288 : 72 }}
  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
  className="..."
/>
```

Use a smooth cubic-bezier ease-out. Keep enough collapsed width for icons, such as a 72px rail. Put the toggle **inside the sidebar header**, unless the design explicitly calls for an outside control.

#### B. Expanded sidebar labels

```tsx
{open && (
  <motion.span
    initial={{ opacity: 0, x: -6 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -6 }}
    transition={{ duration: 0.18 }}
  >
    Label
  </motion.span>
)}
```

Wrap sibling exits in `AnimatePresence` when exit animations are needed.

#### C. Staggered children

```tsx
// Parent: initial="hidden" animate="show"
const parentVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
};
```

Use for home cards or appropriate list entrances.

#### D. Route/view switch

```tsx
<AnimatePresence mode="wait">
  {view === "home" ? (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    />
  ) : (
    <motion.div
      key={sessionId}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    />
  )}
</AnimatePresence>
```

`mode="wait"` lets the old full panel exit before the next enters.

#### E. New list item or chat message

```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.22 }}
/>
```

For append-only lists, animate the new row; do not re-stagger the history on every send.

#### F. Typing/loading dots

```tsx
<motion.span
  animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
/>
```

Alternatively use CSS `animate-pulse` for skeletons.

#### G. Hover/tap micro-interaction

```tsx
<motion.div
  whileHover={{ y: -2, scale: 1.01 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 28 }}
/>
```

Use springs sparingly in dense UI; prefer short tweens for chat apps.

#### H. Collapsible groups

```tsx
<AnimatePresence initial={false}>
  {expanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden"
    />
  )}
</AnimatePresence>
```

Always use `overflow-hidden` on height-to-auto collapses.

### 2.3 Easing and timing

- Product default: `ease: [0.22, 1, 0.36, 1]`, duration `0.22–0.32` seconds.
- Snappy chrome: `0.15–0.2` seconds.
- Playful/marketing springs: stiffness `300–500`, damping `24–32`.
- Avoid heavy bounce in dashboards and chat.

### 2.4 Performance and accessibility

- Prefer transforms and opacity.
- Avoid width/height animation when scale or clipping works, except intentional sidebar/drawer layout changes.
- Do not trigger layout animations on every keystroke.
- Honor `prefers-reduced-motion`; skip movement or use zero duration. Browser-only APIs must stay in client-safe code.
- Use stable unique keys for `AnimatePresence` children.

```ts
// Browser-side example only; do not access window during server rendering.
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
// If reduce.matches, use duration: 0 or skip movement.
```

## 3. Theme and class conventions

### 3.1 cn()

```tsx
import { cn } from "@/lib/utils";

className={cn(
  "flex items-center gap-2 rounded-lg",
  open && "bg-muted",
  className,
)}
```

### 3.2 Semantic tokens

Prefer `bg-background text-foreground border-border text-muted-foreground`. Exact Figma colors can be temporary before tokens exist; migrate them into the token system afterward.

### 3.3 Radius and density

Match `--radius`. Typical chat UI uses `rounded-lg`/`rounded-xl` cards, `rounded-full` pills and avatars, and compact hit targets at least 36–40px high.

### 3.4 Focus and accessibility

- Visible `focus-visible:ring-2` with `ring-ring` on buttons.
- Descriptive `aria-label` on icon-only buttons.
- Active sessions use background and font weight, not color alone.

## 4. Template file conventions

```text
src/
  app/
    layout.tsx          fonts, metadata, html/body classes, dark mode
    page.tsx            thin feature-root renderer
    globals.css         tokens, base styles, Tailwind v4 entry
  components/
    ui/                 owned shadcn primitives
    block/              Aceternity blocks when installed
    ara-dashboard.tsx   template product shell, when applicable
  lib/
    utils.ts            cn()
```

- Keep `page.tsx` thin; feature logic belongs in components.
- Use `"use client"` only where necessary.
- Do not create `tailwind.config.js` when Tailwind v4 and `@tailwindcss/postcss` are already configured; tokens live in CSS.
- Never write `.env` files in the sandbox; request needed environment variables through the platform.

### Registry component constraints (critical for shadcn registry builds)

Files under `components/block/` and `components/ui/` are **registry entrypoints** — the shadcn registry builder (`scripts/registry.ts`) bundles every transitive import into the installable JSON package. This means:

- **NEVER import `@/lib/r2` (or `src/lib/r2-manifest.json`) inside a block or ui component.** `lib/r2.ts` is a runtime-only server helper; bundling it into a shadcn package pulls in environment assumptions and JSON manifests that escape `src/`, breaking the Vercel build.
- For default prop values that point to Cloudflare R2 assets, **hard-code the direct CDN URL** (e.g. `https://cdn-athrix.milliondollarinternet.lol/effects/...`) rather than calling `r2()`.
- `@/lib/r2` is safe to use anywhere else: `src/app/`, `src/components/catalog/`, `src/components/site/`, `src/components/landing/`, `src/components/pages/` — i.e., any file that is not itself a registry item.
- The `REGISTRY_EXCLUDE` set in `scripts/registry.ts` enforces this at build time and will throw a clear error if a block component accidentally imports r2.
- Run `npm run registry:build` after touching any block/ui component to verify no registry contamination.

## 5. Agent workflow

1. Read existing pages and components before editing.
2. For a named `@shadcn/...` item or supplied shadcn URL, use `install_user_registry_component` when available.
3. With an attached design system, patch global tokens and theme-align every wired block.
4. Use `motion/react`, short durations, an inside-sidebar toggle, and `AnimatePresence` for view swaps.
5. Implement working interactions: selecting a session opens it, sending appends a message, and New Task creates a session when those features are assigned.
6. Run `verify_changes` on touched files when available; otherwise run the applicable available checks and state the exact verification limits.
7. Use real product copy; no lorem ipsum.
8. Make surgical edits; avoid whole-file rewrites unless necessary.
9. Match supplied Figma/screenshots; otherwise preserve the existing brand.

## 6. Quick copy-paste snippets

```tsx
"use client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
```

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="sm" className="rounded-lg">
  Continue
</Button>
```

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={viewKey}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
</AnimatePresence>
```

```tsx
className={cn(
  "rounded-lg border px-3 py-2 text-sm transition-colors",
  active
    ? "border-border bg-muted text-foreground"
    : "border-transparent text-muted-foreground hover:bg-muted/60",
)}
```

## 7. Do / don't

Do:

- Keep one design-token source in `globals.css`.
- Use `cn()` for conditional classes.
- Use motion for presence/layout chrome and CSS for hover colors.
- Put sidebar collapse controls inside the sidebar.
- Implement working session/chat handlers when assigned.
- Label icon buttons and keep `page.tsx` thin.

Don't:

- Use `import_component` for non-Aceternity IDs.
- Hardcode blue/zinc/white across themed landing pages.
- Float the sidebar toggle outside when the design asks for an inside control.
- Put infinite bounce springs on every list row.
- Set state synchronously in an effect when lazy `useState` initialization suffices.
- Commit secrets or write `.env*` files.

## Local skills requested by the user

Use the repository's `skills/` directory as the local reference for interface work:

- `better-accessibility/SKILL.md`
- `better-layout/SKILL.md`
- `better-writing/SKILL.md`
- `better-typography/SKILL.md`
- `better-colors/SKILL.md`
- `better-ui/SKILL.md`
- `better-interface/SKILL.md`
- `interface-review/SKILL.md`
- `transitions-dev/SKILL.md`

Read the applicable supporting files as needed. Apply each skill in its proper scope: `interface-review` covers changes, `better-interface` covers whole-interface review, and transition installation is separate from a read-only review. The user's explicit task and these supplied preferences take precedence over conflicting skill defaults.
