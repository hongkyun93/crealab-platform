"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Calendar, Users, DollarSign, Edit, Archive, MoreHorizontal,
    Megaphone, CheckCircle2, Clock, AlertCircle, PlusCircle,
    TrendingUp, BarChart, ArrowRight, Target, Layout, List,
    PieChart, Activity, Box, Filter
} from "lucide-react"

// --- Realistic Mock Data (Campaign Management Context) ---
const MY_CAMPAIGNS = [
    {
        id: "c1",
        title: "[제주] 그랜드 조선 호텔 2박 3일 숙박권 체험단",
        product: "그랜드 조선 제주 숙박권",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
        status: "Recruiting", // Recruiting, Ongoing, Completed, Reviewing
        applicants: 124,
        recruitment_goal: 5,
        budget: "2,000,000",
        spent: "0",
        deadline: "D-5",
        start_date: "2024.08.01",
        end_date: "2024.08.15",
        channels: ["Instagram", "Blog"],
        engagement_rate: "-",
        roi: "-"
    },
    {
        id: "c2",
        title: "24SS 신상! 퓨처리스틱 러닝화 리뷰어 모집",
        product: "나이키 퓨처 런 v2",
        image: "https://images.unsplash.com/photo-1556906781-9a412961d289?w=800&q=80",
        status: "Ongoing",
        applicants: 350,
        recruitment_goal: 20,
        selected_count: 20,
        budget: "5,000,000",
        spent: "2,500,000",
        deadline: "Ended",
        progress: 45, // %
        start_date: "2024.07.15",
        end_date: "2024.08.30",
        channels: ["YouTube"],
        engagement_rate: "5.8%",
        roi: "150%"
    },
    {
        id: "c3",
        title: "성수동 핫플 '카페 레이어드' 디저트 세트 체험",
        product: "디저트 2인 세트",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
        status: "Reviewing",
        applicants: 89,
        recruitment_goal: 10,
        selected_count: 10,
        budget: "500,000",
        spent: "0",
        deadline: "Ended",
        progress: 80,
        start_date: "2024.07.01",
        end_date: "2024.07.31",
        channels: ["Instagram"],
        engagement_rate: "8.2%",
        roi: "210%"
    },
    {
        id: "c4",
        title: "로지텍 MX Master 3S 업무생산성 챌린지",
        product: "로지텍 MX Master 3S",
        image: "https://images.unsplash.com/photo-1615663245857-acda5b2a666e?w=800&q=80",
        status: "Completed",
        applicants: 450,
        recruitment_goal: 30,
        selected_count: 30,
        budget: "4,500,000",
        spent: "4,500,000",
        deadline: "Ended",
        progress: 100,
        start_date: "2024.06.01",
        end_date: "2024.06.30",
        channels: ["YouTube", "Instagram"],
        engagement_rate: "12.5%",
        roi: "340%"
    }
]

export default function MyCampaignsDesignLab() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        switch (selectedDesign) {
            case 1: return <StandardKanbanCard />;
            case 2: return <ProgressBarRow />;
            case 3: return <CompactDataGrid />;
            case 4: return <VisualCoverCard />;
            case 5: return <StatusTimelineStyle />;
            case 6: return <BudgetFocusCard />;
            case 7: return <InfluencerGridStyle />;
            case 8: return <MinimalListStyle />;
            case 9: return <AnalyticsDashboardStyle />;
            case 10: return <DetailedAccordionStyle />;
            case 11: return <PriorityBadgeStyle />;
            case 12: return <InteractiveFolderStyle />;
            case 13: return <NeumorphicPanelStyle />;
            case 14: return <GlassOverlayStyle />;
            case 15: return <RetroBlueprintStyle />;
            case 16: return <HighContrastAdminStyle />;
            case 17: return <BentoBoxStyle />;
            case 18: return <FloatingActionCard />;
            case 19: return <SplitViewStyle />;
            case 20: return <MagazineEditorialStyle />;
            default: return <StandardKanbanCard />;
        }
    }

    return (
        <div className="space-y-6 pb-20 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">내 캠페인 관리</h1>
                    <p className="text-muted-foreground mt-2">
                        진행 중인 캠페인의 현황을 파악하고 관리하세요.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button className="bg-black text-white hover:bg-gray-800"><PlusCircle className="w-4 h-4 mr-2" /> 새 캠페인 만들기</Button>
                </div>
            </div>

            {/* PREVIEW AREA */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Badge variant={selectedDesign ? "default" : "outline"} className={!selectedDesign ? "bg-indigo-50 text-indigo-700 border-indigo-200" : ""}>
                            {selectedDesign ? `Selected Design #${selectedDesign}` : "Default (Standard Kanban)"}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-normal">
                            {selectedDesign ? "Applied Management View" : "Live Code"}
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
            <h3 className="font-bold text-xl mb-6">All 20 Management Variations</h3>

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
                                    case 1: return <StandardKanbanCard />;
                                    case 2: return <ProgressBarRow />;
                                    case 3: return <CompactDataGrid />;
                                    case 4: return <VisualCoverCard />;
                                    case 5: return <StatusTimelineStyle />;
                                    case 6: return <BudgetFocusCard />;
                                    case 7: return <InfluencerGridStyle />;
                                    case 8: return <MinimalListStyle />;
                                    case 9: return <AnalyticsDashboardStyle />;
                                    case 10: return <DetailedAccordionStyle />;
                                    case 11: return <PriorityBadgeStyle />;
                                    case 12: return <InteractiveFolderStyle />;
                                    case 13: return <NeumorphicPanelStyle />;
                                    case 14: return <GlassOverlayStyle />;
                                    case 15: return <RetroBlueprintStyle />;
                                    case 16: return <HighContrastAdminStyle />;
                                    case 17: return <BentoBoxStyle />;
                                    case 18: return <FloatingActionCard />;
                                    case 19: return <SplitViewStyle />;
                                    case 20: return <MagazineEditorialStyle />;
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

// 1. Standard Kanban Card
function StandardKanbanCard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MY_CAMPAIGNS.slice(0, 2).map((c, i) => (
                <Card key={i} className="border-t-4 border-t-black hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <Badge variant="outline" className={`${c.status === 'Recruiting' ? 'bg-blue-50 text-blue-700' : c.status === 'Ongoing' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{c.status}</Badge>
                            <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-4 h-4" /></Button>
                        </div>
                        <h3 className="font-bold text-lg line-clamp-1">{c.title}</h3>
                        <div className="text-xs text-gray-500">{c.product}</div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded">
                            <div>
                                <div className="text-xs text-gray-500">지원자</div>
                                <div className="font-bold">{c.applicants}명</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">예산 소진</div>
                                <div className="font-bold">{(parseInt(c.spent.replace(/,/g, '')) / parseInt(c.budget.replace(/,/g, '')) * 100).toFixed(0)}%</div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {c.end_date}</div>
                            <div className={`font-bold ${c.status === 'Recruiting' ? 'text-red-500' : ''}`}>{c.status === 'Recruiting' ? c.deadline + ' 마감' : `진행률 ${c.progress}%`}</div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

// 2. Progress Bar Row
function ProgressBarRow() {
    return (
        <div className="space-y-3">
            {MY_CAMPAIGNS.slice(0, 3).map((c, i) => (
                <div key={i} className="bg-white border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 min-w-0 w-full">
                        <div className="flex justify-between mb-1">
                            <h3 className="font-bold text-sm truncate">{c.title}</h3>
                            <span className="text-xs text-gray-500">{c.status}</span>
                        </div>
                        <Progress value={c.status === 'Recruiting' ? (c.applicants / c.recruitment_goal) * 100 : c.progress} className="h-2" />
                        <div className="flex justify-between mt-1 text-xs text-gray-400">
                            <span>Start: {c.start_date}</span>
                            <span>{c.status === 'Recruiting' ? `${c.applicants}/${c.recruitment_goal} 모집` : `${c.progress}% 완료`}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        <div className="text-right">
                            <div className="font-bold text-sm">{c.budget}</div>
                            <div className="text-xs text-gray-400">Budget</div>
                        </div>
                        <Button size="sm" variant="outline">Manage</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 3. Compact Data Grid
function CompactDataGrid() {
    return (
        <div className="border rounded-lg overflow-hidden text-sm">
            <div className="grid grid-cols-12 bg-gray-50 p-3 font-bold border-b text-gray-600">
                <div className="col-span-4">Campaign</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Applicants</div>
                <div className="col-span-2">Budget</div>
                <div className="col-span-2">Deadline</div>
            </div>
            {MY_CAMPAIGNS.slice(0, 4).map((c, i) => (
                <div key={i} className="grid grid-cols-12 p-3 border-b last:border-0 hover:bg-gray-50 items-center">
                    <div className="col-span-4 pr-2">
                        <div className="font-medium truncate">{c.title}</div>
                        <div className="text-xs text-gray-400 truncate">{c.product}</div>
                    </div>
                    <div className="col-span-2"><Badge variant="outline" className="text-[10px] h-5">{c.status}</Badge></div>
                    <div className="col-span-2 font-mono">{c.applicants} <span className="text-gray-400 text-xs">/ {c.recruitment_goal}</span></div>
                    <div className="col-span-2 font-mono text-xs">{c.spent} <span className="text-gray-400">/ {c.budget}</span></div>
                    <div className="col-span-2 text-xs font-medium text-red-500">{c.deadline}</div>
                </div>
            ))}
        </div>
    )
}

// 4. Visual Cover Card
function VisualCoverCard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MY_CAMPAIGNS.slice(0, 2).map((c, i) => (
                <div key={i} className="relative h-48 rounded-xl overflow-hidden group cursor-pointer text-white">
                    <img src={c.image} className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-40 transition-all" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-between">
                        <div className="flex justify-between">
                            <Badge className="bg-white/20 hover:bg-white/30 backdrop-blur border-none text-white">{c.status}</Badge>
                            <div className="text-xs font-mono opacity-80">{c.channels.join(', ')}</div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1 shadow-black drop-shadow-md">{c.title}</h3>
                            <div className="flex gap-4 text-sm opacity-90">
                                <span>👥 {c.applicants} Applied</span>
                                <span>💰 {c.budget}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 5. Status Timeline
function StatusTimelineStyle() {
    return (
        <div className="pl-4 border-l-2 border-gray-200 space-y-6">
            {MY_CAMPAIGNS.slice(0, 2).map((c, i) => (
                <div key={i} className="relative pl-6">
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${c.status === 'Recruiting' ? 'bg-blue-500' : c.status === 'Ongoing' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm arrow-left">
                        <div className="flex justify-between mb-2">
                            <h3 className="font-bold text-sm">{c.title}</h3>
                            <span className="text-xs text-gray-400">{c.end_date}까지</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            {c.status === 'Recruiting' ? (
                                <div className="w-full bg-blue-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(c.applicants / c.recruitment_goal) * 100}%` }}></div></div>
                            ) : (
                                <div className="w-full bg-green-100 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${c.progress}%` }}></div></div>
                            )}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>현재 단계: {c.status}</span>
                            <span>예산: {c.budget}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 6. Budget Focus
function BudgetFocusCard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MY_CAMPAIGNS.slice(0, 2).map((c, i) => (
                <div key={i} className="bg-white border rounded-xl p-4 flex gap-4">
                    <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg min-w-[100px]">
                        <div className="text-xs text-green-600 mb-1">Budget Use</div>
                        <div className="font-bold text-green-700 text-lg">{(parseInt(c.spent.replace(/,/g, '')) / parseInt(c.budget.replace(/,/g, '')) * 100).toFixed(0)}%</div>
                        <div className="w-12 h-1 bg-green-200 rounded mt-2"><div className="h-full bg-green-600" style={{ width: `${(parseInt(c.spent.replace(/,/g, '')) / parseInt(c.budget.replace(/,/g, '')) * 100).toFixed(0)}%` }}></div></div>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-base mb-1 line-clamp-1">{c.title}</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                            <div>
                                <span className="text-gray-400 block">Total</span>
                                <span className="font-medium">{c.budget}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Spent</span>
                                <span className="font-medium">{c.spent}</span>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" className="w-full mt-3 h-7 text-xs">View Report</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 7. Influencer Grid
function InfluencerGridStyle() {
    return (
        <div className="space-y-4">
            {MY_CAMPAIGNS.slice(1, 3).map((c, i) => (
                <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-3">
                        <h3 className="font-bold text-sm">{c.title}</h3>
                        <span className="text-xs font-bold text-blue-600">{c.selected_count}명 선정됨</span>
                    </div>
                    <div className="flex -space-x-2 overflow-hidden mb-3">
                        {Array.from({ length: 5 }).map((_, j) => (
                            <Avatar key={j} className="inline-block border-2 border-white w-8 h-8 cursor-pointer hover:z-10 hover:scale-110 transition-transform"><AvatarImage src={`https://i.pravatar.cc/150?u=${c.id}${j}`} /><AvatarFallback>U</AvatarFallback></Avatar>
                        ))}
                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">+{c.selected_count - 5}</div>
                    </div>
                    <div className="flex gap-2">
                        <Button className="flex-1 h-8 text-xs" variant="secondary">콘텐츠 검수</Button>
                        <Button className="flex-1 h-8 text-xs" variant="outline">메시지 보내기</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 8. Minimal List
function MinimalListStyle() {
    return (
        <div className="divide-y">
            {MY_CAMPAIGNS.slice(0, 4).map((c, i) => (
                <div key={i} className="py-3 flex items-center justify-between group hover:bg-gray-50 px-2 cursor-pointer rounded">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-2 h-2 rounded-full ${c.status === 'Recruiting' ? 'bg-blue-500' : c.status === 'Ongoing' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className="text-sm font-medium truncate max-w-[200px] text-gray-700 group-hover:text-black">{c.title}</div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="text-gray-400 w-20 text-right">{c.status}</span>
                        <span className="font-mono w-24 text-right">{c.budget}</span>
                        <MoreHorizontal className="w-4 h-4 text-gray-300 group-hover:text-gray-600" />
                    </div>
                </div>
            ))}
        </div>
    )
}

// 9. Analytics Dashboard
function AnalyticsDashboardStyle() {
    return (
        <div className="space-y-4">
            {MY_CAMPAIGNS.slice(1, 3).map((c, i) => (
                <div key={i} className="bg-slate-900 text-white p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-xs text-slate-400 mb-1">{c.product}</div>
                            <h3 className="font-bold text-md">{c.title}</h3>
                        </div>
                        <Activity className="text-green-400 w-5 h-5" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t border-slate-700 pt-4">
                        <div>
                            <div className="text-xs text-slate-500">ROI</div>
                            <div className="font-bold text-green-400">{c.roi}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">Eng. Rate</div>
                            <div className="font-bold text-blue-400">{c.engagement_rate}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">Spend</div>
                            <div className="font-bold text-slate-200">{(parseInt(c.spent.replace(/,/g, '')) / 10000)}만</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 10. Detailed Accordion
function DetailedAccordionStyle() {
    return (
        <div className="border rounded-xl divide-y">
            {MY_CAMPAIGNS.slice(0, 2).map((c, i) => (
                <div key={i} className="p-4 bg-white">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-2 items-center">
                            <Badge variant="outline">{c.status}</Badge>
                            <h3 className="font-bold text-sm line-clamp-1">{c.title}</h3>
                        </div>
                        <Button size="sm" variant="ghost">Edit</Button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 grid grid-cols-2 gap-y-2">
                        <div><span className="font-bold mr-2">기간:</span>{c.start_date}~{c.end_date}</div>
                        <div><span className="font-bold mr-2">예산:</span>{c.budget}</div>
                        <div><span className="font-bold mr-2">채널:</span>{c.channels.join(', ')}</div>
                        <div><span className="font-bold mr-2">지원:</span>{c.applicants}명</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 11. Priority Badge
function PriorityBadgeStyle() {
    return (
        <div className="grid grid-cols-1 gap-3">
            {MY_CAMPAIGNS.slice(0, 2).map((c, i) => (
                <div key={i} className="flex bg-white shadow-sm border rounded-lg overflow-hidden">
                    <div className={`w-2 ${c.deadline.includes('D-') ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                    <div className="p-3 flex-1 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {c.deadline.includes('D-') && <Badge variant="destructive" className="h-5 text-[10px] px-1">Urgent</Badge>}
                                <h3 className="font-bold text-sm">{c.title}</h3>
                            </div>
                            <div className="text-xs text-gray-500">Deadline: {c.deadline} • {c.applicants} Applicants</div>
                        </div>
                        <Button size="sm" className="h-8">Review</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 12. Interactive Folder
function InteractiveFolderStyle() {
    return (
        <div className="grid grid-cols-2 gap-4">
            {MY_CAMPAIGNS.slice(0, 2).map((c, i) => (
                <div key={i} className="bg-amber-100 rounded-t-lg border-b-0 border border-amber-200 mt-2 relative hover:-translate-y-2 transition-transform cursor-pointer shadow-md">
                    <div className="absolute -top-2 left-0 w-1/3 h-3 bg-amber-200 rounded-t-lg border-t border-l border-r border-amber-300"></div>
                    <div className="p-4 bg-white rounded-b-lg rounded-tr-lg border border-gray-200 h-32 flex flex-col justify-between">
                        <div className="font-bold text-sm text-gray-800 line-clamp-2">{c.title}</div>
                        <div className="flex justify-between items-end">
                            <div className="text-[10px] text-gray-500 uppercase">{c.status}</div>
                            <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-bold">{c.applicants} Docs</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 13. Neumorphic Panel
function NeumorphicPanelStyle() {
    return (
        <div className="bg-[#e0e5ec] p-6 rounded-xl space-y-6">
            {MY_CAMPAIGNS.slice(0, 2).map((c, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[#e0e5ec] relative" style={{ boxShadow: "8px 8px 16px #b8b9be, -8px -8px 16px #ffffff" }}>
                    <div className="absolute top-4 right-4 text-gray-400"><MoreHorizontal className="w-5 h-5" /></div>
                    <h3 className="font-bold text-gray-700 mb-2">{c.title}</h3>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4 shadow-inner">
                        <div className="bg-blue-400 h-3 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-bold">
                        <div className="px-3 py-1 rounded-full bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff]">{c.status}</div>
                        <div className="px-3 py-1 rounded-full bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff]">{c.budget}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 14. Glass Overlay
function GlassOverlayStyle() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-r from-blue-400 to-indigo-500 p-6 rounded-xl">
            {MY_CAMPAIGNS.slice(0, 2).map((c, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <img src={c.image} className="w-10 h-10 rounded-full border-2 border-white/30" />
                        <div className="font-bold text-sm leading-tight">{c.title}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs bg-black/20 p-2 rounded-lg">
                        <div className="text-center border-r border-white/10">
                            <div className="opacity-70">Budget</div>
                            <div className="font-bold">{c.budget}</div>
                        </div>
                        <div className="text-center">
                            <div className="opacity-70">Spent</div>
                            <div className="font-bold">{c.spent}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 15. Retro Blueprint
function RetroBlueprintStyle() {
    return (
        <div className="bg-[#003366] p-6 rounded-lg font-mono border-2 border-white">
            {MY_CAMPAIGNS.slice(0, 2).map((c, i) => (
                <div key={i} className="border border-white/50 p-4 mb-4 text-blue-100 last:mb-0 relative grid-bg">
                    <div className="text-[10px] absolute top-1 right-2 opacity-70">REF: {c.id.toUpperCase()}</div>
                    <h3 className="font-bold text-white border-b border-white/30 pb-2 mb-2">{c.title}</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>STATUS: [{c.status.toUpperCase()}]</div>
                        <div>DEADLINE: {c.deadline}</div>
                        <div>BUDGET_ALLOC: {c.budget}</div>
                        <div>TARGET_MET: {c.progress}%</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 16. High Contrast Admin
function HighContrastAdminStyle() {
    return (
        <div className="border-4 border-black p-4 bg-white">
            <h3 className="bg-black text-white px-2 py-1 font-bold inline-block mb-4 uppercase">Campaign Control</h3>
            {MY_CAMPAIGNS.slice(0, 2).map((c, i) => (
                <div key={i} className="border-2 border-black mb-3 p-2 flex justify-between items-center hover:bg-yellow-200 transition-colors cursor-pointer">
                    <div>
                        <div className="font-bold text-sm">{c.title}</div>
                        <div className="text-xs font-bold mt-1">Status: {c.status}</div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-lg">{c.applicants}</div>
                        <div className="text-[10px] uppercase font-bold">Applicants</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 17. Bento Box
function BentoBoxStyle() {
    const c = MY_CAMPAIGNS[1]; // Ongoing campaign
    return (
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-48 bg-gray-50 p-2 rounded-xl">
            <div className="col-span-2 row-span-2 bg-white rounded-xl p-3 border flex flex-col justify-between">
                <div className="font-bold text-sm line-clamp-2">{c.title}</div>
                <Progress value={c.progress} className="h-2" />
            </div>
            <div className="col-span-1 bg-green-100 rounded-xl flex items-center justify-center flex-col">
                <div className="font-bold text-green-700">{c.selected_count}</div>
                <div className="text-[8px] text-green-600">Selected</div>
            </div>
            <div className="col-span-1 bg-blue-100 rounded-xl flex items-center justify-center flex-col">
                <div className="font-bold text-blue-700">{c.applicants}</div>
                <div className="text-[8px] text-blue-600">Apply</div>
            </div>
            <div className="col-span-2 bg-gray-800 text-white rounded-xl flex items-center px-4 justify-between">
                <span className="text-xs">Budget Spent</span>
                <span className="font-bold text-sm">50%</span>
            </div>
        </div>
    )
}

// 18. Floating Action
function FloatingActionCard() {
    return (
        <div className="space-y-4">
            {MY_CAMPAIGNS.slice(0, 2).map((c, i) => (
                <div key={i} className="bg-white shadow-lg rounded-2xl p-5 relative overflow-visible">
                    <div className="absolute -right-3 -top-3 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform">
                        <Edit className="w-4 h-4" />
                    </div>
                    <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">{c.status}</div>
                    <h3 className="font-bold text-lg mb-3">{c.title}</h3>
                    <div className="flex gap-2">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">{c.applicants} Applicants</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">{c.budget}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 19. Split View
function SplitViewStyle() {
    return (
        <div className="border rounded-lg overflow-hidden flex flex-col divide-y">
            {MY_CAMPAIGNS.slice(0, 2).map((c, i) => (
                <div key={i} className="flex h-24">
                    <div className="w-24 bg-gray-100 flex-shrink-0 relative">
                        <img src={c.image} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 w-full bg-black/50 text-white text-[10px] text-center">{c.status}</div>
                    </div>
                    <div className="flex-1 p-3 flex flex-col justify-center">
                        <h3 className="font-bold text-sm mb-1 line-clamp-1">{c.title}</h3>
                        <div className="text-xs text-gray-500 mb-2">{c.start_date} ~ {c.end_date}</div>
                        <div className="flex gap-4 text-xs font-medium">
                            <span>👥 {c.applicants}</span>
                            <span>💰 {c.budget}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 20. Magazine Editorial
function MagazineEditorialStyle() {
    return (
        <div className="grid grid-cols-2 gap-6 bg-[#f8f5f2] p-6">
            {MY_CAMPAIGNS.slice(0, 2).map((c, i) => (
                <div key={i} className="border-t-2 border-black pt-2">
                    <div className="flex justify-between items-baseline mb-2">
                        <span className="font-serif italic text-xs">Issue No. {i + 1}</span>
                        <span className="font-bold text-xs uppercase bg-black text-white px-1">{c.status}</span>
                    </div>
                    <h3 className="font-serif font-bold text-xl leading-none mb-3">{c.title}</h3>
                    <div className="flex gap-2 mb-3">
                        <div className="w-16 h-16 bg-gray-200 grayscale"><img src={c.image} className="w-full h-full object-cover" /></div>
                        <div className="text-[10px] leading-tight text-gray-600 flex-1">
                            <p>Product: {c.product}</p>
                            <p className="mt-1">Budget: {c.budget}</p>
                            <p className="mt-1 font-bold underline">Performance: {c.roi}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
