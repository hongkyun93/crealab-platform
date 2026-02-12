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
    Briefcase, Layout, List, Grid, Monitor, Phone, Edit, Trash2,
    MoreVertical, Share2, Eye, MessageSquare
} from "lucide-react"

// --- Real Mock Data (Creator's Own Plans) ---
const MY_PLAN_DATA = [
    {
        id: "mp1",
        title: "9월 제주도 휴가, 수영복&비치웨어 협찬 찾아요! 🏖️",
        description: "9월 10일부터 4박 5일간 제주도 서귀포 풀빌라로 휴가를 갑니다.",
        targetProduct: "수영복, 로브, 튜브",
        eventDate: "2024.09.10 ~ 09.14",
        postingDate: "2024.09.20 이내",
        status: "모집중",
        category: "여행/레저",
        proposals: 3,
        views: 1250,
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db48e?w=800&q=80"
    },
    {
        id: "mp2",
        title: "아이폰16 언박싱 & 데스크 셋업 영상 기획 중 🖥️",
        description: "이번에 아이폰16 프로 맥스를 구매했습니다. 데스크테리어 소품 브랜드 찾습니다.",
        targetProduct: "충전기, 케이스, 케이블",
        eventDate: "2024.09.25",
        postingDate: "수령 후 3일 이내",
        status: "급구",
        category: "IT/테크",
        proposals: 8,
        views: 3400,
        image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&q=80"
    },
    {
        id: "mp3",
        title: "주말 홈파티! 와인 안주 플레이팅 🍷",
        description: "친한 친구들 4명과 홈파티를 계획 중입니다.",
        targetProduct: "와인안주, 치즈, 식기",
        eventDate: "2024.08.31 (토)",
        postingDate: "2024.09.02 (월)",
        status: "마감임박",
        category: "푸드/요리",
        proposals: 1,
        views: 850,
        image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=800&q=80"
    }
]

const getRandomMyPlan = () => [...MY_PLAN_DATA]

export default function CreatorMyMomentsPage() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        if (!selectedDesign) return <Style1_ManagementCard />

        const Components = [
            Style1_ManagementCard, Style2_CompactRow, Style3_VisualGrid, Style4_StatusFocus, Style5_TimelineEdit,
            Style6_DashboardStats, Style7_FolderArchive, Style8_MobileAppView, Style9_KanbanBoard, Style10_TicketStub,
            Style11_Minimalist, Style12_RichMedia, Style13_SideAction, Style14_CalendarView, Style15_GradientCard,
            Style16_NotebookStyle, Style17_ChatInterface, Style18_Glassmorphism, Style19_TerminalView, Style20_PolaroidStack
        ]

        const SelectedComponent = Components[selectedDesign - 1]
        return SelectedComponent ? <SelectedComponent /> : <Style1_ManagementCard />
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">나의 모먼트 관리 (My Plans)</h1>
                <p className="text-muted-foreground">내가 등록한 향후 계획을 관리하는 20가지 UI 디자인.</p>
            </div>

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
                                    Style1_ManagementCard, Style2_CompactRow, Style3_VisualGrid, Style4_StatusFocus, Style5_TimelineEdit,
                                    Style6_DashboardStats, Style7_FolderArchive, Style8_MobileAppView, Style9_KanbanBoard, Style10_TicketStub,
                                    Style11_Minimalist, Style12_RichMedia, Style13_SideAction, Style14_CalendarView, Style15_GradientCard,
                                    Style16_NotebookStyle, Style17_ChatInterface, Style18_Glassmorphism, Style19_TerminalView, Style20_PolaroidStack
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

// --- 20 Variations (Creator Management Context) ---

// 1. Management Card (Standard)
function Style1_ManagementCard() {
    const data = getRandomMyPlan()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="bg-white border rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                                <img src={p.image} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant={(p.status === "급구" ? "destructive" : "default")}>{p.status}</Badge>
                                    <span className="text-xs text-gray-500">{p.category}</span>
                                </div>
                                <h3 className="font-bold text-lg">{p.title}</h3>
                                <div className="text-sm text-gray-500">{p.eventDate}</div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex gap-4 border-t pt-4">
                        <Button className="flex-1 bg-white border text-black hover:bg-gray-50">
                            <Edit className="w-4 h-4 mr-2" /> 수정
                        </Button>
                        <Button className="flex-1 bg-black text-white hover:bg-gray-800">
                            제안 확인 ({p.proposals})
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 2. Compact Row (List)
function Style2_CompactRow() {
    const data = getRandomMyPlan()
    return (
        <div className="divide-y border rounded-xl bg-white">
            {data.map((p, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center font-bold text-gray-400">
                        {p.eventDate.slice(5, 7)}.{p.eventDate.slice(8, 10)}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm">{p.title}</h4>
                        <div className="text-xs text-gray-500">{p.proposals} proposals received</div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm">View</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 3. Visual Grid
function Style3_VisualGrid() {
    const data = getRandomMyPlan()
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((p, i) => (
                <div key={i} className="border rounded-xl overflow-hidden group">
                    <div className="aspect-video relative">
                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                            {p.status}
                        </div>
                    </div>
                    <div className="p-3">
                        <h3 className="font-bold text-sm mb-2 line-clamp-1">{p.title}</h3>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{p.eventDate}</span>
                            <span className="text-blue-600 font-bold">{p.proposals} offers</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 4. Status Focus
function Style4_StatusFocus() {
    const data = getRandomMyPlan()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="flex border rounded-lg overflow-hidden">
                    <div className={`w-2 ${p.status === "급구" ? "bg-red-500" : "bg-green-500"}`}></div>
                    <div className="p-4 flex-1">
                        <div className="flex justify-between mb-1">
                            <div className="text-xs font-bold text-gray-500 uppercase">Status: {p.status}</div>
                            <div className="text-xs text-gray-400">ID: {p.id.toUpperCase()}</div>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">Target: {p.targetProduct}</span>
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">{p.proposals} Offers</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 5. Timeline Edit
function Style5_TimelineEdit() {
    const data = getRandomMyPlan()
    return (
        <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-6">
            {data.map((p, i) => (
                <div key={i} className="relative pl-6">
                    <div className="absolute top-0 -left-[21px] w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
                        {i + 1}
                    </div>
                    <div className="bg-white border p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-md">{p.title}</h3>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Edit className="w-3 h-3" /></Button>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                            {p.description}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 6. Dashboard Stats
function Style6_DashboardStats() {
    const data = getRandomMyPlan()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
                    <div className="flex-1">
                        <h3 className="font-bold text-sm truncate">{p.title}</h3>
                        <div className="text-xs text-gray-400">{p.eventDate}</div>
                    </div>
                    <div className="flex gap-8 text-center">
                        <div>
                            <div className="text-lg font-bold">{p.views}</div>
                            <div className="text-[10px] text-gray-400 uppercase">Views</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-blue-600">{p.proposals}</div>
                            <div className="text-[10px] text-gray-400 uppercase">Offers</div>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                </div>
            ))}
        </div>
    )
}

// 7. Folder Archive
function Style7_FolderArchive() {
    const data = getRandomMyPlan()
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.map((p, i) => (
                <div key={i} className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg rounded-tr-[20px] relative">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-100 rounded-bl-lg"></div>
                    <h3 className="font-bold text-sm mb-4 mt-2">{p.title}</h3>
                    <div className="flex justify-between items-end">
                        <span className="text-xs text-yellow-700">{p.eventDate}</span>
                        <span className="text-xs font-bold bg-white px-2 py-1 rounded border border-yellow-100">{p.status}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 8. Mobile App View
function Style8_MobileAppView() {
    const data = getRandomMyPlan()
    return (
        <div className="max-w-sm mx-auto bg-gray-50 rounded-3xl p-4 border-4 border-gray-200">
            <div className="text-center font-bold mb-4">My Activity</div>
            <div className="space-y-3">
                {data.map((p, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl shadow-sm flex gap-3">
                        <img src={p.image} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 overflow-hidden">
                            <h4 className="font-bold text-xs truncate">{p.title}</h4>
                            <div className="text-[10px] text-gray-500 mt-1 flex gap-2">
                                <span className="bg-gray-100 px-1 rounded">{p.proposals} Offers</span>
                                <span>{p.status}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 9. Kanban Board
function Style9_KanbanBoard() {
    const data = getRandomMyPlan()
    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            <div className="min-w-[250px] bg-gray-100 p-3 rounded-lg">
                <div className="font-bold text-xs uppercase text-gray-500 mb-3 ml-1">Drafting</div>
                <div className="bg-white p-3 rounded shadow-sm text-sm text-gray-400 border border-dashed text-center py-8">
                    + New Plan
                </div>
            </div>
            <div className="min-w-[250px] bg-gray-100 p-3 rounded-lg">
                <div className="font-bold text-xs uppercase text-gray-500 mb-3 ml-1">Active ({data.length})</div>
                <div className="space-y-2">
                    {data.map((p, i) => (
                        <div key={i} className="bg-white p-3 rounded shadow-sm border cursor-move hover:shadow-md transition-shadow">
                            <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded mb-1 inline-block">{p.status}</span>
                            <h4 className="font-bold text-xs mb-2">{p.title}</h4>
                            <div className="flex justify-between items-center text-[10px] text-gray-400">
                                <span>{p.eventDate}</span>
                                <div className="flex -space-x-1">
                                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                    <div className="w-4 h-4 rounded-full bg-red-400"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// 10. Ticket Stub
function Style10_TicketStub() {
    const data = getRandomMyPlan()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="flex border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
                    <div className="flex-1 p-2 border-r-2 border-dashed border-gray-300 relative">
                        <div className="absolute -top-3 -right-[9px] w-4 h-4 bg-white border-b-2 border-l-2 border-r-2 border-gray-300 rounded-full"></div>
                        <div className="absolute -bottom-3 -right-[9px] w-4 h-4 bg-white border-t-2 border-l-2 border-r-2 border-gray-300 rounded-full"></div>
                        <h3 className="font-bold text-md">{p.title}</h3>
                        <p className="text-xs text-gray-500">{p.eventDate}</p>
                    </div>
                    <div className="w-24 flex flex-col items-center justify-center p-2 text-center">
                        <div className="text-2xl font-bold">{p.proposals}</div>
                        <div className="text-[10px] uppercase">Offers</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 11. Minimalist
function Style11_Minimalist() {
    const data = getRandomMyPlan()
    return (
        <div className="space-y-6">
            {data.map((p, i) => (
                <div key={i} className="group">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="font-bold text-xl group-hover:text-blue-600 transition-colors cursor-pointer">{p.title}</h3>
                        <span className="font-mono text-sm">{p.eventDate}</span>
                    </div>
                    <div className="h-px bg-gray-200 w-full group-hover:bg-blue-600 transition-colors"></div>
                    <div className="flex justify-between mt-2 text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>{p.targetProduct}</span>
                        <span className="underline cursor-pointer">Edit Details</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 12. Rich Media
function Style12_RichMedia() {
    const data = getRandomMyPlan()
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((p, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                        <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                        <div className="flex gap-3">
                            <Button size="sm" className="bg-white text-black hover:bg-gray-200 h-8 text-xs font-bold">Edit Plan</Button>
                            <Button size="sm" variant="outline" className="text-white border-white hover:bg-white/20 h-8 text-xs">{p.proposals} Offers</Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 13. Side Action
function Style13_SideAction() {
    const data = getRandomMyPlan()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="flex border rounded-lg overflow-hidden h-24">
                    <div className="flex-1 p-4 flex flex-col justify-center bg-white">
                        <h3 className="font-bold text-sm truncate">{p.title}</h3>
                        <div className="text-xs text-gray-500">{p.eventDate}</div>
                    </div>
                    <div className="w-16 bg-blue-50 flex flex-col items-center justify-center border-l text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors">
                        <span className="font-bold text-lg">{p.proposals}</span>
                        <span className="text-[10px]">Offers</span>
                    </div>
                    <div className="w-12 bg-gray-50 flex items-center justify-center border-l hover:bg-gray-100 cursor-pointer">
                        <Edit className="w-4 h-4 text-gray-500" />
                    </div>
                </div>
            ))}
        </div>
    )
}

// 14. Calendar View
function Style14_CalendarView() {
    const data = getRandomMyPlan()
    return (
        <div className="border rounded-xl p-4">
            <div className="grid grid-cols-7 gap-1 mb-4 text-center text-xs font-bold text-gray-400">
                <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-sm bg-gray-50 p-2 rounded-lg">
                {[...Array(30)].map((_, d) => (
                    <div key={d} className={`aspect-square flex items-center justify-center rounded ${d === 13 || d === 24 ? 'bg-blue-100 text-blue-700 font-bold border border-blue-200 cursor-pointer' : 'text-gray-400'}`}>
                        {d + 1}
                    </div>
                ))}
            </div>
            <div className="mt-4 space-y-2">
                {data.slice(0, 1).map((p, i) => (
                    <div key={i} className="flex gap-2 items-center text-xs">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="flex-1 truncate">{p.title}</span>
                        <span className="font-bold">{p.eventDate.slice(5)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 15. Gradient Card
function Style15_GradientCard() {
    const data = getRandomMyPlan()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-1">
                    <div className="bg-white rounded-lg p-4 h-full">
                        <h3 className="font-bold text-md mb-2">{p.title}</h3>
                        <div className="flex justify-between items-center">
                            <Badge variant="outline">{p.category}</Badge>
                            <span className="text-indigo-600 font-bold text-sm cursor-pointer hover:underline">Manage Plan &rarr;</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 16. Notebook Style
function Style16_NotebookStyle() {
    const data = getRandomMyPlan()
    return (
        <div className="space-y-4 bg-[#f0f0f0] p-4 rounded-xl">
            {data.map((p, i) => (
                <div key={i} className="bg-white p-4 shadow-sm border-b border-gray-200 bg-[linear-gradient(to_bottom,transparent_23px,#e5e5e5_24px)] bg-[size:100%_24px] leading-[24px]">
                    <h3 className="font-bold text-lg font-handwriting">{p.title}</h3>
                    <p className="font-handwriting text-gray-600">- {p.description}</p>
                    <div className="text-right font-handwriting text-red-400 text-sm mt-2">Due: {p.postingDate}</div>
                </div>
            ))}
        </div>
    )
}

// 17. Chat Interface
function Style17_ChatInterface() {
    const data = getRandomMyPlan()
    return (
        <div className="space-y-6 max-w-md mx-auto">
            {data.map((p, i) => (
                <div key={i} className="flex flex-col items-end">
                    <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-tr-sm text-sm mb-1 shadow-sm max-w-[90%]">
                        <div className="font-bold mb-1 border-b border-blue-400 pb-1">My Plan: {p.title}</div>
                        {p.description}
                    </div>
                    <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{p.proposals} brands replied</div>
                </div>
            ))}
        </div>
    )
}

// 18. Glassmorphism
function Style18_Glassmorphism() {
    const data = getRandomMyPlan()
    return (
        <div className="bg-gradient-to-br from-pink-400 to-orange-400 p-6 rounded-2xl flex flex-col gap-4">
            {data.map((p, i) => (
                <div key={i} className="bg-white/25 backdrop-blur-md border border-white/40 p-4 rounded-xl text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg leading-tight w-[70%]">{p.title}</h3>
                        <div className="bg-black/20 px-2 py-1 rounded text-xs backdrop-blur-sm">{p.status}</div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Button size="sm" className="bg-white text-orange-500 hover:bg-gray-50 border-0 h-8 text-xs font-bold">Edit</Button>
                        <Button size="sm" variant="outline" className="text-white border-white hover:bg-white/20 h-8 text-xs">Delete</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 19. Terminal View
function Style19_TerminalView() {
    const data = getRandomMyPlan()
    return (
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 border border-gray-700 shadow-2xl">
            <div className="flex gap-1.5 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            {data.map((p, i) => (
                <div key={i} className="mb-4">
                    <span className="text-blue-400">user@crealab</span>:<span className="text-white">~/plans</span>$ cat plan_{i + 1}.json
                    <div className="pl-2 border-l border-gray-700 mt-1 opacity-80">
                        <div>{"{"}</div>
                        <div className="pl-2">"title": "{p.title}",</div>
                        <div className="pl-2">"status": "{p.status}",</div>
                        <div className="pl-2">"offers": {p.proposals}</div>
                        <div>{"}"}</div>
                    </div>
                </div>
            ))}
            <span className="animate-pulse">_</span>
        </div>
    )
}

// 20. Polaroid Stack
function Style20_PolaroidStack() {
    const data = getRandomMyPlan()
    return (
        <div className="relative h-[300px] flex items-center justify-center">
            {data.map((p, i) => (
                <div key={i} className="absolute w-60 bg-white p-3 pb-10 shadow-xl border" style={{
                    transform: `rotate(${i * 5 - 5}deg) translateX(${i * 20 - 20}px)`,
                    zIndex: i
                }}>
                    <div className="aspect-square bg-gray-100 overflow-hidden mb-2 grayscale hover:grayscale-0 transition-all cursor-pointer">
                        <img src={p.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="font-handwriting text-center text-sm truncate px-1">{p.title}</div>
                </div>
            ))}
        </div>
    )
}
