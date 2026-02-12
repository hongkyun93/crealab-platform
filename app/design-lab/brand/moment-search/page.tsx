"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Heart, MessageCircle, Eye, Share2, Bookmark, MoreHorizontal,
    Star, MapPin, Calendar, TrendingUp, User, Tag,
    Instagram, Youtube, ExternalLink, Play, Image as ImageIcon
} from "lucide-react"

// --- Rich Realistic Mock Data (Korean Market Context) ---
const MOMENT_DATA_POOL = [
    {
        id: "m1",
        creator: "여행하는 소니",
        handle: "sony_travel",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
        image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80",
        title: "도쿄 시부야 스카이 야경 명소 총정리 🇯🇵",
        description: "시부야 스카이에서 바라본 도쿄의 야경은 정말 환상적이었어요! 예약 꿀팁부터 포토존까지 모두 정리해봤습니다. #도쿄여행 #시부야스카이",
        category: "여행/맛집",
        location: "일본 도쿄",
        stats: { views: "12.5k", likes: "892", comments: 142, engagement: "5.2%" },
        platform: "Instagram",
        price: "300,000",
        tags: ["일본여행", "도쿄맛집", "여행크리에이터", "야경명소"],
        date: "2024.08.15",
        verified: true
    },
    {
        id: "m2",
        creator: "카페 투어리스트",
        handle: "cafe_tour_kr",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
        image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80",
        title: "성수동 신상 카페 '멜로우' 솔직 후기 ☕️",
        description: "성수동에 새로 생긴 감성 카페 멜로우에 다녀왔어요. 시그니처 크림라떼가 정말 맛있었습니다. 인테리어도 너무 예뻐요!",
        category: "맛집/카페",
        location: "서울 성동구",
        stats: { views: "8.2k", likes: "560", comments: 89, engagement: "4.8%" },
        platform: "Blog",
        price: "150,000",
        tags: ["성수동카페", "신상카페", "카페추천", "디저트맛집"],
        date: "2024.08.12",
        verified: false
    },
    {
        id: "m3",
        creator: "fit_jina",
        handle: "fit_jina",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
        title: "오늘의 오운완! 등운동 루틴 공유 💪",
        description: "오늘은 등운동 하는 날! 랫풀다운 4세트, 로우 4세트 진행했습니다. 다들 득근하세요! 운동복은 안다르 제품입니다.",
        category: "운동/헬스",
        location: "서울 강남구",
        stats: { views: "45k", likes: "3.2k", comments: 210, engagement: "8.5%" },
        platform: "YouTube",
        price: "800,000",
        tags: ["오운완", "헬스타그램", "운동하는여자", "운동루틴"],
        date: "2024.08.10",
        verified: true
    },
    {
        id: "m4",
        creator: "뷰티 멘토 리사",
        handle: "lisa_beauty",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80",
        title: "여름철 무너지지 않는 메이크업 꿀팁 ✨",
        description: "덥고 습한 여름, 메이크업이 자꾸 무너져서 고민이신가요? 프라이머와 픽서를 활용한 지속력 높이는 방법을 알려드립니다.",
        category: "뷰티/패션",
        location: "Home Studio",
        stats: { views: "28k", likes: "1.5k", comments: 340, engagement: "6.2%" },
        platform: "Instagram",
        price: "500,000",
        tags: ["여름메이크업", "뷰티꿀팁", "메이크업튜토리얼"],
        date: "2024.08.01",
        verified: true
    },
    {
        id: "m5",
        creator: "테크 리뷰어 준",
        handle: "tech_jun",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
        title: "맥북 프로 M3 Max 1주일 사용기 💻",
        description: "드디어 도착한 맥북 프로 M3 Max! 1주일 동안 영상 편집 작업 용도로 사용해본 솔직한 후기를 남겨봅니다. 성능이 미쳤네요.",
        category: "IT/테크",
        location: "Tech Studio",
        stats: { views: "150k", likes: "8.9k", comments: 1200, engagement: "9.1%" },
        platform: "YouTube",
        price: "1,500,000",
        tags: ["맥북프로", "IT리뷰", "테크유튜버", "애플"],
        date: "2024.07.28",
        verified: true
    }
]

// Helper to get 3-4 random items
const getRandomMoments = () => {
    // Just shuffling and slicing for demo purposes
    return [...MOMENT_DATA_POOL].sort(() => 0.5 - Math.random()).slice(0, 3)
}

export default function MomentSearchPage() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        if (!selectedDesign) return <InstaFeedStyle />

        switch (selectedDesign) {
            case 1: return <InstaFeedStyle />;
            case 2: return <PolaroidGalleryStyle />;
            case 3: return <YoutubeThumbnailStyle />;
            case 4: return <PinterestMasonryStyle />;
            case 5: return <BlogArticleStyle />;
            case 6: return <EcommerceProductStyle />;
            case 7: return <ReviewCardStyle />;
            case 8: return <PortfolioGridStyle />;
            case 9: return <MinimalistListStyle />;
            case 10: return <MagazineCoverStyle />;
            case 11: return <DataAnalyticsStyle />;
            case 12: return <ProfileFocusStyle />;
            case 13: return <DarkModeNeonStyle />;
            case 14: return <HorizontalScrollCard />;
            case 15: return <CompactTileStyle />;
            case 16: return <TicketStubStyle />;
            case 17: return <ChatBubbleStyle />;
            case 18: return <GlassmorphismStyle />;
            case 19: return <NewspaperClippingStyle />;
            case 20: return <CyberpunkGlitchStyle />;
            default: return <InstaFeedStyle />;
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">모먼트 검색 디자인 랩</h1>
                <p className="text-muted-foreground">20가지의 서로 다른 모먼트 카드 디자인을 확인하고 비교해보세요.</p>
            </div>

            {/* Main Preview Area */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            {selectedDesign ? `Design Option #${selectedDesign}` : "Default View"}
                        </Badge>
                    </h3>
                    {selectedDesign && (
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDesign(null)}>
                            Reset
                        </Button>
                    )}
                </div>
                <div className="bg-gray-50/50 p-6 rounded-2xl border min-h-[400px]">
                    {renderPreview()}
                </div>
            </div>

            <div className="border-t my-8" />

            {/* All Variations Grid */}
            <h3 className="font-bold text-xl mb-6">All 20 Design Variations</h3>
            <div className="grid grid-cols-1 gap-12">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h4 className="font-bold text-lg text-gray-800">Style #{i + 1}</h4>
                            <Button size="sm" variant="outline" onClick={() => handleSelect(i + 1)}>View in Main Area</Button>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl overflow-hidden">
                            {(() => {
                                switch (i + 1) {
                                    case 1: return <InstaFeedStyle />;
                                    case 2: return <PolaroidGalleryStyle />;
                                    case 3: return <YoutubeThumbnailStyle />;
                                    case 4: return <PinterestMasonryStyle />;
                                    case 5: return <BlogArticleStyle />;
                                    case 6: return <EcommerceProductStyle />;
                                    case 7: return <ReviewCardStyle />;
                                    case 8: return <PortfolioGridStyle />;
                                    case 9: return <MinimalistListStyle />;
                                    case 10: return <MagazineCoverStyle />;
                                    case 11: return <DataAnalyticsStyle />;
                                    case 12: return <ProfileFocusStyle />;
                                    case 13: return <DarkModeNeonStyle />;
                                    case 14: return <HorizontalScrollCard />;
                                    case 15: return <CompactTileStyle />;
                                    case 16: return <TicketStubStyle />;
                                    case 17: return <ChatBubbleStyle />;
                                    case 18: return <GlassmorphismStyle />;
                                    case 19: return <NewspaperClippingStyle />;
                                    case 20: return <CyberpunkGlitchStyle />;
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

// --- 20 Design Components ---

// 1. Instagram Feed Style
function InstaFeedStyle() {
    const data = getRandomMoments()
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.map((m, i) => (
                <Card key={i} className="border-0 shadow-sm ring-1 ring-gray-200">
                    <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 ring-2 ring-pink-500 ring-offset-2">
                                <AvatarImage src={m.avatar} />
                                <AvatarFallback>{m.creator[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-sm">{m.handle}</span>
                        </div>
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                        <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                        <div className="flex justify-between mb-2">
                            <div className="flex gap-3">
                                <Heart className="h-6 w-6" />
                                <MessageCircle className="h-6 w-6" />
                                <Share2 className="h-6 w-6" />
                            </div>
                            <Bookmark className="h-6 w-6" />
                        </div>
                        <div className="font-semibold text-sm mb-1">{m.stats.likes} likes</div>
                        <div className="text-sm">
                            <span className="font-semibold mr-1">{m.handle}</span>
                            {m.title}
                        </div>
                        <div className="text-gray-400 text-xs uppercase mt-2">{m.date}</div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

// 2. Polaroid Gallery
function PolaroidGalleryStyle() {
    const data = getRandomMoments()
    return (
        <div className="flex flex-wrap justify-center gap-8 p-4 bg-[#f8f5f2]">
            {data.map((m, i) => (
                <div key={i} className="bg-white p-3 pb-12 shadow-xl transform rotate-1 hover:rotate-0 transition-all duration-300 w-64">
                    <div className="aspect-square bg-gray-100 mb-4 overflow-hidden filter sepia-[.2]">
                        <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="font-handwriting text-center font-bold text-gray-700 font-serif">
                        {m.location}
                    </div>
                    <div className="text-center text-xs text-gray-400 mt-1">{m.date}</div>
                </div>
            ))}
        </div>
    )
}

// 3. Youtube Thumbnail
function YoutubeThumbnailStyle() {
    const data = getRandomMoments()
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-4">
            {data.map((m, i) => (
                <div key={i} className="group cursor-pointer">
                    <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative mb-3">
                        <img src={m.image} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">12:45</div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                            <Play className="w-12 h-12 text-white fill-white" />
                        </div>
                    </div>
                    <div className="flex gap-3 px-1">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={m.avatar} />
                        </Avatar>
                        <div>
                            <h3 className="font-bold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-blue-600">{m.title}</h3>
                            <div className="text-xs text-gray-500">{m.creator} • 조회수 {m.stats.views} • {m.date}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 4. Pinterest Masonry
function PinterestMasonryStyle() {
    const data = getRandomMoments()
    return (
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {data.map((m, i) => (
                <div key={i} className="break-inside-avoid rounded-2xl overflow-hidden relative group cursor-zoom-in">
                    <img src={m.image} className="w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                        <div className="flex justify-end"><Button size="sm" className="rounded-full bg-red-600 hover:bg-red-700 text-white font-bold px-4">Save</Button></div>
                        <div className="flex justify-between items-center text-white">
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-2 py-1">
                                <ExternalLink className="w-3 h-3" />
                                <span className="text-xs font-bold truncate max-w-[80px]">{m.platform}</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="bg-white p-1.5 rounded-full text-black"><Share2 className="w-4 h-4" /></div>
                                <div className="bg-white p-1.5 rounded-full text-black"><MoreHorizontal className="w-4 h-4" /></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 5. Blog Article Card
function BlogArticleStyle() {
    const data = getRandomMoments()
    return (
        <div className="space-y-6">
            {data.map((m, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 items-start border-b pb-6 last:border-0">
                    <div className="w-full md:w-1/3 aspect-[4/3] rounded-lg overflow-hidden shrink-0">
                        <img src={m.image} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wide">{m.category}</div>
                        <h3 className="text-xl font-bold mb-2 leading-tight hover:underline cursor-pointer">{m.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">{m.description}</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={m.avatar} />
                                </Avatar>
                                <div className="text-sm font-medium">{m.creator}</div>
                                <span className="text-gray-300">•</span>
                                <div className="text-xs text-gray-400">{m.date}</div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400 text-xs">
                                <span className="flex items-center"><Eye className="w-3 h-3 mr-1" /> {m.stats.views}</span>
                                <span className="flex items-center"><Heart className="w-3 h-3 mr-1" /> {m.stats.likes}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 6. Ecommerce Product Style
function EcommerceProductStyle() {
    const data = getRandomMoments()
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.map((m, i) => (
                <div key={i} className="border rounded-lg overflow-hidden group">
                    <div className="aspect-[4/5] overflow-hidden relative bg-gray-100">
                        <img src={m.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        {i === 0 && <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">BEST</Badge>}
                        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                            <Button size="sm" className="w-full text-xs h-8">제안 보내기</Button>
                        </div>
                    </div>
                    <div className="p-3">
                        <div className="text-xs text-gray-500 mb-1">{m.category}</div>
                        <h3 className="font-bold text-sm mb-1 line-clamp-1">{m.title}</h3>
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">{m.price}원~</span>
                            <div className="flex text-yellow-400 text-xs">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-gray-400 ml-1">4.9</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 7. Review Card Style
function ReviewCardStyle() {
    const data = getRandomMoments()
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((m, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                    <div className="flex gap-1 text-yellow-400">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm font-serif leading-relaxed line-clamp-4">"{m.description}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={m.avatar} />
                        </Avatar>
                        <div>
                            <div className="font-bold text-sm">{m.creator}</div>
                            <div className="text-xs text-gray-500">{m.handle}</div>
                        </div>
                        <div className="ml-auto text-3xl opacity-10 font-serif">❞</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 8. Portfolio Grid Style
function PortfolioGridStyle() {
    const data = getRandomMoments()
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {data.map((m, i) => (
                <div key={i} className="aspect-square relative group overflow-hidden bg-black">
                    <img src={m.image} className="w-full h-full object-cover opacity-90 group-hover:opacity-60 transition-opacity" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                        <div className="uppercase tracking-widest text-xs mb-2 border-b border-white/50 pb-2">{m.category}</div>
                        <h3 className="font-bold text-lg mb-4">{m.creator}</h3>
                        <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">View Project</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 9. Minimalist List Style
function MinimalistListStyle() {
    const data = getRandomMoments()
    return (
        <div className="divide-y">
            {data.map((m, i) => (
                <div key={i} className="py-4 flex gap-4 items-center group hover:bg-gray-50 px-2 rounded-lg cursor-pointer transition-colors">
                    <div className="font-mono text-xs text-gray-400 w-8">0{i + 1}</div>
                    <img src={m.image} className="w-16 h-12 object-cover rounded grayscale group-hover:grayscale-0 transition-all" />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm line-clamp-1">{m.title}</h3>
                        <div className="text-xs text-gray-500">{m.handle}</div>
                    </div>
                    <div className="flex gap-4 text-xs font-mono text-gray-500">
                        <div className="w-20 text-right">{m.stats.views} Views</div>
                        <div className="w-20 text-right">{m.date}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 10. Magazine Cover Style
function MagazineCoverStyle() {
    const data = getRandomMoments().slice(0, 1) // Only show 1 big cover
    return (
        <div className="flex justify-center">
            {data.map((m, i) => (
                <div key={i} className="relative w-full max-w-sm aspect-[3/4] shadow-2xl">
                    <img src={m.image} className="w-full h-full object-cover" />

                    {/* Masthead */}
                    <div className="absolute top-8 left-0 right-0 text-center text-white font-black text-5xl tracking-tighter drop-shadow-md mix-blend-overlay">MOMENT</div>

                    {/* Cover Lines */}
                    <div className="absolute bottom-12 left-6 right-6 text-white space-y-4">
                        <div>
                            <div className="bg-yellow-400 text-black text-xs font-bold inline-block px-1 mb-1">EXCLUSIVE</div>
                            <h3 className="text-3xl font-bold leading-none drop-shadow-lg">{m.title}</h3>
                        </div>
                        <div className="flex justify-between items-end border-t border-white/50 pt-2">
                            <div className="text-sm font-bold">{m.creator}</div>
                            <div className="text-xs opacity-80">{m.date} • Vol. 8</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 11. Data Analytics Style
function DataAnalyticsStyle() {
    const data = getRandomMoments()
    return (
        <div className="space-y-4">
            {data.map((m, i) => (
                <Card key={i} className="p-4 flex gap-6 items-center">
                    <div className="w-24 h-24 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                        <img src={m.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 grid grid-cols-4 gap-4 divide-x">
                        <div className="px-4 first:pl-0">
                            <div className="text-xs text-gray-500 mb-1">Engagement Rate</div>
                            <div className="text-2xl font-bold text-blue-600">{m.stats.engagement}</div>
                            <div className="text-xs text-green-500 flex items-center mt-1"><TrendingUp className="w-3 h-3 mr-1" /> Top 5%</div>
                        </div>
                        <div className="px-4">
                            <div className="text-xs text-gray-500 mb-1">Total Views</div>
                            <div className="text-xl font-bold">{m.stats.views}</div>
                        </div>
                        <div className="px-4">
                            <div className="text-xs text-gray-500 mb-1">Likes</div>
                            <div className="text-xl font-bold">{m.stats.likes}</div>
                        </div>
                        <div className="px-4 text-center flex flex-col justify-center">
                            <div className="text-xs text-gray-500 mb-2">Est. Value</div>
                            <Badge variant="secondary" className="w-fit mx-auto">{m.price}</Badge>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

// 12. Profile Focus Style
function ProfileFocusStyle() {
    const data = getRandomMoments()
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.map((m, i) => (
                <div key={i} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-1 text-white text-center">
                    <div className="bg-white rounded-[20px] p-6 h-full flex flex-col items-center text-gray-800">
                        <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-indigo-500 to-purple-600 mb-3">
                            <img src={m.avatar} className="w-full h-full rounded-full object-cover border-2 border-white" />
                        </div>
                        <h3 className="font-bold text-lg">{m.creator}</h3>
                        <div className="text-sm text-gray-500 mb-4">@{m.handle}</div>

                        <div className="flex gap-2 mb-4 w-full">
                            <div className="bg-gray-50 rounded-lg p-2 flex-1 text-center">
                                <div className="font-bold text-sm">{m.stats.views}</div>
                                <div className="text-[10px] text-gray-400">Views</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 flex-1 text-center">
                                <div className="font-bold text-sm">{m.stats.likes}</div>
                                <div className="text-[10px] text-gray-400">Likes</div>
                            </div>
                        </div>

                        <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">Contact</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 13. Dark Mode Neon
function DarkModeNeonStyle() {
    const data = getRandomMoments()
    return (
        <div className="bg-[#0f172a] p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.map((m, i) => (
                <div key={i} className="bg-[#1e293b] rounded-xl overflow-hidden border border-[#334155] hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all">
                    <div className="relative aspect-video">
                        <img src={m.image} className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent"></div>
                        <div className="absolute bottom-2 left-2 right-2">
                            <h3 className="text-cyan-400 font-bold text-sm truncate">{m.title}</h3>
                        </div>
                    </div>
                    <div className="p-3 text-slate-300 text-xs">
                        <div className="flex justify-between mb-2">
                            <span>{m.platform}</span>
                            <span className="text-slate-500">{m.date}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 w-[70%] shadow-[0_0_5px_cyan]"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 14. Horizontal Scroll Card
function HorizontalScrollCard() {
    const data = getRandomMoments()
    return (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {data.map((m, i) => (
                <div key={i} className="min-w-[280px] snap-center bg-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="h-32 overflow-hidden">
                        <img src={m.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 relative">
                        <Avatar className="absolute -top-6 left-4 border-4 border-white h-12 w-12">
                            <AvatarImage src={m.avatar} />
                        </Avatar>
                        <div className="mt-6">
                            <h3 className="font-bold text-sm line-clamp-2 mb-2">{m.title}</h3>
                            <div className="flex gap-2 flex-wrap">
                                {m.tags.slice(0, 2).map((t, j) => <span key={j} className="bg-gray-100 px-2 py-1 rounded text-[10px] text-gray-600">#{t}</span>)}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 15. Compact Tile
function CompactTileStyle() {
    const data = getRandomMoments()
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {data.map((m, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={m.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                        <div className="text-[10px] opacity-80 mb-0.5">{m.creator}</div>
                        <div className="font-bold text-xs line-clamp-1">{m.title}</div>
                        <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {m.platform === 'Instagram' ? <Instagram className="w-3 h-3" /> : <Youtube className="w-3 h-3" />}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 16. Ticket Stub Style
function TicketStubStyle() {
    const data = getRandomMoments()
    return (
        <div className="space-y-4">
            {data.map((m, i) => (
                <div key={i} className="flex bg-white filter drop-shadow hover:drop-shadow-lg transition-all mx-auto max-w-lg rounded overflow-hidden">
                    {/* Left Image Part */}
                    <div className="w-32 bg-gray-200 relative border-r-2 border-dashed border-gray-300">
                        <img src={m.image} className="w-full h-full object-cover" />
                        <div className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full"></div>
                    </div>
                    {/* Right Content Part */}
                    <div className="flex-1 p-4 flex flex-col justify-between relative bg-[#fffdf5]">
                        <div className="absolute -left-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full"></div>
                        <div>
                            <div className="text-xs font-mono text-gray-400 mb-1">MOMENT TICKET #{m.id.toUpperCase()}</div>
                            <h3 className="font-bold text-lg leading-tight mb-2 font-serif">{m.title}</h3>
                            <div className="flex items-center gap-2">
                                <Avatar className="w-5 h-5"><AvatarImage src={m.avatar} /></Avatar>
                                <span className="text-xs">{m.creator}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end mt-4 border-t-2 border-dotted border-gray-200 pt-2">
                            <div className="text-xs font-bold text-gray-500">{m.location}</div>
                            <div className="text-xs font-mono">{m.date}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 17. Chat Bubble Style
function ChatBubbleStyle() {
    const data = getRandomMoments()
    return (
        <div className="max-w-md mx-auto space-y-6">
            {data.map((m, i) => (
                <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                    <Avatar className="w-10 h-10 mt-1">
                        <AvatarImage src={m.avatar} />
                    </Avatar>
                    <div className={`flex flex-col gap-1 max-w-[80%] ${i % 2 === 0 ? 'items-start' : 'items-end'}`}>
                        <div className="text-xs text-gray-500 px-1">{m.creator}</div>
                        <div className={`p-3 rounded-2xl ${i % 2 === 0 ? 'bg-gray-100 rounded-tl-none' : 'bg-blue-500 text-white rounded-tr-none'}`}>
                            <p className="text-sm mb-2">{m.description.slice(0, 60)}...</p>
                            <div className="rounded-xl overflow-hidden mb-1">
                                <img src={m.image} className="w-full object-cover" />
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-300 px-1">Read 12:30 PM</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 18. Glassmorphism
function GlassmorphismStyle() {
    const data = getRandomMoments()
    return (
        <div className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 p-8 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((m, i) => (
                <div key={i} className="bg-white/30 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl flex gap-4 text-white">
                    <img src={m.image} className="w-24 h-24 rounded-lg object-cover shadow-sm bg-black/20" />
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-shadow-sm mb-1">{m.creator}</h3>
                        <div className="text-sm opacity-90 mb-3 line-clamp-2 text-shadow-sm">{m.title}</div>
                        <Button size="sm" className="bg-white/20 hover:bg-white/40 border-0 text-white backdrop-blur">View Moment</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 19. Newspaper Clipping
function NewspaperClippingStyle() {
    const data = getRandomMoments().slice(0, 1) // Single Column
    return (
        <div className="bg-[#f0e6d2] p-6 max-w-sm mx-auto font-serif text-justify border-double border-4 border-gray-800">
            {data.map((m, i) => (
                <div key={i}>
                    <div className="text-center border-b-2 border-black pb-2 mb-4">
                        <div className="text-4xl font-black uppercase tracking-tight">The Daily Moment</div>
                        <div className="flex justify-between text-xs font-bold border-t border-black mt-1 pt-1">
                            <span>VOL. 1</span>
                            <span>{m.date}</span>
                            <span>$1.00</span>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold leading-none mb-3 text-center">{m.title}</h3>
                    <div className="float-left mr-3 mb-1 w-24 h-24 border border-black p-1 bg-white">
                        <img src={m.image} className="w-full h-full object-cover grayscale contrast-125" />
                    </div>
                    <p className="text-sm leading-tight mb-2"><span className="float-left text-3xl font-black mr-1 leading-none">{m.description[0]}</span>{m.description}</p>
                    <p className="text-sm leading-tight italic opacity-80 mt-4 text-right">- Reported by {m.creator}</p>
                </div>
            ))}
        </div>
    )
}

// 20. Cyberpunk Glitch
function CyberpunkGlitchStyle() {
    const data = getRandomMoments()
    return (
        <div className="bg-black p-6 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
            {data.map((m, i) => (
                <div key={i} className="relative border-2 border-yellow-400 p-1 group">
                    {/* Glitch effects */}
                    <div className="absolute top-0 left-0 w-full h-full bg-red-500/20 translate-x-1 translate-y-1 mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-blue-500/20 -translate-x-1 -translate-y-1 mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="relative bg-black h-full">
                        <div className="bg-yellow-400 text-black text-xs font-black inline-block px-2 mb-2">SYS.ID: {m.id}</div>
                        <div className="flex gap-4">
                            <img src={m.image} className="w-24 h-24 object-cover border border-yellow-400/50 grayscale group-hover:grayscale-0 transition-all" />
                            <div className="text-green-500">
                                <h3 className="font-bold text-sm mb-1 uppercase tracking-widest text-yellow-400">{m.category}</h3>
                                <div className="text-xs mb-2 text-white/80">{m.title.slice(0, 20)}...</div>
                                <div className="text-xs border border-green-500/50 px-1 animate-pulse">STATUS: VERIFIED</div>
                            </div>
                        </div>
                    </div>

                    {/* Corner accents */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400"></div>
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-400"></div>
                </div>
            ))}
        </div>
    )
}
