"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MoreVertical, Eye, Heart, Calendar, Plus, Edit2, Trash2 } from "lucide-react"

// --- Mock Data (Reusing for consistency) ---
// --- Mock Data (Realistic Korean Content) ---
const MY_MOMENTS = [
    {
        id: "m1",
        title: "오사카 유니버셜 스튜디오 꿀팁 대방출! 🇯🇵",
        date: "2024.07.25",
        views: "12.5k",
        likes: 890,
        status: "Live",
        image: "https://images.unsplash.com/photo-1524823775317-10c00cc55044?w=800&q=80"
    },
    {
        id: "m2",
        title: "자취생 현실 룸투어 (6평 원룸 인테리어)",
        date: "2024.06.15",
        views: "45k",
        likes: 2100,
        status: "Live",
        image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80"
    },
    {
        id: "m3",
        title: "[vlog] 프리랜서 개발자의 하루 (재택근무, 카페)",
        date: "2024.05.02",
        views: "8.9k",
        likes: 320,
        status: "Completed",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
    },
    {
        id: "m4",
        title: "다이어트 도시락 레시피 5가지 (식비 절약)",
        date: "2024.04.20",
        views: "120k",
        likes: 5400,
        status: "Completed",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80"
    }
]

export default function MyMomentsDesignLab() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        switch (selectedDesign) {
            case 1: return <AdminDashboardGrid />;
            case 2: return <LinearManagementList />;
            default: return <AdminDashboardGrid />;
        }
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Custom Header (Matches User Request) */}
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">내 모먼트 관리</h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                            등록한 모먼트를 관리하고 브랜드 제안을 확인하세요.
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center border-b">
                    <div className="flex gap-8">
                        <div className="pb-3 border-b-2 border-black font-bold text-sm cursor-pointer">진행중인 모먼트 (3)</div>
                        <div className="pb-3 text-gray-500 font-medium text-sm cursor-pointer hover:text-gray-900">완료된 모먼트 (12)</div>
                        <div className="pb-3 text-gray-500 font-medium text-sm cursor-pointer hover:text-gray-900">숨김/보관 (0)</div>
                    </div>
                    <div className="pb-2">
                        <Button className="bg-black hover:bg-gray-800 text-white gap-2 h-9 px-4 text-xs">
                            <span>+</span> 새 모먼트 등록
                        </Button>
                    </div>
                </div>
            </div>

            {/* PREVIEW AREA */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border-2 border-dashed border-slate-200">
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

            {/* #1 Dashboard Grid */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">#1. Admin Dashboard Grid</h3>
                    <Button size="sm" onClick={() => handleSelect(1)} disabled={selectedDesign === 1}>Select</Button>
                </div>
                <AdminDashboardGrid />
            </section>

            {/* #2 List View */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">#2. Linear Management List</h3>
                    <Button size="sm" onClick={() => handleSelect(2)} disabled={selectedDesign === 2}>Select</Button>
                </div>
                <LinearManagementList />
            </section>
        </div>
    )
}

function AdminDashboardGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-dashed border-2 flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary cursor-pointer h-full min-h-[200px]">
                <Plus className="h-8 w-8 mb-2" />
                <span className="font-medium">새 모먼트 만들기</span>
            </Card>
            {MY_MOMENTS.map((moment, i) => (
                <Card key={i} className="relative group">
                    <div className="absolute top-2 right-2 z-10">
                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="h-32 w-full bg-gray-100 rounded-t-lg overflow-hidden">
                        <img src={moment.image} className="w-full h-full object-cover" />
                    </div>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-sm">{moment.title}</h4>
                            <Badge variant={moment.status === 'Live' ? 'default' : 'secondary'} className="text-[10px]">{moment.status}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex gap-3">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {moment.date}</span>
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {moment.views}</span>
                        </div>
                        <div className="flex gap-2 mt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="outline" className="flex-1 h-8">수정</Button>
                            <Button size="sm" variant="outline" className="flex-1 h-8 text-red-500 hover:text-red-600">종료</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function LinearManagementList() {
    return (
        <div className="bg-white border rounded-lg overflow-hidden">
            <div className="p-3 border-b bg-gray-50 text-xs font-semibold text-gray-500 flex text-center">
                <div className="w-16">Image</div>
                <div className="flex-1 text-left px-4">Title</div>
                <div className="w-24">Date</div>
                <div className="w-20">Stats</div>
                <div className="w-20">Status</div>
                <div className="w-20">Action</div>
            </div>
            {MY_MOMENTS.map((moment, i) => (
                <div key={i} className="p-3 border-b flex items-center text-sm hover:bg-gray-50 text-center">
                    <div className="w-16 h-10 bg-gray-200 rounded overflow-hidden">
                        <img src={moment.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-left px-4 font-medium">{moment.title}</div>
                    <div className="w-24 text-gray-500 text-xs">{moment.date}</div>
                    <div className="w-20 text-xs text-gray-400">
                        {moment.views} views
                    </div>
                    <div className="w-20">
                        <div className={`inline-block w-2 h-2 rounded-full ${moment.status === 'Live' ? 'bg-green-50' : 'bg-gray-300'} mr-1`} />
                        {moment.status}
                    </div>
                    <div className="w-20 flex justify-center gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7"><Edit2 className="h-3 w-3" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
