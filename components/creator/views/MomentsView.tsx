import React from "react"
import { ChevronRight, Info, Calendar, Gift, Send, Banknote, Star, ExternalLink, MoreVertical, Trash2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LayoutGrid, Table as TableIcon } from "lucide-react"
import { formatDateToMonth, formatPriceRange } from "@/lib/utils"
import { toast } from "sonner"

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

// ─── Platform Icon helpers (identical to brand DiscoverView) ─────
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
    instagram: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
            <defs><linearGradient id="ig-gr-c" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f09433" /><stop offset="25%" stopColor="#e6683c" />
                <stop offset="50%" stopColor="#dc2743" /><stop offset="75%" stopColor="#cc2366" />
                <stop offset="100%" stopColor="#bc1888" />
            </linearGradient></defs>
            <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-gr-c)" />
            <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.5" />
            <circle cx="17.5" cy="6.5" r="1" fill="white" />
        </svg>
    ),
    youtube: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="5" fill="#FF0000" />
            <polygon points="10,8.5 10,15.5 16,12" fill="white" />
        </svg>
    ),
    tiktok: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
            <rect width="24" height="24" rx="5" fill="#010101" />
            <path d="M16 7.5c1 .7 2.1 1 3 1v2.2c-.9 0-1.8-.2-2.6-.6v5.4A4.1 4.1 0 1 1 12.3 11v2.3a1.9 1.9 0 1 0 1.9 1.9V5h2z" fill="white" />
        </svg>
    ),
    blog: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
            <rect width="24" height="24" rx="5" fill="#03C75A" />
            <text x="12" y="16.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">N</text>
        </svg>
    ),
}
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
const PLATFORM_TABLE_LABELS: Record<string, { label: string; color: string }> = {
    instagram: { label: 'Instagram', color: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white' },
    youtube: { label: 'YouTube', color: 'bg-red-600 text-white' },
    tiktok: { label: 'TikTok', color: 'bg-black text-white' },
    blog: { label: 'Blog', color: 'bg-green-600 text-white' },
}

const fmt = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n.toLocaleString()

// ─── Grid Card (identical to brand DiscoverView card) ───────
function MomentGridCard({
    moment, user, isPast, offerCount, onDelete, onComplete, onClick
}: {
    moment: any; user: any; isPast: boolean; offerCount: number
    onDelete?: (id: string) => void; onComplete?: (id: string) => void
    onClick: (m: any) => void
}) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const [isCompleteDialogOpen, setIsCompleteDialogOpen] = React.useState(false)

    const pc = user?.socialChannels?.[0] || user?.primaryChannel
    const platform = pc?.platform || ''
    const followers = pc?.followersCount ?? user?.followers ?? 0
    const icon = PLATFORM_ICONS[platform] || (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        </svg>
    )

    return (
        <>
            <Card
                className={`overflow-hidden transition-all hover:shadow-lg border-border/60 bg-background flex flex-col h-full cursor-pointer relative group ${isPast ? 'opacity-75 hover:opacity-100' : ''}`}
                onClick={() => onClick(moment)}
            >
                {/* Top badge area */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                    {isPast && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                            완료된 모먼트
                        </span>
                    )}
                    {moment.isPrivate && (
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-0.5">
                            <Lock className="h-2.5 w-2.5" /> 비공개
                        </span>
                    )}
                    {!isPast && offerCount > 0 && (
                        <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                            📥 {offerCount}개 제안
                        </span>
                    )}
                </div>

                <CardHeader className="pb-3 flex-row gap-3 items-start space-y-0">
                    {/* Avatar - identical to brand view */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg overflow-hidden">
                        {user?.avatar && user.avatar.startsWith('http') ? (
                            <img src={user.avatar} alt={user?.name} className="h-full w-full object-cover" />
                        ) : (
                            user?.name?.[0] || 'C'
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold truncate">{user?.name || '크리에이터'}</h4>
                            {isPast && onDelete && (
                                <div onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setIsDeleteDialogOpen(true)
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> 기록 삭제
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </div>
                        {/* Follower count + tag — identical to brand card */}
                        <span className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-muted-foreground flex-wrap">
                            {icon}
                            <span>{fmt(followers)} 팔로워</span>
                            {moment.tags && moment.tags.length > 0 && (
                                <>
                                    <span className="text-border">·</span>
                                    {moment.tags.slice(0, 1).map((t: string) => (
                                        <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{t}</span>
                                    ))}
                                </>
                            )}
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3 flex-1 relative">
                    <h3 className="font-bold text-base line-clamp-2 h-14 mb-2">{moment.title || moment.event}</h3>

                    <div className={`flex flex-col gap-2 text-xs mb-3 bg-muted/30 p-3 rounded-lg border border-border/50 ${isPast ? 'opacity-80' : ''}`}>
                        <div className="pb-2 border-b border-border/50">
                            <span className="text-[10px] text-muted-foreground block mb-0.5">희망제품</span>
                            <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                                <Gift className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                <span className="truncate">{moment.targetProduct || "미정"}</span>
                            </div>
                        </div>
                        <div className="pb-2 border-b border-border/50">
                            <span className="text-[10px] text-muted-foreground block mb-0.5">예상단가</span>
                            <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                                <Banknote className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                <span className="truncate">{formatPriceRange(moment.priceVideo)}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-[10px] text-muted-foreground block mb-0.5">모먼트 일정</span>
                                <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="truncate">{formatDateToMonth(moment.eventDate) || "미정"}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-muted-foreground block mb-0.5">업로드 일정</span>
                                <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                                    <Send className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    {moment.dateFlexible ? (
                                        <span className="text-emerald-600 truncate">협의 가능</span>
                                    ) : (
                                        <span className="truncate">{formatDateToMonth(moment.postingDate)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-foreground/70 line-clamp-2 h-12 leading-relaxed mb-3">{moment.description || "상세 설명이 없습니다."}</p>

                    {moment.guide && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-md p-2.5 mb-3">
                            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium mb-1">📝 제작 가이드</p>
                            <p className="text-xs text-amber-900/80 dark:text-amber-200/80 line-clamp-2 leading-relaxed h-8">
                                {moment.guide}
                            </p>
                        </div>
                    )}

                    {/* Preferred channels */}
                    {moment.channels && moment.channels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {moment.channels.map((ch: string) => {
                                const base = ch.split('_')[0]
                                return (
                                    <span key={ch} className={`text-[10px] font-medium text-white px-2 py-0.5 rounded-full shadow-sm ${CHANNEL_BG[base] || 'bg-slate-600'}`}>
                                        {CHANNEL_LABELS[ch] || ch}
                                    </span>
                                )
                            })}
                        </div>
                    )}

                    {/* Complete button for active moments */}
                    {!isPast && onComplete && (
                        <div className="flex justify-end pt-2 border-t border-border/50">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsCompleteDialogOpen(true)
                                }}
                            >
                                <span className="mr-1">🎉</span> 완료하기
                            </Button>
                        </div>
                    )}
                </CardContent>
                <div className="pb-4"></div>
            </Card>

            {/* DELETE ALERT DIALOG */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>정말로 이 기록을 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async (e) => {
                                e.stopPropagation()
                                try {
                                    if (onDelete) await onDelete(moment.id)
                                    toast.success('모먼트가 삭제되었습니다.')
                                } catch (error: any) {
                                    toast.error(error?.message || '모먼트 삭제에 실패했습니다.')
                                }
                                setIsDeleteDialogOpen(false)
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            삭제하기
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* COMPLETE ALERT DIALOG */}
            <AlertDialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>이 모먼트를 완료하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>완료된 모먼트는 '완료된 모먼트' 탭으로 이동하며, 더 이상 새로운 제안을 받을 수 없습니다.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.stopPropagation()
                                if (onComplete) onComplete(moment.id)
                                setIsCompleteDialogOpen(false)
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            완료 처리
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

// ─── Table View (identical to brand DiscoverTableView) ──────
function MomentTableView({
    moments, user, isPast, brandProposals, onDelete, onComplete, onClick
}: {
    moments: any[]; user: any; isPast: boolean; brandProposals: any[]
    onDelete?: (id: string) => void; onComplete?: (id: string) => void
    onClick: (m: any) => void
}) {
    const pc = user?.socialChannels?.[0] || user?.primaryChannel
    const platform = pc?.platform || ''

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>크리에이터</TableHead>
                        <TableHead>모먼트 제목</TableHead>
                        <TableHead>희망 제품</TableHead>
                        <TableHead>예상 단가</TableHead>
                        <TableHead>채널</TableHead>
                        <TableHead>팔로워</TableHead>
                        <TableHead>일정</TableHead>
                        {!isPast && <TableHead className="text-center">제안</TableHead>}
                        {isPast && <TableHead className="w-[50px]"></TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {moments.length > 0 ? (
                        moments.map((moment) => {
                            const offerCount = brandProposals.filter((p: any) => p.event_id === moment.id && (p.status === 'offered' || p.status === 'negotiating' || p.status === 'pending')).length
                            return (
                                <TableRow
                                    key={moment.id}
                                    className="group hover:bg-muted/50 cursor-pointer"
                                    onClick={() => onClick(moment)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-primary">
                                                {user?.avatar && user.avatar.startsWith('http') ? (
                                                    <img src={user.avatar} alt={user?.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    user?.name?.[0] || 'C'
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{user?.name || '크리에이터'}</div>
                                                {moment.category && (
                                                    <span className="text-[10px] text-primary/80 font-medium">{moment.category}</span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium truncate max-w-[200px] block">{moment.title || moment.event}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="truncate max-w-[120px] text-sm block">{moment.targetProduct || "-"}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium whitespace-nowrap">
                                            {formatPriceRange(moment.priceVideo)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {platform ? (
                                            <Badge className={`text-[10px] font-medium border-0 ${PLATFORM_TABLE_LABELS[platform]?.color || 'bg-slate-600 text-white'}`}>
                                                {PLATFORM_TABLE_LABELS[platform]?.label || platform}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal text-xs bg-muted">
                                            {(user?.followers || 0).toLocaleString()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground">
                                            <div>{formatDateToMonth(moment.eventDate)} (이벤트)</div>
                                            <div>{moment.dateFlexible ? '협의가능' : formatDateToMonth(moment.postingDate)} (업로드)</div>
                                        </div>
                                    </TableCell>
                                    {!isPast && (
                                        <TableCell className="text-center">
                                            {offerCount > 0 ? (
                                                <Badge className="bg-indigo-600 hover:bg-indigo-700 border-0 animate-pulse">📥 {offerCount}</Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    )}
                                    {isPast && (
                                        <TableCell>
                                            {onDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-red-500"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onDelete(moment.id)
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={isPast ? 8 : 8} className="h-24 text-center text-muted-foreground">
                                모먼트가 없습니다.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}


// ─── Main MomentsView ───────────────────────────────────────
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
    const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid')

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

                    {/* View Switcher — identical to brand Discover */}
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
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
                                        moment={moment}
                                        user={user}
                                        isPast={false}
                                        offerCount={brandProposals.filter((p: any) => p.event_id === moment.id && (p.status === 'offered' || p.status === 'negotiating' || p.status === 'pending')).length}
                                        onClick={(m) => handleOpenDetails(m, 'moment')}
                                        onComplete={(id) => updateEvent(id, { status: 'completed' })}
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
                            moments={upcomingMoments}
                            user={user}
                            isPast={false}
                            brandProposals={brandProposals}
                            onClick={(m) => handleOpenDetails(m, 'moment')}
                            onComplete={(id) => updateEvent(id, { status: 'completed' })}
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
                                        moment={moment}
                                        user={user}
                                        isPast={true}
                                        offerCount={0}
                                        onClick={(m) => handleOpenDetails(m, 'moment')}
                                        onDelete={deleteEvent}
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
                            moments={pastMoments}
                            user={user}
                            isPast={true}
                            brandProposals={[]}
                            onClick={(m) => handleOpenDetails(m, 'moment')}
                            onDelete={deleteEvent}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
})
