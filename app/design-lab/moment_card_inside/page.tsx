"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlignJustify, ArrowLeft, Grid3X3, Layout } from "lucide-react"
import Link from "next/link"

const DESIGNS = [
    {
        id: "design-a",
        title: "Design A — Magazine Layout",
        description: "와이드 히어로 + 사이드바. 미니멀하고 넓은 여백, 콘텐츠 중심.",
        icon: Layout,
    },
    {
        id: "design-b",
        title: "Design B — Compact Dashboard",
        description: "상단 프로필 바 + 그리드 카드. 데이터 밀도 높고 한눈에 정보 파악.",
        icon: Grid3X3,
    },
    {
        id: "design-c",
        title: "Design C — Single Column Storytelling",
        description: "단일 컬럼 680px, 블로그 스타일. 다크 크리에이터 카드 + 하단 고정 CTA.",
        icon: AlignJustify,
    },
    {
        id: "design-d",
        title: "Design D — Dense Split View ⭐",
        description: "상단에 아바타+제목+CTA 한 줄. 좌=설명+가이드, 우=일정+채널+단가표. 스크롤 최소화.",
        icon: Layout,
    },
    {
        id: "design-e",
        title: "Design E — 3-Column All-in-One ⭐",
        description: "좌=프로필+메타, 중=콘텐츠, 우=단가표. 한 화면에 모든 정보.",
        icon: Grid3X3,
    },
    {
        id: "design-f",
        title: "Design F — Top Banner + Panels ⭐",
        description: "상단 배너에 프로필+일정+채널 모두 배치, 하단 3패널로 콘텐츠 분배.",
        icon: AlignJustify,
    },
]

export default function MomentCardInsideIndexPage() {
    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container max-w-2xl mx-auto px-4 py-12">
                <Button variant="ghost" size="sm" asChild className="gap-2 mb-8">
                    <Link href="/design-lab">
                        <ArrowLeft className="h-4 w-4" /> Design Lab
                    </Link>
                </Button>

                <h1 className="text-3xl font-bold mb-2">모먼트 상세 페이지 디자인</h1>
                <p className="text-muted-foreground mb-8">브랜드가 모먼트 카드를 클릭했을 때 보이는 화면 — 3가지 시안</p>

                <div className="space-y-4">
                    {DESIGNS.map((d) => {
                        const Icon = d.icon
                        return (
                            <Link key={d.id} href={`/design-lab/moment_card_inside/${d.id}`}>
                                <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{d.title}</h3>
                                            <p className="text-sm text-muted-foreground">{d.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}
