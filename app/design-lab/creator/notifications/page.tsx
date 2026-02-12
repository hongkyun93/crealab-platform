"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
    Bell, MessageSquare, CheckCircle2, Clock, Calendar,
    FileText, DollarSign, MoreHorizontal, AlertCircle,
    Zap, Heart, UserPlus, Gift, TrendingUp, Briefcase,
    X, Check, Mail, Smartphone
} from "lucide-react"

// --- Rich Realistic Mock Data (Creator Notifications Context) ---
const NOTIFICATION_DATA_POOL = [
    {
        id: "nt1",
        type: "campaign_invite",
        title: "새로운 캠페인 제안 도착",
        message: "그랜드 조선 호텔에서 '라운지 체험단' 캠페인 참여를 제안했습니다.",
        time: "방금 전",
        brand: "Grand Josun",
        brandLogo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&q=80",
        isRead: false,
        action: "View Offer",
        isUrgent: false
    },
    {
        id: "nt2",
        type: "payment",
        title: "정산 완료 안내",
        message: "로지텍 G-Pro 캠페인 정산금 150,000원이 입금되었습니다.",
        time: "2시간 전",
        brand: "Logitech",
        brandLogo: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=150&q=80",
        isRead: true,
        action: "View History",
        isUrgent: false
    },
    {
        id: "nt3",
        type: "deadline",
        title: "콘텐츠 제출 마감 임박",
        message: "아로마티카 릴스 제작 마감이 2일 남았습니다. 서둘러주세요!",
        time: "1일 전",
        brand: "Aromatica",
        brandLogo: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=150&q=80",
        isRead: false,
        action: "Submit Draft",
        isUrgent: true
    },
    {
        id: "nt4",
        type: "social",
        title: "인기 게시물 선정",
        message: "지난주 업로드한 '성수동 카페' 게시물이 인기 게시물에 선정되었습니다! 🎉",
        time: "3일 전",
        brand: "System",
        brandLogo: "",
        isRead: true,
        action: "View Stats",
        isUrgent: false
    },
    {
        id: "nt5",
        type: "contract",
        title: "전자계약서 서명 요청",
        message: "젝시믹스 24SS 룩북 모델 계약서가 도착했습니다.",
        time: "5시간 전",
        brand: "Xexymix",
        brandLogo: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150&q=80",
        isRead: false,
        action: "Sign Now",
        isUrgent: false
    }
]

const getRandomNotifications = () => [...NOTIFICATION_DATA_POOL].slice(0, 3)

export default function CreatorNotificationsPage() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        if (!selectedDesign) return <TimelineListStyle />

        switch (selectedDesign) {
            case 1: return <TimelineListStyle />;
            case 2: return <ToastPopupStyle />;
            case 3: return <ActionableCardStyle />;
            case 4: return <GroupedByDateStyle />;
            case 5: return <UrgentPriorityStyle />;
            case 6: return <MinimalistDotStyle />;
            case 7: return <RichMediaPreviewStyle />;
            case 8: return <SwipeableDismissStyle />;
            case 9: return <InboxEmailStyle />;
            case 10: return <FloatingBubbleStyle />;
            case 11: return <MobileAppDrawerStyle />;
            case 12: return <CategorizedTabStyle />;
            case 13: return <InteractiveBannerStyle />;
            case 14: return <GamifiedRewardStyle />;
            case 15: return <CalendarEventStyle />;
            case 16: return <GlassmorphismAlert />;
            case 17: return <TickerTapeStyle />;
            case 18: return <DetailedLogStyle />;
            case 19: return <FocusModeOverlay />;
            case 20: return <VoiceAssistantStyle />;
            default: return <TimelineListStyle />;
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">알림 센터 디자인 랩</h1>
                <p className="text-muted-foreground">크리에이터를 위한 20가지 알림 및 메시지 디자인을 확인해보세요.</p>
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
                                    case 1: return <TimelineListStyle />;
                                    case 2: return <ToastPopupStyle />;
                                    case 3: return <ActionableCardStyle />;
                                    case 4: return <GroupedByDateStyle />;
                                    case 5: return <UrgentPriorityStyle />;
                                    case 6: return <MinimalistDotStyle />;
                                    case 7: return <RichMediaPreviewStyle />;
                                    case 8: return <SwipeableDismissStyle />;
                                    case 9: return <InboxEmailStyle />;
                                    case 10: return <FloatingBubbleStyle />;
                                    case 11: return <MobileAppDrawerStyle />;
                                    case 12: return <CategorizedTabStyle />;
                                    case 13: return <InteractiveBannerStyle />;
                                    case 14: return <GamifiedRewardStyle />;
                                    case 15: return <CalendarEventStyle />;
                                    case 16: return <GlassmorphismAlert />;
                                    case 17: return <TickerTapeStyle />;
                                    case 18: return <DetailedLogStyle />;
                                    case 19: return <FocusModeOverlay />;
                                    case 20: return <VoiceAssistantStyle />;
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

// 1. Timeline List Style
function TimelineListStyle() {
    const data = getRandomNotifications()
    return (
        <div className="space-y-6 relative pl-4">
            <div className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-gray-200"></div>
            {data.map((n, i) => (
                <div key={i} className="relative pl-8">
                    <div className={`absolute left-[11px] top-1 w-4 h-4 rounded-full border-2 border-white ${n.isRead ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs text-gray-500 font-mono">{n.time}</span>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                    </div>
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                        <div className="font-bold text-sm mb-1">{n.title}</div>
                        <div className="text-xs text-gray-600 mb-2">{n.message}</div>
                        {n.brandLogo && <div className="flex items-center gap-2 text-xs text-gray-400 font-bold"><img src={n.brandLogo} className="w-4 h-4 rounded-full" /> {n.brand}</div>}
                    </div>
                </div>
            ))}
        </div>
    )
}

// 2. Toast Popup Style
function ToastPopupStyle() {
    const data = getRandomNotifications().slice(0, 2)
    return (
        <div className="space-y-4 px-4">
            {data.map((n, i) => (
                <div key={i} className="bg-gray-900 text-white p-4 rounded-lg shadow-2xl flex gap-4 items-center animate-in slide-in-from-bottom-5 fade-in duration-500">
                    <div className={`p-2 rounded-full ${n.type === 'payment' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {getIcon(n.type)}
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-sm">{n.title}</div>
                        <div className="text-xs text-gray-400 line-clamp-1">{n.message}</div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-7 border-gray-600 hover:bg-gray-800 bg-transparent text-gray-300">{n.action}</Button>
                    <button className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
            ))}
        </div>
    )
}

// 3. Actionable Card Style
function ActionableCardStyle() {
    const data = getRandomNotifications()
    return (
        <div className="space-y-3">
            {data.map((n, i) => (
                <div key={i} className="bg-white border rounded-xl p-4 hover:border-blue-500 transition-colors group">
                    <div className="flex gap-4">
                        <Avatar className="h-10 w-10"><AvatarImage src={n.brandLogo} /><AvatarFallback>{n.brand[0]}</AvatarFallback></Avatar>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-sm">{n.title}</h4>
                                <span className="text-[10px] text-gray-400">{n.time}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 mb-3">{n.message}</p>
                            <div className="flex gap-2">
                                <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700">{n.action}</Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs">Dismiss</Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 4. Grouped by Date
function GroupedByDateStyle() {
    const data = getRandomNotifications()
    return (
        <div className="space-y-6">
            <div>
                <div className="text-xs font-bold text-gray-400 uppercase mb-3 px-2">Today</div>
                <div className="bg-white rounded-xl border divide-y">
                    {data.slice(0, 2).map((n, i) => (
                        <div key={i} className="p-4 flex gap-3 hover:bg-gray-50">
                            <div className="mt-1">{getIcon(n.type)}</div>
                            <div>
                                <div className="text-sm font-medium">{n.message}</div>
                                <div className="text-xs text-gray-400 mt-1">{n.time} • {n.brand}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <div className="text-xs font-bold text-gray-400 uppercase mb-3 px-2">Yesterday</div>
                <div className="bg-white rounded-xl border divide-y">
                    {data.slice(2, 3).map((n, i) => (
                        <div key={i} className="p-4 flex gap-3 hover:bg-gray-50">
                            <div className="mt-1">{getIcon(n.type)}</div>
                            <div>
                                <div className="text-sm font-medium">{n.message}</div>
                                <div className="text-xs text-gray-400 mt-1">{n.time} • {n.brand}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// 5. Urgent Priority Style
function UrgentPriorityStyle() {
    const data = getRandomNotifications()
    return (
        <div className="space-y-3">
            {data.map((n, i) => (
                <div key={i} className={`p-4 rounded-lg flex gap-4 items-center ${n.type === 'deadline' || n.type === 'payment' ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-transparent'}`}>
                    {n.type === 'deadline' ? <AlertCircle className="text-red-500 w-5 h-5" /> : <Bell className="text-gray-400 w-5 h-5" />}
                    <div className="flex-1">
                        <div className={`font-bold text-sm ${n.type === 'deadline' ? 'text-red-700' : 'text-gray-900'}`}>{n.title}</div>
                        <div className="text-xs opacity-80">{n.message}</div>
                    </div>
                    {n.type === 'deadline' && <Badge variant="destructive" className="animate-pulse">URGENT</Badge>}
                </div>
            ))}
        </div>
    )
}

// 6. Minimalist Dot Style
function MinimalistDotStyle() {
    const data = getRandomNotifications()
    return (
        <div className="bg-white rounded-2xl shadow-sm border p-2">
            {data.map((n, i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer group">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                    <Avatar className="h-8 w-8"><AvatarImage src={n.brandLogo} /></Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                            <span className={`text-sm truncate ${!n.isRead ? 'font-bold' : 'font-normal'}`}>{n.message}</span>
                            <span className="text-[10px] text-gray-400 shrink-0 ml-2 group-hover:text-blue-500">{n.time}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 7. Rich Media Preview
function RichMediaPreviewStyle() {
    const data = getRandomNotifications().slice(0, 2)
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((n, i) => (
                <div key={i} className="border rounded-lg overflow-hidden group">
                    {n.brandLogo && (
                        <div className="h-24 bg-gray-100 overflow-hidden relative">
                            <img src={n.brandLogo.replace('w=150', 'w=500')} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-2 left-2 text-white font-bold text-sm shadow-sm">{n.brand}</div>
                        </div>
                    )}
                    <div className="p-3">
                        <h4 className="font-bold text-xs mb-1">{n.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{n.message}</p>
                        <Button size="sm" variant="secondary" className="w-full text-xs h-7">{n.action}</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 8. Swipeable Dismiss
function SwipeableDismissStyle() {
    const data = getRandomNotifications()
    return (
        <div className="space-y-2 overflow-hidden">
            {data.map((n, i) => (
                <div key={i} className="relative group bg-white border rounded-lg shadow-sm">
                    {/* Background Actions */}
                    <div className="absolute inset-y-0 right-0 w-20 bg-red-500 rounded-r-lg flex items-center justify-center text-white z-0">
                        <X className="w-5 h-5" />
                    </div>
                    <div className="absolute inset-y-0 left-0 w-20 bg-blue-500 rounded-l-lg flex items-center justify-center text-white z-0">
                        <Check className="w-5 h-5" />
                    </div>

                    {/* Foreground Card */}
                    <div className="relative z-10 bg-white p-4 rounded-lg flex gap-3 transition-transform hover:translate-x-[-10px] active:translate-x-[-40px]">
                        <div className="mt-0.5 text-gray-400">{getIcon(n.type)}</div>
                        <div>
                            <h4 className="font-bold text-sm">{n.title}</h4>
                            <p className="text-xs text-gray-500">{n.message}</p>
                        </div>
                    </div>
                </div>
            ))}
            <div className="text-center text-xs text-gray-400 mt-2">Swipe left to dismiss, right to mark read</div>
        </div>
    )
}

// 9. Inbox Email Style
function InboxEmailStyle() {
    const data = getRandomNotifications()
    return (
        <div className="bg-white border rounded shadow-sm">
            {data.map((n, i) => (
                <div key={i} className={`flex items-start gap-4 p-4 border-b last:border-0 hover:bg-gray-50 cursor-pointer ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                    <div className="mt-1">
                        <input type="checkbox" className="rounded border-gray-300" />
                    </div>
                    <Star className={`w-4 h-4 mt-1 ${n.isUrgent ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                            <span className={`text-sm ${!n.isRead ? 'font-bold' : ''}`}>{n.brand}</span>
                            <span className="text-xs text-gray-400">{n.time}</span>
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                            <span className="font-bold text-gray-900 mr-2">{n.title}</span>
                            - {n.message}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 10. Floating Bubble
function FloatingBubbleStyle() {
    const data = getRandomNotifications()
    return (
        <div className="flex gap-4 p-4 overflow-x-auto">
            {data.map((n, i) => (
                <div key={i} className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full bg-white shadow-lg border-2 border-white overflow-hidden p-1 cursor-pointer hover:scale-110 transition-transform">
                        <img src={n.brandLogo || 'https://github.com/shadcn.png'} className="w-full h-full rounded-full object-cover" />
                    </div>
                    {!n.isRead && (
                        <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-sm border-2 border-white">
                            1
                        </div>
                    )}
                    <div className="text-center text-[10px] font-bold mt-1 max-w-[64px] truncate">{n.brand}</div>
                </div>
            ))}
        </div>
    )
}

// 11. Mobile App Drawer
function MobileAppDrawerStyle() {
    const data = getRandomNotifications()
    return (
        <div className="max-w-[300px] mx-auto bg-gray-900 text-white rounded-t-3xl p-4 min-h-[300px] relative mt-10">
            <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6"></div>
            <h3 className="font-bold text-xl mb-4 px-2">Notifications</h3>
            <div className="space-y-4">
                {data.map((n, i) => (
                    <div key={i} className="flex gap-4 p-2 rounded-xl hover:bg-white/10 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                            {getIcon(n.type)}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">{n.title}</h4>
                            <p className="text-xs text-gray-400">{n.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 12. Categorized Tab Style
function CategorizedTabStyle() {
    const data = getRandomNotifications()
    return (
        <div>
            <div className="flex gap-2 mb-4">
                <Badge variant="default" className="bg-black hover:bg-gray-800">All</Badge>
                <Badge variant="secondary">Offers</Badge>
                <Badge variant="secondary">System</Badge>
                <Badge variant="secondary">Comments</Badge>
            </div>
            <div className="space-y-2">
                {data.map((n, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg border flex justify-between items-center text-sm">
                        <div>
                            <span className="font-bold mr-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 uppercase">{n.type}</span>
                            <span>{n.title}</span>
                        </div>
                        <Button size="icon" variant="ghost" className="h-6 w-6"><ChevronRight className="w-4 h-4 text-gray-400" /></Button>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 13. Interactive Banner
function InteractiveBannerStyle() {
    const n = getRandomNotifications()[0]
    return (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-1/2 -translate-y-1/2">
                <Bell className="w-40 h-40" />
            </div>
            <Badge className="bg-white/20 text-white hover:bg-white/30 mb-4">{n.type.toUpperCase()}</Badge>
            <h3 className="text-2xl font-bold mb-2">{n.title}</h3>
            <p className="text-white/80 mb-6 max-w-sm mx-auto">{n.message}</p>
            <div className="flex gap-3 justify-center">
                <Button className="bg-white text-purple-600 hover:bg-gray-100 font-bold border-0">{n.action}</Button>
                <Button variant="outline" className="text-white border-white/40 hover:bg-white/10">Dismiss</Button>
            </div>
        </div>
    )
}

// 14. Gamified Reward Style
function GamifiedRewardStyle() {
    const data = getRandomNotifications().slice(0, 1)
    return (
        <div className="flex justify-center">
            {data.map((n, i) => (
                <div key={i} className="bg-white border-2 border-yellow-400 rounded-2xl p-6 text-center shadow-lg transform rotate-1 max-w-sm">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Gift className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-1 text-gray-900">Congatulations!</h3>
                    <p className="text-gray-500 text-sm mb-4">You've unlocked a new opportunity with {n.brand}.</p>
                    <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono text-gray-600 mb-4">
                        {n.message}
                    </div>
                    <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-500 font-bold">Claim Reward</Button>
                </div>
            ))}
        </div>
    )
}

// 15. Calendar Event Style
function CalendarEventStyle() {
    const data = getRandomNotifications()
    return (
        <div className="space-y-3">
            {data.map((n, i) => (
                <div key={i} className="flex bg-white rounded-lg border shadow-sm overflow-hidden">
                    <div className="bg-blue-50 p-4 flex flex-col items-center justify-center min-w-[70px] border-r border-blue-100">
                        <div className="text-xs text-blue-500 font-bold uppercase">AUG</div>
                        <div className="text-2xl font-black text-blue-700">{Math.floor(Math.random() * 30) + 1}</div>
                    </div>
                    <div className="p-3 flex items-center gap-3">
                        <div className="w-1 h-8 bg-gray-200 rounded-full"></div>
                        <div>
                            <h4 className="font-bold text-sm">{n.title}</h4>
                            <div className="text-xs text-gray-500">{n.time} • Duration: 1h</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 16. Glassmorphism Alert
function GlassmorphismAlert() {
    const data = getRandomNotifications().slice(0, 2)
    return (
        <div className="bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80')] bg-cover p-8 rounded-2xl space-y-4">
            {data.map((n, i) => (
                <div key={i} className="bg-white/40 backdrop-blur-lg border border-white/50 p-4 rounded-xl shadow-lg flex justify-between items-center text-white">
                    <div className="flex gap-3 items-center">
                        <div className="bg-black/20 p-2 rounded-full"><Bell className="w-4 h-4 text-white" /></div>
                        <div>
                            <div className="font-bold text-sm text-gray-900">{n.title}</div>
                            <div className="text-xs text-gray-800">{n.brand}</div>
                        </div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_red]"></div>
                </div>
            ))}
        </div>
    )
}

// 17. Ticker Tape Style
function TickerTapeStyle() {
    const data = getRandomNotifications()
    return (
        <div className="bg-black text-white p-3 rounded overflow-hidden flex gap-8 whitespace-nowrap">
            <div className="flex gap-8 animate-marquee"> {/* Note: animate-marquee needs CSS */}
                {data.map((n, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400">{n.brand}</Badge>
                        <span className="text-sm font-mono">{n.message}</span>
                        <span className="text-xs text-gray-500 mx-2">+++</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 18. Detailed Log Style
function DetailedLogStyle() {
    const data = getRandomNotifications()
    return (
        <div className="font-mono text-xs bg-gray-50 p-4 rounded border">
            {data.map((n, i) => (
                <div key={i} className="mb-2">
                    <span className="text-gray-400">[{n.time}]</span>{' '}
                    <span className={`font-bold ${n.type === 'payment' ? 'text-green-600' : 'text-blue-600'}`}>{n.type.toUpperCase()}</span>{' '}
                    <span>{n.message}</span>{' '}
                    <span className="text-gray-400">{'{'}id:{n.id}{'}'}</span>
                </div>
            ))}
            <div className="animate-pulse">_</div>
        </div>
    )
}

// 19. Focus Mode Overlay
function FocusModeOverlay() {
    const n = getRandomNotifications()[0]
    return (
        <div className="relative h-[250px] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]"></div>
            <div className="relative bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm border">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Bell className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{n.title}</h3>
                <p className="text-sm text-gray-500 mb-6">{n.message}</p>
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline">Dismiss</Button>
                    <Button>Accept</Button>
                </div>
            </div>
        </div>
    )
}

// 20. Voice Assistant Style
function VoiceAssistantStyle() {
    const n = getRandomNotifications()[0]
    return (
        <div className="flex flex-col items-center justify-center h-[200px] bg-black text-white rounded-2xl relative shadow-xl">
            <div className="flex gap-1 mb-6 h-8 items-center">
                <div className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 animate-pulse h-4 rounded-full"></div>
                <div className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 animate-pulse h-8 rounded-full animation-delay-100"></div>
                <div className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 animate-pulse h-6 rounded-full animation-delay-200"></div>
                <div className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 animate-pulse h-3 rounded-full animation-delay-300"></div>
            </div>
            <p className="font-medium text-lg text-center px-4">"{n.message}"</p>
            <div className="text-xs text-gray-500 mt-2">Siri Suggestion</div>
        </div>
    )
}

function getIcon(type: string) {
    switch (type) {
        case 'campaign_invite': return <Briefcase className="w-5 h-5" />
        case 'payment': return <DollarSign className="w-5 h-5" />
        case 'deadline': return <Clock className="w-5 h-5" />
        case 'social': return <TrendingUp className="w-5 h-5" />
        case 'contract': return <FileText className="w-5 h-5" />
        default: return <Bell className="w-5 h-5" />
    }
}

function ChevronRight(props: any) { return <div {...props}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg></div> }
function Star(props: any) { return <div {...props}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg></div> }
