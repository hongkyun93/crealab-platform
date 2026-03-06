"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useTeam } from "@/components/providers/team-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Link as LinkIcon, Loader2, Sparkles, AlertCircle, Pencil, Eye, Instagram, Wand2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { CreatorSummary } from "../creator-summary-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreatorProfileCard, type IgPortfolioData } from "@/components/profile/CreatorProfileCard"

interface PortfolioLink {
    id: string
    brand_name: string
    message: string | null
    creator_ids: string[]
    created_at: string
}

interface McnPortfolioViewProps {
    teamId: string
    summaryData: CreatorSummary[]
    onEditCreator?: (userId: string) => void
}

export function McnPortfolioView({ teamId, summaryData, onEditCreator }: McnPortfolioViewProps) {
    const { supabase } = useAuth()
    const { teamMembers } = useTeam()

    const [activeTab, setActiveTab] = useState("edit")
    const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([])
    const [brandName, setBrandName] = useState("")
    const [message, setMessage] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedLink, setGeneratedLink] = useState("")

    const [portfolios, setPortfolios] = useState<PortfolioLink[]>([])
    const [isLoadingPortfolios, setIsLoadingPortfolios] = useState(false)
    const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null)
    const [syncingCreatorId, setSyncingCreatorId] = useState<string | null>(null)
    const [autoGeneratingId, setAutoGeneratingId] = useState<string | null>(null)
    const [igPortfolioCache, setIgPortfolioCache] = useState<Record<string, IgPortfolioData>>({})
    const [pendingOverwriteCreator, setPendingOverwriteCreator] = useState<CreatorSummary | null>(null)
    const [editingPortfolioCreator, setEditingPortfolioCreator] = useState<CreatorSummary | null>(null)
    const [editForm, setEditForm] = useState({
        display_name: '',
        bio: '',
        tags: '',
        price_video: '',
        price_feed: '',
        insight1_emoji: '🥇', insight1_title: '', insight1_desc: '',
        insight2_emoji: '🚀', insight2_title: '', insight2_desc: '',
        insight3_emoji: '🔗', insight3_title: '', insight3_desc: '',
        target_text: '',
        female_pct: '68',
        age_groups: '25-34:45, 18-24:25, 35-44:15',
        cities: 'Seoul:45, Busan:12, Incheon:8',
    })
    const [isSavingEdit, setIsSavingEdit] = useState(false)

    // 최초 진입 시 & 탭 전환 시 포트폴리오 목록 조회
    useEffect(() => {
        if (activeTab === 'view') {
            fetchPortfolios()
        }
    }, [activeTab, teamId])

    // 팀 멤버 로드 시 IG 스냅샷 복원
    useEffect(() => {
        if (!summaryData || summaryData.length === 0) return

        // 1단계: DB에서 직접 읽기 (RLS 허용 유저 or 운영자)
        const userIds = summaryData.map(c => c.user_id)
        supabase
            .from('social_channels')
            .select('user_id, ig_portfolio_snapshot')
            .in('user_id', userIds)
            .eq('platform', 'instagram')
            .not('ig_portfolio_snapshot', 'is', null)
            .then(({ data }) => {
                if (!data) return
                const newCache: Record<string, IgPortfolioData> = {}
                data.forEach(row => {
                    if (row.ig_portfolio_snapshot) {
                        newCache[row.user_id] = row.ig_portfolio_snapshot as IgPortfolioData
                    }
                })
                if (Object.keys(newCache).length > 0) {
                    setIgPortfolioCache(prev => ({ ...prev, ...newCache }))
                }
            })

        // 2단계: profile-stats API 통해 스냅샷 로드 (mock → snapshot 반환, 실유저 → IG API)
        //        DB 직접 읽기가 RLS로 막힌 mock 크리에이터를 커버합니다
        Promise.all(
            summaryData.map(async (creator) => {
                try {
                    const res = await fetch(`/api/instagram/profile-stats?userId=${creator.user_id}&priceVideo=${creator.price_video || 0}&priceFeed=${creator.price_feed || 0}`)
                    if (!res.ok) return null
                    const statsData = await res.json()
                    if (statsData.error || statsData.source === 'instagram_api') return null // 실유저는 이후 포트폴리오 자동생성 버튼으로 처리

                    const igData: IgPortfolioData = {
                        er: statsData.er ?? null,
                        avgReach: statsData.avgReach ?? null,
                        avgSaves: statsData.avgSaves ?? null,
                        posts: [],
                        audienceFemaleRatio: statsData.audienceFemaleRatio != null ? statsData.audienceFemaleRatio / 100 : null,
                        audienceDomesticRatio: statsData.audienceDomesticRatio != null ? statsData.audienceDomesticRatio / 100 : null,
                        allAgeGroups: statsData.allAgeGroups ?? [],
                        topCities: statsData.topCities ?? [],
                        accountInsights: {
                            profileViews30d: statsData.profileViews30d ?? null,
                            websiteClicks30d: statsData.websiteClicks30d ?? null,
                            monthlyReach: statsData.monthlyReach ?? null,
                            monthlyImpressions: statsData.monthlyImpressions ?? null,
                        },
                        derivedMetrics: {
                            erByFollowers: statsData.erByFollowers ?? null,
                            erByReach: statsData.erByReach ?? null,
                            saveRate: statsData.saveRate ?? null,
                            reachRate: statsData.reachRate ?? null,
                            realFanIndex: statsData.realFanIndex ?? null,
                            fqi: statsData.fqi ?? null,
                            viralityRate: statsData.viralityRate ?? null,
                            cpr: statsData.cpr ?? null,
                            cpe: statsData.cpe ?? null,
                            tms: statsData.tms ?? null,
                            roasPrediction: statsData.roasPrediction ?? null,
                            avgLikes: statsData.avgLikes ?? null,
                            avgComments: statsData.avgComments ?? null,
                            avgShares: statsData.avgShares ?? null,
                            avgViews: statsData.avgViews ?? null,
                            avgEngagement: statsData.avgEngagement ?? null,
                            postCount: statsData.postCount ?? null,
                        },
                        autoInsights: statsData.autoInsights ?? [],
                    }
                    return { userId: creator.user_id, igData }
                } catch {
                    return null
                }
            })
        ).then(results => {
            const newCache: Record<string, IgPortfolioData> = {}
            results.forEach(r => {
                if (r) newCache[r.userId] = r.igData
            })
            if (Object.keys(newCache).length > 0) {
                setIgPortfolioCache(prev => ({ ...prev, ...newCache }))
            }
        })
    }, [summaryData])

    const fetchPortfolios = async () => {
        setIsLoadingPortfolios(true)
        try {
            const { data, error } = await supabase
                .from('mcn_portfolio_links')
                .select('*')
                .eq('team_id', teamId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setPortfolios(data || [])
        } catch (error) {
            console.error('Failed to fetch portfolios:', error)
            toast.error('포트폴리오 목록을 불러오지 못했습니다.')
        } finally {
            setIsLoadingPortfolios(false)
        }
    }

    const toggleCreator = (userId: string) => {
        setSelectedCreatorIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        )
    }

    const handleSyncInstagram = async (userId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setSyncingCreatorId(userId)
        try {
            const res = await fetch(`/api/instagram/profile-stats?userId=${userId}`)
            const data = await res.json()
            if (!res.ok || data.error) {
                throw new Error(data.error || 'IG 데이터를 가져오지 못했습니다.')
            }
            toast.success(`✅ IG 데이터 연동 완료! ER ${data.er ?? '-'}% · 평균 도달 ${data.avgReach?.toLocaleString() ?? '-'}`)
        } catch (err: any) {
            toast.error(err.message || 'Instagram 연동에 실패했습니다. 계정이 연결되어 있는지 확인해주세요.')
        } finally {
            setSyncingCreatorId(null)
        }
    }

    const handleAutoGeneratePortfolio = async (creator: CreatorSummary, e: React.MouseEvent) => {
        e.stopPropagation()
        // 기존 포트폴리오가 있으면 덜어쓰기 구엪 전에 경고
        if (igPortfolioCache[creator.user_id]) {
            setPendingOverwriteCreator(creator)
            return
        }
        await doGeneratePortfolio(creator)
    }

    const doGeneratePortfolio = async (creator: CreatorSummary) => {
        setAutoGeneratingId(creator.user_id)
        try {
            // 1. 통계 + 게시물 병렬 조회
            const [statsRes, mediaRes] = await Promise.all([
                fetch(`/api/instagram/profile-stats?userId=${creator.user_id}&priceVideo=${creator.price_video || 0}&priceFeed=${creator.price_feed || 0}`),
                fetch(`/api/instagram/media?userId=${creator.user_id}`),
            ])
            const [statsData, mediaData] = await Promise.all([statsRes.json(), mediaRes.json()])

            if (!statsRes.ok || statsData.error) {
                toast.error('Instagram이 연결되지 않았습니다. 크리에이터가 먼저 인스타그램 연동을 해야 합니다.')
                return
            }

            // 2. IG 데이터 캐시에 저장 (포트폴리오 보기에서 사용)
            const igData: IgPortfolioData = {
                // 레거시
                er: statsData.er ?? null,
                avgReach: statsData.avgReach ?? null,
                avgSaves: statsData.avgSaves ?? null,
                posts: mediaData.data || [],
                // 인구통계 (Demographics 섹션에서 실데이터로 사용)
                audienceFemaleRatio: statsData.audienceFemaleRatio ?? null,
                audienceDomesticRatio: statsData.audienceDomesticRatio ?? null,
                allAgeGroups: statsData.allAgeGroups ?? [],
                topCities: statsData.topCities ?? [],
                // 계정 레벨 인사이트 (30일)
                accountInsights: {
                    profileViews30d: statsData.profileViews30d ?? null,
                    websiteClicks30d: statsData.websiteClicks30d ?? null,
                    monthlyReach: statsData.monthlyReach ?? null,
                    monthlyImpressions: statsData.monthlyImpressions ?? null,
                },
                // 10개 파생 지표
                derivedMetrics: {
                    erByFollowers: statsData.erByFollowers ?? null,
                    erByReach: statsData.erByReach ?? null,
                    saveRate: statsData.saveRate ?? null,
                    reachRate: statsData.reachRate ?? null,
                    realFanIndex: statsData.realFanIndex ?? null,
                    fqi: statsData.fqi ?? null,
                    viralityRate: statsData.viralityRate ?? null,
                    cpr: statsData.cpr ?? null,
                    cpe: statsData.cpe ?? null,
                    tms: statsData.tms ?? null,
                    roasPrediction: statsData.roasPrediction ?? null,
                    avgLikes: statsData.avgLikes ?? null,
                    avgComments: statsData.avgComments ?? null,
                    avgShares: statsData.avgShares ?? null,
                    avgViews: statsData.avgViews ?? null,
                    avgEngagement: statsData.avgEngagement ?? null,
                    postCount: statsData.postCount ?? null,
                },
                // 파생 지표 기반 자동 생성 배지
                autoInsights: statsData.autoInsights ?? [],
            }
            setIgPortfolioCache(prev => ({ ...prev, [creator.user_id]: igData }))

            // 3. DB에도 저장 (SECURITY DEFINER RPC - RLS 우회)
            const { error: rpcError } = await supabase.rpc('mcn_update_ig_portfolio_snapshot', {
                p_creator_user_id: creator.user_id,
                p_snapshot: igData,
            })
            if (rpcError) console.warn('[mcn-portfolio] snapshot save error:', rpcError.message)

            toast.success(`✨ 포트폴리오 저장 완료! 오른쪽 "포트폴리오 보기"를 눌러보세요.`)
        } catch (err: any) {
            toast.error(err.message || '포트폴리오 생성 중 오류가 발생했습니다.')
        } finally {
            setAutoGeneratingId(null)
        }
    }

    const selectAll = () => {
        if (selectedCreatorIds.length === summaryData.length) {
            setSelectedCreatorIds([])
        } else {
            setSelectedCreatorIds(summaryData.map(c => c.user_id))
        }
    }

    const resetForm = () => {
        setEditingPortfolioId(null)
        setBrandName("")
        setMessage("")
        setSelectedCreatorIds([])
        setGeneratedLink("")
    }

    const handleSavePortfolio = async () => {
        if (selectedCreatorIds.length === 0) {
            toast.error("최소 1명 이상의 크리에이터를 선택해주세요.")
            return
        }
        if (!brandName.trim()) {
            toast.error("제안할 브랜드명을 입력해주세요.")
            return
        }

        setIsGenerating(true)
        try {
            if (editingPortfolioId) {
                // 수정
                const { error } = await supabase
                    .from('mcn_portfolio_links')
                    .update({
                        brand_name: brandName,
                        message: message || null,
                        creator_ids: selectedCreatorIds
                    })
                    .eq('id', editingPortfolioId)

                if (error) throw error
                toast.success("포트폴리오가 수정되었습니다!")
                const url = `${window.location.origin}/proposal/${editingPortfolioId}`
                setGeneratedLink(url)
            } else {
                // 신규 생성
                const { data, error } = await supabase
                    .from('mcn_portfolio_links')
                    .insert({
                        team_id: teamId,
                        brand_name: brandName,
                        message: message || null,
                        creator_ids: selectedCreatorIds
                    })
                    .select('id')
                    .single()

                if (error) throw error
                const url = `${window.location.origin}/proposal/${data.id}`
                setGeneratedLink(url)
                setEditingPortfolioId(data.id) // 방금 만든걸 다시 수정할지도 모르므로 ID 셋팅
                toast.success("포트폴리오 제안 링크가 생성되었습니다!")
            }
        } catch (error: any) {
            console.error('Portfolio save error:', error)
            toast.error("저장에 실패했습니다: " + (error.message || '알 수 없는 오류'))
        } finally {
            setIsGenerating(false)
        }
    }

    const loadPortfolioForEdit = (p: PortfolioLink) => {
        setEditingPortfolioId(p.id)
        setBrandName(p.brand_name)
        setMessage(p.message || "")
        setSelectedCreatorIds(p.creator_ids || [])
        setGeneratedLink(`${window.location.origin}/proposal/${p.id}`)
        setActiveTab('edit')
    }

    const deletePortfolio = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm("정말 이 포트폴리오를 삭제하시겠습니까? 브랜드에게 전달된 링크 역시 즉시 폭파됩니다.")) return

        try {
            const { error } = await supabase
                .from('mcn_portfolio_links')
                .delete()
                .eq('id', id)
            if (error) throw error
            toast.success("구성이 삭제되었습니다.")
            fetchPortfolios() // 리스트 강제 갱신
            if (editingPortfolioId === id) {
                resetForm()
            }
        } catch (error) {
            toast.error("삭제 실패. 다시 시도해주세요.")
        }
    }

    const copyLink = (urlToCopy: string = generatedLink, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        if (!urlToCopy) return
        navigator.clipboard.writeText(urlToCopy)
        toast.success("포트폴리오 링크가 복사되었습니다. 카카오톡이나 이메일로 전달하세요!")
    }

    return (
        <div className="space-y-6">
            {/* 포트폴리오 덮어쓰기 경고 AlertDialog */}
            <AlertDialog open={!!pendingOverwriteCreator} onOpenChange={(open) => !open && setPendingOverwriteCreator(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>포트폴리오가 이미 존재합니다</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <span className="block">
                                <strong>{pendingOverwriteCreator?.display_name}</strong>님의 포트폴리오를 새로 생성하면 기존 포트폴리오가 삭제됩니다.
                            </span>
                            <span className="block text-sm text-muted-foreground">
                                💡 IG 통계 데이터만 최신화하려면 <strong>인스타그램 정보 갱신</strong> 버튼을 이용하세요.
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90 text-white"
                            onClick={async () => {
                                const creator = pendingOverwriteCreator!
                                setPendingOverwriteCreator(null)
                                await doGeneratePortfolio(creator)
                            }}
                        >
                            덮어쓰기
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <div>
                    <h2 className="text-xl font-bold">크리에이터 포트폴리오 제안</h2>
                    <p className="text-sm text-muted-foreground mt-1">소속 크리에이터들을 묶어서 브랜드에게 전달할 맞춤형 랜딩 페이지를 생성하고 관리합니다.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Input Form & Generated Link */}
                <div className="space-y-6 lg:col-span-1">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-sm font-semibold">
                                {editingPortfolioId ? '포트폴리오 데이터 수정' : '새 포트폴리오 구성'}
                            </CardTitle>
                            {editingPortfolioId && (
                                <Button variant="ghost" size="sm" onClick={resetForm} className="h-7 text-xs text-muted-foreground">
                                    + 새 구성으로 초기화
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold">제안할 대상 브랜드명 <span className="text-red-500">*</span></label>
                                <Input
                                    placeholder="예: 아모레퍼시픽, 무신사"
                                    value={brandName}
                                    onChange={e => setBrandName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold">인사말 및 제안 내용 (선택)</label>
                                <Textarea
                                    placeholder="브랜드에게 전달할 간단한 인사말이나 제안 포인트를 적어주세요."
                                    className="resize-none h-24 text-sm"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                            </div>

                            <Button
                                className={`w-full ${editingPortfolioId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                                onClick={handleSavePortfolio}
                                disabled={isGenerating || selectedCreatorIds.length === 0 || !brandName.trim()}
                            >
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                                {editingPortfolioId ? `수정 완료 및 링크 유지 (${selectedCreatorIds.length}명)` : `포트폴리오 링크 발급 (${selectedCreatorIds.length}명)`}
                            </Button>
                        </CardContent>
                    </Card>

                    {generatedLink && (
                        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-800/40 animate-in fade-in slide-in-from-bottom-2">
                            <CardContent className="pt-6">
                                <h3 className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" /> 링크 발급 완료!
                                </h3>
                                <p className="text-xs text-purple-700 dark:text-purple-400 mb-4">
                                    이 링크를 브랜드 담당자에게 카카오톡이나 이메일로 전달하세요. 해당 링크 접속 시 지금 고른 크리에이터들의 프로필 카드만 렌더링됩니다.
                                </p>
                                <div className="flex items-center gap-2">
                                    <Input value={generatedLink} readOnly className="bg-white dark:bg-black text-xs font-mono" />
                                    <Button size="icon" variant="outline" onClick={() => copyLink(generatedLink)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right: Tabs (Edit Selection vs View Lists) */}
                <div className="lg:col-span-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 mb-4 h-auto">
                            <TabsTrigger
                                value="edit"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent px-4 py-2 font-semibold"
                            >
                                현재 구성에 포함할 크리에이터 선택
                            </TabsTrigger>
                            <TabsTrigger
                                value="view"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent px-4 py-2 font-semibold"
                            >
                                과거 구성했던 포트폴리오 관리
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="edit" className="flex-1 mt-0">
                            <Card className="flex flex-col h-[600px]">
                                <CardHeader className="border-b pb-4 shrink-0 flex flex-row items-center justify-between space-y-0">
                                    <div>
                                        <CardTitle className="text-sm font-semibold">명단 테이블</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">{selectedCreatorIds.length}명 선택됨</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={selectAll}>
                                        {selectedCreatorIds.length === summaryData.length ? "선택 전체 해제" : "소속 크리에이터 전체 선택"}
                                    </Button>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto p-0">
                                    {summaryData.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                                            <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                                            <p className="text-sm">소속된 크리에이터가 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y">
                                            {summaryData.map(creator => (
                                                <div
                                                    key={creator.user_id}
                                                    className={`flex items-center gap-4 p-4 transition-colors ${selectedCreatorIds.includes(creator.user_id) ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : 'hover:bg-muted/50'}`}
                                                >
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <label className="flex items-center gap-4 cursor-pointer">
                                                            <Checkbox
                                                                checked={selectedCreatorIds.includes(creator.user_id)}
                                                                onCheckedChange={() => toggleCreator(creator.user_id)}
                                                            />
                                                        </label>
                                                        <CreatorProfileCard
                                                            creatorId={creator.user_id}
                                                            igPortfolioData={igPortfolioCache[creator.user_id] ?? null}
                                                            trigger={
                                                                <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity flex-1 min-w-0 text-left">
                                                                    <Avatar className="h-10 w-10">
                                                                        <AvatarImage src={creator.avatar_url || ''} />
                                                                        <AvatarFallback>{creator.display_name?.[0]}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-semibold text-sm truncate">{creator.display_name}</p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="text-xs text-muted-foreground">팔로워 {(creator.followers_count || 0).toLocaleString()}</span>
                                                                            {creator.price_video > 0 && (
                                                                                <span className="text-xs border px-1.5 rounded-sm bg-background text-muted-foreground">쇼츠 단가 {creator.price_video.toLocaleString()}원</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 text-xs font-medium gap-1.5"
                                                            disabled={syncingCreatorId === creator.user_id}
                                                            onClick={(e) => handleSyncInstagram(creator.user_id, e)}
                                                        >
                                                            {syncingCreatorId === creator.user_id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Instagram className="h-3 w-3" />
                                                            )}
                                                            인스타그램 정보 갱신
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 text-xs font-medium gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                                                            disabled={autoGeneratingId === creator.user_id}
                                                            onClick={(e) => handleAutoGeneratePortfolio(creator, e)}
                                                        >
                                                            {autoGeneratingId === creator.user_id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Wand2 className="h-3 w-3" />
                                                            )}
                                                            포트폴리오 자동 생성
                                                        </Button>
                                                        <CreatorProfileCard
                                                            creatorId={creator.user_id}
                                                            igPortfolioData={igPortfolioCache[creator.user_id] ?? null}
                                                            trigger={
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className={`h-8 text-xs font-medium transition-all ${igPortfolioCache[creator.user_id] ? 'border-indigo-400 text-indigo-700 dark:border-indigo-600 dark:text-indigo-400' : ''}`}
                                                                >
                                                                    {igPortfolioCache[creator.user_id] ? '📊 포트폴리오 보기 (IG 연동됨)' : '포트폴리오 보기'}
                                                                </Button>
                                                            }
                                                            actionSlot={
                                                                <Button
                                                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl"
                                                                    onClick={(e) => {
                                                                        e.preventDefault()
                                                                        e.stopPropagation()
                                                                        const cache = igPortfolioCache[creator.user_id]
                                                                        // 기존 저장된 insights → 없으면 자동생성 autoInsights 로 pre-fill
                                                                        const src = (cache?.insights && cache.insights.some(i => i.title)) ? cache.insights : (cache?.autoInsights ?? [])
                                                                        setEditForm({
                                                                            display_name: creator.display_name || '',
                                                                            bio: '',
                                                                            tags: (creator.tags || []).join(', '),
                                                                            price_video: String(creator.price_video || ''),
                                                                            price_feed: String(creator.price_feed || ''),
                                                                            insight1_emoji: src[0]?.emoji ?? '🥇',
                                                                            insight1_title: src[0]?.title ?? '',
                                                                            insight1_desc: src[0]?.description ?? '',
                                                                            insight2_emoji: src[1]?.emoji ?? '🚀',
                                                                            insight2_title: src[1]?.title ?? '',
                                                                            insight2_desc: src[1]?.description ?? '',
                                                                            insight3_emoji: src[2]?.emoji ?? '💡',
                                                                            insight3_title: src[2]?.title ?? '',
                                                                            insight3_desc: src[2]?.description ?? '',
                                                                            target_text: cache?.demographics?.targetAudienceText ?? '',
                                                                            female_pct: String(cache?.demographics?.femalePct ?? (cache?.audienceFemaleRatio ?? '')),
                                                                            age_groups: (cache?.demographics?.ageGroups?.length ? cache.demographics.ageGroups : (cache?.allAgeGroups ?? [])).map((a: any) => `${a.age}:${a.pct}`).join(', '),
                                                                            cities: (cache?.demographics?.cities?.length ? cache.demographics.cities : (cache?.topCities ?? [])).map((c: any) => `${c.city}:${c.pct}`).join(', '),
                                                                        })
                                                                        setEditingPortfolioCreator(creator)
                                                                    }}
                                                                >
                                                                    <Pencil className="mr-2 h-4 w-4" /> 포트폴리오 수정하기
                                                                </Button>
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="view" className="flex-1 mt-0">
                            <Card className="flex flex-col h-[600px]">
                                <CardHeader className="border-b pb-4 shrink-0 flex flex-row items-center justify-between space-y-0">
                                    <div>
                                        <CardTitle className="text-sm font-semibold">저장된 제안 링크 목록</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">지금까지 생성한 {portfolios.length}개의 포트폴리오를 관리합니다.</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={fetchPortfolios} disabled={isLoadingPortfolios}>
                                        <Loader2 className={`w-4 h-4 mr-1.5 ${isLoadingPortfolios ? 'animate-spin' : ''}`} /> 새로고침
                                    </Button>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto p-0 bg-muted/20">
                                    {isLoadingPortfolios ? (
                                        <div className="flex items-center justify-center p-12 text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        </div>
                                    ) : portfolios.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                                            <Sparkles className="h-10 w-10 mb-3 text-muted-foreground/30" />
                                            <p className="font-semibold text-sm">아직 생성된 포트폴리오가 없습니다.</p>
                                            <p className="text-xs mt-1">좌측 폼을 통해 브랜드에게 전달할 첫 포트폴리오를 구성해보세요!</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3 p-4">
                                            {portfolios.map(p => (
                                                <div key={p.id} className="bg-background border rounded-lg p-4 shadow-sm hover:shadow transition-shadow">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-bold text-base truncate">{p.brand_name}</h4>
                                                                <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                                                                    {p.creator_ids.length}명 포함됨
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground truncate mb-2">
                                                                {p.message || '(등록된 인사말이 없습니다)'}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground/60 mb-4">
                                                                생성일: {new Date(p.created_at).toLocaleString('ko-KR')}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col gap-2 shrink-0">
                                                            <Button size="sm" onClick={() => loadPortfolioForEdit(p)} className="h-8 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400">
                                                                수정하여 불러오기
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 pt-3 border-t">
                                                        <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1" onClick={(e) => copyLink(`${window.location.origin}/proposal/${p.id}`, e)}>
                                                            <Copy className="h-3 w-3 mr-1" /> 링크 복사
                                                        </Button>
                                                        <button className="text-[10px] text-red-500 hover:text-red-600 hover:underline px-2 font-semibold" onClick={(e) => deletePortfolio(p.id, e)}>
                                                            삭제 (폭파)
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            {/* 포트폴리오 인라인 수정 Sheet */}
            <Sheet open={!!editingPortfolioCreator} onOpenChange={(open) => !open && setEditingPortfolioCreator(null)}>
                <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
                    <SheetHeader className="pb-4 border-b shrink-0">
                        <SheetTitle className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            포트폴리오 수정 — {editingPortfolioCreator?.display_name}
                        </SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 space-y-6 py-5 overflow-y-auto pr-1">

                        {/* ──── Creator Insights ──── */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">✨ Creator Insights (배지 3개)</h4>
                                {editingPortfolioCreator && (igPortfolioCache[editingPortfolioCreator.user_id]?.autoInsights?.length ?? 0) > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-[10px] h-6 px-2 gap-1"
                                        onClick={() => {
                                            const auto = igPortfolioCache[editingPortfolioCreator.user_id]?.autoInsights ?? []
                                            setEditForm(p => ({
                                                ...p,
                                                insight1_emoji: auto[0]?.emoji ?? p.insight1_emoji,
                                                insight1_title: auto[0]?.title ?? p.insight1_title,
                                                insight1_desc: auto[0]?.description ?? p.insight1_desc,
                                                insight2_emoji: auto[1]?.emoji ?? p.insight2_emoji,
                                                insight2_title: auto[1]?.title ?? p.insight2_title,
                                                insight2_desc: auto[1]?.description ?? p.insight2_desc,
                                                insight3_emoji: auto[2]?.emoji ?? p.insight3_emoji,
                                                insight3_title: auto[2]?.title ?? p.insight3_title,
                                                insight3_desc: auto[2]?.description ?? p.insight3_desc,
                                            }))
                                        }}
                                    >
                                        <Wand2 className="h-3 w-3" /> AI 자동채우기
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-4">
                                {([1, 2, 3] as const).map(n => (
                                    <div key={n} className="p-3 border rounded-xl space-y-2 bg-muted/30">
                                        <div className="flex gap-2">
                                            <Input
                                                value={editForm[`insight${n}_emoji` as keyof typeof editForm]}
                                                onChange={e => setEditForm(p => ({ ...p, [`insight${n}_emoji`]: e.target.value }))}
                                                className="w-14 text-center text-base"
                                                placeholder="🥇"
                                            />
                                            <Input
                                                value={editForm[`insight${n}_title` as keyof typeof editForm]}
                                                onChange={e => setEditForm(p => ({ ...p, [`insight${n}_title`]: e.target.value }))}
                                                placeholder={`배지 ${n} 제목`}
                                                className="flex-1"
                                            />
                                        </div>
                                        <Textarea
                                            value={editForm[`insight${n}_desc` as keyof typeof editForm]}
                                            onChange={e => setEditForm(p => ({ ...p, [`insight${n}_desc`]: e.target.value }))}
                                            placeholder={`배지 ${n} 설명 (브랜드에게 보여질 강점을 입력)`}
                                            className="resize-none min-h-[60px] text-xs"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>

                    <SheetFooter className="pt-4 border-t shrink-0">
                        <Button
                            className="w-full"
                            disabled={isSavingEdit}
                            onClick={async () => {
                                if (!editingPortfolioCreator) return
                                setIsSavingEdit(true)
                                try {
                                    const userId = editingPortfolioCreator.user_id

                                    // Insights 파싱
                                    const insights = [1, 2, 3].map(n => ({
                                        emoji: editForm[`insight${n}_emoji` as keyof typeof editForm] || '',
                                        title: editForm[`insight${n}_title` as keyof typeof editForm] || '',
                                        description: editForm[`insight${n}_desc` as keyof typeof editForm] || '',
                                    }))

                                    // Demographics 파싱
                                    const parseKV = (str: string) => str.split(',').map(s => {
                                        const [k, v] = s.trim().split(':')
                                        return { key: k?.trim(), pct: Number(v?.trim()) }
                                    }).filter(x => x.key && !isNaN(x.pct))

                                    const ageGroups = parseKV(editForm.age_groups).map(x => ({ age: x.key, pct: x.pct }))
                                    const cities = parseKV(editForm.cities).map(x => ({ city: x.key, pct: x.pct }))
                                    const demographics = {
                                        targetAudienceText: editForm.target_text,
                                        femalePct: Number(editForm.female_pct) || 50,
                                        ageGroups,
                                        cities,
                                    }

                                    // 기존 캐시에 insights/demographics 병합
                                    const existing = igPortfolioCache[userId] ?? { er: null, avgReach: null, avgSaves: null, posts: [] }
                                    const updatedData = { ...existing, insights, demographics }

                                    // DB 저장 (SECURITY DEFINER RPC - RLS 우회)
                                    const { error: dbError } = await supabase.rpc('mcn_update_ig_portfolio_snapshot', {
                                        p_creator_user_id: userId,
                                        p_snapshot: updatedData,
                                    })

                                    if (dbError) throw dbError

                                    // 메모리 캐시도 업데이트
                                    setIgPortfolioCache(prev => ({ ...prev, [userId]: updatedData }))

                                    toast.success('포트폴리오가 저장됐습니다! ✨')
                                    setEditingPortfolioCreator(null)
                                } catch (err: any) {
                                    toast.error(err.message || '저장 중 오류가 발생했습니다.')
                                } finally {
                                    setIsSavingEdit(false)
                                }
                            }}
                        >
                            {isSavingEdit ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
                            저장하기
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    )
}
