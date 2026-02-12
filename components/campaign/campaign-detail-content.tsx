
"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Gift, Megaphone, Send, User, X, CheckCircle2, Instagram, Youtube, MessageCircle, Hash, Link as LinkIcon, Users, Loader2, Upload } from "lucide-react"
import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface CampaignDetailContentProps {
    campaign: any
    // If provided, image upload overlay will be shown
    onImageUpload?: (file: File) => Promise<void>
    // If provided, "Apply" button or similar actions can be shown. 
    // For Brand View, this might be null as actions are external or different.
    renderAction?: () => React.ReactNode
    // For layout adjustments
    className?: string
    isUploading?: boolean
    // Optional close handler (renders X button)
    onClose?: () => void
    // Optional slot for actions in the header image area (e.g. Edit button)
    renderHeaderSideAction?: () => React.ReactNode
}

export function CampaignDetailContent({
    campaign,
    onImageUpload,
    renderAction,
    renderHeaderSideAction,
    className,
    isUploading = false,
    onClose
}: CampaignDetailContentProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && onImageUpload) {
            onImageUpload(file)
        }
    }

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
        <div className={cn("flex flex-col md:grid md:grid-cols-12 h-full bg-white", className)}>
            {/* Left Column (Image) - Span 5 */}
            <div className="md:col-span-5 bg-slate-900 relative flex flex-col shrink-0 md:h-full overflow-hidden min-h-[300px] md:min-h-0">
                <div className="relative w-full h-full group overflow-hidden">
                    {campaign.image && campaign.image !== "📦" ? (
                        <img src={campaign.image} alt={campaign.product} className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
                    ) : campaign.product_image_url ? (
                        <img src={campaign.product_image_url} alt={campaign.product} className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                            <Megaphone className="h-16 w-16 text-white/20" />
                        </div>
                    )}

                    {/* Image Upload Overlay (Only if onImageUpload is provided) */}
                    {onImageUpload && (
                        <div
                            className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {isUploading ? (
                                <Loader2 className="h-10 w-10 text-white animate-spin" />
                            ) : (
                                <>
                                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm mb-2">
                                        <Upload className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-white font-medium text-sm">이미지 변경</span>
                                </>
                            )}
                        </div>
                    )}
                    {onImageUpload && (
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:via-black/20 pointer-events-none" />

                    {/* Close Button (If onClose is provided) */}
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-black/20 rounded-full z-20"
                            onClick={onClose}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    )}

                    {/* Header Side Actions (e.g. Edit Button) */}
                    {renderHeaderSideAction && (
                        <div className="absolute bottom-4 right-4 z-30">
                            {renderHeaderSideAction()}
                        </div>
                    )}

                    {/* Badges Overlay */}
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
                </div>
            </div>

            {/* Right Column (Content) - Span 7 */}
            <div className="md:col-span-7 bg-white relative flex flex-col h-full overflow-hidden">
                {/* Scrollable Content Container */}
                <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-8">

                    {/* Header Section (Title & Brand) */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-xs font-normal text-slate-500 border-slate-200">
                                {campaign.category || '카테고리 없음'}
                            </Badge>
                            <span className="text-xs text-slate-400">|</span>
                            <span className="text-xs text-slate-400">
                                등록일: {new Date(campaign.created_at || Date.now()).toLocaleDateString()}
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4 text-slate-900 break-keep">
                            {campaign.product}
                        </h2>
                        <div className="flex items-center gap-3 text-slate-600">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                                {campaign.brandAvatar ? (
                                    <img src={campaign.brandAvatar} alt={campaign.brand} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold text-slate-500">{campaign.brand?.[0] || 'B'}</span>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 text-base">{campaign.brand || campaign.brand_name || '브랜드명 없음'}</div>
                                <div className="text-xs text-slate-500">@{campaign.brand_id ? campaign.brand_id.split('-')[0] : 'brand'}</div>
                            </div>

                            {/* Reference & Hashtags */}
                            {(campaign.reference_link || (campaign.hashtags && campaign.hashtags.length > 0)) && (
                                <>
                                    <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 flex-1">
                                        {campaign.reference_link && (
                                            <a
                                                href={campaign.reference_link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-full hover:bg-blue-100 hover:underline flex items-center gap-1.5 transition-colors max-w-[200px] truncate"
                                            >
                                                <LinkIcon className="h-3 w-3 shrink-0" />
                                                <span className="truncate">참고 레퍼런스</span>
                                            </a>
                                        )}
                                        {campaign.hashtags && campaign.hashtags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {campaign.hashtags.slice(0, 3).map((tag: string) => (
                                                    <span key={tag} className="text-[10px] md:text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full border border-slate-200">
                                                        {tag.startsWith('#') ? tag : `#${tag}`}
                                                    </span>
                                                ))}
                                                {campaign.hashtags.length > 3 && (
                                                    <span className="text-[10px] text-slate-400 self-center">+{campaign.hashtags.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Compact Info Grid (2-3-3 Layout in 8 Cols) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
                        {/* Col 1: Recruitment Info (25%) */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 lg:col-span-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-2 border-b border-slate-200/50">
                                <Users className="h-4 w-4 text-slate-500" />
                                모집 정보
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">모집 인원</span>
                                    <span className="font-bold text-slate-900">{campaign.recruitment_count || 0}명</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">팔로워</span>
                                    <span className="font-medium text-slate-900">
                                        {campaign.min_followers ? `${Number(campaign.min_followers).toLocaleString()}~` : '제한없음'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 pt-1">
                                    <span className="text-xs text-slate-400">원하는 스타일</span>
                                    <span className="text-xs bg-white p-1.5 rounded border text-slate-700 line-clamp-2">
                                        {campaign.target || '특별한 제한 없음'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Col 2: Timeline (37.5%) */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 lg:col-span-3">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-2 border-b border-slate-200/50">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                진행 일정
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">모집 마감</span>
                                    <span className="font-bold text-slate-900">
                                        {campaign.recruitment_deadline ? new Date(campaign.recruitment_deadline).toLocaleDateString() : '미정'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">선정 발표</span>
                                    <span className="font-medium text-slate-900">{campaign.selection_announcement_date || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">콘텐츠 업로드</span>
                                    <span className="font-medium text-slate-900">
                                        {campaign.posting_date || campaign.postingDate || '협의'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Col 3: Benefit & Channels (37.5%) */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 md:col-span-2 lg:col-span-3">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-2 border-b border-slate-200/50">
                                <Gift className="h-4 w-4 text-slate-500" />
                                혜택 및 채널
                            </div>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-xs text-slate-500 block mb-1">제공 혜택</span>
                                    <div className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">
                                        {campaign.budget || '협의'}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block mb-1">진행 채널</span>
                                    <div className="flex flex-wrap gap-1">
                                        {campaign.channels && campaign.channels.length > 0 ? (
                                            campaign.channels.map((ch: string) => (
                                                <Badge key={ch} variant="secondary" className="px-1.5 py-0.5 h-6 text-xs bg-white border font-normal">
                                                    {getChannelIcon(ch)} {getChannelLabel(ch)}
                                                </Badge>
                                            ))
                                        ) : <span className="text-xs text-slate-400">무관</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-slate-100 w-full" />

                    {/* Description Section (Bottom) */}
                    <section className="space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900">
                            <FileText className="h-5 w-5 text-slate-400" />
                            모집 상세 내용
                        </h3>
                        <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {campaign.description}
                        </div>
                    </section>

                    {/* Extra space for scrolling */}
                    <div className="h-24"></div>
                </div>

                {/* Sticky Action Bar */}
                {renderAction && (
                    <div className="p-5 border-t border-slate-100 bg-white md:bg-slate-50/50 sticky bottom-0 z-10 safe-area-bottom backdrop-blur-sm md:backdrop-blur-none bg-white/90 md:bg-white">
                        {renderAction()}
                    </div>
                )}
            </div>
        </div>
    )
}
