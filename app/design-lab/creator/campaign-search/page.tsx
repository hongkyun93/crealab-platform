"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
    Search, MapPin, DollarSign, Calendar, Clock,
    Briefcase, Globe, Star, Zap, Filter, Heart,
    Share2, Bookmark, CheckCircle2, AlertCircle,
    Camera, Video, PenTool, Layout, Grid, List
} from "lucide-react"

// --- Rich Realistic Mock Data (Campaign Search Context) ---
const CAMPAIGN_DATA_POOL = [
    {
        id: "cp1",
        title: "서울 5성급 호텔 라운지 체험단 모집",
        brand: "그랜드 조선",
        brandLogo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=50&q=80",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
        pay: "300,000 ~ 500,000",
        product: "라운지 2인 이용권 + 숙박권",
        platform: ["Instagram", "Blog"],
        deadline: "D-5",
        location: "서울 중구",
        category: "Travel",
        applicants: 124,
        isHot: true,
        isNew: false
    },
    {
        id: "cp2",
        title: "신상 게이밍 마우스 G-Pro 리뷰어",
        brand: "Logitech Korea",
        brandLogo: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=50&q=80",
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
        pay: "150,000",
        product: "G-Pro Wireless Mouse",
        platform: ["YouTube", "Twitch"],
        deadline: "D-2",
        location: "Online",
        category: "Tech",
        applicants: 45,
        isHot: false,
        isNew: true
    },
    {
        id: "cp3",
        title: "성수동 힙한 카페 '멜로우' 디저트 촬영",
        brand: "Cafe Mellow",
        brandLogo: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=50&q=80",
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
        pay: "50,000",
        product: "디저트 3종 세트 + 음료",
        platform: ["Instagram", "TikTok"],
        deadline: "D-10",
        location: "서울 성동구",
        category: "Food",
        applicants: 89,
        isHot: true,
        isNew: false
    },
    {
        id: "cp4",
        title: "비건 스킨케어 3종 세트 릴스 제작",
        brand: "Aromatica",
        brandLogo: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=50&q=80",
        image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80",
        pay: "1,000,000",
        product: "스킨케어 풀세트",
        platform: ["Instagram", "YouTube"],
        deadline: "D-14",
        location: "Online",
        category: "Beauty",
        applicants: 230,
        isHot: true,
        isNew: true
    },
    {
        id: "cp5",
        title: "24SS 요가복 신상 룩북 모델",
        brand: "Xexymix",
        brandLogo: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=50&q=80",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
        pay: "Pay 협의",
        product: "착장 의류 제공",
        platform: ["Instagram"],
        deadline: "D-7",
        location: "서울 강남구",
        category: "Fashion",
        applicants: 310,
        isHot: false,
        isNew: false
    }
]

const getRandomCampaigns = () => [...CAMPAIGN_DATA_POOL].slice(0, 3)

export default function CreatorCampaignSearchPage() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        if (!selectedDesign) return <JobBoardRowStyle />

        switch (selectedDesign) {
            case 1: return <JobBoardRowStyle />;
            case 2: return <InstagramStyleGrid />;
            case 3: return <TinderSwipeCardStyle />;
            case 4: return <DetailedRequirementsCard />;
            case 5: return <MapBasedViewStyle />;
            case 6: return <MinimalistTypoList />;
            case 7: return <RichMediaFeatureStyle />;
            case 8: return <TagCloudFilterStyle />;
            case 9: return <TimelineOpportunityStyle />;
            case 10: return <BudgetFocusStyle />;
            case 11: return <PlatformIconStyle />;
            case 12: return <MagazineCoverStyle />;
            case 13: return <GamifiedMissionCard />;
            case 14: return <UrgencyCountdownStyle />;
            case 15: return <ComparisonPricingTable />;
            case 16: return <DarkNeonGamingStyle />;
            case 17: return <PortfolioMatchStyle />;
            case 18: return <MobileAppSwipeList />;
            case 19: return <InteractiveBentoGrid />;
            case 20: return <ContractPreviewStyle />;
            default: return <JobBoardRowStyle />;
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">캠페인 찾기 디자인 랩</h1>
                <p className="text-muted-foreground">크리에이터를 위한 20가지 캠페인 탐색 카드 디자인을 확인해보세요.</p>
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
                                    case 1: return <JobBoardRowStyle />;
                                    case 2: return <InstagramStyleGrid />;
                                    case 3: return <TinderSwipeCardStyle />;
                                    case 4: return <DetailedRequirementsCard />;
                                    case 5: return <MapBasedViewStyle />;
                                    case 6: return <MinimalistTypoList />;
                                    case 7: return <RichMediaFeatureStyle />;
                                    case 8: return <TagCloudFilterStyle />;
                                    case 9: return <TimelineOpportunityStyle />;
                                    case 10: return <BudgetFocusStyle />;
                                    case 11: return <PlatformIconStyle />;
                                    case 12: return <MagazineCoverStyle />;
                                    case 13: return <GamifiedMissionCard />;
                                    case 14: return <UrgencyCountdownStyle />;
                                    case 15: return <ComparisonPricingTable />;
                                    case 16: return <DarkNeonGamingStyle />;
                                    case 17: return <PortfolioMatchStyle />;
                                    case 18: return <MobileAppSwipeList />;
                                    case 19: return <InteractiveBentoGrid />;
                                    case 20: return <ContractPreviewStyle />;
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

// 1. Job Board Row
function JobBoardRowStyle() {
    const data = getRandomCampaigns()
    return (
        <div className="space-y-3">
            {data.map((c, i) => (
                <div key={i} className="bg-white border p-4 rounded-lg flex flex-col md:flex-row gap-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0 border">
                        <img src={c.brandLogo} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-1">
                            <h3 className="font-bold text-lg truncate pr-4">{c.title}</h3>
                            <Badge variant={c.isHot ? "destructive" : "secondary"}>{c.isHot ? 'HOT' : 'NEW'}</Badge>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">{c.brand} • {c.location}</div>
                        <div className="flex gap-2">
                            {c.platform.map((p, j) => <Badge key={j} variant="outline" className="text-xs">{p}</Badge>)}
                            <Badge variant="outline" className="text-xs bg-gray-50">{c.category}</Badge>
                        </div>
                    </div>
                    <div className="flex flex-row md:flex-col justify-between items-end min-w-[120px] text-right">
                        <div className="font-bold text-blue-600">{c.pay}</div>
                        <div className="text-xs text-gray-400">{c.deadline} days left</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 2. Instagram Style Grid
function InstagramStyleGrid() {
    const data = getRandomCampaigns()
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {data.map((c, i) => (
                <div key={i} className="aspect-square relative group cursor-pointer overflow-hidden bg-gray-100">
                    <img src={c.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center">
                        <div className="font-bold text-sm mb-1">{c.brand}</div>
                        <div className="text-xs line-clamp-2 mb-2">{c.title}</div>
                        <div className="font-bold text-yellow-300">{c.pay === 'Pay 협의' ? 'Negotiable' : c.pay}</div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart className="w-6 h-6 text-white hover:fill-red-500 hover:text-red-500" />
                    </div>
                </div>
            ))}
        </div>
    )
}

// 3. Tinder Swipe Card
function TinderSwipeCardStyle() {
    const data = getRandomCampaigns().slice(0, 1)
    return (
        <div className="flex justify-center">
            {data.map((c, i) => (
                <div key={i} className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden border">
                    <div className="h-80 relative">
                        <img src={c.image} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20 text-white">
                            <h3 className="font-bold text-2xl mb-1">{c.brand}</h3>
                            <div className="flex gap-2 text-sm opacity-90">
                                <Briefcase className="w-4 h-4" /> {c.category}
                                <MapPin className="w-4 h-4 ml-2" /> {c.location}
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="font-bold text-lg mb-2">{c.title}</p>
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                            Looking for influencers to promote our new {c.product}.
                            Requirements include {c.platform.join(' & ')} content creation.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button size="icon" variant="outline" className="w-14 h-14 rounded-full border-red-500 text-red-500 hover:bg-red-50"><XIcon /></Button>
                            <Button size="icon" variant="outline" className="w-14 h-14 rounded-full border-green-500 text-green-500 hover:bg-green-50 bg-green-50"><CheckIcon /></Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 4. Detailed Requirements Card
function DetailedRequirementsCard() {
    const data = getRandomCampaigns()
    return (
        <div className="space-y-4">
            {data.map((c, i) => (
                <div key={i} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                            <Avatar className="w-12 h-12 rounded"><AvatarImage src={c.brandLogo} /></Avatar>
                            <div>
                                <h3 className="font-bold text-lg">{c.title}</h3>
                                <div className="text-sm text-gray-500">{c.brand}</div>
                            </div>
                        </div>
                        <Badge>{c.pay}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-gray-50 p-4 rounded-lg text-sm">
                        <div>
                            <div className="text-gray-400 text-xs uppercase mb-1">Platform</div>
                            <div className="font-bold flex gap-1">{c.platform.map((p, j) => <span key={j}>{p}</span>)}</div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-xs uppercase mb-1">Provides</div>
                            <div className="font-bold truncate" title={c.product}>{c.product}</div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-xs uppercase mb-1">Location</div>
                            <div className="font-bold">{c.location}</div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-xs uppercase mb-1">Deadline</div>
                            <div className="font-bold text-red-500">{c.deadline}</div>
                        </div>
                    </div>

                    <Button className="w-full">View Details & Apply</Button>
                </div>
            ))}
        </div>
    )
}

// 5. Map Based View
function MapBasedViewStyle() {
    const data = getRandomCampaigns()
    return (
        <div className="bg-gray-100 rounded-xl p-4 h-[300px] relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Seoul_City_Map.png')] bg-cover opacity-20 grayscale"></div>
            <div className="relative z-10 grid grid-cols-2 gap-8 w-full max-w-2xl px-4">
                {data.slice(0, 2).map((c, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg shadow-lg flex gap-3 items-center transform hover:scale-105 transition-transform cursor-pointer">
                        <img src={c.brandLogo} className="w-10 h-10 rounded border object-cover" />
                        <div className="min-w-0">
                            <div className="font-bold text-xs truncate">{c.brand}</div>
                            <div className="text-[10px] text-gray-500 truncate">{c.location}</div>
                            <div className="text-[10px] font-bold text-blue-600 mt-1">{c.pay}</div>
                        </div>
                        <div className="absolute -bottom-2 -left-2 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-white border-r-[10px] border-r-transparent"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 6. Minimalist Typo List
function MinimalistTypoList() {
    const data = getRandomCampaigns()
    return (
        <div className="divide-y border-t border-b">
            {data.map((c, i) => (
                <div key={i} className="py-6 group hover:bg-gray-50 transition-colors px-4 flex justify-between items-center cursor-pointer">
                    <div>
                        <div className="text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">{c.category} / {c.deadline}</div>
                        <h3 className="text-2xl font-light mb-1 group-hover:pl-4 transition-all">{c.title}</h3>
                        <div className="text-sm text-gray-500">by <span className="text-black font-medium">{c.brand}</span></div>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="font-mono text-lg">{c.pay}</div>
                        <div className="text-xs text-gray-400">KRW</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 7. Rich Media Feature
function RichMediaFeatureStyle() {
    const data = getRandomCampaigns().slice(0, 2)
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((c, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer shadow-lg">
                    <img src={c.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                        <div className="mb-auto flex justify-between">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur border-0">{c.category}</Badge>
                            <div className="w-8 h-8 rounded-full bg-white p-0.5"><img src={c.brandLogo} className="w-full h-full rounded-full object-cover" /></div>
                        </div>
                        <h3 className="font-bold text-xl mb-2">{c.title}</h3>
                        <div className="flex gap-4 text-sm opacity-90 font-medium">
                            <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1" /> {c.pay}</span>
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {c.deadline} left</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 8. Tag Cloud Filter
function TagCloudFilterStyle() {
    const data = getRandomCampaigns()
    return (
        <div className="space-y-4">
            {data.map((c, i) => (
                <div key={i} className="bg-white border rounded-xl p-4 hover:border-black transition-colors">
                    <div className="flex justify-between mb-4">
                        <div className="font-bold text-lg max-w-[70%]">{c.title}</div>
                        <div className="text-right">
                            <div className="font-bold text-blue-600">{c.pay}</div>
                            <div className="text-xs text-gray-400">{c.isNew ? 'New' : ''}</div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {c.platform.map((p, j) => <Badge key={`p-${j}`} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">{p}</Badge>)}
                        <Badge variant="outline" className="border-gray-300 text-gray-600">📍 {c.location}</Badge>
                        <Badge variant="outline" className="border-gray-300 text-gray-600">🏷 {c.category}</Badge>
                        <Badge variant="outline" className="border-gray-300 text-gray-600">🎁 {c.product}</Badge>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 9. Timeline Opportunity
function TimelineOpportunityStyle() {
    const data = getRandomCampaigns()
    return (
        <div className="relative pl-6 border-l-2 border-gray-200 space-y-8">
            {data.map((c, i) => (
                <div key={i} className="relative">
                    <div className="absolute -left-[29px] top-1 bg-white border-2 border-blue-500 w-4 h-4 rounded-full"></div>
                    <div className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">{c.deadline} Deadline</div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded shrink-0">
                            <img src={c.image} className="w-full h-full object-cover rounded" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm mb-1">{c.title}</h3>
                            <div className="text-xs text-gray-500 mb-2">{c.brand}</div>
                            <div className="text-sm font-bold">{c.pay}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 10. Budget Focus
function BudgetFocusStyle() {
    const data = getRandomCampaigns()
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((c, i) => (
                <div key={i} className="bg-white border rounded-lg p-6 text-center hover:shadow-lg transition-shadow bg-gradient-to-b from-white to-gray-50">
                    <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Estimated Pay</div>
                    <div className="text-2xl font-black text-green-600 mb-4">{c.pay === 'Pay 협의' ? 'Negotiable' : c.pay}</div>
                    <h3 className="font-bold text-sm mb-2 line-clamp-1">{c.title}</h3>
                    <div className="text-xs text-gray-500 mb-4">{c.brand}</div>
                    <Button size="sm" className="w-full rounded-full bg-green-600 hover:bg-green-700">Apply Now</Button>
                </div>
            ))}
        </div>
    )
}

// 11. Platform Icon Style
function PlatformIconStyle() {
    const data = getRandomCampaigns()
    return (
        <div className="space-y-3">
            {data.map((c, i) => (
                <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-xl border">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${c.platform.includes('Instagram') ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 'bg-red-600'}`}>
                        <Camera className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">{c.title}</h3>
                        <div className="text-xs text-gray-500 truncate">{c.brand} • {c.platform.join(', ')} only</div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-sm">{c.pay}</div>
                        <Button size="icon" variant="ghost" className="h-6 w-6"><Bookmark className="w-4 h-4 text-gray-400" /></Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 12. Magazine Cover
function MagazineCoverStyle() {
    const data = getRandomCampaigns().slice(0, 1)
    return (
        <div className="flex justify-center">
            {data.map((c, i) => (
                <div key={i} className="w-full max-w-sm relative aspect-[3/4] shadow-2xl bg-white p-2">
                    <div className="bg-black text-white text-center py-1 font-serif text-2xl font-bold tracking-widest absolute top-6 left-0 right-0 z-10 w-[90%] mx-auto bg-opacity-80">
                        CAMPAIGN
                    </div>
                    <img src={c.image} className="w-full h-full object-cover grayscale contrast-125" />
                    <div className="absolute bottom-10 left-4 z-10 text-white">
                        <div className="bg-red-600 text-white px-2 py-1 text-sm font-bold inline-block mb-2">EXCLUSIVE</div>
                        <h3 className="text-3xl font-black uppercase leading-none mb-2 drop-shadow-lg">{c.brand}<br />RECRUITING</h3>
                        <p className="font-serif italic text-lg drop-shadow-md">{c.pay}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 13. Gamified Mission Card
function GamifiedMissionCard() {
    const data = getRandomCampaigns()
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((c, i) => (
                <div key={i} className="bg-slate-900 text-white p-1 rounded-xl shadow-lg relative">
                    <div className="absolute top-0 right-0 p-2 opacity-50"><Zap className="w-12 h-12 text-yellow-400" /></div>
                    <div className="bg-slate-800 p-4 rounded-lg h-full border border-slate-700">
                        <div className="text-xs text-yellow-400 font-mono mb-2">MISSION #{c.id.toUpperCase()}</div>
                        <h3 className="font-bold text-lg mb-1 leading-tight">{c.title}</h3>
                        <div className="my-4 h-px bg-slate-700 w-full"></div>
                        <div className="space-y-2 text-sm text-slate-300">
                            <div className="flex justify-between"><span>Reward:</span> <span className="text-white font-bold">{c.pay}</span></div>
                            <div className="flex justify-between"><span>Target:</span> <span className="text-white">{c.platform.join(' + ')}</span></div>
                            <div className="flex justify-between"><span>Time:</span> <span className="text-red-400">{c.deadline} remaining</span></div>
                        </div>
                        <Button className="w-full mt-4 bg-yellow-500 text-black hover:bg-yellow-400 font-bold border-0">ACCEPT MISSION</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 14. Urgency Countdown
function UrgencyCountdownStyle() {
    const data = getRandomCampaigns()
    return (
        <div className="space-y-4">
            {data.map((c, i) => (
                <div key={i} className="flex gap-4 p-4 border rounded-lg items-center bg-red-50/50 border-red-100">
                    <div className="flex flex-col items-center bg-white p-2 border rounded shadow-sm min-w-[60px]">
                        <span className="text-red-500 font-black text-xl">{c.deadline.replace('D-', '')}</span>
                        <span className="text-[10px] text-gray-500 uppercase">Days Left</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1">{c.title}</h3>
                        <div className="text-xs text-gray-500">High competition • {c.applicants} applied</div>
                    </div>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">Apply Fast</Button>
                </div>
            ))}
        </div>
    )
}

// 15. Comparison Pricing Table
function ComparisonPricingTable() {
    const data = getRandomCampaigns()
    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                    <tr>
                        <th className="p-4 font-medium">Campaign</th>
                        <th className="p-4 font-medium">Category</th>
                        <th className="p-4 font-medium text-right">Compensation</th>
                        <th className="p-4 font-medium"></th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {data.map((c, i) => (
                        <tr key={i} className="hover:bg-gray-50 group">
                            <td className="p-4">
                                <div className="font-bold truncate max-w-[200px]">{c.title}</div>
                                <div className="text-xs text-gray-500">{c.brand}</div>
                            </td>
                            <td className="p-4">
                                <Badge variant="outline" className="font-normal">{c.category}</Badge>
                            </td>
                            <td className="p-4 text-right font-bold text-blue-600">
                                {c.pay}
                            </td>
                            <td className="p-4 text-right">
                                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">View</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// 16. Dark Neon Gaming
function DarkNeonGamingStyle() {
    const data = getRandomCampaigns()
    return (
        <div className="bg-[#0f0f13] p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((c, i) => (
                <div key={i} className="bg-[#1a1a20] rounded-2xl p-4 border border-[#333] hover:border-[#bf00ff] hover:shadow-[0_0_15px_rgba(191,0,255,0.3)] transition-all group">
                    <div className="flex gap-4 mb-4">
                        <img src={c.image} className="w-16 h-16 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                        <div>
                            <h3 className="text-white font-bold text-sm mb-1">{c.title}</h3>
                            <div className="text-[#888] text-xs mb-1">{c.brand}</div>
                            <div className="text-[#bf00ff] text-xs font-bold font-mono">{c.pay} KRW</div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {c.platform.map((p, j) => (
                            <div key={j} className="bg-[#2a2a30] text-white text-[10px] px-2 py-1 rounded border border-[#444]">{p}</div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

// 17. Portfolio Match
function PortfolioMatchStyle() {
    const data = getRandomCampaigns()
    return (
        <div className="space-y-4">
            {data.map((c, i) => (
                <div key={i} className="bg-white border-2 border-dashed border-gray-200 p-6 rounded-xl text-center hover:border-black hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <img src={c.brandLogo} className="w-12 h-12 rounded-full object-cover" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{c.brand} & You?</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
                        We are looking for creators with your style for the {c.title} campaign.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-xs font-bold">
                        <span>Match Score: 9{i}%</span>
                        <Star className="w-3 h-3 fill-white" />
                    </div>
                </div>
            ))}
        </div>
    )
}

// 18. Mobile App Swipe List
function MobileAppSwipeList() {
    const data = getRandomCampaigns()
    return (
        <div className="max-w-[320px] mx-auto bg-gray-50 rounded-3xl p-4 border-4 border-gray-900 shadow-2xl h-[500px] overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 bg-white p-4 shadow-sm z-10 text-center font-bold">For You</div>
            <div className="mt-12 space-y-4">
                {data.map((c, i) => (
                    <div key={i} className="bg-white rounded-2xl p-3 shadow-sm">
                        <div className="aspect-video rounded-xl bg-gray-200 mb-3 overflow-hidden">
                            <img src={c.image} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-bold text-sm mb-1">{c.brand}</h3>
                        <div className="text-xs text-gray-500 mb-2 truncate">{c.title}</div>
                        <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
                            <span className="font-bold text-xs">{c.pay}</span>
                            <button className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">+</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 19. Interactive Bento Grid
function InteractiveBentoGrid() {
    const data = getRandomCampaigns().slice(0, 4)
    return (
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[300px]">
            {data.map((c, i) => (
                <div key={i} className={`relative rounded-xl overflow-hidden group cursor-pointer ${i === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'} ${i === 3 ? 'col-span-1 row-span-2' : ''}`}>
                    <img src={c.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 p-3 text-white w-full bg-gradient-to-t from-black/80 to-transparent">
                        <div className="font-bold text-sm truncate">{c.brand}</div>
                        {i === 0 && <div className="text-xs opacity-80">{c.pay}</div>}
                    </div>
                </div>
            ))}
        </div>
    )
}

// 20. Contract Preview
function ContractPreviewStyle() {
    const data = getRandomCampaigns()
    return (
        <div className="bg-gray-100 p-8 flex flex-col gap-4 items-center">
            {data.map((c, i) => (
                <div key={i} className="bg-white p-6 shadow-md w-full max-w-lg relative" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
                    <div className="absolute top-0 right-0 w-10 h-10 bg-gray-100" style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}></div>
                    <div className="text-center border-b-2 border-black pb-4 mb-4">
                        <h3 className="font-serif text-xl font-bold">CAMPAIGN AGREEMENT</h3>
                        <div className="text-xs text-gray-500 mt-1">Ref: {c.id.toUpperCase()}</div>
                    </div>
                    <div className="space-y-3 font-serif text-sm">
                        <p>This agreement is made between <span className="font-bold underline">{c.brand}</span> and <span className="italic text-gray-400">[Creator Name]</span>.</p>
                        <p><strong>Scope:</strong> {c.title}</p>
                        <p><strong>Compensation:</strong> {c.pay} KRW</p>
                        <p><strong>Deadline:</strong> {c.deadline} days from acceptance.</p>
                    </div>
                    <div className="mt-6 pt-4 border-t flex justify-between items-center">
                        <div className="font-script text-2xl text-gray-400">Signature</div>
                        <Button className="font-serif bg-black text-white rounded-none h-8">Review & Sign</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

function XIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    )
}

function CheckIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    )
}
