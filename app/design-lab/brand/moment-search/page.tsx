"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Calendar, MapPin, Gift, Clock, CreditCard, ChevronRight,
    Star, Users, TrendingUp, CheckCircle2, AlertCircle, FileText,
    Camera, Video, Instagram, Youtube, Hash, ExternalLink,
    Briefcase, Layout, List, Grid, Monitor, Phone, Filter
} from "lucide-react"
import Link from "next/link"

// --- Real Mock Data (Plan/Proposal Context) ---
const MOMENT_PLAN_DATA = [
    {
        id: "p1",
        creator: "여행하는 소니",
        handle: "sony_travel",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
        rating: 4.9,
        followers: "125k",
        title: "9월 제주도 휴가, 수영복&비치웨어 협찬 찾아요! 🏖️",
        description: "9월 10일부터 4박 5일간 제주도 서귀포 풀빌라로 휴가를 갑니다. 야외 수영장이 예쁜 곳이라 수영복이나 비치웨어, 튜브 등 감성적인 제품 사진/영상 예쁘게 담아드릴 수 있어요.",
        targetProduct: "수영복, 로브, 튜브, 선글라스",
        eventDate: "2024.09.10 ~ 09.14",
        postingDate: "2024.09.20 이내 업로드",
        guide: "릴스 1건 + 피드 2건 (제품 착용샷 필수, 태그 5개 포함)",
        category: "여행/레저",
        location: "제주도 서귀포",
        tags: ["제주오션뷰", "풀빌라", "여름휴가", "바캉스룩"],
        images: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db48e?w=800&q=80"],
        status: "모집중"
    },
    {
        id: "p2",
        creator: "테크몽키",
        handle: "tech_monkey",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80",
        rating: 4.8,
        followers: "82k",
        title: "아이폰16 언박싱 & 데스크 셋업 영상 기획 중 🖥️",
        description: "이번에 아이폰16 프로 맥스를 구매했습니다. 언박싱 영상 찍으면서 같이 노출될 수 있는 맥세이프 충전기나 케이스, 데스크테리어 소품 브랜드 찾습니다.",
        targetProduct: "맥세이프 충전기, 케이스, 케이블",
        eventDate: "2024.09.25 (배송 완료 시)",
        postingDate: "제품 수령 후 5일 이내",
        guide: "유튜브 쇼츠 1건 + 인스타 스토리 하이라이트 박제",
        category: "IT/테크",
        location: "Home Studio",
        tags: ["아이폰16", "데스크셋업", "얼리어답터", "테크리뷰"],
        images: ["https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&q=80"],
        status: "급구"
    },
    {
        id: "p3",
        creator: "홈쿡 혜진",
        handle: "hyejin_cook",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
        rating: 5.0,
        followers: "210k",
        title: "주말 홈파티! 와인 안주 플레이팅 🍷",
        description: "친한 친구들 4명과 홈파티를 계획 중입니다. 와인과 잘 어울리는 치즈, 샤퀴테리, 혹은 예쁜 접시나 와인잔 협찬해주시면 감성적인 플레이팅 컷 찍어드려요.",
        targetProduct: "와인안주, 치즈, 식기, 커트러리",
        eventDate: "2024.08.31 (토)",
        postingDate: "2024.09.02 (월)",
        guide: "피드 1건 (제품 근접샷 2장 이상 포함)",
        category: "푸드/요리",
        location: "서울 마포구",
        tags: ["홈파티", "와인안주", "플레이팅", "온더테이블"],
        images: ["https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=800&q=80"],
        status: "마감임박"
    },
    {
        id: "p4",
        creator: "캠핑러 박씨",
        handle: "camp_park",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
        rating: 4.7,
        followers: "45k",
        title: "가을 차박 캠핑 준비, 감성 랜턴/담요 🔥",
        description: "날씨가 선선해져서 강원도로 차박을 떠납니다. 저녁 불멍 타임에 사용할 감성 랜턴이나 쌀쌀할 때 덮을 블랭킷 제품 찾고 있습니다.",
        targetProduct: "캠핑랜턴, 블랭킷, 캠핑의자, 밀키트",
        eventDate: "2024.10.03 ~ 10.05",
        postingDate: "다녀온 후 3일 이내",
        guide: "유튜브 브이로그 노출 (3분 이상) + 인스타 피드 1건",
        category: "캠핑/아웃도어",
        location: "강원도 평창",
        tags: ["차박", "캠핑용품", "가을캠핑", "불멍"],
        images: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80"],
        status: "모집중"
    }
]

const getRandomPlan = () => [...MOMENT_PLAN_DATA].slice(0, 3)

export default function MomentSearchPage() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        if (!selectedDesign) return <Style1_StandardProposal />

        const Components = [
            Style1_StandardProposal, Style2_CalendarFocus, Style3_KanbanCard, Style4_RichGuide, Style5_MinimalRow,
            Style6_TicketPass, Style7_ProductSpotlight, Style8_BudgetLayout, Style9_TimelineFlow, Style10_MagazinePlan,
            Style11_GradientDark, Style12_CompactGrid, Style13_SideBorder, Style14_TagsFirst, Style15_AvatarFocus,
            Style16_StickyNote, Style17_FolderTab, Style18_Glassmorphism, Style19_ChatRequest, Style20_DashboardWidget
        ]

        const SelectedComponent = Components[selectedDesign - 1]
        return SelectedComponent ? <SelectedComponent /> : <Style1_StandardProposal />
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">모먼트 검색 (Proposals)</h1>
                <p className="text-muted-foreground">크리에이터들의 향후 계획과 협업 제안(Moment)을 보여주는 20가지 카드 디자인.</p>
                <div className="flex gap-2 pt-2">
                    <Link href="/design-lab/brand/moment-search/dialog">
                        <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 hover:opacity-90 shadow-md">
                            View 20 Detailed Dialog Variations <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center justify-between pb-4">
                <div className="flex gap-2 items-center overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    <Button variant="outline" className="rounded-full h-9 text-sm border-dashed">
                        <Filter className="w-4 h-4 mr-2" /> 필터
                    </Button>
                    <div className="h-6 w-px bg-gray-300 mx-2"></div>
                    <Button variant="outline" className="rounded-full h-9 text-sm bg-white hover:bg-gray-50 text-gray-700">
                        팔로워 수 <ChevronRight className="w-3 h-3 ml-1 rotate-90 text-gray-400" />
                    </Button>
                    <Button variant="outline" className="rounded-full h-9 text-sm bg-white hover:bg-gray-50 text-gray-700">
                        상태 (모집중) <ChevronRight className="w-3 h-3 ml-1 rotate-90 text-gray-400" />
                    </Button>
                    <Button variant="outline" className="rounded-full h-9 text-sm bg-white hover:bg-gray-50 text-gray-700">
                        예상 비용 <ChevronRight className="w-3 h-3 ml-1 rotate-90 text-gray-400" />
                    </Button>
                    <Button variant="outline" className="rounded-full h-9 text-sm bg-white hover:bg-gray-50 text-gray-700">
                        카테고리 <ChevronRight className="w-3 h-3 ml-1 rotate-90 text-gray-400" />
                    </Button>
                </div>
                <div className="flex items-center text-sm text-gray-500 font-medium">
                    <span className="text-black font-bold mr-1">1,240</span> 개의 모먼트
                </div>
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
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDesign(null)}>Reset</Button>
                    )}
                </div>
                <div className="bg-gray-50/50 p-6 rounded-2xl border min-h-[400px]">
                    {renderPreview()}
                </div>
            </div>

            <div className="border-t my-8" />

            <h3 className="font-bold text-xl mb-6">All 20 Design Variations</h3>
            <div className="grid grid-cols-1 gap-12">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h4 className="font-bold text-lg text-gray-800">Variation #{i + 1}</h4>
                            <Button size="sm" variant="outline" onClick={() => handleSelect(i + 1)}>Preview</Button>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl overflow-hidden">
                            {(() => {
                                const Components = [
                                    Style1_StandardProposal, Style2_CalendarFocus, Style3_KanbanCard, Style4_RichGuide, Style5_MinimalRow,
                                    Style6_TicketPass, Style7_ProductSpotlight, Style8_BudgetLayout, Style9_TimelineFlow, Style10_MagazinePlan,
                                    Style11_GradientDark, Style12_CompactGrid, Style13_SideBorder, Style14_TagsFirst, Style15_AvatarFocus,
                                    Style16_StickyNote, Style17_FolderTab, Style18_Glassmorphism, Style19_ChatRequest, Style20_DashboardWidget
                                ]
                                const Component = Components[i]
                                return Component ? <Component /> : null
                            })()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 1. Standard Proposal Card (Clean, Information Heavy)
function Style1_StandardProposal() {
    const data = getRandomPlan()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <Avatar><AvatarImage src={p.avatar} /><AvatarFallback>{p.creator[0]}</AvatarFallback></Avatar>
                            <div>
                                <div className="font-bold text-sm">{p.creator}</div>
                                <div className="text-xs text-gray-500">@{p.handle} • ⭐ {p.rating}</div>
                            </div>
                        </div>
                        <Badge variant="outline" className={p.status === "급구" ? "text-red-500 border-red-200 bg-red-50" : "text-blue-500 bg-blue-50 border-blue-200"}>
                            {p.status}
                        </Badge>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{p.description}</p>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500 flex items-center gap-1"><Gift className="w-3 h-3" /> 필요 제품</span>
                            <span className="font-medium text-gray-900">{p.targetProduct}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> 일정</span>
                            <span className="font-medium text-gray-900">{p.eventDate}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 2. Calendar Focus (Empahsizing Dates)
function Style2_CalendarFocus() {
    const data = getRandomPlan()
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((p, i) => (
                <div key={i} className="bg-white border rounded-2xl overflow-hidden flex flex-col">
                    <div className="bg-indigo-600 p-4 text-white text-center">
                        <div className="text-xs opacity-80 uppercase tracking-widest mb-1">EVENT DATE</div>
                        <div className="font-bold text-xl">{p.eventDate.split('~')[0]}</div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                        <div className="uppercase text-xs font-bold text-indigo-600 mb-2">{p.category}</div>
                        <h3 className="font-bold text-base mb-2 flex-1">{p.title}</h3>
                        <div className="text-xs text-gray-500 mb-4">
                            <span className="font-bold text-gray-700">TO DO:</span> {p.guide}
                        </div>
                        <div className="mt-auto flex items-center gap-2 pt-3 border-t">
                            <Avatar className="w-6 h-6"><AvatarImage src={p.avatar} /></Avatar>
                            <span className="text-xs font-medium">{p.creator}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 3. Kanban Card (Process Oriented)
function Style3_KanbanCard() {
    const data = getRandomPlan()
    return (
        <div className="space-y-3 bg-gray-100 p-4 rounded-xl">
            {data.map((p, i) => (
                <div key={i} className="bg-white p-3 rounded shadow-sm border-l-4 border-l-green-500">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-400">#{p.category}</span>
                        <MoreHorizontalIcon />
                    </div>
                    <div className="font-bold text-sm mb-2">{p.title}</div>
                    <div className="flex gap-2 flex-wrap mb-3">
                        <Badge variant="secondary" className="text-[10px] h-5">📷 {p.targetProduct.split(',')[0]}</Badge>
                        <Badge variant="secondary" className="text-[10px] h-5">📅 {p.postingDate.slice(5, 10)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex -space-x-2">
                            <Avatar className="w-6 h-6 border-2 border-white"><AvatarImage src={p.avatar} /></Avatar>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1"><MessageCircleIcon className="w-3 h-3" /> 2</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 4. Rich Guide (Detailed Requirements)
function Style4_RichGuide() {
    const data = getRandomPlan()
    return (
        <div className="space-y-5">
            {data.map((p, i) => (
                <div key={i} className="border rounded-lg p-5 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                    <div className="ml-2">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{p.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{p.eventDate} • {p.location}</p>

                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                            <h4 className="font-bold text-xs text-orange-800 uppercase mb-2">Creator's Proposal</h4>
                            <ul className="text-sm space-y-1 text-gray-700">
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" /> Target: {p.targetProduct}</li>
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" /> Deliverables: {p.guide}</li>
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" /> Upload: {p.postingDate}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 5. Minimal Row (List View)
function Style5_MinimalRow() {
    const data = getRandomPlan()
    return (
        <div className="divide-y border rounded-lg">
            {data.map((p, i) => (
                <div key={i} className="p-4 flex gap-4 items-center hover:bg-gray-50 cursor-pointer">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{p.eventDate.slice(5, 8)}</span>
                        <span className="text-lg font-bold leading-none">{p.eventDate.slice(8, 10)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{p.title}</h4>
                        <p className="text-xs text-gray-500 truncate">{p.targetProduct} | {p.creator}</p>
                    </div>
                    <div className="flex gap-2 hidden md:flex">
                        {p.tags.slice(0, 2).map((t, j) => <Badge key={j} variant="outline" className="text-[10px]">{t}</Badge>)}
                    </div>
                    <Button size="sm" variant="ghost"><ChevronRight className="w-4 h-4" /></Button>
                </div>
            ))}
        </div>
    )
}

// 6. Ticket Pass Style
function Style6_TicketPass() {
    const data = getRandomPlan()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="flex rounded-lg overflow-hidden border shadow-sm">
                    <div className="bg-black text-white p-4 flex flex-col items-center justify-center w-24 border-r border-dashed border-gray-600 relative">
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full"></div>
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white rounded-full"></div>
                        <span className="text-2xl font-black rotate-90 whitespace-nowrap opacity-20 absolute">MOMENT</span>
                        <Briefcase className="w-6 h-6 mb-2" />
                        <span className="text-xs font-bold text-center">{p.category}</span>
                    </div>
                    <div className="bg-white p-4 flex-1">
                        <div className="flex justify-between mb-2">
                            <span className="text-xs font-bold text-gray-400">BOARDING PASS TO COLLAB</span>
                            <span className="text-xs font-bold text-black">{p.eventDate}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{p.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{p.description.substring(0, 50)}...</p>
                        <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5"><AvatarImage src={p.avatar} /></Avatar>
                            <span className="text-xs font-bold">{p.creator}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 7. Product Spotlight
function Style7_ProductSpotlight() {
    const data = getRandomPlan()
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((p, i) => (
                <div key={i} className="bg-white border rounded-xl p-4">
                    <div className="flex gap-4">
                        <div className="w-1/3 aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            <Gift className="w-8 h-8 opacity-20" />
                        </div>
                        <div className="flex-1">
                            <span className="text-xs font-bold text-purple-600 uppercase mb-1 block">Wanted Product</span>
                            <h3 className="font-bold text-md mb-2 leading-tight">{p.targetProduct}</h3>
                            <p className="text-xs text-gray-500 mb-2">for {p.title}</p>
                            <Button size="sm" className="w-full h-8 text-xs bg-purple-600 hover:bg-purple-700">제안하기</Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 8. Budget Focused (Simple)
function Style8_BudgetLayout() {
    const data = getRandomPlan()
    return (
        <div className="space-y-3">
            {data.map((p, i) => (
                <div key={i} className="border border-green-100 bg-green-50/30 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-sm text-green-900">{p.title}</h3>
                        <div className="text-xs text-green-700 mt-1">{p.targetProduct} • {p.eventDate}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-500 uppercase">Est. Value</div>
                        <div className="font-bold text-sm">협의가능</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 9. Timeline Flow
function Style9_TimelineFlow() {
    const data = getRandomPlan()
    return (
        <div className="space-y-8 pl-4 border-l-2 border-gray-200 ml-4">
            {data.map((p, i) => (
                <div key={i} className="relative pl-6">
                    <div className="absolute top-0 -left-[25px] w-4 h-4 rounded-full bg-white border-4 border-blue-500"></div>
                    <div className="text-xs font-bold text-blue-500 mb-1">{p.eventDate}</div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-bold mb-2">{p.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>📍 {p.location}</span>
                            <span>📦 {p.targetProduct}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 10. Magazine Plan
function Style10_MagazinePlan() {
    const data = getRandomPlan()
    return (
        <div className="grid grid-cols-1 gap-6">
            {data.map((p, i) => (
                <div key={i} className="relative aspect-[21/9] rounded-xl overflow-hidden group cursor-pointer">
                    <img src={p.images[0]} className="w-full h-full object-cover brightness-50 group-hover:brightness-40 transition-all" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                        <div className="uppercase tracking-widest text-xs font-bold mb-2 opacity-70">{p.category} PROJECT</div>
                        <h3 className="text-2xl font-bold mb-2">{p.title}</h3>
                        <div className="flex gap-4 text-sm font-medium">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {p.eventDate}</span>
                            <span className="flex items-center gap-1"><Camera className="w-4 h-4" /> {p.guide}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 11. Gradient Dark (Modern)
function Style11_GradientDark() {
    const data = getRandomPlan()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="bg-gray-900 text-white p-5 rounded-2xl flex items-center gap-4">
                    <div className="bg-gray-800 p-3 rounded-xl shrink-0">
                        <Calendar className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-md mb-1">{p.title}</h3>
                        <p className="text-xs text-gray-400">{p.description}</p>
                    </div>
                    <Button size="icon" className="rounded-full bg-purple-600 hover:bg-purple-500"><ChevronRight className="w-4 h-4" /></Button>
                </div>
            ))}
        </div>
    )
}

// 12. Compact Grid
function Style12_CompactGrid() {
    const data = getRandomPlan()
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.map((p, i) => (
                <div key={i} className="bg-white border p-3 rounded-lg flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-xs font-bold text-gray-500">{p.status}</span>
                    </div>
                    <h3 className="font-bold text-xs mb-2 line-clamp-2">{p.title}</h3>
                    <div className="mt-auto pt-2 border-t text-[10px] text-gray-400">
                        {p.creator}
                    </div>
                </div>
            ))}
        </div>
    )
}

// 13. Side Border
function Style13_SideBorder() {
    const data = getRandomPlan()
    return (
        <div className="space-y-3">
            {data.map((p, i) => (
                <div key={i} className="bg-white pl-4 border-l-4 border-indigo-500 shadow-sm py-4 pr-4 rounded-r-lg">
                    <h3 className="font-bold text-sm">{p.title}</h3>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>{p.targetProduct}</span>
                        <span>{p.postingDate}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 14. Tags First
function Style14_TagsFirst() {
    const data = getRandomPlan()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="border-b pb-4 last:border-0">
                    <div className="flex gap-2 mb-2">
                        {p.tags.map((t, j) => <span key={j} className="text-xs font-bold text-blue-600">#{t}</span>)}
                    </div>
                    <h3 className="font-bold text-lg mb-1">{p.title}</h3>
                    <p className="text-sm text-gray-600">{p.eventDate}에 예정된 계획입니다.</p>
                </div>
            ))}
        </div>
    )
}

// 15. Avatar Focus
function Style15_AvatarFocus() {
    const data = getRandomPlan()
    return (
        <div className="flex justify-center gap-6">
            {data.map((p, i) => (
                <div key={i} className="flex flex-col items-center w-32 text-center group cursor-pointer">
                    <div className="w-20 h-20 rounded-full p-1 border-2 border-dashed border-gray-300 group-hover:border-solid group-hover:border-blue-500 transition-all mb-2">
                        <Avatar className="w-full h-full"><AvatarImage src={p.avatar} /></Avatar>
                    </div>
                    <h3 className="font-bold text-xs line-clamp-2 group-hover:text-blue-600">{p.title}</h3>
                    <div className="text-[10px] text-gray-400 mt-1">{p.creator}</div>
                </div>
            ))}
        </div>
    )
}

// 16. Sticky Note
function Style16_StickyNote() {
    const data = getRandomPlan()
    return (
        <div className="flex flex-wrap gap-4 p-4 bg-wood-pattern">
            {data.map((p, i) => (
                <div key={i} className="bg-yellow-100 p-4 w-60 shadow-lg rotate-1 hover:rotate-0 transition-transform font-handwriting min-h-[160px] flex flex-col">
                    <div className="font-bold text-sm mb-2 border-b border-yellow-200 pb-1">{p.eventDate}</div>
                    <div className="flex-1 text-sm leading-snug">{p.title}</div>
                    <div className="text-xs text-gray-500 mt-2 text-right">- {p.creator}</div>
                </div>
            ))}
        </div>
    )
}

// 17. Folder Tab
function Style17_FolderTab() {
    const data = getRandomPlan()
    return (
        <div className="space-y-[-10px]">
            {data.map((p, i) => (
                <div key={i} className="bg-white border rounded-t-lg p-4 shadow-sm relative hover:-translate-y-2 transition-transform cursor-pointer">
                    <div className="flex justify-between items-center">
                        <div className="font-bold text-sm">📁 {p.title}</div>
                        <Badge variant="secondary" className="text-[10px]">{p.status}</Badge>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 18. Glassmorphism
function Style18_Glassmorphism() {
    const data = getRandomPlan()
    return (
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-6 rounded-xl space-y-4">
            {data.map((p, i) => (
                <div key={i} className="bg-white/20 backdrop-blur border border-white/30 p-4 rounded-xl text-white">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold text-sm opacity-90">{p.creator}</span>
                        <span className="text-xs opacity-70">{p.eventDate}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                    <div className="flex gap-2 text-xs">
                        <span className="bg-white/20 px-2 py-1 rounded">Target: {p.targetProduct}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 19. Chat Request
function Style19_ChatRequest() {
    const data = getRandomPlan()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="flex gap-3">
                    <Avatar><AvatarImage src={p.avatar} /></Avatar>
                    <div className="bg-white border rounded-2xl rounded-tl-none p-4 shadow-sm max-w-md">
                        <p className="text-sm font-bold text-gray-900 mb-1">{p.title}</p>
                        <p className="text-sm text-gray-600 mb-3">{p.description}</p>
                        <Button size="sm" variant="outline" className="w-full text-xs">자세히 보기</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 20. Dashboard Widget
function Style20_DashboardWidget() {
    const data = getRandomPlan()
    return (
        <div className="grid grid-cols-1 gap-4">
            {data.map((p, i) => (
                <div key={i} className="bg-white border p-4 rounded bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded border shadow-sm"><Layout className="w-5 h-5 text-gray-500" /></div>
                        <div>
                            <div className="font-bold text-sm">{p.title}</div>
                            <div className="text-xs text-gray-500">Created by {p.creator}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-lg">{p.rating}</div>
                        <div className="text-[10px] text-gray-400">Score</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// Helpers
function MoreHorizontalIcon() { return <div className="flex gap-0.5"><div className="w-1 h-1 bg-gray-400 rounded-full"></div><div className="w-1 h-1 bg-gray-400 rounded-full"></div><div className="w-1 h-1 bg-gray-400 rounded-full"></div></div> }
function MessageCircleIcon({ className }: { className?: string }) { return <span className={className}>💬</span> }
