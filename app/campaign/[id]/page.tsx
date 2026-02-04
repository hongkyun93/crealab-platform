"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, DollarSign, Target, User, CheckCircle2, Building2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { usePlatform } from "@/components/providers/platform-provider"
import { useEffect, useState } from "react"
import { Campaign } from "@/components/providers/platform-provider"

export default function CampaignDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { campaigns, user } = usePlatform()
    const [campaign, setCampaign] = useState<Campaign | null>(null)

    useEffect(() => {
        if (params.id) {
            const foundward = campaigns.find(c => c.id === Number(params.id))
            if (foundward) {
                setCampaign(foundward)
            }
        }
    }, [params.id, campaigns])

    if (!campaign) {
        return (
            <div className="min-h-screen bg-muted/30">
                <SiteHeader />
                <main className="container py-20 text-center">
                    <h1 className="text-2xl font-bold mb-4">캠페인을 찾을 수 없습니다.</h1>
                    <Button asChild>
                        <Link href="/creator">돌아가기</Link>
                    </Button>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-4xl px-4 mx-auto">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild className="gap-2">
                        <Link href="/creator">
                            <ArrowLeft className="h-4 w-4" /> 목록으로
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                    {/* Main Content */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
                                    <Building2 className="h-4 w-4" />
                                    {campaign.brand}
                                </div>
                                <h1 className="text-3xl font-bold">{campaign.product}</h1>
                                <p className="text-muted-foreground text-lg">{campaign.category}</p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">캠페인 상세 내용</h3>
                                    <div className="whitespace-pre-wrap text-foreground/80 leading-relaxed bg-muted/30 p-4 rounded-lg">
                                        {campaign.description}
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <Target className="h-4 w-4" /> 모집 대상
                                        </div>
                                        <div className="font-semibold">{campaign.target}</div>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <DollarSign className="h-4 w-4" /> 제공 혜택
                                        </div>
                                        <div className="font-semibold">{campaign.budget}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar / Action */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>요약 정보</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground text-sm">등록일</span>
                                    <span className="font-medium">{campaign.date}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground text-sm">매칭 적합도</span>
                                    <span className="text-emerald-600 font-bold">{campaign.matchScore}%</span>
                                </div>
                                <div className="pt-4">
                                    <Button className="w-full gap-2" size="lg" onClick={() => alert("지원이 완료되었습니다! (프로토타입)")}>
                                        <CheckCircle2 className="h-5 w-5" /> 지원하기
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground mt-2">
                                        평균 경쟁률 5:1
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
