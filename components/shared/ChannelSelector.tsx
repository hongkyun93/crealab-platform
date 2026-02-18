"use client"

import { cn } from "@/lib/utils"
import { Film, Zap, Music, Instagram, Youtube, FileText } from "lucide-react"

export const CHANNELS = [
    { id: "reels", label: "인스타 릴스", Icon: Film },
    { id: "shorts", label: "유튜브 숏츠", Icon: Zap },
    { id: "tiktok", label: "틱톡", Icon: Music },
    { id: "instagram", label: "인스타그램", Icon: Instagram },
    { id: "youtube", label: "유튜브", Icon: Youtube },
    { id: "blog", label: "블로그", Icon: FileText }
]

interface ChannelSelectorProps {
    selected: string[]
    onChange: (channels: string[]) => void
    label?: string
    description?: string
}

export function ChannelSelector({
    selected,
    onChange,
    label = "희망 채널",
    description
}: ChannelSelectorProps) {
    const toggleChannel = (channelId: string) => {
        if (selected.includes(channelId)) {
            onChange(selected.filter(c => c !== channelId))
        } else {
            onChange([...selected, channelId])
        }
    }

    return (
        <div className="space-y-2">
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
                        {selected.length}개 선택됨
                    </span>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {CHANNELS.map((channel) => {
                    const Icon = channel.Icon
                    const isSelected = selected.includes(channel.id)

                    // Styles based on channel type
                    let activeClass = "bg-slate-900 border-slate-900 text-white"
                    let iconClass = "text-current"

                    if (isSelected) {
                        if (channel.id === 'instagram' || channel.id === 'reels') {
                            activeClass = "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 border-transparent text-white shadow-md transform scale-105"
                        } else if (channel.id === 'youtube' || channel.id === 'shorts') {
                            activeClass = "bg-gradient-to-r from-red-600 to-red-700 border-transparent text-white shadow-md transform scale-105"
                        } else if (channel.id === 'tiktok') {
                            activeClass = "bg-gradient-to-r from-black via-slate-900 to-slate-800 border-transparent text-white shadow-md transform scale-105"
                        } else if (channel.id === 'blog') {
                            activeClass = "bg-gradient-to-r from-green-500 to-green-600 border-transparent text-white shadow-md transform scale-105"
                        }
                    }

                    return (
                        <button
                            key={channel.id}
                            type="button"
                            onClick={() => toggleChannel(channel.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm transition-all duration-300",
                                isSelected
                                    ? activeClass
                                    : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200 hover:border-slate-300"
                            )}
                        >
                            <Icon className={cn("h-4 w-4", isSelected ? "text-white" : "text-slate-500")} />
                            <span className="font-medium">{channel.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
