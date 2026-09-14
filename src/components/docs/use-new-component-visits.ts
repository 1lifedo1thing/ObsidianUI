"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { newEffects } from "@/components/catalog/new-effects";

const STORAGE_KEY = "obsidianui:seen-new-components:v1";
const EMPTY_SNAPSHOT = "[]";
const newComponentHrefs = new Set<string>(newEffects.map(({ slug }) => `/docs/${slug}`));
const listeners = new Set<() => void>();
const getServerSnapshot = () => null;
let snapshot = EMPTY_SNAPSHOT;
let storedValue: string | null | undefined;

function normalizeStoredVisits(value: string | null): string {
  try {
    const parsed: unknown = value === null ? [] : JSON.parse(value);
    if (!Array.isArray(parsed)) return EMPTY_SNAPSHOT;
    return JSON.stringify([...new Set(parsed.filter((href): href is string => (
      typeof href === "string" && newComponentHrefs.has(href)
    )))].sort());
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

function getSnapshot(): string {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value !== storedValue) {
      storedValue = value;
      snapshot = normalizeStoredVisits(value);
    }
  } catch {
    // Keep visits for this page session when browser storage is unavailable.
  }
  return snapshot;
}

function emitChange() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  try {
    if (event.storageArea && event.storageArea !== window.localStorage) return;
  } catch {
    // A storage event can still provide the latest value when reads are blocked.
  }
  storedValue = event.key === null ? null : event.newValue;
  snapshot = normalizeStoredVisits(storedValue);
  emitChange();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function markSeen(href: string) {
  if (!newComponentHrefs.has(href)) return;
  const seen = new Set<string>(JSON.parse(getSnapshot()));
  if (seen.has(href)) return;
  seen.add(href);
  snapshot = JSON.stringify([...seen].sort());
  try {
    window.localStorage.setItem(STORAGE_KEY, snapshot);
    storedValue = snapshot;
  } catch {
    // Preserve the in-memory snapshot if persistence is denied or full.
  }
  emitChange();
}

/** New markers are dismissed only by an explicit component-link activation. */
export function useNewComponentVisits() {
  const visits = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const seen = useMemo(() => new Set<string>(JSON.parse(visits ?? EMPTY_SNAPSHOT)), [visits]);
  const isNew = useCallback((href: string) => visits !== null && newComponentHrefs.has(href) && !seen.has(href), [seen, visits]);
  return { isNew, markSeen };
}
