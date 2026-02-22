"use client"

import React from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Calendar, Gift, Send, Banknote, Star, Lock, Trash2, Pencil,
} from "lucide-react"

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatDateToMonth, formatPriceRange } from "@/lib/utils"
import { CreatorProfileCard } from "@/components/profile/CreatorProfileCard"
import { toast } from "sonner"
import { useState } from "react"

// ─── Platform Icon helpers ──────────────────────────────────
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
    instagram: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
            <defs><linearGradient id="ig-shared" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f09433" /><stop offset="25%" stopColor="#e6683c" />
                <stop offset="50%" stopColor="#dc2743" /><stop offset="75%" stopColor="#cc2366" />
                <stop offset="100%" stopColor="#bc1888" />
            </linearGradient></defs>
            <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-shared)" />
            <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.5" />
            <circle cx="17.5" cy="6.5" r="1" fill="white" />
        </svg>
    ),
    youtube: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="5" fill="#FF0000" />
            <polygon points="10,8.5 10,15.5 16,12" fill="white" />
        </svg>
    ),
    tiktok: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
            <rect width="24" height="24" rx="5" fill="#010101" />
            <path d="M16 7.5c1 .7 2.1 1 3 1v2.2c-.9 0-1.8-.2-2.6-.6v5.4A4.1 4.1 0 1 1 12.3 11v2.3a1.9 1.9 0 1 0 1.9 1.9V5h2z" fill="white" />
        </svg>
    ),
    blog: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
            <rect width="24" height="24" rx="5" fill="#03C75A" />
            <text x="12" y="16.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">N</text>
        </svg>
    ),
}

const CHANNEL_LABELS: Record<string, string> = {
    instagram_reels: '🎞️ 릴스', instagram_feed: '📷 피드', instagram_story: '⭕ 스토리',
    youtube_longform: '▶️ 롱폼', youtube_shorts: '⚡ 숏츠',
}
const CHANNEL_BG: Record<string, string> = {
    instagram: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600',
    youtube: 'bg-gradient-to-r from-red-600 to-red-700',
    tiktok: 'bg-gradient-to-r from-black to-slate-800',
    blog: 'bg-gradient-to-r from-green-500 to-green-600',
}

const fmt = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n.toLocaleString()

// ─── Shared MomentGridCard Component ────────────────────────
export interface MomentGridCardProps {
    /** Moment data */
    item: any
    /** Creator profile: name, avatar, followers, primaryChannel, socialChannels */
    creator: {
        id?: string
        name?: string
        avatar?: string
        followers?: number
        primaryChannel?: { platform: string; followersCount?: number }
        socialChannels?: { platform: string; followersCount?: number }[]
    }
    /** Is this a past / completed moment? */
    isPast?: boolean
    /** Number of inbound brand offers */
    offerCount?: number
    /** Click handler — if not provided, no click action */
    onClick?: (item: any) => void
    /** Favorite state & toggle */
    isFavorite?: boolean
    toggleFavorite?: (id: string, type: string) => void
    /** Delete handler */
    onDelete?: (id: string) => void
    /** Edit handler (navigates to edit page) */
    onEdit?: (id: string) => void
    /** Complete handler (shows button for active moments) */
    onComplete?: (id: string) => void
    /** Whether to show CreatorProfileCard dialog on avatar/name click */
    showProfileCard?: boolean
    /** Whether to wrap card in a link */
    href?: string
    /** Admin delete button (separate from dropdown) */
    onAdminDelete?: (id: string) => void
    /** User role for admin checks */
    userRole?: string
    /** Optional custom footer rendered at card bottom */
    renderFooter?: () => React.ReactNode
    /** Whether this moment already has a sent proposal from the brand */
    hasSentProposal?: boolean
}

export function MomentGridCard({
    item, creator, isPast = false, offerCount = 0,
    onClick, isFavorite, toggleFavorite,
    onDelete, onEdit, onComplete, showProfileCard = false,
    href, onAdminDelete, userRole, renderFooter, hasSentProposal = false,
}: MomentGridCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)

    const pc = creator.socialChannels?.[0] || creator.primaryChannel
    const platform = pc?.platform || ''
    const followers = pc?.followersCount ?? creator.followers ?? 0
    const icon = PLATFORM_ICONS[platform] || (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        </svg>
    )

    const cardContent = (
        <Card
            className={`overflow-hidden transition-all hover:shadow-lg border-border/60 bg-background flex flex-col h-full cursor-pointer relative group ${isPast ? 'opacity-75 hover:opacity-100' : ''}`}
            onClick={onClick ? () => onClick(item) : undefined}
        >
            {/* Favorite star */}
            {toggleFavorite && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        toggleFavorite(item.id, 'event');
                    }}
                >
                    <Star
                        className={`h-4 w-4 transition-colors ${isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
                        fill={isFavorite ? 'currentColor' : 'none'}
                    />
                </Button>
            )}

            {/* Sent proposal badge */}
            {hasSentProposal && (
                <div className={`absolute ${toggleFavorite ? 'top-2 right-12' : 'top-2 right-2'} z-10`}>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500 text-white shadow-sm">
                        ✓ 제안됨
                    </span>
                </div>
            )}

            {/* Non-favorite badges (offer count, past, private) */}
            {!toggleFavorite && (
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                    {isPast && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                            완료된 모먼트
                        </span>
                    )}
                    {item.isPrivate && (
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-0.5">
                            <Lock className="h-2.5 w-2.5" /> 비공개
                        </span>
                    )}
                    {!isPast && offerCount > 0 && (
                        <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                            📥 {offerCount}개 제안
                        </span>
                    )}
                </div>
            )}

            <CardHeader className="pb-3 flex-row gap-3 items-start space-y-0">
                {/* Avatar */}
                {showProfileCard ? (
                    <CreatorProfileCard
                        creatorId={creator.id || item.influencerId || item.id}
                        trigger={
                            <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            >
                                {creator.avatar && creator.avatar.startsWith('http') ? (
                                    <img src={creator.avatar} alt={creator.name} className="h-full w-full object-cover" />
                                ) : (
                                    creator.avatar || creator.name?.[0] || 'C'
                                )}
                            </div>
                        }
                    />
                ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg overflow-hidden">
                        {creator.avatar && creator.avatar.startsWith('http') ? (
                            <img src={creator.avatar} alt={creator.name} className="h-full w-full object-cover" />
                        ) : (
                            creator.name?.[0] || 'C'
                        )}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        {showProfileCard ? (
                            <CreatorProfileCard
                                creatorId={creator.id || item.influencerId || item.id}
                                trigger={
                                    <h4
                                        className="font-bold truncate cursor-pointer hover:text-primary transition-colors"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    >
                                        {creator.name || item.influencer}
                                    </h4>
                                }
                            />
                        ) : (
                            <h4 className="font-bold truncate">{creator.name || item.influencer}</h4>
                        )}

                        {/* Admin delete (brand side) */}
                        {userRole === 'admin' && onAdminDelete && (
                            <Button
                                variant="ghost" size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-red-500 rounded-full shrink-0"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdminDelete(item.id); }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        )}

                        {/* Creator edit/delete buttons */}
                        {(onDelete || onEdit) && !onAdminDelete && (
                            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                                {onEdit && (
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                                        onClick={(e) => { e.stopPropagation(); onEdit(item.id); }}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                                        onClick={(e) => { e.stopPropagation(); setIsDeleteDialogOpen(true); }}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Status badge (completed) — brand side */}
                    {item.status === 'completed' && toggleFavorite && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 inline-block mt-0.5">
                            완료된 모먼트
                        </span>
                    )}

                    {/* Follower count + tag */}
                    <span className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-muted-foreground flex-wrap">
                        {icon}
                        <span>{fmt(followers)} 팔로워</span>
                        {item.tags && item.tags.length > 0 && (
                            <>
                                <span className="text-border">·</span>
                                {item.tags.slice(0, 1).map((t: string) => (
                                    <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{t}</span>
                                ))}
                            </>
                        )}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 flex-1 relative">
                <h3 className="font-bold text-base line-clamp-2 h-14 mb-2">{item.title || item.event}</h3>

                <div className={`flex flex-col gap-2 text-xs mb-3 bg-muted/30 p-3 rounded-lg border border-border/50 ${isPast ? 'opacity-80' : ''}`}>
                    <div className="pb-2 border-b border-border/50">
                        <span className="text-[10px] text-muted-foreground block mb-0.5">희망제품</span>
                        <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                            <Gift className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                            <span className="truncate">{item.targetProduct || "미정"}</span>
                        </div>
                    </div>
                    <div className="pb-2 border-b border-border/50">
                        <span className="text-[10px] text-muted-foreground block mb-0.5">예상단가</span>
                        <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                            <Banknote className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">{formatPriceRange(item.priceVideo)}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-[10px] text-muted-foreground block mb-0.5">모먼트 일정</span>
                            <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate">{formatDateToMonth(item.eventDate) || "미정"}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] text-muted-foreground block mb-0.5">업로드 일정</span>
                            <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                                <Send className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                {item.dateFlexible ? (
                                    <span className="text-emerald-600 truncate">협의 가능</span>
                                ) : (
                                    <span className="truncate">{formatDateToMonth(item.postingDate)}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-foreground/70 line-clamp-2 h-12 leading-relaxed mb-3">
                    {item.description || "상세 설명이 없습니다."}
                </p>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-md p-2.5 mb-3">
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium mb-1">📝 제작 가이드</p>
                    <p className="text-xs text-amber-900/80 dark:text-amber-200/80 line-clamp-2 leading-relaxed h-8">
                        {item.guide || "브랜드 가이드를 따르겠습니다."}
                    </p>
                </div>

                {/* Preferred channels */}
                {item.channels && item.channels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {item.channels.map((ch: string) => {
                            const base = ch.split('_')[0]
                            return (
                                <span key={ch} className={`text-[10px] font-medium text-white px-2 py-0.5 rounded-full shadow-sm ${CHANNEL_BG[base] || 'bg-slate-600'}`}>
                                    {CHANNEL_LABELS[ch] || ch}
                                </span>
                            )
                        })}
                    </div>
                )}

                {/* Complete button for active moments */}
                {!isPast && onComplete && (
                    <div className="flex justify-end pt-2 border-t border-border/50">
                        <Button
                            variant="ghost" size="sm"
                            className="text-xs h-7 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                            onClick={(e) => { e.stopPropagation(); setIsCompleteDialogOpen(true); }}
                        >
                            <span className="mr-1">🎉</span> 완료하기
                        </Button>
                    </div>
                )}
            </CardContent>
            {renderFooter && renderFooter()}
            <div className="pb-4"></div>
        </Card>
    )

    return (
        <>
            {href ? (
                <a href={href} className="block group">{cardContent}</a>
            ) : (
                cardContent
            )}

            {/* DELETE DIALOG */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>정말로 이 기록을 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async (e) => {
                                e.stopPropagation()
                                try {
                                    if (onDelete) await onDelete(item.id)
                                    toast.success('모먼트가 삭제되었습니다.')
                                } catch (error: any) {
                                    toast.error(error?.message || '모먼트 삭제에 실패했습니다.')
                                }
                                setIsDeleteDialogOpen(false)
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >삭제하기</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* COMPLETE DIALOG */}
            <AlertDialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>이 모먼트를 완료하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>완료된 모먼트는 '완료된 모먼트' 탭으로 이동합니다.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.stopPropagation(); onComplete?.(item.id); setIsCompleteDialogOpen(false); }}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >완료 처리</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
