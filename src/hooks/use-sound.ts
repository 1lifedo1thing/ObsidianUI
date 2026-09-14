"use client";

import { useCallback, useEffect, useRef } from "react";


export function useSound(url: string) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) {
      console.warn("Web Audio API is not supported in this browser.");
      return;
    }

    const audioCtx = new AudioContextClass();
    const controller = new AbortController();
    let disposed = false;
    audioCtxRef.current = audioCtx;
    bufferRef.current = null;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Sound request failed (${res.status})`);
        return res.arrayBuffer();
      })
      .then((data) => audioCtx.decodeAudioData(data))
      .then((decoded) => {
        if (!disposed) bufferRef.current = decoded;
      })
      .catch((err) => {
        if (!disposed) console.warn(`Failed to load click sound from ${url}:`, err);
      });
    return () => {
      disposed = true;
      controller.abort();
      audioCtxRef.current = null;
      bufferRef.current = null;
      void audioCtx.close().catch(() => {});
    };
  }, [url]);

  const play = useCallback(async () => {
    const context = audioCtxRef.current;
    const buffer = bufferRef.current;
    if (!context || !buffer || context.state === "closed") return;
    try {
      if (context.state === "suspended") await context.resume();
      if (audioCtxRef.current !== context) return;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.onended = () => source.disconnect();
      source.start(0);
    } catch {
      // Audio may be blocked by browser policy or disposed during navigation.
    }
  }, []);

  return play;
}
