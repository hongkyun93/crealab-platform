"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
// Import necessary icons
import {
    Briefcase, MessageSquare, CheckCircle2, Clock, Calendar,
    FileText, DollarSign, MoreHorizontal, AlertCircle,
    Link, Zap, FolderOpen, Layout, Grid, List as ListIcon,
    Send, Paperclip, Flag, ChevronRight, User
} from "lucide-react"

// --- Rich Realistic Mock Data (Creator Workspace Context) ---
const WORKSPACE_DATA_POOL = [
    {
        id: "ws1",
        project: "그랜드 조선 호캉스 리뷰",
        brand: "그랜드 조선",
        brandLogo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&q=80",
        status: "Draft Review",
        step: 3, // 1: Contract, 2: Product, 3: Draft, 4: Final, 5: Complete
        deadline: "2024.08.20",
        pay: "300,000",
        lastMessage: "초안 확인 부탁드립니다!",
        lastUpdated: "2시간 전",
        isUrgent: false
    },
    {
        id: "ws2",
        project: "로지텍 G-Pro 마우스 유튜브 영상",
        brand: "Logitech",
        brandLogo: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=150&q=80",
        status: "Product Shipping",
        step: 2,
        deadline: "2024.08.25",
        pay: "150,000",
        lastMessage: "배송 시작되었습니다.",
        lastUpdated: "1일 전",
        isUrgent: false
    },
    {
        id: "ws3",
        project: "아로마티카 비건 샴푸 릴스",
        brand: "Aromatica",
        brandLogo: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=150&q=80",
        status: "Contract Signing",
        step: 1,
        deadline: "2024.08.15",
        pay: "500,000",
        lastMessage: "전자계약서 서명 요청드립니다.",
        lastUpdated: "방금 전",
        isUrgent: true
    },
    {
        id: "ws4",
        project: "성수동 멜로우 카페 방문기",
        brand: "Cafe Mellow",
        brandLogo: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&q=80",
        status: "Completed",
        step: 5,
        deadline: "2024.08.10",
        pay: "50,000",
        lastMessage: "정산 완료되었습니다. 수고하셨습니다!",
        lastUpdated: "3일 전",
        isUrgent: false
    },
    {
        id: "ws5",
        project: "젝시믹스 24SS 룩북 모델",
        brand: "Xexymix",
        brandLogo: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150&q=80",
        status: "Final Review",
        step: 4,
        deadline: "2024.08.18",
        pay: "Pay 협의",
        lastMessage: "수정 사항 반영 확인했습니다.",
        lastUpdated: "5시간 전",
        isUrgent: true
    }
]

const getRandomProjects = () => {
    return [...WORKSPACE_DATA_POOL].sort(() => 0.5 - Math.random()).slice(0, 3)
}

export default function CreatorWorkspacePage() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        if (!selectedDesign) return <KanbanCardStyle />

        switch (selectedDesign) {
            case 1: return <KanbanCardStyle />;
            case 2: return <TimelineStepStyle />;
            case 3: return <ChatInterfaceStyle />;
            case 4: return <MinimalistRowStyle />;
            case 5: return <ContractFocusStyle />;
            case 6: return <VisualProgressGrid />;
            case 7: return <FolderTabInterace />;
            case 8: return <MobileAppTaskCard />;
            case 9: return <DeadlineUrgencyRow />;
            case 10: return <DetailedStatusBadge />;
            case 11: return <CollaboratorAvatarList />;
            case 12: return <DocumentChecklist />;
            case 13: return <GamifiedLevelBar />;
            case 14: return <GanttChartRow />;
            case 15: return <PaymentFocusCard />;
            case 16: return <DarkModeDevStyle />;
            case 17: return <StickynoteBoard />;
            case 18: return <GlassmorphismPanel />;
            case 19: return <NotificationFeedStyle />;
            case 20: return <InvoiceTableStyle />;
            default: return <KanbanCardStyle />;
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">워크스페이스 디자인 랩</h1>
                <p className="text-muted-foreground">크리에이터의 협업 관리를 위한 20가지 워크스페이스 디자인을 확인해보세요.</p>
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
                                    case 1: return <KanbanCardStyle />;
                                    case 2: return <TimelineStepStyle />;
                                    case 3: return <ChatInterfaceStyle />;
                                    case 4: return <MinimalistRowStyle />;
                                    case 5: return <ContractFocusStyle />;
                                    case 6: return <VisualProgressGrid />;
                                    case 7: return <FolderTabInterace />;
                                    case 8: return <MobileAppTaskCard />;
                                    case 9: return <DeadlineUrgencyRow />;
                                    case 10: return <DetailedStatusBadge />;
                                    case 11: return <CollaboratorAvatarList />;
                                    case 12: return <DocumentChecklist />;
                                    case 13: return <GamifiedLevelBar />;
                                    case 14: return <GanttChartRow />;
                                    case 15: return <PaymentFocusCard />;
                                    case 16: return <DarkModeDevStyle />;
                                    case 17: return <StickynoteBoard />;
                                    case 18: return <GlassmorphismPanel />;
                                    case 19: return <NotificationFeedStyle />;
                                    case 20: return <InvoiceTableStyle />;
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

// 1. Kanban Card Style
function KanbanCardStyle() {
    const data = getRandomProjects()
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.map((p, i) => (
                <Card key={i} className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start mb-2">
                            <Badge variant={p.isUrgent ? "destructive" : "secondary"} className="text-[10px]">{p.status}</Badge>
                            <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
                        </div>
                        <h3 className="font-bold text-sm leading-tight">{p.project}</h3>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <img src={p.brandLogo} className="w-4 h-4 rounded-full" /> {p.brand}
                        </div>
                    </CardHeader>
                    <CardContent className="pb-3 text-sm">
                        <div className="bg-gray-50 p-2 rounded text-xs text-gray-500 mb-3 truncate">
                            "{p.lastMessage}"
                        </div>
                        <Progress value={(p.step / 5) * 100} className="h-1.5 mb-1" />
                        <div className="flex justify-between text-[10px] text-gray-400">
                            <span>Step {p.step}/5</span>
                            <span>{p.step === 5 ? 'Complete' : 'In Progress'}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

// 2. Timeline Step Style
function TimelineStepStyle() {
    const data = getRandomProjects()
    return (
        <div className="space-y-6 pl-4 relative">
            <div className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-gray-200 border-l border-dashed border-gray-300"></div>
            {data.map((p, i) => (
                <div key={i} className="relative pl-8">
                    <div className={`absolute left-[13px] top-4 w-3.5 h-3.5 rounded-full border-2 z-10 box-content ${p.step === 5 ? 'bg-green-500 border-green-600' : 'bg-white border-blue-500'}`}></div>
                    <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1">
                            <h3 className="font-bold text-sm mb-1">{p.project}</h3>
                            <div className="text-xs text-gray-500">with {p.brand}</div>
                        </div>
                        <div className="flex gap-1 w-full md:w-48">
                            {['Contract', 'Product', 'Draft', 'Final', 'Done'].map((s, idx) => (
                                <div key={idx} className={`h-1 flex-1 rounded-full ${idx < p.step ? 'bg-blue-500' : 'bg-gray-200'}`} title={s}></div>
                            ))}
                        </div>
                        <div className="text-right min-w-[80px]">
                            <div className="font-bold text-xs text-blue-600">{p.status}</div>
                            <div className="text-[10px] text-gray-400">{p.lastUpdated}</div>
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
        <div className="max-w-md mx-auto border rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="bg-gray-50 p-3 border-b text-xs font-bold text-gray-500 uppercase">Recent Messages</div>
            {data.map((p, i) => (
                <div key={i} className="p-3 border-b last:border-0 hover:bg-blue-50 cursor-pointer flex gap-3 group transition-colors">
                    <div className="relative">
                        <Avatar className="w-10 h-10"><AvatarImage src={p.brandLogo} /></Avatar>
                        {p.isUrgent && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                            <span className="font-bold text-sm truncate pr-2">{p.brand}</span>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{p.lastUpdated}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium truncate mb-0.5">{p.project}</p>
                        <p className="text-xs text-gray-400 truncate group-hover:text-gray-600">"{p.lastMessage}"</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 4. Minimalist Row Style
function MinimalistRowStyle() {
    const data = getRandomProjects()
    return (
        <div className="divide-y">
            {data.map((p, i) => (
                <div key={i} className="py-4 flex flex-col md:flex-row md:items-center gap-4 group hover:bg-gray-50 px-2 rounded transition-colors">
                    <div className={`w-2 h-2 rounded-full ${p.step === 5 ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                    <div className="w-16 text-xs text-mono text-gray-400">PROJ-{i + 10}</div>
                    <div className="flex-1 font-medium text-sm text-gray-900">{p.project}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 w-32">
                        <img src={p.brandLogo} className="w-4 h-4 rounded-full" />
                        <span className="truncate">{p.brand}</span>
                    </div>
                    <div className="w-24 text-right transform translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <Button size="sm" variant="ghost" className="h-6 text-xs">Manage <ChevronRight className="w-3 h-3 ml-1" /></Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 5. Contract Focus Style
function ContractFocusStyle() {
    const data = getRandomProjects()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="flex bg-white rounded-lg border overflow-hidden">
                    <div className="w-2 bg-blue-600"></div>
                    <div className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-sm">{p.project}</h3>
                                <div className="text-xs text-gray-500">Contract Value: {p.pay}</div>
                            </div>
                            <Badge variant="outline">{p.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-xs text-blue-600 font-bold cursor-pointer hover:underline">
                            <FileText className="w-4 h-4" /> View Agreement
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 6. Visual Progress Grid
function VisualProgressGrid() {
    const data = getRandomProjects()
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.map((p, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                        <div className="h-full bg-indigo-500" style={{ width: `${(p.step / 5) * 100}%` }}></div>
                    </div>
                    <img src={p.brandLogo} className="w-16 h-16 rounded-full mx-auto mb-4 border-4 border-white shadow-md group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-sm mb-1 truncate">{p.project}</h3>
                    <div className="text-xs text-gray-500 mb-4">{p.brand}</div>
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs ring-4 ring-indigo-50/50">
                        {p.step}
                    </div>
                </div>
            ))}
        </div>
    )
}

// 7. Folder Tab Interface
function FolderTabInterace() {
    const data = getRandomProjects()
    return (
        <div className="pt-2">
            <div className="flex gap-1 overflow-x-auto px-2">
                {data.map((p, i) => (
                    <div key={i} className={`px-4 py-2 rounded-t-lg text-xs font-bold whitespace-nowrap cursor-pointer ${i === 0 ? 'bg-white border-x border-t text-blue-600 relative z-10 top-[1px]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {p.brand}
                    </div>
                ))}
            </div>
            <div className="bg-white border rounded-b-lg rounded-tr-lg p-6 min-h-[150px] shadow-sm relative z-0">
                {data.slice(0, 1).map((p, i) => (
                    <div key={i}>
                        <h3 className="font-bold text-lg mb-2">{p.project}</h3>
                        <div className="flex gap-4 text-sm text-gray-600 mb-4">
                            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {p.deadline}</span>
                            <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1" /> {p.pay}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded text-sm mb-4">
                            <span className="font-bold text-gray-500 text-xs uppercase block mb-1">Last Update</span>
                            {p.lastMessage}
                        </div>
                        <Button size="sm">Open Dashboard</Button>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 8. Mobile App Task Card
function MobileAppTaskCard() {
    const data = getRandomProjects()
    return (
        <div className="flex justify-center gap-4">
            {data.slice(0, 2).map((p, i) => (
                <div key={i} className="w-64 bg-white rounded-3xl border shadow-xl overflow-hidden flex flex-col">
                    <div className="bg-gray-900 p-4 text-white pb-8">
                        <div className="text-xs opacity-70 uppercase tracking-widest mb-2">Ongoing</div>
                        <div className="font-bold text-lg leading-tight">{p.brand}</div>
                    </div>
                    <div className="flex-1 p-4 -mt-4 bg-white rounded-t-3xl">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded">{p.status}</div>
                            <div className="text-xs text-gray-400">{p.step}/5</div>
                        </div>
                        <h3 className="font-bold text-sm mb-2">{p.project}</h3>
                        <div className="text-xs text-gray-500 mb-4 line-clamp-2">Deadline: {p.deadline}</div>
                        <div className="mt-auto flex -space-x-2">
                            <Avatar className="w-6 h-6 border-2 border-white"><AvatarImage src={p.brandLogo} /></Avatar>
                            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-500">+1</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 9. Deadline Urgency Row
function DeadlineUrgencyRow() {
    const data = getRandomProjects()
    return (
        <div className="space-y-3">
            {data.map((p, i) => (
                <div key={i} className={`flex items-center gap-4 p-3 rounded-lg border-l-4 ${p.isUrgent ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="flex flex-col items-center min-w-[50px]">
                        <span className={`text-xs font-bold ${p.isUrgent ? 'text-red-500' : 'text-gray-400'}`}>{p.deadline.split('.')[2]}</span>
                        <span className="text-[10px] text-gray-400 uppercase">Day</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm">{p.project}</h3>
                            {p.isUrgent && <AlertCircle className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="text-xs text-gray-500">{p.status} • {p.brand}</div>
                    </div>
                    <Button size="sm" variant={p.isUrgent ? 'destructive' : 'outline'} className="h-7 text-xs">Action</Button>
                </div>
            ))}
        </div>
    )
}

// 10. Detailed Status Badge
function DetailedStatusBadge() {
    const data = getRandomProjects()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl items-center bg-white shadow-sm">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                        {i + 1}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="font-bold text-sm">{p.project}</h3>
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-xs text-gray-500 mt-1">
                            <span>Brand: {p.brand}</span>
                            <span>Pay: {p.pay}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 w-full md:w-auto">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(p.step)}`}>
                            {p.status}
                        </div>
                        <div className="text-[10px] text-gray-400">Step {p.step} of 5</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function getStatusColor(step: number) {
    if (step === 1) return 'bg-gray-50 border-gray-200 text-gray-600'
    if (step === 2) return 'bg-blue-50 border-blue-200 text-blue-600'
    if (step === 3) return 'bg-purple-50 border-purple-200 text-purple-600'
    if (step === 4) return 'bg-orange-50 border-orange-200 text-orange-600'
    return 'bg-green-50 border-green-200 text-green-600'
}

// 11. Collaborator Avatar List
function CollaboratorAvatarList() {
    const data = getRandomProjects()
    return (
        <div className="space-y-2">
            {data.map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-2 rounded-full border shadow-sm pr-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-white shadow-sm"><AvatarImage src={p.brandLogo} /></Avatar>
                        <div className="font-bold text-sm">{p.brand}</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500 truncate max-w-[150px]">{p.project}</span>
                        <div className={`w-2 h-2 rounded-full ${p.step === 5 ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 12. Document Checklist
function DocumentChecklist() {
    const data = getRandomProjects()
    return (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 font-mono text-sm space-y-3 shadow-inner">
            {data.map((p, i) => (
                <div key={i} className="flex gap-3 items-start">
                    <div className={`mt-0.5 w-4 h-4 border-2 flex items-center justify-center cursor-pointer ${p.step === 5 ? 'bg-black border-black text-white' : 'border-gray-400'}`}>
                        {p.step === 5 && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <div className={`flex-1 ${p.step === 5 ? 'line-through opacity-50' : ''}`}>
                        <span className="font-bold">[{p.status}]</span> {p.project} - Due {p.deadline}
                    </div>
                </div>
            ))}
        </div>
    )
}

// 13. Gamified Level Bar
function GamifiedLevelBar() {
    const data = getRandomProjects()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="bg-gray-900 text-white p-4 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${(p.step / 5) * 100}%` }}></div>
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Quest Log</div>
                            <h3 className="font-bold text-lg">{p.brand}</h3>
                        </div>
                        <div className="text-right">
                            <div className="font-mono text-2xl text-yellow-400">{p.step}<span className="text-sm text-gray-500">/5</span></div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-400">{p.project}</div>
                </div>
            ))}
        </div>
    )
}

// 14. Gantt Chart Row
function GanttChartRow() {
    const data = getRandomProjects()
    return (
        <div className="border rounded-xl bg-white overflow-hidden">
            <div className="grid grid-cols-6 border-b bg-gray-50 text-[10px] text-gray-500 uppercase py-2 text-center font-bold">
                <div className="col-span-2 text-left pl-4">Task</div>
                <div>Prep</div>
                <div>Draft</div>
                <div>Edit</div>
                <div>Pub</div>
            </div>
            {data.map((p, i) => (
                <div key={i} className="grid grid-cols-6 border-b last:border-0 py-3 items-center hover:bg-gray-50">
                    <div className="col-span-2 pl-4">
                        <div className="font-bold text-xs truncate pr-2">{p.brand}</div>
                        <div className="text-[10px] text-gray-400 text-xs">{p.lastUpdated}</div>
                    </div>
                    <div className="col-span-4 px-2 relative h-6">
                        <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-gray-100 w-full rounded-full"></div>
                        <div
                            className="absolute top-1/2 -translate-y-1/2 h-3 bg-blue-500 rounded-full shadow-sm"
                            style={{
                                left: `${((p.step - 1) / 5) * 100}%`,
                                width: '25%'
                            }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 15. Payment Focus Card
function PaymentFocusCard() {
    const data = getRandomProjects()
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((p, i) => (
                <div key={i} className="border rounded-lg p-4 flex flex-col justify-between h-[120px] bg-gradient-to-br from-white to-gray-50">
                    <div className="flex justify-between items-start">
                        <div className="text-xs text-gray-500 uppercase font-bold">Earnings</div>
                        <div className={`w-2 h-2 rounded-full ${p.step === 5 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className="font-mono text-xl font-bold">{p.pay}</div>
                    <div className="text-xs text-gray-600 truncate pt-2 border-t">{p.project}</div>
                </div>
            ))}
        </div>
    )
}

// 16. Dark Mode Dev Style
function DarkModeDevStyle() {
    const data = getRandomProjects()
    return (
        <div className="bg-[#1e1e1e] rounded-lg border border-[#333] p-4 text-[#d4d4d4] font-mono text-xs">
            <div className="flex gap-2 mb-4 border-b border-[#333] pb-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            {data.map((p, i) => (
                <div key={i} className="mb-2 hover:bg-[#2d2d2d] p-1 -mx-1 rounded cursor-pointer">
                    <span className="text-[#569cd6]">const</span> <span className="text-[#9cdcfe]">{p.brand.replace(/\s/g, '')}</span> = <span className="text-[#ce9178]">'{p.status}'</span>;
                    <span className="text-[#6a9955]"> // {p.step}/5 steps</span>
                </div>
            ))}
            <div className="animate-pulse">_</div>
        </div>
    )
}

// 17. Stickynote Board
function StickynoteBoard() {
    const data = getRandomProjects()
    return (
        <div className="flex flex-wrap gap-4 font-handwriting">
            {data.map((p, i) => (
                <div key={i} className="bg-yellow-200 w-40 h-40 p-4 shadow-md rotate-1 hover:rotate-0 transition-transform flex flex-col justify-between" style={{ backgroundColor: i % 2 === 0 ? '#fef3c7' : '#dbeafe' }}>
                    <div>
                        <div className="font-bold text-sm mb-1">{p.brand}</div>
                        <div className="text-xs leading-tight opacity-80">{p.project}</div>
                    </div>
                    <div className="text-xs text-right opacity-60">
                        {p.deadline}
                    </div>
                </div>
            ))}
        </div>
    )
}

// 18. Glassmorphism Panel
function GlassmorphismPanel() {
    const data = getRandomProjects()
    return (
        <div className="space-y-3 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl">
            {data.map((p, i) => (
                <div key={i} className="bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-xl text-white flex justify-between items-center shadow-lg">
                    <div>
                        <h3 className="font-bold text-sm">{p.brand}</h3>
                        <div className="text-xs opacity-80">{p.status}</div>
                    </div>
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full"><ChevronRight className="w-4 h-4" /></Button>
                </div>
            ))}
        </div>
    )
}

// 19. Notification Feed
function NotificationFeedStyle() {
    const data = getRandomProjects()
    return (
        <div className="space-y-4">
            {data.map((p, i) => (
                <div key={i} className="flex gap-3 items-start">
                    <div className="mt-1 relative">
                        <Avatar className="w-8 h-8"><AvatarImage src={p.brandLogo} /></Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5"><div className="w-2 h-2 bg-blue-500 rounded-full"></div></div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-r-xl rounded-bl-xl text-sm">
                        <span className="font-bold text-gray-900 mr-1">{p.brand}</span>
                        <span className="text-gray-600">{p.lastMessage}</span>
                        <div className="mt-1 text-[10px] text-gray-400 font-bold">{p.lastUpdated}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 20. Invoice Table
function InvoiceTableStyle() {
    const data = getRandomProjects().slice(0, 3)
    return (
        <div className="border rounded-lg overflow-hidden bg-white">
            <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-3">Ref</th>
                        <th className="p-3">Client</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {data.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                            <td className="p-3 font-mono text-gray-500">#{p.id.toUpperCase()}</td>
                            <td className="p-3 font-bold">{p.brand}</td>
                            <td className="p-3 text-right font-mono">{p.pay}</td>
                            <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.step === 5 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {p.step === 5 ? 'PAID' : 'PENDING'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
