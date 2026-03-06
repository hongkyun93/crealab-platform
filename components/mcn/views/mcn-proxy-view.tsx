"use client"

import { useTeam } from "@/components/providers/team-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { AlertTriangle, ArrowUpDown, ChevronRight, LayoutGrid, Search, Table as TableIcon, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { CreatorSummaryCard } from "../creator-summary-card"
import type { CreatorStatus, CreatorSummary, FilterStatus, SortOrder, ViewMode, PriceRange } from "../types/mcn"
import { FILTER_CHIPS } from "../types/mcn"
import { getCreatorStatus, filterAndSortCreators } from "../utils/creator-status"

interface McnProxyViewProps {
    summaryData: CreatorSummary[]
}

export function McnProxyView({ summaryData }: McnProxyViewProps) {
    const { switchToMember } = useTeam()
    const router = useRouter()

    // ── Filter / Sort / View state ──────────────────────────────
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
    const [sortOrder, setSortOrder] = useState<SortOrder>('urgent')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [priceRange, setPriceRange] = useState<PriceRange>('all')
    const [tagFilter, setTagFilter] = useState<string>('all')

    // ── All unique tags from team ───────────────────────────────
    const allTags = useMemo(() => {
        const tagSet = new Set<string>()
        summaryData.forEach(c => c.tags?.forEach(t => tagSet.add(t)))
        return Array.from(tagSet).sort()
    }, [summaryData])

    // ── Urgent summary counts ───────────────────────────────────
    const urgentCreators = useMemo(() =>
        summaryData.filter(c => c.pending_product_applications + c.pending_moment_proposals > 0),
        [summaryData])
    const idleCreators = useMemo(() =>
        summaryData.filter(c => {
            const hasActivity = c.total_moments > 0 || c.total_product_applications > 0 ||
                c.total_moment_proposals > 0 || c.total_campaign_applications > 0
            return !hasActivity
        }),
        [summaryData])

    // ── Filter + Sort pipeline ──────────────────────────────────
    const filteredCreators = useMemo(() =>
        filterAndSortCreators(summaryData, { searchQuery, filterStatus, priceRange, tagFilter, sortOrder }),
        [summaryData, searchQuery, filterStatus, priceRange, tagFilter, sortOrder])

    const handleViewCreator = (userId: string) => {
        switchToMember(userId)
        router.push('/creator')
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <LayoutGrid className="h-6 w-6 text-indigo-600" />
                <div>
                    <h2 className="text-xl font-bold">크리에이터 관리 (프록시 뷰)</h2>
                    <p className="text-sm text-muted-foreground mt-1">소속 크리에이터의 전체화면 워크스페이스로 즉시 진입하여 세부 내역을 대리 관리할 수 있습니다.</p>
                </div>
            </div>

            {/* ── 긴급 요약 패널 ─────────────────────────────────── */}
            {(urgentCreators.length > 0 || idleCreators.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {urgentCreators.length > 0 && (
                        <button
                            className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/40 text-left hover:shadow-sm transition-shadow w-full"
                            onClick={() => { setFilterStatus('urgent'); setSortOrder('urgent') }}
                        >
                            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
                                    ⚡ 미응답 제안 있음 — {urgentCreators.length}명
                                </p>
                                <p className="text-xs text-red-500/80 truncate">
                                    {urgentCreators.slice(0, 3).map(c => c.display_name).join(', ')}
                                    {urgentCreators.length > 3 ? ` 외 ${urgentCreators.length - 3}명` : ''}
                                </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-red-400 shrink-0" />
                        </button>
                    )}
                    {idleCreators.length > 0 && (
                        <button
                            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900/20 dark:border-slate-700/40 text-left hover:shadow-sm transition-shadow w-full"
                            onClick={() => { setFilterStatus('idle'); setSortOrder('name') }}
                        >
                            <Users className="h-5 w-5 text-slate-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">
                                    💤 비활성 크리에이터 — {idleCreators.length}명
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                    {idleCreators.slice(0, 3).map(c => c.display_name).join(', ')}
                                    {idleCreators.length > 3 ? ` 외 ${idleCreators.length - 3}명` : ''}
                                </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                        </button>
                    )}
                </div>
            )}

            {/* ── 크리에이터 현황 + 검색·필터·정렬 ───────────────── */}
            <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className="text-lg font-bold">크리에이터 현황</h2>

                    {/* View toggle */}
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="icon" className="h-7 w-7"
                            onClick={() => setViewMode('grid')} title="카드형"
                        > <LayoutGrid className="h-4 w-4" /> </Button>
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'ghost'}
                            size="icon" className="h-7 w-7"
                            onClick={() => setViewMode('table')} title="테이블형"
                        > <TableIcon className="h-4 w-4" /> </Button>
                    </div>
                </div>

                {/* Search + Sort + Price 한 줄 */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="이름, 인스타, 태그 검색..."
                            className="pl-9 h-9"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={sortOrder} onValueChange={v => setSortOrder(v as SortOrder)}>
                        <SelectTrigger className="h-9 w-[140px]">
                            <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="urgent">긴급도순</SelectItem>
                            <SelectItem value="revenue">수익 높은순</SelectItem>
                            <SelectItem value="followers">팔로워 많은순</SelectItem>
                            <SelectItem value="moments">모먼트 많은순</SelectItem>
                            <SelectItem value="name">이름 가나다순</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={priceRange} onValueChange={v => setPriceRange(v as PriceRange)}>
                        <SelectTrigger className="h-9 w-[130px]">
                            <SelectValue placeholder="단가 범위" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">단가 전체</SelectItem>
                            <SelectItem value="under30">30만 미만</SelectItem>
                            <SelectItem value="30to100">30~100만</SelectItem>
                            <SelectItem value="over100">100만 이상</SelectItem>
                        </SelectContent>
                    </Select>
                    {allTags.length > 0 && (
                        <Select value={tagFilter} onValueChange={setTagFilter}>
                            <SelectTrigger className="h-9 w-[120px]">
                                <SelectValue placeholder="태그" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">태그 전체</SelectItem>
                                {allTags.map(t => (
                                    <SelectItem key={t} value={t}>#{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {FILTER_CHIPS.map(chip => (
                        <button
                            key={chip.value}
                            onClick={() => setFilterStatus(chip.value)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${filterStatus === chip.value
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-background border-border hover:border-primary/50 hover:bg-muted'
                                }`}
                        >
                            {chip.label}
                            {chip.value === 'urgent' && urgentCreators.length > 0 && (
                                <span className="ml-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
                                    {urgentCreators.length}
                                </span>
                            )}
                            {chip.value === 'idle' && idleCreators.length > 0 && (
                                <span className="ml-1.5 bg-slate-400 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
                                    {idleCreators.length}
                                </span>
                            )}
                        </button>
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                        {filteredCreators.length}/{summaryData.length}명
                    </span>
                </div>

                {/* Creator list */}
                {filteredCreators.length === 0 ? (
                    <Card className="p-12 text-center border-dashed">
                        <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                        <p className="text-muted-foreground">
                            {summaryData.length === 0
                                ? '소속 크리에이터가 없습니다. 초대 링크를 통해 크리에이터를 초대하세요.'
                                : '검색 조건에 맞는 크리에이터가 없습니다.'}
                        </p>
                        {summaryData.length > 0 && (
                            <Button variant="ghost" size="sm" className="mt-3" onClick={() => {
                                setSearchQuery(''); setFilterStatus('all'); setPriceRange('all'); setTagFilter('all')
                            }}>
                                필터 초기화
                            </Button>
                        )}
                    </Card>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {filteredCreators.map(creator => (
                            <CreatorSummaryCard
                                key={creator.user_id}
                                creator={creator}
                                status={creator._status}
                                onViewDashboard={() => handleViewCreator(creator.user_id)}
                            />
                        ))}
                    </div>
                ) : (
                    /* ─── 테이블형 뷰 ─────────────────────────────── */
                    <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/60 border-b">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-[260px]">크리에이터</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">상태</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">태그</th>
                                    <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">팔로워</th>
                                    <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">모먼트</th>
                                    <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">미확인 제안</th>
                                    <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">진행 협업</th>
                                    <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">매출</th>
                                    <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">영상단가</th>
                                    <th className="w-[50px]" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredCreators.map(creator => {
                                    const totalPending = creator.pending_product_applications + creator.pending_moment_proposals
                                    const totalActive = creator.active_product_applications + creator.active_moment_proposals + creator.active_campaign_applications
                                    const totalRevenue = creator.product_revenue + creator.moment_revenue
                                    const fmt = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n.toLocaleString()

                                    const STATUS_ROW_COLORS: Record<CreatorStatus, string> = {
                                        urgent: 'bg-red-50/40 dark:bg-red-900/5',
                                        active: '',
                                        normal: '',
                                        idle: 'opacity-60',
                                    }
                                    const STATUS_BADGE: Record<CreatorStatus, string> = {
                                        urgent: 'bg-red-100 text-red-700 border-red-200',
                                        active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                        normal: 'bg-blue-50 text-blue-600 border-blue-200',
                                        idle: 'bg-slate-100 text-slate-500 border-slate-200',
                                    }
                                    const STATUS_LABELS: Record<CreatorStatus, string> = {
                                        urgent: '🔴 긴급', active: '🟢 협업 중', normal: '🔵 정상', idle: '⚪ 비활성'
                                    }

                                    return (
                                        <tr
                                            key={creator.user_id}
                                            className={`hover:bg-muted/40 cursor-pointer transition-colors ${STATUS_ROW_COLORS[creator._status]}`}
                                            onClick={() => handleViewCreator(creator.user_id)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 shrink-0">
                                                        <AvatarImage src={creator.avatar_url || ''} />
                                                        <AvatarFallback className="text-xs font-bold">{creator.display_name?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-sm leading-tight">{creator.display_name}</p>

                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${STATUS_BADGE[creator._status]}`}>
                                                    {STATUS_LABELS[creator._status]}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {creator.tags?.slice(0, 2).map(t => (
                                                        <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border/50 text-muted-foreground">#{t}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-right font-medium">{fmt(creator.followers_count)}</td>
                                            <td className="px-3 py-3 text-right">{creator.total_moments}</td>
                                            <td className="px-3 py-3 text-right">
                                                {totalPending > 0 ? (
                                                    <span className="font-bold text-red-600">{totalPending}건</span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">{totalActive > 0 ? `${totalActive}건` : '-'}</td>
                                            <td className="px-3 py-3 text-right font-medium text-primary">
                                                {totalRevenue > 0 ? `₩${totalRevenue.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-3 py-3 text-right text-xs text-muted-foreground">
                                                {creator.price_video > 0 ? `₩${(creator.price_video / 10000).toFixed(0)}만` : '-'}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
