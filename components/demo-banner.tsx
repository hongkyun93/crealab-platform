"use client"

import { useDemoMode } from "@/lib/contexts/demo-context"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export function DemoBanner() {
    const { isDemoMode } = useDemoMode()

    if (!isDemoMode) return null

    return (
        <div className="sticky top-0 z-[60] flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-4 py-2.5 text-white text-sm font-medium shadow-lg">
            <Sparkles className="h-4 w-4 shrink-0 animate-pulse" />
            <span>데모 모드 · 이 페이지는 샘플 데이터로 보여지고 있습니다</span>
            <Link
                href="/signup"
                className="ml-2 rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold hover:bg-white/30 transition-colors"
            >
                회원가입 →
            </Link>
        </div>
    )
}
