"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Calendar, Heart, MessageCircle, Share2, MoreVertical,
    MapPin, ArrowRight, Star, Bookmark, Send, Eye,
    TrendingUp, ExternalLink, Play
} from "lucide-react"

// --- Mock Data (Realistic Rich Data) ---
const MOCK_MOMENTS = [
    {
        id: 1,
        creator: "여행하는 소니",
        creatorImg: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
        handle: "@sony_travel",
        image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80",
        title: "도쿄 시부야 스카이 야경 명소 총정리 🇯🇵",
        description: "시부야 스카이에서 바라본 도쿄의 야경은 정말 환상적이었어요! 예약 꿀팁부터 포토존까지 모두 정리해봤습니다.",
        category: "여행/맛집",
        stats: { views: "12.5k", likes: "892", engagement: "5.2%" },
        platform: "Instagram",
        price: "300,000",
        tags: ["일본여행", "도쿄맛집", "여행크리에이터"],
        date: "2024.02.10",
        status: "Live",
        followers: "120K"
    },
    {
        id: 2,
        creator: "테크몽키",
        creatorImg: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
        handle: "@tech_monkey",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800&q=80",
        title: "맥북 에어 M3 실사용 솔직 후기 (장단점 분석)",
        description: "M3 칩셋의 성능은 과연 얼마나 좋아졌을까요? 2주간 직접 사용해보며 느낀 장단점을 가감없이 풀어봅니다.",
        category: "IT/테크",
        stats: { views: "45.1k", likes: "1.2k", engagement: "3.8%" },
        platform: "YouTube",
        price: "800,000",
        tags: ["테크리뷰", "맥북", "전자기기"],
        date: "2024.02.12",
        status: "Live",
        followers: "450K"
    },
    {
        id: 3,
        creator: "뷰티 으나",
        creatorImg: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
        handle: "@una_beauty",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80",
        title: "올리브영 세일 추천템! 기초 스킨케어 편",
        description: "이번 올영세일에서 꼭 쟁여야 할 기초템 5가지를 소개합니다. 민감성 피부라면 필독!",
        category: "뷰티/패션",
        stats: { views: "8.2k", likes: "450", engagement: "6.5%" },
        platform: "Instagram",
        price: "250,000",
        tags: ["뷰티", "스킨케어", "올영세일"],
        date: "2024.02.08",
        status: "Live",
        followers: "85K"
    },
    {
        id: 4,
        creator: "홈쿠킹 대디",
        creatorImg: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
        handle: "@home_cook_daddy",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
        title: "집에서 만드는 5성급 호텔 파스타 레시피",
        description: "냉장고에 있는 재료로 만드는 초간단 알리오 올리오! 주말 점심 메뉴로 강력 추천합니다.",
        category: "푸드/요리",
        stats: { views: "220k", likes: "15k", engagement: "8.1%" },
        platform: "YouTube",
        price: "1,200,000",
        tags: ["요리", "레시피", "집밥"],
        date: "2024.01.25",
        status: "Hot",
        followers: "890K"
    },
    {
        id: 5,
        creator: "Daily Jenny",
        creatorImg: "https://images.unsplash.com/photo-1554151228-14d9def656ec?w=150&q=80",
        handle: "@daily_jenny",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
        title: "성수동 팝업스토어 데이트 코스 5곳 추천",
        description: "요즘 성수동에서 가장 핫한 팝업스토어 5곳을 다녀왔어요. 웨이팅 꿀팁부터 필수 포토존까지!",
        category: "라이프스타일",
        stats: { views: "15.3k", likes: "920", engagement: "5.8%" },
        platform: "Blog",
        price: "150,000",
        tags: ["성수동", "데이트코스", "핫플"],
        date: "2024.02.15",
        status: "New",
        followers: "42K"
    },
    {
        id: 6,
        creator: "핏블리 (Fitness)",
        creatorImg: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80",
        handle: "@fit_vely",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
        title: "하루 10분! 집에서 하는 전신 유산소 운동",
        description: "층간소음 걱정 없이 칼로리 태우는 홈트 루틴! 따라만 해도 땀이 비오듯 쏟아집니다.",
        category: "헬스/운동",
        stats: { views: "340k", likes: "21k", engagement: "7.2%" },
        platform: "YouTube",
        price: "1,500,000",
        tags: ["홈트", "운동", "다이어트"],
        date: "2024.01.10",
        status: "Hot",
        followers: "1.2M"
    }
]

export default function MomentCardsDesignLab() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        switch (selectedDesign) {
            case 1: return <InstagramStyle />;
            case 2: return <TicketStyle />;
            case 3: return <MasonryStyle />;
            case 4: return <DetailedHorizontalStyle />;
            case 5: return <StoryHighlightsStyle />;
            case 6: return <TypographyFocusStyle />;
            case 7: return <GlassmorphismStyle />;
            case 8: return <NeumorphismStyle />;
            case 9: return <DarkNeonStyle />;
            case 10: return <RetroPaperStyle />;
            case 11: return <MinimalChipStyle />;
            case 12: return <InteractiveHoverStyle />;
            case 13: return <ThreeDCardStyle />;
            case 14: return <BrutalistStyle />;
            case 15: return <GradientBorderStyle />;
            case 16: return <PolaroidStyle />;
            case 17: return <MagazineCoverStyle />;
            case 18: return <HolographicStyle />;
            case 19: return <BentoGridStyle />;
            case 20: return <SkeuomorphicStyle />;
            default: return <InstagramStyle />;
        }
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header & Filter Section matches user request */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">모먼트 검색</h2>
                    <p className="text-muted-foreground mt-1">
                        우리 브랜드와 딱 맞는 모먼트를 가진 크리에이터를 찾아보세요.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                    {/* Filters omitted for brevity in preview but implied functionality */}
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="default" className="bg-black text-white">전체</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">뷰티/패션</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">여행/맛집</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">테크/IT</Badge>
                    </div>
                </div>
            </div>

            {/* PREVIEW AREA */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Badge variant={selectedDesign ? "default" : "outline"} className={!selectedDesign ? "bg-green-50 text-green-700 border-green-200" : ""}>
                            {selectedDesign ? `Selected Design #${selectedDesign}` : "Default (Instagram Style)"}
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
            <h3 className="font-bold text-xl mb-6">All 20 Design Variations</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                            <h4 className="font-semibold text-sm text-muted-foreground">Style #{i + 1}</h4>
                            <Button size="sm" variant="ghost" onClick={() => handleSelect(i + 1)}>Preview</Button>
                        </div>
                        <div className="border rounded-xl p-4 bg-gray-50/50">
                            {(() => {
                                switch (i + 1) {
                                    case 1: return <InstagramStyle />;
                                    case 2: return <TicketStyle />;
                                    case 3: return <MasonryStyle />;
                                    case 4: return <DetailedHorizontalStyle />;
                                    case 5: return <StoryHighlightsStyle />;
                                    case 6: return <TypographyFocusStyle />;
                                    case 7: return <GlassmorphismStyle />;
                                    case 8: return <NeumorphismStyle />;
                                    case 9: return <DarkNeonStyle />;
                                    case 10: return <RetroPaperStyle />;
                                    case 11: return <MinimalChipStyle />;
                                    case 12: return <InteractiveHoverStyle />;
                                    case 13: return <ThreeDCardStyle />;
                                    case 14: return <BrutalistStyle />;
                                    case 15: return <GradientBorderStyle />;
                                    case 16: return <PolaroidStyle />;
                                    case 17: return <MagazineCoverStyle />;
                                    case 18: return <HolographicStyle />;
                                    case 19: return <BentoGridStyle />;
                                    case 20: return <SkeuomorphicStyle />;
                                    default: return null;
                                }
                            })()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 1. Instagram Style
function InstagramStyle() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_MOMENTS.slice(0, 2).map((m, i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="p-3 flex-row items-center gap-3 space-y-0">
                        <Avatar className="h-8 w-8"><AvatarImage src={m.creatorImg} /><AvatarFallback>{m.creator[0]}</AvatarFallback></Avatar>
                        <div className="flex-1">
                            <div className="font-semibold text-sm">{m.handle}</div>
                            <div className="text-xs text-muted-foreground">{m.category}</div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                    </CardHeader>
                    <div className="aspect-square bg-gray-100 relative">
                        <img src={m.image} className="object-cover w-full h-full" />
                    </div>
                    <CardContent className="p-3">
                        <div className="flex gap-4 mb-3">
                            <Heart className="h-6 w-6" /><MessageCircle className="h-6 w-6" /><Share2 className="h-6 w-6 ml-auto" />
                        </div>
                        <div className="font-bold text-sm mb-1">{m.followers} followers</div>
                        <div className="text-sm mb-2"><span className="font-semibold mr-2">{m.creator}</span>{m.title}</div>
                        <div className="text-xs text-muted-foreground uppercase">{m.date}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

// 2. Ticket Style
function TicketStyle() {
    return (
        <div className="space-y-4">
            {MOCK_MOMENTS.slice(0, 2).map((m, i) => (
                <div key={i} className="flex bg-white rounded-lg shadow-sm border overflow-hidden h-40 group hover:shadow-md transition-shadow">
                    <div className="w-40 relative hidden sm:block">
                        <img src={m.image} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute bottom-3 left-3 text-white font-bold text-lg drop-shadow-md">Live</div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col dashed-l border-l-2 border-dashed border-gray-200 relative">
                        <div className="flex justify-between items-start mb-1">
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">{m.category}</Badge>
                            <span className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> {m.date}</span>
                        </div>
                        <h4 className="font-bold text-lg mb-1 line-clamp-1">{m.title}</h4>
                        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-dashed">
                            <Avatar className="h-6 w-6"><AvatarImage src={m.creatorImg} /></Avatar>
                            <span className="text-sm font-medium">{m.creator}</span>
                            <Button className="ml-auto h-8 text-xs" size="sm">제안하기</Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 3. Masonry Style
function MasonryStyle() {
    return (
        <div className="columns-2 gap-4 space-y-4">
            {MOCK_MOMENTS.slice(0, 4).map((m, i) => (
                <div key={i} className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer">
                    <img src={m.image} className="w-full object-cover" style={{ height: i % 2 === 0 ? '240px' : '180px' }} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                        <h3 className="font-bold text-sm">{m.title}</h3>
                        <p className="text-xs opacity-80">{m.creator}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 4. Detailed Horizontal
function DetailedHorizontalStyle() {
    return (
        <div className="space-y-4">
            {MOCK_MOMENTS.slice(0, 2).map((m, i) => (
                <Card key={i} className="p-4 hover:border-black transition-colors flex gap-4">
                    <img src={m.image} className="w-32 h-24 object-cover rounded-lg bg-gray-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-lg truncate">{m.title}</h3>
                            <div className="text-right"><div className="font-bold">{m.stats.views}</div><div className="text-xs text-gray-400">Views</div></div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1 mb-2">{m.description}</p>
                        <div className="flex gap-2">
                            {m.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px] font-normal">#{t}</Badge>)}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

// 5. Story Highlights
function StoryHighlightsStyle() {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {MOCK_MOMENTS.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-2 min-w-[90px] cursor-pointer group">
                    <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 to-purple-600 group-hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full border-2 border-white overflow-hidden"><img src={m.image} className="w-full h-full object-cover" /></div>
                    </div>
                    <span className="text-xs font-medium text-center truncate w-full">{m.creator}</span>
                </div>
            ))}
        </div>
    )
}

// 6. Typography Focus
function TypographyFocusStyle() {
    return (
        <div className="grid grid-cols-1 gap-6">
            {MOCK_MOMENTS.slice(0, 1).map((m, i) => (
                <div key={i} className="border-t-4 border-black pt-4 group">
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{m.category}</div>
                    <h3 className="text-3xl font-serif font-bold leading-tight mb-4 group-hover:underline">{m.title}</h3>
                    <div className="flex gap-4">
                        <div className="w-32 h-32 bg-gray-100 shrink-0"><img src={m.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" /></div>
                        <div className="text-sm text-gray-600 leading-relaxed font-serif">{m.description}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 7. Glassmorphism
function GlassmorphismStyle() {
    return (
        <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-6 rounded-2xl">
            {MOCK_MOMENTS.slice(0, 2).map((m, i) => (
                <div key={i} className="mb-4 backdrop-blur-md bg-white/20 border border-white/30 rounded-xl p-4 text-white hover:bg-white/30 transition-colors flex gap-4">
                    <img src={m.creatorImg} className="w-12 h-12 rounded-full border-2 border-white/50" />
                    <div>
                        <div className="font-bold">{m.creator}</div>
                        <div className="text-sm opacity-90">{m.title}</div>
                        <div className="text-xs mt-2 bg-white/20 w-fit px-2 py-1 rounded">{m.platform}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 8. Neumorphism
function NeumorphismStyle() {
    return (
        <div className="bg-[#e0e5ec] p-6 rounded-xl flex flex-col gap-6">
            {MOCK_MOMENTS.slice(0, 2).map((m, i) => (
                <div key={i} className="rounded-2xl p-4 bg-[#e0e5ec]" style={{ boxShadow: "9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)" }}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-500">{m.category}</span>
                        <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.8)]"></div>
                    </div>
                    <h3 className="font-bold text-gray-700 mb-2">{m.title}</h3>
                    <Button className="w-full shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] bg-[#e0e5ec] text-gray-600 hover:bg-gray-100 border-0 h-8 text-xs">View Details</Button>
                </div>
            ))}
        </div>
    )
}

// 9. Dark Neon (Cyberpunk)
function DarkNeonStyle() {
    return (
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            {MOCK_MOMENTS.slice(0, 2).map((m, i) => (
                <div key={i} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-400 group mb-4 transition-colors relative">
                    <div className="absolute top-2 right-2 bg-black/60 text-cyan-400 text-[10px] px-2 py-0.5 rounded border border-cyan-400/30 font-mono">{m.platform}</div>
                    <div className="p-4">
                        <h3 className="text-white font-bold mb-1 group-hover:text-cyan-400 transition-colors truncate">{m.title}</h3>
                        <p className="text-gray-400 text-xs font-mono">{m.creator} // {m.stats.views} VIEWS</p>
                    </div>
                    <div className="h-1 w-full bg-gray-700"><div className="h-full bg-cyan-400 w-[60%]"></div></div>
                </div>
            ))}
        </div>
    )
}

// 10. Retro Paper
function RetroPaperStyle() {
    return (
        <div className="bg-[#f4f1ea] p-6 rounded-sm border border-stone-300 shadow-sm">
            {MOCK_MOMENTS.slice(0, 2).map((m, i) => (
                <div key={i} className="mb-6 border-b border-stone-300 pb-4 last:border-0 last:pb-0">
                    <div className="font-serif text-3xl text-stone-300 absolute -translate-x-4">“</div>
                    <h3 className="font-serif font-bold text-stone-800 text-lg relative z-10 pl-4">{m.title}</h3>
                    <div className="text-xs text-stone-500 font-serif italic mt-1 text-right">— {m.creator}, {m.date}</div>
                </div>
            ))}
        </div>
    )
}

// 11. Minimal Chip
function MinimalChipStyle() {
    return (
        <div className="flex flex-wrap gap-3">
            {MOCK_MOMENTS.map((m, i) => (
                <div key={i} className="flex items-center gap-3 pl-1 pr-4 py-1 bg-white border rounded-full hover:shadow-md cursor-pointer transition-shadow">
                    <Avatar className="w-8 h-8"><AvatarImage src={m.creatorImg} /></Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-xs truncate max-w-[100px]">{m.title}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 px-2 border-l">{m.stats.engagement}</span>
                </div>
            ))}
        </div>
    )
}

// 12. Interactive Hover
function InteractiveHoverStyle() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_MOMENTS.slice(0, 2).map((m, i) => (
                <div key={i} className="relative h-48 rounded-xl overflow-hidden group cursor-pointer shadow-lg">
                    <img src={m.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/70 transition-colors" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity p-4 text-center">
                        <div className="font-bold mb-1">{m.creator}</div>
                        <p className="text-xs text-gray-300 line-clamp-2 mb-3">{m.description}</p>
                        <Button variant="secondary" size="sm" className="h-7 text-xs rounded-full">Explore</Button>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white font-bold group-hover:opacity-0 transition-opacity">{m.title}</div>
                </div>
            ))}
        </div>
    )
}

// 13. 3D Card Style
function ThreeDCardStyle() {
    return (
        <div className="perspective-1000 grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {MOCK_MOMENTS.slice(0, 2).map((m, i) => (
                <div key={i} className="bg-white rounded-xl shadow-xl p-4 transform transition-transform hover:-rotate-y-6 hover:rotate-x-6 hover:scale-105 duration-300 border border-t-4 border-t-blue-500">
                    <div className="flex justify-between items-center mb-3">
                        <Badge variant="outline">{m.platform}</Badge>
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{m.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <TrendingUp className="w-4 h-4" /> {m.stats.views} views
                    </div>
                </div>
            ))}
        </div>
    )
}

// 14. Brutalist
function BrutalistStyle() {
    return (
        <div className="space-y-4">
            {MOCK_MOMENTS.slice(0, 2).map((m, i) => (
                <div key={i} className="border-4 border-black bg-yellow-300 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <div className="flex gap-4">
                        <img src={m.image} className="w-24 h-24 object-cover border-2 border-black grayscale" />
                        <div>
                            <h3 className="font-black text-xl uppercase leading-none mb-1">{m.title}</h3>
                            <div className="font-bold bg-black text-white inline-block px-1 text-sm">{m.price}원</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 15. Gradient Border
function GradientBorderStyle() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_MOMENTS.slice(0, 2).map((m, i) => (
                <div key={i} className="rounded-xl p-[2px] bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
                    <div className="bg-white rounded-[10px] p-4 h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 bg-gray-100 rounded-bl-lg text-xs font-bold">{m.status}</div>
                        <div className="flex items-center gap-3 mb-3">
                            <Avatar><AvatarImage src={m.creatorImg} /></Avatar>
                            <div className="font-bold text-sm">{m.creator}</div>
                        </div>
                        <h3 className="font-bold mb-1">{m.title}</h3>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 16. Polaroid
function PolaroidStyle() {
    return (
        <div className="flex flex-wrap justify-center gap-6 bg-stone-100 p-8 rounded-xl">
            {MOCK_MOMENTS.slice(0, 2).map((m, i) => (
                <div key={i} className="bg-white p-3 pb-8 shadow-lg transform rotate-[-2deg] hover:rotate-0 transition-transform w-56">
                    <div className="bg-gray-200 aspect-square mb-3 overflow-hidden grayscale hover:grayscale-0 transition-all">
                        <img src={m.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="font-handwriting text-center font-bold text-lg text-gray-800" style={{ fontFamily: 'cursive' }}>{m.title.substring(0, 15)}...</div>
                    <div className="text-center text-xs text-gray-500 mt-1">{m.date}</div>
                </div>
            ))}
        </div>
    )
}

// 17. Magazine Cover
function MagazineCoverStyle() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_MOMENTS.slice(0, 2).map((m, i) => (
                <div key={i} className="relative aspect-[3/4] overflow-hidden rounded shadow-xl group">
                    <img src={m.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-4 left-0 w-full text-center">
                        <div className="text-5xl font-black text-white/20 tracking-widest uppercase">MOMENT</div>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 inline-block mb-2">EXCLUSIVE</div>
                        <h3 className="font-serif text-2xl font-bold leading-tight mb-2">{m.title}</h3>
                        <p className="text-xs opacity-80 line-clamp-2">{m.description}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 18. Holographic
function HolographicStyle() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_MOMENTS.slice(0, 2).map((m, i) => (
                <div key={i} className="rounded-xl p-6 bg-gradient-to-tr from-blue-300 via-purple-300 to-pink-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
                    <div className="relative z-10">
                        <div className="flex justify-between text-slate-700 mb-4">
                            <span className="font-bold text-xs tracking-wider">CREADY PICK</span>
                            <span className="font-mono text-xs">NO. {m.id}492</span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-xl mb-4 group-hover:translate-x-1 transition-transform">{m.title}</h3>
                        <div className="w-full h-32 rounded-lg bg-white/50 overflow-hidden mb-4">
                            <img src={m.image} className="w-full h-full object-cover opacity-80 mix-blend-multiply" />
                        </div>
                        <Button className="w-full bg-slate-800 text-white hover:bg-slate-700">Connect</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 19. Bento Grid
function BentoGridStyle() {
    // Uses first moment only for demo
    const m = MOCK_MOMENTS[0];
    return (
        <div className="grid grid-cols-3 grid-rows-2 gap-3 h-64">
            <div className="col-span-2 row-span-2 rounded-xl overflow-hidden relative group">
                <img src={m.image} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/80 to-transparent w-full text-white">
                    <h3 className="font-bold">{m.title}</h3>
                </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-3 flex flex-col justify-center items-center text-center">
                <div className="font-bold text-xl">{m.stats.views}</div>
                <div className="text-xs text-gray-500">Views</div>
            </div>
            <div className="bg-black text-white rounded-xl p-3 flex flex-col justify-center items-center">
                <div className="font-bold text-lg">{m.platform}</div>
            </div>
        </div>
    )
}

// 20. Skeuomorphic
function SkeuomorphicStyle() {
    return (
        <div className="bg-stone-200 p-6 rounded-xl flex flex-col gap-6">
            {MOCK_MOMENTS.slice(0, 2).map((m, i) => (
                <div key={i} className="bg-stone-100 p-4 rounded-lg border-b-4 border-r-4 border-stone-300 active:border-0 active:translate-y-1 transition-all cursor-pointer">
                    <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-full border-4 border-stone-200 shadow-inner overflow-hidden">
                            <img src={m.creatorImg} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="font-bold text-stone-700 text-lg shadow-white drop-shadow-sm">{m.title}</h3>
                            <div className="text-stone-500 text-sm inset-shadow font-medium">{m.creator}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
