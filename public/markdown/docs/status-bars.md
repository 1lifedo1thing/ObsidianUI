# ObsidianUI — Status Bars

[Canonical page](https://www.obsidianui.dev/docs/status-bars) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

A daily status strip for a service. Each bar is one day, colored by whether the service was operational, degraded, or down. Hover, tap, or use the arrow keys to see that day's uptime and incidents. The uptime total animates as the range changes.

The preview starts on August 1 and adds a new bar each day at UTC midnight.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/status-bars)

```tsx
import { fillStatusDays, StatusBars, useStatusToday } from '@/components/block/status-bars'

const incidents = [
{ date: '2026-08-19', downtime: 23, incidents: [{ title: 'Registry deploy rolled back', minutes: 23 }] },
{ date: '2026-09-21', degraded: 6, incidents: [{ title: 'Elevated error rate', minutes: 6 }] },
]

export function Demo() {
const today = useStatusToday()
if (!today) return <StatusBars label="Component registry" days={[]} loading />

const days = fillStatusDays('2026-08-01', today, incidents)
return <StatusBars label="Component registry" days={days} maxDays={days.length} />
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/status-bars.json"
```

## Usage

```tsx
import { StatusBars } from '@/components/block/status-bars'

<StatusBars
  label="API"
  days={[
    { date: '2026-09-20' },
    { date: '2026-09-21', degraded: 6, incidents: [{ title: 'Elevated error rate', minutes: 6 }] },
  ]}
/>
```

Pass one entry per day, oldest first; the last entry is today. Downtime minutes count against uptime, and degraded minutes are shown without reducing it.

## Keep the range current

`useStatusToday()` returns today's UTC date and updates at midnight, so the strip gains a new day while the page stays open. It returns `null` during server rendering; show the `loading` state until it has a value.

`fillStatusDays(from, to, entries)` builds every day in the range and marks days without an entry as operational:

```tsx
const today = useStatusToday()
const days = today ? fillStatusDays('2026-08-01', today, incidents) : []
```

## Customize colors

Override the status colors on the component or any parent:

```css
.obsidian-status-bars {
  --obsidian-status-up: #22c55e;
  --obsidian-status-degraded: #f59e0b;
  --obsidian-status-down: #ef4444;
}
```

## Install manually — complete source

Download the complete manifest: [status-bars.json](https://www.obsidianui.dev/r/status-bars.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install @number-flow/react clsx motion tailwind-merge
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/status-bars.css

Installation target: `@components/block/status-bars.css`

```css
.obsidian-status-bars {
  --obsidian-status-up: oklch(0.7 0.16 152);
  --obsidian-status-degraded: oklch(0.8 0.15 78);
  --obsidian-status-down: oklch(0.63 0.21 25);
  --obsidian-status-empty: color-mix(in oklab, currentColor 9%, transparent);
}

.dark .obsidian-status-bars {
  --obsidian-status-up: oklch(0.72 0.15 152);
  --obsidian-status-degraded: oklch(0.82 0.14 80);
  --obsidian-status-down: oklch(0.66 0.2 25);
  --obsidian-status-empty: color-mix(in oklab, currentColor 11%, transparent);
}

.obsidian-status-bars__ping {
  animation: obsidian-status-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.obsidian-status-bars__pulse {
  animation: obsidian-status-pulse 1.6s ease-in-out infinite;
}

@keyframes obsidian-status-ping {
  0% {
    opacity: 0.55;
    transform: scale(1);
  }

  75%,
  100% {
    opacity: 0;
    transform: scale(2.2);
  }
}

@keyframes obsidian-status-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }
}

@media (prefers-reduced-motion: reduce) {
  .obsidian-status-bars__ping,
  .obsidian-status-bars__pulse {
    animation: none;
  }
}
```

### components/block/status-bars.tsx

Installation target: `@components/block/status-bars.tsx`

```tsx
"use client";

import NumberFlow from "@number-flow/react";
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ComponentProps, PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";
import "./status-bars.css";

export type StatusLevel = "up" | "degraded" | "down" | "none";

export type StatusIncident = {
  title: string;
  /** Minutes it lasted. */
  minutes?: number;
  status?: "degraded" | "down";
};

export type StatusDay = {
  /** ISO date, for example "2026-09-21". */
  date: string;
  /** Overrides the status derived from the minutes below. "none" means no data for the day. */
  status?: StatusLevel;
  /** Minutes of full outage. Counts against uptime. */
  downtime?: number;
  /** Minutes of degraded service. Shown, but does not count against uptime. */
  degraded?: number;
  /** Overrides the day's uptime percentage (0–100). */
  uptime?: number;
  incidents?: StatusIncident[];
};

const DAY_MS = 86_400_000;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const TOOLTIP_SPRING = { type: "spring", stiffness: 520, damping: 42, mass: 0.6 } as const;

const parseIsoDate = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
export const toIsoDate = (time: number) => new Date(time).toISOString().slice(0, 10);

/** Builds one entry per UTC day from `from` to `to`, inclusive. Days without an entry count as operational. */
export function fillStatusDays(from: string, to: string, entries: StatusDay[] = []): StatusDay[] {
  const byDate = new Map(entries.map((day) => [day.date, day]));
  const days: StatusDay[] = [];
  for (let time = parseIsoDate(from), end = parseIsoDate(to); time <= end; time += DAY_MS) {
    const date = toIsoDate(time);
    days.push(byDate.get(date) ?? { date });
  }
  return days;
}

function subscribeToDayChange(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    timer = setTimeout(() => {
      onChange();
      schedule();
    }, DAY_MS - (Date.now() % DAY_MS) + 1_000);
  };
  // Background tabs throttle timers, so a returning visitor re-checks the date.
  const onVisible = () => {
    if (document.visibilityState === "visible") onChange();
  };
  schedule();
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

/** Today's UTC date as an ISO string. It is `null` during server rendering and rolls over at UTC midnight. */
export function useStatusToday(): string | null {
  return useSyncExternalStore(subscribeToDayChange, () => toIsoDate(Date.now()), () => null);
}

const subscribeToNothing = () => () => {};
function useLocale(locale?: string) {
  const detected = useSyncExternalStore(subscribeToNothing, () => Intl.DateTimeFormat().resolvedOptions().locale, () => "en-US");
  return locale ?? detected;
}

export function getDayStatus(day: StatusDay): StatusLevel {
  if (day.status) return day.status;
  if ((day.downtime ?? 0) > 0) return "down";
  if ((day.degraded ?? 0) > 0) return "degraded";
  return "up";
}

export const getDayUptime = (day: StatusDay) => day.uptime ?? Math.max(0, 100 - ((day.downtime ?? 0) / 1440) * 100);

const BAR: Record<StatusLevel, string> = {
  up: "bg-(--obsidian-status-up)/75",
  degraded: "bg-(--obsidian-status-degraded)",
  down: "bg-(--obsidian-status-down)",
  none: "bg-(--obsidian-status-empty)",
};
const DOT: Record<StatusLevel, string> = {
  up: "bg-(--obsidian-status-up)",
  degraded: "bg-(--obsidian-status-degraded)",
  down: "bg-(--obsidian-status-down)",
  none: "bg-muted-foreground/50",
};
const WORD: Record<StatusLevel, string> = { up: "Operational", degraded: "Degraded", down: "Outage", none: "No data" };
const CURRENT: Record<StatusLevel, string> = { up: "Operational", degraded: "Degraded performance", down: "Outage", none: "No data" };

const formatDuration = (minutes: number) =>
  minutes >= 60 ? `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ""}` : `${Math.max(1, Math.round(minutes))}m`;

export type StatusBarsProps = Omit<ComponentProps<"div">, "children"> & {
  /** One entry per day, oldest first. The last entry is today. */
  days: StatusDay[];
  /** The service or component being tracked. */
  label: string;
  /** Status shown in the header. Defaults to today's. */
  current?: StatusLevel;
  /** Most days to show. Narrow containers step down to 60, then 30. */
  maxDays?: number;
  /** Narrowest a bar may draw, in pixels, before fewer days are shown. */
  minBarWidth?: number;
  /** Hides the name, status and axis, for a denser list. */
  compact?: boolean;
  loading?: boolean;
  locale?: string;
};

export function StatusBars({
  days,
  label,
  current,
  maxDays = 90,
  minBarWidth = 3,
  compact = false,
  loading = false,
  locale: localeProp,
  className,
  ...rest
}: StatusBarsProps) {
  const locale = useLocale(localeProp);
  const reduce = useReducedMotion();
  const uid = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [pinned, setPinned] = useState(false);
  const [keyboard, setKeyboard] = useState(false);

  useEffect(() => {
    const element = wrap.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const gap = 2;
  const fits = width ? Math.floor((width + gap) / (minBarWidth + gap)) : maxDays;
  const count = [maxDays, 60, 30].filter((n) => n <= maxDays).find((n) => n <= fits) ?? Math.max(1, fits);
  const shown = useMemo(() => {
    const tail = days.slice(-count);
    // Pad the front with empty days so a new service still reads as a full range.
    const pad = Array.from({ length: Math.max(0, count - tail.length) }, (): StatusDay => ({ date: "", status: "none" }));
    return [...pad, ...tail];
  }, [days, count]);

  const measured = shown.filter((day) => day.date && getDayStatus(day) !== "none");
  const uptime = measured.length ? measured.reduce((sum, day) => sum + getDayUptime(day), 0) / measured.length : null;
  const today = days.length ? getDayStatus(days[days.length - 1]) : "none";
  const now = current ?? today;

  const dateFormat = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }), [locale]);
  const longFormat = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }), [locale]);
  const axisFormat = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" }), [locale]);
  const percentFormat = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2, minimumFractionDigits: 0 }), [locale]);
  const formatDate = (iso: string, format: Intl.DateTimeFormat) => (iso ? format.format(parseIsoDate(iso)) : "");
  const percent = (value: number) => `${percentFormat.format(Math.floor(value * 100) / 100)}%`;
  const firstDate = shown[0]?.date;

  const describe = (day: StatusDay) => {
    if (!day.date) return "No data";
    const status = getDayStatus(day);
    const parts = [formatDate(day.date, longFormat), WORD[status]];
    if (status !== "none") parts.push(`${percent(getDayUptime(day))} uptime`);
    for (const incident of day.incidents ?? []) {
      parts.push(incident.minutes ? `${incident.title} for ${formatDuration(incident.minutes)}` : incident.title);
    }
    return parts.join(", ");
  };

  // One tooltip glides between bars and stays inside the strip at both ends.
  const tooltipX = useMotionValue(0);
  const tooltipShift = useTransform(tooltipX, (x) => `${-Math.min(1, Math.max(0, x / (width || 1))) * 100}%`);
  const visible = useRef(false);
  const point = (index: number, instant: boolean) => {
    const x = ((index + 0.5) * (width + gap)) / shown.length - gap / 2;
    if (instant || !visible.current || reduce) tooltipX.jump(x);
    else animate(tooltipX, x, TOOLTIP_SPRING);
    visible.current = true;
    setActive(index);
  };
  const hide = () => {
    visible.current = false;
    setActive(null);
    setPinned(false);
    setKeyboard(false);
  };
  const indexAt = (event: ReactPointerEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return Math.min(shown.length - 1, Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * shown.length)));
  };

  // A tap pins the tooltip on touch screens; the next tap elsewhere releases it.
  useEffect(() => {
    if (!pinned) return;
    const away = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) {
        visible.current = false;
        setActive(null);
        setPinned(false);
      }
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [pinned]);

  const tipDay = active !== null ? shown[active] : null;
  const tipStatus = tipDay?.date ? getDayStatus(tipDay) : "none";
  const cellId = (index: number) => `${uid}-day-${index}`;

  return (
    <div
      data-slot="status-bars"
      data-state={loading ? "loading" : now}
      aria-busy={loading || undefined}
      className={cn("obsidian-status-bars flex w-full min-w-0 flex-col text-foreground", className)}
      {...rest}
    >
      {!compact && (
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <span className="min-w-0 truncate text-[13px] font-medium tracking-[-0.01em]">{label}</span>
          <span className="flex shrink-0 items-center gap-1.5 text-[12px] text-muted-foreground">
            <span aria-hidden className="relative grid size-2 place-items-center">
              {!loading && (now === "down" || now === "degraded") && (
                <span className={cn("obsidian-status-bars__ping absolute inset-0 rounded-full", DOT[now])} />
              )}
              <span className={cn("size-1.5 rounded-full", loading ? "bg-muted-foreground/50" : DOT[now])} />
            </span>
            {loading ? "Checking…" : CURRENT[now]}
          </span>
        </div>
      )}

      <div
        ref={wrap}
        className="relative"
        // Listening here rather than on the strip keeps the tooltip open while the cursor moves onto it.
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse" && !pinned && !keyboard) hide();
        }}
      >
        <div
          role="grid"
          aria-label={`${label}, last ${count} days${uptime !== null ? `, ${percent(uptime)} uptime` : ""}`}
          aria-readonly
          aria-activedescendant={keyboard && active !== null ? cellId(active) : undefined}
          tabIndex={loading ? -1 : 0}
          data-hovering={active !== null || undefined}
          onPointerMove={(event) => {
            if (loading || event.pointerType !== "mouse" || pinned) return;
            const index = indexAt(event);
            if (index !== active) point(index, false);
          }}
          onPointerDown={(event) => {
            if (loading || event.pointerType === "mouse") return;
            const index = indexAt(event);
            if (pinned && index === active) return hide();
            point(index, true);
            setPinned(true);
          }}
          onFocus={(event) => {
            if (!event.currentTarget.matches(":focus-visible") || loading) return;
            setKeyboard(true);
            point(active ?? shown.length - 1, true);
          }}
          onBlur={hide}
          onKeyDown={(event) => {
            if (loading) return;
            if (event.key === "Escape") return hide();
            const last = shown.length - 1;
            const from = active ?? last;
            const to =
              event.key === "ArrowLeft" ? Math.max(0, from - 1)
              : event.key === "ArrowRight" ? Math.min(last, from + 1)
              : event.key === "Home" ? 0
              : event.key === "End" ? last
              : event.key === "PageUp" ? Math.max(0, from - 7)
              : event.key === "PageDown" ? Math.min(last, from + 7)
              : null;
            if (to === null) return;
            event.preventDefault();
            setKeyboard(true);
            point(to, true);
          }}
          className={cn(
            "group/strip flex h-8 rounded-[3px] outline-none",
            "focus-visible:outline-1 focus-visible:outline-offset-[3px] focus-visible:outline-ring focus-visible:outline-solid",
          )}
          style={{ gap }}
        >
          <div role="row" className="contents">
            {shown.map((day, index) => {
              const status = day.date ? getDayStatus(day) : "none";
              return (
                <div
                  key={day.date || `pad-${index}`}
                  id={cellId(index)}
                  role="gridcell"
                  aria-label={describe(day)}
                  data-status={status}
                  data-active={active === index || undefined}
                  className={cn(
                    "min-w-0 flex-1 origin-bottom rounded-[2px] transition-[opacity,scale] duration-150 ease-out",
                    loading ? "obsidian-status-bars__pulse bg-(--obsidian-status-empty)" : BAR[status],
                    // Pointing at one day quiets the rest so its colour reads against them.
                    "group-data-[hovering]/strip:opacity-35 data-[active]:opacity-100 data-[active]:scale-y-[1.08] motion-reduce:data-[active]:scale-y-100",
                  )}
                />
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {tipDay && !loading && (
            <motion.div
              key="tip"
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-20"
              style={{ x: tooltipX }}
              initial={{ opacity: 0, y: reduce ? 0 : 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
              transition={{ duration: 0.14, ease: EASE_OUT }}
            >
              <motion.div className="pointer-events-auto -translate-y-full pb-2.5" style={{ x: tooltipShift }}>
                <div className="w-max max-w-64 rounded-lg border border-border bg-popover px-2.5 py-2 text-[12px] leading-4 text-popover-foreground shadow-lg">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-medium">{tipDay.date ? formatDate(tipDay.date, dateFormat) : "Before tracking"}</span>
                    {tipStatus !== "none" && (
                      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{percent(getDayUptime(tipDay))}</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                    <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", DOT[tipStatus])} />
                    {WORD[tipStatus]}
                    {tipStatus === "down" && tipDay.downtime && !tipDay.incidents?.length ? (
                      <span className="text-muted-foreground/80">· {formatDuration(tipDay.downtime)} down</span>
                    ) : null}
                    {tipStatus === "degraded" && tipDay.degraded && !tipDay.incidents?.length ? (
                      <span className="text-muted-foreground/80">· {formatDuration(tipDay.degraded)}</span>
                    ) : null}
                  </div>
                  {tipStatus === "up" && !tipDay.incidents?.length && <div className="mt-1 text-muted-foreground/80">No incidents</div>}
                  {tipDay.incidents?.map((incident, index) => (
                    <div key={index} className="mt-1.5 border-t border-border pt-1.5 text-muted-foreground first-of-type:mt-2">
                      {incident.title}
                      {incident.minutes ? <span className="tabular-nums text-muted-foreground/80"> · {formatDuration(incident.minutes)}</span> : null}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!compact && (
        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground/80">
          <span className="shrink-0 tabular-nums">{firstDate ? formatDate(firstDate, axisFormat) : `${count} days ago`}</span>
          <span aria-hidden className="h-px flex-1 bg-border" />
          <span className="shrink-0 tabular-nums text-muted-foreground">
            {loading ? (
              "Loading…"
            ) : uptime === null ? (
              "No data yet"
            ) : (
              <>
                <NumberFlow
                  value={Math.floor(uptime * 100) / 10000}
                  locales={locale}
                  format={{ style: "percent", maximumFractionDigits: 2 }}
                  animated={!reduce}
                  willChange
                />{" "}
                uptime
              </>
            )}
          </span>
          <span aria-hidden className="h-px flex-1 bg-border" />
          <span className="shrink-0">Today</span>
        </div>
      )}
    </div>
  );
}

export default StatusBars;
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
| days | StatusDay[] | - | One entry per day, oldest first. The last entry is today. |
| label | string | - | Name of the service being tracked. |
| current | 'up' \| 'degraded' \| 'down' \| 'none' | Today's status | Status shown in the header. |
| maxDays | number | 90 | Most days to show. Narrow containers step down to 60, then 30. |
| minBarWidth | number | 3 | Narrowest bar, in pixels, before fewer days are shown. |
| compact | boolean | false | Hides the name, status, and axis for dense lists. |
| loading | boolean | false | Shows a pulsing placeholder while data loads. |
| locale | string | Browser locale | Locale for dates and percentages. |
| className | string | - | Additional classes for the root element. |
