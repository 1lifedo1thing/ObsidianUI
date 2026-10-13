"use client";

import { DashboardShellPage } from '@/components/block/dashboard-shell-page'
import { cn } from '@/lib/utils'

export function DashboardShellPreview({ compact = false, className }: { compact?: boolean; className?: string }) {
    return (
        <div inert={compact} className={cn('h-full w-full', className)}>
            <DashboardShellPage headingLevel={compact ? 3 : 2} />
        </div>
    )
}
