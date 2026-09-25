'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { ComponentsGrid } from '@/components/catalog/components-grid'

export function ComponentsShowcase() {
    const reduceMotion = useReducedMotion()

    return (
        <section aria-labelledby="featured-components-title" className="bg-background px-4 py-20 md:px-8 lg:px-16">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-12 text-center"
                >
                    <h2 id="featured-components-title" className="landing-title mb-4 text-balance text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
                        Featured Components
                    </h2>
                    <p className="landing-copy mx-auto max-w-2xl text-pretty text-lg leading-relaxed">
                        Watch our signature components and try the newest interactive effects.
                    </p>
                </motion.div>

                <ComponentsGrid featured />

                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-12 text-center"
                >
                    <Link
                        href="/components"
                        className="landing-arrow-link landing-button inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-body font-medium not-italic text-primary-foreground transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98]"
                    >
                        View All Components
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

export default ComponentsShowcase
