"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { Progress } from "@/components/ui/progress"
import {
    Users, MoreHorizontal, ArrowRight, Package, Briefcase
} from "lucide-react"

// --- Mock Data ---
// --- Mock Data (Realistic Korean Content) ---
const MOCK_CAMPAIGNS = [
    {
        id: "c1",
        title: "2024 S/S 썸머 컬렉션 룩북 챌린지",
        description: "이번 여름 시즌 주력 상품인 린넨 셔츠와 와이드 팬츠를 활용한 데일리룩 코디 챌린지입니다. 2030 남녀 타겟.",
        status: "진행중",
        deadline: "2024-06-30",
        budget: "5,000,000",
        applicants: 124,
        approved: 30,
        platform: "Instagram",
        product: "썸머 린넨 셋업",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
    },
    {
        id: "c2",
        title: "유기농 비건 스킨케어 '퓨어' 브랜드 인지도 확산",
        description: "새로 런칭한 비건 스킨케어 라인의 순한 성분과 진정 효과를 강조하는 유튜브 쇼츠/릴스 체험단 모집.",
        status: "모집중",
        deadline: "2024-05-20",
        budget: "3,000,000",
        applicants: 45,
        approved: 0,
        platform: "YouTube",
        product: "퓨어 카밍 토너&로션",
        image: "https://images.unsplash.com/photo-1556228578-8d8448ad114f?w=800&q=80"
    },
    {
        id: "c3",
        title: "신형 노이즈캔슬링 헤드폰 '사운드맥스' 언박싱",
        description: "강력한 노이즈캔슬링 기능과 프리미엄 디자인을 소구하는 테크 유튜버 대상 리뷰 캠페인.",
        status: "완료됨",
        deadline: "2024-04-10",
        budget: "10,000,000",
        applicants: 8,
        approved: 8,
        platform: "YouTube",
        product: "사운드맥스 Pro",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
    },
    {
        id: "c4",
        title: "반려견 관절 영양제 '멍튼튼' 2주 체험기",
        description: "노령견을 키우는 견주 분들을 대상으로 한 관절 영양제 실제 급여 후기 및 변화 관찰.",
        status: "모집중",
        deadline: "2024-05-25",
        budget: "2,000,000",
        applicants: 82,
        approved: 5,
        platform: "Blog",
        product: "멍튼튼 조인트 케어",
        image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80"
    }
]

export default function CampaignCardsDesignLab() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        switch (selectedDesign) {
            case 1: return <StandardDashboardStyle />;
            case 2: return <ImageFocusStyle />;
            case 3: return <MinimalListStyle />;
            case 4: return <KanbanStyle />;
            case 5: return <NeumorphismStyle />;
            case 6: return <GlassmorphismStyle />;
            default: return <StandardDashboardStyle />;
        }
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Custom Header (Matches User Request) */}
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">내 캠페인 관리</h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                            등록하신 캠페인 공고를 관리하고 지원자를 확인하세요.
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center border-b">
                    <div className="flex gap-8">
                        <div className="pb-3 border-b-2 border-black font-bold text-sm cursor-pointer">진행중인 캠페인 (0)</div>
                        <div className="pb-3 text-gray-500 font-medium text-sm cursor-pointer hover:text-gray-900">마감/종료된 캠페인 (0)</div>
                    </div>
                    {/* The screenshot shows a black button on the right */}
                    <div className="pb-2">
                        <Button className="bg-black hover:bg-gray-800 text-white gap-2 h-9 px-4 text-xs">
                            <span>+</span> 새 캠페인 등록
                        </Button>
                    </div>
                </div>
            </div>

            {/* PREVIEW AREA (Selected Design) */}
            <div className="bg-gray-50/50 p-6 rounded-xl border-dashed border-2 border-gray-200">
                <div className="flex justify-between items-center mb-6">
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

            {/* #1 Standard Dashboard Card (Current) */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">#1. Standard Dashboard (Current)</h3>
                    <Button size="sm" onClick={() => handleSelect(1)} disabled={selectedDesign === 1}>Select</Button>
                </div>
                <StandardDashboardStyle />
            </section>

            {/* #2 Image Focus (Visual) */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">#2. Image Focus (Visual Appeal)</h3>
                    <Button size="sm" onClick={() => handleSelect(2)} disabled={selectedDesign === 2}>Select</Button>
                </div>
                <ImageFocusStyle />
            </section>

            {/* #3 Minimal List Row */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">#3. Minimal List Row (Data Density)</h3>
                    <Button size="sm" onClick={() => handleSelect(3)} disabled={selectedDesign === 3}>Select</Button>
                </div>
                <MinimalListStyle />
            </section>

            {/* #4 Kanban Card */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">#4. Kanban Card (Status Focused)</h3>
                    <Button size="sm" onClick={() => handleSelect(4)} disabled={selectedDesign === 4}>Select</Button>
                </div>
                <KanbanStyle />
            </section>

            {/* #5 Neumorphism */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">#5. Neumorphism Soft UI</h3>
                    <Button size="sm" onClick={() => handleSelect(5)} disabled={selectedDesign === 5}>Select</Button>
                </div>
                <NeumorphismStyle />
            </section>

            {/* #6 Glassmorphism Gradient */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">#6. Glassmorphism Gradient</h3>
                    <Button size="sm" onClick={() => handleSelect(6)} disabled={selectedDesign === 6}>Select</Button>
                </div>
                <GlassmorphismStyle />
            </section>

            {/* #7 - #10 Placeholder Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 border-l-4 border-l-blue-500">
                    <h3 className="font-bold">#7. Timeline View</h3>
                    <p className="text-xs text-muted-foreground mt-1">Gantt Chart Style for scheduling</p>
                    <Button variant="link" size="sm" className="px-0" onClick={() => handleSelect(7)}>Select</Button>
                </Card>
                <Card className="p-4 border-b-4 border-b-green-500">
                    <h3 className="font-bold">#8. Statistic Heavy</h3>
                    <p className="text-xs text-muted-foreground mt-1">Focus on ROAS/ROI Metrics</p>
                    <Button variant="link" size="sm" className="px-0" onClick={() => handleSelect(8)}>Select</Button>
                </Card>
                <Card className="p-4 bg-gray-900 text-white">
                    <h3 className="font-bold">#9. Dark Mode Command</h3>
                    <p className="text-xs text-gray-400 mt-1">Terminal / Developer aesthetic</p>
                    <Button variant="link" size="sm" className="px-0 text-white" onClick={() => handleSelect(9)}>Select</Button>
                </Card>
                <Card className="p-4 font-serif bg-[#fdfbf7]">
                    <h3 className="font-bold">#10. Editorial Clean</h3>
                    <p className="text-xs text-muted-foreground mt-1">Magazine layout style</p>
                    <Button variant="link" size="sm" className="px-0" onClick={() => handleSelect(10)}>Select</Button>
                </Card>
            </div>
        </div>
    )
}

function StandardDashboardStyle() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_CAMPAIGNS.map((campaign, i) => (
                <Card key={i} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <Badge variant={campaign.status === 'active' ? 'default' : campaign.status === 'recruiting' ? 'secondary' : 'outline'}>
                                {campaign.status}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>
                        <CardTitle className="line-clamp-1 mt-2">{campaign.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Deadline</span>
                                <span className="font-medium">{campaign.deadline}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Applicants</span>
                                <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" /> {campaign.applicants}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Progress</span>
                                    <span>{Math.round((campaign.approved / (campaign.applicants || 1)) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${(campaign.approved / (campaign.applicants || 1)) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                        <Button className="w-full" variant="outline">Manage</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

function ImageFocusStyle() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_CAMPAIGNS.map((campaign, i) => (
                <div key={i} className="group relative rounded-xl overflow-hidden h-64 bg-black">
                    <img src={campaign.image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <div className="text-xs font-bold uppercase tracking-wider mb-2 text-primary-foreground/80">{campaign.platform}</div>
                            <h3 className="text-xl font-bold mb-2 leading-tight">{campaign.title}</h3>
                            <div className="h-0 group-hover:h-auto overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <p className="text-sm text-gray-200 line-clamp-2 mb-4">{campaign.description}</p>
                                <Button size="sm" variant="secondary" className="w-full">View Details</Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function MinimalListStyle() {
    return (
        <div className="space-y-2">
            {MOCK_CAMPAIGNS.map((campaign, i) => (
                <div key={i} className="flex items-center p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 rounded bg-gray-100 mr-4 overflow-hidden shrink-0">
                        <img src={campaign.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 mr-4">
                        <div className="font-semibold truncate">{campaign.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{campaign.platform}</Badge>
                            <span>{campaign.deadline}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600 mr-4 hidden md:flex">
                        <div className="flex flex-col items-center w-20">
                            <span className="text-xs text-muted-foreground">Budget</span>
                            <span className="font-medium">₩{(parseInt(campaign.budget.replace(/,/g, '')) / 10000)}만</span>
                        </div>
                        <div className="flex flex-col items-center w-16">
                            <span className="text-xs text-muted-foreground">Apply</span>
                            <span className="font-medium">{campaign.applicants}</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon"><ArrowRight className="h-4 w-4" /></Button>
                </div>
            ))}
        </div>
    )
}

function KanbanStyle() {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {MOCK_CAMPAIGNS.map((campaign, i) => (
                <div key={i} className="w-72 bg-white border rounded-lg shadow-sm shrink-0 flex flex-col p-4 border-l-4 border-l-primary">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{campaign.status}</span>
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{campaign.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <Package className="h-3 w-3" /> {campaign.product}
                    </div>

                    <div className="mt-auto">
                        <div className="text-xs flex justify-between mb-1 text-gray-500">
                            <span>Progress</span>
                            <span>{campaign.approved} / 10</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: '40%' }}></div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <div className="flex -space-x-2 overflow-hidden">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-300" />
                                ))}
                                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px] font-bold">+{campaign.applicants}</div>
                            </div>
                            <div className="text-xs text-gray-400">{campaign.deadline}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function NeumorphismStyle() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4 bg-gray-100 rounded-xl">
            {MOCK_CAMPAIGNS.map((campaign, i) => (
                <div key={i} className="rounded-2xl bg-[#f0f0f3] p-6 shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-full bg-[#f0f0f3] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] flex items-center justify-center text-primary">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="text-xs font-bold text-gray-500">{campaign.platform}</div>
                    </div>
                    <h3 className="font-bold text-gray-700 mb-2">{campaign.title}</h3>
                    <p className="text-xs text-gray-500 mb-6">{campaign.product}</p>

                    <Button className="w-full rounded-xl bg-[#f0f0f3] text-primary font-bold shadow-[6px_6px_10px_rgb(163,177,198,0.6),-6px_-6px_10px_rgba(255,255,255,0.5)] hover:shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border-0 transition-all">
                        Manage Campaign
                    </Button>
                </div>
            ))}
        </div>
    )
}

function GlassmorphismStyle() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_CAMPAIGNS.slice(0, 2).map((campaign, i) => (
                <div key={i} className={`relative overflow-hidden rounded-2xl p-6 h-48 flex flex-col justify-between ${i % 2 === 0 ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-pink-500 to-rose-500'}`}>
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-sm" />
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />

                    <div className="relative z-10">
                        <div className="flex justify-between text-white/80 text-sm mb-2">
                            <span>{campaign.platform}</span>
                            <span>{campaign.deadline}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{campaign.title}</h3>
                        <p className="text-white/70 text-sm">{campaign.product}</p>
                    </div>

                    <div className="relative z-10 flex justify-between items-end">
                        <div className="flex -space-x-2">
                            <div className="h-8 w-8 rounded-full bg-white/30 border border-white/50" />
                            <div className="h-8 w-8 rounded-full bg-white/30 border border-white/50" />
                            <div className="h-8 w-8 rounded-full bg-white/30 border border-white/50 flex items-center justify-center text-xs text-white font-bold">+{campaign.applicants}</div>
                        </div>
                        <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                            Details
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
