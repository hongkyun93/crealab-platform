"use client"

import { BadgeCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RateCardMessageProps {
    priceVideo?: number
    priceFeed?: number
    usageRightsPrice?: number
    usageRightsMonth?: number
    autoDmPrice?: number
    autoDmMonth?: number
}

export function RateCardMessage({
    priceVideo,
    priceFeed,
    usageRightsPrice,
    usageRightsMonth,
    autoDmPrice,
    autoDmMonth
}: RateCardMessageProps) {
    return (
        <Card className="w-full max-w-sm shadow-sm border-emerald-100 bg-white">
            <CardHeader className="pb-3 pt-4">
                <CardTitle className="flex items-center gap-2 text-base">
                    <BadgeCheck className="h-5 w-5 text-emerald-600" />
                    예상 단가표 <span className="text-xs font-normal text-muted-foreground ml-1">(Rate Card)</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm pb-4">
                <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-dashed">
                        <span className="text-sm font-medium text-muted-foreground">숏폼 영상 (Reels)</span>
                        <span className="font-bold text-emerald-700">
                            {priceVideo ? `₩${priceVideo.toLocaleString()}` : '협의 필요'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-dashed">
                        <span className="text-sm font-medium text-muted-foreground">이미지 (Feed)</span>
                        <span className="font-bold text-emerald-700">
                            {priceFeed ? `₩${priceFeed.toLocaleString()}` : '협의 필요'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-dashed">
                        <span className="text-sm font-medium text-muted-foreground">2차 활용 권한</span>
                        <span className="font-bold text-emerald-700 text-sm">
                            {usageRightsPrice ? (
                                <>
                                    {usageRightsMonth}개월 / ₩{usageRightsPrice.toLocaleString()}
                                </>
                            ) : (
                                '협의 필요'
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">자동 DM (Auto Reply)</span>
                        <span className="font-bold text-emerald-700 text-sm">
                            {autoDmPrice ? (
                                <>
                                    {autoDmMonth}개월 / ₩{autoDmPrice.toLocaleString()}
                                </>
                            ) : (
                                '협의 필요'
                            )}
                        </span>
                    </div>
                </div>
                <p className="text-[10px] text-muted-foreground bg-muted/30 p-2 rounded">
                    * 위 단가는 예상 금액이며, 콘텐츠 난이도와 일정에 따라 실제 협의 시 달라질 수 있습니다.
                </p>
            </CardContent>
        </Card>
    )
}
