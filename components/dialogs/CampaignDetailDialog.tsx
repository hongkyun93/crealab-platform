"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Gift, Megaphone, Send, User, X, CheckCircle2, Instagram, Youtube, MessageCircle, Hash, Link as LinkIcon, Users } from "lucide-react"

interface CampaignDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    campaign: any
    onApply: (campaign: any) => void
}

export function CampaignDetailDialog({
    open,
    onOpenChange,
    campaign,
    onApply
}: CampaignDetailDialogProps) {
    if (!campaign) return null

    const today = new Date()
    const dDay = campaign.recruitment_deadline
        ? Math.ceil((new Date(campaign.recruitment_deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : null

    const CHANNELS = [
        { id: "instagram", label: "인스타그램", icon: "📸" },
        { id: "youtube", label: "유튜브", icon: "▶️" },
        { id: "tiktok", label: "틱톡", icon: "🎵" },
        { id: "blog", label: "블로그", icon: "📝" },
        { id: "shorts", label: "유튜브 숏츠", icon: "⚡" },
        { id: "reels", label: "인스타 릴스", icon: "🎞️" }
    ]

    const getChannelLabel = (id: string) => CHANNELS.find(c => c.id === id)?.label || id
    const getChannelIcon = (id: string) => CHANNELS.find(c => c.id === id)?.icon || ""

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white border-0 shadow-2xl rounded-xl">
                {/* Header Image Area */}
                <div className="relative h-56 bg-slate-900 w-full shrink-0 group">
                    {campaign.image ? (
                        <img src={campaign.image} alt={campaign.product} className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                            <Megaphone className="h-16 w-16 text-white/20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                        <Badge className="bg-black/50 hover:bg-black/60 backdrop-blur-sm border-white/20 text-white">
                            {campaign.category || '카테고리 없음'}
                        </Badge>
                        {dDay !== null && (
                            <Badge className={`border-none text-white ${dDay < 0 ? 'bg-gray-500' : dDay <= 3 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}>
                                {dDay < 0 ? '마감됨' : `D-${dDay}`}
                            </Badge>
                        )}
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 text-white">
                        <DialogTitle className="text-3xl font-bold leading-tight mb-2 text-shadow-sm">{campaign.product}</DialogTitle>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30 backdrop-blur-md">
                                {campaign.brandAvatar ? (
                                    <img src={campaign.brandAvatar} alt={campaign.brand} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold">{campaign.brand?.[0]}</span>
                                )}
                            </div>
                            <span className="font-medium text-lg">{campaign.brand}</span>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full z-20"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <div className="p-6 md:p-8 space-y-8 bg-slate-50/30">
                    {/* Key Benefits - Highlighted */}
                    <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                <Gift className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground font-medium">제공 혜택</div>
                                <div className="text-lg font-bold text-slate-900">{campaign.budget}</div>
                            </div>
                        </div>
                        <div className="hidden md:block w-px h-10 bg-slate-100"></div>
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground font-medium">원하는 스타일</div>
                                <div className="text-base font-semibold text-slate-900">{campaign.target || '제한 없음'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Left Column: Main Info */}
                        <div className="md:col-span-7 space-y-6">
                            {/* Description */}
                            <section className="space-y-3">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                                    <FileText className="h-5 w-5 text-slate-500" />
                                    캠페인 상세 내용
                                </h3>
                                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap bg-white p-5 rounded-xl border text-sm md:text-base shadow-sm min-h-[120px]">
                                    {campaign.description}
                                </div>
                            </section>

                            {/* Reference & Hashtags */}
                            {(campaign.reference_link || (campaign.hashtags && campaign.hashtags.length > 0)) && (
                                <section className="space-y-3">
                                    <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                                        <LinkIcon className="h-5 w-5 text-slate-500" />
                                        참고 자료 & 가이드
                                    </h3>
                                    <div className="bg-white rounded-xl border p-5 space-y-4 shadow-sm">
                                        {campaign.reference_link && (
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1 font-medium">✨ 참고 레퍼런스</div>
                                                <a href={campaign.reference_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline hover:text-blue-700 break-all flex items-center gap-1">
                                                    <LinkIcon className="h-3 w-3" /> {campaign.reference_link}
                                                </a>
                                            </div>
                                        )}
                                        {campaign.hashtags && campaign.hashtags.length > 0 && (
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-2 font-medium">🏷️ 필수 해시태그</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {campaign.hashtags.map((tag: string) => (
                                                        <span key={tag} className="text-sm bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md font-medium">
                                                            {tag.startsWith('#') ? tag : `#${tag}`}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Right Column: Recruitment & Dates */}
                        <div className="md:col-span-5 space-y-6">
                            {/* Recruitment Info Card */}
                            <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="bg-slate-50/80 px-5 py-3 border-b flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4 text-slate-500" />
                                        모집 정보
                                    </h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">모집 인원</span>
                                        <span className="font-bold text-slate-900">{campaign.recruitment_count ? `${campaign.recruitment_count}명` : '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">모집 마감</span>
                                        <span className="font-bold text-slate-900 flex items-center gap-1">
                                            {campaign.recruitment_deadline ? new Date(campaign.recruitment_deadline).toLocaleDateString() : '상시 모집'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">선정 발표</span>
                                        <span className="font-bold text-slate-900">
                                            {campaign.selection_announcement_date ? new Date(campaign.selection_announcement_date).toLocaleDateString() : '-'}
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t border-dashed">
                                        <div className="text-xs text-muted-foreground mb-1">지원 조건 (팔로워)</div>
                                        <div className="font-medium text-emerald-600 text-sm">
                                            {campaign.min_followers || campaign.max_followers ? (
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    {campaign.min_followers ? `${campaign.min_followers.toLocaleString()}명 이상` : ''}
                                                    {campaign.min_followers && campaign.max_followers ? ' ~ ' : ''}
                                                    {campaign.max_followers ? `${campaign.max_followers.toLocaleString()}명 이하` : ''}
                                                </div>
                                            ) : <span className="text-slate-500">제한 없음</span>}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Channels Card */}
                            <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="bg-slate-50/80 px-5 py-3 border-b">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                        <Megaphone className="h-4 w-4 text-slate-500" />
                                        희망 채널
                                    </h3>
                                </div>
                                <div className="p-5">
                                    <div className="flex flex-wrap gap-2">
                                        {campaign.channels && campaign.channels.length > 0 ? (
                                            campaign.channels.map((channel: string) => (
                                                <Badge key={channel} variant="outline" className="px-3 py-1.5 bg-slate-50 text-slate-700 border-slate-200">
                                                    <span className="mr-1.5">{getChannelIcon(channel)}</span>
                                                    {getChannelLabel(channel)}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground">채널 무관</span>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Schedule Card */}
                            <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="bg-slate-50/80 px-5 py-3 border-b">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-slate-500" />
                                        진행 일정
                                    </h3>
                                </div>
                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">이벤트/행사일</span>
                                        <span className="font-medium">{campaign.event_date ? new Date(campaign.event_date).toLocaleDateString() : '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">콘텐츠 업로드</span>
                                        <span className="font-medium bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded border border-yellow-100">
                                            {campaign.posting_date ? new Date(campaign.posting_date).toLocaleDateString() : '협의'}
                                        </span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 border-t bg-white sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="h-12 px-6 text-base">
                        닫기
                    </Button>
                    <Button
                        onClick={() => {
                            onOpenChange(false);
                            onApply(campaign);
                        }}
                        className="h-12 px-10 bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 text-base shadow-lg hover:shadow-xl transition-all"
                    >
                        <Send className="h-4 w-4" />
                        지원하기
                    </Button>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    )
}
