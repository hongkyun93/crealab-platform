import { MomentGridCard } from "@/components/shared/MomentGridCard"
import { MomentTableView } from "@/components/shared/MomentTableView"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateToMonth, formatPriceRange } from "@/lib/utils"
import { ArrowLeft, BadgeCheck, Calendar, ChevronRight, Clock, Info, LayoutGrid, MessageCircle, Package, Sparkles, Table as TableIcon, Tv } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"
import { useSocialChannels } from "@/components/providers/social-channels-provider"

const CHANNEL_LABELS: Record<string, string> = {
    instagram_reels: '🎞️ 릴스', instagram_feed: '📷 피드', instagram_story: '⭕ 스토리',
    youtube_longform: '▶️ 롱폼', youtube_shorts: '⚡ 숏츠',
}
const CHANNEL_BG: Record<string, string> = {
    instagram: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600',
    youtube: 'bg-gradient-to-r from-red-600 to-red-700',
    tiktok: 'bg-gradient-to-r from-black to-slate-800',
    blog: 'bg-gradient-to-r from-green-500 to-green-600',
}
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    offered: { label: '대기', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    pending: { label: '대기', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    negotiating: { label: '협상중', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    accepted: { label: '수락됨', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    signed: { label: '계약됨', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: '거절됨', color: 'bg-red-100 text-red-700 border-red-200' },
}
const fmt = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n.toLocaleString()

interface MomentsViewProps {
    activeMoments: any[]
    myMoments: any[]
    pastMoments: any[]
    upcomingMoments: any[]
    brandProposals: any[]
    setCurrentView: (view: string) => void
    handleOpenDetails: (moment: any, type: 'moment' | 'campaign') => void
    deleteEvent: (id: string) => void
    updateEvent: (id: string, updates: any) => Promise<boolean>
    user: any
}

export const MomentsView = React.memo(function MomentsView({
    activeMoments,
    myMoments,
    pastMoments,
    upcomingMoments,
    brandProposals,
    setCurrentView,
    handleOpenDetails,
    deleteEvent,
    updateEvent,
    user
}: MomentsViewProps) {
    const router = useRouter()
    const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid')
    const [selectedMoment, setSelectedMoment] = React.useState<any | null>(null)
    const { channels } = useSocialChannels()

    // Fallback chain: primary social channel → manual followers (user.followers)
    const primaryChannel = channels.find(ch => ch.isPrimary) ?? channels[0]
    const effectiveFollowers = primaryChannel?.followersCount || user?.followers || 0

    // Build creator profile from user for the shared card component
    const creatorProfile = {
        id: user?.id,
        name: user?.name || '크리에이터',
        avatar: user?.avatar,
        followers: effectiveFollowers,
        primaryChannel: user?.primaryChannel,
        socialChannels: user?.socialChannels,
    }

    const getProposalsForMoment = (momentId: string) =>
        brandProposals.filter((p: any) => p.event_id === momentId)

    const getActiveProposalCount = (momentId: string) =>
        brandProposals.filter((p: any) => p.event_id === momentId && (p.status === 'offered' || p.status === 'negotiating' || p.status === 'pending')).length

    // ─── Render proposal footer for cards ─────────────────────
    const renderProposalFooter = (momentId: string) => {
        const proposals = getProposalsForMoment(momentId)
        if (proposals.length === 0) return null
        return (
            <div className="px-6 pb-0 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                            {proposals.slice(0, 3).map((p: any) => (
                                <div key={p.id} className="w-6 h-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[9px] font-bold text-primary">
                                    {(p.brand_name || p.brandName || 'B')[0]}
                                </div>
                            ))}
                            {proposals.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                                    +{proposals.length - 3}
                                </div>
                            )}
                        </div>
                        <span className="text-xs font-medium text-foreground">
                            💌 제안 {proposals.length}건
                        </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
            </div>
        )
    }

    // ═══════════════════════════════════════════════════════════
    // DETAIL VIEW — 3-column layout with proposals on right
    // ═══════════════════════════════════════════════════════════
    if (selectedMoment) {
        const proposals = getProposalsForMoment(selectedMoment.id)
        const channels = selectedMoment.channels || []

        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <Button variant="ghost" size="sm" className="gap-2" onClick={() => setSelectedMoment(null)}>
                    <ArrowLeft className="h-4 w-4" /> 아카이브로 돌아가기
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_340px] gap-5">
                    {/* ─── COL 1: Profile + Meta ─── */}
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-card p-5 text-center">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="" className="h-24 w-24 rounded-full object-cover border-3 border-primary/20 mx-auto mb-3 shadow-lg" />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center font-bold text-white text-3xl mx-auto mb-3 shadow-lg">
                                    {(user?.name || 'C')[0]}
                                </div>
                            )}
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                <span className="font-bold text-xl">{user?.name || user?.handle}</span>
                                {user?.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{fmt(user?.followers || 0)} 팔로워</p>
                        </div>

                        <div className="rounded-xl border bg-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4 text-primary" /> 모먼트 일정
                                </div>
                                <span className="text-base font-bold text-primary">{formatDateToMonth(selectedMoment.eventDate) || "미정"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 text-emerald-600" /> 업로드 시기
                                </div>
                                <span className="text-base font-bold text-emerald-600">
                                    {selectedMoment.dateFlexible ? "협의 가능" : (formatDateToMonth(selectedMoment.postingDate) || "미정")}
                                </span>
                            </div>
                        </div>

                        {channels.length > 0 && (
                            <div className="rounded-xl border bg-card p-4">
                                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                    <Tv className="h-4 w-4" /> 희망 채널 · 형태
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {channels.map((ch: string) => {
                                        const base = ch.split('_')[0]
                                        return (
                                            <span key={ch} className={`text-[11px] font-medium text-white px-2.5 py-1 rounded-full shadow-sm ${CHANNEL_BG[base] || 'bg-slate-600'}`}>
                                                {CHANNEL_LABELS[ch] || ch}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="rounded-xl border bg-card p-4">
                            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                <Package className="h-4 w-4" /> 광고 가능 아이템
                            </p>
                            <p className="text-base font-medium leading-snug">{selectedMoment.targetProduct || "미정"}</p>
                        </div>

                        {selectedMoment.tags && selectedMoment.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {selectedMoment.tags.map((tag: string) => (
                                    <Badge key={tag} variant="outline" className="text-sm px-3 py-1">{tag}</Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─── COL 2: Title + Description + Guide ─── */}
                    <div className="space-y-5">
                        <h1 className="text-3xl font-bold tracking-tight leading-tight">{selectedMoment.title || selectedMoment.event}</h1>

                        <div className="rounded-xl border bg-card p-6">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">상세 설명</h3>
                            <p className="text-base leading-[1.85] whitespace-pre-wrap">{selectedMoment.description || "상세 설명이 없습니다."}</p>
                        </div>

                        {selectedMoment.guide && (
                            <div className="rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/5 border-amber-200/50 p-6">
                                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" /> 제작 가이드
                                </h3>
                                <p className="text-base leading-relaxed whitespace-pre-wrap text-amber-900 dark:text-amber-100">{selectedMoment.guide}</p>
                                <p className="text-xs text-amber-600/60 mt-3 pt-3 border-t border-amber-200/40">💡 크리에이터 제안 가이드입니다. 언제든지 협의 가능합니다.</p>
                            </div>
                        )}

                        <div className="rounded-xl border bg-card p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">내가 설정한 예상 단가</span>
                                <span className="text-lg font-bold text-primary">{formatPriceRange(selectedMoment.priceVideo)}</span>
                            </div>
                        </div>
                    </div>

                    {/* ─── COL 3: Received Proposals ─── */}
                    <div>
                        <div className="sticky top-20 space-y-4">
                            <div className="rounded-xl border overflow-hidden">
                                <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-b">
                                    <h3 className="text-base font-bold flex items-center gap-2">
                                        <MessageCircle className="h-5 w-5 text-indigo-600" />
                                        받은 제안
                                        <Badge className="bg-indigo-600 border-0 text-white text-xs ml-1">{proposals.length}</Badge>
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">브랜드에서 보낸 협업 제안</p>
                                </div>

                                <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                                    {proposals.length > 0 ? (
                                        proposals.map((prop: any) => {
                                            const status = STATUS_LABELS[prop.status] || STATUS_LABELS.offered
                                            const brandName = prop.brand_name || prop.brandName || '브랜드'
                                            return (
                                                <div key={prop.id} className="bg-background border rounded-lg p-4 space-y-3 hover:border-primary/30 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        {prop.brand_avatar ? (
                                                            <img src={prop.brand_avatar} alt={brandName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                                                                {brandName[0]}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold truncate">{brandName}</p>
                                                            <p className="text-[11px] text-muted-foreground">{formatDateToMonth(prop.created_at)}</p>
                                                        </div>
                                                        <Badge variant="outline" className={`text-[10px] shrink-0 ${status.color}`}>
                                                            {status.label}
                                                        </Badge>
                                                    </div>

                                                    <div className="bg-muted/40 rounded-md p-3 space-y-2">
                                                        <div>
                                                            <p className="text-[10px] text-muted-foreground mb-0.5">제안 제품</p>
                                                            <p className="text-sm font-medium">{prop.conditions?.product_name || prop.product_name || '제품명 없음'}</p>
                                                        </div>
                                                        {(prop.price_offer || prop.conditions?.price_offer) && (
                                                            <div>
                                                                <p className="text-[10px] text-muted-foreground mb-0.5">제안 금액</p>
                                                                <p className="text-sm font-bold text-emerald-600">₩{(prop.price_offer || prop.conditions?.price_offer || 0).toLocaleString()}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {(prop.message || prop.conditions?.message) && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{prop.message || prop.conditions?.message}</p>
                                                    )}

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full text-xs h-8"
                                                        onClick={() => handleOpenDetails(selectedMoment, 'moment')}
                                                    >
                                                        제안 상세 보기
                                                    </Button>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="text-center py-8 bg-muted/20 rounded-lg text-sm text-muted-foreground border border-dashed">
                                            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                            아직 도착한 제안이 없습니다.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ═══════════════════════════════════════════════════════════
    // ARCHIVE VIEW — Grid/Table with proposal count footer
    // ═══════════════════════════════════════════════════════════
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="gap-2">
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    돌아가기
                </Button>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">내 모먼트 아카이브</h1>
                    <div className="group relative flex items-center">
                        <Info className="h-5 w-5 text-slate-400 cursor-help" />
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-80 p-3 bg-popover text-popover-foreground text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-border">
                            💡 브랜드에게 보이는 것과 동일한 카드 UI입니다.<br />
                            내 모먼트가 브랜드에게 어떻게 보이는지 확인하세요.
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <TabsList className="w-full md:w-auto grid grid-cols-2">
                        <TabsTrigger value="upcoming">나의 모먼트 ({activeMoments.length + myMoments.length})</TabsTrigger>
                        <TabsTrigger value="past">완료된 모먼트 ({pastMoments.length})</TabsTrigger>
                    </TabsList>

                    <div className="hidden md:flex items-center gap-1 bg-muted p-1 rounded-lg">
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode('table')}
                            title="테이블형"
                        >
                            <TableIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode('grid')}
                            title="그리드형"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* ─── 나의 모먼트 Tab ──────────────────────────────── */}
                <TabsContent value="upcoming" className="space-y-4">
                    {viewMode === 'grid' ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {upcomingMoments.length > 0 ? (
                                upcomingMoments.map((moment: any) => (
                                    <MomentGridCard
                                        key={moment.id}
                                        item={moment}
                                        creator={creatorProfile}
                                        isPast={false}
                                        offerCount={getActiveProposalCount(moment.id)}
                                        onClick={() => setSelectedMoment(moment)}
                                        onEdit={(id) => router.push(`/creator/moment/${id}`)}
                                        onDelete={deleteEvent}
                                        onComplete={(id) => updateEvent(id, { status: 'completed' })}
                                        renderFooter={() => renderProposalFooter(moment.id)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                                    나의 모먼트가 없습니다.
                                </div>
                            )}
                        </div>
                    ) : (
                        <MomentTableView
                            items={upcomingMoments}
                            getCreator={() => creatorProfile}
                            brandProposals={brandProposals}
                            onClick={(m) => setSelectedMoment(m)}
                            onEdit={(id) => router.push(`/creator/moment/${id}`)}
                            onDelete={deleteEvent}
                        />
                    )}
                </TabsContent>

                {/* ─── 완료된 모먼트 Tab ──────────────────────────────── */}
                <TabsContent value="past" className="space-y-4">
                    {viewMode === 'grid' ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {pastMoments.length > 0 ? (
                                pastMoments.map((moment: any) => (
                                    <MomentGridCard
                                        key={moment.id}
                                        item={moment}
                                        creator={creatorProfile}
                                        isPast={true}
                                        onClick={() => setSelectedMoment(moment)}
                                        onEdit={(id) => router.push(`/creator/moment/${id}`)}
                                        onDelete={deleteEvent}
                                        renderFooter={() => renderProposalFooter(moment.id)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                                    완료된 모먼트가 없습니다.
                                </div>
                            )}
                        </div>
                    ) : (
                        <MomentTableView
                            items={pastMoments}
                            getCreator={() => creatorProfile}
                            isPast={true}
                            onClick={(m) => setSelectedMoment(m)}
                            onEdit={(id) => router.push(`/creator/moment/${id}`)}
                            onDelete={deleteEvent}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
})
