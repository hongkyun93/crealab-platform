"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Bell, MessageSquare, CheckCircle2, AlertCircle, Clock,
    Gift, Truck, Heart, Star, UserPlus, Zap, Filter,
    Mail, Calendar, Briefcase, DollarSign, Settings, X,
    ChevronRight, Info
} from "lucide-react"

// --- Rich Realistic Mock Data (Notification Context) ---
const NOTIFICATION_DATA_POOL = [
    {
        id: "nt1",
        type: "message",
        title: "새로운 메시지가 도착했습니다",
        message: "작가님께서 '그랜드 조선 호텔' 캠페인 초안을 제출하셨습니다. 확인 후 피드백 부탁드립니다.",
        sender: "여행하는 소니",
        senderAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
        time: "방금 전",
        isRead: false,
        category: "Project",
        priority: "High",
        link: "/workspace/ws1"
    },
    {
        id: "nt2",
        type: "scout",
        title: "제안 수락",
        message: "테크몽키님이 '게이밍 키보드' 캠페인 제안을 수락했습니다. 계약서를 발송해주세요.",
        sender: "테크몽키",
        senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
        time: "1시간 전",
        isRead: true,
        category: "Scout",
        priority: "Medium",
        link: "/workspace/ws2"
    },
    {
        id: "nt3",
        type: "system",
        title: "충전 필요",
        message: "크레딧 잔액이 부족합니다. 원활한 캠페인 진행을 위해 충전해주세요.",
        sender: "System",
        senderAvatar: null,
        time: "3시간 전",
        isRead: false,
        category: "Billing",
        priority: "Critical",
        link: "/billing"
    },
    {
        id: "nt4",
        type: "delivery",
        title: "배송 완료",
        message: "보내신 제품(무드 가습기)이 데일리 제니님께 배송 완료되었습니다.",
        sender: "CJ대한통운",
        senderAvatar: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=150&q=80",
        time: "어제",
        isRead: true,
        category: "Delivery",
        priority: "Low",
        link: "/shipping"
    },
    {
        id: "nt5",
        type: "review",
        title: "리뷰 등록 알림",
        message: "뷰티 멘토 리사님이 '유기농 스킨케어' 캠페인 최종 리뷰를 등록했습니다.",
        sender: "뷰티 멘토 리사",
        senderAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
        time: "2일 전",
        isRead: true,
        category: "Project",
        priority: "High",
        link: "/reviews"
    }
]

// Helper to get 3-4 random notifications
const getRandomNotifications = () => {
    return [...NOTIFICATION_DATA_POOL].sort(() => 0.5 - Math.random()).slice(0, 3)
}

export default function NotificationCenterPage() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        if (!selectedDesign) return <ClassicListStyle />

        switch (selectedDesign) {
            case 1: return <ClassicListStyle />;
            case 2: return <TimelineStreamStyle />;
            case 3: return <ToastPopupStyle />;
            case 4: return <GroupedByDateStyle />;
            case 5: return <ActionableCardStyle />;
            case 6: return <MinimalistDotStyle />;
            case 7: return <RichMediaStyle />;
            case 8: return <SidebarUtilityStyle />;
            case 9: return <PriorityFocusStyle />;
            case 10: return <SlackThreadStyle />;
            case 11: return <MobileAppDrawerStyle />;
            case 12: return <CategoriesTabStyle />;
            case 13: return <InteractiveDismissStyle />;
            case 14: return <UrgentAlertStyle />;
            case 15: return <SystemLogStyle />;
            case 16: return <EmailInboxStyle />;
            case 17: return <BadgeOverlayStyle />;
            case 18: return <FloatingBubbleStyle />;
            case 19: return <MatrixDigitalStyle />;
            case 20: return <GamifiedRewardStyle />;
            default: return <ClassicListStyle />;
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">알림 센터 디자인 랩</h1>
                <p className="text-muted-foreground">다양한 상황에 맞는 20가지 알림 카드 디자인을 확인해보세요.</p>
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
                                    case 1: return <ClassicListStyle />;
                                    case 2: return <TimelineStreamStyle />;
                                    case 3: return <ToastPopupStyle />;
                                    case 4: return <GroupedByDateStyle />;
                                    case 5: return <ActionableCardStyle />;
                                    case 6: return <MinimalistDotStyle />;
                                    case 7: return <RichMediaStyle />;
                                    case 8: return <SidebarUtilityStyle />;
                                    case 9: return <PriorityFocusStyle />;
                                    case 10: return <SlackThreadStyle />;
                                    case 11: return <MobileAppDrawerStyle />;
                                    case 12: return <CategoriesTabStyle />;
                                    case 13: return <InteractiveDismissStyle />;
                                    case 14: return <UrgentAlertStyle />;
                                    case 15: return <SystemLogStyle />;
                                    case 16: return <EmailInboxStyle />;
                                    case 17: return <BadgeOverlayStyle />;
                                    case 18: return <FloatingBubbleStyle />;
                                    case 19: return <MatrixDigitalStyle />;
                                    case 20: return <GamifiedRewardStyle />;
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

// 1. Classic List Style
function ClassicListStyle() {
    const data = getRandomNotifications()
    return (
        <div className="bg-white border rounded-xl divide-y">
            {data.map((n, i) => (
                <div key={i} className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                    <Avatar className="w-10 h-10 border">
                        <AvatarImage src={n.senderAvatar || ''} />
                        <AvatarFallback>{n.sender[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between mb-1">
                            <h4 className="font-bold text-sm text-gray-900">{n.title}</h4>
                            <span className="text-xs text-gray-500">{n.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{n.message}</p>
                    </div>
                    {!n.isRead && <div className="mt-2 w-2 h-2 rounded-full bg-blue-500"></div>}
                </div>
            ))}
        </div>
    )
}

// 2. Timeline Stream
function TimelineStreamStyle() {
    const data = getRandomNotifications()
    return (
        <div className="relative pl-4 space-y-6">
            <div className="absolute top-0 bottom-0 left-[19px] w-[2px] bg-gray-200"></div>
            {data.map((n, i) => (
                <div key={i} className="relative pl-8">
                    <div className="absolute left-[12px] top-1 w-4 h-4 rounded-full border-2 border-white bg-blue-500 shadow-sm z-10"></div>
                    <div className="text-xs text-gray-400 mb-1">{n.time}</div>
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                        <div className="font-bold text-sm mb-1">{n.title}</div>
                        <div className="text-sm text-gray-600">{n.message}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 3. Toast Popup Style
function ToastPopupStyle() {
    const data = getRandomNotifications().slice(0, 2)
    return (
        <div className="space-y-4">
            {data.map((n, i) => (
                <div key={i} className="bg-slate-800 text-white p-4 rounded-lg shadow-lg flex items-start gap-4 max-w-sm ml-auto animate-in slide-in-from-right-5">
                    <div className="p-2 bg-slate-700 rounded-full">
                        {n.category === 'Project' ? <MessageSquare className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">{n.title}</h4>
                        <p className="text-xs text-slate-300">{n.message}</p>
                    </div>
                    <button className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
            ))}
        </div>
    )
}

// 4. Grouped By Date
function GroupedByDateStyle() {
    const data = getRandomNotifications()
    return (
        <div className="space-y-6">
            <div>
                <h4 className="font-bold text-xs text-gray-500 uppercase mb-3 ml-2">Today</h4>
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden divide-y">
                    {data.slice(0, 2).map((n, i) => (
                        <div key={i} className="p-4 flex gap-3 text-sm">
                            <div className="text-gray-400 w-12 text-xs pt-1">{n.time.replace(' 전', '')}</div>
                            <div>
                                <span className="font-bold">{n.sender}</span>
                                <span className="text-gray-600"> {n.message}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// 5. Actionable Card
function ActionableCardStyle() {
    const data = getRandomNotifications()
    return (
        <div className="space-y-4">
            {data.map((n, i) => (
                <div key={i} className="bg-white border rounded-lg p-4">
                    <div className="flex gap-3 mb-3">
                        <Avatar className="w-8 h-8"><AvatarImage src={n.senderAvatar || ''} /></Avatar>
                        <div>
                            <div className="font-bold text-sm">{n.title}</div>
                            <div className="text-xs text-gray-500">{n.time}</div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded">{n.message}</p>
                    <div className="flex gap-2">
                        <Button size="sm" className="flex-1 h-8 text-xs">확인하기</Button>
                        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">나중에</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 6. Minimalist Dot
function MinimalistDotStyle() {
    const data = getRandomNotifications()
    return (
        <div className="bg-white rounded-2xl shadow-sm border p-2">
            {data.map((n, i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer group">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    <div className="flex-1 truncate">
                        <span className="font-bold text-sm mr-2">{n.sender}</span>
                        <span className="text-sm text-gray-500 truncate">{n.message}</span>
                    </div>
                    <span className="text-xs text-gray-300 group-hover:text-gray-500">{n.time}</span>
                </div>
            ))}
        </div>
    )
}

// 7. Rich Media Style
function RichMediaStyle() {
    const data = getRandomNotifications().slice(0, 2)
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((n, i) => (
                <div key={i} className="border rounded-xl overflow-hidden">
                    <div className="h-24 bg-gray-100 relative">
                        {n.senderAvatar && <img src={n.senderAvatar} className="w-full h-full object-cover opacity-50" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                            <h4 className="text-white font-bold">{n.title}</h4>
                        </div>
                    </div>
                    <div className="p-4 bg-white">
                        <p className="text-sm text-gray-600 mb-3">{n.message}</p>
                        <div className="text-xs text-gray-400 text-right">{n.time}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 8. Sidebar Utility
function SidebarUtilityStyle() {
    const data = getRandomNotifications()
    return (
        <div className="w-72 border-l bg-gray-50 h-full p-4 overflow-y-auto">
            <div className="text-xs font-bold text-gray-500 uppercase mb-4">Notifications</div>
            <div className="space-y-3">
                {data.map((n, i) => (
                    <div key={i} className="bg-white p-3 rounded border shadow-sm text-xs">
                        <div className="flex justify-between mb-1">
                            <span className="font-bold text-blue-600">{n.category}</span>
                            <span className="text-gray-400">{n.time}</span>
                        </div>
                        <p className="text-gray-700 leading-snug">{n.message}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 9. Priority Focus
function PriorityFocusStyle() {
    const data = getRandomNotifications()
    return (
        <div className="space-y-4">
            {data.map((n, i) => (
                <div key={i} className={`flex items-start gap-4 p-4 rounded-lg border-l-4 ${n.priority === 'Critical' ? 'bg-red-50 border-red-500' : n.priority === 'High' ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-200'}`}>
                    <div className={`p-2 rounded-full ${n.priority === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] h-5">{n.priority}</Badge>
                            <h4 className="font-bold text-sm">{n.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{n.message}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 10. Slack Thread Style
function SlackThreadStyle() {
    const data = getRandomNotifications()
    return (
        <div className="space-y-1 font-sans">
            {data.map((n, i) => (
                <div key={i} className="flex gap-3 hover:bg-gray-100 p-2 rounded -mx-2 items-start group">
                    <div className="w-9 h-9 bg-black rounded text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {n.sender[0]}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-sm">{n.sender}</span>
                            <span className="text-[10px] text-gray-400">{n.time}</span>
                        </div>
                        <p className="text-sm text-gray-800">{n.message}</p>
                        <div className="mt-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs bg-white border px-1 rounded shadow-sm cursor-pointer">👍 1</span>
                            <span className="text-xs bg-white border px-1 rounded shadow-sm cursor-pointer">Reply</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 11. Mobile App Drawer
function MobileAppDrawerStyle() {
    const data = getRandomNotifications()
    return (
        <div className="max-w-sm mx-auto bg-gray-100 rounded-3xl overflow-hidden border-8 border-gray-900 h-[400px] relative">
            <div className="bg-white p-4 pt-8 sticky top-0 z-10 shadow-sm">
                <h3 className="font-bold text-lg">Activity</h3>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto h-full pb-20">
                {data.map((n, i) => (
                    <div key={i} className="bg-white p-3 rounded-2xl flex gap-3 shadow-sm">
                        <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                            <Bell className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold mb-0.5">{n.title}</p>
                            <p className="text-[10px] text-gray-500 leading-tight">{n.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 12. Categories Tab
function CategoriesTabStyle() {
    const data = getRandomNotifications()
    return (
        <div className="bg-white border rounded-xl overflow-hidden">
            <div className="flex border-b text-xs font-bold text-gray-500">
                <div className="flex-1 py-3 text-center border-b-2 border-black text-black">All</div>
                <div className="flex-1 py-3 text-center hover:bg-gray-50">Mentions</div>
                <div className="flex-1 py-3 text-center hover:bg-gray-50">System</div>
            </div>
            <div className="divide-y">
                {data.map((n, i) => (
                    <div key={i} className="p-4 flex gap-4 items-center">
                        <div className={`w-2 h-2 rounded-full ${n.priority === 'High' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                        <div className="flex-1 text-sm">
                            <span className="font-bold">{n.sender}</span> {n.title}
                        </div>
                        <Button size="icon" variant="ghost" className="h-6 w-6"><ChevronRight className="w-4 h-4 text-gray-300" /></Button>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 13. Interactive Dismiss
function InteractiveDismissStyle() {
    const data = getRandomNotifications()
    return (
        <div className="space-y-2">
            {data.map((n, i) => (
                <div key={i} className="bg-white border rounded-lg p-3 flex gap-3 items-center group relative overflow-hidden">
                    <div className="absolute inset-y-0 right-0 w-16 bg-red-500 flex items-center justify-center text-white translate-x-full group-hover:translate-x-0 transition-transform cursor-pointer">
                        <X className="w-5 h-5" />
                    </div>
                    <Avatar className="w-8 h-8"><AvatarImage src={n.senderAvatar || ''} /></Avatar>
                    <div className="flex-1 pr-16">
                        <div className="text-sm font-bold truncate">{n.title}</div>
                        <div className="text-xs text-gray-500 truncate">{n.message}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 14. Urgent Alert
function UrgentAlertStyle() {
    const data = getRandomNotifications().slice(0, 2)
    return (
        <div className="space-y-4">
            {data.map((n, i) => (
                <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-4">
                    <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                    <div>
                        <h4 className="font-bold text-red-900 text-sm">Attention Needed</h4>
                        <p className="text-sm text-red-800 mt-1">{n.message}</p>
                        <div className="mt-3 flex gap-4 text-xs font-bold text-red-700">
                            <span className="cursor-pointer hover:underline">View Details</span>
                            <span className="cursor-pointer hover:underline">Dismiss</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 15. System Log Style
function SystemLogStyle() {
    const data = getRandomNotifications()
    return (
        <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-lg shadow-inner h-[200px] overflow-y-auto">
            {data.map((n, i) => (
                <div key={i} className="mb-2 border-b border-green-900/50 pb-2 last:border-0">
                    <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span> <span className="text-white font-bold">{n.type.toUpperCase()}</span>: {n.message}
                </div>
            ))}
            <div className="animate-pulse">_</div>
        </div>
    )
}

// 16. Email Inbox
function EmailInboxStyle() {
    const data = getRandomNotifications()
    return (
        <div className="bg-white border rounded divide-y">
            {data.map((n, i) => (
                <div key={i} className={`flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer ${!n.isRead ? 'font-bold bg-white' : 'text-gray-600 bg-gray-50/50'}`}>
                    <div className="w-4 h-4 border rounded border-gray-300"></div>
                    <Star className={`w-4 h-4 ${i === 0 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    <div className="w-32 truncate">{n.sender}</div>
                    <div className="flex-1 truncate">
                        <span>{n.title}</span> <span className="text-gray-400 font-normal">- {n.message}</span>
                    </div>
                    <div className="text-xs text-gray-400 w-16 text-right">{n.time}</div>
                </div>
            ))}
        </div>
    )
}

// 17. Badge Overlay
function BadgeOverlayStyle() {
    const data = getRandomNotifications().slice(0, 3)
    return (
        <div className="flex gap-4 justify-center">
            {data.map((n, i) => (
                <div key={i} className="relative">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer">
                        {n.category === 'Message' ? <Mail className="w-6 h-6 text-gray-600" /> : <Bell className="w-6 h-6 text-gray-600" />}
                    </div>
                    {!n.isRead && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                            1
                        </div>
                    )}
                    <div className="text-[10px] text-center mt-1 text-gray-500 truncate w-16">{n.sender}</div>
                </div>
            ))}
        </div>
    )
}

// 18. Floating Bubble
function FloatingBubbleStyle() {
    const data = getRandomNotifications().slice(0, 2)
    return (
        <div className="space-y-4">
            {data.map((n, i) => (
                <div key={i} className="bg-white/80 backdrop-blur border shadow-xl rounded-full p-2 pr-6 flex items-center gap-3 w-fit">
                    <Avatar className="w-10 h-10"><AvatarImage src={n.senderAvatar || ''} /></Avatar>
                    <div className="max-w-[200px]">
                        <div className="font-bold text-xs">{n.sender}</div>
                        <div className="text-xs truncate">{n.message}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// 19. Matrix Digital
function MatrixDigitalStyle() {
    const data = getRandomNotifications()
    return (
        <div className="space-y-2">
            {data.map((n, i) => (
                <div key={i} className="border border-green-500/30 bg-black/90 p-3 rounded text-green-500 font-mono text-xs relative overflow-hidden group">
                    <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors"></div>
                    <div className="flex justify-between mb-1 relative z-10">
                        <span className="font-bold">>> INCOMING_MSG_{i + 1}</span>
                        <span>{n.time.toUpperCase()}</span>
                    </div>
                    <p className="opacity-80 relative z-10">{n.message}</p>
                </div>
            ))}
        </div>
    )
}

// 20. Gamified Reward
function GamifiedRewardStyle() {
    const data = getRandomNotifications().slice(0, 2)
    return (
        <div className="space-y-4">
            {data.map((n, i) => (
                <div key={i} className="bg-gradient-to-r from-purple-500 to-indigo-600 p-1 rounded-xl">
                    <div className="bg-white rounded-lg p-4 flex gap-4 items-center">
                        <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                            <Gift className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-indigo-900 text-sm">Challenge Updated!</h4>
                            <p className="text-xs text-gray-600">{n.message}</p>
                        </div>
                        <Button size="sm" className="bg-indigo-600 text-white h-7 text-xs">Collect</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
