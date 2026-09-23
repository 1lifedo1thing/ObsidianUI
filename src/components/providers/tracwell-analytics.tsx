"use client";

import { useEffect } from "react";
import { initializeTracwell } from "@/lib/tracwell";

export function TracwellAnalytics() {
  useEffect(() => {
    initializeTracwell();
  }, []);

  return null;
}
