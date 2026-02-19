"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, Eye, Heart, MessageCircle, Share2, Bookmark, Lightbulb, X, ImagePlus, Loader2, BarChart3, Image as ImageIcon, Film } from "lucide-react"
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

type SlotKey = "account" | "post" | "reels"

interface SlotConfig {
    key: SlotKey
    label: string
    description: string
    icon: React.ElementType
    color: string
    bgColor: string
    darkBgColor: string
    badgeItems: string[]
    recommended?: boolean
}

const SLOTS: SlotConfig[] = [
    {
        key: "account",
        label: "계정 전체 인사이트",
        description: "프로필 → 프로페셔널 대시보드 → 계정 인사이트",
        icon: BarChart3,
        color: "text-violet-600 dark:text-violet-400",
        bgColor: "bg-violet-100",
        darkBgColor: "dark:bg-violet-900/40",
        badgeItems: ["도달한 계정 수", "참여한 계정 수", "팔로워 수 + 증감"],
    },
    {
        key: "post",
        label: "개별 게시물 인사이트",
        description: "게시물 열기 → 하단 \"인사이트 보기\" 탭",
        icon: ImageIcon,
        color: "text-pink-600 dark:text-pink-400",
        bgColor: "bg-pink-100",
        darkBgColor: "dark:bg-pink-900/40",
        badgeItems: ["좋아요", "댓글", "공유", "저장", "도달 수", "노출 수"],
    },
    {
        key: "reels",
        label: "릴스 인사이트",
        description: "릴스 열기 → \"인사이트 보기\"",
        icon: Film,
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-100",
        darkBgColor: "dark:bg-emerald-900/40",
        badgeItems: ["재생 수", "좋아요", "댓글", "공유", "저장", "평균 시청 시간"],
        recommended: true,
    },
]

interface SlotState {
    file: File | null
    preview: string | null
    result: AnalysisResult | null
    isAnalyzing: boolean
}

export default function InsightAnalyzer() {
    const [slots, setSlots] = useState<Record<SlotKey, SlotState>>({
        account: { file: null, preview: null, result: null, isAnalyzing: false },
        post: { file: null, preview: null, result: null, isAnalyzing: false },
        reels: { file: null, preview: null, result: null, isAnalyzing: false },
    })
    const fileInputRefs = useRef<Record<SlotKey, HTMLInputElement | null>>({ account: null, post: null, reels: null })

    const handleFile = useCallback((key: SlotKey, f: File) => {
        if (!f.type.startsWith("image/")) {
            toast.error("이미지 파일만 업로드 가능합니다.")
            return
        }
        const reader = new FileReader()
        reader.onload = (e) => {
            setSlots(prev => ({
                ...prev,
                [key]: { file: f, preview: e.target?.result as string, result: null, isAnalyzing: false },
            }))
        }
        reader.readAsDataURL(f)
    }, [])

    const handleAnalyze = async (key: SlotKey) => {
        const slot = slots[key]
        if (!slot.file) return
        setSlots(prev => ({ ...prev, [key]: { ...prev[key], isAnalyzing: true } }))
        try {
            const formData = new FormData()
            formData.append("image", slot.file)
            const res = await fetch("/api/analyze-insight", { method: "POST", body: formData })
            const data = await res.json()
            if (data.error) {
                toast.error(data.error)
                setSlots(prev => ({ ...prev, [key]: { ...prev[key], isAnalyzing: false } }))
                return
            }
            setSlots(prev => ({ ...prev, [key]: { ...prev[key], result: data, isAnalyzing: false } }))
            toast.success(`${SLOTS.find(s => s.key === key)?.label} 분석 완료!`)
        } catch {
            toast.error("분석 중 오류가 발생했습니다.")
            setSlots(prev => ({ ...prev, [key]: { ...prev[key], isAnalyzing: false } }))
        }
    }

    const clearSlot = (key: SlotKey) => {
        setSlots(prev => ({ ...prev, [key]: { file: null, preview: null, result: null, isAnalyzing: false } }))
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

    const hasAnyResult = Object.values(slots).some(s => s.result)

    return (
        <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto px-1 sm:px-0">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                    AI 단가 분석기
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Instagram 인사이트 스크린샷을 유형별로 업로드하면 AI가 자동으로 분석합니다.
                </p>
            </div>

            {/* 3 Upload Slots */}
            <div className="space-y-3">
                {SLOTS.map((slot, idx) => {
                    const state = slots[slot.key]
                    const SlotIcon = slot.icon
                    return (
                        <Card key={slot.key} className={`transition-all ${state.result ? "border-emerald-300 dark:border-emerald-700" : ""}`}>
                            <CardContent className="p-3 sm:p-4">
                                {/* Slot Header */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`h-6 w-6 rounded-full ${slot.bgColor} ${slot.darkBgColor} ${slot.color} text-xs font-bold flex items-center justify-center shrink-0`}>
                                        {idx + 1}
                                    </span>
                                    <span className="font-semibold text-sm">{slot.label}</span>
                                    {slot.recommended && (
                                        <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-600 ml-auto">영상 협업용 추천</Badge>
                                    )}
                                    {state.result && (
                                        <Badge variant="secondary" className="text-[10px] ml-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">✓ 분석 완료</Badge>
                                    )}
                                </div>

                                {/* No file uploaded */}
                                {!state.preview ? (
                                    <div
                                        className="border border-dashed rounded-lg p-3 sm:p-4 text-center cursor-pointer hover:border-violet-400 hover:bg-muted/30 transition-colors"
                                        onClick={() => fileInputRefs.current[slot.key]?.click()}
                                    >
                                        <SlotIcon className="mx-auto h-6 w-6 text-muted-foreground/40 mb-1.5" />
                                        <p className="text-xs text-muted-foreground">{slot.description}</p>
                                        <div className="flex flex-wrap gap-1 justify-center mt-2">
                                            {slot.badgeItems.map(item => (
                                                <Badge key={item} variant="secondary" className="text-[9px] font-normal">{item}</Badge>
                                            ))}
                                        </div>
                                        <input
                                            ref={el => { fileInputRefs.current[slot.key] = el }}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0]
                                                if (f) handleFile(slot.key, f)
                                                e.target.value = ""
                                            }}
                                        />
                                    </div>
                                ) : (
                                    /* File uploaded - show preview + analyze button or result */
                                    <div className="space-y-3">
                                        <div className="flex gap-3 items-center">
                                            <div className="relative shrink-0">
                                                <img
                                                    src={state.preview!}
                                                    alt={slot.label}
                                                    className="w-16 sm:w-20 h-auto rounded-lg border object-contain max-h-28"
                                                />
                                                <button
                                                    onClick={() => clearSlot(slot.key)}
                                                    className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow hover:scale-110 transition-transform"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">{state.file?.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{state.file ? `${(state.file.size / 1024).toFixed(0)}KB` : ""}</p>
                                                {!state.result && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAnalyze(slot.key)}
                                                        disabled={state.isAnalyzing}
                                                        className="mt-1.5 h-7 text-xs bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                                                    >
                                                        {state.isAnalyzing ? (
                                                            <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> 분석 중...</>
                                                        ) : (
                                                            <><Sparkles className="mr-1 h-3 w-3" /> 분석</>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                            {/* Inline mini result */}
                                            {state.result && (
                                                <div className="text-right shrink-0">
                                                    <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{state.result.engagementRate}%</p>
                                                    <p className="text-[10px] text-muted-foreground">{state.result.engagementEmoji} {state.result.engagementGrade}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Expanded result for this slot */}
                                        {state.result && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                                {[
                                                    { icon: Eye, label: "조회수", value: state.result.extracted.metrics.views },
                                                    { icon: Heart, label: "좋아요", value: state.result.extracted.metrics.likes },
                                                    { icon: MessageCircle, label: "댓글", value: state.result.extracted.metrics.comments },
                                                    { icon: Share2, label: "공유", value: state.result.extracted.metrics.shares },
                                                    { icon: Bookmark, label: "저장", value: state.result.extracted.metrics.saves },
                                                    { icon: TrendingUp, label: "도달", value: state.result.extracted.metrics.reach },
                                                ].filter(item => item.value != null).map((item) => (
                                                    <div key={item.label} className="flex items-center gap-1 text-xs bg-muted/50 rounded px-2 py-1">
                                                        <item.icon className="h-3 w-3 text-muted-foreground shrink-0" />
                                                        <span className="text-muted-foreground text-[10px]">{item.label}</span>
                                                        <span className="font-semibold ml-auto text-[11px]">{formatNum(item.value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Combined Summary */}
            {hasAnyResult && (
                <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                    {/* Best recommended price from all results */}
                    {(() => {
                        const results = Object.values(slots).filter(s => s.result).map(s => s.result!)
                        const bestPrice = Math.max(...results.map(r => r.recommendedPrice || 0))
                        const avgEngagement = results.reduce((sum, r) => sum + r.engagementRate, 0) / results.length
                        const totalTips = [...new Set(results.flatMap(r => r.tips))]

                        return (
                            <>
                                {/* Combined Price Card */}
                                <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
                                    <CardContent className="p-3 sm:p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">💰 AI 추천 영상단가</p>
                                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatPrice(bestPrice || null)}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {results.length}개 스크린샷 기반 · 평균 참여율 {avgEngagement.toFixed(1)}%
                                                </p>
                                            </div>
                                            <div className="text-right text-xs text-muted-foreground space-y-0.5">
                                                {results.map((r, i) => (
                                                    <p key={i}>{r.extracted.screenshotType === "account_dashboard" ? "계정" : r.extracted.screenshotType === "post_insight" ? "게시물" : r.extracted.screenshotType === "reel_insight" ? "릴스" : "기타"}: {r.engagementRate}%</p>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Tips */}
                                {totalTips.length > 0 && (
                                    <Card>
                                        <CardContent className="p-3 sm:p-4 space-y-1.5">
                                            <p className="text-sm font-medium flex items-center gap-1.5">
                                                <Lightbulb className="h-4 w-4 text-amber-500" />
                                                개선 팁
                                            </p>
                                            {totalTips.map((tip, i) => (
                                                <p key={i} className="text-xs text-muted-foreground pl-6">• {tip}</p>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )
                    })()}
                </div>
            )}

            {/* Footer tip */}
            {!hasAnyResult && (
                <p className="text-xs text-muted-foreground text-center">
                    💡 최근 릴스 인사이트를 분석하면 가장 정확한 추천 단가를 받을 수 있어요.
                </p>
            )}
        </div>
    )
}
