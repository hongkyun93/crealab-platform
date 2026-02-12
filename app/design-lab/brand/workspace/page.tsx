"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
    MessageSquare, FileText, CheckCircle2, Clock, MoreHorizontal,
    Calendar, AlertCircle, Paperclip, ChevronRight, User,
    Briefcase, FolderOpen, Flag, Layout, Zap, Hash
} from "lucide-react"

// --- Rich Realistic Mock Data (Workspace/Project Context) ---
const PROJECT_DATA_POOL = [
    {
        id: "ws1",
        campaign: "그랜드 조선 호텔 2박 3일 숙박권 체험단",
        creator: "여행하는 소니",
        handle: "sony_travel",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
        status: "Draft Review",
        step: 3, // 1: Contract, 2: Product, 3: Draft, 4: Final, 5: Complete
        total_steps: 5,
        last_message: "초안 보냈습니다! 확인 부탁드려요 :) 사진 톤앤매너 수정했습니다.",
        last_updated: "2시간 전",
        deadline: "2024.08.20",
        startDate: "2024.08.01",
        contract_amount: "300,000",
        deliverables: ["Instagram Feed x1", "Story x2"],
        priority: "High"
    },
    {
        id: "ws2",
        campaign: "24SS 신상! 퓨처리스틱 러닝화 리뷰어 모집",
        creator: "테크몽키",
        handle: "tech_monkey",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        status: "Product Shipping",
        step: 2,
        total_steps: 5,
        last_message: "송장 번호 입력 완료했습니다. 배송 조회 부탁드립니다.",
        last_updated: "1일 전",
        deadline: "2024.08.25",
        startDate: "2024.08.05",
        contract_amount: "150,000",
        deliverables: ["YouTube Short x1"],
        priority: "Medium"
    },
    {
        id: "ws3",
        campaign: "성수동 핫플 '카페 레이어드' 디저트 세트 체험",
        creator: "데일리 제니",
        handle: "daily_jenny",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
        status: "Completed",
        step: 5,
        total_steps: 5,
        last_message: "수고하셨습니다! 결과 보고서 확인해주세요. 다음에도 잘 부탁드려요!",
        last_updated: "3일 전",
        deadline: "2024.08.10",
        startDate: "2024.07.20",
        contract_amount: "50,000 + Product",
        deliverables: ["Blog Review x1"],
        priority: "Low"
    },
    {
        id: "ws4",
        campaign: "유기농 비건 스킨케어 3종 세트",
        creator: "뷰티 멘토 리사",
        handle: "lisa_beauty",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
        image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80",
        status: "Contract Signing",
        step: 1,
        total_steps: 5,
        last_message: "전자계약서 서명 완료했습니다. 제품 발송 일정 알려주세요.",
        last_updated: "방금 전",
        deadline: "2024.09.01",
        startDate: "2024.08.15",
        contract_amount: "500,000",
        deliverables: ["Instagram Reel x1", "Feed x1"],
        priority: "High"
    },
    {
        id: "ws5",
        campaign: "게이밍 기계식 키보드 K7 PRO",
        creator: "GameZone",
        handle: "game_zone_kr",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80",
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
        status: "Final Review",
        step: 4,
        total_steps: 5,
        last_message: "피드백 반영하여 영상 수정본 업로드했습니다. 확인 부탁드립니다.",
        last_updated: "5시간 전",
        deadline: "2024.08.18",
        startDate: "2024.07.25",
        contract_amount: "1,200,000",
        deliverables: ["YouTube Review x1"],
        priority: "Critical"
    }
]

// Helper to get 3-4 random items
const getRandomProjects = () => [...PROJECT_DATA_POOL].slice(0, 3)

export default function WorkspaceArchivePage() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        if (!selectedDesign) return <ClassicKanbanCard />

        switch (selectedDesign) {
            case 1: return <ClassicKanbanCard />;
            case 2: return <TimelineRowStyle />;
            case 3: return <ChatInterfaceStyle />;
            case 4: return <CompactStatusLine />;
            case 5: return <DetailedFolderStyle />;
            case 6: return <CalendarEventStyle />;
            case 7: return <VisualGridStyle />;
            case 8: return <InvoiceContractStyle />;
            case 9: return <MinimalistBadgeStyle />;
            case 10: return <AlertFocusStyle />;
            case 11: return <GanttChartRow />;
            case 12: return <MobileAppCardStyle />;
            case 13: return <GithubIssueStyle />;
            case 14: return <BoardingPassStyle />;
            case 15: return <FileTabStyle />;
            case 16: return <StickyNoteStyle />;
            case 17: return <StatDashboardRow />;
            case 18: return <ProcessStepsStyle />;
            case 19: return <UserProfileCardStyle />;
            case 20: return <GlassOverlayStyle />;
            default: return <ClassicKanbanCard />;
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">워크스페이스 디자인 랩</h1>
                <p className="text-muted-foreground">협업 프로젝트 관리를 위한 20가지 다양한 카드 디자인을 확인해보세요.</p>
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
                                    case 1: return <ClassicKanbanCard />;
                                    case 2: return <TimelineRowStyle />;
                                    case 3: return <ChatInterfaceStyle />;
                                    case 4: return <CompactStatusLine />;
                                    case 5: return <DetailedFolderStyle />;
                                    case 6: return <CalendarEventStyle />;
                                    case 7: return <VisualGridStyle />;
                                    case 8: return <InvoiceContractStyle />;
                                    case 9: return <MinimalistBadgeStyle />;
                                    case 10: return <AlertFocusStyle />;
                                    case 11: return <GanttChartRow />;
                                    case 12: return <MobileAppCardStyle />;
                                    case 13: return <GithubIssueStyle />;
                                    case 14: return <BoardingPassStyle />;
                                    case 15: return <FileTabStyle />;
                                    case 16: return <StickyNoteStyle />;
                                    case 17: return <StatDashboardRow />;
                                    case 18: return <ProcessStepsStyle />;
                                    case 19: return <UserProfileCardStyle />;
                                    case 20: return <GlassOverlayStyle />;
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

// 1. Classic Kanban Card
function ClassicKanbanCard() {
    const data = getRandomProjects()
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.map((p, i) => (
                <Card key={i} className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary" className="text-[10px]">{p.status}</Badge>
                            <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
                        </div>
                        <h3 className="font-bold text-sm line-clamp-2 leading-tight">{p.campaign}</h3>
                    </CardHeader>
                    <CardContent className="pb-3 text-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Avatar className="w-6 h-6"><AvatarImage src={p.avatar} /></Avatar>
                            <span className="text-gray-600 text-xs">{p.creator}</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-xs text-gray-500 line-clamp-2 mb-3">
                            "{p.last_message}"
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Progress</span>
                                <span>{p.step}/5</span>
                            </div>
                            <Progress value={(p.step / 5) * 100} className="h-1.5" />
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0 text-xs text-gray-400 flex justify-between">
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {p.last_updated}</span>
                        <span>Due {p.deadline}</span>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

// 2. Timeline Row Style
function TimelineRowStyle() {
    const data = getRandomProjects()
    return (
        <div className="space-y-8 relative pl-4">
            <div className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-gray-200"></div>
            {data.map((p, i) => (
                <div key={i} className="relative pl-8">
                    <div className="absolute left-[13px] top-6 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full z-10 box-content"></div>
                    <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1">
                            <div className="text-xs text-blue-500 font-bold mb-1">{p.status}</div>
                            <h3 className="font-bold text-sm mb-1">{p.campaign}</h3>
                            <div className="text-xs text-gray-500">with {p.creator}</div>
                        </div>
                        <div className="hidden md:flex gap-1 w-32">
                            {Array.from({ length: 5 }).map((_, s) => (
                                <div key={s} className={`h-1 flex-1 rounded-full ${s < p.step ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                            ))}
                        </div>
                        <div className="text-right min-w-[100px]">
                            <div className="font-bold text-sm">{p.last_updated}</div>
                            <div className="text-xs text-gray-400">Updated</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 3. Chat Interface Style
function ChatInterfaceStyle() {
    const data = getRandomProjects()
    return (
        <div className="max-w-md mx-auto border rounded-xl overflow-hidden bg-gray-50">
            {data.map((p, i) => (
                <div key={i} className="bg-white p-3 border-b last:border-0 hover:bg-blue-50 cursor-pointer flex gap-3">
                    <div className="relative">
                        <Avatar className="w-12 h-12"><AvatarImage src={p.avatar} /></Avatar>
                        {p.step < 5 && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                            <span className="font-bold text-sm truncate pr-2">{p.creator}</span>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{p.last_updated}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-1">{p.last_message}</p>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] h-5 px-1 bg-gray-50">{p.status}</Badge>
                            <span className="text-[10px] text-gray-400 truncate max-w-[100px]">{p.campaign}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 4. Compact Status Line
function CompactStatusLine() {
    const data = getRandomProjects()
    return (
        <div className="space-y-2">
            {data.map((p, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center gap-4 bg-white border p-3 rounded-lg text-sm">
                    <div className={`w-2 h-2 rounded-full ${p.step === 5 ? 'bg-gray-300' : 'bg-green-500'}`}></div>
                    <div className="font-mono text-xs text-gray-400 w-16">#{p.id.toUpperCase()}</div>
                    <div className="flex-1 font-bold truncate md:w-64">{p.campaign}</div>
                    <div className="flex items-center gap-2 w-48">
                        <Avatar className="w-5 h-5"><AvatarImage src={p.avatar} /></Avatar>
                        <span className="text-xs truncate">{p.creator}</span>
                    </div>
                    <div className="w-32">
                        <Badge variant={p.step === 5 ? "secondary" : "default"} className="text-[10px] w-full justify-center">{p.status}</Badge>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8"><ChevronRight className="w-4 h-4 text-gray-400" /></Button>
                </div>
            ))}
        </div>
    )
}

// 5. Detailed Folder Style
function DetailedFolderStyle() {
    const data = getRandomProjects()
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((p, i) => (
                <div key={i} className="bg-[#fff9e6] border border-[#f0e6d2] p-1 rounded-lg shadow-sm">
                    <div className="border border-dashed border-[#dcd0b0] rounded p-4 h-full relative">
                        <div className="absolute top-0 right-0 bg-[#dcd0b0] text-[#8c7b50] text-[10px] px-2 py-0.5 rounded-bl">PROJ-{p.id}</div>
                        <div className="flex items-center mb-4 text-[#8c7b50]">
                            <FolderOpen className="w-5 h-5 mr-2" />
                            <span className="font-bold text-sm">Project File</span>
                        </div>
                        <h3 className="font-bold text-lg text-[#5c4b20] mb-2 leading-tight">{p.campaign}</h3>
                        <div className="space-y-1 text-sm text-[#8c7b50]">
                            <div className="flex justify-between"><span>Partner:</span> <span className="font-bold">{p.creator}</span></div>
                            <div className="flex justify-between"><span>Budget:</span> <span>{p.contract_amount} KRW</span></div>
                            <div className="flex justify-between"><span>Due Date:</span> <span>{p.deadline}</span></div>
                            <div className="flex justify-between"><span>Status:</span> <span className="bg-[#5c4b20] text-[#fff9e6] px-1 rounded text-xs">{p.status}</span></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 6. Calendar Event Style
function CalendarEventStyle() {
    const data = getRandomProjects()
    return (
        <div className="space-y-3 bg-white p-6 border rounded-xl">
            {data.map((p, i) => (
                <div key={i} className="flex gap-4 group">
                    <div className="flex flex-col items-center min-w-[50px]">
                        <span className="text-xs text-gray-500 uppercase">{new Date().toLocaleString('en-US', { month: 'short' })}</span>
                        <span className="text-2xl font-bold">{10 + i}</span>
                    </div>
                    <div className="flex-1 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-3 hover:bg-blue-100 transition-colors">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-sm text-blue-900">{p.campaign}</h3>
                            <span className="text-xs text-blue-400">{p.last_updated}</span>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-blue-700">
                            <div className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {p.status}</div>
                            <div className="flex items-center"><User className="w-3 h-3 mr-1" /> {p.creator}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 7. Visual Grid Style
function VisualGridStyle() {
    const data = getRandomProjects()
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                    <img src={p.image} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Avatar className="w-6 h-6 border"><AvatarImage src={p.avatar} /></Avatar>
                            <span className="text-xs font-bold">{p.creator}</span>
                        </div>
                        <h3 className="font-bold text-sm leading-tight mb-2 line-clamp-2">{p.campaign}</h3>
                        <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden">
                            <div className="bg-green-400 h-full" style={{ width: `${(p.step / 5) * 100}%` }}></div>
                        </div>
                        <div className="text-[10px] mt-1 text-right text-gray-300">{p.status}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 8. Invoice/Contract Style
function InvoiceContractStyle() {
    const data = getRandomProjects()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="bg-white border shadow-sm p-0 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center text-xs text-gray-500">
                        <span>REF: {p.id.toUpperCase()}</span>
                        <span>Updated: {p.last_updated}</span>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <div className="text-xs uppercase text-gray-400 font-bold mb-1">Project</div>
                            <div className="font-bold text-sm mb-2">{p.campaign}</div>
                            <div className="text-xs text-gray-600 space-y-1">
                                <div>Subject: {p.creator}</div>
                                <div className="flex gap-2">
                                    {p.deliverables.map((d, j) => <Badge key={j} variant="outline" className="text-[10px] h-4">{d}</Badge>)}
                                </div>
                            </div>
                        </div>
                        <div className="border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 flex flex-col justify-center">
                            <div className="text-xs uppercase text-gray-400 font-bold mb-1">Total Value</div>
                            <div className="font-mono font-bold text-lg mb-2">{p.contract_amount}</div>
                            <div className={`text-xs font-bold px-2 py-1 rounded text-center ${p.step === 5 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {p.status.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 9. Minimalist Badge Style
function MinimalistBadgeStyle() {
    const data = getRandomProjects()
    return (
        <div className="flex flex-wrap gap-3 items-center">
            {data.map((p, i) => (
                <div key={i} className="flex items-center gap-3 bg-white border rounded-full pl-1 pr-4 py-1 hover:border-black transition-colors cursor-pointer shadow-sm">
                    <Avatar className="w-8 h-8"><AvatarImage src={p.avatar} /></Avatar>
                    <div className="flex flex-col">
                        <span className="font-bold text-xs">{p.creator}</span>
                        <span className="text-[10px] text-gray-500 line-clamp-1 max-w-[100px]">{p.campaign}</span>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${p.step === 5 ? 'bg-gray-300' : 'bg-red-500 animate-pulse'}`}></span>
                </div>
            ))}
        </div>
    )
}

// 10. Alert/Action Focus
function AlertFocusStyle() {
    const data = getRandomProjects()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg bg-orange-50 border border-orange-100 items-start">
                    <div className="bg-white p-2 rounded-full shadow-sm text-orange-500"><AlertCircle className="w-5 h-5" /></div>
                    <div className="flex-1">
                        <h3 className="font-bold text-orange-900 text-sm mb-1">Action Required: {p.status}</h3>
                        <p className="text-xs text-orange-800 mb-2">Project "{p.campaign}" with {p.creator} requires your attention.</p>
                        <div className="bg-white/60 p-2 rounded text-xs text-orange-900 italic border border-orange-100">
                            "{p.last_message}"
                        </div>
                    </div>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white border-0">Respond</Button>
                </div>
            ))}
        </div>
    )
}

// 11. Gantt Chart Row
function GanttChartRow() {
    const data = getRandomProjects()
    return (
        <div className="border rounded-xl overflow-hidden bg-white">
            {data.map((p, i) => (
                <div key={i} className="border-b last:border-0 p-4">
                    <div className="flex justify-between text-xs mb-2">
                        <span className="font-bold">{p.creator}</span>
                        <span className="text-gray-400">{p.startDate} - {p.deadline}</span>
                    </div>
                    <div className="relative h-6 bg-gray-100 rounded-full w-full mb-1 overflow-hidden">
                        {/* Simulation of phases */}
                        <div className="absolute top-0 bottom-0 left-0 bg-blue-200" style={{ width: '20%' }}></div>
                        <div className="absolute top-0 bottom-0 left-[20%] bg-blue-300" style={{ width: '20%' }}></div>
                        <div className="absolute top-0 bottom-0 left-[40%] bg-blue-400" style={{ width: '30%' }}></div>
                        <div className="absolute top-0 bottom-0 left-[70%] bg-blue-500" style={{ width: '30%' }}></div>

                        {/* Actual progress marker */}
                        <div className="absolute top-0 bottom-0 left-0 border-r-2 border-black z-10" style={{ width: `${(p.step / 5) * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest">
                        <span>Contract</span>
                        <span>Content</span>
                        <span>Report</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 12. Mobile App Card Style
function MobileAppCardStyle() {
    const data = getRandomProjects()
    return (
        <div className="flex justify-center gap-4">
            {data.slice(0, 2).map((p, i) => (
                <div key={i} className="w-64 bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800">
                    <div className="bg-gray-800 text-white p-4 pt-8 text-center">
                        <div className="w-16 h-16 bg-white rounded-full mx-auto p-1 mb-2">
                            <img src={p.avatar} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="font-bold text-sm">{p.creator}</div>
                        <div className="text-[10px] opacity-70">@{p.handle}</div>
                    </div>
                    <div className="p-4">
                        <div className="text-center mb-4">
                            <div className="text-[10px] text-gray-400 uppercase">Project Status</div>
                            <div className="font-black text-xl text-blue-600">{p.status}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="bg-gray-100 p-2 rounded-lg flex items-center gap-2 text-xs">
                                <Paperclip className="w-4 h-4 text-gray-400" />
                                <span className="truncate flex-1">Guide_v2.pdf</span>
                            </div>
                            <div className="bg-gray-100 p-2 rounded-lg flex items-center gap-2 text-xs">
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                <span className="truncate flex-1">1 New Message</span>
                            </div>
                        </div>
                        <Button className="w-full mt-4 rounded-xl text-xs h-10">Manage</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 13. Github Issue Style
function GithubIssueStyle() {
    const data = getRandomProjects()
    return (
        <div className="border rounded-md divide-y">
            <div className="bg-gray-50 p-3 text-xs font-bold text-gray-600 flex justify-between">
                <span>OPEN ISSUES</span>
                <span>SORT</span>
            </div>
            {data.map((p, i) => (
                <div key={i} className="p-3 flex gap-2 hover:bg-gray-50 group">
                    <div className="pt-1 text-green-600"><AlertCircle className="w-4 h-4" /></div>
                    <div className="flex-1">
                        <div className="font-semibold text-sm mb-1 group-hover:text-blue-600">[{p.status}] {p.campaign}</div>
                        <div className="text-xs text-gray-500">
                            #{p.id.replace('ws', '')} opened on {p.startDate} by <span className="text-gray-700 font-bold">{p.creator}</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="flex -space-x-1">
                            <Avatar className="w-5 h-5 border ring-1 ring-white"><AvatarImage src={p.avatar} /></Avatar>
                        </div>
                        <div className="flex items-center text-gray-500 text-xs gap-1">
                            <MessageSquare className="w-3 h-3" /> <span>2</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 14. Boarding Pass
function BoardingPassStyle() {
    const data = getRandomProjects().slice(0, 1)
    return (
        <div className="flex justify-center">
            {data.map((p, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg flex overflow-hidden max-w-lg w-full">
                    <div className="bg-blue-600 text-white p-6 flex flex-col justify-between items-center w-24 border-r-2 border-dashed border-blue-400 relative">
                        <span className="rotate-90 whitespace-nowrap font-bold tracking-widest">CAMPAIGN</span>
                        <Briefcase className="w-8 h-8" />
                        <div className="absolute -right-3 top-0 bottom-0 w-6 flex flex-col justify-between py-2">
                            {[...Array(10)].map((_, j) => <div key={j} className="w-6 h-3 bg-white rounded-full -mb-1"></div>)}
                        </div>
                    </div>
                    <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">CREATOR</div>
                                <div className="font-bold text-xl">{p.creator}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">DATE</div>
                                <div className="font-bold text-xl">{p.deadline}</div>
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">CAMPAIGN</div>
                                <div className="font-bold text-sm text-blue-600 max-w-[200px] truncate">{p.campaign}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">STATUS</div>
                                <Badge>{p.status}</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 15. File Tab Style
function FileTabStyle() {
    const data = getRandomProjects()
    return (
        <div className="flex items-end gap-1 border-b overflow-x-auto">
            {data.map((p, i) => (
                <div key={i} className={`min-w-[150px] max-w-[200px] px-4 py-2 rounded-t-lg border border-b-0 cursor-pointer ${i === 0 ? 'bg-white border-blue-500 border-t-2 text-blue-600 z-10 shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                        <span className="font-bold text-xs truncate">{p.creator}</span>
                    </div>
                    <div className="text-[10px] truncate opacity-80">{p.campaign}</div>
                </div>
            ))}
        </div>
    )
}

// 16. Sticky Note Style
function StickyNoteStyle() {
    const data = getRandomProjects()
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 font-handwriting">
            {data.map((p, i) => (
                <div key={i} className="bg-yellow-100 p-6 shadow-md rotate-1 hover:rotate-0 transition-transform" style={{ background: i % 2 === 0 ? '#fef3c7' : '#ecfccb' }}>
                    <div className="w-8 h-8 rounded-full bg-black/10 mx-auto -mt-4 mb-2"></div>
                    <h3 className="font-bold text-lg leading-tight mb-2 text-gray-800">{p.creator}</h3>
                    <div className="h-px bg-black/10 w-full mb-2"></div>
                    <p className="text-sm text-gray-700 leading-snug mb-4">
                        Project: {p.campaign}<br />
                        Status: {p.status}<br />
                        Due: {p.deadline}
                    </p>
                    <div className="text-xs text-gray-500 text-right italic">- PM</div>
                </div>
            ))}
        </div>
    )
}

// 17. Stat Dashboard Row
function StatDashboardRow() {
    const data = getRandomProjects()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-400 border border-slate-700">
                            <Zap className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400">ACTIVE CAMPAIGN</div>
                            <div className="font-bold text-sm">{p.campaign}</div>
                        </div>
                    </div>
                    <div className="flex gap-8 text-center">
                        <div>
                            <div className="text-[10px] text-slate-500">PROGRESS</div>
                            <div className="font-mono text-xl text-cyan-400">{(p.step / 5) * 100}%</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-500">DAYS LEFT</div>
                            <div className="font-mono text-xl text-white">5</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 18. Process Steps Style
function ProcessStepsStyle() {
    const data = getRandomProjects()
    return (
        <div className="space-y-6">
            {data.map((p, i) => (
                <div key={i} className="bg-white border rounded-xl p-5">
                    <div className="flex justify-between mb-4">
                        <div className="flex gap-3">
                            <Avatar><AvatarImage src={p.avatar} /></Avatar>
                            <div>
                                <div className="font-bold text-sm">{p.creator}</div>
                                <div className="text-xs text-gray-500">{p.campaign}</div>
                            </div>
                        </div>
                        <Button size="sm" variant="outline">Details</Button>
                    </div>
                    <div className="relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                        <div className="flex justify-between relative z-10">
                            {[1, 2, 3, 4, 5].map(step => (
                                <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-colors ${step <= p.step ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                                        {step}
                                    </div>
                                    <span className={`text-[10px] font-bold ${step <= p.step ? 'text-black' : 'text-gray-300'}`}>Step {step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 19. User Profile Card
function UserProfileCardStyle() {
    const data = getRandomProjects()
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.map((p, i) => (
                <div key={i} className="text-center bg-white border border-t-0 rounded-b-xl shadow-sm pt-8 pb-4 relative mt-10">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                        <img src={p.avatar} className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-gray-100 absolute top-0 left-0 w-full h-10 -z-10 rounded-t-xl mt-[-40px]"></div>

                    <h3 className="font-bold text-lg">{p.creator}</h3>
                    <p className="text-xs text-gray-500 mb-4">@{p.handle}</p>

                    <div className="px-4 text-left mb-4">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Task</div>
                        <div className="text-sm font-medium bg-blue-50 p-2 rounded text-blue-800 border-blue-100 border">{p.status}</div>
                    </div>

                    <div className="flex border-t pt-3">
                        <div className="flex-1 border-r text-xs">
                            <div className="opacity-50">Budget</div>
                            <div className="font-bold">{p.contract_amount}</div>
                        </div>
                        <div className="flex-1 text-xs">
                            <div className="opacity-50">Deadline</div>
                            <div className="font-bold">{p.deadline}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 20. Glass Overlay
function GlassOverlayStyle() {
    const data = getRandomProjects()
    return (
        <div className="grid grid-cols-1 gap-4">
            {data.map((p, i) => (
                <div key={i} className="h-40 rounded-2xl overflow-hidden relative flex items-center justify-center p-6 text-white bg-cover bg-center" style={{ backgroundImage: `url(${p.image})` }}>
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl w-full max-w-lg flex items-center gap-6">
                        <div className="flex-1">
                            <h3 className="font-bold text-xl mb-1">{p.campaign}</h3>
                            <div className="text-sm opacity-80 mb-2">with {p.creator}</div>
                            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-white h-full" style={{ width: `${(p.step / 5) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="text-center pl-6 border-l border-white/20">
                            <div className="text-2xl font-bold">{p.status}</div>
                            <div className="text-[10px] uppercase tracking-widest opacity-70">Current Status</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
