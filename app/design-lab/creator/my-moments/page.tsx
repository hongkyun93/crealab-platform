"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
    Calendar as CalendarIcon, Image as ImageIcon, Video, Eye,
    Heart, MessageCircle, BarChart2, Share2, MoreHorizontal,
    Clock, Globe, Lock, Edit2, Trash2, PlusCircle,
    Film, Grid, List as ListIcon, Maximize2
} from "lucide-react"

// --- Rich Realistic Mock Data (My Moments Context) ---
const MOMENT_DATA_POOL = [
    {
        id: "mm1",
        content: "오늘의 #OOTD 💙 새로 산 자켓이랑 매치해봤는데 어떤가요? #데일리룩 #패션",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
        date: "2024.08.15",
        time: "14:30",
        views: 1250,
        likes: 340,
        comments: 45,
        status: "Published",
        type: "Photo",
        platform: "Instagram"
    },
    {
        id: "mm2",
        content: "한남동 신상 카페 '아러바우트' 다녀왔어요! ☕ 분위기 깡패...",
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
        date: "2024.08.14",
        time: "10:15",
        views: 890,
        likes: 210,
        comments: 28,
        status: "Published",
        type: "Carousel",
        platform: "Blog"
    },
    {
        id: "mm3",
        content: "[광고] 닥터지 수딩 크림 일주일 사용 후기! 진정 효과 대박 👍",
        image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80",
        date: "2024.08.12",
        time: "19:00",
        views: 5600,
        likes: 1200,
        comments: 156,
        status: "Scheduled",
        type: "Video",
        platform: "YouTube"
    },
    {
        id: "mm4",
        content: "주말 브이로그 편집 중... 🎬 이번 편은 좀 길어질 것 같아요!",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
        date: "2024.08.10",
        time: "22:45",
        views: 0,
        likes: 0,
        comments: 0,
        status: "Draft",
        type: "Text",
        platform: "Twitter"
    },
    {
        id: "mm5",
        content: "여름 휴가 준비 끝! ✈️ 떠나요 제주도로~",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80",
        date: "2024.08.08",
        time: "09:00",
        views: 2300,
        likes: 560,
        comments: 89,
        status: "Published",
        type: "Photo",
        platform: "Instagram"
    }
]

const getRandomMoments = () => {
    return [...MOMENT_DATA_POOL].sort(() => 0.5 - Math.random()).slice(0, 3)
}

export default function MyMomentsPage() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        if (!selectedDesign) return <InstagramGridStyle />

        switch (selectedDesign) {
            case 1: return <InstagramGridStyle />;
            case 2: return <CalendarHeatmapStyle />;
            case 3: return <StoryCircleRow />;
            case 4: return <MetricDashboardRow />;
            case 5: return <TimelineJournalStyle />;
            case 6: return <PolaroidStackStyle />;
            case 7: return <VideoThumbnailGrid />;
            case 8: return <ContentPlannerKanban />;
            case 9: return <MinimalistListRow />;
            case 10: return <BlogArticleCard />;
            case 11: return <AnalyticGraphOverlay />;
            case 12: return <DraftFocusMode />;
            case 13: return <MobilePreviewCard />;
            case 14: return <PlatformSpecificTab />;
            case 15: return <MasonryGalleryStyle />;
            case 16: return <ArchiveFolderStyle />;
            case 17: return <InteractiveMapPin />;
            case 18: return <MoodboardCollage />;
            case 19: return <QuickEditWidget />;
            case 20: return <GamifiedStreakBar />;
            default: return <InstagramGridStyle />;
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">내 모먼트 디자인 랩</h1>
                <p className="text-muted-foreground">크리에이터의 콘텐츠 관리를 위한 20가지 모먼트 디자인을 확인해보세요.</p>
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
                                    case 1: return <InstagramGridStyle />;
                                    case 2: return <CalendarHeatmapStyle />;
                                    case 3: return <StoryCircleRow />;
                                    case 4: return <MetricDashboardRow />;
                                    case 5: return <TimelineJournalStyle />;
                                    case 6: return <PolaroidStackStyle />;
                                    case 7: return <VideoThumbnailGrid />;
                                    case 8: return <ContentPlannerKanban />;
                                    case 9: return <MinimalistListRow />;
                                    case 10: return <BlogArticleCard />;
                                    case 11: return <AnalyticGraphOverlay />;
                                    case 12: return <DraftFocusMode />;
                                    case 13: return <MobilePreviewCard />;
                                    case 14: return <PlatformSpecificTab />;
                                    case 15: return <MasonryGalleryStyle />;
                                    case 16: return <ArchiveFolderStyle />;
                                    case 17: return <InteractiveMapPin />;
                                    case 18: return <MoodboardCollage />;
                                    case 19: return <QuickEditWidget />;
                                    case 20: return <GamifiedStreakBar />;
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

// 1. Instagram Grid Style
function InstagramGridStyle() {
    const data = getRandomMoments()
    return (
        <div className="grid grid-cols-3 gap-1">
            {data.map((m, i) => (
                <div key={i} className="aspect-square relative group bg-gray-100 cursor-pointer">
                    <img src={m.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                        <span className="flex items-center"><Heart className="w-4 h-4 mr-1 fill-white" /> {m.likes}</span>
                        <span className="flex items-center"><MessageCircle className="w-4 h-4 mr-1 fill-white" /> {m.comments}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 2. Calendar Heatmap
function CalendarHeatmapStyle() {
    const data = getRandomMoments()
    return (
        <div className="bg-white border rounded-xl p-4">
            <div className="flex justify-between mb-4">
                <h3 className="font-bold text-sm">Content Activity</h3>
                <div className="flex gap-2 text-xs">
                    <span className="flex items-center"><div className="w-2 h-2 bg-green-100 mr-1 rounded"></div> Low</span>
                    <span className="flex items-center"><div className="w-2 h-2 bg-green-500 mr-1 rounded"></div> High</span>
                </div>
            </div>
            <div className="flex gap-1 justify-between overflow-x-auto pb-2">
                {[...Array(20)].map((_, i) => {
                    const intensity = Math.random() > 0.7 ? 'bg-green-500' : Math.random() > 0.4 ? 'bg-green-300' : 'bg-green-100';
                    return (
                        <div key={i} className={`w-8 h-8 rounded ${intensity} flex items-center justify-center text-[10px] text-white font-bold hover:ring-2 ring-offset-1 ring-green-500 cursor-pointer`}>
                            {i + 1}
                        </div>
                    )
                })}
            </div>
            <div className="mt-4 border-t pt-2 space-y-2">
                {data.slice(0, 2).map((m, i) => (
                    <div key={i} className="flex gap-2 text-xs items-center">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        <span className="text-gray-400">{m.time}</span>
                        <span className="truncate flex-1">{m.content}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 3. Story Circle Row
function StoryCircleRow() {
    const data = getRandomMoments()
    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    <PlusCircle className="w-6 h-6 text-gray-400" />
                </div>
                <span className="text-xs text-gray-500">Add Story</span>
            </div>
            {data.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 group-hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                            <img src={m.image} className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <span className="text-xs text-gray-700 truncate w-16 text-center">{m.date}</span>
                </div>
            ))}
        </div>
    )
}

// 4. Metric Dashboard Row
function MetricDashboardRow() {
    const data = getRandomMoments().slice(0, 3)
    return (
        <div className="space-y-4">
            {data.map((m, i) => (
                <div key={i} className="bg-white border rounded-xl p-4 flex gap-4 items-center shadow-sm">
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        <img src={m.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                            <Badge variant={m.status === 'Published' ? 'default' : 'secondary'} className="text-[10px] h-5">{m.status}</Badge>
                            <div className="text-xs text-gray-400">{m.date}</div>
                        </div>
                        <h4 className="font-bold text-sm truncate mb-2">{m.content}</h4>
                        <div className="flex gap-4 text-xs">
                            <div className="flex flex-col">
                                <span className="text-gray-400 text-[10px] uppercase">Views</span>
                                <span className="font-bold">{m.views.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-400 text-[10px] uppercase">Likes</span>
                                <span className="font-bold">{m.likes.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-400 text-[10px] uppercase">Eng. Rate</span>
                                <span className="font-bold text-green-600">4.5%</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 5. Timeline Journal
function TimelineJournalStyle() {
    const data = getRandomMoments()
    return (
        <div className="relative pl-8 space-y-8 font-serif">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-300 border-l border-dashed"></div>
            {data.map((m, i) => (
                <div key={i} className="relative">
                    <div className="absolute -left-[31px] top-0 w-3 h-3 bg-white border border-gray-400 rounded-full"></div>
                    <div className="text-sm font-bold text-gray-500 mb-2 italic">{m.date}, {m.time}</div>
                    <div className="bg-[#fdfbf7] p-4 shadow-sm border border-[#e8e4dc] rounded">
                        <p className="text-gray-800 mb-3 leading-relaxed">"{m.content}"</p>
                        <div className="w-32 rounded overflow-hidden">
                            <img src={m.image} className="w-full h-auto" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 6. Polaroid Stack
function PolaroidStackStyle() {
    const data = getRandomMoments()
    return (
        <div className="flex flex-wrap justify-center gap-4 relative py-4">
            {data.map((m, i) => (
                <div key={i} className="bg-white p-3 pb-8 shadow-md rotate-3 hover:scale-110 hover:rotate-0 hover:z-10 transition-all cursor-pointer border max-w-[150px]">
                    <div className="aspect-square bg-gray-100 mb-3 overflow-hidden">
                        <img src={m.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="font-handwriting text-center text-xs text-gray-600 truncate">{m.date} memory</div>
                </div>
            ))}
        </div>
    )
}

// 7. Video Thumbnail Grid
function VideoThumbnailGrid() {
    const data = getRandomMoments()
    return (
        <div className="grid grid-cols-2 gap-4">
            {data.map((m, i) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer">
                    <img src={m.image} className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                        </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1 rounded">00:15</div>
                </div>
            ))}
        </div>
    )
}

// 8. Content Planner Kanban
function ContentPlannerKanban() {
    const data = getRandomMoments()
    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            <div className="min-w-[200px] bg-gray-50 p-2 rounded-lg">
                <div className="font-bold text-xs text-gray-500 uppercase mb-3 px-1">Draft</div>
                <div className="bg-white p-3 rounded shadow-sm border mb-2">
                    <div className="h-16 bg-gray-100 rounded mb-2"></div>
                    <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
                </div>
            </div>
            <div className="min-w-[200px] bg-blue-50 p-2 rounded-lg">
                <div className="font-bold text-xs text-blue-500 uppercase mb-3 px-1">Scheduled</div>
                {data.slice(0, 1).map((m, i) => (
                    <div key={i} className="bg-white p-3 rounded shadow-sm border border-blue-100 mb-2">
                        <img src={m.image} className="h-24 w-full object-cover rounded mb-2" />
                        <div className="text-xs font-bold truncate mb-1">{m.content}</div>
                        <div className="text-[10px] text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> {m.date}</div>
                    </div>
                ))}
            </div>
            <div className="min-w-[200px] bg-green-50 p-2 rounded-lg">
                <div className="font-bold text-xs text-green-500 uppercase mb-3 px-1">Published</div>
                {data.slice(1, 3).map((m, i) => (
                    <div key={i} className="bg-white p-3 rounded shadow-sm border border-green-100 mb-2">
                        <div className="flex gap-2">
                            <img src={m.image} className="w-10 h-10 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs truncate font-bold">{m.content}</div>
                                <div className="text-[10px] text-green-600">Live</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 9. Minimalist List Row
function MinimalistListRow() {
    const data = getRandomMoments()
    return (
        <div className="divide-y">
            {data.map((m, i) => (
                <div key={i} className="flex items-center gap-4 py-3 group hover:bg-gray-50 px-2 cursor-pointer transition-colors">
                    <div className="text-xs font-mono text-gray-400 w-20">{m.date}</div>
                    <div className="flex-1 font-medium text-sm truncate group-hover:pl-2 transition-all">{m.content}</div>
                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center text-xs text-gray-500"><Eye className="w-3 h-3 mr-1" /> {m.views}</div>
                        <Button size="icon" variant="ghost" className="h-6 w-6"><Edit2 className="w-3 h-3" /></Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 10. Blog Article Card
function BlogArticleCard() {
    const data = getRandomMoments()
    return (
        <div className="space-y-6">
            {data.map((m, i) => (
                <div key={i} className="group cursor-pointer">
                    <div className="overflow-hidden rounded-xl mb-3 h-40">
                        <img src={m.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-[10px]">{m.platform}</Badge>
                        <span className="text-xs text-gray-400">{m.date}</span>
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors">{m.content}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                        Detailed description of the moment would go here, providing more context about the image and the story behind it...
                    </p>
                </div>
            ))}
        </div>
    )
}

// 11. Analytic Graph Overlay
function AnalyticGraphOverlay() {
    const data = getRandomMoments()
    return (
        <div className="grid grid-cols-2 gap-4">
            {data.map((m, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden group">
                    <img src={m.image} className="w-full h-full object-cover opacity-50 contrast-50" />
                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                        <div className="flex items-end gap-1 h-20 mb-2 items-end justify-center opacity-70">
                            {[40, 60, 30, 80, 50, 90, 70].map((h, j) => (
                                <div key={j} className="w-2 bg-white rounded-t-sm" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        <div className="flex justify-between items-end text-white border-t border-white/30 pt-2">
                            <div>
                                <div className="text-[10px] uppercase">Performance</div>
                                <div className="font-bold text-lg">+12.5%</div>
                            </div>
                            <BarChart2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 12. Draft Focus Mode
function DraftFocusMode() {
    const data = getRandomMoments().slice(0, 2)
    return (
        <div className="space-y-4">
            {data.map((m, i) => (
                <div key={i} className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center text-center bg-gray-50 hover:bg-white hover:border-blue-500 transition-all cursor-pointer">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                        <Edit2 className="w-5 h-5 text-gray-500" />
                    </div>
                    <h3 className="font-bold text-gray-700 mb-1">Continue Editing</h3>
                    <p className="text-sm text-gray-500 line-clamp-1 mb-4">"{m.content}"</p>
                    <div className="text-xs text-gray-400">Last saved {m.time}</div>
                </div>
            ))}
        </div>
    )
}

// 13. Mobile Preview Card
function MobilePreviewCard() {
    const data = getRandomMoments().slice(0, 1)
    return (
        <div className="flex justify-center">
            {data.map((m, i) => (
                <div key={i} className="max-w-[280px] w-full bg-white rounded-3xl border-8 border-black overflow-hidden shadow-xl">
                    <div className="h-6 bg-black flex justify-center items-center">
                        <div className="w-16 h-3 bg-gray-800 rounded-full"></div>
                    </div>
                    <div className="pb-4">
                        <div className="p-3 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                            <div className="text-xs font-bold">my_profile</div>
                        </div>
                        <div className="aspect-square bg-gray-100">
                            <img src={m.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                            <div className="flex gap-3 mb-2">
                                <Heart className="w-5 h-5" />
                                <MessageCircle className="w-5 h-5" />
                                <Share2 className="w-5 h-5" />
                            </div>
                            <div className="text-xs font-bold mb-1">{m.likes} likes</div>
                            <div className="text-xs">
                                <span className="font-bold mr-1">my_profile</span>
                                {m.content}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 14. Platform Specific Tab
function PlatformSpecificTab() {
    const data = getRandomMoments()
    return (
        <div className="bg-white border rounded-lg overflow-hidden">
            <div className="flex border-b">
                <div className="flex-1 py-3 text-center text-sm font-bold border-b-2 border-black">Instagram</div>
                <div className="flex-1 py-3 text-center text-sm font-bold text-gray-400 hover:bg-gray-50">YouTube</div>
                <div className="flex-1 py-3 text-center text-sm font-bold text-gray-400 hover:bg-gray-50">Blog</div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
                {data.slice(0, 2).map((m, i) => (
                    <div key={i} className="relative aspect-square">
                        <img src={m.image} className="w-full h-full object-cover rounded" />
                        <div className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-sm"><ImageIcon className="w-3 h-3" /></div>
                    </div>
                ))}
                <div className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded text-gray-400 hover:bg-gray-50 cursor-pointer">
                    <PlusCircle className="w-6 h-6 mb-1" />
                    <span className="text-xs">Add New</span>
                </div>
            </div>
        </div>
    )
}

// 15. Masonry Gallery
function MasonryGalleryStyle() {
    const data = getRandomMoments()
    return (
        <div className="columns-2 gap-4 space-y-4">
            {data.map((m, i) => (
                <div key={i} className="break-inside-avoid relative rounded-xl overflow-hidden group">
                    {/* Randomize heights for masonry effect */}
                    <div style={{ aspectRatio: i % 2 === 0 ? '3/4' : '4/3' }}>
                        <img src={m.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                        <div className="text-white text-xs font-bold truncate w-full">{m.content}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 16. Archive Folder
function ArchiveFolderStyle() {
    const data = getRandomMoments()
    return (
        <div className="grid grid-cols-2 gap-4">
            {data.map((m, i) => (
                <div key={i} className="relative mt-2">
                    <div className="absolute -top-2 left-0 w-1/3 h-4 bg-orange-100 rounded-t-lg border border-b-0 border-orange-200"></div>
                    <div className="bg-orange-50 border border-orange-200 rounded-b-lg rounded-tr-lg p-4 h-32 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div className="font-bold text-xs text-orange-800 uppercase tracking-widest">{m.date}</div>
                            <MoreHorizontal className="w-4 h-4 text-orange-400" />
                        </div>
                        <div className="font-serif text-sm text-orange-900 line-clamp-2">"{m.content}"</div>
                        <div className="text-xs text-orange-400 flex items-center"><Image className="w-3 h-3 mr-1" /> 1 item</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 17. Interactive Map Pin
function InteractiveMapPin() {
    const data = getRandomMoments()
    return (
        <div className="bg-blue-50 rounded-xl p-4 h-[300px] relative flex items-center justify-center overflow-hidden">
            {/* Abstract Map BG */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 to-transparent"></div>

            {data.slice(0, 3).map((m, i) => (
                <div key={i} className="absolute bg-white p-1 rounded shadow-lg flex flex-col items-center animate-bounce" style={{
                    top: `${20 + (i * 20)}%`,
                    left: `${20 + (i * 25)}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '3s'
                }}>
                    <img src={m.image} className="w-10 h-10 object-cover rounded mb-1" />
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-t-[8px] border-t-white border-r-[6px] border-r-transparent"></div>
                </div>
            ))}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                Seoul, Korea
            </div>
        </div>
    )
}

// 18. Moodboard Collage
function MoodboardCollage() {
    const data = getRandomMoments().slice(0, 3)
    return (
        <div className="relative h-[300px] bg-[#f0f0f0] p-4 overflow-hidden rounded-xl">
            {data.map((m, i) => (
                <div key={i} className="absolute bg-white p-2 shadow-lg transform transition-transform hover:z-20 hover:scale-105 cursor-pointer" style={{
                    top: `${i * 20}%`,
                    left: `${i * 20}%`,
                    transform: `rotate(${i * 10 - 10}deg)`,
                    width: '140px'
                }}>
                    <img src={m.image} className="w-full aspect-[3/4] object-cover mb-2 grayscale hover:grayscale-0 transition-all" />
                    <div className="text-[10px] bg-black text-white px-1 inline-block uppercase">Inspiration</div>
                </div>
            ))}
        </div>
    )
}

// 19. Quick Edit Widget
function QuickEditWidget() {
    const data = getRandomMoments()
    return (
        <div className="space-y-3">
            {data.map((m, i) => (
                <div key={i} className="bg-white p-2 rounded-lg border shadow-sm flex gap-3">
                    <img src={m.image} className="w-16 h-16 rounded object-cover" />
                    <div className="flex-1 flex flex-col justify-center">
                        <input type="text" className="text-sm font-bold border-b border-transparent hover:border-gray-200 focus:border-blue-500 outline-none transition-colors w-full mb-1 bg-transparent" defaultValue={m.content} />
                        <div className="flex gap-2">
                            <Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-gray-100">{m.status}</Badge>
                            <Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-gray-100">{m.date}</Badge>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center gap-1 border-l pl-2">
                        <Button size="icon" variant="ghost" className="h-6 w-6"><Edit2 className="w-3 h-3 text-blue-500" /></Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6"><Trash2 className="w-3 h-3 text-red-500" /></Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 20. Gamified Streak Bar
function GamifiedStreakBar() {
    const data = getRandomMoments()
    return (
        <div className="space-y-6 text-center">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-black mb-1">12 DAY</div>
                <div className="text-xs uppercase tracking-widest opacity-80 mb-4">Upload Streak 🔥</div>
                <div className="flex justify-center gap-2">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < 5 ? 'bg-white text-orange-500' : 'bg-white/30 text-white'}`}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {data.slice(0, 2).map((m, i) => (
                    <div key={i} className="bg-white border rounded-lg p-2 opacity-50">
                        <div className="text-xs text-gray-400 mb-1">Previous</div>
                        <img src={m.image} className="w-full h-20 object-cover rounded grayscale" />
                    </div>
                ))}
            </div>
        </div>
    )
}

function Image(props: any) { return <ImageIcon {...props} /> }
