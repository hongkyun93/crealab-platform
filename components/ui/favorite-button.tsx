"use client"

import { useFavorites } from "@/components/providers/favorite-provider"
import type { FavoriteTargetType } from "@/lib/types/favorite"
import { Star } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
    targetId: string
    targetType: FavoriteTargetType
    /** 버튼 크기 — 기본 sm (h-7 w-7) */
    size?: "sm" | "md"
    /** 배경 어두운 카드(CardB) 위에서 쓸 때 */
    overlay?: boolean
    className?: string
}

export function FavoriteButton({
    targetId,
    targetType,
    size = "sm",
    overlay = false,
    className,
}: FavoriteButtonProps) {
    const { isFavorited, toggleFavorite } = useFavorites()
    const [isPending, setIsPending] = useState(false)

    const active = isFavorited(targetId, targetType)

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        if (isPending) return
        setIsPending(true)
        try {
            await toggleFavorite(targetId, targetType)
        } catch {
            // 에러는 provider에서 이미 처리
        } finally {
            setIsPending(false)
        }
    }

    const sizeClass = size === "md" ? "h-8 w-8" : "h-7 w-7"

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isPending}
            title={active ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            className={cn(
                "flex items-center justify-center rounded-full transition-all duration-150",
                sizeClass,
                overlay
                    ? "bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white"
                    : "bg-background/80 hover:bg-yellow-50 border border-border/60 shadow-sm",
                active && !overlay && "bg-yellow-50 border-yellow-200",
                active && overlay && "bg-yellow-400/80",
                isPending && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            <Star
                className={cn(
                    "transition-all duration-150",
                    size === "md" ? "h-4 w-4" : "h-3.5 w-3.5",
                    active ? "fill-yellow-400 text-yellow-400" : overlay ? "text-white/80" : "text-muted-foreground"
                )}
            />
        </button>
    )
}
