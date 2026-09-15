'use client'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { PreviewVideo } from '@/components/media/preview-video'
import { EffectPreview } from '@/components/catalog/effect-preview'
import type { NewEffectSlug } from '@/components/catalog/new-effects'

gsap.registerPlugin(ScrollTrigger)

type FeaturedDemo = {
    id: string
    name: string
    docPath: string
} & ({ videoPath: string; effect?: never } | { effect: NewEffectSlug; videoPath?: never })

const featuredDemos: FeaturedDemo[] = [
    { id: 'apple-spotlight', name: 'Apple Spotlight', videoPath: 'https://cdn.obsidianui.dev/demos/apple-spotlight.mp4', docPath: '/docs/apple-spotlight' },
    { id: 'circle-menu', name: 'Circle Menu', videoPath: 'https://cdn.obsidianui.dev/demos/circle-menu.mp4', docPath: '/docs/circle-menu' },
    { id: 'magnetic-image-trail', name: 'Magnetic Image Trail', effect: 'magnetic-image-trail', docPath: '/docs/magnetic-image-trail' },
    { id: 'fractal-glass', name: 'Fractal Glass', effect: 'fractal-glass', docPath: '/docs/fractal-glass' },
]

export function VideoShowcaseGrid() {
    const gridRef = useRef<HTMLDivElement>(null)
    const reduceMotion = useReducedMotion()

    useEffect(() => {
        if (!gridRef.current || reduceMotion !== false) return

        const items = gridRef.current.querySelectorAll('.video-card')

        const context = gsap.context(() => gsap.fromTo(items,
            {
                y: 100,
                opacity: 0,
                scale: 0.95,
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: 'top 80%',
                    end: 'top 30%',
                    scrub: 1,
                }
            }
        ), gridRef)

        return () => {
            context.revert()
        }
    }, [reduceMotion])

    return (
        <section aria-labelledby="featured-components-title" className="py-20 px-4 md:px-8 lg:px-16 bg-background">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-16"
                >
                    <h2 id="featured-components-title" className="landing-title text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-balance mb-4">
                        Featured Components
                    </h2>
                    <p className="landing-copy text-lg leading-relaxed text-pretty max-w-2xl mx-auto">
                        Watch our signature components and try the newest interactive effects.
                    </p>
                </motion.div>

                {/* Featured previews */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                    {featuredDemos.map((demo) => (
                        <article
                            key={demo.id}
                            className="video-card group relative flex aspect-[4/3] min-w-0 flex-col rounded-2xl overflow-hidden bg-card border border-border transition-shadow duration-300 hover:shadow-xl"
                        >
                            <div className="min-h-0 flex-1 p-2 pb-0">
                                <div className="relative h-full overflow-hidden rounded-xl">
                                    {demo.effect ? (
                                        <EffectPreview slug={demo.effect} compact />
                                    ) : (
                                        <PreviewVideo src={demo.videoPath} label={`${demo.name} preview`} showControls={false} className="h-full w-full" />
                                    )}
                                </div>
                            </div>

                            <Link href={demo.docPath} prefetch={false} className="landing-arrow-link shrink-0 p-4 flex items-center justify-between gap-3 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ring">
                                <span className="landing-button landing-title text-sm font-medium text-card-foreground px-1 py-1.5">
                                    {demo.name}
                                </span>
                                <span className="landing-button bg-muted text-muted-foreground group-hover:text-foreground group-focus-within:text-foreground transition-colors duration-200 p-2 rounded-full">
                                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </span>
                            </Link>
                        </article>
                    ))}
                </div>

                {/* View All Button */}
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mt-12"
                >
                    <Link
                        href="/components"
                        className="landing-arrow-link landing-button inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-body not-italic font-medium motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98] transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                        View All Components
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

export default VideoShowcaseGrid
