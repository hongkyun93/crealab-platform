"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, X, Calendar, MapPin, Tag, Heart, Eye, MessageSquare, Share2, MoreHorizontal, Clock, AlertCircle, FileText, Send, DollarSign, Briefcase, Camera, Video, Image as ImageIcon, Sparkles, User, Globe, Lock, ArrowRight, Instagram, Youtube, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// --- Mock Data (Rich & Complete) ---
const MOMENT_DATA = {
    id: "m-12345",
    influencer: {
        name: "김수민",
        handle: "soomin_daily",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        followers: 45200,
        tags: ["#일상", "#뷰티", "#여행"],
        isVerified: true
    },
    title: "성수동 팝업스토어 투어 브이로그",
    description: "이번 주말 성수동에서 열리는 트렌디한 팝업스토어 3곳을 방문할 예정입니다. 힙한 공간 분위기와 함께 자연스럽게 제품이 노출될 수 있는 상황입니다. 특히 2030 여성 타겟의 패션/뷰티 브랜드와 잘 어울릴 것 같아요. 방문할 곳: 디올 성수, 탬버린즈, 아더에러.",
    guide: "1. 팝업스토어 입구 컷 필수 (OOTD 자연스럽게)\n2. 제품 체험하는 클로즈업 샷 (텍스처/발색 강조)\n3. 스토어 내부 분위기와 제품이 어우러지는 감성샷\n4. 솔직하고 긍정적인 사용 후기 (30초 이상)",
    targetProduct: "립틴트, 쿠션파운데이션, 미니백, 선글라스",
    category: "뷰티/패션",
    tags: ["#성수동", "#팝업스토어", "#핫플레이스", "#OOTD", "#주말나들이"],
    isPrivate: false,
    eventDate: "2024-05-25",
    postingDate: "2024-05-28", // 3 days after event
    dateFlexible: true,
    schedule: {
        product_delivery: "2024-05-18",
        draft_submission: "2024-05-22",
        shooting: "2024-05-25",
        feedback: "2024-05-26",
        upload: "2024-05-28"
    },
    price_video: 300000,
    price_feed: 150000,
    stats: {
        avgLikes: 1200,
        avgComments: 45,
        engagementRate: "3.2%"
    }
}

// --- Icons Helper ---
const ChannelIcon = ({ channel }: { channel: string }) => {
    switch (channel) {
        case 'instagram': return <Instagram className="h-4 w-4 text-pink-600" />
        case 'youtube': return <Youtube className="h-4 w-4 text-red-600" />
        default: return <Globe className="h-4 w-4 text-slate-500" />
    }
}

// --- Variation Wrapper ---
const VariationWrapper = ({ title, children, index }: { title: string, children: React.ReactNode, index: number }) => (
    <div className="border rounded-xl p-6 bg-slate-50/50 space-y-4">
        <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-slate-500">Variation {index + 1}</Badge>
            <h3 className="font-semibold text-slate-700">{title}</h3>
        </div>
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden min-h-[400px]">
            {children}
        </div>
    </div>
)

export default function MomentSearchDialogsPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/design-lab/brand/moment-search">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                            Moment Detail Design Variations
                        </h1>
                        <p className="text-xs text-slate-500">20 Different Ways to Display Moment Information</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6 grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* Variation 1: Classic Modal Style */}
                <VariationWrapper title="Classic Modal" index={0}>
                    <div className="p-6 max-w-2xl mx-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={MOMENT_DATA.influencer.avatar} />
                                    <AvatarFallback>SC</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-lg font-bold">{MOMENT_DATA.title}</h2>
                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                        by {MOMENT_DATA.influencer.name}
                                        {MOMENT_DATA.influencer.isVerified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
                                    </p>
                                </div>
                            </div>
                            <Button>제안하기</Button>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm">일정</CardTitle></CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <div className="flex justify-between"><span>이벤트</span> <span className="font-medium">{MOMENT_DATA.eventDate}</span></div>
                                    <div className="flex justify-between"><span>업로드</span> <span className="font-medium">{MOMENT_DATA.postingDate}</span></div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm">예상 비용</CardTitle></CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <div className="flex justify-between"><span>숏폼</span> <span className="font-medium">{MOMENT_DATA.price_video.toLocaleString()}원</span></div>
                                    <div className="flex justify-between"><span>피드</span> <span className="font-medium">{MOMENT_DATA.price_feed.toLocaleString()}원</span></div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">상세 설명</h3>
                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg">{MOMENT_DATA.description}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">제작 가이드</h3>
                                <div className="text-sm text-slate-600 bg-indigo-50/50 border border-indigo-100 p-4 rounded-lg whitespace-pre-line">
                                    {MOMENT_DATA.guide}
                                </div>
                            </div>
                        </div>
                    </div>
                </VariationWrapper>

                {/* Variation 2: Right Drawer (Sheet) */}
                <VariationWrapper title="Right Drawer (Sheet)" index={1}>
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b flex items-center gap-4 bg-slate-50">
                            <Avatar>
                                <AvatarImage src={MOMENT_DATA.influencer.avatar} />
                                <AvatarFallback>In</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg leading-none">{MOMENT_DATA.title}</h3>
                                <span className="text-xs text-slate-500">{MOMENT_DATA.influencer.handle}</span>
                            </div>
                            <Button variant="outline" size="icon"><X className="h-4 w-4" /></Button>
                        </div>
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    {MOMENT_DATA.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                                </div>

                                <section>
                                    <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-slate-400" /> Description
                                    </h4>
                                    <p className="text-sm text-slate-600">{MOMENT_DATA.description}</p>
                                </section>

                                <Separator />

                                <section>
                                    <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400" /> Full Schedule
                                    </h4>
                                    <div className="relative border-l-2 border-slate-200 ml-2 pl-4 space-y-4 py-2">
                                        {Object.entries(MOMENT_DATA.schedule).map(([key, date]) => (
                                            <div key={key} className="relative">
                                                <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-300 border-2 border-white" />
                                                <p className="text-xs text-slate-500 uppercase font-medium">{key.replace('_', ' ')}</p>
                                                <p className="text-sm font-medium">{date as string}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t bg-white">
                            <Button className="w-full bg-black hover:bg-slate-800">Start Collaboration</Button>
                        </div>
                    </div>
                </VariationWrapper>

                {/* Variation 3: Split View */}
                <VariationWrapper title="Split View Info/Visual" index={2}>
                    <div className="grid grid-cols-2 h-full min-h-[500px]">
                        <div className="bg-slate-900 text-white p-8 flex flex-col justify-between">
                            <div>
                                <Badge className="bg-white/20 hover:bg-white/30 text-white mb-4 border-none">{MOMENT_DATA.category}</Badge>
                                <h2 className="text-2xl font-bold mb-4 leading-tight">{MOMENT_DATA.title}</h2>
                                <div className="flex items-center gap-3 mb-8">
                                    <Avatar className="h-8 w-8 ring-2 ring-white/20">
                                        <AvatarImage src={MOMENT_DATA.influencer.avatar} />
                                    </Avatar>
                                    <div className="text-sm">
                                        <p className="font-medium">{MOMENT_DATA.influencer.name}</p>
                                        <p className="text-slate-400">@{MOMENT_DATA.influencer.handle}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                                    <span className="text-slate-400">Followers</span>
                                    <span className="font-bold">{MOMENT_DATA.influencer.followers.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                                    <span className="text-slate-400">Avg. Likes</span>
                                    <span className="font-bold">{MOMENT_DATA.stats.avgLikes.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                                    <span className="text-slate-400">Engagement</span>
                                    <span className="font-bold">{MOMENT_DATA.stats.engagementRate}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-white overflow-y-auto">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold mb-2 text-slate-900">About this Moment</h3>
                                    <p className="text-slate-600 text-sm">{MOMENT_DATA.description}</p>
                                </div>
                                <div>
                                    <h3 className="font-bold mb-2 text-slate-900">Target Product</h3>
                                    <div className="bg-pink-50 text-pink-700 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        {MOMENT_DATA.targetProduct}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold mb-2 text-slate-900">Suggested Action</h3>
                                    <Button className="w-full">Select for Campaign</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </VariationWrapper>

                {/* Variation 4: Sticky Header Card */}
                <VariationWrapper title="Sticky Header Card" index={3}>
                    <div className="relative h-full">
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-lg" />
                        <div className="relative pt-16 px-6 pb-6">
                            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <Badge className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">{MOMENT_DATA.schedule.upload}</Badge>
                                        <h2 className="text-xl font-bold">{MOMENT_DATA.title}</h2>
                                    </div>
                                    <Avatar className="h-16 w-16 border-4 border-white shadow-sm -mt-10 bg-white">
                                        <AvatarImage src={MOMENT_DATA.influencer.avatar} />
                                    </Avatar>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center border-t border-b py-4 mb-4">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">D-Day</div>
                                        <div className="font-bold text-slate-900">{MOMENT_DATA.eventDate}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Platform</div>
                                        <div className="font-bold text-slate-900 flex justify-center gap-1">
                                            <Instagram className="h-4 w-4" />
                                            <Youtube className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Cost</div>
                                        <div className="font-bold text-slate-900">{(MOMENT_DATA.price_video / 10000)}만~</div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 mb-4">{MOMENT_DATA.description}</p>
                                <Button className="w-full rounded-full" size="lg">Contact Creator</Button>
                            </div>
                        </div>
                    </div>
                </VariationWrapper>

                {/* Variation 5: Ticket Stub Style */}
                <VariationWrapper title="Ticket Stub Style" index={4}>
                    <div className="bg-slate-100 p-8 flex items-center justify-center">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                            <div className="p-6 flex-1 border-r border-dashed border-slate-300 relative">
                                <div className="absolute -right-3 top-0 bottom-0 flex flex-col justify-between py-2">
                                    {[...Array(8)].map((_, i) => <div key={i} className="w-6 h-6 rounded-full bg-slate-100 -mr-3" />)}
                                </div>
                                <div className="mb-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">BOARDING PASS</h3>
                                    <h2 className="text-xl font-black text-slate-900">{MOMENT_DATA.title}</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                                    <div>
                                        <span className="text-xs text-slate-400 block">CREATOR</span>
                                        <span className="font-bold">{MOMENT_DATA.influencer.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 block">DATE</span>
                                        <span className="font-bold">{MOMENT_DATA.eventDate}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 block">DESTINATION</span>
                                        <span className="font-bold truncate">{MOMENT_DATA.tags[0]}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 block">SEAT</span>
                                        <span className="font-bold">VIP</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {MOMENT_DATA.tags.slice(0, 2).map(t => <Badge key={t} variant="outline" className="rounded-none border-slate-900 text-slate-900">{t}</Badge>)}
                                </div>
                            </div>
                            <div className="bg-slate-900 p-6 w-full md:w-32 flex flex-col items-center justify-center text-white relative">
                                <div className="absolute -left-3 top-0 bottom-0 flex flex-col justify-between py-2">
                                    {[...Array(8)].map((_, i) => <div key={i} className="w-6 h-6 rounded-full bg-slate-100 -ml-3" />)}
                                </div>
                                <div className="rotate-90 md:rotate-0 text-center">
                                    <div className="text-2xl font-bold mb-2">QR</div>
                                    <div className="w-16 h-16 bg-white p-1 mb-2">
                                        <div className="w-full h-full bg-black/10" />
                                    </div>
                                    <div className="text-[10px] text-slate-400">SCAN TO VIEW</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </VariationWrapper>

                {/* Variation 6: Timeline Focused */}
                <VariationWrapper title="Timeline Focused" index={5}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-6">Production Schedule</h2>
                        <div className="space-y-0">
                            {[
                                { label: "Delivery", date: MOMENT_DATA.schedule.product_delivery, icon: Package, done: true },
                                { label: "Draft", date: MOMENT_DATA.schedule.draft_submission, icon: FileText, done: false },
                                { label: "Feedback", date: MOMENT_DATA.schedule.feedback, icon: MessageSquare, done: false },
                                { label: "Upload", date: MOMENT_DATA.schedule.upload, icon: Send, done: false, active: true },
                            ].map((step, i, arr) => (
                                <div key={step.label} className="flex gap-4 relative group">
                                    {i !== arr.length - 1 && (
                                        <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-slate-100 group-hover:bg-blue-100 transition-colors" />
                                    )}
                                    <div className={`h-10 w-10 
                                            rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-300
                                            ${step.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' :
                                            step.done ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}
                                    `}>
                                        <step.icon className="h-5 w-5" />
                                    </div>
                                    <div className="pb-8 pt-1">
                                        <h3 className={`font-bold ${step.active ? 'text-blue-600' : 'text-slate-900'}`}>{step.label}</h3>
                                        <p className="text-sm text-slate-500 mb-1">{step.date}</p>
                                        {step.active && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Target Date</Badge>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </VariationWrapper>

                {/* Variation 7: Influencer Profile Focus */}
                <VariationWrapper title="Influencer Profile Focus" index={6}>
                    <div className="text-center p-8 bg-gradient-to-br from-pink-50 via-white to-purple-50">
                        <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white shadow-md">
                            <AvatarImage src={MOMENT_DATA.influencer.avatar} />
                        </Avatar>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{MOMENT_DATA.influencer.name}</h2>
                        <p className="text-slate-500 mb-6">@{MOMENT_DATA.influencer.handle}</p>

                        <div className="flex justify-center gap-8 mb-8">
                            <div className="text-center">
                                <div className="text-2xl font-black text-slate-900">45.2K</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Followers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-black text-slate-900">3.2%</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Engagement</div>
                            </div>
                        </div>

                        <Card className="text-left bg-white/80 backdrop-blur border-none shadow-sm mb-6">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-yellow-500" /> Current Moment
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-semibold text-lg mb-2">{MOMENT_DATA.title}</p>
                                <p className="text-sm text-slate-600 line-clamp-2">{MOMENT_DATA.description}</p>
                            </CardContent>
                        </Card>

                        <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 border-none text-white shadow-lg shadow-purple-200">
                            Partner with {MOMENT_DATA.influencer.name}
                        </Button>
                    </div>
                </VariationWrapper>

                {/* Variation 8: Guide Document Style */}
                <VariationWrapper title="Guide Document Style" index={7}>
                    <div className="p-8 bg-[#fffdf5] font-serif text-slate-800 h-full">
                        <div className="border-b-2 border-slate-900 pb-4 mb-6">
                            <h2 className="text-3xl font-black tracking-tight mb-2">CREATIVE BRIEF</h2>
                            <div className="flex justify-between text-xs font-sans uppercase tracking-widest text-slate-500">
                                <span>Ref: {MOMENT_DATA.id}</span>
                                <span>Date: {MOMENT_DATA.eventDate}</span>
                            </div>
                        </div>

                        <div className="space-y-6 font-sans">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Objective</h3>
                                <p className="text-lg font-medium leading-relaxed">{MOMENT_DATA.description}</p>
                            </div>

                            <div className="bg-white border p-4 shadow-sm -rotate-1 relative">
                                <div className="absolute -top-3 left-4 bg-yellow-300 px-2 py-1 text-xs font-bold shadow-sm rotate-1">MUST HAVES</div>
                                <pre className="whitespace-pre-line text-sm text-slate-700 font-mono leading-relaxed">
                                    {MOMENT_DATA.guide}
                                </pre>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Target</h3>
                                    <p className="font-bold border-b border-slate-200 pb-1">{MOMENT_DATA.targetProduct}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Upload</h3>
                                    <p className="font-bold border-b border-slate-200 pb-1 text-red-600">{MOMENT_DATA.postingDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </VariationWrapper>

                {/* Variation 9: Dark Mode Cyber */}
                <VariationWrapper title="Dark Mode Cyber" index={8}>
                    <div className="bg-slate-950 text-slate-200 p-6 h-full font-mono relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-4">
                            <div>
                                <div className="text-xs text-purple-400 mb-1">SYSTEM_ID: {MOMENT_DATA.id}</div>
                                <h2 className="text-xl font-bold text-white tracking-tight">{MOMENT_DATA.title}</h2>
                            </div>
                            <Badge variant="outline" className="border-purple-500 text-purple-400 bg-purple-500/10">ACTIVE</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-900 border border-slate-800 p-4 rounded">
                                <span className="text-xs text-slate-500 block mb-2">INFLUENCER_NODE</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 bg-slate-800 rounded-full" />
                                    <span className="font-bold text-sm">{MOMENT_DATA.influencer.handle}</span>
                                </div>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 p-4 rounded">
                                <span className="text-xs text-slate-500 block mb-2">TARGET_VECTOR</span>
                                <span className="font-bold text-sm text-white truncate block">{MOMENT_DATA.targetProduct}</span>
                            </div>
                        </div>

                        <div className="space-y-2 mb-8">
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>PROGRESS</span>
                                <span>35%</span>
                            </div>
                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full w-[35%] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                            </div>
                        </div>

                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold border border-purple-400/20">
                            INITIATE_PROTOCOL
                        </Button>
                    </div>
                </VariationWrapper>

                {/* Variation 10: Instagram Post Style */}
                <VariationWrapper title="Social Media Feed" index={9}>
                    <div className="max-w-md mx-auto bg-white h-full flex flex-col">
                        <div className="flex items-center justify-between p-3 border-b">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={MOMENT_DATA.influencer.avatar} />
                                </Avatar>
                                <span className="text-sm font-semibold">{MOMENT_DATA.influencer.handle}</span>
                            </div>
                            <MoreHorizontal className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="aspect-square bg-slate-100 flex items-center justify-center text-slate-400">
                            <ImageIcon className="h-12 w-12 opacity-50" />
                            <span className="sr-only">Image Placeholder</span>
                        </div>
                        <div className="p-3 space-y-3">
                            <div className="flex justify-between">
                                <div className="flex gap-4">
                                    <Heart className="h-6 w-6" />
                                    <MessageSquare className="h-6 w-6" />
                                    <Send className="h-6 w-6" />
                                </div>
                                <div className="bg-black text-white text-xs px-2 py-1 rounded font-bold">
                                    PROPOSAL
                                </div>
                            </div>
                            <div>
                                <span className="font-semibold text-sm mr-2">{MOMENT_DATA.influencer.handle}</span>
                                <span className="text-sm text-slate-800">{MOMENT_DATA.title} {MOMENT_DATA.description}</span>
                            </div>
                            <div className="text-blue-900 text-sm">
                                {MOMENT_DATA.tags.map(t => <span key={t} className="mr-1">{t}</span>)}
                            </div>
                            <div className="text-xs text-slate-400 uppercase">
                                {MOMENT_DATA.eventDate}
                            </div>
                        </div>
                    </div>
                </VariationWrapper>
            </div>

            {/* Placeholder for remaining variations */}
            <div className="container mx-auto px-6 py-12 text-center text-slate-400 text-sm">
                + 10 More Variations (Implementing...)
                {/* Note: In a real scenario I would implement all 20, but due to context length limits 
                    I'm starting with 10 high-quality ones. I can add the next 10 in a follow-up if requested or append now.
                    Let's append 5 more for density. */}
            </div>

            <div className="container mx-auto p-6 grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Variation 11: Business Card / Professional */}
                <VariationWrapper title="Business Card" index={10}>
                    <div className="h-full flex items-center justify-center p-8 bg-slate-200">
                        <Card className="w-full max-w-lg shadow-xl border-t-4 border-t-indigo-600">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">{MOMENT_DATA.influencer.name}</h2>
                                        <p className="text-indigo-600 font-medium">Content Creator</p>
                                    </div>
                                    <div className="text-right text-sm text-slate-500">
                                        <p>{MOMENT_DATA.influencer.handle}</p>
                                        <p>Seoul, Korea</p>
                                    </div>
                                </div>
                                <Separator className="mb-8" />
                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Project</h3>
                                        <p className="font-semibold">{MOMENT_DATA.title}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Budget Est.</h3>
                                        <p className="font-semibold">{MOMENT_DATA.price_video.toLocaleString()} KRW</p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline">Profile</Button>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700">Contact Now</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </VariationWrapper>

                {/* Variation 12: Calendar Focus */}
                <VariationWrapper title="Calendar Detailed" index={11}>
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-16 w-16 bg-red-50 text-red-600 rounded-xl flex flex-col items-center justify-center border border-red-100 shadow-sm">
                                <span className="text-xs font-bold uppercase">MAY</span>
                                <span className="text-2xl font-black">25</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{MOMENT_DATA.title}</h2>
                                <Badge variant="secondary">{MOMENT_DATA.category}</Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
                            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-6">
                            {[...Array(31)].map((_, i) => {
                                const day = i + 1;
                                // Simple mock checking
                                const isEvent = day === 25;
                                const isUpload = day === 28;
                                const isToday = day === 12;
                                return (
                                    <div key={day} className={`
                                        aspect-square flex items-center justify-center rounded-md text-sm
                                        ${isEvent ? 'bg-red-600 text-white font-bold' : ''}
                                        ${isUpload ? 'bg-blue-600 text-white font-bold' : ''}
                                        ${isToday ? 'border border-slate-900 font-bold' : 'text-slate-700 hover:bg-slate-100'}
                                    `}>
                                        {day}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex gap-4 text-xs justify-center mb-6">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-600" /> Event</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600" /> Upload</div>
                        </div>
                        <Button className="w-full" variant="secondary">Sync to Calendar</Button>
                    </div>
                </VariationWrapper>

                {/* Variation 13: Chat Interface Style */}
                <VariationWrapper title="Chat Proposal" index={12}>
                    <div className="bg-slate-100 p-4 h-full flex flex-col">
                        <div className="bg-white p-3 shadow-sm rounded-lg mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-green-500 rounded-full" />
                                <span className="font-bold text-sm">Direct Message</span>
                            </div>
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex items-end gap-2">
                                <Avatar className="h-8 w-8 mb-1">
                                    <AvatarImage src={MOMENT_DATA.influencer.avatar} />
                                </Avatar>
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm max-w-[85%] text-sm">
                                    <p className="font-bold mb-1">Hi Brand! 👋</p>
                                    <p>I'm planning a visit to Seongsu pop-ups this weekend ({MOMENT_DATA.eventDate}).</p>
                                    <p className="mt-2 text-slate-600 italic">"{MOMENT_DATA.title}"</p>
                                </div>
                            </div>
                            <div className="flex items-end gap-2">
                                <Avatar className="h-8 w-8 mb-1 opacity-0">
                                    <AvatarImage src={MOMENT_DATA.influencer.avatar} />
                                </Avatar>
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm max-w-[85%] text-sm">
                                    <p className="mb-2">I'm looking for <strong>{MOMENT_DATA.targetProduct}</strong> to feature.</p>
                                    <div className="bg-slate-50 p-2 rounded border text-xs text-slate-500">
                                        Schedule: Upload by {MOMENT_DATA.schedule.upload}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-br-none shadow-sm max-w-[85%] text-sm">
                                    <p>Interested! Let's discuss the guide.</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button className="flex-1 bg-white text-slate-900 border hover:bg-slate-50">View Profile</Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Accept Proposal</Button>
                        </div>
                    </div>
                </VariationWrapper>

                {/* Variation 14: Magazine Cover */}
                <VariationWrapper title="Magazine Cover" index={13}>
                    <div className="relative h-full bg-slate-900 text-white overflow-hidden group">
                        <img
                            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop"
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                            alt="Fashion"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                        <div className="absolute top-0 left-0 w-full p-6 text-center border-b border-white/10">
                            <h2 className="text-4xl font-black tracking-tighter uppercase italic">MOMENT</h2>
                            <p className="text-xs tracking-[0.3em] font-light">ISSUE 24 • MAY EDITION</p>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full p-8">
                            <Badge className="bg-red-600 text-white border-none mb-4 uppercase tracking-widest text-[10px] py-1 px-3">Trending</Badge>
                            <h3 className="text-3xl font-bold leading-none mb-2 font-serif">{MOMENT_DATA.title}</h3>
                            <p className="text-slate-300 text-sm mb-6 line-clamp-2 max-w-xs">{MOMENT_DATA.description}</p>

                            <div className="flex items-center justify-between border-t border-white/20 pt-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-white">
                                        <AvatarImage src={MOMENT_DATA.influencer.avatar} />
                                    </Avatar>
                                    <div>
                                        <div className="font-bold text-sm">{MOMENT_DATA.influencer.name}</div>
                                        <div className="text-xs text-slate-400">Editor's Pick</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold italic">{MOMENT_DATA.price_video / 1000}K</div>
                                    <div className="text-[10px] text-slate-400 uppercase">Est. Cost</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </VariationWrapper>

                {/* Variation 15: Technical Specs */}
                <VariationWrapper title="Tech Specs Sheet" index={14}>
                    <div className="bg-slate-50 p-6 h-full font-mono text-xs">
                        <div className="border-2 border-slate-900 p-1 h-full">
                            <div className="border border-slate-900 h-full p-4 flex flex-col">
                                <div className="flex justify-between border-b-2 border-slate-900 pb-4 mb-4">
                                    <div>
                                        <h2 className="text-lg font-bold uppercase">Specification Sheet</h2>
                                        <p>Doc. No: {MOMENT_DATA.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="h-8 w-8 bg-slate-900 text-white flex items-center justify-center font-bold">V.3</div>
                                    </div>
                                </div>

                                <table className="w-full text-left mb-6">
                                    <tbody>
                                        <tr className="border-b border-slate-300">
                                            <th className="py-2 w-1/3 text-slate-500">PROJECT NAME</th>
                                            <td className="py-2 font-bold">{MOMENT_DATA.title}</td>
                                        </tr>
                                        <tr className="border-b border-slate-300">
                                            <th className="py-2 w-1/3 text-slate-500">OPERATOR</th>
                                            <td className="py-2 font-bold">{MOMENT_DATA.influencer.handle}</td>
                                        </tr>
                                        <tr className="border-b border-slate-300">
                                            <th className="py-2 w-1/3 text-slate-500">TARGET</th>
                                            <td className="py-2">{MOMENT_DATA.targetProduct}</td>
                                        </tr>
                                        <tr className="border-b border-slate-300">
                                            <th className="py-2 w-1/3 text-slate-500">LAUNCH DATE</th>
                                            <td className="py-2">{MOMENT_DATA.eventDate}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="mb-4">
                                    <h3 className="font-bold underline mb-2">REQUIREMENTS</h3>
                                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                                        {MOMENT_DATA.guide.split('\n').map((line, i) => (
                                            <li key={i}>{line.replace(/^\d+\.\s/, '')}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-auto pt-4 border-t-2 border-slate-900 flex justify-between items-center">
                                    <div>
                                        STATUS: <span className="bg-green-200 px-1 text-green-800">READY</span>
                                    </div>
                                    <Button size="sm" variant="outline" className="border-slate-900 hover:bg-slate-900 hover:text-white uppercase">
                                        Initiate
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </VariationWrapper>

                {/* Variation 16: Notebook Sketch */}
                <VariationWrapper title="Creator Notebook" index={15}>
                    <div className="bg-[#fdfbf6] p-6 h-full relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        <div className="absolute left-0 top-0 bottom-0 w-8 border-r border-[#e5e7eb]/50 bg-red-50/20" />

                        <h2 className="text-2xl font-handwriting text-slate-800 mb-4 pl-6 rotate-1" style={{ fontFamily: 'cursive' }}>
                            {MOMENT_DATA.title} <span className="text-red-500 text-sm align-top">★ New!</span>
                        </h2>

                        <div className="pl-6 space-y-6">
                            <div className="flex gap-4">
                                <div className="bg-yellow-100 p-2 shadow-sm -rotate-2 w-1/2">
                                    <p className="font-handwriting text-sm text-slate-600 uppercase mb-1 font-bold">Concept</p>
                                    <p className="text-sm font-handwriting leading-tight">{MOMENT_DATA.description.substring(0, 80)}...</p>
                                </div>
                                <div className="bg-blue-100 p-2 shadow-sm rotate-1 w-1/2">
                                    <p className="font-handwriting text-sm text-slate-600 uppercase mb-1 font-bold">Need</p>
                                    <p className="text-sm font-handwriting leading-tight">{MOMENT_DATA.targetProduct}</p>
                                </div>
                            </div>

                            <div className="border-2 border-slate-800 rounded-lg p-3 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold uppercase text-xs">Schedule</span>
                                    <span className="text-xs">{MOMENT_DATA.eventDate}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full" />
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full" />
                                    <div className="flex-1 h-2 bg-green-400 rounded-full border border-slate-900" />
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full" />
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-6 right-6">
                            <div className="h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-lg transform rotate-12 cursor-pointer hover:scale-110 transition-transform">
                                GO
                            </div>
                        </div>
                    </div>
                </VariationWrapper>

                {/* Variation 17: E-Commerce Product Card */}
                <VariationWrapper title="Shopping Card" index={16}>
                    <div className="bg-white p-0 h-full flex flex-col">
                        <div className="relative h-48 bg-slate-200">
                            <img src="https://images.unsplash.com/photo-1555529669-e69e7aaab9a4?w=400&h=300&fit=crop" className="w-full h-full object-cover" alt="Product" />
                            <Badge className="absolute top-2 left-2 bg-black text-white">New Arrival</Badge>
                            <Button size="icon" variant="secondary" className="absolute top-2 right-2 rounded-full h-8 w-8"><Heart className="h-4 w-4" /></Button>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="mb-2">
                                <span className="text-xs text-slate-500 uppercase font-bold">{MOMENT_DATA.category}</span>
                                <h2 className="font-bold text-lg leading-tight">{MOMENT_DATA.title}</h2>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex text-yellow-500">
                                    {[1, 2, 3, 4, 5].map(i => <Sparkles key={i} className="h-3 w-3 fill-current" />)}
                                </div>
                                <span className="text-xs text-slate-500">(Verified Creator)</span>
                            </div>

                            <div className="mt-auto">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-xs text-slate-500 line-through">200,000 KRW</p>
                                        <p className="text-xl font-bold text-red-600">{MOMENT_DATA.price_feed.toLocaleString()} KRW</p>
                                    </div>
                                    <div className="text-right text-xs">
                                        <p className="font-semibold text-green-600">Available Now</p>
                                        <p className="text-slate-500">Ships by {MOMENT_DATA.schedule.product_delivery}</p>
                                    </div>
                                </div>
                                <Button className="w-full bg-slate-900 text-white">Add to Campaign</Button>
                            </div>
                        </div>
                    </div>
                </VariationWrapper>

                {/* Variation 18: Map Locality Focus */}
                <VariationWrapper title="Locality Map" index={17}>
                    <div className="h-full relative overflow-hidden flex flex-col">
                        <div className="h-2/5 bg-slate-200 relative">
                            {/* Mock Map */}
                            <div className="absolute inset-0 opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Map_of_Seoul_districts.svg')] bg-cover bg-center" />
                            <div className="absolute inset-0 bg-blue-500/10" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="h-3 w-3 bg-red-500 rounded-full animate-ping absolute" />
                                <div className="h-3 w-3 bg-red-500 rounded-full relative border-2 border-white shadow-lg" />
                                <div className="bg-white px-2 py-1 rounded shadow-lg text-[10px] font-bold absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                    Seongsu-dong
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 bg-white p-5 border-t -mt-4 rounded-t-2xl relative z-10">
                            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
                            <h2 className="font-bold text-lg mb-1">{MOMENT_DATA.title}</h2>
                            <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
                                <MapPin className="h-4 w-4" /> 3.2km away • {MOMENT_DATA.eventDate}
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-bold text-xs uppercase text-slate-400">Context</h3>
                                <p className="text-sm text-slate-600">{MOMENT_DATA.description}</p>
                            </div>

                            <div className="absolute bottom-5 left-5 right-5">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">Explore Location View</Button>
                            </div>
                        </div>
                    </div>
                </VariationWrapper>

                {/* Variation 19: Comparison Table */}
                <VariationWrapper title="Offer vs Need" index={18}>
                    <div className="p-6">
                        <h2 className="font-bold text-center mb-6">Alignment Check</h2>
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <h3 className="text-xs font-bold text-slate-500 uppercase text-center mb-2">Creator Offers</h3>
                                <div className="space-y-2">
                                    <Badge variant="outline" className="w-full justify-center bg-white">Vlog (YouTube)</Badge>
                                    <Badge variant="outline" className="w-full justify-center bg-white">Instagram Story</Badge>
                                    <p className="text-xs text-center text-slate-400 pt-2">Est. Reach: 45K</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center text-slate-300">
                                <ArrowRight className="h-5 w-5" />
                            </div>
                            <div className="flex-1 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <h3 className="text-xs font-bold text-blue-500 uppercase text-center mb-2">Brand Gets</h3>
                                <div className="space-y-2">
                                    <Badge className="w-full justify-center bg-blue-600 hover:bg-blue-700">Product Review</Badge>
                                    <Badge className="w-full justify-center bg-blue-600 hover:bg-blue-700">Brand Tag</Badge>
                                    <p className="text-xs text-center text-blue-400 pt-2">Target: {MOMENT_DATA.targetProduct}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 text-white p-4 rounded-lg text-center">
                            <div className="text-xs text-slate-400 uppercase mb-1">Total Investment</div>
                            <div className="text-2xl font-bold">450,000 KRW</div>
                            <p className="text-[10px] text-slate-500 mt-1">Includes all usage rights</p>
                        </div>
                        <Button className="w-full mt-4" variant="outline">Negotiate Terms</Button>
                    </div>
                </VariationWrapper>

                {/* Variation 20: Minimalist Mono */}
                <VariationWrapper title="Minimalist Mono" index={19}>
                    <div className="p-8 flex flex-col h-full justify-center text-center border-4 border-black">
                        <div className="font-black text-6xl mb-6 tracking-tighter opacity-10 leading-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
                            MOMENT
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-2">{MOMENT_DATA.title}</h2>
                            <p className="text-xl font-light text-slate-500 mb-8">{MOMENT_DATA.influencer.name}</p>

                            <div className="w-16 h-1 bg-black mx-auto mb-8" />

                            <p className="text-sm font-medium max-w-xs mx-auto mb-8 leading-relaxed">
                                {MOMENT_DATA.description}
                            </p>

                            <Button className="rounded-none bg-black text-white hover:bg-slate-800 px-8 py-6 text-lg tracking-widest uppercase">
                                Connect
                            </Button>
                        </div>
                    </div>
                </VariationWrapper>
            </div>

        </div>
    )
}
