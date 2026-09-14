# ObsidianUI — Folder Preview

[Canonical page](https://www.obsidianui.dev/docs/folder-preview) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

An interactive 3D folder that opens to reveal image contents.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/folder-preview)

```tsx
import { FolderPreview } from '@/components/block/folder-preview'

export function Demo() {
return <FolderPreview images={["/1.jpg", "/2.jpg"]} label="Photos" />
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/folder-preview.json"
```

## Install manually — complete source

Download the complete manifest: [folder-preview.json](https://www.obsidianui.dev/r/folder-preview.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install clsx motion tailwind-merge
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/folder-preview.tsx

Installation target: `@components/block/folder-preview.tsx`

```tsx
"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// ============================================
// SVG Icon Components
// ============================================

const FolderBackIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 20 16" className={cn("w-full h-full fill-current", className)}>
        <path d="M7.5,0C7.4,0,2,0,2,0C0.9,0,0,0.9,0,2l0,12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V4c0-1.1-0.9-2-2-2c0,0-7.5,0-8,0C9,2,9.9,0,7.5,0z" />
    </svg>
);

const FolderCoverIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 20 16" className={cn("w-full h-full fill-current", className)}>
        <path d="M2,2h16c1.1,0,2,0.9,2,2v10c0,1.1-0.9,2-2,2H2c-1.1,0-2-0.9-2-2V4C0,2.9,0.9,2,2,2z" />
    </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={cn("w-full h-full fill-current", className)}>
        <path
            opacity="0.3"
            d="M22.2,17.7l-4-2c-0.5-0.3-0.8-0.8-0.8-1.3v-1.6c0.1-0.1,0.2-0.3,0.4-0.5c0.5-0.8,0.9-1.6,1.2-2.5c0.5-0.2,0.9-0.6,0.9-1.2V7c0-0.4-0.2-0.7-0.4-0.9V3.7c0,0,0.5-3.7-4.6-3.7c-5,0-4.6,3.7-4.6,3.7v2.4C10.1,6.3,9.9,6.7,9.9,7v1.7c0,0.4,0.2,0.8,0.6,1c0.4,1.8,1.5,3.1,1.5,3.1v1.5c0,0.6-0.3,1.1-0.8,1.3l-3.7,2c-1.1,0.6-1.7,1.7-1.7,2.9v1.3H24v-1.3C24,19.4,23.3,18.3,22.2,17.7z"
        />
        <path
            opacity="0.5"
            d="M7.5,17.7l2.5-1.3c0,0,0,0,0,0l1.2-0.7c0.5-0.3,0.8-0.8,0.8-1.3v-1.5c0,0-0.4-0.5-0.9-1.4l0,0c0,0,0,0,0,0c-0.1-0.1-0.1-0.2-0.2-0.3c0,0,0,0,0-0.1c-0.1-0.1-0.1-0.3-0.2-0.4c0,0,0,0,0,0c0-0.1-0.1-0.2-0.1-0.4c0,0,0-0.1,0-0.1c0-0.1-0.1-0.3-0.1-0.4c-0.3-0.2-0.6-0.6-0.6-1V7c0-0.4,0.2-0.7,0.4-0.9V3.8C9.8,3.3,8.9,2.9,7.4,2.9c-4,0-4.1,3.3-4.1,3.3v2.1C3.1,8.5,2.9,8.8,2.9,9.1v1.4c0,0.4,0.2,0.7,0.5,0.9c0.4,1.6,1.6,2.7,1.6,2.7v1.3c0,0.5-0.3,0.9-0.7,1.1l-2.8,1.7C0.6,18.8,0,19.7,0,20.8v1.2h5.8v-1.3C5.8,19.4,6.5,18.3,7.5,17.7z"
        />
    </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={cn("w-full h-full fill-current", className)}>
        <circle cx="12" cy="12" r="10" opacity="0.3" />
        <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M12,20c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8S16.4,20,12,20z" />
    </svg>
);

const PadlockIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 33.6" className={cn("w-full h-full fill-current", className)}>
        <path d="M23,13.5h-1.7V9.4C21.4,4.2,17.2,0,12,0C6.8,0,2.6,4.2,2.6,9.4v4.1H1c-0.5,0-1,0.4-1,1v18.2c0,0.5,0.4,1,1,1H23c0.5,0,1-0.4,1-1V14.4C24,13.9,23.6,13.5,23,13.5z M13.5,24.5v3.9c0,0.3-0.3,0.6-0.6,0.6h-1.8c-0.3,0-0.6-0.3-0.6-0.6v-3.9c-0.7-0.5-1.1-1.3-1.1-2.1c0-1.4,1.2-2.6,2.6-2.6c1.4,0,2.6,1.2,2.6,2.6C14.6,23.3,14.2,24.1,13.5,24.5z M16.9,13.5H7.1V9.4c0-2.7,2.2-4.9,4.9-4.9c2.7,0,4.9,2.2,4.9,4.9V13.5z" />
    </svg>
);

const CloudIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 22.2" className={cn("w-full h-full fill-current", className)}>
        <path d="M19.5,5.8c-0.3-1.5-1-2.9-2.2-4c-1.3-1.2-3-1.8-4.7-1.8C11.3,0,10,0.4,8.9,1.1C8,1.7,7.2,2.5,6.6,3.5c-0.2,0-0.5-0.1-0.7-0.1c-2.1,0-3.8,1.7-3.8,3.8c0,0.3,0,0.5,0.1,0.8C0.8,9,0,10.6,0,12.3C0,13.6,0.5,15,1.4,16c1,1.1,2.2,1.7,3.6,1.8c0,0,0,0,0,0h4.2c0.4,0,0.7-0.3,0.7-0.7s-0.3-0.7-0.7-0.7H5c-2-0.1-3.7-2-3.7-4.2c0-1.4,0.8-2.7,2-3.4c0.3-0.2,0.4-0.5,0.3-0.8C3.5,7.8,3.4,7.5,3.4,7.2c0-1.4,1.1-2.5,2.5-2.5c0.3,0,0.6,0,0.8,0.1c0.3,0.1,0.7,0,0.8-0.3c0.9-2,2.9-3.2,5.1-3.2c2.9,0,5.3,2.2,5.6,5.1c0,0.3,0.3,0.5,0.6,0.6c2.2,0.4,3.9,2.4,3.9,4.7c0,2.5-1.9,4.6-4.3,4.8h-3.6c-0.4,0-0.7,0.3-0.7,0.7s0.3,0.7,0.7,0.7h3.7c0,0,0,0,0,0c1.5-0.1,2.9-0.8,4-2c1-1.1,1.6-2.6,1.6-4.1C24,8.9,22.1,6.5,19.5,5.8z M16,12.9c0.3-0.3,0.3-0.7,0-0.9l-3.5-3.5c-0.1-0.1-0.3-0.2-0.5-0.2c-0.2,0-0.3,0.1-0.5,0.2L8,12c-0.3,0.3-0.3,0.7,0,0.9c0.1,0.1,0.3,0.2,0.5,0.2c0.2,0,0.3-0.1,0.5-0.2l2.4-2.4v11c0,0.4,0.3,0.7,0.7,0.7s0.7-0.3,0.7-0.7v-11l2.4,2.4C15.3,13.2,15.7,13.2,16,12.9z" />
    </svg>
);

const FileIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 20 26.8" className={cn("w-full h-full fill-current", className)}>
        <path d="M2.3,0C1,0,0,1,0,2.3v22.2c0,1.2,1,2.3,2.3,2.3h15.4c1.2,0,2.3-1,2.3-2.3V6l-6-6H2.3z" />
        <path opacity="0.1" d="M13.9,3.7V0l6,6h-3.7C14.9,6,13.9,5,13.9,3.7z" />
    </svg>
);

// ============================================
// Types & Interfaces
// ============================================

export type FolderVariant =
    | "devi"
    | "rudras"
    | "ardra"
    | "shakti"
    | "kubera"
    | "hari"
    | "ravi"
    | "durga"
    | "nandi";

export interface FolderPreviewProps {
    variant?: FolderVariant;
    images?: string[];
    files?: { name: string; type?: "txt" | "gif" | "mp3" | "default" }[];
    label?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
    onClick?: () => void;
}

// ============================================
// Color Schemes for Each Variant
// ============================================

const variantColors: Record<
    FolderVariant,
    {
        back: string;
        cover: string;
        deco: string;
        caption: string;
        bg: string;
    }
> = {
    devi: {
        back: "text-gray-500",
        cover: "text-gray-400",
        deco: "text-gray-400 brightness-125",
        caption: "text-gray-800 dark:text-gray-200",
        bg: "bg-gray-100 dark:bg-gray-900",
    },
    rudras: {
        back: "text-gray-700 dark:text-gray-600",
        cover: "text-gray-600 dark:text-gray-500",
        deco: "text-gray-400",
        caption: "text-blue-600 dark:text-blue-400",
        bg: "bg-slate-200 dark:bg-slate-800",
    },
    ardra: {
        back: "text-blue-800 dark:text-blue-700",
        cover: "text-blue-600 dark:text-blue-500",
        deco: "text-blue-700 dark:text-blue-600",
        caption: "text-blue-500 dark:text-blue-400",
        bg: "bg-gray-800 dark:bg-gray-950",
    },
    shakti: {
        back: "text-indigo-800",
        cover: "text-indigo-700",
        deco: "text-indigo-800",
        caption: "text-green-400",
        bg: "bg-blue-600 dark:bg-blue-800",
    },
    kubera: {
        back: "text-gray-900",
        cover: "text-gray-700",
        deco: "text-gray-600",
        caption: "text-gray-900 dark:text-gray-100",
        bg: "bg-emerald-400 dark:bg-emerald-600",
    },
    hari: {
        back: "text-blue-800",
        cover: "text-blue-700",
        deco: "text-blue-800",
        caption: "text-yellow-400",
        bg: "bg-sky-500 dark:bg-sky-700",
    },
    ravi: {
        back: "text-gray-900",
        cover: "text-gray-700",
        deco: "text-black dark:text-white",
        caption: "text-gray-900 dark:text-gray-100",
        bg: "bg-gray-200 dark:bg-gray-800",
    },
    durga: {
        back: "text-green-600",
        cover: "text-green-500",
        deco: "text-green-600",
        caption: "text-green-400 font-mono",
        bg: "bg-gray-900 dark:bg-black",
    },
    nandi: {
        back: "text-amber-500",
        cover: "text-amber-400",
        deco: "text-amber-500",
        caption: "text-gray-900 dark:text-gray-100",
        bg: "bg-green-100 dark:bg-green-950",
    },
};

// ============================================
// Size Configuration
// ============================================

const sizeConfig = {
    sm: {
        folder: "w-16",
        thumb: "w-10 h-10",
        deco: "w-4 h-4",
        caption: "text-xs",
    },
    md: {
        folder: "w-24",
        thumb: "w-14 h-14",
        deco: "w-6 h-6",
        caption: "text-sm",
    },
    lg: {
        folder: "w-32",
        thumb: "w-20 h-20",
        deco: "w-8 h-8",
        caption: "text-base",
    },
};

// ============================================
// Animation Variants
// ============================================

const createCircularPositions = (count: number, radius: number = 120) => {
    return Array.from({ length: count }, (_, i) => {
        const startAngle = Math.PI / count;
        const angle = startAngle / 2 + startAngle * i;
        return {
            x: Math.round(radius * Math.cos(angle)),
            y: Math.round(-radius * Math.sin(angle)),
        };
    });
};

// ============================================
// Individual Folder Components for each Variant
// ============================================

const DeviFolder: React.FC<{
    images: string[];
    isHovered: boolean;
    colors: typeof variantColors.devi;
    sizes: typeof sizeConfig.md;
    label?: string;
}> = ({ images, isHovered, colors, sizes, label }) => {
    const positions = createCircularPositions(images.length, 80);

    return (
        <div className="relative">
            {/* Previews - positioned from folder center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                {images.map((img, i) => (
                    <motion.img
                        key={i}
                        src={img}
                        alt=""
                        className="absolute w-12 h-12 object-cover rounded-full border-2 border-white shadow-md"
                        initial={{ opacity: 0, scale: 0.7, x: 0, y: 0 }}
                        animate={
                            isHovered
                                ? {
                                    opacity: 1,
                                    scale: 1,
                                    x: positions[i]?.x || 0,
                                    y: positions[i]?.y || 0,
                                }
                                : { opacity: 0, scale: 0.7, x: 0, y: 0 }
                        }
                        transition={{
                            duration: 0.6,
                            delay: (images.length - i - 1) * 0.04,
                            ease: [0.2, 1, 0.3, 1],
                        }}
                    />
                ))}
            </div>

            {/* Folder */}
            <div className="relative cursor-pointer aspect-[20/16]" style={{ perspective: "800px" }}>
                {/* Back */}
                <div className={cn("absolute inset-0 transition-colors duration-150", colors.back)}>
                    <FolderBackIcon />
                </div>

                {/* Cover */}
                <motion.div
                    className={cn(
                        "relative transition-colors duration-150",
                        isHovered ? "text-gray-600" : colors.cover
                    )}
                >
                    <FolderCoverIcon />
                    <div
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                            sizes.deco,
                            colors.deco
                        )}
                    >
                        <UsersIcon />
                    </div>
                </motion.div>
            </div>

            {label && (
                <h3 className={cn("mt-3 font-medium text-center", sizes.caption, colors.caption)}>
                    {label}
                </h3>
            )}
        </div>
    );
};


const RudrasFolder: React.FC<{
    images: string[];
    isHovered: boolean;
    colors: typeof variantColors.rudras;
    sizes: typeof sizeConfig.md;
    label?: string;
}> = ({ images, isHovered, colors, sizes, label }) => {
    const positions = createCircularPositions(images.length, 80);

    return (
        <div className="relative">
            {/* Previews - positioned from folder center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                {images.map((img, i) => (
                    <motion.img
                        key={i}
                        src={img}
                        alt=""
                        className="absolute w-12 h-12 object-cover rounded-full border-2 border-white shadow-md"
                        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                        animate={
                            isHovered
                                ? {
                                    opacity: 1,
                                    scale: 1,
                                    x: -positions[i]?.x || 0,
                                    y: positions[i]?.y || 0,
                                }
                                : { opacity: 0, scale: 0, x: 0, y: 0 }
                        }
                        transition={{
                            duration: 0.8,
                            delay: (images.length - i - 1) * 0.08,
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                        }}
                    />
                ))}
            </div>

            {/* Folder */}
            <div className="relative cursor-pointer aspect-[20/16]" style={{ perspective: "800px" }}>
                {/* Back */}
                <div className={cn("absolute inset-0", colors.back)}>
                    <FolderBackIcon />
                </div>

                {/* Paper Sheet Deco */}
                <div className="absolute bottom-0.5 left-0.5 right-0.5 h-3/4 bg-white dark:bg-gray-200 rounded-lg" />

                {/* Cover */}
                <motion.div
                    className={cn("relative", colors.cover)}
                    style={{ transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}
                    animate={isHovered ? { rotateX: -30 } : { rotateX: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                    <FolderCoverIcon />
                    <div
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                            sizes.deco,
                            colors.deco
                        )}
                    >
                        <UsersIcon />
                    </div>
                </motion.div>
            </div>

            {label && (
                <h3 className={cn("mt-3 font-medium text-center", sizes.caption, colors.caption)}>
                    {label}
                </h3>
            )}
        </div>
    );
};


const ArdraFolder: React.FC<{
    images: string[];
    isHovered: boolean;
    colors: typeof variantColors.ardra;
    sizes: typeof sizeConfig.md;
    label?: string;
}> = ({ images, isHovered, colors, sizes, label }) => {
    const [randomPositions] = React.useState(() =>
        images.map((_, i) => {
            const radius = 60 + Math.random() * 20;
            const angle = (2 * (i + 1) * Math.PI) / images.length;
            return {
                x: Math.round(radius * Math.cos(angle)),
                y: Math.round(radius * Math.sin(angle)),
                rotate: Math.random() * 6 - 3,
            };
        })
    );

    return (
        <div className="relative">
            {/* Feedback Circle */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
            >
                <motion.div
                    className="w-10 h-10 rounded-full bg-gray-900/50"
                    initial={{ scale: 1 }}
                    animate={
                        isHovered ? { opacity: [1, 0], scale: [1, 6] } : { opacity: 0, scale: 1 }
                    }
                    transition={{ duration: 0.9, ease: [0.1, 1, 0.3, 1] }}
                />
            </motion.div>

            {/* Previews - positioned from folder center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                {images.map((img, i) => (
                    <motion.img
                        key={i}
                        src={img}
                        alt=""
                        className="absolute w-10 h-10 object-cover rounded-full border-2 border-white shadow-lg"
                        initial={{ opacity: 0, scale: 0.4, x: 0, y: 0, rotate: 0 }}
                        animate={
                            isHovered
                                ? {
                                    opacity: 1,
                                    scale: 1,
                                    x: randomPositions[i]?.x || 0,
                                    y: randomPositions[i]?.y || 0,
                                    rotate: randomPositions[i]?.rotate || 0,
                                }
                                : { opacity: 0, scale: 0.4, x: 0, y: 0, rotate: 0 }
                        }
                        transition={{ duration: 0.5, ease: [0.1, 1, 0.3, 1] }}
                    />
                ))}
            </div>

            {/* Folder */}
            <motion.div
                className="relative cursor-pointer aspect-[20/16]"
                animate={isHovered ? { scale: 0.85 } : { scale: 1 }}
                transition={{ duration: 0.5, ease: [0.1, 1, 0.3, 1] }}
            >
                {/* Back */}
                <div className={cn("absolute inset-0", colors.back)}>
                    <FolderBackIcon />
                </div>

                {/* Cover */}
                <div className={cn("relative", colors.cover)}>
                    <FolderCoverIcon />
                    <div
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                            sizes.deco,
                            colors.deco
                        )}
                    >
                        <GlobeIcon />
                    </div>
                </div>
            </motion.div>

            {label && (
                <h3 className={cn("mt-3 font-medium text-center", sizes.caption, colors.caption)}>
                    {label}
                </h3>
            )}
        </div>
    );
};

const ShaktiFolder: React.FC<{
    images: string[];
    isHovered: boolean;
    colors: typeof variantColors.shakti;
    sizes: typeof sizeConfig.md;
    label?: string;
}> = ({ images, isHovered, colors, sizes, label }) => {
    return (
        <motion.div
            className="relative"
            animate={isHovered ? { y: 15 } : { y: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 1, 0.3, 1] }}
        >
            <div className="relative cursor-pointer">
                {/* Back */}
                <div className={cn("absolute inset-0", colors.back)}>
                    <FolderBackIcon />
                </div>

                {/* Previews - Fan animation */}
                <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", sizes.thumb)}>
                    {images.map((img, i) => (
                        <motion.img
                            key={i}
                            src={img}
                            alt=""
                            className="absolute w-12 h-16 object-cover rounded shadow-lg origin-[-600%_50%]"
                            initial={{ opacity: 0, rotate: 0 }}
                            animate={
                                isHovered
                                    ? { opacity: 1, rotate: -10 * (images.length - i - 1) - 15 }
                                    : { opacity: 0, rotate: 0 }
                            }
                            transition={{
                                duration: 0.5,
                                delay: i * 0.08,
                                ease: [0.1, 1, 0.3, 1],
                            }}
                        />
                    ))}
                </div>

                {/* Cover */}
                <div className={cn("relative", colors.cover)}>
                    <FolderCoverIcon />
                    <div
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1",
                            sizes.deco,
                            colors.deco
                        )}
                    >
                        <PadlockIcon />
                    </div>
                </div>
            </div>

            {label && (
                <h3 className={cn("mt-3 font-medium text-center", sizes.caption, colors.caption)}>
                    {label}
                </h3>
            )}
        </motion.div>
    );
};

const KuberaFolder: React.FC<{
    images: string[];
    isHovered: boolean;
    colors: typeof variantColors.kubera;
    sizes: typeof sizeConfig.md;
    label?: string;
}> = ({ images, isHovered, colors, sizes, label }) => {
    return (
        <div className="relative">
            <div className="relative cursor-pointer" style={{ perspective: "800px" }}>
                {/* Back */}
                <div className={cn("absolute inset-0", colors.back)}>
                    <FolderBackIcon />
                </div>

                {/* Paper Sheet Deco */}
                <div className="absolute bottom-0.5 left-0.5 right-0.5 h-3/4 bg-white dark:bg-gray-200 rounded-lg" />

                {/* Floating Previews */}
                <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", sizes.thumb)}>
                    {images.map((img, i) => (
                        <motion.img
                            key={i}
                            src={img}
                            alt=""
                            className="absolute w-full h-full object-cover rounded-lg shadow-lg"
                            initial={{ opacity: 0 }}
                            animate={
                                isHovered
                                    ? {
                                        opacity: [1, 0],
                                        y: [0, -200 - (i * 17 % 50)],
                                        x: (i * 23 % 50) - 25,
                                        rotate: (i * 13 % 40) - 20,
                                    }
                                    : { opacity: 0 }
                            }
                            transition={{
                                duration: 0.4,
                                delay: i * 0.3,
                                repeat: isHovered ? Infinity : 0,
                                ease: "linear",
                            }}
                        />
                    ))}
                </div>

                {/* Cover */}
                <motion.div
                    className={cn("relative", colors.cover)}
                    style={{ transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}
                    animate={isHovered ? { rotateX: -40 } : { rotateX: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                    <FolderCoverIcon />
                    <div
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1",
                            sizes.deco,
                            colors.deco
                        )}
                    >
                        <CloudIcon />
                    </div>
                </motion.div>
            </div>

            {label && (
                <h3 className={cn("mt-3 font-medium text-center", sizes.caption, colors.caption)}>
                    {label}
                </h3>
            )}
        </div>
    );
};

const HariFolder: React.FC<{
    images: string[];
    isHovered: boolean;
    colors: typeof variantColors.hari;
    sizes: typeof sizeConfig.md;
    label?: string;
}> = ({ images, isHovered, colors, sizes, label }) => {
    const positions = createCircularPositions(images.length, 120);

    return (
        <div className="relative">
            {/* Feedback Circle */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-sky-500"
                initial={{ opacity: 0, scale: 1 }}
                animate={
                    isHovered ? { opacity: [1, 0], scale: [1, 15] } : { opacity: 0, scale: 1 }
                }
                transition={{ duration: 1.1, delay: 0.2, ease: [0.1, 1, 0.3, 1] }}
            />

            {/* Jumping Previews */}
            <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", sizes.thumb)}>
                {images.map((img, i) => (
                    <motion.img
                        key={i}
                        src={img}
                        alt=""
                        className="absolute w-12 h-16 object-cover rounded shadow-lg"
                        initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                        animate={
                            isHovered
                                ? {
                                    opacity: 1,
                                    scale: 1,
                                    x: -positions[i]?.x || 0,
                                    y: -positions[i]?.y || 0,
                                }
                                : { opacity: 0, scale: 0.5, x: 0, y: 0 }
                        }
                        transition={{
                            duration: 0.8,
                            delay: 0.2,
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                        }}
                    />
                ))}
            </div>

            <motion.div
                className="relative cursor-pointer"
                style={{ perspective: "800px", transformOrigin: "50% 100%" }}
                animate={
                    isHovered
                        ? { y: -20, scaleX: 0.9, scaleY: 0.9 }
                        : { y: 0, scaleX: 1, scaleY: 1 }
                }
                transition={{
                    duration: 0.8,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                }}
            >
                {/* Back */}
                <div className={cn("absolute inset-0", colors.back)}>
                    <FolderBackIcon />
                </div>

                {/* Paper Sheet Deco */}
                <div className="absolute bottom-0.5 left-0.5 right-0.5 h-3/4 bg-white/80 rounded-lg" />

                {/* Cover */}
                <motion.div
                    className={cn("relative", colors.cover)}
                    style={{ transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}
                    animate={isHovered ? { rotateX: -25 } : { rotateX: 0 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                    <FolderCoverIcon />
                    <div
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1",
                            sizes.deco,
                            colors.deco
                        )}
                    >
                        <GlobeIcon />
                    </div>
                </motion.div>
            </motion.div>

            <motion.h3
                className={cn("mt-3 font-medium text-center", sizes.caption, colors.caption)}
                animate={isHovered ? { opacity: 0 } : { opacity: 1 }}
                transition={{ delay: isHovered ? 0.3 : 0 }}
            >
                {label}
            </motion.h3>
        </div>
    );
};

const RaviFolder: React.FC<{
    images: string[];
    isHovered: boolean;
    colors: typeof variantColors.ravi;
    sizes: typeof sizeConfig.md;
    label?: string;
}> = ({ images, isHovered, colors, sizes, label }) => {
    // Reorder images for card-spread effect
    const reorder = (arr: string[]) => {
        const result: string[] = [];
        let i = Math.ceil(arr.length / 2);
        let j = i - 1;
        while (j >= 0) {
            result.push(arr[j--]);
            if (i < arr.length) result.push(arr[i++]);
        }
        return result;
    };

    const orderedImages = React.useMemo(() => reorder(images), [images]);

    return (
        <div className="relative">
            {/* Feedback Circle */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white"
                initial={{ opacity: 0, scale: 1 }}
                animate={
                    !isHovered ? { opacity: [1, 0], scale: [1, 5] } : { opacity: 0, scale: 1 }
                }
                transition={{ duration: 0.8, delay: 0.35, ease: [0.1, 1, 0.3, 1] }}
            />

            <div className="relative cursor-pointer" style={{ perspective: "800px" }}>
                {/* Back */}
                <div className={cn("absolute inset-0", colors.back)}>
                    <FolderBackIcon />
                </div>

                {/* Paper Sheet */}
                <div className="absolute bottom-0.5 left-0.5 right-0.5 h-3/4 bg-white rounded-lg" />

                {/* Card Spread Previews */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75px] h-[65px]">
                    {orderedImages.map((img, i) => {
                        const interval = 60;
                        const c = orderedImages.length;
                        const x =
                            -interval * Math.floor(c / 2) + interval * i + (c % 2 === 0 ? interval / 2 : 0);
                        const rotateInterval = 20;
                        const rotate =
                            -rotateInterval * Math.floor(c / 2) +
                            rotateInterval * i +
                            (c % 2 === 0 ? rotateInterval / 2 : 0);

                        return (
                            <motion.img
                                key={i}
                                src={img}
                                alt=""
                                className="absolute w-full h-full object-cover rounded shadow-lg"
                                initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 1 }}
                                animate={
                                    isHovered
                                        ? { opacity: 1, y: -70, x, rotate }
                                        : { opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.5 }
                                }
                                transition={{
                                    duration: isHovered ? 0.4 : 0.3,
                                    ease: isHovered ? [0.1, 1, 0.3, 1] : "easeInOut",
                                }}
                            />
                        );
                    })}
                </div>

                {/* Cover */}
                <motion.div
                    className={cn("relative", colors.cover)}
                    style={{ transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}
                    animate={isHovered ? { rotateX: -30 } : { rotateX: 0 }}
                    transition={{
                        duration: 0.4,
                        delay: isHovered ? 0 : 0.3,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                >
                    <FolderCoverIcon />
                    <div
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1",
                            sizes.deco,
                            colors.deco
                        )}
                    >
                        <PadlockIcon />
                    </div>
                </motion.div>
            </div>

            {label && (
                <h3 className={cn("mt-3 font-medium text-center", sizes.caption, colors.caption)}>
                    {label}
                </h3>
            )}
        </div>
    );
};

const DurgaFolder: React.FC<{
    files: { name: string; type?: string }[];
    isHovered: boolean;
    colors: typeof variantColors.durga;
    sizes: typeof sizeConfig.md;
    label?: string;
}> = ({ files, isHovered, colors, sizes, label }) => {
    return (
        <div className="relative">
            {/* Text Preview - shows file list inside a tooltip bubble */}
            <motion.div
                className="absolute -right-2 top-0 bg-gray-800 dark:bg-gray-900 rounded-lg px-3 py-2 shadow-lg z-20 min-w-[100px]"
                initial={{ opacity: 0, x: -10, scale: 0.9 }}
                animate={isHovered ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -10, scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{ transform: 'translateX(100%)' }}
            >
                {files.slice(0, 6).map((file, i) => (
                    <motion.div
                        key={i}
                        className="text-gray-100 font-mono text-xs py-0.5 whitespace-nowrap"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.05, delay: i * 0.03 }}
                    >
                        {file.name}
                    </motion.div>
                ))}
            </motion.div>

            {/* Folder */}
            <div className="relative cursor-pointer aspect-[20/16]" style={{ perspective: "800px" }}>
                {/* Back */}
                <div className={cn("absolute inset-0", colors.back)}>
                    <FolderBackIcon />
                </div>

                {/* Paper Sheet */}
                <div className="absolute bottom-0.5 left-0.5 right-0.5 h-3/4 bg-white dark:bg-gray-200 rounded-lg" />

                {/* Cover */}
                <motion.div
                    className={cn("relative", colors.cover)}
                    style={{ transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}
                    animate={isHovered ? { rotateX: -30 } : { rotateX: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                    <FolderCoverIcon />
                    <div
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                            sizes.deco,
                            colors.deco
                        )}
                    >
                        <GlobeIcon />
                    </div>
                </motion.div>
            </div>

            {label && (
                <h3 className={cn("mt-3 font-medium text-center", sizes.caption, colors.caption)}>
                    {label}
                </h3>
            )}
        </div>
    );
};

const NandiFolder: React.FC<{
    files: { name: string; type?: string }[];
    isHovered: boolean;
    colors: typeof variantColors.nandi;
    sizes: typeof sizeConfig.md;
    label?: string;
}> = ({ files, isHovered, colors, sizes, label }) => {
    const fileColorMap: Record<string, string> = {
        txt: "fill-blue-300",
        gif: "fill-teal-400",
        mp3: "fill-amber-400",
        default: "fill-gray-400",
    };

    return (
        <div className="relative">
            {/* Magnifier Preview - compact bubble above folder */}
            <motion.div
                className="absolute left-1/2 -translate-x-1/2 bg-white dark:bg-gray-100 rounded-2xl shadow-xl z-20 p-3 grid grid-cols-3 gap-2"
                style={{ bottom: '100%', marginBottom: '8px', minWidth: '120px' }}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={
                    isHovered
                        ? { opacity: 1, scale: 1, y: 0 }
                        : { opacity: 0, scale: 0.8, y: 10 }
                }
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
                {files.slice(0, 6).map((file, i) => (
                    <div key={i} className="text-center">
                        <FileIcon
                            className={cn("w-5 h-5 mx-auto", fileColorMap[file.type || "default"])}
                        />
                        <span className="text-[8px] text-gray-600 block mt-0.5 truncate max-w-[35px]">
                            {file.name}
                        </span>
                    </div>
                ))}
            </motion.div>

            {/* Folder */}
            <div className="relative cursor-pointer aspect-[20/16]" style={{ perspective: "800px" }}>
                {/* Back */}
                <div className={cn("absolute inset-0", colors.back)}>
                    <FolderBackIcon />
                </div>

                {/* Paper Sheet */}
                <div className="absolute bottom-0.5 left-0.5 right-0.5 h-3/4 bg-white dark:bg-gray-200 rounded-lg" />

                {/* Cover */}
                <motion.div
                    className={cn("relative", colors.cover)}
                    style={{ transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}
                    animate={isHovered ? { rotateX: -30 } : { rotateX: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                    <FolderCoverIcon />
                    <div
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                            sizes.deco,
                            colors.deco
                        )}
                    >
                        <CloudIcon />
                    </div>
                </motion.div>
            </div>

            {label && (
                <h3 className={cn("mt-3 font-medium text-center", sizes.caption, colors.caption)}>
                    {label}
                </h3>
            )}
        </div>
    );
};

// ============================================
// Main FolderPreview Component
// ============================================

export const FolderPreview = React.forwardRef<HTMLDivElement, FolderPreviewProps>(
    (
        {
            variant = "devi",
            images = [],
            files = [],
            label,
            size = "md",
            className,
            onClick,
        },
        ref
    ) => {
        const [isHovered, setIsHovered] = React.useState(false);
        const colors = variantColors[variant];
        const sizes = sizeConfig[size];

        const defaultImages = [
            "/folder-preview/user1.svg",
            "/folder-preview/user2.svg",
            "/folder-preview/user3.svg",
            "/folder-preview/user4.svg",
            "/folder-preview/user5.svg",
        ];

        const defaultFiles = [
            { name: "docs", type: "default" as const },
            { name: "template", type: "default" as const },
            { name: "readme.md", type: "txt" as const },
            { name: "app.js", type: "txt" as const },
            { name: "test.sh", type: "txt" as const },
            { name: "package.json", type: "txt" as const },
            { name: "logo.svg", type: "default" as const },
            { name: "...", type: "default" as const },
        ];

        const imageList = images.length > 0 ? images : defaultImages;
        const fileList = files.length > 0 ? files : defaultFiles;

        const renderFolder = () => {
            const props = { isHovered, colors, sizes, label };

            switch (variant) {
                case "devi":
                    return <DeviFolder images={imageList} {...props} />;
                case "rudras":
                    return <RudrasFolder images={imageList} {...props} />;
                case "ardra":
                    return <ArdraFolder images={imageList} {...props} />;
                case "shakti":
                    return <ShaktiFolder images={imageList} {...props} />;
                case "kubera":
                    return <KuberaFolder images={imageList} {...props} />;
                case "hari":
                    return <HariFolder images={imageList} {...props} />;
                case "ravi":
                    return <RaviFolder images={imageList} {...props} />;
                case "durga":
                    return <DurgaFolder files={fileList} {...props} />;
                case "nandi":
                    return <NandiFolder files={fileList} {...props} />;
                default:
                    return <DeviFolder images={imageList} {...props} />;
            }
        };

        return (
            <div
                ref={ref}
                className={cn("inline-flex flex-col items-center overflow-visible", sizes.folder, className)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onClick}
            >
                {renderFolder()}
            </div>
        );
    }
);

FolderPreview.displayName = "FolderPreview";

export default FolderPreview;
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

### public/folder-preview/user1.svg

Installation target: `public/folder-preview/user1.svg`

```svg
<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 20.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 174 174" style="enable-background:new 0 0 174 174;" xml:space="preserve">
<style type="text/css">
	.st0{clip-path:url(#SVGID_2_);fill:#EFAF7F;}
	.st1{clip-path:url(#SVGID_4_);}
	.st2{fill:#FFC785;}
	.st3{fill:#924A0B;}
	.st4{fill:#179E85;stroke:#179E85;stroke-width:1.084;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}
	.st5{fill:#F5BE92;}
	.st6{fill:#FFFFFF;stroke:#FFFFFF;stroke-width:2;stroke-linecap:round;stroke-miterlimit:10;}
	.st7{fill:#FFFFFF;}
	.st8{fill:url(#SVGID_5_);}
	.st9{fill:#2E4962;}
	.st10{fill:url(#SVGID_6_);}
	.st11{fill:#E48F67;}
</style>
<g>
	<defs>
		<ellipse id="SVGID_1_" cx="87" cy="87" rx="87" ry="87"/>
	</defs>
	<clipPath id="SVGID_2_">
		<use xlink:href="#SVGID_1_"  style="overflow:visible;"/>
	</clipPath>
	<ellipse class="st0" cx="87" cy="87" rx="87" ry="87"/>
</g>
<g>
	<defs>
		<ellipse id="SVGID_3_" cx="87" cy="87" rx="87" ry="87"/>
	</defs>
	<clipPath id="SVGID_4_">
		<use xlink:href="#SVGID_3_"  style="overflow:visible;"/>
	</clipPath>
	<g class="st1">
		<g>
			<g>
				<ellipse class="st2" cx="55.2" cy="73.5" rx="7.9" ry="4.6"/>
				<ellipse class="st2" cx="120.6" cy="73.5" rx="7.9" ry="4.6"/>
			</g>
			<path class="st3" d="M67.2,33.1c-6.7,1.1-10.5,5.7-12,12C51,61.3,59.7,96.7,89.8,97.1c15.5,0.2,26.7-3.7,30.7-16.3
				c4.1-12.6,5.7-32.8-3.1-44.1C106.3,22.5,82.9,22.3,67.2,33.1"/>
			<path class="st4" d="M75.2,116.2c-28.1,12.3-36.6,18.9-39.9,21.9c-5.1,4.6-8.2,22.1-11.2,36.5h63.7h63.7
				c-3-14.4-5.7-32-10.8-36.5c-3.3-3-11.5-9.4-39.6-21.7L75.2,116.2L75.2,116.2z"/>
			<g>
				<path class="st5" d="M74.3,91.6v20.9V125c7.5,8.9,19.8,9.2,27.3,0v-12.5V91.6C101.6,74.8,74.3,74.8,74.3,91.6"/>
				<path class="st5" d="M88,35.6c-45.9,0-29.4,59.8-26.4,64.2c3.3,4.9,19,13.4,26.4,13.4s23.1-9.6,26.4-14.5
					C117.3,94.3,133.8,35.6,88,35.6"/>
			</g>
			<path class="st3" d="M65.6,50c8.1,4.9,14.3-2.4,21.6,0.7c7.3,3.1,28.2-5.4,32.4,27.8c6.9-24-4.7-44.1-31-45.3
				C60.6,32,49.3,53.9,57,77.8C56.5,64.9,59.7,56.4,65.6,50"/>
			<g>
				<path class="st6" d="M73,115.9l-9.7,5.2l14.1,19.5L88,130.5L73,115.9L73,115.9z"/>
				<path class="st6" d="M103.1,115.9l9.7,5.2l-14.1,19.5L88,130.5L103.1,115.9z"/>
			</g>
		</g>
		<path class="st3" d="M64.9,47.9c0.6,4,6.5,4.6,9.7,4.9c6.2,0.6,13.8-1.8,18.9-5.3c0.4-0.3,0.2-0.8-0.2-0.9
			c-5.4-0.3-10.2,3.4-15.6,3.9c-3.9,0.3-9.2-0.2-12.2-2.9C65.2,47.4,64.9,47.7,64.9,47.9"/>
		<g>
			<g>
				<path class="st7" d="M69.3,77.6c0,0,1.5,2.5,6.1,2.5c4.6,0,5.4-2.2,5.4-2.9c0,0-1.8-3-5.4-3C71.8,74.3,69.3,77.6,69.3,77.6"/>
				<g>
					<g>
						
							<radialGradient id="SVGID_5_" cx="75.13" cy="98.79" r="2.615" gradientTransform="matrix(1 0 0 -1 0 176)" gradientUnits="userSpaceOnUse">
							<stop  offset="0" style="stop-color:#2E4962"/>
							<stop  offset="1.900000e-02" style="stop-color:#314E68"/>
							<stop  offset="0.106" style="stop-color:#3C627D"/>
							<stop  offset="0.209" style="stop-color:#44728E"/>
							<stop  offset="0.336" style="stop-color:#4A7D9A"/>
							<stop  offset="0.514" style="stop-color:#4D83A1"/>
							<stop  offset="1" style="stop-color:#4E85A3"/>
						</radialGradient>
						<circle class="st8" cx="75.1" cy="77.2" r="2.6"/>
						<path class="st9" d="M75.1,74.9c1.3,0,2.4,1.1,2.4,2.4c0,1.3-1.1,2.4-2.4,2.4c-1.3,0-2.4-1.1-2.4-2.4
							C72.8,75.9,73.8,74.9,75.1,74.9 M75.1,74.3c-1.6,0-2.9,1.3-2.9,2.9c0,1.6,1.3,2.9,2.9,2.9c1.6,0,2.9-1.3,2.9-2.9
							C78,75.6,76.7,74.3,75.1,74.3z"/>
					</g>
					<circle cx="75.1" cy="77.2" r="1.2"/>
				</g>
			</g>
			<g>
				<path class="st7" d="M106.6,77.6c0,0-1.5,2.5-6.1,2.5s-5.4-2.2-5.4-2.9c0,0,1.8-3,5.4-3C104,74.3,106.6,77.6,106.6,77.6"/>
				<g>
					<g>
						
							<radialGradient id="SVGID_6_" cx="432.71" cy="98.79" r="2.615" gradientTransform="matrix(-1 0 0 -1 533.39 176)" gradientUnits="userSpaceOnUse">
							<stop  offset="0" style="stop-color:#2E4962"/>
							<stop  offset="1.900000e-02" style="stop-color:#314E68"/>
							<stop  offset="0.106" style="stop-color:#3C627D"/>
							<stop  offset="0.209" style="stop-color:#44728E"/>
							<stop  offset="0.336" style="stop-color:#4A7D9A"/>
							<stop  offset="0.514" style="stop-color:#4D83A1"/>
							<stop  offset="1" style="stop-color:#4E85A3"/>
						</radialGradient>
						<circle class="st10" cx="100.7" cy="77.2" r="2.6"/>
						<path class="st9" d="M100.7,74.9c1.3,0,2.4,1.1,2.4,2.4c0,1.3-1.1,2.4-2.4,2.4c-1.3,0-2.4-1.1-2.4-2.4
							C98.3,75.9,99.4,74.9,100.7,74.9 M100.7,74.3c-1.6,0-2.9,1.3-2.9,2.9c0,1.6,1.3,2.9,2.9,2.9c1.6,0,2.9-1.3,2.9-2.9
							C103.6,75.6,102.3,74.3,100.7,74.3z"/>
					</g>
					<circle cx="100.7" cy="77.2" r="1.2"/>
				</g>
			</g>
			<path class="st11" d="M82.9,89.7c-0.7,0.4-0.9,1.2-0.1,1.7c1.2,0.9,3,1,4.5,1c1.5,0,3.4-0.1,4.7-1c0.7-0.4,1.2-1.8,0.2-2.2
				c-0.2-0.1-0.5,0-0.4,0.3c0,0.3,0.3,0.6,0.3,0.9c-0.1,0.4-0.7,0.6-1,0.7c-1,0.4-2.1,0.4-3.2,0.5c-0.9,0-5.8,0.1-4.8-1.7
				C83,89.7,82.9,89.6,82.9,89.7"/>
			<g>
				<path class="st3" d="M64.1,67.1c5.7-0.8,11.1-1.6,16.3,1.3c0.5,0.3,0.9-0.5,0.5-0.8c-4.4-2.7-12.4-3.8-16.8-0.7
					C64,67,64,67.1,64.1,67.1"/>
				<path class="st3" d="M111.5,66.9c-4.4-3.1-12.5-2-16.8,0.7c-0.5,0.3-0.1,1.1,0.5,0.8c5.3-3,10.7-2.1,16.3-1.3
					C111.6,67.1,111.6,67,111.5,66.9"/>
			</g>
		</g>
		<path class="st7" d="M99.9,96.7c-6.7,4-16.3,5.3-23.3,1L99.9,96.7"/>
		<g>
			<path class="st3" d="M107.6,44.2c-0.3,2.5-0.9,4.6-1.7,6.5c-0.5-0.8-1.6-1.2-2.4-0.5c-0.5-1.2-2.3-1.4-3.2-0.2
				c-0.1,0.2-0.2,0.4-0.3,0.5c-0.3-1.3-2.1-1.9-3.1-1c0,0,0-0.1,0-0.1c-0.3-1.6-2.5-1.6-3.3-0.4c-0.6,0.9-1.1,1.8-1.5,2.8
				c-0.1-0.2-0.2-0.4-0.4-0.6c0.4-0.6,0.7-1.2,1-1.8c1-2.2-1.3-3.9-3-2.9c-0.4-0.2-0.8-0.2-1.3,0C87.3,47,86.3,48,85.3,49
				c-0.3-0.5-0.8-0.8-1.4-0.6c-2.7,1-4.9,2.6-7.5,3.8c0-0.1,0-0.3-0.1-0.4c-0.2-0.8-1-1.2-1.8-1c-0.2,0.1-0.4,0.2-0.6,0.4
				c0,0,0,0,0,0c0,0,0,0.1-0.1,0.1c0,0,0,0,0,0c-0.1,0.1-0.1,0.1-0.2,0.2c0,0,0,0,0,0c0,0.1-0.1,0.1-0.1,0.2
				c-0.2-0.1-0.4-0.2-0.6-0.2c0.4-0.4,0.7-0.8,1-1.2c0.5-0.6-0.3-1.7-1.1-1.4c-0.2,0.1-0.4,0.2-0.7,0.3c0.4-0.7,0.8-1.4,1-2.1
				c0.1-0.5-0.2-1-0.6-1.3c-0.2-0.4-0.7-0.7-1.2-0.4c-3.6,2.2-6.5,5.4-9.9,7.9c-0.5,0.2-1,0.3-1.5,0.4c-0.6,0.1-0.7,0.9-0.4,1.3
				c0,0-0.1,0.1-0.1,0.1c-0.4,0.4-0.8,0.9-1.2,1.4c0.2-0.4,0.4-0.9,0.2-1.5c0-0.1,0-0.2-0.1-0.3c0-0.4-0.2-0.8-0.4-1.1
				c0.5-0.6,0.9-1.2,1.3-1.9c0.6-0.9-0.6-1.9-1.5-1.5c-0.5,0.3-1,0.6-1.5,0.9c1.6-3.1,3.8-5.8,6.4-8.1c4.1-3.7,8.3-3.7,13.4-2.7
				c1.4,0.3,2-1.4,0.9-2.2c-1.6-1.2-3.3-1.8-5-2c3-0.4,6.1-0.1,9,1c1,0.4,2-0.7,1.7-1.7c-1.3-4.4-7.2-3.8-10.8-3.3
				c-3.3,0.5-6.5,1.5-9.4,3.1c-0.3,0-0.6,0-1,0.2c-1.7,0.8-3.5,1.7-3.5,1.7c-14.6,9-15.4,40-9.3,46.4c0,0.1,1.9,2.2,2.5,0.9
				c1.7-3.3,2.2-6.9,4.3-10c2-3.1,5.5-4.6,8.9-5.6c6.7-1.8,13.9-1.7,20.7-2.8c11.1-1.8,27.2-8,24.1-22.2
				C109.2,42.8,107.7,43.2,107.6,44.2 M76.2,58.4C76.2,58.4,76.2,58.4,76.2,58.4C76.2,58.4,76.2,58.4,76.2,58.4
				C76.2,58.4,76.2,58.4,76.2,58.4 M93.5,58.7C93.5,58.6,93.5,58.6,93.5,58.7C93.5,58.6,93.5,58.6,93.5,58.7
				C93.5,58.6,93.5,58.7,93.5,58.7"/>
			<path class="st3" d="M127.5,47.1c-0.6-4-4-10.2-8.9-7.3c-0.6,0.4-0.5,1.4,0.2,1.6c0.6,0.2,1.2,0.4,1.7,0.6
				c-0.2,0.3-0.3,0.6-0.1,1c1.5,2.5,2,5.1,2.1,7.8c-0.1,0.2-0.2,0.4-0.2,0.7c-0.1,3.2-0.9,6.7-0.6,9.9c0.1,0.5,0.5,1,0.9,1.1
				c-0.9,3.5-1.7,6.7-1.6,8.9c0.1,1.1,1.5,1.3,1.9,0.3C125.9,64.2,128.7,55.2,127.5,47.1"/>
		</g>
	</g>
</g>
</svg>
```

### public/folder-preview/user2.svg

Installation target: `public/folder-preview/user2.svg`

```svg
<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 20.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 174 174" style="enable-background:new 0 0 174 174;" xml:space="preserve">
<style type="text/css">
	.st0{clip-path:url(#SVGID_2_);fill:#D888BA;}
	.st1{clip-path:url(#SVGID_4_);}
	.st2{fill:#F5BE92;}
	.st3{fill:#F9B54F;stroke:#F9B54F;stroke-width:1.084;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}
	.st4{fill:#FFFFFF;stroke:#FFFFFF;stroke-width:2;stroke-linecap:round;stroke-miterlimit:10;}
	.st5{fill:#FFFFFF;}
	.st6{fill:url(#SVGID_5_);}
	.st7{fill:#624A2E;}
	.st8{fill:url(#SVGID_6_);}
	.st9{fill:#E48F67;}
	.st10{fill:#474748;}
</style>
<g>
	<defs>
		<ellipse id="SVGID_1_" cx="87" cy="87" rx="87" ry="87"/>
	</defs>
	<clipPath id="SVGID_2_">
		<use xlink:href="#SVGID_1_"  style="overflow:visible;"/>
	</clipPath>
	<ellipse class="st0" cx="87" cy="87" rx="87" ry="87"/>
</g>
<g>
	<defs>
		<ellipse id="SVGID_3_" cx="87" cy="87" rx="87" ry="87"/>
	</defs>
	<clipPath id="SVGID_4_">
		<use xlink:href="#SVGID_3_"  style="overflow:visible;"/>
	</clipPath>
	<g class="st1">
		<g>
			<g>
				<ellipse class="st2" cx="54.8" cy="72.7" rx="7.9" ry="4.6"/>
				<ellipse class="st2" cx="120.2" cy="72.7" rx="7.9" ry="4.6"/>
			</g>
			<path class="st3" d="M74.8,115.4c-28.1,12.3-36.6,18.9-39.9,21.9c-5.1,4.6-8.2,22.1-11.2,36.5h63.7H151c-3-14.4-5.7-32-10.8-36.5
				c-3.3-3-11.5-9.4-39.6-21.7L74.8,115.4L74.8,115.4z"/>
			<g>
				<path class="st2" d="M73.9,90.8v20.9v12.5c7.5,8.9,19.8,9.2,27.3,0v-12.5V90.8C101.2,74,73.9,74,73.9,90.8"/>
				<path class="st2" d="M87.5,34.8c-45.9,0-29.4,59.8-26.4,64.2c3.3,4.9,19,13.4,26.4,13.4s23.1-9.6,26.4-14.5
					C116.9,93.5,133.4,34.8,87.5,34.8"/>
			</g>
			<g>
				<path class="st4" d="M72.6,115.1l-9.7,5.2l14.1,19.5l10.7-10.1L72.6,115.1L72.6,115.1z"/>
				<path class="st4" d="M102.6,115.1l9.7,5.2l-14.1,19.5l-10.7-10.1L102.6,115.1L102.6,115.1z"/>
			</g>
		</g>
		<g>
			<g>
				<path class="st5" d="M68.8,76.8c0,0,1.5,2.5,6.1,2.5s5.4-2.2,5.4-2.9c0,0-1.8-3-5.4-3C71.3,73.5,68.8,76.8,68.8,76.8"/>
				<g>
					<g>
						
							<radialGradient id="SVGID_5_" cx="74.69" cy="99.59" r="2.615" gradientTransform="matrix(1 0 0 -1 0 176)" gradientUnits="userSpaceOnUse">
							<stop  offset="0" style="stop-color:#624A2E"/>
							<stop  offset="3.600000e-02" style="stop-color:#6D5633"/>
							<stop  offset="0.122" style="stop-color:#816B3D"/>
							<stop  offset="0.223" style="stop-color:#907C45"/>
							<stop  offset="0.348" style="stop-color:#9B884A"/>
							<stop  offset="0.523" style="stop-color:#A18F4D"/>
							<stop  offset="1" style="stop-color:#A3914E"/>
						</radialGradient>
						<circle class="st6" cx="74.7" cy="76.4" r="2.6"/>
						<path class="st7" d="M74.7,74.1c1.3,0,2.4,1.1,2.4,2.4s-1.1,2.4-2.4,2.4s-2.4-1.1-2.4-2.4S73.4,74.1,74.7,74.1 M74.7,73.5
							c-1.6,0-2.9,1.3-2.9,2.9s1.3,2.9,2.9,2.9c1.6,0,2.9-1.3,2.9-2.9S76.3,73.5,74.7,73.5z"/>
					</g>
					<circle cx="74.7" cy="76.4" r="1.2"/>
				</g>
			</g>
			<g>
				<path class="st5" d="M106.1,76.8c0,0-1.5,2.5-6.1,2.5c-4.6,0-5.4-2.2-5.4-2.9c0,0,1.8-3,5.4-3C103.6,73.5,106.1,76.8,106.1,76.8
					"/>
				<g>
					<g>
						
							<radialGradient id="SVGID_6_" cx="-32.384" cy="99.59" r="2.615" gradientTransform="matrix(-1 0 0 -1 67.85 176)" gradientUnits="userSpaceOnUse">
							<stop  offset="0" style="stop-color:#624A2E"/>
							<stop  offset="3.600000e-02" style="stop-color:#6D5633"/>
							<stop  offset="0.122" style="stop-color:#816B3D"/>
							<stop  offset="0.223" style="stop-color:#907C45"/>
							<stop  offset="0.348" style="stop-color:#9B884A"/>
							<stop  offset="0.523" style="stop-color:#A18F4D"/>
							<stop  offset="1" style="stop-color:#A3914E"/>
						</radialGradient>
						<circle class="st8" cx="100.2" cy="76.4" r="2.6"/>
						<path class="st7" d="M100.2,74.1c1.3,0,2.4,1.1,2.4,2.4s-1.1,2.4-2.4,2.4s-2.4-1.1-2.4-2.4S98.9,74.1,100.2,74.1 M100.2,73.5
							c-1.6,0-2.9,1.3-2.9,2.9s1.3,2.9,2.9,2.9s2.9-1.3,2.9-2.9C103.1,74.8,101.8,73.5,100.2,73.5z"/>
					</g>
					<circle cx="100.2" cy="76.4" r="1.2"/>
				</g>
			</g>
			<path class="st9" d="M82.4,88.9c-0.7,0.4-0.9,1.2-0.1,1.7c1.2,0.9,3,1,4.5,1c1.5,0,3.4-0.1,4.7-1c0.7-0.4,1.2-1.8,0.2-2.2
				c-0.2-0.1-0.5,0-0.4,0.3c0,0.3,0.3,0.6,0.3,0.9c-0.1,0.4-0.7,0.6-1,0.7c-1,0.4-2.1,0.4-3.2,0.5c-0.9,0-5.8,0.1-4.8-1.7
				C82.6,89,82.5,88.9,82.4,88.9"/>
			<path class="st5" d="M96.3,99.9c-4.9,3-12.1,4-17.3,0.7L96.3,99.9"/>
			<g>
				<path class="st10" d="M63.7,66.3c5.7-0.8,11.1-1.6,16.3,1.3c0.5,0.3,0.9-0.5,0.5-0.8C76.1,64.1,68,63,63.6,66.2
					C63.5,66.2,63.6,66.3,63.7,66.3"/>
				<path class="st10" d="M111.1,66.2c-4.4-3.1-12.5-2-16.8,0.7c-0.5,0.3-0.1,1.1,0.5,0.8c5.3-3,10.7-2.1,16.3-1.3
					C111.1,66.3,111.2,66.2,111.1,66.2"/>
			</g>
		</g>
		<g>
			<path class="st10" d="M118.7,82.8c-0.1-0.1-0.2-0.2-0.4-0.3c0.1-0.7,0.3-1.5,0.4-2.2c-0.2,0-0.3,0-0.4,0c0.5-2,0.3-4.1,0.4-6.2
				c0.2-3,1.2-6.1,0.8-9.1c-0.1-0.6-0.8-0.8-1.1-0.3c-1.3,2-1.6,4.7-1.9,7.1c-0.3,2.6-1,5.9-0.4,8.6c-0.1,0-0.1,0.1-0.1,0.1
				c0,0,0,0,0,0c0,0.7-0.2,1.3-0.6,1.8c-0.2,0.3-0.3,0.5-0.5,0.8c-1.3,3.1-3.8,5.9-6.3,7.9c-0.1,0.1-0.3,0.2-0.5,0.4
				c-1.9,2-4.4,3.7-7.1,4.2c-0.7,0.1-1.3,0-1.8-0.3c-0.1,0-0.1,0-0.2,0c0,0-0.1,0-0.1,0.1c-6.2-3.1-16.6-3-22.6,0.2
				c-0.4,0.3-0.8,0.6-1.2,0.8c-0.4,0.5-0.9,0.8-1.7,0.9c-3.2,0.1-5.7-2.7-7.5-5c-1.7-2.3-3.2-4.8-4.3-7.5c0,0,0,0,0,0
				c-0.1,0-0.1-0.1-0.2-0.1c0-0.1,0-0.3,0.1-0.4c-0.1-0.4-0.1-0.8,0-1.2c-0.1-1-0.4-1.9-1.1-2.5c0,0,0,0,0,0c0.2-2.3-0.3-4.7-0.7-7
				c-0.6-2.9-1.3-6.2-3.2-8.5c-0.3-0.4-1.2-0.1-1.1,0.5c0.3,2.6,1.4,5,2,7.6c0.5,2.3,0.6,4.5,0.8,6.8c-0.2,0-0.3,0-0.5,0.1
				c-0.8,0.3-1.5,1.1-1.4,2c-0.2,0.1-0.4,0.2-0.5,0.4c-0.3,0.6-0.3,1.1-0.2,1.7c0.1,0.5,0.3,1.1,0.8,1.4c-0.1,0.5-0.1,1,0,1.4
				c0,0.2,0.1,0.4,0.3,0.5c0.1,0.4,0.3,0.8,0.5,1.1c0.1,0.1,0.2,0.2,0.3,0.2c-0.6,1-0.8,2.2-0.8,3.2c0,1.3,0.7,3.8,2.2,3.8
				c-0.4,2,1,4.4,2.8,5.4c-0.1,1.2,0.5,2.4,1.4,3.2c0.5,0.5,1.2,1,1.9,1.2c0.5,0.1,0.8,0.1,1.2,0c0.2,1.3,0.9,2.5,1.8,3.3
				c0.7,0.6,2.2,1.4,3.5,1.4c0,1.1,0.9,2.1,2,2.3c0.6,0.1,1.2,0.1,1.7,0.1c0.4,0,1-0.3,1.4-0.6l0.1,0.1c0.4,2.7,4,4.8,6.5,3.6
				c0.4,0.8,1.1,1.5,1.9,1.7c1.3,0.3,1.7-0.6,2.8-0.7c2-0.2,3.8,0.2,4.9-1.5c1.3,1.3,4.1,0.5,5.5-0.1c1.4-0.7,3.8-2.7,4.1-4.6
				c0.9-0.1,2-0.5,2.6-0.8c0.8-0.4,2.3-1.6,2.7-2.8c0.8,0.1,1.7-0.2,2.5-0.5c1.4-0.7,2.4-2.1,2.2-3.7c0-0.1,0-0.1-0.1-0.1
				c0.7-0.2,1.2-0.8,1.6-1.4c0.4-0.7,0.8-1.2,1.4-1.6c0.4-0.3,0.9-0.7,1.2-1.2c0.8-1.5,1.4-3.7,0.8-5.4c0.9-0.4,1.3-1.4,1.5-2.3
				c0.2-0.8,0.4-2.1,0-3C119.3,85.8,119.4,84,118.7,82.8 M98.3,99.8c-0.1,0.1-0.2,0.2-0.2,0.3c-0.3,0.1-0.6,0.4-0.8,0.7
				c-0.2,0.4-0.2,0.8-0.1,1.2c-0.2,0.1-0.5,0.2-0.7,0.4c-1.3,1-1.7,2.3-1.7,3.7c-0.3,0-0.6,0.1-0.9,0.2c-0.6,0-1.2,0.2-1.7,0.4
				c-0.4,0.2-0.8,0.5-1.1,0.9c0-0.1-0.1-0.2-0.1-0.3c-0.4-0.8-1.5-1.1-2.3-1.2c-0.9,0-1.7,0.5-2.4,1c-0.3,0.2-0.5,0.5-0.7,0.8
				c-0.2-0.2-0.3-0.3-0.5-0.4c-0.7-0.5-1.6-0.5-2.4-0.3c-0.1,0-0.3,0.1-0.4,0.1c-1.1-1.6-2.6-3-4.6-2.6c-0.3,0.1-0.5,0.2-0.7,0.3
				c-0.1-0.1-0.1-0.2-0.2-0.4c-0.1-0.1-0.1-0.1-0.2-0.2c0.1-0.2,0.1-0.5,0.2-0.7c0.6-1.5,0.8-3.4-0.4-4.4c0.1-0.1,0.1-0.1,0.2-0.1
				c3.5-0.9,6.8-1.8,10.5-1.9C91.3,97.1,94.6,98.6,98.3,99.8C98.3,99.7,98.3,99.8,98.3,99.8"/>
			<path class="st10" d="M87.8,47.6c-0.2-0.5-0.6-0.5-0.9-0.3c-0.2-0.5-1-0.7-1.3-0.1c-1.1,1.7-2.4,3.1-4.5,3.3
				c-1.2,0.1-2.7-0.6-3.9-0.3c-0.1-0.5-0.9-0.8-1.3-0.2c-3.1,4.1-7.6,6.1-12.3,3.3c0,0-0.1,0-0.1,0c-0.3-0.7-1.5-0.5-1.5,0.3
				c0,2.1,0.2,4.2,0,6.4c-0.4,3-2.9,6-6.1,4c-0.5-1.7-1.4-3.2-1.8-5c-0.2-1-0.2-2.1,0-3.1c0.3-1.3,1.5-1.4,2.5-2
				c0.7-0.4,0.5-1.4-0.2-1.6c-0.3-0.1-0.6-0.1-0.9-0.1c-3.5-4.3,1.2-11,6-12c0.2,0.2,0.5,0.3,0.8,0.2c0.5-0.1,1-0.2,1.6-0.3
				c0.7,0,1.3,0.2,1.9,0c0.7-0.1,0.7-1,0.4-1.4c-0.3-0.4-0.8-0.6-1.3-0.7c2.8-3.8,9.7-3.5,14.1-2.6c0.2,0.1,0.3,0.1,0.5,0.1
				c0.1,0,0.3,0.1,0.4,0.1c0.8,0.2,1.5-1,0.6-1.4c0,0,0,0,0,0c0.8-1.6,1.7-2.5,3.7-3c1.5-0.4,2.9-0.4,4.4-0.4
				c0.8,0.2,1.5,0.6,2.2,0.8c1,0.3,1.7,1,2.6,1.5c0.6,0.4,1.4-0.2,1.2-0.9c-0.2-0.6-0.6-1.1-1-1.5c4.1-0.1,8.7,2.7,7.5,7.3
				c-0.1,0.2,0,0.4,0.1,0.6c0.1,0.3,0.4,0.6,0.8,0.5c2.9-0.9,5.6-1.1,8.5-0.4c1.4,0.3,2.9,1.1,3.8,2.3c1.1,1.5,0.2,3-0.1,4.5
				c-0.1,0.2,0,0.5,0.1,0.7c-0.1,0.4,0.2,0.7,0.7,0.8c5.7,0.1,7.2,6.9,3.6,10.7c-0.4,0.4-0.3,1.3,0.4,1.4c2.2,0.5,2.8,2.2,2.8,4.2
				c0,2.4-1.4,3.3-3.6,3.2c-1.2-1-1.6-2.4-1.4-4.3c0-0.3-0.3-0.7-0.6-0.8c-5-0.8-8.9-4.3-9.3-9.5c-0.1-0.5-0.8-0.8-1.1-0.4
				c-0.1-0.5-0.3-0.9-0.6-1.2c-0.3-0.3-0.6-0.2-0.8,0.1c-0.1,0-0.2,0-0.2,0.1C99.4,53.8,90.2,54,87.8,47.6"/>
			<path class="st10" d="M119,58.8c-0.7-0.1-0.8-1-0.4-1.4c3.5-3.8,2.1-10.6-3.6-10.7c-0.5,0-0.7-0.4-0.7-0.8
				c-0.1-0.2-0.2-0.4-0.1-0.7c0.3-1.5,1.2-3,0.1-4.5c-0.9-1.2-2.4-1.9-3.8-2.3c-2.9-0.7-5.7-0.5-8.5,0.4c-0.4,0.1-0.7-0.1-0.8-0.5
				c-0.1-0.2-0.2-0.4-0.1-0.6c1.2-4.5-3.4-7.4-7.5-7.3c0.5,0.4,0.9,0.9,1,1.5c0.2,0.7-0.6,1.3-1.2,0.9c-0.9-0.5-1.6-1.2-2.6-1.5
				c-0.8-0.2-1.5-0.6-2.2-0.8c-1.5,0-2.9,0-4.4,0.4c-2.1,0.6-2.9,1.5-3.7,3c0,0,0,0,0,0c0.8,0.4,0.2,1.6-0.6,1.4
				c-0.1,0-0.3,0-0.4-0.1c-0.2,0-0.4,0-0.5-0.1c-4.4-0.8-11.3-1.2-14.1,2.6c0.5,0.1,1,0.3,1.3,0.7c0.4,0.4,0.3,1.3-0.4,1.4
				c-0.7,0.1-1.3-0.1-1.9,0c-0.5,0-1.1,0.2-1.6,0.3c-0.4,0.1-0.6,0-0.8-0.2c-4.8,1-9.5,7.7-6,12c0.3,0,0.6,0,0.9,0.1
				c0.7,0.2,0.9,1.2,0.2,1.6c-1,0.6-2.2,0.7-2.5,2c-0.2,1-0.2,2.1,0,3.1c0.4,1.8,1.3,3.3,1.8,5c3.2,2,5.7-1,6.1-4
				c0.3-2.1,0-4.2,0-6.4c0-0.8,1.2-1,1.5-0.3c0,0,0.1,0,0.1,0c4.8,2.7,9.2,0.8,12.3-3.3c0.4-0.6,1.2-0.3,1.3,0.2
				c1.2-0.2,2.7,0.4,3.9,0.3c2.1-0.2,3.4-1.6,4.5-3.3c0.4-0.6,1.1-0.4,1.3,0.1c0.3-0.2,0.8-0.1,0.9,0.3c2.3,6.4,11.6,6.2,16.2,2.7
				c0.1-0.1,0.2-0.1,0.2-0.1c0.2-0.2,0.5-0.4,0.8-0.1c0.4,0.4,0.6,0.7,0.6,1.2c0.3-0.4,1-0.1,1.1,0.4c0.5,5.2,4.3,8.7,9.3,9.5
				c0.3,0,0.6,0.5,0.6,0.8c-0.2,1.9,0.2,3.3,1.4,4.3c2.2,0.1,3.5-0.8,3.6-3.2C121.8,61,121.2,59.3,119,58.8 M120.7,57.6
				c5.8,2.8,1.5,13.9-3.2,10.3c0,0,0,0-0.1-0.1c-1.7-1-2.3-3-2.3-5.1c-5.5-0.6-10.3-5-9.6-10.8c-0.2,0.2-0.6,0.1-0.8-0.1
				c-4.7,5.3-16.2,3.8-18.1-3.4c-0.7,2.1-2.3,3.4-4.6,3.8c-1.4,0.3-4.3,0.2-5.4-1c-2.9,4.6-8.2,6.5-12.8,3.7
				c0.6,2.8,0.6,6.2-0.9,8.5c-1.9,2.8-5.5,3.8-8,1.3c0,0,0,0,0,0c-2.4-1.1-3.5-5.3-3.4-7.8c0.1-1.8,1-4,2.6-4.7
				c-4.1-5.2,1.6-13.8,7.8-13.8c0.4-0.2,0.9-0.4,1.4-0.5c2.3-4.9,9.7-6.1,14.9-4.7c0.2-1.9,2.2-3.6,4-4.3c2.5-1,6.4-1.5,8.8,0
				c0.2,0.1,0.4,0.4,0.4,0.6c0,0,0,0,0,0c5-1.5,11.6,1.8,11.3,7.3c2.9-1.5,7.3-1,9.9,0.2c3.2,1.4,5.5,5,3.6,8.2
				C122.3,45.4,124.1,53,120.7,57.6"/>
			<path class="st10" d="M57,66.6c0.3,0.6,0.6,1.2,0.9,1.7c0.9,2.3,1.8,6.5,0.7,6.6c-0.6,0-1,1-0.4,1.3c2.6,1.1,3.3-1.8,3.3-3.8
				c0-2.2-0.8-5.8-2.5-7.4C58,63.8,56.2,65.3,57,66.6"/>
			<path class="st10" d="M117.7,76.3c-2.2-3.1,0.4-5.2,0.2-8.4c-0.1-1.2-1.8-2-2.5-0.7c-1.7,3.7-2.8,7.5,0,10.8
				C116.5,79.4,118.7,77.7,117.7,76.3"/>
		</g>
	</g>
</g>
</svg>
```

### public/folder-preview/user3.svg

Installation target: `public/folder-preview/user3.svg`

```svg
<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 20.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 174 174" style="enable-background:new 0 0 174 174;" xml:space="preserve">
<style type="text/css">
	.st0{clip-path:url(#SVGID_2_);fill:#7CC5D8;}
	.st1{clip-path:url(#SVGID_4_);}
	.st2{fill:#F5BE92;}
	.st3{fill:#92653D;}
	.st4{fill:#4C9DD2;stroke:#4C9DD2;stroke-width:1.084;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}
	.st5{fill:#FFFFFF;stroke:#FFFFFF;stroke-width:2;stroke-linecap:round;stroke-miterlimit:10;}
	.st6{fill:#FFFFFF;}
	.st7{fill:url(#SVGID_5_);}
	.st8{fill:#624A2E;}
	.st9{fill:url(#SVGID_6_);}
	.st10{fill:#E48F67;}
	.st11{fill:#0A6F90;}
</style>
<g>
	<defs>
		<ellipse id="SVGID_1_" cx="87" cy="87" rx="87" ry="87"/>
	</defs>
	<clipPath id="SVGID_2_">
		<use xlink:href="#SVGID_1_"  style="overflow:visible;"/>
	</clipPath>
	<ellipse class="st0" cx="87" cy="87" rx="87" ry="87"/>
</g>
<g>
	<defs>
		<ellipse id="SVGID_3_" cx="87" cy="87" rx="87" ry="87"/>
	</defs>
	<clipPath id="SVGID_4_">
		<use xlink:href="#SVGID_3_"  style="overflow:visible;"/>
	</clipPath>
	<g class="st1">
		<g>
			<g>
				<ellipse class="st2" cx="54.4" cy="72.9" rx="7.9" ry="4.6"/>
				<ellipse class="st2" cx="119.8" cy="72.9" rx="7.9" ry="4.6"/>
			</g>
			<path class="st3" d="M110,32.5c6.7,1.1,10.5,5.7,12.1,12c4.2,16.3-4.5,51.7-34.6,52.1c-15.5,0.2-26.7-3.7-30.7-16.3
				c-4.1-12.6-5.7-32.8,3.1-44.1C70.9,21.9,94.3,21.8,110,32.5"/>
			<path class="st4" d="M74.4,115.6c-28.1,12.3-36.6,18.9-39.9,21.9c-5.1,4.6-8.2,22.1-11.2,36.5H87h63.7c-3-14.4-5.7-32-10.8-36.5
				c-3.3-3-11.5-9.4-39.6-21.7L74.4,115.6L74.4,115.6z"/>
			<g>
				<path class="st2" d="M73.5,91v20.9v12.5c7.5,8.9,19.8,9.2,27.3,0v-12.5V91C100.8,74.2,73.5,74.2,73.5,91"/>
				<path class="st2" d="M87.2,35c-45.9,0-29.4,59.8-26.4,64.2c3.3,4.9,19,13.4,26.4,13.4s23.1-9.6,26.4-14.5
					C116.5,93.7,133,35,87.2,35"/>
			</g>
			<path class="st3" d="M64.8,49.4c8.1,4.9,14.3-2.4,21.6,0.7c7.3,3.1,28.2-5.4,32.4,27.8c6.9-24-4.7-44.1-31-45.3
				c-28-1.2-39.4,20.7-31.6,44.6C55.7,64.3,58.9,55.8,64.8,49.4"/>
			<g>
				<path class="st5" d="M72.2,115.3l-9.7,5.2L76.6,140l10.7-10.1L72.2,115.3L72.2,115.3z"/>
				<path class="st5" d="M102.3,115.3l9.7,5.2L97.9,140l-10.7-10.1C87.2,129.9,102.3,115.3,102.3,115.3z"/>
			</g>
		</g>
		<path class="st3" d="M64.1,47.4c0.6,4,6.5,4.6,9.7,4.9c6.2,0.6,13.8-1.8,18.9-5.3c0.4-0.3,0.2-0.8-0.2-0.9
			c-5.4-0.3-10.2,3.4-15.6,3.9c-3.9,0.3-9.2-0.2-12.2-2.9C64.4,46.9,64.1,47.1,64.1,47.4"/>
		<g>
			<g>
				<path class="st6" d="M68.5,77.1c0,0,1.5,2.5,6.1,2.5c4.6,0,5.4-2.2,5.4-2.9c0,0-1.8-3-5.4-3S68.5,77.1,68.5,77.1"/>
				<g>
					<g>
						
							<radialGradient id="SVGID_5_" cx="74.33" cy="99.38" r="2.615" gradientTransform="matrix(1 0 0 -1 0 176)" gradientUnits="userSpaceOnUse">
							<stop  offset="0" style="stop-color:#624A2E"/>
							<stop  offset="3.600000e-02" style="stop-color:#6D5633"/>
							<stop  offset="0.122" style="stop-color:#816B3D"/>
							<stop  offset="0.223" style="stop-color:#907C45"/>
							<stop  offset="0.348" style="stop-color:#9B884A"/>
							<stop  offset="0.523" style="stop-color:#A18F4D"/>
							<stop  offset="1" style="stop-color:#A3914E"/>
						</radialGradient>
						<circle class="st7" cx="74.3" cy="76.6" r="2.6"/>
						<path class="st8" d="M74.3,74.3c1.3,0,2.4,1.1,2.4,2.4S75.6,79,74.3,79C73,79,72,77.9,72,76.6C72,75.3,73,74.3,74.3,74.3
							 M74.3,73.7c-1.6,0-2.9,1.3-2.9,2.9s1.3,2.9,2.9,2.9c1.6,0,2.9-1.3,2.9-2.9C77.2,75,75.9,73.7,74.3,73.7z"/>
					</g>
					<circle cx="74.3" cy="76.6" r="1.2"/>
				</g>
			</g>
			<g>
				<path class="st6" d="M105.8,77.1c0,0-1.5,2.5-6.1,2.5c-4.6,0-5.4-2.2-5.4-2.9c0,0,1.8-3,5.4-3C103.2,73.7,105.8,77.1,105.8,77.1
					"/>
				<g>
					<g>
						
							<radialGradient id="SVGID_6_" cx="-471.41" cy="99.38" r="2.615" gradientTransform="matrix(1 0 0 -1 0 176)" gradientUnits="userSpaceOnUse">
							<stop  offset="0" style="stop-color:#624A2E"/>
							<stop  offset="3.600000e-02" style="stop-color:#6D5633"/>
							<stop  offset="0.122" style="stop-color:#816B3D"/>
							<stop  offset="0.223" style="stop-color:#907C45"/>
							<stop  offset="0.348" style="stop-color:#9B884A"/>
							<stop  offset="0.523" style="stop-color:#A18F4D"/>
							<stop  offset="1" style="stop-color:#A3914E"/>
						</radialGradient>
						<circle class="st9" cx="99.9" cy="76.6" r="2.6"/>
						<path class="st8" d="M99.9,74.3c1.3,0,2.4,1.1,2.4,2.4s-1.1,2.4-2.4,2.4s-2.4-1.1-2.4-2.4S98.6,74.3,99.9,74.3 M99.9,73.7
							c-1.6,0-2.9,1.3-2.9,2.9s1.3,2.9,2.9,2.9c1.6,0,2.9-1.3,2.9-2.9C102.8,75,101.5,73.7,99.9,73.7z"/>
					</g>
					<circle cx="99.9" cy="76.6" r="1.2"/>
				</g>
			</g>
			<g>
				<path class="st10" d="M82.1,89.1c-0.7,0.4-0.9,1.2-0.1,1.7c1.2,0.9,3,1,4.5,1c1.5,0,3.4-0.1,4.7-1c0.7-0.4,1.2-1.8,0.2-2.2
					c-0.2-0.1-0.5,0-0.4,0.3c0,0.3,0.3,0.6,0.3,0.9c-0.1,0.4-0.7,0.6-1,0.7c-1,0.4-2.1,0.4-3.2,0.5c-0.9,0-5.8,0.1-4.8-1.7
					C82.2,89.2,82.1,89.1,82.1,89.1"/>
				<path class="st10" d="M78.6,101c5,3.7,12.7,2.7,17.5-0.8c0.1-0.1,0-0.3-0.1-0.2c-5.9,2.5-11.2,3.2-17.2,0.7
					C78.5,100.6,78.4,100.9,78.6,101"/>
			</g>
			<g>
				<path class="st3" d="M63.3,66.5c5.7-0.8,11.1-1.6,16.3,1.3c0.5,0.3,0.9-0.5,0.5-0.8c-4.4-2.7-12.4-3.8-16.8-0.7
					C63.2,66.4,63.2,66.5,63.3,66.5"/>
				<path class="st3" d="M110.7,66.4c-4.4-3.1-12.5-2-16.8,0.7c-0.5,0.3-0.1,1.1,0.5,0.8c5.3-3,10.7-2.1,16.3-1.3
					C110.8,66.5,110.8,66.4,110.7,66.4"/>
			</g>
		</g>
		<path class="st11" d="M99.8,87.9c0.2,0,0.5,0,0.8,0c7.1-0.6,8.8-3.8,9.6-7.8c0.9-4.4,0.9-5.9,2.1-6.4c0.8-0.3,1-1.3,1-2.4
			c0-1.1-0.1-1.3-1.4-1.7c-1.1-0.4-7.1-0.9-11.7-0.6l0,1.2c3.6-0.2,7,0.2,8,0.9c2.3,1.5,1.6,8.6-0.3,12.1c-1.3,2.4-4.8,3.7-8,3.7
			L99.8,87.9 M86.6,71.2c-1.6,0-8-1.8-12.5-2.2c-0.3,0-0.7-0.1-1-0.1l0,1.2c3.7,0.2,7.5,1,8.8,3c2.2,3.2-1.7,11.2-5.2,12.9
			c-1.1,0.5-2.5,0.8-3.9,0.8l0,1.1c6.1,0,8.4-4.4,9.1-5.9c1.4-2.8,1.1-6.6,4.6-6.6c3.5,0,3,3.7,4.3,6.5c0.7,1.5,2.7,6.1,9,5.9l0-1.1
			c-1.6,0-3.1-0.2-4.1-0.8c-3.4-1.7-6.8-9.6-4.4-12.9c1.4-2,5.2-2.8,8.9-3l0-1.2c-0.3,0-0.6,0-0.8,0.1
			C95.2,69.3,90.2,71.1,86.6,71.2 M73.1,68.9c-4.5-0.2-10.4,0.3-11.5,0.7c-1.4,0.5-1.5,0.6-1.6,1.8c-0.1,1.1,0.1,2.1,0.9,2.4
			c1.1,0.4,1.1,1.9,1.7,6.3c0.5,4,2.1,7.2,9.1,7.7c0.4,0,0.7,0,1,0l0-1.1c-3.2,0-6.8-1.2-8.1-3.7c-1.7-3.5-1.9-10.6,0.4-12.1
			c1-0.6,4.4-1.1,7.9-0.9L73.1,68.9"/>
		<g>
			<path class="st3" d="M116.4,60.3c-1.3-0.2-2.4-1-3.3-1.9c-0.5-0.5-0.9-1.1-1.1-1.8c-0.2-0.7,0-1.2-0.6-1.8
				c-0.3-0.3-0.8-0.4-1.2-0.1c0,0,0,0,0,0c0-0.2,0.1-0.5,0.1-0.7c0.2-0.9-0.8-1.5-1.5-0.9c-0.4,0.3-0.7,0.7-0.8,1.2
				c0-0.8-0.6-1.5-1.6-1.3c-0.8,0.2-2.1,0.1-3.2-0.3c0-0.1,0-0.3,0-0.4c-0.4-1.3-1.3-2-1.9-3.2c-0.5-1.1-2.4-0.8-2.6,0.3
				c0,0.1,0,0.1,0,0.1c-0.2-0.4-0.4-0.8-0.7-1.2c-0.4-0.5-1.2-0.5-1.4,0.2c-0.2,0.5-0.2,1-0.1,1.5c-0.4,0.2-0.9,0.3-1.4,0.5
				c-0.1,0-0.1-0.1-0.2-0.1c-1.7-0.7-3.5-1.3-4.9-2.5c-0.5-0.4-1.2-0.4-1.6-0.1c-0.8-0.5-1.9-0.5-2.6,0.5c-2.5,3.7-4.4,0.3-6.3-0.7
				c-0.8-0.4-1.9,0.1-1.9,1.1c0,0.2,0,0.4,0.1,0.5c-0.2-0.2-0.3-0.4-0.4-0.6c-0.6-1-1.8-1-2.5-0.3c-1.7,1.4-3.8,2-6,2.3
				c-0.3,0-0.6,0-0.8,0c0.3-0.3,0.6-0.8,0.4-1.2c-0.1-0.2,0-0.1,0,0.1c0-0.5-0.3-1-0.8-1.1c-0.9-0.2-1.7-0.7-2.6-0.8
				c-0.6-0.1-1.2,0.6-0.7,1.1c0.1,0.1,0.2,0.2,0.2,0.2c0,0.1,0,0.2,0,0.3c-0.6-0.5-1.3-1.1-2-1.7c-0.4-0.3-1-0.2-1.1,0.3
				c-1.7,7.2,9.1,6,14.1,3.8c3.5,4.3,11.1,5.2,13.3-0.3c1.3,1.8,4.2,2.1,6.8,1.5c0.7-0.1,1.3-0.3,1.8-0.6c0.6,1,1.4,1.9,2.2,2.5
				c2.3,1.6,5.1,1.8,7.7,0.9c0.3-0.1,0.6-0.3,0.7-0.6c-0.3,1.5,0.4,3.3,1.3,4.5c1.6,2,4.2,3.5,6.8,3.3
				C117.3,62.6,117.8,60.5,116.4,60.3"/>
			<path class="st3" d="M61.4,38.9c0-0.1,0-0.1,0-0.2c0.4-0.1,0.6-0.4,0.7-0.8c0.7,0.2,1.5-0.2,1.5-1.2c-0.1-2,0.2-3.4,2.3-3.9
				c1.6-0.4,3.5-0.1,5.2,0c1.2,0.1,1.7-1.5,0.9-2.3c-0.6-0.6-1.4-1-2.2-1.3c0.4-0.3,0.8-0.6,1.1-0.7c0.3-0.1,0.5-0.1,0.8-0.2
				c-0.1,0.5-0.1,1.1,0,1.8c0.1,0.7,1.2,0.5,1.2-0.2c0-0.6,0.1-1.1,0.4-1.5c0.6,0.2,1.1,0.4,1.8,0.2c0.4-0.2,0.7-0.5,0.7-0.9
				c0.6,0.1,1.2,0.4,1.8,0.8c0.6,0.4,1,1.1,1.7,1.3c0.6,0.2,1.1-0.3,1.2-0.9c0.1-1-0.6-1.7-1.5-2.3c0.8-1.3,2.5-1.6,4-1.1
				c0,0.5,0.3,0.9,0.8,1.1c0.6,0.1,1.2,0.3,1.8,0.3c0.1,0,0.2,0,0.3,0c0,0.7,0.2,1.5,0.4,2.2c0.2,0.6,1.1,0.5,1.1-0.1
				c-0.1-2.8,2-3.4,4.3-2.8c1.1,0.3,2.2,0.9,3.1,1.6c0.8,0.7,1.3,1.6,2.1,2.1c0.4,0.3,1,0,1.2-0.5c0.8-3.4-4.6-5.6-7.1-5.9
				c-1.4-0.2-2.9,0.2-4,1.2c-0.1,0.1-0.2,0.2-0.3,0.3c0-0.1-0.1-0.2-0.2-0.2c-2.4-2.5-8.4-2.5-9.3,1.1c-0.8-0.2-1.6-0.3-2.2-0.3
				c-0.4,0-0.8,0.1-1.1,0.2c-1.3-0.3-3,0-3.9,0.4c-0.9,0.4-1.8,1.1-2.4,1.9c-0.1,0.2-0.2,0.4-0.3,0.6c-1.6-0.1-3.2,0.2-4.5,0.7
				c-3.1,1.1-3.4,3.9-3,6.7c-3.1,0.7-6,5.5-4.7,7.9c0.1,0.9,0.5,1.8,1.2,2.4c-1.4,0.3-2.4,1.1-3,2.2c-2,2-1.9,6,0.1,8.2
				c0.2,0.2,0.3,0.4,0.5,0.6c0.2,0.1,0.3,0.2,0.5,0.2c1.2,0.3,2.5-0.8,1.7-2.1c-0.7-1.2-1-2.5-0.8-3.9c0.1-0.5,0.2-0.8,0.4-1.1
				c0.1-0.1,0.3-0.1,0.4-0.1c0.8-0.1,1.2-0.6,1.3-1.2c0.2-0.1,0.4-0.1,0.5-0.2c1.3-0.3,1.2-1.9,0.3-2.5c0.4-0.5,0.6-1.4,0.1-2
				c-1.4-1.7,0.1-4.6,2-5.5C60.5,39.5,61.3,39.4,61.4,38.9"/>
		</g>
	</g>
</g>
</svg>
```

### public/folder-preview/user4.svg

Installation target: `public/folder-preview/user4.svg`

```svg
<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 20.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 174 174" style="enable-background:new 0 0 174 174;" xml:space="preserve">
<style type="text/css">
	.st0{clip-path:url(#SVGID_2_);fill:#CE8A9E;}
	.st1{clip-path:url(#SVGID_4_);}
	.st2{fill:#924A0B;}
	.st3{fill:#179E85;stroke:#179E85;stroke-width:1.122;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}
	.st4{fill:#FFC785;}
	.st5{fill:#FFFFFF;}
	.st6{fill:url(#SVGID_5_);}
	.st7{fill:#2E6232;}
	.st8{fill:url(#SVGID_6_);}
	.st9{fill:#E48F67;}
	.st10{fill:#F0463A;}
</style>
<g>
	<defs>
		<ellipse id="SVGID_1_" cx="87" cy="87" rx="87" ry="87"/>
	</defs>
	<clipPath id="SVGID_2_">
		<use xlink:href="#SVGID_1_"  style="overflow:visible;"/>
	</clipPath>
	<ellipse class="st0" cx="87" cy="87" rx="87" ry="87"/>
</g>
<g>
	<defs>
		<ellipse id="SVGID_3_" cx="87" cy="87" rx="87" ry="87"/>
	</defs>
	<clipPath id="SVGID_4_">
		<use xlink:href="#SVGID_3_"  style="overflow:visible;"/>
	</clipPath>
	<g class="st1">
		<g>
			<path class="st2" d="M122.3,143.2c6.9-78.8,0.6-107.8-34.4-106.8c-45.5,1.2-45.3,40.4-33.1,109.4
				C75.1,143.8,107.4,143,122.3,143.2"/>
			<path class="st3" d="M98.7,128.5c-0.3,0.4-26.2,0.8-26.5,1.2c-8.2,11.6-25.8,16.7-39.8,19.9c-14,3.1-14.5,20.8-14.5,32.6h136
				c0-11.8-0.3-29.5-14.5-32.6C125.1,146.4,106.5,140.7,98.7,128.5L98.7,128.5z"/>
			<g>
				<path class="st4" d="M72.2,103.6V126v11c-4.7,8.9,8.6,37.3,13.7,37.2c4.8-0.1,17.9-26,13.5-37.2v-11v-22.4
					C99.5,85.6,72.2,85.6,72.2,103.6"/>
				<path class="st4" d="M121.9,88.4c-2.7-1.2-6.6,1.7-8.6,6.4c-2,4.7-1.5,9.5,1.3,10.7c2.7,1.2,6.6-1.7,8.6-6.4
					C125.3,94.4,124.7,89.6,121.9,88.4"/>
				<path class="st4" d="M49.7,88.4c2.7-1.2,6.6,1.7,8.6,6.4c2,4.7,1.5,9.5-1.3,10.7c-2.7,1.2-6.6-1.7-8.6-6.4
					C46.4,94.4,47,89.6,49.7,88.4"/>
			</g>
			<path class="st2" d="M51.5,92.4C44.6,54.6,67,42.5,85.9,42.5c21.3,0,43.3,16.3,33.1,51.1c-20.3-1-38.8-13-56.7-36.8
				C59.2,69,57.1,84.7,51.5,92.4"/>
			<path class="st4" d="M85.9,126.7c-8.9,0-27.6-14-33.4-33.9c-5.9-20.2,5.2-49.1,33.4-49.1c28.2,0,39.3,28.9,33.4,49.1
				C113.5,112.8,94.7,126.7,85.9,126.7"/>
		</g>
		<g>
			<g>
				<path class="st5" d="M66.7,87.2c0,0,1.5,2.5,6.1,2.5c4.6,0,5.4-2.2,5.4-2.9c0,0-1.8-3-5.4-3C69.3,83.8,66.7,87.2,66.7,87.2"/>
				<g>
					<g>
						
							<radialGradient id="SVGID_5_" cx="72.28" cy="89.31" r="2.441" gradientTransform="matrix(1 0 0 -1 0 176)" gradientUnits="userSpaceOnUse">
							<stop  offset="0" style="stop-color:#2E6232"/>
							<stop  offset="1.900000e-02" style="stop-color:#326834"/>
							<stop  offset="0.106" style="stop-color:#407D3E"/>
							<stop  offset="0.209" style="stop-color:#4B8E45"/>
							<stop  offset="0.336" style="stop-color:#529A4A"/>
							<stop  offset="0.514" style="stop-color:#57A14D"/>
							<stop  offset="1" style="stop-color:#58A34E"/>
						</radialGradient>
						<circle class="st6" cx="72.6" cy="86.7" r="2.6"/>
						<path class="st7" d="M72.6,84.4c1.3,0,2.4,1.1,2.4,2.4c0,1.3-1.1,2.4-2.4,2.4c-1.3,0-2.4-1.1-2.4-2.4
							C70.3,85.4,71.3,84.4,72.6,84.4 M72.6,83.9c-1.6,0-2.9,1.3-2.9,2.9c0,1.6,1.3,2.9,2.9,2.9c1.6,0,2.9-1.3,2.9-2.9
							C75.5,85.1,74.2,83.9,72.6,83.9z"/>
					</g>
					<circle cx="72.6" cy="86.7" r="1.2"/>
				</g>
			</g>
			<g>
				<path class="st5" d="M104,87.2c0,0-1.5,2.5-6.1,2.5c-4.6,0-5.4-2.2-5.4-2.9c0,0,1.8-3,5.4-3S104,87.2,104,87.2"/>
				<g>
					<g>
						
							<radialGradient id="SVGID_6_" cx="-30.309" cy="89.265" r="2.619" gradientTransform="matrix(-1 0 0 -1 67.85 176)" gradientUnits="userSpaceOnUse">
							<stop  offset="0" style="stop-color:#2E6232"/>
							<stop  offset="1.900000e-02" style="stop-color:#326834"/>
							<stop  offset="0.106" style="stop-color:#407D3E"/>
							<stop  offset="0.209" style="stop-color:#4B8E45"/>
							<stop  offset="0.336" style="stop-color:#529A4A"/>
							<stop  offset="0.514" style="stop-color:#57A14D"/>
							<stop  offset="1" style="stop-color:#58A34E"/>
						</radialGradient>
						<path class="st8" d="M98.2,89.3c-1.4,0-2.6-1.2-2.6-2.6s1.2-2.6,2.6-2.6c1.4,0,2.6,1.2,2.6,2.6S99.6,89.3,98.2,89.3"/>
						<path class="st7" d="M98.2,84.4c1.3,0,2.4,1.1,2.4,2.4s-1.1,2.4-2.4,2.4c-1.3,0-2.4-1.1-2.4-2.4
							C95.8,85.4,96.9,84.4,98.2,84.4 M98.2,83.9c-1.6,0-2.9,1.3-2.9,2.9s1.3,2.9,2.9,2.9c1.6,0,2.9-1.3,2.9-2.9
							C101,85.1,99.7,83.9,98.2,83.9z"/>
					</g>
					<circle cx="98.2" cy="86.7" r="1.2"/>
				</g>
			</g>
			<path class="st9" d="M80.3,97.2c-0.7,0.4-0.9,1.2-0.1,1.7c1.2,0.9,3,1,4.5,1c1.5,0,3.4-0.1,4.7-1c0.7-0.4,1.2-1.8,0.2-2.2
				c-0.2-0.1-0.5,0-0.4,0.3c0,0.3,0.3,0.6,0.3,0.9c-0.1,0.4-0.7,0.6-1,0.7c-1,0.4-2.1,0.4-3.2,0.5c-0.9,0-5.8,0.1-4.8-1.7
				C80.5,97.3,80.4,97.2,80.3,97.2"/>
			<g>
				<path class="st2" d="M61.6,80.6c5.5-1.2,11.3-1.7,16.4,1.2c0.3,0.2,0.6-0.3,0.3-0.5C73.8,78.5,66.2,77.7,61.6,80.6
					C61.5,80.5,61.5,80.6,61.6,80.6"/>
				<path class="st2" d="M109,80.5c-4.7-2.8-12.3-2-16.8,0.8c-0.3,0.2,0,0.7,0.3,0.5C97.7,78.9,103.5,79.3,109,80.5
					C109,80.6,109.1,80.5,109,80.5"/>
			</g>
		</g>
		<path class="st2" d="M121.5,74.5c1,0,1-1.5,0-1.5c-0.4,0-0.6,0.2-0.7,0.5c-0.5-2.5-1.1-4.9-1.7-7.3c0.2-0.4,0.1-1-0.1-1.5
			c-1.6-2.8-3.4-5.5-5.4-8.1c-0.7-1.5-1.8-2.8-2.5-4.4c-0.4-0.9-1.2-1.1-1.9-0.9c-0.5-0.5-0.9-1-1.4-1.5c-0.6-0.6-1.2-0.7-1.8-0.5
			c-0.6-0.7-1.3-1.4-2-2c-0.4-0.4-0.8-0.5-1.2-0.6c-0.1-0.2-0.3-0.4-0.4-0.6c-0.9-1.3-2.3-1.1-3.1-0.3c-0.1-0.1-0.3-0.3-0.4-0.4
			c-0.5-0.5-1.3-0.6-2-0.4c-1.1-1.1-2.3-2.1-3.6-2.9c-1.1-0.6-2-0.2-2.5,0.6c-0.5-0.4-1.2-0.3-1.7,0c-0.1-0.2-0.2-0.3-0.3-0.5
			c-0.8-1.2-2.2-0.9-2.9,0c-0.2,0-0.4-0.1-0.7-0.1c-0.4-0.4-0.8-0.8-1.2-1.2c-0.9-0.8-2.3-0.4-2.7,0.6c-0.9-0.2-1.8-0.3-2.7-0.6
			c-1.4-0.4-2.3,0.9-2.2,2c0,0-0.1,0-0.1,0c-1.9,0-4,0.7-4.7,1.8c-0.4,0.4-0.7,0.9-0.5,1.5c0.1,0.2,0.2,0.5,0.3,0.7
			c-0.2-0.2-0.4-0.4-0.5-0.7c-0.9-1.1-2.2-0.2-2.4,0.9c-0.7-0.2-1.4,0.2-1.7,0.9c-0.2-0.2-0.3-0.3-0.5-0.5c-0.9-0.8-2.8,0-2.3,1.3
			c0.2,0.6,0.5,1.2,0.7,1.8c-0.2-0.3-0.4-0.5-0.6-0.8c-1-1.3-2.8-0.2-2.1,1.3c0.1,0.3,0.3,0.6,0.4,0.9c-0.1,0.2-0.2,0.4-0.2,0.7
			c0,0,0,0-0.1-0.1c-0.8-0.9-2-0.1-1.9,0.9c-0.1-0.1-0.2-0.2-0.3-0.4c-0.9-0.9-2.4,0.3-1.8,1.4c0.3,0.5,0.6,0.9,0.9,1.4
			c-0.2,0.1-0.3,0.2-0.4,0.3c0,0,0,0,0,0c-0.8-1-2.3,0.3-1.7,1.3c0.3,0.4,0.5,0.9,0.8,1.3c-0.4-0.4-0.8-0.7-1.1-1.1
			c-0.9-0.9-2.1,0.2-1.7,1.3c0.1,0.3,0.3,0.6,0.5,1c-0.3,0.2-0.5,0.6-0.3,1c0.1,0.2,0.2,0.5,0.3,0.7c-0.5,0-1,0.4-1,0.9
			c-0.6,0-1,0.6-0.7,1.2c0,0.2,0.1,0.4,0.3,0.6c-0.3-0.1-0.5,0-0.8,0.1c-0.7-0.6-1.4-1.2-2.1-1.9c-0.1-0.1-0.4,0-0.3,0.2
			c0.4,1.2,1,2.3,1.6,3.2c-1.8,6.1-2.6,12.5-1.8,18.7c0,0,0,0,0,0.1c0,0,0,0,0,0c0,0,0,0.1,0,0.1c-0.1,4.6,0.6,9.1,3.4,12.9
			c0.4,0.5,1.2,0.8,1.7,0.2c2.6-2.9,1.8-7,1.2-10.6c-1.1-6.1-1.3-12.3-1.3-18.5c6.8,3.9,17.6-0.1,24.4-2.8c9-3.5,25.4-7.5,34.4-1
			c0,0,0.1,0.1,0.1,0.1c0.1,0.1,0.3,0.2,0.4,0.3c0.3,0.2,0.5,0.4,0.8,0.6c0.2,0.2,0.3,0.4,0.5,0.6c0.1,0.1,0.1,0.1,0.2,0.2
			c0.1,1.5,0.2,3,0.3,4.5c0,4.1-0.4,8.3-0.5,12.3c0,0.9-0.5,5.6-0.6,6.7c-0.1,1.7,0.3,3.8,1.5,5c0.8,0.8,2,0.4,2.5-0.4
			c0.1-0.2,1-1.1,1.1-1.5c2-6.3,1.6-13,0.4-19.5C121,74.4,121.2,74.5,121.5,74.5"/>
		<g>
			<path class="st10" d="M95.3,111.5c0,0-7.7-4.7-8.8-3.2c-0.1,0.1-0.1,0.2-0.2,0.3c-0.1-0.1-0.1-0.2-0.2-0.3
				c-1.1-1.5-8.8,3.2-8.8,3.2s4.3,4,9,3.9C91.3,115.6,95.3,111.5,95.3,111.5C95.3,111.5,95.3,111.5,95.3,111.5
				C95.3,111.5,95.3,111.5,95.3,111.5 M91.8,111.5c0,0-2.7,1.1-5.7,1.1c-1.8,0-3.6-0.6-5.2-1.3c0,0,2.5-1.2,5.5-1.2
				C88.2,110.1,90.2,111,91.8,111.5"/>
			<path class="st5" d="M86.3,110.1c-2.9,0-5.5,1.2-5.5,1.2c1.6,0.7,3.4,1.3,5.2,1.3c3,0,5.7-1.1,5.7-1.1
				C90.2,111,88.2,110.1,86.3,110.1"/>
		</g>
	</g>
</g>
</svg>
```

### public/folder-preview/user5.svg

Installation target: `public/folder-preview/user5.svg`

```svg
<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 20.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 174 174" style="enable-background:new 0 0 174 174;" xml:space="preserve">
<style type="text/css">
	.st0{clip-path:url(#SVGID_2_);fill:#8FC9C3;}
	.st1{clip-path:url(#SVGID_4_);}
	.st2{fill:#9368A0;}
	.st3{fill:#DEA146;}
	.st4{fill:#FFC785;}
	.st5{fill:#FFFFFF;}
	.st6{fill:url(#SVGID_5_);}
	.st7{fill:#025784;}
	.st8{fill:url(#SVGID_6_);}
	.st9{fill:#E48F67;}
	.st10{fill:#5F5659;}
	.st11{fill:#F0463A;}
</style>
<g>
	<defs>
		<ellipse id="SVGID_1_" cx="87" cy="87" rx="87" ry="87"/>
	</defs>
	<clipPath id="SVGID_2_">
		<use xlink:href="#SVGID_1_"  style="overflow:visible;"/>
	</clipPath>
	<ellipse class="st0" cx="87" cy="87" rx="87" ry="87"/>
</g>
<g>
	<defs>
		<ellipse id="SVGID_3_" cx="87" cy="87" rx="87" ry="87"/>
	</defs>
	<clipPath id="SVGID_4_">
		<use xlink:href="#SVGID_3_"  style="overflow:visible;"/>
	</clipPath>
	<g class="st1">
		<g>
			<path class="st2" d="M98.9,122.2c-0.3,0.4-26.1,0.8-26.4,1.2C64.4,135,46.9,140.1,33,143.2c-13.9,3.1-14.4,20.7-14.4,32.4h135.2
				c0-11.7-0.3-29.3-14.4-32.4C125.2,140,106.6,134.3,98.9,122.2"/>
			<path class="st3" d="M132.8,117.7c-0.5-19.1-5.2-81.2-46.9-82.2c-38.7,1.2-45.7,63.3-44.4,83.5C58.2,121,116.3,121,132.8,117.7"
				/>
			<g>
				<path class="st4" d="M72.6,97.5v22.2v11c6.8,13.9,19,14.2,27.1,0v-11V97.5C99.7,79.6,72.6,79.6,72.6,97.5"/>
				<ellipse class="st4" cx="119.8" cy="90.9" rx="9.7" ry="5.6"/>
				<ellipse class="st4" cx="53.8" cy="90.9" rx="9.7" ry="5.6"/>
				<path class="st4" d="M86.2,120.4c-8.8,0-27.4-13.9-33.2-33.7c-5.8-20.1,5.1-48.8,33.2-48.8c28.1,0,39,28.8,33.2,48.8
					C113.6,106.6,95,120.4,86.2,120.4"/>
			</g>
		</g>
		<g>
			<g>
				<g>
					<path class="st5" d="M67.6,82.7c0,0,1.5,2.5,6.1,2.5c4.6,0,5.4-2.2,5.4-2.9c0,0-1.8-3-5.4-3S67.6,82.6,67.6,82.7"/>
					<g>
						<g>
							
								<radialGradient id="SVGID_5_" cx="73.05" cy="126.198" r="2.441" gradientTransform="matrix(1 0 0 -1 0 176)" gradientUnits="userSpaceOnUse">
								<stop  offset="0" style="stop-color:#2E624A"/>
								<stop  offset="7.000001e-03" style="stop-color:#2F634D"/>
								<stop  offset="8.000000e-02" style="stop-color:#396768"/>
								<stop  offset="0.161" style="stop-color:#416B7D"/>
								<stop  offset="0.258" style="stop-color:#476E8E"/>
								<stop  offset="0.377" style="stop-color:#4B709A"/>
								<stop  offset="0.544" style="stop-color:#4D71A1"/>
								<stop  offset="1" style="stop-color:#4E71A3"/>
							</radialGradient>
							<circle class="st6" cx="73.4" cy="82.2" r="2.6"/>
							<path class="st7" d="M73.4,79.9c1.3,0,2.4,1.1,2.4,2.4c0,1.3-1.1,2.4-2.4,2.4c-1.3,0-2.4-1.1-2.4-2.4S72.1,79.9,73.4,79.9
								 M73.4,79.3c-1.6,0-2.9,1.3-2.9,2.9c0,1.6,1.3,2.9,2.9,2.9c1.6,0,2.9-1.3,2.9-2.9C76.3,80.6,75,79.3,73.4,79.3z"/>
						</g>
						<circle cx="73.4" cy="82.2" r="1.2"/>
					</g>
				</g>
				<g>
					<path class="st5" d="M104.9,82.7c0,0-1.5,2.5-6.1,2.5c-4.6,0-5.4-2.2-5.4-2.9c0,0,1.8-3,5.4-3
						C102.3,79.3,104.9,82.6,104.9,82.7"/>
					<g>
						<g>
							
								<radialGradient id="SVGID_6_" cx="-31.139" cy="93.785" r="2.615" gradientTransform="matrix(-1 0 0 -1 67.85 176)" gradientUnits="userSpaceOnUse">
								<stop  offset="0" style="stop-color:#2E624A"/>
								<stop  offset="7.000001e-03" style="stop-color:#2F634D"/>
								<stop  offset="8.000000e-02" style="stop-color:#396768"/>
								<stop  offset="0.161" style="stop-color:#416B7D"/>
								<stop  offset="0.258" style="stop-color:#476E8E"/>
								<stop  offset="0.377" style="stop-color:#4B709A"/>
								<stop  offset="0.544" style="stop-color:#4D71A1"/>
								<stop  offset="1" style="stop-color:#4E71A3"/>
							</radialGradient>
							<path class="st8" d="M99,84.8c-1.4,0-2.6-1.2-2.6-2.6c0-1.4,1.2-2.6,2.6-2.6c1.4,0,2.6,1.2,2.6,2.6
								C101.6,83.7,100.4,84.8,99,84.8"/>
							<path class="st7" d="M99,79.9c1.3,0,2.4,1.1,2.4,2.4c0,1.3-1.1,2.4-2.4,2.4c-1.3,0-2.4-1.1-2.4-2.4S97.7,79.9,99,79.9
								 M99,79.3c-1.6,0-2.9,1.3-2.9,2.9c0,1.6,1.3,2.9,2.9,2.9c1.6,0,2.9-1.3,2.9-2.9C101.9,80.6,100.6,79.3,99,79.3z"/>
						</g>
						<circle cx="99" cy="82.2" r="1.2"/>
					</g>
				</g>
				<path class="st9" d="M81.2,94.7c-0.7,0.4-0.9,1.2-0.1,1.7c1.2,0.9,3,1,4.5,1c1.5,0,3.4-0.1,4.7-1c0.7-0.4,1.2-1.8,0.2-2.2
					c-0.2-0.1-0.5,0-0.4,0.3c0,0.3,0.3,0.6,0.3,0.9c-0.1,0.4-0.7,0.6-1,0.7c-1,0.4-2.1,0.4-3.2,0.5c-0.9,0-5.8,0.1-4.8-1.7
					C81.3,94.8,81.3,94.7,81.2,94.7"/>
				<g>
					<path class="st10" d="M62.4,74.1c5.5-1.2,11.3-1.7,16.4,1.2c0.3,0.2,0.6-0.3,0.3-0.5C74.6,72,67,71.2,62.4,74.1
						C62.3,74,62.4,74.1,62.4,74.1"/>
					<path class="st10" d="M109.8,74c-4.7-2.8-12.3-2-16.8,0.8c-0.3,0.2,0,0.7,0.3,0.5C98.5,72.4,104.3,72.8,109.8,74
						C109.9,74.1,109.9,74,109.8,74"/>
				</g>
			</g>
			<g>
				<path class="st11" d="M95.2,107L95.2,107c0.2-0.1,0.4-0.1,0.4-0.1c-0.2,0.1-0.5,0.1-0.8,0.1l-1.9-0.2c-2.6-0.6-5.4-2.2-5.4-2.2
					l-1,1.2l-1-1.2c0,0-5.1,3-8,2.3c3.8,3.5,8.7,3.3,8.7,3.3c4.6,0.1,9.2-3.3,9.2-3.3C95.5,106.9,95.4,107,95.2,107 M78.7,107.1
					C78.7,107.1,78.7,107.1,78.7,107.1c-0.5-0.1-0.8-0.2-0.9-0.2C77.9,106.9,78.3,107,78.7,107.1"/>
				<path class="st5" d="M86,108.8c-1.8,0-6-1-6-1.3c0-0.1,1.8-0.3,3.5-0.6c1.4-0.2,2.7-0.6,3.1-0.6c0.4,0,1.6,0.4,2.8,0.6
					c1.5,0.3,3,0.4,3.2,0.5C92.8,107.5,90,108.9,86,108.8"/>
			</g>
		</g>
		<path class="st2" d="M115.8,76.4c-4.4-1.3-9-2.2-13.6-1.9c-3.9,0.3-7.8,1-11,3.5c-0.1,0.1-0.3,0.2-0.5,0.2c-0.8,0-1.6-0.1-2.4-0.1
			c-2.6,0-5.1,0-7.7,0c-0.2,0-0.3-0.2-0.5-0.3c-1.8-0.9-3.6-2-5.5-2.5c-6.3-1.8-12.6-0.9-18.8,0.9c-1.7,0.5-1.8,1-0.6,2.3
			c1.9,2.1,3.9,4.1,5.8,6.3c3.7,4.3,8.3,6.4,14,5.7c3.4-0.4,6.4-1.5,7.6-5.1c0.5-1.5,0.6-3,1-4.8c1.3-0.4,3-0.4,4.6,0.1
			c-0.3,3.4,0.9,7.8,5.1,9.1c5.6,1.8,10.9,1.1,15.2-3c2.8-2.7,5.4-5.7,8.1-8.5C117.4,77.4,117.2,76.8,115.8,76.4 M78.1,88.8
			c-4.1,1.7-8.1,1.4-11.9-1c-2.6-1.7-4.5-4-5.3-7c-0.5-1.9,0-3.1,1.9-3.7c1.7-0.5,3.4-0.6,5.2-0.9c3,0.3,5.9,0.5,8.6,1.7
			c1.2,0.5,2.3,1.2,3.2,2.1C82.7,83,81.9,87.2,78.1,88.8 M110.4,80.7c-1.2,5.1-6.9,9.3-12.5,9.1c-1.6-0.1-3.2-0.4-4.7-1
			c-3.9-1.6-4.6-6-1.7-9c2.1-2.1,4.9-2.7,7.6-3.1c1.4-0.2,2.8-0.3,4.8-0.4c1.2,0.2,2.9,0.3,4.5,0.8
			C110.3,77.6,110.8,78.8,110.4,80.7"/>
		<g>
			<path class="st3" d="M83.8,53c3.9,17.7,22.5,27.7,38.6,24.3c-0.5-19.9-12.5-40.9-36.3-40.9c-25.5,0-37.5,24.2-36.2,45.2
				C66.3,83.8,70.8,74.5,83.8,53"/>
			<path class="st3" d="M117.8,90.2l-3.5,1.9c0,0,4-9.4,3.6-16.4l3.5-1.1C121.4,74.5,121.3,86.3,117.8,90.2"/>
		</g>
	</g>
</g>
</svg>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| images | string[] | - | Array of image URLs |
| label | string | - | Folder caption |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Folder size |
| variant | FolderVariant | 'devi' | Visual style: devi, rudras, ardra, shakti, kubera, hari, ravi, durga, or nandi |
