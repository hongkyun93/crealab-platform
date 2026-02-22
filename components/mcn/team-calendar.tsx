"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { useTeam } from "@/components/providers/team-provider"
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, Package, Megaphone } from "lucide-react"

// Unified calendar event type
interface CalendarEvent {
    id: string
    title: string
    date: string // YYYY-MM-DD
    type: 'moment' | 'moment_proposal' | 'product_application' | 'campaign'
    creatorName: string
    creatorId: string
    status: string
    brandName?: string
    productName?: string
}

// 크리에이터별 고유 색상 팔레트
const CREATOR_COLORS = [
    { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
    { bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500' },
    { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
    { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500' },
    { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/40', text: 'text-fuchsia-700 dark:text-fuchsia-300', dot: 'bg-fuchsia-500' },
    { bg: 'bg-lime-100 dark:bg-lime-900/40', text: 'text-lime-700 dark:text-lime-300', dot: 'bg-lime-500' },
    { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
    { bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-700 dark:text-teal-300', dot: 'bg-teal-500' },
    { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
    { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-700 dark:text-pink-300', dot: 'bg-pink-500' },
]

// Event type icons & labels
const EVENT_TYPE_STYLE: Record<string, { emoji: string; label: string }> = {
    moment: { emoji: '📅', label: '모먼트' },
    moment_proposal: { emoji: '💌', label: '모먼트 제안' },
    brand_proposal: { emoji: '📦', label: '브랜드 제안' },
    campaign: { emoji: '📢', label: '캠페인 마감' },
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

interface TeamCalendarProps {
    teamId: string
}

export function TeamCalendar({ teamId }: TeamCalendarProps) {
    const { supabase } = useAuth()
    const { switchToMember } = useTeam()
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), 1)
    })
    const [creatorFilter, setCreatorFilter] = useState<string | null>(null)
    const [typeFilter, setTypeFilter] = useState<string | null>(null)

    // Fetch all data: moments + proposals + campaigns
    useEffect(() => {
        if (!teamId) return

        const fetchAll = async () => {
            setIsLoading(true)
            const allEvents: CalendarEvent[] = []

            try {
                // 1. Life Moments (event_date)
                const { data: moments } = await supabase
                    .from('life_moments')
                    .select(`
                        id, title, name, event_date, posting_date, status, influencer_id,
                        profiles!influencer_id ( display_name )
                    `)
                    .eq('team_id', teamId)

                for (const m of (moments || []) as any[]) {
                    const dateStr = m.event_date || m.posting_date
                    if (!dateStr) continue
                    allEvents.push({
                        id: `m-${m.id}`,
                        title: m.title || m.name || '모먼트',
                        date: dateStr.split('T')[0],
                        type: 'moment',
                        creatorName: m.profiles?.display_name || 'Unknown',
                        creatorId: m.influencer_id,
                        status: m.status,
                    })
                }

                // 2. Get team member IDs
                const { data: members } = await supabase
                    .from('team_members')
                    .select('user_id')
                    .eq('team_id', teamId)

                const memberIds = (members || []).map(m => m.user_id)
                if (memberIds.length === 0) {
                    setEvents(allEvents)
                    setIsLoading(false)
                    return
                }

                // 3. Moment Proposals (desired_date)
                const { data: mps } = await supabase
                    .from('moment_proposals')
                    .select(`
                        id, desired_date, product_name, status, influencer_id,
                        profiles!influencer_id ( display_name ),
                        brand:profiles!brand_id ( display_name )
                    `)
                    .in('influencer_id', memberIds)
                    .not('desired_date', 'is', null)

                for (const mp of (mps || []) as any[]) {
                    if (!mp.desired_date) continue
                    allEvents.push({
                        id: `mp-${mp.id}`,
                        title: mp.product_name || '모먼트 제안',
                        date: mp.desired_date.split('T')[0],
                        type: 'moment_proposal',
                        creatorName: mp.profiles?.display_name || 'Unknown',
                        creatorId: mp.influencer_id,
                        status: mp.status,
                        brandName: mp.brand?.display_name,
                        productName: mp.product_name,
                    })
                }

                // 4. Brand Proposals (desired_date)
                const { data: bps } = await supabase
                    .from('product_applications')
                    .select(`
                        id, desired_date, product_name, status, influencer_id,
                        profiles!influencer_id ( display_name ),
                        brand:profiles!brand_id ( display_name )
                    `)
                    .in('influencer_id', memberIds)
                    .not('desired_date', 'is', null)

                for (const bp of (bps || []) as any[]) {
                    if (!bp.desired_date) continue
                    allEvents.push({
                        id: `bp-${bp.id}`,
                        title: bp.product_name || '브랜드 제안',
                        date: bp.desired_date.split('T')[0],
                        type: 'product_application',
                        creatorName: bp.profiles?.display_name || 'Unknown',
                        creatorId: bp.influencer_id,
                        status: bp.status,
                        brandName: bp.brand?.display_name,
                        productName: bp.product_name,
                    })
                }

                // 5. Campaigns (recruitment_deadline)
                const brandIds = [...new Set((mps || []).map((p: any) => p.brand_id).concat((bps || []).map((p: any) => p.brand_id)).filter(Boolean))]
                const { data: campaigns } = await supabase
                    .from('campaigns')
                    .select('id, title, recruitment_deadline, brand_id, profiles!brand_id ( display_name )')
                    .not('recruitment_deadline', 'is', null)

                for (const c of (campaigns || []) as any[]) {
                    if (!c.recruitment_deadline) continue
                    allEvents.push({
                        id: `camp-${c.id}`,
                        title: c.title || '캠페인 마감',
                        date: c.recruitment_deadline.split('T')[0],
                        type: 'campaign',
                        creatorName: c.profiles?.display_name || '브랜드',
                        creatorId: c.brand_id || '',
                        status: 'deadline',
                        brandName: c.profiles?.display_name,
                    })
                }

            } catch (err) {
                console.error('[TeamCalendar] Error:', err)
            }

            setEvents(allEvents)
            setIsLoading(false)
        }

        fetchAll()
    }, [teamId])

    // Creator color assignment (from moments only, to keep colors stable)
    const { uniqueCreators, creatorColorMap } = useMemo(() => {
        const creatorsMap = new Map<string, { id: string; name: string }>()
        events.forEach(e => {
            if (e.type === 'campaign') return // campaigns don't have creators
            if (!creatorsMap.has(e.creatorId)) {
                creatorsMap.set(e.creatorId, { id: e.creatorId, name: e.creatorName })
            }
        })
        const creators = Array.from(creatorsMap.values()).sort((a, b) => a.name.localeCompare(b.name))
        const colorMap = new Map<string, typeof CREATOR_COLORS[number]>()
        creators.forEach((c, i) => {
            colorMap.set(c.id, CREATOR_COLORS[i % CREATOR_COLORS.length])
        })
        return { uniqueCreators: creators, creatorColorMap: colorMap }
    }, [events])

    // Filter
    const filteredEvents = useMemo(() =>
        events
            .filter(e => !creatorFilter || e.creatorId === creatorFilter)
            .filter(e => !typeFilter || e.type === typeFilter),
        [events, creatorFilter, typeFilter])

    // Build events index by date key
    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>()
        filteredEvents.forEach(e => {
            if (!map.has(e.date)) map.set(e.date, [])
            map.get(e.date)!.push(e)
        })
        return map
    }, [filteredEvents])

    // Calendar grid
    const calendarGrid = useMemo(() => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startDayOfWeek = firstDay.getDay()
        const daysInMonth = lastDay.getDate()

        const cells: { date: Date; isCurrentMonth: boolean }[] = []

        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            cells.push({ date: new Date(year, month, -i), isCurrentMonth: false })
        }
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push({ date: new Date(year, month, d), isCurrentMonth: true })
        }
        const remaining = (7 - (cells.length % 7)) % 7
        for (let d = 1; d <= remaining; d++) {
            cells.push({ date: new Date(year, month + 1, d), isCurrentMonth: false })
        }

        return cells
    }, [currentMonth])

    const navigateMonth = useCallback((delta: number) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
    }, [])

    const goToToday = useCallback(() => {
        const now = new Date()
        setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    }, [])

    const handleEventClick = (event: CalendarEvent) => {
        if (event.type === 'campaign') return
        switchToMember(event.creatorId)
        window.location.href = '/creator?view=dashboard'
    }

    const today = new Date()
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    // Stats
    const typeCounts = useMemo(() => ({
        all: filteredEvents.length,
        moment: filteredEvents.filter(e => e.type === 'moment').length,
        moment_proposal: filteredEvents.filter(e => e.type === 'moment_proposal').length,
        brand_proposal: filteredEvents.filter(e => e.type === 'product_application').length,
        campaign: filteredEvents.filter(e => e.type === 'campaign').length,
    }), [filteredEvents])

    if (isLoading) {
        return (
            <Card>
                <div className="py-24 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">캘린더 로딩 중...</p>
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Event Type Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                {[
                    { key: null, label: `전체 (${typeCounts.all})` },
                    { key: 'moment', label: `📅 모먼트 (${typeCounts.moment})` },
                    { key: 'moment_proposal', label: `💌 모먼트제안 (${typeCounts.moment_proposal})` },
                    { key: 'product_application', label: `📦 브랜드제안 (${typeCounts.brand_proposal})` },
                    { key: 'campaign', label: `📢 캠페인 (${typeCounts.campaign})` },
                ].map(({ key, label }) => (
                    <Badge
                        key={key || 'all'}
                        variant={typeFilter === key ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => setTypeFilter(key)}
                    >
                        {label}
                    </Badge>
                ))}
            </div>

            {/* Creator Legend */}
            {uniqueCreators.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge
                        variant={creatorFilter === null ? "default" : "outline"}
                        className="cursor-pointer text-[10px] h-6"
                        onClick={() => setCreatorFilter(null)}
                    >
                        전체
                    </Badge>
                    {uniqueCreators.slice(0, 15).map(c => {
                        const color = creatorColorMap.get(c.id)!
                        return (
                            <Badge
                                key={c.id}
                                variant="outline"
                                className={`cursor-pointer text-[10px] h-6 gap-1 ${creatorFilter === c.id ? 'ring-2 ring-primary ring-offset-1' : ''} ${color.bg} ${color.text}`}
                                onClick={() => setCreatorFilter(f => f === c.id ? null : c.id)}
                            >
                                <div className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                                {c.name}
                            </Badge>
                        )
                    })}
                    {uniqueCreators.length > 15 && (
                        <span className="text-[10px] text-muted-foreground">+{uniqueCreators.length - 15}명</span>
                    )}
                </div>
            )}

            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">
                        {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                    </h2>
                    <Button variant="outline" size="sm" onClick={goToToday} className="text-xs h-7">
                        오늘
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)} className="h-8 w-8">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)} className="h-8 w-8">
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Full-size Month Grid */}
            <Card className="overflow-hidden">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 border-b bg-muted/30">
                    {WEEKDAY_LABELS.map((label, i) => (
                        <div key={label} className={`text-center text-xs font-medium py-2.5 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-muted-foreground'}`}>
                            {label}
                        </div>
                    ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7">
                    {calendarGrid.map((cell, idx) => {
                        const dateKey = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, '0')}-${String(cell.date.getDate()).padStart(2, '0')}`
                        const dayEvents = eventsByDate.get(dateKey) || []
                        const isToday = dateKey === todayKey
                        const dayOfWeek = cell.date.getDay()
                        const maxVisible = 3

                        return (
                            <div
                                key={idx}
                                className={`min-h-[110px] border-b border-r p-1.5 transition-colors
                                    ${!cell.isCurrentMonth ? 'bg-muted/20 opacity-40' : ''}
                                    ${isToday ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''}
                                `}
                            >
                                {/* Date number */}
                                <div className="text-right mb-1">
                                    <span className={`
                                        inline-flex items-center justify-center text-xs w-6 h-6 rounded-full
                                        ${isToday ? 'bg-primary text-primary-foreground font-bold' : ''}
                                        ${!isToday && dayOfWeek === 0 ? 'text-red-500' : ''}
                                        ${!isToday && dayOfWeek === 6 ? 'text-blue-500' : ''}
                                    `}>
                                        {cell.date.getDate()}
                                    </span>
                                </div>

                                {/* Events */}
                                <div className="space-y-0.5">
                                    {dayEvents.slice(0, maxVisible).map((event) => {
                                        const color = creatorColorMap.get(event.creatorId)
                                        const typeStyle = EVENT_TYPE_STYLE[event.type]
                                        const isCampaign = event.type === 'campaign'

                                        return (
                                            <div
                                                key={event.id}
                                                className={`
                                                    flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] leading-tight
                                                    cursor-pointer hover:opacity-80 transition-opacity truncate
                                                    ${isCampaign
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                                        : `${color?.bg || 'bg-muted'} ${color?.text || 'text-foreground'}`
                                                    }
                                                `}
                                                onClick={() => handleEventClick(event)}
                                                title={`${typeStyle?.emoji} ${event.creatorName}: ${event.title}${event.brandName ? ` (${event.brandName})` : ''}`}
                                            >
                                                <span className="flex-shrink-0">{typeStyle?.emoji}</span>
                                                <span className="truncate">
                                                    {isCampaign
                                                        ? event.title
                                                        : `${event.creatorName?.split(' ')?.[0]} · ${event.title}`
                                                    }
                                                </span>
                                            </div>
                                        )
                                    })}
                                    {dayEvents.length > maxVisible && (
                                        <div className="text-[10px] text-muted-foreground pl-1 font-medium">
                                            +{dayEvents.length - maxVisible}건
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    )
}
