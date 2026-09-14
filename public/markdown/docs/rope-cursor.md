# ObsidianUI — Rope Cursor

[Canonical page](https://www.obsidianui.dev/docs/rope-cursor) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

A smooth segmented rope follows the pointer with progressively delayed motion.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/rope-cursor)

Move across the preview to draw a flowing rope trail.

```tsx
"use client";
import { RopeCursor } from "@/components/block/rope-cursor";

export default function Demo() {
  return <RopeCursor height={400} ropeColor="#d0b88c" ropeWidth={3} className="bg-[#151714]">
    <p className="pointer-events-none grid h-full place-items-center text-3xl text-[#d0b88c]">Follow your curiosity.</p>
  </RopeCursor>;
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/rope-cursor.json"
```

## Usage

```jsx
"use client";
import { RopeCursor } from "@/components/block/rope-cursor";

export default function Demo() {
  return <RopeCursor height={400} ropeColor="#d0b88c" ropeWidth={3} className="bg-[#151714]">
    <p className="pointer-events-none grid h-full place-items-center text-3xl text-[#d0b88c]">Follow your curiosity.</p>
  </RopeCursor>;
}
```

## Install manually — complete source

Download the complete manifest: [rope-cursor.json](https://www.obsidianui.dev/r/rope-cursor.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install clsx gsap motion tailwind-merge
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/rope-cursor.jsx

Installation target: `@components/block/rope-cursor.jsx`

```jsx
"use client"

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

/** @param {{ ropeColor?: string, ropeWidth?: number, ropeOpacity?: number, segmentLength?: number, segmentCount?: number, children?: import("react").ReactNode, className?: string, height?: import("react").CSSProperties["height"], style?: import("react").CSSProperties }} props */
export function RopeCursor({
  children, className, height = 400, style,
  ropeColor = '#bda985',
  ropeWidth = 2,
  ropeOpacity = 0.6,
  segmentLength = 0,
  segmentCount = 8,
} = {}) {
  const svgRef = useRef(null)
  const pathRef = useRef(null)
  const ropeSegments = useRef([])
  const mousePosition = useRef({ x: null, y: null })
  const [isVisible, setIsVisible] = useState(false)
  const motionEnabled = !useReducedMotion()
  const containerRef = useRef(null)


  useEffect(() => {
    if (!motionEnabled) return

    const container = containerRef.current
    if (!container) return
    let isInitialized = false
    let animationFrameId = null

    const initializeRopeSegments = (startX, startY) => {
      ropeSegments.current = Array.from({ length: segmentCount }, () => ({
        x: startX,
        y: startY
      }))
      isInitialized = true
      setIsVisible(true)
    }

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect()
      mousePosition.current.x = event.clientX - rect.left
      mousePosition.current.y = event.clientY - rect.top

      if (!isInitialized && mousePosition.current.x !== null) {
        initializeRopeSegments(mousePosition.current.x, mousePosition.current.y)
      }
    }

    const updateLeadingSegment = (segments, targetX, targetY) => {
      gsap.to(segments[0], {
        x: targetX,
        y: targetY,
        duration: 0.05,
        ease: 'power2.out', overwrite: true
      })
    }

    const updateFollowingSegments = (segments) => {
      for (let i = 1;i < segmentCount;i++) {
        const previousSegment = segments[i - 1]
        const currentSegment = segments[i]

        const deltaX = previousSegment.x - currentSegment.x
        const deltaY = previousSegment.y - currentSegment.y
        const distanceBetweenSegments = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

        if (distanceBetweenSegments > segmentLength) {
          const angleToTarget = Math.atan2(deltaY, deltaX)
          const constrainedX = previousSegment.x - Math.cos(angleToTarget) * segmentLength
          const constrainedY = previousSegment.y - Math.sin(angleToTarget) * segmentLength

          gsap.to(currentSegment, {
            x: constrainedX,
            y: constrainedY,
            duration: 0.15 + i * 0.01,
            ease: 'power2.out', overwrite: true
          })
        }
      }
    }

    const generateSmoothPath = (segments) => {
      let pathData = `M ${segments[0].x} ${segments[0].y}`

      for (let i = 1;i < segmentCount - 1;i++) {
        const controlPointX = (segments[i].x + segments[i + 1].x) / 2
        const controlPointY = (segments[i].y + segments[i + 1].y) / 2
        pathData += ` Q ${segments[i].x} ${segments[i].y} ${controlPointX} ${controlPointY}`
      }

      const lastSegment = segments[segmentCount - 1]
      pathData += ` L ${lastSegment.x} ${lastSegment.y}`

      return pathData
    }

    const animate = () => {
      const segments = ropeSegments.current
      const mouse = mousePosition.current

      if (!isInitialized || mouse.x === null) {
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      updateLeadingSegment(segments, mouse.x, mouse.y)
      updateFollowingSegments(segments)

      if (pathRef.current) {
        pathRef.current.setAttribute('d', generateSmoothPath(segments))
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    container.addEventListener('mousemove', handleMouseMove)
    animationFrameId = requestAnimationFrame(animate)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
      gsap.killTweensOf(ropeSegments.current)
    }
  }, [segmentCount, segmentLength, motionEnabled])

  return (
    <div ref={containerRef} className={cn("relative isolate w-full overflow-hidden", className)} style={{ height, containerType: "inline-size", ...style }}>
      {children}
      <svg
        ref={svgRef}
        className="w-full h-full absolute inset-0"
        aria-hidden="true"
        style={{ opacity: isVisible && motionEnabled ? 1 : 0, pointerEvents: "none" }}
      >
        <path
          ref={pathRef}
          fill="none"
          stroke={ropeColor}
          strokeWidth={ropeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={ropeOpacity}
        />
      </svg>
    </div>
  )
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

## Preview behavior

Move across the preview to draw a flowing rope trail. The effect stays inside its container and respects reduced motion preferences.
