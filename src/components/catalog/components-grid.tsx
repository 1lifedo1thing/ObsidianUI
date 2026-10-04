"use client";

import { ArrowUpRight } from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { usePrefersFineHover } from '@/hooks/use-prefers-fine-hover'
import { r2 } from '@/lib/r2'
import { EffectPreview } from './effect-preview'
import { newEffects } from './new-effects'
import { StatusBarsPreview } from './status-bars-preview'
import './components-grid.css'

import FlipText from '@/components/block/flip-text'
import { FourOhFour } from '@/components/block/404'
import { DiscoverButton } from '@/components/block/discover-button'
import { HoverImg } from '@/components/block/hover-img'
import { SplitShowcase, VercelLogo, TracwellLogo } from '@/components/block/split-showcase'

type ShowcaseItem = {
    title: string
    href: string
    preview: ReactNode
}

// Keep v-prism featured. Insert each new component immediately after it so the
// newest card starts the grid and older cards shift right, then wrap in order.
const allComponents: ShowcaseItem[] = [
    { title: 'v-prism', href: '/docs/v-prism', preview: <EffectPreview slug="v-prism" compact /> },
    {
        title: 'Status Bars',
        href: '/docs/status-bars',
        preview: <div className="flex h-full w-full items-center justify-center px-6 pb-16 pt-10"><StatusBarsPreview className="max-w-[560px]" /></div>,
    },
    { title: '404', href: '/docs/404', preview: <FourOhFour compact className="h-full" /> },
    {
        title: 'Discover Button',
        href: '/docs/discover-button',
        preview: <div className="flex h-full w-full items-center justify-center bg-[#191715] p-5"><DiscoverButton /></div>,
    },
    {
        title: 'Split Showcase',
        href: '/docs/split-showcase',
        preview: (
            <div className="flex h-full w-full items-center justify-center overflow-hidden p-2">
                <div className="w-full max-w-[720px] select-none">
                    <SplitShowcase compact items={[
                        { id: 'vercel', title: <VercelLogo />, tag: 'Hosting Sponsor', href: '/docs/split-showcase', target: '_self', ariaLabel: 'View Split Showcase component' },
                        { id: 'tracwell', title: <TracwellLogo />, tag: 'Analytics Sponsor', href: '/docs/split-showcase', target: '_self', ariaLabel: 'View Split Showcase component' },
                    ]} />
                </div>
            </div>
        ),
    },
    { title: 'Art Gallery', href: '/docs/art-gallery', preview: <EffectPreview slug="art-gallery" compact /> },
    {
        title: 'Hover Image',
        href: '/docs/hover-img',
        preview: (
            <div className="relative flex h-full w-full items-center rounded-lg">
                <HoverImg
                    projects={[
                        { title: 'Shree Krishna', label: 'Divine', imageSrc: r2('/hover-img/hover-img-img01-alt.jpg') },
                        { title: 'Radha Krishna', label: 'Love', imageSrc: r2('/hover-img/hover-img-img02.jpg') },
                        { title: 'Divine Love', label: 'Eternal', imageSrc: r2('/hover-img/hover-img-img03.jpg') },
                    ]}
                    compact
                    isContained
                    className="h-full w-full rounded-lg"
                />
            </div>
        ),
    },
    ...newEffects.filter(effect => effect.slug !== 'v-prism' && effect.slug !== 'art-gallery').map(effect => ({
        title: effect.title,
        href: `/docs/${effect.slug}`,
        preview: <EffectPreview slug={effect.slug} compact />,
    })),
    { title: 'Flip Text', href: '/docs/flip-text', preview: <div className="flex h-full w-full items-center justify-center"><FlipText className="text-[clamp(1.75rem,2.8vw,3rem)] font-medium tracking-[-0.04em]">ObsidianUI</FlipText></div> },
]

function ShowcaseCard({ component, index }: { component: ShowcaseItem; index: number }) {
    const isHoverImage = component.href === '/docs/hover-img'
    const reduceMotion = useReducedMotion()
    const fineHover = usePrefersFineHover()
    const [hovered, setHovered] = useState(false)
    const [focused, setFocused] = useState(false)
    const showTitle = hovered || focused
    const pillLayoutId = `component-showcase-pill-${component.href.replaceAll('/', '-')}`
    const pillTransition = reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const }

    return (
        <motion.article
            className={isHoverImage ? 'component-showcase-card component-showcase-card-hover-image' : 'component-showcase-card'}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16, filter: reduceMotion ? 'blur(0px)' : 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '0px 0px -100px' }}
            transition={{ duration: reduceMotion ? 0.2 : 0.42, delay: reduceMotion ? 0 : (index % 3) * 0.055, ease: [0.23, 1, 0.32, 1] }}
            onPointerEnter={() => { if (fineHover) setHovered(true) }}
            onPointerLeave={() => setHovered(false)}
        >
            <div className="component-showcase-frame">
                <div className="component-showcase-media">{component.preview}</div>
                <Link
                        href={component.href}
                        prefetch={false}
                        aria-label={`View ${component.title} documentation`}
                        className="component-showcase-pill-link group"
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                    >
                        <LayoutGroup id={pillLayoutId}>
                            <AnimatePresence mode="popLayout" initial={false}>
                                {showTitle ? (
                                    <motion.span
                                        key="title-pill"
                                        layoutId={pillLayoutId}
                                        transition={{ layout: pillTransition }}
                                        style={{ borderRadius: 10 }}
                                        className="component-showcase-pill"
                                    >
                                        <motion.span
                                            className="component-showcase-pill-content"
                                            initial={reduceMotion ? false : { opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={reduceMotion ? undefined : { opacity: 0 }}
                                            transition={{ duration: reduceMotion ? 0 : 0.12, ease: 'easeOut' }}
                                        >
                                            <span>{component.title}</span>
                                            <span className="component-showcase-arrow" aria-hidden="true">
                                                <ArrowUpRight className="component-showcase-arrow-out" />
                                                <ArrowUpRight className="component-showcase-arrow-in" />
                                            </span>
                                        </motion.span>
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="idle-pill"
                                        layoutId={pillLayoutId}
                                        aria-hidden="true"
                                        style={{ borderRadius: 10 }}
                                        transition={{ layout: pillTransition }}
                                        className="component-showcase-idle-pill"
                                    />
                                )}
                            </AnimatePresence>
                        </LayoutGroup>
                    </Link>
            </div>
        </motion.article>
    )
}

export const ComponentsGrid = ({ featured = false }: { featured?: boolean }) => {
    const components = featured
        ? allComponents.filter(component => component.href === '/docs/art-gallery' || component.href === '/docs/hover-img')
        : allComponents

    if (featured) {
        return <div className="components-showcase-grid">
            {components.map((component, index) => <ShowcaseCard key={component.href} component={component} index={index} />)}
        </div>
    }

    return <>
        <div className="component-showcase-featured">
            <ShowcaseCard component={components[0]} index={0} />
        </div>
        <div className="component-showcase-grid">
            {components.slice(1).map((component, index) => <ShowcaseCard key={component.href} component={component} index={index + 1} />)}
        </div>
    </>
}
