"use client";

import {
    AddCircle,
    AppDots,
    Bell,
    Box,
    Box2,
    Brush,
    Chip,
    Clipboard,
    Info,
    Message2,
    Slideshow,
    Target,
    User,
} from '@duo-icons/react'
import { Download, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
    DashboardButton,
    DashboardFilterMenu,
    DashboardMenu,
    DashboardMenuContent,
    DashboardMenuItem,
    DashboardMenuSeparator,
    DashboardMenuTrigger,
    DashboardPopover,
    DashboardPopoverContent,
    DashboardPopoverTrigger,
    DashboardShell,
    type DashboardShellNavItem,
    type DashboardShellNavSection,
} from '@/components/block/dashboard-shell'
import { cn } from '@/lib/utils'

type ComponentStatus = 'New' | 'Stable' | 'Draft'
type Category = 'Components' | 'Text animations' | 'Scroll animations' | 'Files & media'

type LibraryComponent = { id: string; name: string; category: Category; status: ComponentStatus }

// Newest first, in the same order as the components gallery.
const INITIAL_COMPONENTS: LibraryComponent[] = [
    { id: 'dashboard-shell', name: 'Dashboard Shell', category: 'Components', status: 'New' },
    { id: 'active-sessions', name: 'Active Sessions', category: 'Components', status: 'New' },
    { id: 'status-bars', name: 'Status Bars', category: 'Components', status: 'New' },
    { id: 'discover-button', name: 'Discover Button', category: 'Components', status: 'New' },
    { id: 'split-showcase', name: 'Split Showcase', category: 'Components', status: 'Stable' },
    { id: 'art-gallery', name: 'Art Gallery', category: 'Components', status: 'Stable' },
    { id: 'hover-img', name: 'Hover Image', category: 'Files & media', status: 'Stable' },
    { id: 'draggable-marquee', name: 'Draggable Marquee', category: 'Scroll animations', status: 'Stable' },
    { id: 'text-stream', name: 'Text reel', category: 'Text animations', status: 'Stable' },
    { id: 'flip-text', name: 'Flip Text', category: 'Text animations', status: 'Stable' },
]

const NOTIFICATIONS = [
    { id: 'review', title: 'Dashboard Shell is ready for review', detail: 'The preview build passed.' },
    { id: 'comment', title: 'New comment on Active Sessions', detail: 'Design left feedback on the empty state.' },
    { id: 'docs', title: 'Status Bars docs updated', detail: 'The props table lists every option.' },
]

const TABS = [
    { value: 'all', label: 'All components' },
    { value: 'new', label: 'New' },
    { value: 'stable', label: 'Stable' },
]

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest first' },
    { value: 'name', label: 'Name' },
]

const CATEGORY_OPTIONS = [
    { value: 'all', label: 'All categories' },
    { value: 'Components', label: 'Components' },
    { value: 'Text animations', label: 'Text animations' },
    { value: 'Scroll animations', label: 'Scroll animations' },
    { value: 'Files & media', label: 'Files & media' },
]

const STATUS_COLORS: Record<ComponentStatus, string> = {
    New: 'var(--obsidian-dashboard-shell-accent)',
    Stable: 'var(--obsidian-dashboard-shell-success)',
    Draft: 'var(--obsidian-dashboard-shell-text-subtle)',
}

const SECONDARY_NAVIGATION: DashboardShellNavItem[] = [
    { id: 'invite', label: 'Invite teammates', icon: User },
    { id: 'help', label: 'Help', icon: Info },
]

function downloadCsv(components: LibraryComponent[]) {
    const rows = [['Component', 'Category', 'Status'], ...components.map(component => [component.name, component.category, component.status])]
    const csv = rows.map(row => row.map(cell => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'components.csv'
    link.click()
    URL.revokeObjectURL(url)
}

export function DashboardShellPreview({ compact = false, className }: { compact?: boolean; className?: string }) {
    const [components, setComponents] = useState(INITIAL_COMPONENTS)
    const [tab, setTab] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const [category, setCategory] = useState('all')
    const [query, setQuery] = useState('')
    const [unreadIds, setUnreadIds] = useState(['review', 'comment'])

    const visibleComponents = useMemo(() => {
        const search = query.trim().toLowerCase()
        const visible = components
            .filter(component => tab === 'all' || component.status.toLowerCase() === tab)
            .filter(component => category === 'all' || component.category === category)
            .filter(component => !search || component.name.toLowerCase().includes(search))
        return sortBy === 'name' ? visible.toSorted((a, b) => a.name.localeCompare(b.name)) : visible
    }, [category, components, query, sortBy, tab])

    const navigation: DashboardShellNavSection[] = [
        {
            id: 'library',
            items: [
                { id: 'components', label: 'Components', icon: AppDots, count: components.length },
                { id: 'blocks', label: 'Blocks', icon: Box },
                { id: 'templates', label: 'Templates', icon: Slideshow },
                { id: 'analytics', label: 'Analytics', icon: Target },
                { id: 'docs', label: 'Docs', icon: Clipboard },
            ],
        },
        {
            id: 'teams',
            title: 'Teams',
            items: [
                { id: 'design', label: 'Design', icon: Brush },
                { id: 'engineering', label: 'Engineering', icon: Chip },
                { id: 'content', label: 'Content', icon: Message2 },
            ],
        },
        {
            id: 'spaces',
            title: 'Spaces',
            items: [
                { id: 'landing-pages', label: 'Landing pages', color: '#facc15' },
                { id: 'dashboards', label: 'Dashboards', color: '#f472b6' },
                { id: 'marketing', label: 'Marketing', color: '#60a5fa' },
            ],
        },
    ]

    const addComponent = () => {
        setComponents(current => [{ id: `untitled-${current.length + 1}`, name: 'Untitled component', category: 'Components', status: 'Draft' }, ...current])
        setTab('all')
        setCategory('all')
        setSortBy('newest')
        setQuery('')
    }

    const newCount = visibleComponents.filter(component => component.status === 'New').length

    return (
        <div inert={compact} className={cn('h-full w-full', className)}>
            <DashboardShell
                brand={{
                    name: 'ObsidianUI',
                    description: 'Component library',
                    logo: (
                        <span className="flex size-8 items-center justify-center rounded-md bg-(--obsidian-dashboard-shell-foreground) text-(--obsidian-dashboard-shell-background)">
                            <Box2 size={16} aria-hidden />
                        </span>
                    ),
                }}
                navigation={navigation}
                secondaryNavigation={SECONDARY_NAVIGATION}
                defaultActiveItemId="components"
                title="Components"
                headingLevel={compact ? 3 : 2}
                status="Active"
                headerActions={
                    <>
                        <SearchButton query={query} onQueryChange={setQuery} />
                        <NotificationsButton unreadIds={unreadIds} onUnreadIdsChange={setUnreadIds} />
                        <ProfileButton />
                    </>
                }
                tabs={TABS}
                tab={tab}
                onTabChange={setTab}
                filters={
                    <>
                        <DashboardFilterMenu label="Sort by" value={sortBy} options={SORT_OPTIONS} onValueChange={setSortBy} />
                        <DashboardFilterMenu label="Category" value={category} options={CATEGORY_OPTIONS} onValueChange={setCategory} />
                    </>
                }
                toolbarActions={
                    <>
                        <DashboardButton variant="secondary" size="sm" onClick={() => downloadCsv(visibleComponents)}>
                            <Download aria-hidden />
                            Export
                        </DashboardButton>
                        <DashboardButton variant="primary" size="sm" onClick={addComponent}>
                            <AddCircle aria-hidden />
                            New component
                        </DashboardButton>
                    </>
                }
            >
                <ComponentsTable components={visibleComponents} />
                <div className="grid grid-cols-2 border-y border-(--obsidian-dashboard-shell-border) text-xs leading-none">
                    <div className="flex items-center gap-2 border-r border-(--obsidian-dashboard-shell-border) p-3">
                        <span className="tabular-nums">{visibleComponents.length}</span>
                        <span className="text-(--obsidian-dashboard-shell-text-subtle)">{visibleComponents.length === 1 ? 'Component' : 'Components'} in view</span>
                    </div>
                    <div className="flex items-center gap-2 p-3">
                        <span className="tabular-nums">{newCount}</span>
                        <span className="text-(--obsidian-dashboard-shell-text-subtle)">New</span>
                    </div>
                </div>
            </DashboardShell>
        </div>
    )
}

function ComponentsTable({ components }: { components: LibraryComponent[] }) {
    if (components.length === 0) {
        return <p className="px-4 py-12 text-center text-sm text-(--obsidian-dashboard-shell-text-subtle)">No components match these filters.</p>
    }

    return (
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead>
                <tr className="border-y border-(--obsidian-dashboard-shell-border) text-xs text-(--obsidian-dashboard-shell-text-subtle)">
                    <th scope="col" className="px-4 py-2.5 font-normal">Component</th>
                    <th scope="col" className="px-4 py-2.5 font-normal">Category</th>
                    <th scope="col" className="px-4 py-2.5 font-normal">Status</th>
                </tr>
            </thead>
            <tbody>
                {components.map(component => (
                    <tr key={component.id} className="border-b border-(--obsidian-dashboard-shell-border) last:border-b-0">
                        <td className="px-4 py-3 font-medium">{component.name}</td>
                        <td className="px-4 py-3 text-(--obsidian-dashboard-shell-text-muted)">{component.category}</td>
                        <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs">
                                <span aria-hidden className="size-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[component.status] }} />
                                {component.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

function SearchButton({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) {
    return (
        <DashboardPopover>
            <DashboardPopoverTrigger asChild>
                <DashboardButton variant="secondary" size="icon" aria-label="Search components" className="relative">
                    <Search aria-hidden />
                    {query && <span aria-hidden className="absolute right-[6px] top-[6px] size-1.5 rounded-full bg-(--obsidian-dashboard-shell-accent)" />}
                </DashboardButton>
            </DashboardPopoverTrigger>
            <DashboardPopoverContent align="end" className="w-64">
                <div className="relative">
                    <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-(--obsidian-dashboard-shell-text-subtle)" />
                    <input
                        type="search"
                        value={query}
                        onChange={event => onQueryChange(event.target.value)}
                        placeholder="Search components"
                        aria-label="Search components"
                        className="h-8 w-full rounded-md bg-(--obsidian-dashboard-shell-control) pl-8 pr-2.5 text-xs text-(--obsidian-dashboard-shell-foreground) shadow-(--obsidian-dashboard-shell-control-shadow) outline-none placeholder:text-(--obsidian-dashboard-shell-text-subtle) focus-visible:ring-2 focus-visible:ring-(--obsidian-dashboard-shell-ring)"
                    />
                </div>
            </DashboardPopoverContent>
        </DashboardPopover>
    )
}

function NotificationsButton({ unreadIds, onUnreadIdsChange }: { unreadIds: string[]; onUnreadIdsChange: (ids: string[]) => void }) {
    const unreadCount = unreadIds.length

    return (
        <DashboardPopover>
            <DashboardPopoverTrigger asChild>
                <DashboardButton variant="secondary" size="icon" aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'} className="relative">
                    <Bell aria-hidden />
                    {unreadCount > 0 && (
                        <span aria-hidden className="absolute right-[6px] top-[6px] size-1.5 rounded-full bg-(--obsidian-dashboard-shell-danger) ring-2 ring-(--obsidian-dashboard-shell-control)" />
                    )}
                </DashboardButton>
            </DashboardPopoverTrigger>
            <DashboardPopoverContent align="end" className="w-[min(320px,calc(100vw-2rem))]">
                <div className="flex items-center justify-between gap-2 py-1 pl-2.5 pr-1">
                    <span className="text-[11px] font-medium uppercase leading-none tracking-[1px] text-(--obsidian-dashboard-shell-text-subtle)">Notifications</span>
                    <button
                        type="button"
                        disabled={unreadCount === 0}
                        onClick={() => onUnreadIdsChange([])}
                        className="h-7 cursor-pointer rounded-md px-2 text-xs text-(--obsidian-dashboard-shell-text-muted) outline-none transition-[background-color,color] duration-150 hover:bg-(--obsidian-dashboard-shell-menu-highlight) hover:text-(--obsidian-dashboard-shell-foreground) focus-visible:ring-2 focus-visible:ring-(--obsidian-dashboard-shell-ring) disabled:pointer-events-none disabled:opacity-50"
                    >
                        Mark all as read
                    </button>
                </div>
                <div aria-hidden className="-mx-1 my-1 h-px bg-(--obsidian-dashboard-shell-border)" />
                <ul className="flex flex-col">
                    {NOTIFICATIONS.map(notification => {
                        const isUnread = unreadIds.includes(notification.id)
                        return (
                            <li key={notification.id}>
                                <button
                                    type="button"
                                    onClick={() => onUnreadIdsChange(unreadIds.filter(id => id !== notification.id))}
                                    className="flex w-full cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 text-left outline-none transition-[background-color,scale] duration-150 hover:bg-(--obsidian-dashboard-shell-menu-highlight) focus-visible:ring-2 focus-visible:ring-(--obsidian-dashboard-shell-ring) active:scale-[0.98] active:duration-75"
                                >
                                    <span
                                        aria-hidden
                                        className={cn('mt-1 size-1.5 shrink-0 rounded-full transition-colors duration-200', isUnread ? 'bg-(--obsidian-dashboard-shell-accent)' : 'bg-transparent')}
                                    />
                                    <span className="flex min-w-0 flex-col gap-1">
                                        <span className={cn('text-xs font-medium leading-snug', !isUnread && 'text-(--obsidian-dashboard-shell-text-muted)')}>
                                            {notification.title}
                                            {isUnread && <span className="sr-only"> (unread)</span>}
                                        </span>
                                        <span className="text-[11px] leading-snug text-(--obsidian-dashboard-shell-text-subtle)">{notification.detail}</span>
                                    </span>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </DashboardPopoverContent>
        </DashboardPopover>
    )
}

function ProfileButton() {
    return (
        <DashboardMenu>
            <DashboardMenuTrigger asChild>
                <DashboardButton variant="secondary" size="sm" aria-label="Open account menu for Alex Morgan" className="gap-1.5 pl-[5px] pr-[7px] font-normal">
                    <span aria-hidden className="flex size-5 items-center justify-center rounded-[5px] bg-[#f59e0b] text-[10px] font-semibold text-[#1f1300]">AM</span>
                    <span className="hidden @xl/dashboard-shell:inline">Alex Morgan</span>
                </DashboardButton>
            </DashboardMenuTrigger>
            <DashboardMenuContent align="end">
                <DashboardMenuItem>Profile</DashboardMenuItem>
                <DashboardMenuItem>Settings</DashboardMenuItem>
                <DashboardMenuSeparator />
                <DashboardMenuItem>Sign out</DashboardMenuItem>
            </DashboardMenuContent>
        </DashboardMenu>
    )
}
