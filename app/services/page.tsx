"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, BarChart3, CheckCircle2, Megaphone, Target, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />
            <main className="container mx-auto py-12 max-w-[1920px] px-6 md:px-8">

                {/* Hero Section */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                        Creadypick 서비스 소개
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        브랜드와 크리에이터를 완벽한 타이밍에 매칭시켜주는 새로운 방식
                    </p>
                </div>

                <div className="max-w-6xl mx-auto space-y-12 mb-16">

                    {/* 1. Problem & Solution */}
                    {/* 1. Comparison Section (Redesigned) */}
                    <div className="rounded-3xl border bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
                        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                            {/* Existing Way */}
                            <div className="p-8 md:p-12 space-y-8 bg-slate-100/50 dark:bg-slate-950/30 text-muted-foreground">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                        기존 방식
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-500 dark:text-slate-400">"누구(Who)에게 맡길까?"</h3>
                                    <p className="text-lg">크리에이터의 단순 <strong>스펙</strong>에만 집중합니다.</p>
                                </div>

                                <ul className="space-y-6">
                                    <li className="flex gap-4 items-start opacity-70">
                                        <div className="mt-1 bg-slate-200 dark:bg-slate-800 p-1.5 rounded text-slate-500">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <strong className="block text-slate-600 dark:text-slate-400">사람 중심 매칭</strong>
                                            <span className="text-sm">현재 상황과 무관한, 단순히 팔로워 수와 카테고리만 보고 제안합니다.</span>
                                        </div>
                                    </li>
                                    <li className="flex gap-4 items-start opacity-70">
                                        <div className="mt-1 bg-slate-200 dark:bg-slate-800 p-1.5 rounded text-slate-500">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <strong className="block text-slate-600 dark:text-slate-400">낮은 타겟 적중률</strong>
                                            <span className="text-sm">제품이 필요 없는 시점에 광고를 진행하여 진정성과 효율이 떨어집니다.</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* Creadypick Way */}
                            <div className="p-8 md:p-12 space-y-8 bg-white dark:bg-slate-950">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        Creadypick 방식
                                    </div>
                                    <h3 className="text-2xl font-bold text-primary">"언제(When) 맡길까?"</h3>
                                    <p className="text-lg text-foreground">크리에이터의 <strong>라이프 모먼트</strong>에 집중합니다.</p>
                                </div>

                                <ul className="space-y-6">
                                    <li className="flex gap-4 items-start">
                                        <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded text-primary">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <strong className="block text-foreground">모먼트 중심 매칭</strong>
                                            <span className="text-sm text-muted-foreground">이사, 결혼 등 제품이 가장 필요한 순간에 있는 크리에이터와 연결합니다.</span>
                                        </div>
                                    </li>
                                    <li className="flex gap-4 items-start">
                                        <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded text-primary">
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <strong className="block text-foreground">압도적인 진정성</strong>
                                            <span className="text-sm text-muted-foreground">"필요해서 쓰는 제품"만큼 진정성 있고 강력한 광고는 없습니다.</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* 2. Insight - Expanded */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <Megaphone className="h-8 w-8" />
                            </div>
                            <h2 className="text-3xl font-bold">Insight (핵심 통찰)</h2>
                        </div>

                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950/50 dark:to-blue-950/20 p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-10 shadow-sm">
                            <div className="space-y-4">
                                <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 break-keep leading-tight">
                                    크리에이터 광고 성과는<br className="hidden md:block" /> <span className="text-primary">‘사람’</span>보다 <span className="text-primary">‘모먼트’</span>에 더 민감합니다.
                                </h3>
                                <p className="text-lg md:text-xl font-medium text-muted-foreground break-keep max-w-3xl mx-auto">
                                    "크리에이터의 라이프 모먼트에 딱 맞춘 광고는 광고의 질을 높여 광고의 효과를 극대화 합니다"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-left">
                                {[
                                    { t: "이사/자취", d: "가전, 가구, 인테리어", i: "🏠" },
                                    { t: "결혼/연애", d: "웨딩, 커플템, 혼수", i: "💍" },
                                    { t: "출산/육아", d: "유아용품, 베이비케어", i: "👶" },
                                    { t: "반려동물", d: "사료, 간식, 펫용품", i: "🐶" },
                                    { t: "여행/레저", d: "숙박, 카메라, 캐리어", i: "✈️" },
                                    { t: "운동/다이어트", d: "운동기구, 식단, 헬스", i: "💪" },
                                    { t: "취업/이직", d: "오피스룩, IT기기", i: "💼" },
                                    { t: "입학/졸업", d: "선물, 문구, 노트북", i: "🎓" },
                                ].map((item, i) => (
                                    <Card key={i} className="bg-white/80 dark:bg-black/40 border-0 shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                                            <div className="text-4xl mb-2">{item.i}</div>
                                            <div className="font-bold text-lg">{item.t}</div>
                                            <div className="text-sm text-muted-foreground">{item.d}</div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* 3. Original Tabs Content - Properly Spaced */}
                <div className="border-t pt-16">
                    <Tabs defaultValue="brand" className="max-w-5xl mx-auto">
                        <TabsList className="grid w-full grid-cols-2 mb-12 h-14">
                            <TabsTrigger value="brand" className="text-xl">브랜드 (Brand)</TabsTrigger>
                            <TabsTrigger value="creator" className="text-xl">크리에이터 (Creator)</TabsTrigger>
                        </TabsList>

                        {/* Brand Content */}
                        <TabsContent value="brand" className="space-y-10 animate-in fade-in-50 duration-500">
                            <Card className="col-span-full bg-primary/5 border-primary/20">
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Users className="h-6 w-6 text-primary" />
                                        </div>
                                        <span className="text-sm font-bold text-primary tracking-wider uppercase">Brand Benefit</span>
                                    </div>
                                    <CardTitle className="text-3xl">"본업(Essence)에만 집중하세요"</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-2">
                                    <CardDescription className="text-lg leading-relaxed text-foreground/80">
                                        복잡한 마케팅 실무는 Creadypick 시스템에 맡기세요.<br />
                                        대표님과 담당자님은 브랜드의 철학을 다듬고 더 좋은 제품을 만드는 <strong>'본업'</strong>에만 몰입하실 수 있도록 돕겠습니다.
                                    </CardDescription>
                                </CardContent>
                            </Card>

                            <div className="grid md:grid-cols-3 gap-8">
                                <Card className="hover:border-primary/50 transition-colors">
                                    <CardHeader>
                                        <Target className="h-10 w-10 text-blue-600 mb-4" />
                                        <CardTitle className="text-xl">초정밀 타겟팅</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed">단순 팔로워 타겟팅이 아닙니다. 이사, 결혼 등 소비가 가장 왕성한 <strong>생애 주기의 순간</strong>을 공략합니다.</p>
                                    </CardContent>
                                </Card>
                                <Card className="hover:border-primary/50 transition-colors">
                                    <CardHeader>
                                        <BarChart3 className="h-10 w-10 text-blue-600 mb-4" />
                                        <CardTitle className="text-xl">성과 예측 데이터</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed">막연한 기대가 아닌, 유사 모먼트의 과거 캠페인 효율 데이터를 바탕으로 <strong>예상 성과를 시뮬레이션</strong>해드립니다.</p>
                                    </CardContent>
                                </Card>
                                <Card className="hover:border-primary/50 transition-colors">
                                    <CardHeader>
                                        <Zap className="h-10 w-10 text-blue-600 mb-4" />
                                        <CardTitle className="text-xl">원스톱 관리</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed">제안서 발송부터 계약, 콘텐츠 검수, 정산까지. 파편화된 크리에이터 마케팅 업무를 <strong>대시보드 하나</strong>로 끝내세요.</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex flex-col justify-center items-center text-center p-10 bg-muted/30 rounded-2xl border border-dashed hover:bg-muted/50 transition-colors">
                                <h3 className="text-2xl font-bold mb-3">지금 바로 시작하세요</h3>
                                <p className="text-lg text-muted-foreground mb-8">제품이 필요한 크리에이터들이 귀사의 제안을 기다립니다.</p>
                                <Button size="lg" className="w-full md:w-auto px-8 py-6 text-lg" asChild>
                                    <Link href="/brand">
                                        브랜드로 시작하기 <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                        </TabsContent>

                        {/* Creator Content */}
                        <TabsContent value="creator" className="space-y-10 animate-in fade-in-50 duration-500">
                            <Card className="col-span-full bg-primary/5 border-primary/20">
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Users className="h-6 w-6 text-primary" />
                                        </div>
                                        <span className="text-sm font-bold text-primary tracking-wider uppercase">Creator Benefit</span>
                                    </div>
                                    <CardTitle className="text-3xl">"창작(Essence)에만 집중하세요"</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-2">
                                    <CardDescription className="text-lg leading-relaxed text-foreground/80">
                                        까다로운 브랜드 컨택, 영업, 계약 관리는 Creadypick이 덜어드립니다.<br />
                                        당신은 오직 당신만의 독창적인 스토리와 콘텐츠를 만드는 <strong>'창작'</strong>에만 몰입하세요.
                                    </CardDescription>
                                </CardContent>
                            </Card>

                            <div className="grid md:grid-cols-3 gap-8">
                                <Card className="hover:border-primary/50 transition-colors">
                                    <CardHeader>
                                        <Megaphone className="h-10 w-10 text-purple-600 mb-4" />
                                        <CardTitle className="text-xl">일상을 기회로</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed">이사, 여행 계획 등이 있나요? <strong>라이프 이벤트만 등록</strong>하세요. 관련된 브랜드들이 먼저 지원을 제안합니다.</p>
                                    </CardContent>
                                </Card>
                                <Card className="hover:border-primary/50 transition-colors">
                                    <CardHeader>
                                        <CheckCircle2 className="h-10 w-10 text-purple-600 mb-4" />
                                        <CardTitle className="text-xl">검증된 브랜드</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed">Creadypick이 엄선한 신뢰할 수 있는 브랜드와 협업하세요. 불공정 거래 방지 시스템으로 <strong>크리에이터를 보호</strong>합니다.</p>
                                    </CardContent>
                                </Card>
                                <Card className="hover:border-primary/50 transition-colors">
                                    <CardHeader>
                                        <BarChart3 className="h-10 w-10 text-purple-600 mb-4" />
                                        <CardTitle className="text-xl">성장 리포트</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed">나의 채널 가치가 궁금한가요? 팔로워 성장 추이와 영향력을 분석한 <strong>전문 리포트</strong>를 제공합니다.</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex flex-col justify-center items-center text-center p-10 bg-muted/30 rounded-2xl border border-dashed hover:bg-muted/50 transition-colors">
                                <h3 className="text-2xl font-bold mb-3">당신의 가치를 높이세요</h3>
                                <p className="text-lg text-muted-foreground mb-8">당신의 라이프스타일을 응원하는 브랜드가 있습니다.</p>
                                <Button size="lg" className="w-full md:w-auto px-8 py-6 text-lg" asChild>
                                    <Link href="/creator">
                                        크리에이터로 시작하기 <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

            </main>
        </div>
    )
}
