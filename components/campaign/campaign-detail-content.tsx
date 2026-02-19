
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
    renderAction?: () => React.ReactNode
    // For layout adjustments
    className?: string
    isUploading?: boolean
    // Optional close handler (renders X button)
    onClose?: () => void
    // Optional slot for actions in the header image area (e.g. Edit button)
    renderHeaderSideAction?: () => React.ReactNode
    // Optional applicant count to show in sidebar
    applicantCount?: number
}

const CHANNELS = [
    { id: "instagram", label: "인스타그램", icon: "📸" },
    { id: "youtube", label: "유튜브", icon: "▶️" },
    { id: "tiktok", label: "틱톡", icon: "🎵" },
    { id: "blog", label: "블로그", icon: "📝" },
    { id: "shorts", label: "유튜브 숏츠", icon: "⚡" },
    { id: "reels", label: "인스타 릴스", icon: "🎞️" },
]
const getChannelLabel = (id: string) => CHANNELS.find(c => c.id === id)?.label || id
const getChannelIcon = (id: string) => CHANNELS.find(c => c.id === id)?.icon || ""

export function CampaignDetailContent({
    campaign,
    onImageUpload,
    renderAction,
    renderHeaderSideAction,
    className,
    isUploading = false,
    onClose,
    applicantCount
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

    const postingDateFormatted = (() => {
        const raw = campaign.posting_date || campaign.postingDate
        if (!raw) return '협의'
        const d = new Date(raw)
        return isNaN(d.getTime()) ? raw : d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    })()

    return (
        <div className={cn("flex flex-col md:flex-row h-full bg-background overflow-hidden", className)}>

            {/* ── SIDEBAR (Left) ── */}
            <div className="w-full md:w-[260px] flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-border bg-muted/20 overflow-y-auto">

                {/* Campaign Image */}
                <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-[180px] bg-slate-900 flex-shrink-0 group overflow-hidden">
                    {campaign.image && campaign.image !== "📦" ? (
                        <img src={campaign.image} alt={campaign.product} className="w-full h-full object-cover opacity-85 transition-opacity group-hover:opacity-100" />
                    ) : campaign.product_image_url ? (
                        <img src={campaign.product_image_url} alt={campaign.product} className="w-full h-full object-cover opacity-85 transition-opacity group-hover:opacity-100" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                            <Megaphone className="h-12 w-12 text-white/20" />
                        </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                    {/* Close button */}
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-black/30 rounded-full z-20 h-8 w-8"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Image Upload Overlay */}
                    {onImageUpload && (
                        <>
                            <div
                                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isUploading ? (
                                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                                ) : (
                                    <>
                                        <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-sm mb-1.5">
                                            <Upload className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-white font-medium text-sm">이미지 변경</span>
                                    </>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </>
                    )}

                    {/* renderHeaderSideAction */}
                    {renderHeaderSideAction && (
                        <div className="absolute bottom-3 right-3 z-30">
                            {renderHeaderSideAction()}
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 z-10 flex gap-1.5 flex-wrap">
                        <Badge className="bg-black/50 backdrop-blur-sm border-white/20 text-white text-[10px] px-2 py-0.5">
                            {campaign.category || '카테고리'}
                        </Badge>
                        {dDay !== null && (
                            <Badge className={`border-none text-white text-[10px] px-2 py-0.5 ${dDay < 0 ? 'bg-gray-500' : dDay <= 3 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}>
                                {dDay < 0 ? '마감됨' : `D-${dDay}`}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Sidebar Body */}
                <div className="flex flex-col gap-4 p-4 flex-1">

                    {/* Brand Info */}
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                            {campaign.brandAvatar ? (
                                <img src={campaign.brandAvatar} alt={campaign.brand} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-xs font-bold text-muted-foreground">{campaign.brand?.[0] || 'B'}</span>
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-bold leading-tight">{campaign.brand || campaign.brand_name || '브랜드'}</div>
                            <div className="text-[10px] text-muted-foreground">
                                {campaign.title && campaign.product ? campaign.product : campaign.category || ''}
                            </div>
                        </div>
                    </div>

                    {/* KPI List */}
                    <div className="flex flex-col gap-2">

                        {/* 🔢 지원자 현황 */}
                        {applicantCount !== undefined && (
                            <div className="flex items-center justify-between py-2 px-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                                <span className="text-[11px] text-muted-foreground font-medium">👤 현재 지원자</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[12px] font-bold text-blue-600 dark:text-blue-400">{applicantCount}명</span>
                                    {campaign.recruitment_count && (
                                        <span className="text-[10px] text-muted-foreground">/ {campaign.recruitment_count}명 모집</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 제공 혜택 */}
                        <div className="flex justify-between items-center py-2 px-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
                            <span className="text-[11px] text-muted-foreground font-medium">💰 제공 혜택</span>
                            <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 text-right max-w-[120px] truncate">{campaign.budget || '협의'}</span>
                        </div>

                        {/* 제공 방식 */}
                        {campaign.product_type && (
                            <div className="flex justify-between items-center py-2 px-3 bg-muted/30 border border-border/60 rounded-lg">
                                <span className="text-[11px] text-muted-foreground font-medium">🎁 제공 방식</span>
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border
                                    ${campaign.product_type === 'loan'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800'
                                        : 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-800'
                                    }`}>
                                    {campaign.product_type === 'loan' ? '🔄 대여' : '🎁 증정'}
                                </span>
                            </div>
                        )}

                        {/* 모집 인원 */}
                        <div className="flex justify-between items-center py-2 px-3 bg-muted/30 border border-border/60 rounded-lg">
                            <span className="text-[11px] text-muted-foreground font-medium">👥 모집 인원</span>
                            <span className="text-[12px] font-bold text-primary">{campaign.recruitment_count ? `${campaign.recruitment_count}명` : '-'}</span>
                        </div>

                        {/* 팔로워 조건 */}
                        <div className="flex justify-between items-center py-2 px-3 bg-muted/30 border border-border/60 rounded-lg">
                            <span className="text-[11px] text-muted-foreground font-medium">📊 팔로워 조건</span>
                            <span className="text-[11px] font-semibold text-right">
                                {campaign.min_followers
                                    ? `${Number(campaign.min_followers).toLocaleString()}+`
                                    : '제한없음'}
                                {campaign.max_followers ? ` ~ ${Number(campaign.max_followers).toLocaleString()}` : ''}
                            </span>
                        </div>

                        {/* 모집 마감 */}
                        <div className="flex justify-between items-center py-2 px-3 bg-muted/30 border border-border/60 rounded-lg">
                            <span className="text-[11px] text-muted-foreground font-medium">📅 모집 마감</span>
                            <span className="text-[11px] font-semibold">
                                {campaign.recruitment_deadline ? new Date(campaign.recruitment_deadline).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) : '미정'}
                            </span>
                        </div>

                        {/* 콘텐츠 업로드 */}
                        <div className="flex justify-between items-center py-2 px-3 bg-muted/30 border border-border/60 rounded-lg">
                            <span className="text-[11px] text-muted-foreground font-medium">📤 업로드 시기</span>
                            <span className="text-[11px] font-semibold">{postingDateFormatted}</span>
                        </div>
                    </div>

                    {/* Channels */}
                    {campaign.channels && campaign.channels.length > 0 && (() => {
                        const CHANNEL_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
                            instagram: { bg: 'bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200/70 dark:border-pink-800/50', dot: 'bg-pink-500' },
                            reels: { bg: 'bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-900/20 dark:to-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200/70 dark:border-orange-800/50', dot: 'bg-orange-500' },
                            youtube: { bg: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200/70 dark:border-red-800/50', dot: 'bg-red-500' },
                            shorts: { bg: 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20', text: 'text-red-500 dark:text-red-400', border: 'border-red-200/70 dark:border-red-800/50', dot: 'bg-red-400' },
                            tiktok: { bg: 'bg-gradient-to-r from-slate-50 to-cyan-50 dark:from-slate-800/30 dark:to-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200/70 dark:border-cyan-800/50', dot: 'bg-cyan-500' },
                            blog: { bg: 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200/70 dark:border-emerald-800/50', dot: 'bg-emerald-500' },
                        }
                        const defaultStyle = { bg: 'bg-muted/30', text: 'text-foreground/70', border: 'border-border/50', dot: 'bg-muted-foreground' }
                        return (
                            <div>
                                <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide mb-2">희망 채널</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {campaign.channels.map((ch: string) => {
                                        const s = CHANNEL_STYLES[ch] || defaultStyle
                                        return (
                                            <span
                                                key={ch}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.bg} ${s.text} ${s.border}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                                                {getChannelLabel(ch)}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })()}

                    {/* Action button (sidebar bottom) */}
                    {renderAction && (
                        <div className="mt-auto pt-2">
                            {renderAction()}
                        </div>
                    )}
                </div>
            </div>

            {/* ── MAIN CONTENT (Right) ── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-7">

                    {/* Title Block */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-border">
                                {campaign.category || '카테고리 없음'}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground/50">·</span>
                            <span className="text-[10px] text-muted-foreground/60">
                                등록일: {new Date(campaign.created_at || Date.now()).toLocaleDateString('ko-KR')}
                            </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold leading-tight text-foreground break-keep">
                            {campaign.title || campaign.product}
                        </h2>
                        {campaign.title && campaign.product && (
                            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                                <span className="bg-muted px-2 py-0.5 rounded text-xs">제품명</span>
                                {campaign.product}
                            </div>
                        )}
                    </div>

                    {/* Schedule Section */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-bold text-foreground">캠페인 일정</h3>
                            <div className="flex-1 h-px bg-border ml-1" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: "모집 마감", value: campaign.recruitment_deadline ? new Date(campaign.recruitment_deadline).toLocaleDateString('ko-KR') : '미정', color: 'text-amber-500' },
                                { label: "선정 발표", value: campaign.selection_announcement_date || '-', color: 'text-primary' },
                                { label: "콘텐츠 업로드", value: postingDateFormatted, color: 'text-emerald-600 dark:text-emerald-400' },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="bg-muted/30 border border-border/60 rounded-xl p-3 text-center">
                                    <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
                                    <div className={`text-xs font-bold ${color}`}>{value}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recruitment Condition */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-bold text-foreground">모집 조건</h3>
                            <div className="flex-1 h-px bg-border ml-1" />
                        </div>
                        {campaign.target && (
                            <div className="bg-muted/30 border border-border/60 rounded-xl p-3.5">
                                <div className="text-[10px] text-muted-foreground mb-1.5">원하는 크리에이터 스타일</div>
                                <div className="text-sm text-foreground leading-relaxed">{campaign.target}</div>
                            </div>
                        )}
                    </section>

                    {/* Hashtags */}
                    {campaign.hashtags && campaign.hashtags.length > 0 && (
                        <section className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-bold text-foreground">필수 해시태그 가이드</h3>
                                <div className="flex-1 h-px bg-border ml-1" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {campaign.hashtags.map((tag: string) => (
                                    <span key={tag} className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-medium">
                                        {tag.startsWith('#') ? tag : `#${tag}`}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Reference Link */}
                    {campaign.reference_link && (
                        <section className="space-y-3">
                            <div className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-bold text-foreground">참고 링크</h3>
                                <div className="flex-1 h-px bg-border ml-1" />
                            </div>
                            <a
                                href={campaign.reference_link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors max-w-full truncate border border-blue-100 dark:border-blue-800"
                            >
                                <LinkIcon className="h-3 w-3 shrink-0" />
                                <span className="truncate">{campaign.reference_link}</span>
                            </a>
                        </section>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-border w-full" />

                    {/* Description */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-bold text-foreground">모집 상세 내용</h3>
                            <div className="flex-1 h-px bg-border ml-1" />
                        </div>
                        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/20 border border-border/50 border-l-2 border-l-primary/50 rounded-r-xl p-4">
                            {campaign.description}
                        </div>
                    </section>

                    {/* Scroll padding */}
                    <div className="h-6" />
                </div>
            </div>
        </div>
    )
}
