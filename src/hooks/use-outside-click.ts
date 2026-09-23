"use client";

import { useEffect, type RefObject } from 'react'

export const useOutsideClick = (
    ref: RefObject<HTMLElement | null>,
    callback: (event: PointerEvent) => void
) => {
    useEffect(() => {
        const listener = (event: PointerEvent) => {
            if (!ref.current || !(event.target instanceof Node) || ref.current.contains(event.target)) {
                return
            }
            callback(event)
        }

        document.addEventListener('pointerdown', listener)

        return () => {
            document.removeEventListener('pointerdown', listener)
        }
    }, [ref, callback])
}
