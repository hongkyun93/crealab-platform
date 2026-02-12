"use client"

import React, { useState } from 'react'
import { MomentCard } from "@/components/creator/MomentCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Calendar, Heart, MessageCircle, Share2, MoreVertical,
    MapPin,
    ArrowRight
} from "lucide-react"

// --- Mock Data ---
const MOCK_MOMENTS = [
    {
        id: "m1",
        title: "여름 휴가 브이로그 협찬",
        description: "7월 말 제주도 여행 예정입니다. 여행용품, 수영복, 선케어 제품 협찬 환영합니다!",
        status: "active",
        eventDate: "2024-07-25",
        category: "여행",
        handle: "travel_addict",
        influencerName: "김여행",
        followers: "150,000",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        avatar: "https://i.pravatar.cc/150?u=travel",
        tags: ["여행", "제주도", "여름휴가"]
    },
    {
        id: "m2",
        title: "홈카페 감성 인테리어",
        description: "새로 이사한 집에서 홈카페 존을 꾸미고 있어요. 커피머신, 예쁜 컵, 인테리어 소품 찾습니다.",
        status: "active",
        eventDate: "2024-06-15",
        category: "리빙",
        handle: "home_sweet_home",
        influencerName: "이집순",
        followers: "45,000",
        image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80",
        avatar: "https://i.pravatar.cc/150?u=home",
        tags: ["리빙", "홈카페", "인테리어"]
    },
    {
        id: "m3",
        title: "데일리 오피스룩 코디",
        description: "직장인 출근룩 콘텐츠 기획 중입니다. 블라우스, 슬랙스, 가방 등 협찬 부탁드려요.",
        status: "active",
        eventDate: "2024-06-20",
        category: "패션",
        handle: "daily_look_pro",
        influencerName: "박패션",
        followers: "82,000",
        image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80",
        avatar: "https://i.pravatar.cc/150?u=fashion",
        tags: ["패션", "OOTD", "오피스룩"]
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
            case 9: return <CyberpunkStyle />;
            case 10: return <RetroPaperStyle />;
            default: return <DefaultStyle />;
        }
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header & Filter Section (Matches User Request) */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">모먼트 검색</h2>
                    <p className="text-muted-foreground mt-1">
                        우리 브랜드와 딱 맞는 모먼트를 가진 크리에이터를 찾아보세요.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                    {/* Follower Scale */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold min-w-[80px]">팔로워 규모</span>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="default" className="bg-black text-white hover:bg-black/90">전체</Badge>
                            <Badge variant="outline" className="text-gray-500 hover:bg-gray-50 cursor-pointer font-normal">나노 (&lt;1만)</Badge>
                            <Badge variant="outline" className="text-gray-500 hover:bg-gray-50 cursor-pointer font-normal">마이크로 (1~10만)</Badge>
                            <Badge variant="outline" className="text-gray-500 hover:bg-gray-50 cursor-pointer font-normal">그로잉 (10~30만)</Badge>
                            <Badge variant="outline" className="text-gray-500 hover:bg-gray-50 cursor-pointer font-normal">미드 (30~50만)</Badge>
                            <Badge variant="outline" className="text-gray-500 hover:bg-gray-50 cursor-pointer font-normal">매크로 (50~100만)</Badge>
                            <Badge variant="outline" className="text-gray-500 hover:bg-gray-50 cursor-pointer font-normal">메가 (&gt;100만)</Badge>
                        </div>
                    </div>

                    {/* Moment Status */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold min-w-[80px]">모먼트 상태</span>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="bg-gray-100 px-3 py-1.5 rounded-md font-bold text-gray-900 cursor-pointer">전체보기</div>
                            <div className="px-3 py-1.5 text-gray-500 cursor-pointer hover:text-gray-900">나의 모먼트</div>
                            <div className="px-3 py-1.5 text-gray-500 cursor-pointer hover:text-gray-900">완료된 모먼트</div>
                            <div className="px-3 py-1.5 text-gray-500 cursor-pointer hover:text-gray-900 flex items-center gap-1">
                                <span className="text-yellow-400">☆</span> 즐겨찾기만 보기
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Price Range */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold min-w-[80px]">영상 단가</span>
                        <div className="flex flex-wrap gap-6 text-sm">
                            <span className="bg-gray-100 px-3 py-1 rounded font-bold text-gray-900">전체</span>
                            <span className="text-gray-600 cursor-pointer hover:text-gray-900">10만원 이하</span>
                            <span className="text-gray-600 cursor-pointer hover:text-gray-900">10만원 ~ 30만원</span>
                            <span className="text-gray-600 cursor-pointer hover:text-gray-900">30만원 ~ 50만원</span>
                            <span className="text-gray-600 cursor-pointer hover:text-gray-900">50만원 ~ 100만원</span>
                            <span className="text-gray-600 cursor-pointer hover:text-gray-900">100만원 ~ 300만원</span>
                            <span className="text-gray-600 cursor-pointer hover:text-gray-900">300만원 이상</span>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-4">
                            <span className="text-sm font-bold min-w-[80px] pt-1">전문 분야</span>
                            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                                <span className="bg-gray-100 px-3 py-1 rounded font-bold text-gray-900 h-fit">전체</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">✈️ 여행</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">💄 뷰티</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">👗 패션</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">🍽️ 맛집</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">🏡 리빙/인테리어</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">💍 웨딩/결혼</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">🏋️ 헬스/운동</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">🥗 다이어트</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">👶 육아</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">🐶 반려동물</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">💻 테크/IT</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">🎮 게임</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">📚 도서/자기계발</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">🎨 취미/DIY</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">🎓 교육/강의</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">🎬 영화/문화</span>
                                <span className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-900">💰 재테크</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PREVIEW AREA (Selected Design) */}
            <div className="space-y-4">
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

            {/* Variation List for Selection */}
            <div className="space-y-12">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg">#1. Instagram Feed Style</h4>
                        <Button size="sm" onClick={() => handleSelect(1)} disabled={selectedDesign === 1}>Select</Button>
                    </div>
                    <InstagramStyle />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg">#2. Event Ticket Style</h4>
                        <Button size="sm" onClick={() => handleSelect(2)} disabled={selectedDesign === 2}>Select</Button>
                    </div>
                    <TicketStyle />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg">#3. Minimalist Photo Focus</h4>
                        <Button size="sm" onClick={() => handleSelect(3)} disabled={selectedDesign === 3}>Select</Button>
                    </div>
                    <MasonryStyle />
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg">#4. Detailed Horizontal (Info-Rich)</h4>
                        <Button size="sm" onClick={() => handleSelect(4)} disabled={selectedDesign === 4}>Select</Button>
                    </div>
                    <DetailedHorizontalStyle />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg">#5. Story Highlights Style</h4>
                        <Button size="sm" onClick={() => handleSelect(5)} disabled={selectedDesign === 5}>Select</Button>
                    </div>
                    <StoryHighlightsStyle />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold">#6. Typography Focus</h4>
                            <Button size="sm" variant="outline" onClick={() => handleSelect(6)} disabled={selectedDesign === 6}>Select</Button>
                        </div>
                        <TypographyFocusStyle />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold">#7. Glassmorphism</h4>
                            <Button size="sm" variant="outline" onClick={() => handleSelect(7)} disabled={selectedDesign === 7}>Select</Button>
                        </div>
                        <GlassmorphismStyle />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold">#8. Neumorphism</h4>
                            <Button size="sm" variant="outline" onClick={() => handleSelect(8)} disabled={selectedDesign === 8}>Select</Button>
                        </div>
                        <NeumorphismStyle />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold">#9. Cyberpunk</h4>
                            <Button size="sm" variant="outline" onClick={() => handleSelect(9)} disabled={selectedDesign === 9}>Select</Button>
                        </div>
                        <CyberpunkStyle />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold">#10. Retro Paper</h4>
                            <Button size="sm" variant="outline" onClick={() => handleSelect(10)} disabled={selectedDesign === 10}>Select</Button>
                        </div>
                        <RetroPaperStyle />
                    </div>
                </div>

            </div>
        </div>
    )
}

// --- Sub-components for Clean Code ---

function DefaultStyle() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_MOMENTS.map(moment => (
                <MomentCard
                    key={`live-${moment.id}`}
                    moment={moment}
                    onClick={() => { }}
                    brandProposals={[]}
                />
            ))}
        </div>
    )
}

function InstagramStyle() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_MOMENTS.map((moment) => (
                <Card key={moment.id} className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="p-3 flex-row items-center gap-3 space-y-0">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={moment.avatar} />
                            <AvatarFallback>{moment.influencerName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="font-semibold text-sm">{moment.handle}</div>
                            <div className="text-xs text-muted-foreground">{moment.category}</div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                    </CardHeader>
                    <div className="aspect-square bg-gray-100 relative">
                        <img src={moment.image} alt={moment.title} className="object-cover w-full h-full" />
                    </div>
                    <CardContent className="p-3">
                        <div className="flex gap-4 mb-3">
                            <Heart className="h-6 w-6" />
                            <MessageCircle className="h-6 w-6" />
                            <Share2 className="h-6 w-6 ml-auto" />
                        </div>
                        <div className="font-bold text-sm mb-1">{moment.followers} followers</div>
                        <div className="text-sm">
                            <span className="font-semibold mr-2">{moment.influencerName}</span>
                            {moment.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 uppercase">{moment.eventDate}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function TicketStyle() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {MOCK_MOMENTS.slice(0, 2).map((moment) => (
                <div key={moment.id} className="flex bg-white rounded-lg shadow-sm border overflow-hidden h-48 group hover:shadow-md transition-shadow">
                    <div className="w-1/3 relative">
                        <img src={moment.image} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute bottom-3 left-3 text-white font-bold text-xl drop-shadow-md">
                            D-{Math.floor(Math.random() * 30)}
                        </div>
                    </div>
                    <div className="flex-1 p-5 flex flex-col dashed-l border-l-2 border-dashed border-gray-200 relative">
                        <div className="absolute -left-3 top-[-10px] w-6 h-6 bg-gray-50 rounded-full" />
                        <div className="absolute -left-3 bottom-[-10px] w-6 h-6 bg-gray-50 rounded-full" />

                        <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">{moment.category}</Badge>
                            <span className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> {moment.eventDate}</span>
                        </div>
                        <h4 className="font-bold text-lg mb-1 line-clamp-1">{moment.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-auto">{moment.description}</p>

                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-dashed">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={moment.avatar} />
                            </Avatar>
                            <div>
                                <div className="font-bold text-sm">{moment.influencerName}</div>
                                <div className="text-xs text-muted-foreground">@{moment.handle}</div>
                            </div>
                            <Button className="ml-auto" size="sm">제안하기</Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function MasonryStyle() {
    return (
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {MOCK_MOMENTS.map((moment) => (
                <div key={moment.id} className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer">
                    <img src={moment.image} className="w-full object-cover transition-transform group-hover:scale-105 duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <div className="text-white">
                            <h4 className="font-bold mb-1">{moment.title}</h4>
                            <div className="flex items-center gap-2 text-xs opacity-90">
                                <span>{moment.category}</span>
                                <span>•</span>
                                <span>{moment.influencerName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function DetailedHorizontalStyle() {
    return (
        <div className="space-y-4">
            {MOCK_MOMENTS.slice(0, 2).map((moment) => (
                <Card key={moment.id} className="p-4 hover:border-black transition-colors">
                    <div className="flex gap-4">
                        <div className="w-48 h-32 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            <img src={moment.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 py-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-lg">{moment.title}</span>
                                        <Badge variant="outline">{moment.category}</Badge>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                                        <Calendar className="h-3 w-3" /> {moment.eventDate}
                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <MapPin className="h-3 w-3" /> 제주도
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">{moment.followers}</div>
                                    <div className="text-xs text-muted-foreground">Followers</div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2 mt-2">{moment.description}</p>
                            <div className="flex gap-2 mt-3">
                                {moment.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs font-normal">#{tag}</Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col justify-center gap-2 border-l pl-4 ml-2">
                            <Button size="sm">제안 보내기</Button>
                            <Button variant="outline" size="sm">프로필 보기</Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

function StoryHighlightsStyle() {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {[...MOCK_MOMENTS, ...MOCK_MOMENTS].map((moment, i) => (
                <div key={`${moment.id}-${i}`} className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 w-24 group">
                    <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 group-hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                            <img src={moment.image} className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs font-semibold truncate w-full">{moment.title}</div>
                        <div className="text-[10px] text-muted-foreground">{moment.influencerName}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function TypographyFocusStyle() {
    return (
        <Card className="p-0 overflow-hidden">
            <div className="bg-black text-white p-6 text-center">
                <div className="text-xs font-bold tracking-widest uppercase mb-2 text-yellow-400">Featured Moment</div>
                <h3 className="text-xl font-serif italic">Summer Vacation</h3>
            </div>
            <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">#6. Typography Focus</p>
                <Button variant="link" size="sm">View Details <ArrowRight className="h-3 w-3 ml-1" /></Button>
            </CardContent>
        </Card>
    )
}

function GlassmorphismStyle() {
    return (
        <div className="relative h-48 rounded-xl overflow-hidden flex items-center justify-center p-6 bg-gradient-to-br from-blue-400 to-purple-500">
            <div className="relative z-10 bg-white/20 backdrop-blur-md border border-white/30 p-6 rounded-lg text-white w-full">
                <h3 className="font-bold">#7. Glassmorphism</h3>
                <p className="text-sm opacity-90 mt-2">Trendy & Modern Look</p>
                <Button size="sm" variant="secondary" className="mt-4 w-full bg-white/80 hover:bg-white text-purple-900 border-0">Select</Button>
            </div>
        </div>
    )
}

function NeumorphismStyle() {
    return (
        <div className="bg-[#e0e5ec] p-6 rounded-xl shadow-[9px_9px_16px_rgb(163,177,198),-9px_-9px_16px_rgba(255,255,255,0.5)]">
            <h3 className="font-bold text-gray-700">#8. Neumorphism</h3>
            <p className="text-sm text-gray-500 mt-2 mb-4">Soft UI Design</p>
            <Button className="w-full shadow-[6px_6px_10px_rgb(163,177,198),-6px_-6px_10px_rgba(255,255,255,0.5)] bg-[#e0e5ec] text-gray-700 hover:bg-gray-200 border-0">Select</Button>
        </div>
    )
}

function CyberpunkStyle() {
    return (
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <h3 className="font-bold text-cyan-400 relative z-10">#9. Cyberpunk</h3>
            <p className="text-sm text-gray-400 mt-2 mb-4 relative z-10">High Tech Vibe</p>
            <Button variant="outline" className="w-full border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 relative z-10">Select</Button>
        </div>
    )
}

function RetroPaperStyle() {
    return (
        <div className="bg-[#fdfbf7] p-6 rounded-sm border border-stone-200 shadow-sm relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-800/20" />
            <h3 className="font-serif font-bold text-stone-800 mt-2 border-b border-stone-300 pb-2">#10. Retro Paper</h3>
            <p className="text-sm text-stone-600 mt-2 font-serif italic">Classic & Trustworthy</p>
            <Button variant="ghost" className="w-full mt-4 hover:bg-stone-100 text-stone-800">Select</Button>
        </div>
    )
}
