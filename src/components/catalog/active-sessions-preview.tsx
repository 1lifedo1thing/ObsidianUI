"use client";

import { RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { ActiveSessions, type ActiveSession } from '@/components/block/active-sessions'
import { cn } from '@/lib/utils'

const MINUTE = 60_000

// Documentation-only networks (RFC 5737), so a demo address can never belong to a real person.
const DEMO_NETWORKS = ['192.0.2', '198.51.100', '203.0.113'] as const

// A fixed seed gives the server and the first client render the same addresses.
const INITIAL_SEED = 0x0b5d20

function createRandom(seed: number) {
    let state = seed >>> 0
    return () => {
        state = (state + 0x6d2b79f5) >>> 0
        let value = state
        value = Math.imul(value ^ (value >>> 15), value | 1)
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
        return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
    }
}

function createFakeIp(random: () => number) {
    const network = DEMO_NETWORKS[Math.floor(random() * DEMO_NETWORKS.length)]
    return `${network}.${1 + Math.floor(random() * 254)}`
}

function createSessions(now: number, random: () => number): ActiveSession[] {
    return [
        { id: 'macbook', device: 'laptop', browser: 'Arc', os: 'macOS', location: 'Ahmedabad, India', ip: createFakeIp(random), lastActiveAt: now, current: true },
        { id: 'windows-desktop', device: 'desktop', browser: 'Chrome', os: 'Windows 11', location: 'Mumbai, India', ip: createFakeIp(random), lastActiveAt: now - 2 * MINUTE },
        { id: 'linux-laptop', device: 'laptop', browser: 'Firefox', os: 'Linux', location: 'Berlin, Germany', ip: createFakeIp(random), lastActiveAt: now - 26 * 60 * MINUTE, flag: 'New location' },
        { id: 'android-phone', device: 'phone', browser: 'Chrome', os: 'Android 15', location: 'Pune, India', ip: createFakeIp(random), lastActiveAt: now - 3 * 60 * MINUTE },
    ]
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function ActiveSessionsPreview({ compact = false, className }: { compact?: boolean; className?: string }) {
    const [sessions, setSessions] = useState(() => {
        const all = createSessions(Date.now(), createRandom(INITIAL_SEED))
        return compact ? all.slice(0, 3) : all
    })
    const [version, setVersion] = useState(0)
    const signedOutEverywhere = sessions.every(session => session.current)

    const restore = () => {
        const all = createSessions(Date.now(), Math.random)
        setSessions(compact ? all.slice(0, 3) : all)
        setVersion(value => value + 1)
    }

    return (
        <div className={cn('flex w-full flex-col items-center gap-3', className)}>
            <ActiveSessions
                key={version}
                sessions={sessions}
                onSessionsChange={setSessions}
                onRevoke={() => wait(650)}
                onRevokeOthers={() => wait(900)}
                description={compact ? null : undefined}
            />
            {signedOutEverywhere && (
                <button
                    type="button"
                    onClick={restore}
                    className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                    <RotateCcw size={13} aria-hidden />
                    Restore demo sessions
                </button>
            )}
        </div>
    )
}
