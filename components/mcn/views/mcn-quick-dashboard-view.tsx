"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useTeam } from "@/components/providers/team-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LayoutDashboard, Users, AlertCircle, X, ChevronRight, Search } from "lucide-react"
import { useState, useMemo } from "react"
import type { CreatorSummary, FilterStatus, SortOrder } from "../types/mcn"
import { STATUS_CHIPS } from "../types/mcn"
import { filterAndSortCreators } from "../utils/creator-status"

import { CreatorDashboard } from "@/components/creator/creator-dashboard"

interface McnQuickDashboardViewProps {
    summaryData: CreatorSummary[]
}

export function McnQuickDashboardView({ summaryData }: McnQuickDashboardViewProps) {
    const { switchToMember } = useTeam()
    const [embedTargetId, setEmbedTargetId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
    const [sortOrder, setSortOrder] = useState<SortOrder>('urgent')

    const handleCreatorSelect = (userId: string) => {
        setEmbedTargetId(userId)
        switchToMember(userId)
    }

    const clearEmbed = () => {
        setEmbedTargetId(null)
    }

    const filteredCreators = useMemo(() =>
        filterAndSortCreators(summaryData, { searchQuery, filterStatus, priceRange: 'all', tagFilter: 'all', sortOrder }),
        [summaryData, searchQuery, filterStatus, sortOrder])

    return (
        <div className="flex w-full h-[calc(100vh-140px)] border rounded-xl overflow-hidden bg-background">

            {/* Left Sidebar */}
            <div className={`flex flex-col border-r bg-muted/10 transition-all duration-300 ${embedTargetId ? 'w-[280px] shrink-0' : 'w-[350px]'}`}>
                {/* Header */}
                <div className="p-4 border-b bg-background shrink-0 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                크리에이터 현황 리스트
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {filteredCreators.length !== summaryData.length
                                    ? `${filteredCreators.length}명 / 전체 ${summaryData.length}명`
                                    : `소속 인원 ${summaryData.length}명`}
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="이름, 인스타, 태그 검색..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-8 h-8 text-xs"
                        />
                    </div>

                    {/* Filter chips + Sort */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {STATUS_CHIPS.map(chip => (
                            <button
                                key={chip.value}
                                onClick={() => setFilterStatus(chip.value)}
                                className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${filterStatus === chip.value
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border text-muted-foreground hover:border-primary/50'
                                    }`}
                            >
                                {chip.label}
                            </button>
                        ))}
                        <Select value={sortOrder} onValueChange={v => setSortOrder(v as SortOrder)}>
                            <SelectTrigger className="h-6 text-[11px] w-auto px-2 ml-auto border-border">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="urgent">긴급순</SelectItem>
                                <SelectItem value="revenue">수익순</SelectItem>
                                <SelectItem value="followers">팔로워순</SelectItem>
                                <SelectItem value="name">이름순</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {filteredCreators.map(creator => {
                            const status = creator._status
                            const isSelected = embedTargetId === creator.user_id
                            const pendingCount = creator.pending_product_applications + creator.pending_moment_proposals

                            return (
                                <button
                                    key={creator.user_id}
                                    onClick={() => handleCreatorSelect(creator.user_id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${isSelected
                                        ? 'bg-primary/10 border-primary/20 shadow-sm border'
                                        : 'hover:bg-muted border border-transparent'
                                        }`}
                                >
                                    <Avatar className="h-9 w-9 border shrink-0">
                                        <AvatarImage src={creator.avatar_url || ''} />
                                        <AvatarFallback>{creator.display_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={`font-semibold text-sm truncate ${isSelected ? 'text-primary' : ''}`}>
                                                {creator.display_name}
                                            </p>
                                            {status === 'urgent' && (
                                                <span className="h-2 w-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                            {status === 'urgent' ? (
                                                <span className="text-red-500 font-medium">미확인 {pendingCount}건</span>
                                            ) : status === 'active' ? (
                                                <span className="text-emerald-500">협업 중</span>
                                            ) : status === 'idle' ? (
                                                <span className="text-muted-foreground/60">비활성</span>
                                            ) : (
                                                <span>대기 중</span>
                                            )}
                                        </p>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? 'text-primary translate-x-1' : 'text-muted-foreground/30'}`} />
                                </button>
                            )
                        })}

                        {filteredCreators.length === 0 && (
                            <div className="text-center py-10 px-4">
                                <AlertCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    {searchQuery || filterStatus !== 'all' ? '검색 결과가 없습니다.' : '멤버가 없습니다.'}
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Panel: Embedded Creator Dashboard */}
            <div className="flex-1 bg-background relative flex flex-col min-w-0 overflow-hidden">
                {embedTargetId ? (
                    <>
                        {/* Embed Top Bar */}
                        <div className="h-12 border-b flex items-center justify-between px-4 bg-muted/20 shrink-0">
                            <div className="flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold">
                                    {summaryData.find(c => c.user_id === embedTargetId)?.display_name} 님의 대시보드
                                </span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={clearEmbed} className="h-8 text-xs text-muted-foreground">
                                <X className="h-4 w-4 mr-1" /> 닫기
                            </Button>
                        </div>
                        {/* Embedded Component */}
                        <div className="flex-1 overflow-y-auto w-full relative">
                            <CreatorDashboard isEmbedMode={true} />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-slate-50 dark:bg-slate-900/10">
                        <LayoutDashboard className="h-16 w-16 mb-4 text-muted-foreground/20" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">크리에이터를 선택하세요</h3>
                        <p className="text-sm mt-2 max-w-sm text-center">
                            좌측 명단에서 크리에이터를 클릭하면, 이 화면을 벗어나지 않고 즉시 해당 크리에이터의 업무 화면(워크스페이스)을 제어할 수 있습니다.
                        </p>
                    </div>
                )}
            </div>

        </div>
    )
}
