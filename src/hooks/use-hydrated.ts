"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/** Keep the server and first client render aligned before reading the theme. */
export function useHydrated() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
