"use client";

import { useMemo } from 'react'
import { fillStatusDays, StatusBars, useStatusToday, type StatusDay } from '@/components/block/status-bars'
import { cn } from '@/lib/utils'

export const STATUS_BARS_START = '2026-08-01'

const registryIncidents: StatusDay[] = [
    { date: '2026-08-06', degraded: 14, incidents: [{ title: 'Slow registry responses', minutes: 14 }] },
    { date: '2026-08-19', downtime: 23, incidents: [{ title: 'Registry deploy rolled back', minutes: 23, status: 'down' }] },
    { date: '2026-09-02', degraded: 9, incidents: [{ title: 'Elevated error rate', minutes: 9 }] },
    { date: '2026-09-21', degraded: 6, incidents: [{ title: 'Elevated error rate', minutes: 6 }] },
]

const docsIncidents: StatusDay[] = [
    { date: '2026-08-12', degraded: 32, incidents: [{ title: 'Search index rebuilding', minutes: 32 }] },
    { date: '2026-09-14', downtime: 11, incidents: [{ title: 'CDN cache purge failed', minutes: 11, status: 'down' }] },
    { date: '2026-09-29', degraded: 18, incidents: [{ title: 'Preview images loading slowly', minutes: 18 }] },
]

export function StatusBarsPreview({ className }: { className?: string }) {
    const today = useStatusToday()
    const services = useMemo(() => today ? [
        { label: 'Component registry', days: fillStatusDays(STATUS_BARS_START, today, registryIncidents) },
        { label: 'Docs and previews', days: fillStatusDays(STATUS_BARS_START, today, docsIncidents) },
    ] : null, [today])

    return (
        <div className={cn('flex w-full flex-col gap-8', className)}>
            {services
                ? services.map(service => <StatusBars key={service.label} label={service.label} days={service.days} maxDays={service.days.length} />)
                : ['Component registry', 'Docs and previews'].map(label => <StatusBars key={label} label={label} days={[]} maxDays={60} loading />)}
        </div>
    )
}
