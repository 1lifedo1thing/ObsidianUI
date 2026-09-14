"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { PreviewVideo } from '@/components/media/preview-video'
import { r2 } from '@/lib/r2'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import { EffectPreview } from './effect-preview'
import { newEffects } from './new-effects'

// Import live components for previews
import FlipText from '@/components/block/flip-text'
import JellyLoader from '@/components/block/jelly-loader'
import { PixelatedCarousel } from '@/components/block/pixelated-carousel'
import { HoverImg } from '@/components/block/hover-img'

// Sample images for the retained carousel preview
const sampleCarouselImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop",
]

// Live component preview wrappers
const LivePreviews: Record<string, React.ReactNode> = {
    ...Object.fromEntries(newEffects.map(effect => [effect.slug, <EffectPreview key={effect.slug} slug={effect.slug} compact />])),
    "flip-text": (
        <div className="w-full h-full flex items-center justify-center">
            <FlipText>ObsidianUI</FlipText>
        </div>
    ),
    "jelly-loader": (
        <div className="w-full h-full flex items-center justify-center">
            <JellyLoader />
        </div>
    ),
    "pixelated-carousel": (
        <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
            <PixelatedCarousel images={sampleCarouselImages} pixelSize={50} />
        </div>
    ),
    "hover-img": (
        <div className="w-full h-full overflow-hidden rounded-lg flex items-center justify-center bg-zinc-950 relative">
            <div className="w-full h-full flex items-center">
                <HoverImg
                    projects={[
                        { title: "Shree Krishna", label: "Divine", imageSrc: r2("/hover-img/hover-img-img01-alt.jpg") },
                        { title: "Radha Krishna", label: "Love", imageSrc: r2("/hover-img/hover-img-img02.jpg") },
                        { title: "Divine Love", label: "Eternal", imageSrc: r2("/hover-img/hover-img-img03.jpg") },
                    ]}
                    compact={true}
                    isContained={true}
                    className="!bg-transparent w-full"
                />
            </div>
        </div>
    ),
}

// All components with video previews or live components
const allComponents = [
    ...newEffects.map(effect => ({ title: effect.title, href: `/docs/${effect.slug}`, video: null, livePreview: effect.slug })),
    { title: "Apple Spotlight", href: "/docs/apple-spotlight", video: "https://cdn.obsidianui.dev/demos/apple-spotlight.mp4", livePreview: null },
    { title: "Circle Menu", href: "/docs/circle-menu", video: "https://cdn.obsidianui.dev/demos/circle-menu.mp4", livePreview: null },
    { title: "Hover Image", href: "/docs/hover-img", video: null, livePreview: "hover-img" },
    { title: "Flip Scroll", href: "/docs/flip-scroll", video: "https://cdn.obsidianui.dev/demos/flip-scroll.mp4", livePreview: null },
    { title: "Flow Scroll", href: "/docs/flow-scroll", video: "https://cdn.obsidianui.dev/demos/flow-scroll.mp4", livePreview: null },
    { title: "Horizontal Scroll", href: "/docs/horizontal-scroll", video: "https://cdn.obsidianui.dev/demos/horizontal-scroll.mp4", livePreview: null },
    { title: "Magnet Tabs", href: "/docs/magnet-tabs", video: "https://cdn.obsidianui.dev/demos/magnet-tabs.mp4", livePreview: null },
    { title: "Mask Cursor Effect", href: "/docs/mask-cursor-effect", video: "https://cdn.obsidianui.dev/demos/mask-cursor-effect.mp4", livePreview: null },
    { title: "Masonry Grid", href: "/docs/masonry-grid", video: "https://cdn.obsidianui.dev/demos/masonry-grid.mp4", livePreview: null },
    { title: "OTP Input", href: "/docs/otp-input", video: "https://cdn.obsidianui.dev/demos/otp-input.mp4", livePreview: null },
    { title: "Interactive Folder", href: "/docs/folder-preview", video: "https://cdn.obsidianui.dev/demos/interactive-folder.mp4", livePreview: null },
    { title: "Glowing Scroll", href: "/docs/glowing-scroll-indicator", video: "https://cdn.obsidianui.dev/demos/glowing-dot-scroll-indicator.mp4", livePreview: null },
    { title: "Stack Scroll", href: "/docs/scroll-effect", video: "https://cdn.obsidianui.dev/demos/stack-scroll.mp4", livePreview: null },
    { title: "Flip Text", href: "/docs/flip-text", video: null, livePreview: "flip-text" },
    { title: "Jelly Loader", href: "/docs/jelly-loader", video: null, livePreview: "jelly-loader" },
    { title: "Pixelated Carousel", href: "/docs/pixelated-carousel", video: null, livePreview: "pixelated-carousel" },
]

const ITEMS_PER_PAGE = 20

export const ComponentsGrid = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const containerRef = useRef<HTMLDivElement>(null)
    const reduceMotion = useReducedMotion()
    const totalPages = Math.ceil(allComponents.length / ITEMS_PER_PAGE)

    const goToPage = (page: number) => {
        setCurrentPage(page)
        containerRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentComponents = allComponents.slice(startIndex, endIndex)

    return (
        <div ref={containerRef}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 my-10">
                {currentComponents.map((component) => (
                    <div key={`${component.href}-${component.title}`} className="block group relative">
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="
                                h-full flex flex-col
                                rounded-[20px] overflow-hidden
                                bg-white dark:bg-[#0A0A0A]
                                border border-neutral-200 dark:border-neutral-800
                                hover:border-neutral-300 dark:hover:border-neutral-700
                                hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-black/60
                                transition-all duration-500 ease-out
                                p-2
                            "
                        >
                            {/* Preview Area */}
                            <div className="
                                relative w-full aspect-[4/3] rounded-[14px] overflow-hidden
                                bg-neutral-100 dark:bg-zinc-900
                                border border-neutral-100 dark:border-white/5
                                group-hover:border-neutral-200 dark:group-hover:border-white/10
                                transition-colors
                            ">
                                <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                                    {component.video ? (
                                        <PreviewVideo src={component.video} label={`${component.title} preview`} showControls={false} className="h-full w-full" />
                                    ) : component.livePreview && LivePreviews[component.livePreview] ? (
                                        LivePreviews[component.livePreview]
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-neutral-400 dark:text-neutral-600 text-sm">
                                            {component.title}
                                        </div>
                                    )}
                                </div>

                                {/* Inner Shadow for depth */}
                                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] rounded-[14px]" />
                            </div>

                            {/* Details Area */}
                            <div className="px-3 pt-4 pb-2 flex items-center justify-between">
                                <div>
                                    <Link href={component.href} className="block">
                                        <h3 className="
                                            text-sm font-semibold transition-colors
                                            text-neutral-900 dark:text-neutral-100
                                            group-hover:text-blue-600 dark:group-hover:text-blue-400
                                        ">
                                            {component.title}
                                        </h3>
                                    </Link>
                                </div>
                                <Link
                                    href={component.href}
                                    aria-label={`View ${component.title} documentation`}
                                    className="
                                        w-7 h-7 flex items-center justify-center rounded-full transition-all hover:scale-105
                                        bg-neutral-100 dark:bg-neutral-800/50
                                        text-neutral-400 dark:text-neutral-500
                                        hover:bg-neutral-200 dark:hover:bg-neutral-700
                                        hover:text-neutral-900 dark:hover:text-neutral-100
                                    "
                                >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-8">
                    <button
                        onClick={() => goToPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Previous</span>
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                aria-label={`Go to page ${page}`}
                                aria-current={currentPage === page ? 'page' : undefined}
                                className={cn('w-10 h-10 rounded-lg text-sm font-medium transition-colors', currentPage === page
                                    ? 'bg-primary text-primary-foreground font-bold'
                                    : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                )}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="text-sm font-medium">Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
