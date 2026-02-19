"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Sparkles, TrendingUp, Eye, Heart, MessageCircle, Share2, Bookmark, AlertCircle, Lightbulb, X, ImagePlus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AnalysisResult {
    extracted: {
        metrics: {
            views: number | null
            likes: number | null
            comments: number | null
            shares: number | null
            saves: number | null
            reposts: number | null
            followers: number | null
            newFollowers: number | null
            reach: number | null
            interactions: number | null
            contentCount: number | null
            period: string | null
        }
        trafficSources: {
            feed: number | null
            profile: number | null
            search: number | null
            other: number | null
        }
        screenshotType: string
    }
    engagementRate: number
    engagementGrade: string
    engagementEmoji: string
    totalEngagement: number
    baseCount: number
    recommendedPrice: number | null
    discoveryGrade: string
    tips: string[]
}

export default function InsightAnalyzer() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = useCallback((f: File) => {
        if (!f.type.startsWith("image/")) {
            toast.error("이미지 파일만 업로드 가능합니다.")
            return
        }
        setFile(f)
        setResult(null)
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(f)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
    }, [handleFile])

    const handleAnalyze = async () => {
        if (!file) return
        setIsAnalyzing(true)
        try {
            const formData = new FormData()
            formData.append("image", file)
            const res = await fetch("/api/analyze-insight", {
                method: "POST",
                body: formData,
            })
            const data = await res.json()
            if (data.error) {
                toast.error(data.error)
                return
            }
            setResult(data)
            toast.success("분석 완료!")
        } catch (err) {
            toast.error("분석 중 오류가 발생했습니다.")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const clearAll = () => {
        setFile(null)
        setPreview(null)
        setResult(null)
    }

    const formatNum = (n: number | null | undefined) => {
        if (n == null) return "—"
        if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
        return n.toLocaleString()
    }

    const formatPrice = (n: number | null) => {
        if (!n) return "데이터 부족"
        if (n >= 10000) return `${(n / 10000).toFixed(0)}만원`
        return `${n.toLocaleString()}원`
    }

    return (
        <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto px-1 sm:px-0">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                    AI 단가 분석기
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Instagram 인사이트 스크린샷을 업로드하면 AI가 자동으로 참여율과 추천 영상단가를 분석합니다.
                </p>
            </div>

            {/* Upload Area */}
            {!preview ? (
                <div
                    className={`border-2 border-dashed rounded-xl p-5 sm:p-8 text-center transition-colors cursor-pointer
                        ${dragOver ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30" : "border-muted-foreground/20 hover:border-violet-400 hover:bg-muted/50"}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <ImagePlus className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="font-medium text-sm">인사이트 스크린샷을 드래그하거나 클릭하여 업로드</p>
                    <p className="text-xs text-muted-foreground mt-1">게시물 인사이트, 계정 대시보드, 릴스 인사이트 모두 가능</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleFile(f)
                        }}
                    />
                </div>
            ) : (
                <Card>
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start">
                            <div className="relative shrink-0">
                                <img
                                    src={preview}
                                    alt="인사이트 스크린샷"
                                    className="w-24 sm:w-32 h-auto rounded-lg border object-contain max-h-40 sm:max-h-56"
                                />
                                <button
                                    onClick={clearAll}
                                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-md hover:scale-110 transition-transform"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <p className="text-sm font-medium">{file?.name}</p>
                                    <p className="text-xs text-muted-foreground">{file ? `${(file.size / 1024).toFixed(0)}KB` : ""}</p>
                                </div>
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            AI 분석 중...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            AI 분석 시작
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Screenshot Guide - 업로드 전에만 표시 */}
            {!preview && !result && (
                <Card className="border-muted">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-500" />
                            어떤 화면을 캡처하면 되나요?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4 text-sm">
                        {/* 1. 계정 전체 인사이트 */}
                        <div className="space-y-1.5">
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                                <span className="h-5 w-5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                                계정 전체 인사이트
                            </p>
                            <p className="text-muted-foreground pl-7 text-xs">
                                프로필 → <span className="font-medium text-foreground">프로페셔널 대시보드</span> → 계정 인사이트
                            </p>
                            <div className="pl-7 flex flex-wrap gap-1.5">
                                {["도달한 계정 수", "참여한 계정 수", "팔로워 수 + 증감"].map(item => (
                                    <Badge key={item} variant="secondary" className="text-[10px] font-normal">{item}</Badge>
                                ))}
                            </div>
                        </div>

                        {/* 2. 개별 게시물 인사이트 */}
                        <div className="space-y-1.5">
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                                <span className="h-5 w-5 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                                개별 게시물 인사이트
                            </p>
                            <p className="text-muted-foreground pl-7 text-xs">
                                게시물 열기 → 하단 <span className="font-medium text-foreground">"인사이트 보기"</span> 탭
                            </p>
                            <div className="pl-7 flex flex-wrap gap-1.5">
                                {["좋아요", "댓글", "공유", "저장", "도달 수", "노출 수"].map(item => (
                                    <Badge key={item} variant="secondary" className="text-[10px] font-normal">{item}</Badge>
                                ))}
                            </div>
                        </div>

                        {/* 3. 릴스 인사이트 */}
                        <div className="space-y-1.5">
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                                <span className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                                릴스 인사이트
                                <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-600 ml-1">영상 협업용 추천</Badge>
                            </div>
                            <p className="text-muted-foreground pl-7 text-xs">
                                릴스 열기 → <span className="font-medium text-foreground">"인사이트 보기"</span>
                            </p>
                            <div className="pl-7 flex flex-wrap gap-1.5">
                                {["재생 수", "좋아요", "댓글", "공유", "저장", "평균 시청 시간"].map(item => (
                                    <Badge key={item} variant="secondary" className="text-[10px] font-normal">{item}</Badge>
                                ))}
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground pt-1 border-t">
                            💡 <span className="font-medium">팁:</span> 최근 릴스 3개의 인사이트를 각각 분석하면 평균 참여율을 알 수 있어요.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {result && (
                <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                    {/* Engagement Rate Card */}
                    <Card className="border-violet-200 dark:border-violet-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-violet-500" />
                                    참여율 분석
                                </span>
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${result.engagementRate >= 6 ? "border-red-400 text-red-600 bg-red-50 dark:bg-red-950/30" :
                                        result.engagementRate >= 3 ? "border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" :
                                            result.engagementRate >= 1 ? "border-yellow-400 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30" :
                                                "border-gray-400 text-gray-600"
                                        }`}
                                >
                                    {result.engagementEmoji} {result.engagementGrade}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-3">
                                {result.engagementRate}%
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                                {[
                                    { icon: Eye, label: "조회수", value: result.extracted.metrics.views },
                                    { icon: Heart, label: "좋아요", value: result.extracted.metrics.likes },
                                    { icon: MessageCircle, label: "댓글", value: result.extracted.metrics.comments },
                                    { icon: Share2, label: "공유", value: result.extracted.metrics.shares },
                                    { icon: Bookmark, label: "저장", value: result.extracted.metrics.saves },
                                    { icon: TrendingUp, label: "도달", value: result.extracted.metrics.reach },
                                ].filter(item => item.value != null).map((item) => (
                                    <div key={item.label} className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm bg-muted/50 rounded-lg px-2 py-1.5 sm:px-2.5 sm:py-2">
                                        <item.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="text-muted-foreground text-xs">{item.label}</span>
                                        <span className="font-semibold ml-auto">{formatNum(item.value)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Traffic Sources */}
                            {result.extracted.trafficSources && (result.extracted.trafficSources.feed || result.extracted.trafficSources.search) && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground">트래픽 소스</p>
                                    <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                                        {result.extracted.trafficSources.feed && (
                                            <div className="bg-violet-500 rounded-l-full" style={{ width: `${result.extracted.trafficSources.feed}%` }} title={`피드 ${result.extracted.trafficSources.feed}%`} />
                                        )}
                                        {result.extracted.trafficSources.profile && (
                                            <div className="bg-pink-500" style={{ width: `${result.extracted.trafficSources.profile}%` }} title={`프로필 ${result.extracted.trafficSources.profile}%`} />
                                        )}
                                        {result.extracted.trafficSources.search && (
                                            <div className="bg-emerald-500 rounded-r-full" style={{ width: `${result.extracted.trafficSources.search}%` }} title={`검색 ${result.extracted.trafficSources.search}%`} />
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                        {result.extracted.trafficSources.feed && <span><span className="inline-block w-2 h-2 rounded-full bg-violet-500 mr-1" />피드 {result.extracted.trafficSources.feed}%</span>}
                                        {result.extracted.trafficSources.profile && <span><span className="inline-block w-2 h-2 rounded-full bg-pink-500 mr-1" />프로필 {result.extracted.trafficSources.profile}%</span>}
                                        {result.extracted.trafficSources.search && <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />검색 {result.extracted.trafficSources.search}%</span>}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recommended Price Card */}
                    <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
                        <CardContent className="p-3 sm:p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">💰 AI 추천 영상단가</p>
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatPrice(result.recommendedPrice)}
                                    </p>
                                    {result.recommendedPrice && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            CPV 15원 × 조회수 × 참여율 가중치({result.engagementRate >= 3 ? "↑" : "↓"}) 기준
                                        </p>
                                    )}
                                </div>
                                <div className="text-right text-xs text-muted-foreground space-y-0.5">
                                    <p>참여율 배수: ×{result.engagementRate >= 10 ? "2.0" : result.engagementRate >= 6 ? "1.6" : result.engagementRate >= 3 ? "1.3" : result.engagementRate >= 1 ? "1.0" : "0.7"}</p>
                                    <p>총 참여: {result.totalEngagement}회</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tips */}
                    {result.tips.length > 0 && (
                        <Card>
                            <CardContent className="p-4 space-y-2">
                                <p className="text-sm font-medium flex items-center gap-1.5">
                                    <Lightbulb className="h-4 w-4 text-amber-500" />
                                    개선 팁
                                </p>
                                {result.tips.map((tip, i) => (
                                    <p key={i} className="text-sm text-muted-foreground pl-6">• {tip}</p>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Discovery Grade */}
                    <div className="text-xs text-muted-foreground text-center">
                        🔍 발견 평가: {result.discoveryGrade}
                        {result.extracted.metrics.period && ` · 기간: ${result.extracted.metrics.period}`}
                    </div>

                    {/* Retry button */}
                    <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm" onClick={clearAll}>
                            다른 스크린샷 분석
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
