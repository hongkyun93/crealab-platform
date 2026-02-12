"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, MapPin, DollarSign, Clock, Users, Gift, Share2 } from "lucide-react"

// --- Mock Data ---
// --- Mock Data (Realistic Korean Content) ---
const MOCK_CAMPAIGNS = [
    {
        id: "c1",
        title: "[제주] 그랜드 조선 호텔 2박 3일 숙박권 체험단",
        brand: "조선호텔앤리조트",
        reward: "숙박권 (80만원 상당) + 조식 포함",
        type: "방문형",
        deadline: "D-5",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
        platform: "Instagram"
    },
    {
        id: "c2",
        title: "글로우 픽업 틴트 신상 5종 컬러 발색 리뷰",
        brand: "글로우(GLOW)",
        reward: "제품제공 + 원고료 15만원",
        type: "배송형",
        deadline: "D-12",
        image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80",
        platform: "YouTube"
    },
    {
        id: "c3",
        title: "간편한 한끼! 프리미엄 밀키트 홈파티 체험",
        brand: "프레시지",
        reward: "밀키트 4종 세트 (10만원 상당)",
        type: "배송형",
        deadline: "오늘마감",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
        platform: "Blog"
    },
    {
        id: "c4",
        title: "AI 영어 회화 앱 '스픽' 1개월 이용 후기",
        brand: "Speak",
        reward: "이용권 + 원고료 30만원",
        type: "기자단",
        deadline: "D-7",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
        platform: "Instagram"
    },
    {
        id: "c5",
        title: "데일리 무드 셋업 자켓 코디 룩북",
        brand: "무신사 스탠다드",
        reward: "제품제공 + 원고료 50만원",
        type: "배송형",
        deadline: "D-15",
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
        platform: "YouTube"
    }
]

export default function CampaignSearchDesignLab() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        switch (selectedDesign) {
            case 1: return <StandardCardGrid />;
            case 2: return <HorizontalDetailList />;
            case 3: return <VisualDiscovery />;
            default: return <StandardCardGrid />;
        }
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header & Filter Section (Matches User Request) */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">캠페인 찾기</h2>
                    <p className="text-muted-foreground mt-1">
                        나의 모먼트와 딱 맞는 브랜드 캠페인을 찾아보세요.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                    {/* Platform */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold min-w-[80px]">플랫폼</span>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="default" className="bg-black text-white hover:bg-black/90">전체</Badge>
                            <Badge variant="outline" className="text-gray-500 hover:bg-gray-50 cursor-pointer font-normal">Instagram</Badge>
                            <Badge variant="outline" className="text-gray-500 hover:bg-gray-50 cursor-pointer font-normal">YouTube</Badge>
                            <Badge variant="outline" className="text-gray-500 hover:bg-gray-50 cursor-pointer font-normal">TikTok</Badge>
                            <Badge variant="outline" className="text-gray-500 hover:bg-gray-50 cursor-pointer font-normal">Blog</Badge>
                        </div>
                    </div>

                    {/* Campaign Type */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold min-w-[80px]">캠페인 형태</span>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="bg-gray-100 px-3 py-1.5 rounded-md font-bold text-gray-900 cursor-pointer">전체보기</div>
                            <div className="px-3 py-1.5 text-gray-500 cursor-pointer hover:text-gray-900">단순 체험단</div>
                            <div className="px-3 py-1.5 text-gray-500 cursor-pointer hover:text-gray-900">기자단/배포형</div>
                            <div className="px-3 py-1.5 text-gray-500 cursor-pointer hover:text-gray-900">영상 제작</div>
                            <div className="px-3 py-1.5 text-gray-500 cursor-pointer hover:text-gray-900 flex items-center gap-1">
                                <span className="text-yellow-400">☆</span> 관심 캠페인
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Reward Range */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold min-w-[80px]">예상 수익</span>
                        <div className="flex flex-wrap gap-6 text-sm">
                            <span className="bg-gray-100 px-3 py-1 rounded font-bold text-gray-900">전체</span>
                            <span className="text-gray-600 cursor-pointer hover:text-gray-900">제품협찬</span>
                            <span className="text-gray-600 cursor-pointer hover:text-gray-900">10만원 이하</span>
                            <span className="text-gray-600 cursor-pointer hover:text-gray-900">10~30만원</span>
                            <span className="text-gray-600 cursor-pointer hover:text-gray-900">30~50만원</span>
                            <span className="text-gray-600 cursor-pointer hover:text-gray-900">50만원 이상</span>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-4">
                            <span className="text-sm font-bold min-w-[80px] pt-1">카테고리</span>
                            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                                <span className="bg-gray-100 px-3 py-1 rounded font-bold text-gray-900 h-fit">전체</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">뷰티</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">패션</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">푸드</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">리빙</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">여행</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">디지털</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">육아</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">반려동물</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">운동/건강</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">게임</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PREVIEW AREA */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border-2 border-dashed border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Badge variant={selectedDesign ? "default" : "outline"} className={!selectedDesign ? "bg-green-50 text-green-700 border-green-200" : ""}>
                            {selectedDesign ? `Selected Design #${selectedDesign}` : "Current Implementation"}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-normal">
                            {selectedDesign ? "Applied to Context" : "Live Code"}
                        </span>
                    </h3>
                    {selectedDesign && (
                        <Button variant="outline" size="sm" onClick={() => setSelectedDesign(null)}>
                            Reset to Default
                        </Button>
                    )}
                </div>

                {renderPreview()}
            </div>

            <div className="border-t my-8" />
            <h3 className="font-bold text-xl mb-6">All Variations</h3>

            {/* #1 Card Grid (Standard) */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">#1. Standard Card Grid</h3>
                    <Button size="sm" onClick={() => handleSelect(1)} disabled={selectedDesign === 1}>Select</Button>
                </div>
                <StandardCardGrid />
            </section>

            {/* #2 Horizontal List (Detailed) */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">#2. Horizontal Detail List</h3>
                    <Button size="sm" onClick={() => handleSelect(2)} disabled={selectedDesign === 2}>Select</Button>
                </div>
                <HorizontalDetailList />
            </section>

            {/* #3 Instagram Discovery */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">#3. Visual Discovery (Instagram-like)</h3>
                    <Button size="sm" onClick={() => handleSelect(3)} disabled={selectedDesign === 3}>Select</Button>
                </div>
                <VisualDiscovery />
            </section>

            {/* #4 - #10 Placeholders */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-muted border-dashed">
                    <h3 className="font-bold">#4. Tinder Swipe Card</h3>
                    <p className="text-xs text-muted-foreground mt-1">Mobile-first swipe interactions</p>
                    <Button variant="link" size="sm" className="px-0" onClick={() => handleSelect(4)}>Select</Button>
                </Card>
                <Card className="p-4">
                    <h3 className="font-bold">#5. Map Based View</h3>
                    <p className="text-xs text-muted-foreground mt-1">For local visits (Restaurants, Hotspots)</p>
                    <Button variant="link" size="sm" className="px-0" onClick={() => handleSelect(5)}>Select</Button>
                </Card>
                <Card className="p-4 bg-black text-white">
                    <h3 className="font-bold">#6. Dark Premium</h3>
                    <p className="text-xs text-gray-400 mt-1">High-end luxury campaigns</p>
                    <Button variant="link" size="sm" className="px-0 text-white" onClick={() => handleSelect(6)}>Select</Button>
                </Card>
                <Card className="p-4 border-l-4 border-pink-500">
                    <h3 className="font-bold">#7. Story Format</h3>
                    <p className="text-xs text-muted-foreground mt-1">Vertical video previews</p>
                    <Button variant="link" size="sm" className="px-0" onClick={() => handleSelect(7)}>Select</Button>
                </Card>

            </div>
        </div>
    )
}

function StandardCardGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_CAMPAIGNS.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="relative h-40">
                        <img src={item.image} className="w-full h-full object-cover" />
                        <Badge className="absolute top-2 left-2">{item.type}</Badge>
                        <Badge variant="secondary" className="absolute top-2 right-2">{item.deadline}</Badge>
                    </div>
                    <CardHeader className="p-4 pb-2">
                        <div className="text-xs text-muted-foreground mb-1">{item.brand}</div>
                        <CardTitle className="text-base line-clamp-1">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 py-2">
                        <div className="bg-gray-50 p-2 rounded text-xs font-medium text-gray-700 flex items-center gap-2">
                            <Gift className="h-3 w-3 text-primary" /> {item.reward}
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-2 flex justify-between items-center">
                        <div className="text-xs text-gray-400">{item.platform} Only</div>
                        <Button size="sm" variant="outline" className="h-8">지원하기</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

function HorizontalDetailList() {
    return (
        <div className="space-y-3">
            {MOCK_CAMPAIGNS.map((item) => (
                <Card key={item.id} className="flex overflow-hidden h-32 hover:border-black transition-colors cursor-pointer group">
                    <div className="w-32 md:w-48 relative shrink-0">
                        <img src={item.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between">
                                <Badge variant="outline" className="text-[10px] mb-1">{item.brand}</Badge>
                                <span className="text-xs font-bold text-red-500">{item.deadline}</span>
                            </div>
                            <h4 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">{item.title}</h4>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                            <div className="text-sm font-medium text-gray-600">
                                🎁 {item.reward}
                            </div>
                            <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Apply</Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

function VisualDiscovery() {
    return (
        <div className="grid grid-cols-3 gap-1">
            {MOCK_CAMPAIGNS.map((item) => (
                <div key={item.id} className="aspect-square relative group cursor-pointer">
                    <img src={item.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
                        <div className="font-bold text-sm mb-1">{item.brand}</div>
                        <div className="text-xs line-clamp-2">{item.title}</div>
                        <Badge className="mt-2 bg-white/20 hover:bg-white/30">{item.reward.split('+')[0]}</Badge>
                    </div>
                    {item.deadline === 'Today' && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />}
                </div>
            ))}
        </div>
    )
}
