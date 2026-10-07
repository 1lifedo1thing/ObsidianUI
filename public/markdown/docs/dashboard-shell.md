# ObsidianUI — Dashboard Shell

[Canonical page](https://www.obsidianui.dev/docs/dashboard-shell) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

An app layout for dashboards and admin pages. It has a resizable sidebar with grouped navigation, a header with a title, status, and action buttons, tabs with a sliding pill, and a toolbar for filters and primary actions. Your page content goes in the scrolling area below.

Drag the sidebar edge to resize it, or double-click it to reset. In containers narrower than 672px, the sidebar moves into a drawer that opens from the menu button.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/dashboard-shell)

```tsx
'use client'

import { useState } from 'react'
import { AddCircle, AppDots, Box } from '@duo-icons/react'
import { Download, Search } from 'lucide-react'
import { DashboardButton, DashboardFilterMenu, DashboardShell } from '@/components/block/dashboard-shell'

const sortOptions = [
{ value: 'newest', label: 'Newest first' },
{ value: 'name', label: 'Name' },
]

export function Demo() {
const [sortBy, setSortBy] = useState('newest')

return (
  <div className="h-dvh">
    <DashboardShell
      brand={{ name: 'ObsidianUI', description: 'Component library' }}
      navigation={[
        {
          id: 'library',
          items: [
            { id: 'components', label: 'Components', icon: AppDots, count: 10 },
            { id: 'blocks', label: 'Blocks', icon: Box },
          ],
        },
        {
          id: 'spaces',
          title: 'Spaces',
          items: [{ id: 'landing-pages', label: 'Landing pages', color: '#facc15' }],
        },
      ]}
      title="Components"
      status="Active"
      headerActions={
        <DashboardButton variant="secondary" size="icon" aria-label="Search">
          <Search aria-hidden />
        </DashboardButton>
      }
      tabs={[
        { value: 'all', label: 'All components' },
        { value: 'new', label: 'New' },
      ]}
      filters={<DashboardFilterMenu label="Sort by" value={sortBy} options={sortOptions} onValueChange={setSortBy} />}
      toolbarActions={
        <>
          <DashboardButton variant="secondary" size="sm"><Download aria-hidden />Export</DashboardButton>
          <DashboardButton variant="primary" size="sm"><AddCircle aria-hidden />New component</DashboardButton>
        </>
      }
    >
      <p className="p-4">Your page content</p>
    </DashboardShell>
  </div>
)
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/dashboard-shell.json"
```

## Usage

```tsx
import { AppDots } from '@duo-icons/react'
import { DashboardShell } from '@/components/block/dashboard-shell'

<div className="h-dvh">
  <DashboardShell
    brand={{ name: 'ObsidianUI' }}
    navigation={[{ id: 'main', items: [{ id: 'components', label: 'Components', icon: AppDots }] }]}
    title="Components"
  >
    <YourContent />
  </DashboardShell>
</div>
```

The shell fills its parent, so give the parent a height, such as `h-dvh` for a full page. The content area scrolls on its own, and the header, tabs, and toolbar stay in place.

Leave out `tabs`, `filters`, or `toolbarActions` and those rows are not rendered.

## Navigation

Each section has an optional `title` and a list of items. An item shows an `icon`, or a colored dot when you pass `color` instead, and an optional `count` badge. The demo uses duotone icons from [`@duo-icons/react`](https://github.com/fernandcf/duo-icons): their second layer draws at 30% opacity, so one icon color gives a dark shape with a grey fill. Lucide icons work too.

A single hover highlight glides between items as the pointer moves down the list, and the active item's pill slides to whichever item you choose.

Items with `href` render as links. Items without it render as buttons that only change the active item. Track the active item with `activeItemId` and `onActiveItemChange`, or let the shell keep it with `defaultActiveItemId`. The active item gets `aria-current="page"`.

`secondaryNavigation` holds quieter items pinned under the main list, such as Invite or Help. `sidebarFooter` sits at the very bottom, for a plan or account card:

```tsx
<DashboardShell
  secondaryNavigation={[{ id: 'help', label: 'Help', icon: Info, href: '/help' }]}
  sidebarFooter={<DashboardButton variant="muted" size="md">Add billing</DashboardButton>}
  {...props}
/>
```

## Buttons and filters

`DashboardButton` matches the shell's look and works anywhere inside it.

- `variant`: `primary` for the main action, `secondary` for everyday buttons, `muted` for buttons on the sidebar's darker panels, and `ghost` for low-emphasis actions.
- `size`: `sm` for toolbars, `md` for larger buttons, and `icon` for square icon buttons. Give icon buttons an `aria-label`.

`DashboardFilterMenu` is a dropdown that shows its label and current value side by side, like **Sort by | Last updated**:

```tsx
const [team, setTeam] = useState('all')

<DashboardFilterMenu
  label="Team"
  value={team}
  options={[
    { value: 'all', label: 'All teams' },
    { value: 'design', label: 'Design' },
  ]}
  onValueChange={setTeam}
/>
```

## Menus and popovers

The filter menu is built from menu pieces you can use for your own menus, such as an account menu. `DashboardPopover` holds free-form content, like a search field or a notifications list. Both match the buttons: frosted glass with a backdrop blur, the same corners and text size, and a highlight that glides between items as you hover or use the arrow keys. They open with a short spring from the trigger, coming into focus as the blur clears.

```tsx
import {
  DashboardButton,
  DashboardMenu,
  DashboardMenuContent,
  DashboardMenuItem,
  DashboardMenuSeparator,
  DashboardMenuTrigger,
} from '@/components/block/dashboard-shell'

<DashboardMenu>
  <DashboardMenuTrigger asChild>
    <DashboardButton variant="secondary" size="sm">Account</DashboardButton>
  </DashboardMenuTrigger>
  <DashboardMenuContent align="end">
    <DashboardMenuItem>Profile</DashboardMenuItem>
    <DashboardMenuItem>Settings</DashboardMenuItem>
    <DashboardMenuSeparator />
    <DashboardMenuItem>Sign out</DashboardMenuItem>
  </DashboardMenuContent>
</DashboardMenu>
```

`DashboardMenuLabel`, `DashboardMenuRadioGroup`, and `DashboardMenuRadioItem` are also available for headings and single-choice options. `DashboardPopover`, `DashboardPopoverTrigger`, and `DashboardPopoverContent` follow the same pattern. Both are built on Radix, so they keep its keyboard support and focus handling.

## Sidebar width

The sidebar starts at 200px and resizes between 180px and 400px. Change the limits with `minSidebarWidth` and `maxSidebarWidth`. To remember the width, save it in `onSidebarWidthChange`, which runs once when a drag ends rather than on every frame:

```tsx
const [width, setWidth] = useState(200)

useEffect(() => {
  const saved = Number(localStorage.getItem('sidebar-width'))
  if (saved) setWidth(saved)
}, [])

<DashboardShell
  sidebarWidth={width}
  onSidebarWidthChange={next => {
    setWidth(next)
    localStorage.setItem('sidebar-width', String(next))
  }}
  {...props}
/>
```

## Behavior

- The resize handle works with the keyboard. Focus it, then press the left and right arrow keys to change the width by 10px, or Home and End to jump to the limits.
- The layout responds to the width of its container, not the window, so it also works inside a panel or a preview.
- The sidebar, content area, and menus use a thin 4px scrollbar with no track or arrows. It only appears while the pointer or keyboard focus is inside that area.
- The drawer moves focus to its close button and keeps Tab inside until it closes. Escape, the backdrop, or choosing an item closes it and returns focus to the menu button.
- Tabs follow the WAI-ARIA tabs pattern, so the arrow keys move between them. The active pill slides to the tab you choose, the hover highlight glides across the tabs, and the page content fades in. The content stays mounted when the tab changes, so its state and scroll position are kept.
- With reduced motion, the drawer, hover highlights, and active pills move into place without animating, the content doesn't fade, and menus and popovers appear without the spring or blur. Touch input skips the hover highlight.

## Customize colors

The shell has a light and a dark palette, and switches when a parent has the `dark` class. Menus and popovers render in a portal at the end of the page, so they carry an `obsidian-dashboard-shell-layer` class with the same palette. Include both classes when you override colors:

```css
.obsidian-dashboard-shell,
.obsidian-dashboard-shell-layer {
  --obsidian-dashboard-shell-background: #ffffff;
  --obsidian-dashboard-shell-sidebar: #fafafa;
  --obsidian-dashboard-shell-panel: #f4f4f4;
  --obsidian-dashboard-shell-border: #e7e7e7;
  --obsidian-dashboard-shell-foreground: #161616;
  --obsidian-dashboard-shell-text-muted: #5c5c5c;
  --obsidian-dashboard-shell-icon: #161616;
  --obsidian-dashboard-shell-hover: rgb(0 0 0 / 0.045);
  --obsidian-dashboard-shell-accent: #2563eb;
  --obsidian-dashboard-shell-accent-hover: #3b82f6;
  --obsidian-dashboard-shell-menu: rgb(255 255 255 / 0.82);
  --obsidian-dashboard-shell-menu-highlight: rgb(0 0 0 / 0.06);
}
```

Keep `--obsidian-dashboard-shell-menu` slightly transparent, or the backdrop blur has nothing to show through.

The full list, with both palettes, is in `dashboard-shell.css`.

## Install manually — complete source

Download the complete manifest: [dashboard-shell.json](https://www.obsidianui.dev/r/dashboard-shell.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-tabs class-variance-authority clsx lucide-react motion tailwind-merge
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/dashboard-shell.css

Installation target: `@components/block/dashboard-shell.css`

```css
/* Menus and popovers render in a portal, so the layer class repeats the palette for them. */
.obsidian-dashboard-shell,
.obsidian-dashboard-shell-layer {
  --obsidian-dashboard-shell-background: #ffffff;
  --obsidian-dashboard-shell-sidebar: #fafafa;
  --obsidian-dashboard-shell-panel: #f4f4f4;
  --obsidian-dashboard-shell-control: #ffffff;
  --obsidian-dashboard-shell-muted: #efefef;
  --obsidian-dashboard-shell-muted-hover: #e6e6e6;
  --obsidian-dashboard-shell-border: #e7e7e7;
  --obsidian-dashboard-shell-border-strong: #d6d6d6;
  --obsidian-dashboard-shell-foreground: #161616;
  --obsidian-dashboard-shell-text-muted: #5c5c5c;
  --obsidian-dashboard-shell-text-subtle: #737373;
  /* Duotone icons draw their second layer at 30% of this color, so one dark value gives black and grey. */
  --obsidian-dashboard-shell-icon: #161616;
  --obsidian-dashboard-shell-hover: rgb(0 0 0 / 0.045);
  --obsidian-dashboard-shell-accent: #2563eb;
  --obsidian-dashboard-shell-accent-hover: #3b82f6;
  --obsidian-dashboard-shell-accent-foreground: #f9fbff;
  --obsidian-dashboard-shell-success: #16a34a;
  --obsidian-dashboard-shell-warning: #d97706;
  --obsidian-dashboard-shell-danger: #e5484d;
  --obsidian-dashboard-shell-ring: #8b8b8b;
  --obsidian-dashboard-shell-control-shadow: 0 0 0 1px rgb(0 0 0 / 0.08), 0 1px 2px rgb(0 0 0 / 0.06);
  --obsidian-dashboard-shell-accent-shadow: 0 2px 4px rgb(37 99 235 / 0.24), 0 0 0 1px #1d4ed8, inset 0 4px 6px rgb(255 255 255 / 0.2),
    inset 0 0 0 1px rgb(255 255 255 / 0.15), inset 0 -8px 14px rgb(0 0 0 / 0.15);
  /* Translucent so the backdrop blur shows through. */
  --obsidian-dashboard-shell-menu: rgb(255 255 255 / 0.82);
  --obsidian-dashboard-shell-menu-highlight: rgb(0 0 0 / 0.06);
  --obsidian-dashboard-shell-menu-shadow: 0 0 0 1px rgb(0 0 0 / 0.08), 0 2px 4px rgb(0 0 0 / 0.04), 0 12px 32px -6px rgb(0 0 0 / 0.16);
}

.dark .obsidian-dashboard-shell,
.dark .obsidian-dashboard-shell-layer {
  --obsidian-dashboard-shell-background: #161616;
  --obsidian-dashboard-shell-sidebar: #171717;
  --obsidian-dashboard-shell-panel: #181818;
  --obsidian-dashboard-shell-control: #1e1e1e;
  --obsidian-dashboard-shell-muted: #2a2a2a;
  --obsidian-dashboard-shell-muted-hover: #333333;
  --obsidian-dashboard-shell-border: #232323;
  --obsidian-dashboard-shell-border-strong: #393939;
  --obsidian-dashboard-shell-foreground: #f9fbff;
  --obsidian-dashboard-shell-text-muted: #9a9a9a;
  --obsidian-dashboard-shell-text-subtle: #808080;
  --obsidian-dashboard-shell-icon: #f9fbff;
  --obsidian-dashboard-shell-hover: rgb(255 255 255 / 0.045);
  --obsidian-dashboard-shell-success: #22c55e;
  --obsidian-dashboard-shell-warning: #fbbf24;
  --obsidian-dashboard-shell-danger: #f97373;
  --obsidian-dashboard-shell-ring: #676767;
  --obsidian-dashboard-shell-control-shadow: 0 0 0 1px rgb(0 0 0 / 0.4), inset 0 1px 0 rgb(255 255 255 / 0.1), inset 0 0 0 1px rgb(255 255 255 / 0.06);
  --obsidian-dashboard-shell-accent-shadow: 0 4px 4px rgb(42 42 42 / 0.32), 0 0 0 1px #0e0e0e, inset 0 4px 6px rgb(255 255 255 / 0.2),
    inset 0 0 0 1px rgb(255 255 255 / 0.15), inset 0 -8px 14px rgb(0 0 0 / 0.15);
  --obsidian-dashboard-shell-menu: rgb(30 30 30 / 0.78);
  --obsidian-dashboard-shell-menu-highlight: rgb(255 255 255 / 0.07);
  --obsidian-dashboard-shell-menu-shadow: 0 0 0 1px rgb(0 0 0 / 0.5), inset 0 1px 0 rgb(255 255 255 / 0.1), inset 0 0 0 1px rgb(255 255 255 / 0.06),
    0 16px 36px -8px rgb(0 0 0 / 0.6);
}

/* A thin thumb that only appears while the pointer or focus is in the scroll area, with no track or arrow buttons. */
@supports not selector(::-webkit-scrollbar) {
  .obsidian-dashboard-shell-scroll {
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
  }

  .obsidian-dashboard-shell-scroll:is(:hover, :focus-within) {
    scrollbar-color: var(--obsidian-dashboard-shell-border-strong) transparent;
  }
}

/* Chromium ignores the scrollbar pseudo-elements once scrollbar-width or scrollbar-color is set, so they stay unset here. */
@supports selector(::-webkit-scrollbar) {
  .obsidian-dashboard-shell-scroll::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  .obsidian-dashboard-shell-scroll::-webkit-scrollbar-track,
  .obsidian-dashboard-shell-scroll::-webkit-scrollbar-corner {
    background: transparent;
  }

  .obsidian-dashboard-shell-scroll::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: transparent;
  }

  .obsidian-dashboard-shell-scroll:is(:hover, :focus-within)::-webkit-scrollbar-thumb {
    background: var(--obsidian-dashboard-shell-border-strong);
  }

  .obsidian-dashboard-shell-scroll::-webkit-scrollbar-button {
    display: none;
    width: 0;
    height: 0;
  }
}

.obsidian-dashboard-shell[data-resizing] {
  cursor: col-resize;
  user-select: none;
}
```

### components/block/dashboard-shell.tsx

Installation target: `@components/block/dashboard-shell.tsx`

```tsx
"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown, Menu, X } from "lucide-react";
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion } from "motion/react";
import { createContext, memo, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ComponentProps, CSSProperties, ElementType, FocusEvent, KeyboardEvent, PointerEvent, ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";
import "./dashboard-shell.css";

const EASE_OUT = [0.25, 1, 0.5, 1] as const;
/** The hover highlight glides after the pointer. */
const FOLLOW_SPRING = { type: "spring", stiffness: 650, damping: 45, mass: 0.5 } as const;
/** The active pill slides to the chosen item. */
const PILL_SPRING = { type: "spring", stiffness: 520, damping: 38, mass: 0.7 } as const;
/** Menus and popovers settle from a slight squash with a small overshoot. */
const LAYER_SPRING = { type: "spring", stiffness: 560, damping: 26, mass: 0.7 } as const;
const RESIZE_STEP = 10;
/** The sidebar docks beside the content from this container width, in rem. Keep in sync with `@2xl/dashboard-shell`. */
const DOCKED_SIDEBAR_REM = 42;

export const dashboardButtonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium leading-none outline-none select-none transition-[background-color,color,box-shadow] duration-150 ease-[cubic-bezier(0.25,1,0.5,1)] focus-visible:ring-2 focus-visible:ring-(--obsidian-dashboard-shell-ring) disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-(--obsidian-dashboard-shell-accent) text-(--obsidian-dashboard-shell-accent-foreground) shadow-(--obsidian-dashboard-shell-accent-shadow) hover:bg-(--obsidian-dashboard-shell-accent-hover)",
        secondary:
          "bg-(--obsidian-dashboard-shell-control) text-(--obsidian-dashboard-shell-foreground) shadow-(--obsidian-dashboard-shell-control-shadow) hover:bg-(--obsidian-dashboard-shell-muted) data-[state=open]:bg-(--obsidian-dashboard-shell-muted)",
        muted:
          "bg-(--obsidian-dashboard-shell-muted) text-(--obsidian-dashboard-shell-foreground) shadow-(--obsidian-dashboard-shell-control-shadow) hover:bg-(--obsidian-dashboard-shell-muted-hover)",
        ghost:
          "text-(--obsidian-dashboard-shell-text-subtle) hover:bg-(--obsidian-dashboard-shell-muted) hover:text-(--obsidian-dashboard-shell-foreground)",
      },
      size: {
        sm: "h-[30px] px-[9px] text-xs [&_svg]:size-3",
        md: "h-8 px-2.5 text-sm [&_svg]:size-4",
        icon: "size-[30px] [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "secondary", size: "sm" },
  },
);

export type DashboardButtonProps = ComponentProps<"button"> & VariantProps<typeof dashboardButtonVariants>;

export function DashboardButton({ variant, size, className, type = "button", ...props }: DashboardButtonProps) {
  return <button type={type} className={cn(dashboardButtonVariants({ variant, size }), className)} {...props} />;
}

// Menus and popovers portal to the body, outside the shell, so they carry the layer class that holds the palette.
const layerClassName =
  "obsidian-dashboard-shell-layer z-50 rounded-[10px] bg-(--obsidian-dashboard-shell-menu) p-1 text-(--obsidian-dashboard-shell-foreground) shadow-(--obsidian-dashboard-shell-menu-shadow) outline-none backdrop-blur-xl backdrop-saturate-150";

function layerMotion(reduceMotion: boolean) {
  if (reduceMotion) {
    return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } };
  }
  return {
    initial: { opacity: 0, scaleX: 0.92, scaleY: 0.86, filter: "blur(8px)" },
    animate: {
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      filter: "blur(0px)",
      transition: { ...LAYER_SPRING, opacity: { duration: 0.16, ease: EASE_OUT }, filter: { duration: 0.24, ease: EASE_OUT } },
    },
    exit: { opacity: 0, scaleX: 0.96, scaleY: 0.94, filter: "blur(4px)", transition: { duration: 0.14, ease: EASE_OUT } },
  };
}

// Exit animations need the open state, since the content stays mounted until it has animated out.
const LayerOpenContext = createContext(false);

export type DashboardMenuProps = ComponentProps<typeof DropdownMenuPrimitive.Root>;

export function DashboardMenu({ open, defaultOpen = false, onOpenChange, ...props }: DashboardMenuProps) {
  const [isOpen, setIsOpen] = useControllableState(open, defaultOpen, onOpenChange);
  return (
    <LayerOpenContext.Provider value={isOpen}>
      <DropdownMenuPrimitive.Root open={isOpen} onOpenChange={setIsOpen} {...props} />
    </LayerOpenContext.Provider>
  );
}

export const DashboardMenuTrigger = DropdownMenuPrimitive.Trigger;

export type DashboardMenuContentProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.Content>, "asChild" | "forceMount">;

export function DashboardMenuContent({ className, children, sideOffset = 6, ...props }: DashboardMenuContentProps) {
  const isOpen = useContext(LayerOpenContext);
  const reduceMotion = !!useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <DropdownMenuPrimitive.Portal forceMount>
          <DropdownMenuPrimitive.Content forceMount asChild sideOffset={sideOffset} {...props}>
            <motion.div
              {...layerMotion(reduceMotion)}
              className={cn(
                layerClassName,
                "obsidian-dashboard-shell-scroll max-h-(--radix-dropdown-menu-content-available-height) min-w-40 origin-(--radix-dropdown-menu-content-transform-origin) overflow-y-auto overscroll-contain",
                className,
              )}
            >
              <HoverHighlightList highlightClassName="rounded-md bg-(--obsidian-dashboard-shell-menu-highlight)">{children}</HoverHighlightList>
            </motion.div>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

const menuItemClassName =
  "relative flex h-8 cursor-pointer select-none items-center gap-2 rounded-md px-2.5 text-xs leading-none text-(--obsidian-dashboard-shell-text-muted) outline-none transition-[color,scale] duration-150 ease-[cubic-bezier(0.25,1,0.5,1)] active:scale-[0.97] active:duration-75 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:text-(--obsidian-dashboard-shell-foreground) [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

// Radix focuses items on hover and with the arrow keys, so following focus moves the highlight for both.
function useHighlightOnFocus(onFocus?: (event: FocusEvent<HTMLDivElement>) => void, onBlur?: (event: FocusEvent<HTMLDivElement>) => void) {
  const highlight = useContext(HoverHighlightContext);
  return {
    onFocus: (event: FocusEvent<HTMLDivElement>) => {
      onFocus?.(event);
      highlight?.show(event.currentTarget);
    },
    onBlur: (event: FocusEvent<HTMLDivElement>) => {
      onBlur?.(event);
      highlight?.hide();
    },
  };
}

export function DashboardMenuItem({ className, onFocus, onBlur, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  const focusHandlers = useHighlightOnFocus(onFocus, onBlur);
  return <DropdownMenuPrimitive.Item className={cn(menuItemClassName, className)} {...focusHandlers} {...props} />;
}

export const DashboardMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export function DashboardMenuRadioItem({ className, children, onFocus, onBlur, ...props }: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  const focusHandlers = useHighlightOnFocus(onFocus, onBlur);
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(menuItemClassName, "pr-8 data-[state=checked]:font-medium data-[state=checked]:text-(--obsidian-dashboard-shell-foreground)", className)}
      {...focusHandlers}
      {...props}
    >
      {children}
      <DropdownMenuPrimitive.ItemIndicator className="absolute right-2.5 flex">
        <Check aria-hidden className="size-3.5!" />
      </DropdownMenuPrimitive.ItemIndicator>
    </DropdownMenuPrimitive.RadioItem>
  );
}

export function DashboardMenuLabel({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn("px-2.5 pb-2 pt-2.5 text-[11px] font-medium uppercase leading-none tracking-[1px] text-(--obsidian-dashboard-shell-text-subtle)", className)}
      {...props}
    />
  );
}

export function DashboardMenuSeparator({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-(--obsidian-dashboard-shell-border)", className)} {...props} />;
}

export type DashboardPopoverProps = ComponentProps<typeof PopoverPrimitive.Root>;

export function DashboardPopover({ open, defaultOpen = false, onOpenChange, ...props }: DashboardPopoverProps) {
  const [isOpen, setIsOpen] = useControllableState(open, defaultOpen, onOpenChange);
  return (
    <LayerOpenContext.Provider value={isOpen}>
      <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen} {...props} />
    </LayerOpenContext.Provider>
  );
}

export const DashboardPopoverTrigger = PopoverPrimitive.Trigger;

export type DashboardPopoverContentProps = Omit<ComponentProps<typeof PopoverPrimitive.Content>, "asChild" | "forceMount">;

export function DashboardPopoverContent({ className, children, align = "center", sideOffset = 6, ...props }: DashboardPopoverContentProps) {
  const isOpen = useContext(LayerOpenContext);
  const reduceMotion = !!useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <PopoverPrimitive.Portal forceMount>
          <PopoverPrimitive.Content forceMount asChild align={align} sideOffset={sideOffset} {...props}>
            <motion.div
              {...layerMotion(reduceMotion)}
              className={cn(layerClassName, "w-72 origin-(--radix-popover-content-transform-origin)", className)}
            >
              {children}
            </motion.div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

export type DashboardFilterOption = { value: string; label: string };

export type DashboardFilterMenuProps = {
  /** Shown before the current value and as the menu heading, such as "Sort by". */
  label?: string;
  value: string;
  options: DashboardFilterOption[];
  onValueChange: (value: string) => void;
  align?: "start" | "end";
  className?: string;
};

export function DashboardFilterMenu({ label, value, options, onValueChange, align = "start", className }: DashboardFilterMenuProps) {
  const currentLabel = options.find((option) => option.value === value)?.label ?? value;

  return (
    <DashboardMenu>
      <DashboardMenuTrigger asChild>
        <DashboardButton
          variant="secondary"
          size="sm"
          aria-label={label ? `${label}: ${currentLabel}` : undefined}
          className={cn("group gap-0 overflow-hidden px-0", className)}
        >
          {label && (
            <>
              <span className="px-[9px] font-normal text-(--obsidian-dashboard-shell-text-subtle)">{label}</span>
              <span aria-hidden className="h-full w-px bg-(--obsidian-dashboard-shell-border)" />
            </>
          )}
          <span className="flex items-center gap-1.5 px-[9px]">
            {currentLabel}
            <ChevronDown
              aria-hidden
              className="text-(--obsidian-dashboard-shell-text-subtle) transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </span>
        </DashboardButton>
      </DashboardMenuTrigger>
      <DashboardMenuContent align={align} className="min-w-44">
        {label && <DashboardMenuLabel>{label}</DashboardMenuLabel>}
        <DashboardMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((option) => (
            <DashboardMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DashboardMenuRadioItem>
          ))}
        </DashboardMenuRadioGroup>
      </DashboardMenuContent>
    </DashboardMenu>
  );
}

// Duo icons ship their own bundled SVG prop types, so accept any element type rather than a narrow props shape.
type NavIcon = ElementType;

export type DashboardShellNavItem = {
  id: string;
  label: string;
  /** A duo-icons or lucide icon, or any component that accepts `className`. */
  icon?: NavIcon;
  /** Shows a colored dot instead of an icon, for projects or pipelines. */
  color?: string;
  count?: number;
  /** Renders a link. Without it the item is a button that only changes the active item. */
  href?: string;
};

export type DashboardShellNavSection = {
  id: string;
  title?: string;
  items: DashboardShellNavItem[];
};

export type DashboardShellTab = { value: string; label: string };

export type DashboardShellStatusTone = "success" | "warning" | "neutral";

export type DashboardShellProps = Omit<ComponentProps<"div">, "title" | "children" | "ref"> & {
  brand: { name: string; description?: string; logo?: ReactNode };
  navigation: DashboardShellNavSection[];
  /** Low-emphasis items pinned under the navigation, such as Invite or Help. */
  secondaryNavigation?: DashboardShellNavItem[];
  /** Pinned to the bottom of the sidebar, for a plan or trial card. */
  sidebarFooter?: ReactNode;
  activeItemId?: string;
  defaultActiveItemId?: string;
  onActiveItemChange?: (id: string) => void;
  title: ReactNode;
  headingLevel?: 1 | 2 | 3;
  /** A short label in a pill beside the title, such as "Active". */
  status?: string;
  statusTone?: DashboardShellStatusTone;
  /** Buttons on the right of the header: search, notifications, profile. */
  headerActions?: ReactNode;
  tabs?: DashboardShellTab[];
  tab?: string;
  defaultTab?: string;
  onTabChange?: (value: string) => void;
  /** Left side of the toolbar, usually `DashboardFilterMenu`s. */
  filters?: ReactNode;
  /** Right side of the toolbar, such as Export and New. */
  toolbarActions?: ReactNode;
  children?: ReactNode;
  sidebarWidth?: number;
  defaultSidebarWidth?: number;
  /** Called with the new width when a drag ends or the width changes from the keyboard. */
  onSidebarWidthChange?: (width: number) => void;
  minSidebarWidth?: number;
  maxSidebarWidth?: number;
  navigationLabel?: string;
};

function useControllableState<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolledValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [isControlled ? value : uncontrolledValue, setValue] as const;
}

/** Wraps Tab and Shift+Tab inside the drawer, since the page around the shell is not inert. */
function keepFocusInside(event: KeyboardEvent<HTMLElement>) {
  const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')];
  const first = focusable[0];
  const last = focusable.at(-1);
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

const statusToneClasses: Record<DashboardShellStatusTone, string> = {
  success: "text-(--obsidian-dashboard-shell-success)",
  warning: "text-(--obsidian-dashboard-shell-warning)",
  neutral: "text-(--obsidian-dashboard-shell-text-subtle)",
};

export function DashboardShell({
  brand,
  navigation,
  secondaryNavigation,
  sidebarFooter,
  activeItemId,
  defaultActiveItemId,
  onActiveItemChange,
  title,
  headingLevel = 1,
  status,
  statusTone = "success",
  headerActions,
  tabs,
  tab,
  defaultTab,
  onTabChange,
  filters,
  toolbarActions,
  children,
  sidebarWidth,
  defaultSidebarWidth = 200,
  onSidebarWidthChange,
  minSidebarWidth = 180,
  maxSidebarWidth = 400,
  navigationLabel = "Navigation",
  className,
  style,
  ...props
}: DashboardShellProps) {
  const reduceMotion = useReducedMotion();
  const uid = useId();
  const titleId = `${uid}-title`;
  const sidebarId = `${uid}-sidebar`;
  const drawerId = `${uid}-drawer`;
  const rootRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusOnClose = useRef(false);
  const drag = useRef<{ startX: number; startWidth: number; width: number } | null>(null);
  const tabPillId = `${uid}-tab-pill`;
  const contentRef = useRef<HTMLDivElement>(null);

  const [activeItem, setActiveItem] = useControllableState(activeItemId, defaultActiveItemId ?? navigation[0]?.items[0]?.id, onActiveItemChange);
  const [activeTab, setActiveTab] = useControllableState(tab, defaultTab ?? tabs?.[0]?.value ?? "", onTabChange);
  const [committedWidth, setCommittedWidth] = useControllableState(sidebarWidth, defaultSidebarWidth, onSidebarWidthChange);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const shownTab = useRef(activeTab);

  // The content stays mounted across tabs, so it animates in place rather than remounting and losing its state.
  useEffect(() => {
    if (shownTab.current === activeTab) return;
    shownTab.current = activeTab;
    const content = contentRef.current;
    if (!content || reduceMotion) return;
    const controls = animate(
      content,
      { opacity: [0, 1], y: [6, 0], filter: ["blur(4px)", "blur(0px)"] },
      { duration: 0.32, ease: EASE_OUT },
    );
    // A leftover transform or filter would make the scroll area the containing block for fixed-position content.
    controls.then(() => {
      content.style.removeProperty("transform");
      content.style.removeProperty("filter");
    });
    return () => controls.stop();
  }, [activeTab, reduceMotion]);

  const clampWidth = (width: number) => Math.round(Math.min(maxSidebarWidth, Math.max(minSidebarWidth, width)));
  const width = clampWidth(dragWidth ?? committedWidth);

  const commitWidth = (next: number) => {
    const clamped = clampWidth(next);
    if (clamped !== committedWidth) setCommittedWidth(clamped);
  };

  const closeDrawer = useCallback(() => {
    restoreFocusOnClose.current = true;
    setIsDrawerOpen(false);
  }, []);

  // The content is inert while the drawer is open, so focus can only move back once it re-renders.
  useEffect(() => {
    if (isDrawerOpen) {
      closeButtonRef.current?.focus();
    } else if (restoreFocusOnClose.current) {
      restoreFocusOnClose.current = false;
      menuButtonRef.current?.focus();
    }
  }, [isDrawerOpen]);

  // A container that widens past the docking width hides the drawer with CSS; close it too so the content is not left inert.
  useEffect(() => {
    const root = rootRef.current;
    if (!isDrawerOpen || !root || typeof ResizeObserver === "undefined") return;
    const dockedWidth = DOCKED_SIDEBAR_REM * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width >= dockedWidth) setIsDrawerOpen(false);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [isDrawerOpen]);

  // Stable handlers let the memoized sidebar skip the re-render on every resize frame,
  // which would otherwise make the active pill spring after the width.
  const selectItem = setActiveItem;
  const selectItemFromDrawer = useCallback(
    (id: string) => {
      setActiveItem(id);
      closeDrawer();
    },
    [closeDrawer, setActiveItem],
  );

  const handleResizeStart = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startWidth: width, width };
    setDragWidth(width);
  };

  const handleResizeMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current.width = clampWidth(drag.current.startWidth + event.clientX - drag.current.startX);
    setDragWidth(drag.current.width);
  };

  const handleResizeEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const finalWidth = drag.current.width;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragWidth(null);
    commitWidth(finalWidth);
  };

  const handleResizeKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const targets: Record<string, number> = {
      ArrowLeft: width - RESIZE_STEP,
      ArrowRight: width + RESIZE_STEP,
      Home: minSidebarWidth,
      End: maxSidebarWidth,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    commitWidth(targets[event.key]);
  };

  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3";

  const sidebarProps = { brand, navigation, secondaryNavigation, footer: sidebarFooter, activeItemId: activeItem, navigationLabel };

  const renderHeader = (tabList?: ReactNode) => (
    <header className="shrink-0">
      <div className="flex items-center justify-between gap-2 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <DashboardButton
            ref={menuButtonRef}
            variant="secondary"
            size="icon"
            className="@2xl/dashboard-shell:hidden"
            aria-label="Open navigation"
            aria-expanded={isDrawerOpen}
            aria-controls={isDrawerOpen ? drawerId : undefined}
            onClick={() => setIsDrawerOpen(true)}
          >
            <Menu aria-hidden />
          </DashboardButton>
          <Heading id={titleId} className="truncate text-base font-medium leading-none tracking-normal">
            {title}
          </Heading>
          {status && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-(--obsidian-dashboard-shell-border-strong) bg-(--obsidian-dashboard-shell-muted) py-[3px] pl-[3px] pr-[6px] text-xs leading-none">
              <span aria-hidden className={cn("relative flex size-3 items-center justify-center", statusToneClasses[statusTone])}>
                <span className="absolute inset-0 rounded-full bg-current opacity-25" />
                <span className="size-1.5 rounded-full bg-current" />
              </span>
              {status}
            </span>
          )}
        </div>
        {headerActions && <div className="flex shrink-0 items-center gap-2">{headerActions}</div>}
      </div>
      {tabList}
    </header>
  );

  const body = (
    <>
      {(filters || toolbarActions) && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 p-4">
          {filters && <div className="flex min-w-0 flex-wrap items-center gap-2">{filters}</div>}
          {toolbarActions && <div className="ml-auto flex shrink-0 items-center gap-1">{toolbarActions}</div>}
        </div>
      )}
      <div ref={contentRef} className="obsidian-dashboard-shell-scroll min-h-0 flex-1 overflow-auto">
        {children}
      </div>
    </>
  );

  return (
    <div
      ref={rootRef}
      {...props}
      data-resizing={dragWidth !== null ? "" : undefined}
      className={cn(
        "obsidian-dashboard-shell @container/dashboard-shell relative flex h-full min-h-0 w-full overflow-hidden bg-(--obsidian-dashboard-shell-background) text-(--obsidian-dashboard-shell-foreground)",
        className,
      )}
      style={{ "--obsidian-dashboard-shell-sidebar-width": `${width}px`, ...style } as CSSProperties}
    >
      <aside
        id={sidebarId}
        className="relative hidden w-(--obsidian-dashboard-shell-sidebar-width) shrink-0 flex-col border-r border-(--obsidian-dashboard-shell-border) bg-(--obsidian-dashboard-shell-sidebar) @2xl/dashboard-shell:flex"
      >
        <SidebarContent {...sidebarProps} onSelect={selectItem} />
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          aria-controls={sidebarId}
          aria-valuemin={minSidebarWidth}
          aria-valuemax={maxSidebarWidth}
          aria-valuenow={width}
          tabIndex={0}
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
          onDoubleClick={() => commitWidth(defaultSidebarWidth)}
          onKeyDown={handleResizeKey}
          className="group absolute inset-y-0 -right-1 z-10 w-2 cursor-col-resize touch-none outline-none select-none"
        >
          <span
            aria-hidden
            className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors duration-150 group-hover:bg-(--obsidian-dashboard-shell-border-strong) group-focus-visible:w-0.5 group-focus-visible:bg-(--obsidian-dashboard-shell-ring) group-active:bg-(--obsidian-dashboard-shell-ring)"
          />
        </div>
      </aside>

      <section aria-labelledby={titleId} inert={isDrawerOpen} className="flex min-h-0 min-w-0 flex-1 flex-col">
        {tabs?.length ? (
          <TabsPrimitive.Root value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
            {renderHeader(
              <TabsPrimitive.List aria-labelledby={titleId} className="border-b border-(--obsidian-dashboard-shell-border) px-3 pb-2.5">
                <HoverHighlightList className="flex flex-wrap items-center gap-1" highlightClassName="rounded-md bg-(--obsidian-dashboard-shell-hover)">
                  {tabs.map((item) => (
                    <ShellTab key={item.value} item={item} isActive={item.value === activeTab} pillId={tabPillId} />
                  ))}
                </HoverHighlightList>
              </TabsPrimitive.List>,
            )}
            <TabsPrimitive.Content value={activeTab} className="flex min-h-0 flex-1 flex-col outline-none">
              {body}
            </TabsPrimitive.Content>
          </TabsPrimitive.Root>
        ) : (
          <>
            {renderHeader()}
            {body}
          </>
        )}
      </section>

      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            key="drawer"
            className="absolute inset-0 z-30 @2xl/dashboard-shell:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: EASE_OUT }}
          >
            <div aria-hidden className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
            <motion.div
              id={drawerId}
              role="dialog"
              aria-modal="true"
              aria-label={navigationLabel}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.stopPropagation();
                  closeDrawer();
                } else if (event.key === "Tab") {
                  keepFocusInside(event);
                }
              }}
              className="absolute inset-y-0 left-0 flex w-[254px] max-w-[85%] flex-col border-r border-(--obsidian-dashboard-shell-border) bg-(--obsidian-dashboard-shell-sidebar) shadow-[0_16px_40px_rgb(0_0_0/0.35)]"
              initial={{ x: reduceMotion ? 0 : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: reduceMotion ? 0 : "-100%" }}
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: EASE_OUT }}
            >
              <SidebarContent {...sidebarProps} onSelect={selectItemFromDrawer} onClose={closeDrawer} closeButtonRef={closeButtonRef} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


type HoverHighlight = { show: (element: HTMLElement) => void; hide: () => void };

const HoverHighlightContext = createContext<HoverHighlight | null>(null);

/**
 * One hover highlight for a whole list. It glides from item to item after the pointer,
 * and appears in place when the pointer arrives from outside the list.
 */
function HoverHighlightList({
  className,
  highlightClassName = "rounded-lg bg-(--obsidian-dashboard-shell-hover)",
  children,
}: {
  className?: string;
  highlightClassName?: string;
  children: ReactNode;
}) {
  const reduceMotion = !!useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const [isVisible, setIsVisible] = useState(false);
  const isShown = useRef(false);
  const hiddenAt = useRef(0);

  const show = useCallback(
    (element: HTMLElement) => {
      const list = listRef.current;
      if (!list) return;
      // Layout offsets rather than client rects, so a menu that is still scaling in doesn't skew the position.
      let top = 0;
      let left = 0;
      for (let node: HTMLElement | null = element; node && node !== list; node = node.offsetParent as HTMLElement | null) {
        top += node.offsetTop;
        left += node.offsetLeft;
      }
      // Leaving and re-entering quickly still glides, so a pointer that grazes a border doesn't make it blink.
      const glide = !reduceMotion && (isShown.current || performance.now() - hiddenAt.current < 150);
      const moveTo = (value: typeof x, target: number) => (glide ? animate(value, target, FOLLOW_SPRING) : value.jump(target));
      moveTo(x, left);
      moveTo(y, top);
      moveTo(width, element.offsetWidth);
      moveTo(height, element.offsetHeight);
      isShown.current = true;
      setIsVisible(true);
    },
    [height, reduceMotion, width, x, y],
  );

  const hide = useCallback(() => {
    if (!isShown.current) return;
    isShown.current = false;
    hiddenAt.current = performance.now();
    setIsVisible(false);
  }, []);

  const highlight = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <HoverHighlightContext.Provider value={highlight}>
      <div ref={listRef} className={cn("relative", className)} onPointerLeave={hide}>
        <motion.span
          aria-hidden
          className={cn("pointer-events-none absolute left-0 top-0", highlightClassName)}
          style={{ x, y, width, height }}
          initial={false}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: isVisible ? 0.12 : 0.15, ease: "easeOut" }}
        />
        {children}
      </div>
    </HoverHighlightContext.Provider>
  );
}

type SidebarContentProps = {
  brand: DashboardShellProps["brand"];
  navigation: DashboardShellNavSection[];
  secondaryNavigation?: DashboardShellNavItem[];
  footer?: ReactNode;
  activeItemId?: string;
  navigationLabel: string;
  onSelect: (id: string) => void;
  onClose?: () => void;
  closeButtonRef?: Ref<HTMLButtonElement>;
};

const SidebarContent = memo(function SidebarContent({
  brand,
  navigation,
  secondaryNavigation,
  footer,
  activeItemId,
  navigationLabel,
  onSelect,
  onClose,
  closeButtonRef,
}: SidebarContentProps) {
  // Each sidebar instance (docked and drawer) needs its own pill, or the pill would jump between them.
  const pillId = useId();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-(--obsidian-dashboard-shell-border) bg-(--obsidian-dashboard-shell-panel) p-3">
        {brand.logo && <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden">{brand.logo}</span>}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="block truncate text-sm font-medium leading-none tracking-[-0.01em]">{brand.name}</span>
          {brand.description && (
            <span className="block truncate text-xs leading-none text-(--obsidian-dashboard-shell-text-subtle)">{brand.description}</span>
          )}
        </div>
        {onClose && (
          <DashboardButton ref={closeButtonRef} variant="ghost" size="icon" aria-label="Close navigation" onClick={onClose}>
            <X aria-hidden />
          </DashboardButton>
        )}
      </div>

      <motion.nav
        layoutScroll
        aria-label={navigationLabel}
        className="obsidian-dashboard-shell-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
      >
        <HoverHighlightList>
          {navigation.map((section, index) => (
            <NavSection
              key={section.id}
              title={section.title}
              items={section.items}
              activeItemId={activeItemId}
              pillId={pillId}
              onSelect={onSelect}
              className={index < navigation.length - 1 ? "border-b border-(--obsidian-dashboard-shell-border)" : undefined}
            />
          ))}
        </HoverHighlightList>
      </motion.nav>

      {secondaryNavigation && secondaryNavigation.length > 0 && (
        <HoverHighlightList className="shrink-0 border-t border-(--obsidian-dashboard-shell-border)">
          <NavSection items={secondaryNavigation} activeItemId={activeItemId} pillId={pillId} onSelect={onSelect} isQuiet />
        </HoverHighlightList>
      )}

      {footer && (
        <div className="shrink-0 border-t border-(--obsidian-dashboard-shell-border) bg-(--obsidian-dashboard-shell-panel) p-4">{footer}</div>
      )}
    </div>
  );
});

type NavSectionProps = {
  title?: string;
  items: DashboardShellNavItem[];
  activeItemId?: string;
  pillId: string;
  onSelect: (id: string) => void;
  isQuiet?: boolean;
  className?: string;
};

function NavSection({ title, items, activeItemId, pillId, onSelect, isQuiet = false, className }: NavSectionProps) {
  const titleId = useId();

  return (
    <div className={cn("flex flex-col gap-1 p-3", className)}>
      {title && (
        <span id={titleId} className="block py-1 text-xs font-medium uppercase leading-none tracking-[1px] text-(--obsidian-dashboard-shell-text-subtle)">
          {title}
        </span>
      )}
      <ul aria-labelledby={title ? titleId : undefined} className="flex flex-col gap-px">
        {items.map((item) => (
          <NavItem key={item.id} item={item} isActive={item.id === activeItemId} isQuiet={isQuiet} pillId={pillId} onSelect={onSelect} />
        ))}
      </ul>
    </div>
  );
}

type NavItemProps = {
  item: DashboardShellNavItem;
  isActive: boolean;
  isQuiet: boolean;
  pillId: string;
  onSelect: (id: string) => void;
};

function NavItem({ item, isActive, isQuiet, pillId, onSelect }: NavItemProps) {
  const highlight = useContext(HoverHighlightContext);
  const reduceMotion = useReducedMotion();
  const Icon = item.icon;

  const shared = {
    "data-active": isActive,
    "aria-current": isActive ? ("page" as const) : undefined,
    onClick: () => onSelect(item.id),
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== "touch") highlight?.show(event.currentTarget);
    },
    className: cn(
      "group relative flex h-8 w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2 text-sm font-medium leading-none outline-none",
      "transition-[color,scale] duration-150 hover:text-(--obsidian-dashboard-shell-foreground) active:scale-[0.98] active:duration-75 focus-visible:ring-2 focus-visible:ring-(--obsidian-dashboard-shell-ring) data-[active=true]:text-(--obsidian-dashboard-shell-foreground)",
      isQuiet ? "text-(--obsidian-dashboard-shell-text-subtle)" : "text-(--obsidian-dashboard-shell-text-muted)",
    ),
  };

  const content = (
    <>
      {isActive && (
        <motion.span
          layoutId={pillId}
          aria-hidden
          className="absolute inset-0 rounded-lg bg-(--obsidian-dashboard-shell-muted) shadow-(--obsidian-dashboard-shell-control-shadow)"
          transition={reduceMotion ? { duration: 0 } : PILL_SPRING}
        />
      )}
      {Icon ? (
        <Icon aria-hidden className="relative size-4 shrink-0 text-(--obsidian-dashboard-shell-icon)" />
      ) : item.color ? (
        <span aria-hidden className="relative flex size-4 shrink-0 items-center justify-center">
          <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
        </span>
      ) : null}
      <span className="relative min-w-0 flex-1 truncate text-left">{item.label}</span>
      {item.count !== undefined && (
        <span className="relative inline-flex h-4 min-w-6 shrink-0 items-center justify-center rounded-[5px] border-[0.5px] border-(--obsidian-dashboard-shell-border-strong) bg-(--obsidian-dashboard-shell-muted) px-1 text-[11px] font-normal leading-none tabular-nums text-(--obsidian-dashboard-shell-text-muted)">
          {item.count}
        </span>
      )}
    </>
  );

  return (
    <li>
      {item.href ? (
        <a href={item.href} {...shared}>
          {content}
        </a>
      ) : (
        <button type="button" {...shared}>
          {content}
        </button>
      )}
    </li>
  );
}

type ShellTabProps = { item: DashboardShellTab; isActive: boolean; pillId: string };

function ShellTab({ item, isActive, pillId }: ShellTabProps) {
  const highlight = useContext(HoverHighlightContext);
  const reduceMotion = useReducedMotion();

  return (
    <TabsPrimitive.Trigger
      value={item.value}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") highlight?.show(event.currentTarget);
      }}
      className="group relative grid h-7 cursor-pointer select-none place-items-center rounded-md px-2.5 text-xs leading-none text-(--obsidian-dashboard-shell-text-subtle) outline-none transition-[color,scale] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] hover:text-(--obsidian-dashboard-shell-foreground) focus-visible:ring-2 focus-visible:ring-(--obsidian-dashboard-shell-ring) active:scale-[0.97] active:duration-75 data-[state=active]:text-(--obsidian-dashboard-shell-foreground)"
    >
      {isActive && (
        <motion.span
          layoutId={pillId}
          aria-hidden
          className="absolute inset-0 rounded-md bg-(--obsidian-dashboard-shell-muted) shadow-(--obsidian-dashboard-shell-control-shadow)"
          transition={reduceMotion ? { duration: 0 } : PILL_SPRING}
        />
      )}
      {/* The hidden bold copy reserves the active width so the row never shifts. */}
      <span aria-hidden className="invisible relative col-start-1 row-start-1 font-medium">
        {item.label}
      </span>
      <span className="relative col-start-1 row-start-1 group-data-[state=active]:font-medium">{item.label}</span>
    </TabsPrimitive.Trigger>
  );
}
```

### lib/utils.ts

Installation target: `@lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| brand | { name: string; description?: string; logo?: ReactNode } | - | Product name, tagline, and logo at the top of the sidebar. |
| navigation | DashboardShellNavSection[] | - | Sidebar sections, each with an optional title and its items. |
| secondaryNavigation | DashboardShellNavItem[] | - | Quieter items pinned under the main navigation. |
| sidebarFooter | ReactNode | - | Content pinned to the bottom of the sidebar. |
| activeItemId | string | - | Controlled active navigation item. |
| defaultActiveItemId | string | First item | Initial active item when uncontrolled. |
| onActiveItemChange | (id: string) => void | - | Called when an item is chosen. |
| title | ReactNode | - | Page title in the header. |
| headingLevel | 1 \| 2 \| 3 | 1 | Heading element for the title, to fit the page outline. |
| status | string | - | Short label in a pill beside the title. |
| statusTone | 'success' \| 'warning' \| 'neutral' | 'success' | Color of the status dot. |
| headerActions | ReactNode | - | Buttons on the right of the header. |
| tabs | { value: string; label: string }[] | - | Tabs under the header. |
| tab | string | - | Controlled active tab. |
| defaultTab | string | First tab | Initial tab when uncontrolled. |
| onTabChange | (value: string) => void | - | Called when the tab changes. |
| filters | ReactNode | - | Left side of the toolbar. |
| toolbarActions | ReactNode | - | Right side of the toolbar. |
| children | ReactNode | - | Page content in the scrolling area. |
| sidebarWidth | number | - | Controlled sidebar width in pixels. |
| defaultSidebarWidth | number | 200 | Initial width, and the width a double-click resets to. |
| onSidebarWidthChange | (width: number) => void | - | Called when a drag ends or the width changes from the keyboard. |
| minSidebarWidth | number | 180 | Narrowest sidebar width in pixels. |
| maxSidebarWidth | number | 400 | Widest sidebar width in pixels. |
| navigationLabel | string | Navigation | Accessible name for the navigation and the drawer. |
| className | string | - | Additional classes for the root element. |

## Navigation item fields

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| id | string | - | Unique, stable identifier. |
| label | string | - | Visible text. |
| icon | ElementType | - | A duo-icons or lucide icon, or any component that accepts className. |
| color | string | - | Shows a colored dot when there is no icon. |
| count | number | - | Number shown in a badge on the right. |
| href | string | - | Renders the item as a link. |
