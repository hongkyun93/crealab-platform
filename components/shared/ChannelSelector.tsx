"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Music, Instagram, Youtube, FileText, MoreHorizontal, X } from "lucide-react"

// 상위 채널
export const CHANNELS = [
    { id: "instagram", label: "인스타그램", Icon: Instagram },
    { id: "youtube", label: "유튜브", Icon: Youtube },
    { id: "tiktok", label: "틱톡", Icon: Music },
    { id: "blog", label: "블로그", Icon: FileText },
    { id: "other", label: "기타", Icon: MoreHorizontal },
]

// 채널별 서브타입
export const CHANNEL_SUBTYPES: Record<string, { id: string; label: string; emoji: string }[]> = {
    instagram: [
        { id: "instagram_reels", label: "릴스", emoji: "🎞️" },
        { id: "instagram_feed", label: "피드", emoji: "📷" },
        { id: "instagram_story", label: "스토리", emoji: "⭕" },
    ],
    youtube: [
        { id: "youtube_longform", label: "롱폼", emoji: "▶️" },
        { id: "youtube_shorts", label: "숏츠", emoji: "⚡" },
    ],
}

// 조합 id → 채널 레이블 파싱 헬퍼
export function parseChannelSubtype(value: string): { channel: string; subtype: string | null } {
    const parts = value.split("_")
    const channel = parts[0]
    const subtype = parts.length > 1 ? value : null
    return { channel, subtype }
}

// 조합 id → 표시 레이블
export function getChannelSubtypeLabel(value: string): string {
    // "other:텍스트" 형태 처리
    if (value.startsWith("other:")) return `기타: ${value.slice(6)}`
    if (value === "other") return "기타"

    for (const [, subtypes] of Object.entries(CHANNEL_SUBTYPES)) {
        const found = subtypes.find(s => s.id === value)
        if (found) return `${found.emoji} ${found.label}`
    }
    const ch = CHANNELS.find(c => c.id === value)
    if (ch) return ch.label
    return value
}

interface ChannelSelectorProps {
    selected: string[]
    onChange: (channels: string[]) => void
    label?: string
    description?: string
    /** true면 채널당 서브타입 또는 채널 자체 하나만 선택 가능 (단일선택 모드). 기본 false(복수) */
    singlePerChannel?: boolean
}

export function ChannelSelector({
    selected,
    onChange,
    label = "희망 채널",
    description,
    singlePerChannel = false,
}: ChannelSelectorProps) {
    const [otherText, setOtherText] = useState(() => {
        // 기존 값에서 기타 텍스트 복원
        const otherVal = selected.find(s => s.startsWith("other:"))
        return otherVal ? otherVal.slice(6) : ""
    })

    // 현재 선택된 상위 채널 ids
    const selectedBaseChannels = selected.map(s => s.split(":")[0].split("_")[0])

    const handleChannelClick = (channelId: string) => {
        const hasSubtypes = !!CHANNEL_SUBTYPES[channelId]

        if (channelId === "other") {
            const isSelected = selectedBaseChannels.includes("other")
            if (isSelected) {
                // 해제
                setOtherText("")
                onChange(selected.filter(s => !s.startsWith("other")))
            } else {
                // 선택 → 기타 추가 (직접 입력 전까지는 "other"로 보관)
                onChange([...selected.filter(s => !s.startsWith("other")), "other"])
            }
            return
        }

        if (hasSubtypes) {
            const channelValues = selected.filter(s => s === channelId || s.startsWith(channelId + "_"))
            if (channelValues.length > 0) {
                // 이미 선택돼 있으면 전부 제거 (토글 off)
                onChange(selected.filter(s => s !== channelId && !s.startsWith(channelId + "_")))
            } else {
                // 처음 클릭 → base channelId 추가해서 서브타입 버튼 나타나게
                if (singlePerChannel) {
                    onChange([...selected.filter(s => s.split("_")[0] !== channelId), channelId])
                } else {
                    onChange([...selected, channelId])
                }
            }
        } else {
            // 서브타입 없는 채널: 단순 토글
            if (selected.includes(channelId)) {
                onChange(selected.filter(c => c !== channelId))
            } else {
                if (singlePerChannel) {
                    onChange([...selected.filter(s => s.split("_")[0] !== channelId), channelId])
                } else {
                    onChange([...selected, channelId])
                }
            }
        }
    }

    const handleSubtypeClick = (subtypeId: string) => {
        const channelId = subtypeId.split("_")[0]
        if (selected.includes(subtypeId)) {
            // 서브타입 재클릭 → 해제하고 base channelId로 되돌아감 (서브타입 버튼 유지)
            onChange([...selected.filter(s => s !== subtypeId), channelId])
        } else {
            // base channelId + 다른 서브타입 제거 후, 이 서브타입 추가
            onChange([...selected.filter(s => s !== channelId && !s.startsWith(channelId + "_")), subtypeId])
        }
    }

    const handleOtherTextChange = (text: string) => {
        setOtherText(text)
        const value = text.trim() ? `other:${text.trim()}` : "other"
        onChange([...selected.filter(s => !s.startsWith("other")), value])
    }

    const getChannelStyle = (channelId: string, isActive: boolean) => {
        if (!isActive) return "bg-white text-slate-600 hover:bg-slate-50 border-slate-200 hover:border-slate-300"
        if (channelId === "instagram") return "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 border-transparent text-white shadow-md transform scale-105"
        if (channelId === "youtube") return "bg-gradient-to-r from-red-600 to-red-700 border-transparent text-white shadow-md transform scale-105"
        if (channelId === "tiktok") return "bg-gradient-to-r from-black via-slate-900 to-slate-800 border-transparent text-white shadow-md transform scale-105"
        if (channelId === "blog") return "bg-gradient-to-r from-green-500 to-green-600 border-transparent text-white shadow-md transform scale-105"
        if (channelId === "other") return "bg-slate-700 border-transparent text-white shadow-md transform scale-105"
        return "bg-slate-900 border-slate-900 text-white"
    }

    const isOtherSelected = selectedBaseChannels.includes("other")

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                    {label}
                    {description && (
                        <span className="text-xs text-muted-foreground ml-2">
                            ({description})
                        </span>
                    )}
                </label>
                {selected.length > 0 && (
                    <span className="text-xs text-primary font-medium">
                        {selected.map(s => getChannelSubtypeLabel(s)).join(", ")}
                    </span>
                )}
            </div>

            {/* 상위 채널 버튼 */}
            <div className="flex flex-wrap gap-2">
                {CHANNELS.map((channel) => {
                    const Icon = channel.Icon
                    const isActive = selectedBaseChannels.includes(channel.id)
                    return (
                        <button
                            key={channel.id}
                            type="button"
                            onClick={() => handleChannelClick(channel.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm transition-all duration-300",
                                isActive
                                    ? getChannelStyle(channel.id, true)
                                    : getChannelStyle(channel.id, false)
                            )}
                        >
                            <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-500")} />
                            <span className="font-medium">{channel.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* 서브타입 버튼 (인스타/유튜브) */}
            {CHANNELS.filter(ch => CHANNEL_SUBTYPES[ch.id] && selectedBaseChannels.includes(ch.id)).map(ch => (
                <div key={`sub-${ch.id}`} className="flex items-center gap-2 pl-2 animate-in slide-in-from-top-1 duration-200">
                    <span className="text-xs text-muted-foreground min-w-[44px]">└ 형태</span>
                    <div className="flex flex-wrap gap-1.5">
                        {CHANNEL_SUBTYPES[ch.id].map(sub => {
                            const isSubSelected = selected.includes(sub.id)
                            return (
                                <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => handleSubtypeClick(sub.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200",
                                        isSubSelected
                                            ? cn(getChannelStyle(ch.id, true), "scale-105")
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    <span>{sub.emoji}</span>
                                    <span>{sub.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}

            {/* 기타 직접 입력 */}
            {isOtherSelected && (
                <div className="flex items-center gap-2 pl-2 animate-in slide-in-from-top-1 duration-200">
                    <span className="text-xs text-muted-foreground min-w-[44px]">└ 채널</span>
                    <div className="relative flex-1 max-w-xs">
                        <input
                            type="text"
                            value={otherText}
                            onChange={e => handleOtherTextChange(e.target.value)}
                            placeholder="채널명 직접 입력 (예: 팟캐스트, 카카오뷰)"
                            className="w-full px-3 py-1.5 pr-8 rounded-full border border-slate-200 text-xs focus:outline-none focus:border-slate-400 bg-white placeholder:text-slate-400"
                        />
                        {otherText && (
                            <button
                                type="button"
                                onClick={() => handleOtherTextChange("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
