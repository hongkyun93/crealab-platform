"use client"

import { useState, useEffect } from "react"
import { Calculator, HelpCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface AIPriceCalculatorProps {
    initialFollowers?: number
    initialCategory?: string
    onPriceCalculated?: (price: string) => void
}

export function AIPriceCalculator({ initialFollowers = 0, initialCategory = "뷰티", onPriceCalculated }: AIPriceCalculatorProps) {
    const [followers, setFollowers] = useState<string>(initialFollowers.toString())
    const [avgLikes, setAvgLikes] = useState<string>("")
    const [category, setCategory] = useState<string>(initialCategory || "뷰티")
    const [contentType, setContentType] = useState<string>("reels")
    const [calculatedPrice, setCalculatedPrice] = useState<{ min: number, max: number, avg: number } | null>(null)

    // Auto-calculate on mount if followers provided
    useEffect(() => {
        if (initialFollowers > 0) {
            handleCalculate()
        }
    }, []) // Run once

    // Also update if props change significantly (optional, but good for UX)
    useEffect(() => {
        if (initialFollowers !== Number(followers)) {
            setFollowers(initialFollowers.toString())
        }
        if (initialCategory && initialCategory !== category) {
            setCategory(initialCategory)
        }
    }, [initialFollowers, initialCategory])

    const handleCalculate = () => {
        // Logic:
        // Base: Followers * 2~3 KRW
        // Engagement Bonus: (Likes * 50 KRW) (If provided)
        // Category Multiplier
        // Content Type Multiplier (Reels 1.5x)

        const numFollowers = parseInt(followers.replace(/,/g, "")) || 0
        const numLikes = parseInt(avgLikes.replace(/,/g, "")) || 0

        if (numFollowers === 0) return

        let baseRateMin = 2
        let baseRateMax = 4

        // Macro influencers have lower base rate per follower (economy of scale) but higher total
        if (numFollowers > 100000) {
            baseRateMin = 1.5
            baseRateMax = 2.5
        }

        let estimatedMin = numFollowers * baseRateMin
        let estimatedMax = numFollowers * baseRateMax

        // Engagement Bonus (If user knows likes)
        if (numLikes > 0) {
            const engagementBonus = numLikes * 50 // 50 KRW per like value
            estimatedMin += engagementBonus
            estimatedMax += engagementBonus
        } else {
            // Assume 2% engagement if not provided
            const assumedLikes = numFollowers * 0.02
            const engagementBonus = assumedLikes * 30 // Conservative estimate
            estimatedMin += engagementBonus
            estimatedMax += engagementBonus
        }

        // Category Multiplier
        let catMult = 1.0
        if (["뷰티", "테크", "IT", "건강", "다이어트"].includes(category)) catMult = 1.2
        if (["패션", "푸드", "여행", "육아"].includes(category)) catMult = 1.1

        estimatedMin *= catMult
        estimatedMax *= catMult

        // Content Type Multiplier
        if (contentType === "reels" || contentType === "shorts") {
            estimatedMin *= 1.5
            estimatedMax *= 1.5
        } else if (contentType === "blog") {
            estimatedMin *= 0.8
            estimatedMax *= 1.0
        }

        // Round to nearest 10000
        estimatedMin = Math.round(estimatedMin / 5000) * 5000
        estimatedMax = Math.round(estimatedMax / 5000) * 5000

        // Ensure Min is at least 30,000 KRW
        if (estimatedMin < 30000) estimatedMin = 30000
        if (estimatedMax < 50000) estimatedMax = 50000

        const avg = Math.round((estimatedMin + estimatedMax) / 2 / 5000) * 5000

        setCalculatedPrice({ min: estimatedMin, max: estimatedMax, avg })
    }

    const applyPrice = () => {
        if (calculatedPrice && onPriceCalculated) {
            onPriceCalculated(calculatedPrice.avg.toString())
        }
    }

    return (
        <Card className="bg-slate-50 border-slate-200 shadow-sm">
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm flex items-center gap-2 text-indigo-600">
                        <Calculator className="h-4 w-4" /> AI 적정 단가 계산기
                    </h4>
                    <Popover>
                        <PopoverTrigger>
                            <Info className="h-4 w-4 text-slate-400" />
                        </PopoverTrigger>
                        <PopoverContent className="w-64 text-xs text-slate-500 bg-white">
                            팔로워 수, 카테고리, 평균 도달률을 기반으로 업계 평균 단가를 추산합니다. (참고용으로만 활용하세요)
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-[10px]">팔로워 수</Label>
                        <Input
                            className="h-8 text-xs bg-white"
                            value={followers}
                            onChange={(e) => setFollowers(e.target.value)}
                            type="number"
                            placeholder="0"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px]">평균 좋아요 (선택)</Label>
                        <Input
                            className="h-8 text-xs bg-white"
                            value={avgLikes}
                            onChange={(e) => setAvgLikes(e.target.value)}
                            type="number"
                            placeholder="모름"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px]">카테고리</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="h-8 text-xs bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="뷰티">뷰티</SelectItem>
                                <SelectItem value="패션">패션</SelectItem>
                                <SelectItem value="푸드">푸드</SelectItem>
                                <SelectItem value="여행">여행</SelectItem>
                                <SelectItem value="라이프">라이프</SelectItem>
                                <SelectItem value="테크">테크/IT</SelectItem>
                                <SelectItem value="육아">육아</SelectItem>
                                <SelectItem value="반려동물">반려동물</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px]">콘텐츠</Label>
                        <Select value={contentType} onValueChange={setContentType}>
                            <SelectTrigger className="h-8 text-xs bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="reels">릴스/쇼츠 (영상)</SelectItem>
                                <SelectItem value="post">피드 (사진)</SelectItem>
                                <SelectItem value="blog">블로그</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button onClick={handleCalculate} size="sm" className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                    적정 단가 계산하기
                </Button>

                {calculatedPrice && (
                    <div className="mt-4 pt-3 border-t border-slate-200 animate-in slide-in-from-top-2 fade-in">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-bold text-slate-500">추천 제안가</span>
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                                {calculatedPrice.min.toLocaleString()} ~ {calculatedPrice.max.toLocaleString()}원
                            </Badge>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight mb-3">
                            * 콘텐츠 퀄리티, 초상권 활용 여부에 따라 달라질 수 있습니다.
                        </p>
                        {onPriceCalculated && (
                            <Button variant="outline" size="sm" className="w-full h-7 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50" onClick={applyPrice}>
                                평균가 ({calculatedPrice.avg.toLocaleString()}원) 적용하기
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
