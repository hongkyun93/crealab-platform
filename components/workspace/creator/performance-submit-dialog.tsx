"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { Camera, CheckCircle2, Instagram, Loader2, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface PerformanceSubmitDialogProps {
    open: boolean
    onClose: () => void
    proposal: any
    onSubmitted?: () => void
}

export function PerformanceSubmitDialog({
    open,
    onClose,
    proposal,
    onSubmitted,
}: PerformanceSubmitDialogProps) {
    const { supabase, user, refreshData } = useUnifiedProvider()
    // ✅ 기본 탭: instagram
    const [tab, setTab] = useState<"instagram" | "screenshot">("instagram")

    // Screenshot flow
    const [insightFile, setInsightFile] = useState<File | null>(null)
    const [insightResult, setInsightResult] = useState<any>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Instagram flow
    const [igMediaList, setIgMediaList] = useState<any[]>([])
    const [igMediaLoading, setIgMediaLoading] = useState(false)
    const [igSelectedMedia, setIgSelectedMedia] = useState<any>(null)
    const [igFetching, setIgFetching] = useState(false)

    const proposalType = (proposal?.moment_id || proposal?.event_id)
        ? "moment_proposal"
        : (proposal?.campaign_id || proposal?.campaignId)
            ? "campaign_application"
            : "product_application"

    const brandId = proposal?.brand_id || proposal?.brandId

    // 다이얼로그 열릴 때 자동으로 Instagram 미디어 로드
    useEffect(() => {
        if (open && user?.id && igMediaList.length === 0) {
            handleFetchIgMedia()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    // ─── Screenshot: AI 분석 ───────────────────────────────────────────────
    const handleAnalyze = async () => {
        if (!insightFile) return
        setIsAnalyzing(true)
        try {
            const formData = new FormData()
            formData.append("image", insightFile)
            const res = await fetch("/api/analyze-insight", { method: "POST", body: formData })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setInsightResult(data)
            toast.success("AI 분석 완료!")
        } catch (e: any) {
            toast.error(e.message || "분석 중 오류가 발생했습니다.")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleSubmitScreenshot = async () => {
        if (!insightResult || !proposal?.id || !user?.id) return
        setIsSubmitting(true)
        try {
            let screenshotUrl: string | null = null
            if (insightFile) {
                const { data: { session } } = await supabase.auth.getSession()
                const ext = insightFile.name.split(".").pop() || "jpg"
                const filePath = `performance/${proposal.id.toString()}/screenshot.${ext}`
                const uploadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/submissions/${filePath}`
                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest()
                    xhr.addEventListener("load", () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`업로드 실패(${xhr.status})`))))
                    xhr.addEventListener("error", () => reject(new Error("네트워크 오류")))
                    xhr.open("POST", uploadUrl)
                    xhr.setRequestHeader("Authorization", `Bearer ${session?.access_token}`)
                    xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
                    xhr.setRequestHeader("x-upsert", "true")
                    xhr.send(insightFile)
                })
                const { data: { publicUrl } } = supabase.storage.from("submissions").getPublicUrl(filePath)
                screenshotUrl = publicUrl
            }

            const metrics = insightResult?.extracted?.metrics || {}
            const likes = metrics.likes || 0
            const comments = metrics.comments || 0
            const shares = metrics.shares || 0
            const saves = metrics.saves || 0
            const reach = metrics.reach || 0
            const totalEngagement = likes + comments + shares + saves
            const priceOffer = proposal?.price_offer || 0
            const engagementRate = reach > 0 ? parseFloat(((totalEngagement / reach) * 100).toFixed(2)) : 0
            const cpe = totalEngagement > 0 ? parseFloat((priceOffer / totalEngagement).toFixed(2)) : null
            const cpr = reach > 0 ? parseFloat((priceOffer / reach).toFixed(2)) : null

            const { error } = await supabase.from("campaign_performance").insert({
                proposal_type: proposalType,
                proposal_id: proposal.id.toString(),
                creator_id: user.id,
                brand_id: brandId,
                views: metrics.views || null,
                likes: likes || null,
                comments: comments || null,
                shares: shares || null,
                saves: saves || null,
                reach: reach || null,
                engagement_rate: engagementRate,
                cpe,
                cpr,
                screenshot_url: screenshotUrl,
                submitted_by: user.id,
            })
            if (error) throw error

            if (brandId) {
                await supabase.from("notifications").insert({
                    recipient_id: brandId,
                    sender_id: user.id,
                    type: "performance_submitted",
                    content: "크리에이터가 성과를 제출했습니다! 확인 후 최종완료 처리해주세요.",
                    reference_id: proposal.id?.toString(),
                })
            }

            toast.success("성과 데이터가 제출되었습니다! 🎉")
            await refreshData()
            onSubmitted?.()
            onClose()
        } catch (e: any) {
            toast.error(e.message || "제출 중 오류가 발생했습니다.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // ─── Instagram flow ────────────────────────────────────────────────────
    const handleFetchIgMedia = async () => {
        if (!user?.id) return
        setIgMediaLoading(true)
        try {
            const res = await fetch(`/api/instagram/media?userId=${user.id}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "게시물을 불러오지 못했습니다.")
            setIgMediaList(data.data || [])
        } catch (e: any) {
            // 실패해도 탭 전환 없이 에러 메시지만
            toast.error(e.message)
        } finally {
            setIgMediaLoading(false)
        }
    }

    const handleSubmitWithIg = async () => {
        if (!igSelectedMedia || !proposal?.id || !user?.id) return
        setIgFetching(true)
        try {
            const priceOffer = proposal?.price_offer || 0
            const res = await fetch("/api/instagram/insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mediaId: igSelectedMedia.id,
                    userId: user.id,
                    proposalType,
                    proposalId: proposal.id.toString(),
                    brandId,
                    priceOffer,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "성과 제출 실패")

            if (brandId) {
                await supabase.from("notifications").insert({
                    recipient_id: brandId,
                    sender_id: user.id,
                    type: "performance_submitted",
                    content: "크리에이터가 Instagram 성과를 제출했습니다! 확인 후 최종완료 처리해주세요.",
                    reference_id: proposal.id?.toString(),
                })
            }

            toast.success("Instagram 인사이트 기반 성과 제출 완료! 🎉")
            await refreshData()
            onSubmitted?.()
            onClose()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setIgFetching(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            {/* ✅ 다이얼로그 크기 확대: max-w-2xl */}
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-amber-500" />
                        성과 제출
                        <Badge variant="outline" className="text-amber-600 border-amber-400 text-xs ml-1">정산 단계</Badge>
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground -mt-1 mb-3">
                    <span className="font-medium text-foreground">{proposal?.brand_name}</span> · {proposal?.product_name || "협업 성과"}를 제출해주세요.
                </p>

                {/* ✅ Instagram 탭이 왼쪽(첫번째), 기본값 */}
                <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                    <TabsList className="w-full">
                        <TabsTrigger value="instagram" className="flex-1 gap-2">
                            <Instagram className="h-3.5 w-3.5" /> Instagram 연동
                        </TabsTrigger>
                        <TabsTrigger value="screenshot" className="flex-1 gap-2">
                            <Upload className="h-3.5 w-3.5" /> 스크린샷 업로드
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Instagram 탭 ── */}
                    <TabsContent value="instagram" className="space-y-4 mt-4">
                        {igMediaLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-sm text-muted-foreground">게시물 · 릴스 불러오는 중...</span>
                            </div>
                        ) : igMediaList.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground text-sm">
                                <Instagram className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                <p className="font-medium">Instagram 연동이 필요합니다</p>
                                <p className="text-xs mt-1">설정 → Instagram 연결을 먼저 해주세요.</p>
                                <Button variant="outline" size="sm" className="mt-4" onClick={handleFetchIgMedia}>
                                    다시 시도
                                </Button>
                            </div>
                        ) : (
                            <>
                                <p className="text-xs text-muted-foreground">
                                    게시물 · 릴스 <span className="font-medium text-foreground">{igMediaList.length}개</span> 로드됨 — 협업 콘텐츠를 선택하세요
                                </p>
                                {/* ✅ 그리드 높이 확대 */}
                                <div className="grid grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
                                    {igMediaList.map((media) => (
                                        <div
                                            key={media.id}
                                            className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all relative ${igSelectedMedia?.id === media.id ? "border-amber-500 shadow-lg ring-2 ring-amber-400/30" : "border-transparent hover:border-amber-300"}`}
                                            onClick={() => setIgSelectedMedia(media)}
                                        >
                                            {media.thumbnail_url || media.media_url ? (
                                                <img src={media.thumbnail_url || media.media_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">영상</div>
                                            )}
                                            {/* 릴스 뱃지 */}
                                            {media.media_source === 'reel' && (
                                                <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">릴스</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {igSelectedMedia && (
                                    <div className="rounded-lg border bg-muted/20 p-3 text-sm flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                                            <span className="text-muted-foreground truncate max-w-xs">
                                                {igSelectedMedia.caption?.slice(0, 40) || "게시물 선택됨"}
                                                {igSelectedMedia.media_source === 'reel' && <span className="ml-1 text-amber-600 font-medium">[릴스]</span>}
                                            </span>
                                        </div>
                                        <Button onClick={handleSubmitWithIg} disabled={igFetching} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                                            {igFetching ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> 수집 중...</> : "인사이트로 제출"}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>

                    {/* ── 스크린샷 탭 ── */}
                    <TabsContent value="screenshot" className="space-y-4 mt-4">
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-10 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/10 transition-colors"
                            onClick={() => document.getElementById("perf-file-input")?.click()}
                        >
                            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">
                                {insightFile ? insightFile.name : "인사이트 스크린샷을 클릭하거나 드래그해서 올려주세요"}
                            </p>
                            <input
                                id="perf-file-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    setInsightFile(e.target.files?.[0] || null)
                                    setInsightResult(null)
                                }}
                            />
                        </div>

                        {insightFile && !insightResult && (
                            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                                {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> AI 분석 중...</> : "AI로 수치 분석하기"}
                            </Button>
                        )}

                        {insightResult && (
                            <div className="space-y-3">
                                <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-1.5">
                                    <p className="font-semibold text-foreground mb-2 flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> AI 분석 결과
                                    </p>
                                    {Object.entries(insightResult?.extracted?.metrics || {}).map(([k, v]) => (
                                        <div key={k} className="flex justify-between text-muted-foreground">
                                            <span className="capitalize">{k}</span>
                                            <span className="font-medium text-foreground">{String(v)}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button onClick={handleSubmitScreenshot} disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 제출 중...</> : "성과 제출하기"}
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
