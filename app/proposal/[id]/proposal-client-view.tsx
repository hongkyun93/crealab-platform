"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, ChevronRight, Handshake, Instagram, Loader2, PlayCircle, Sparkles, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ProposalClientViewProps {
    portfolio: any;
    creators: any[];
}

export function ProposalClientView({ portfolio, creators }: ProposalClientViewProps) {
    const router = useRouter()
    const [loadingCreatorId, setLoadingCreatorId] = useState<string | null>(null)

    const handleCollaborate = async (creatorId: string) => {
        setLoadingCreatorId(creatorId)
        try {
            // Server-side generate a direct workspace for this specific creator based on portfolio
            const res = await fetch('/api/workspace/portfolio-collab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    portfolioId: portfolio.id,
                    creatorId: creatorId
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || '협업방 생성 실패')

            toast.success("워크스페이스가 생성되었습니다. 잠시 후 이동합니다.")

            // Redirect to the magic link /w/join/:token
            window.location.href = data.magicLink

        } catch (error: any) {
            console.error("Collab create error:", error)
            toast.error(error.message || "협업 시작 중 오류가 발생했습니다.")
            setLoadingCreatorId(null)
        }
    }

    const fmtFollowers = (num: number) => {
        if (!num) return '0'
        return num >= 10000 ? `${(num / 10000).toFixed(1)}만` : num.toLocaleString()
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Header Hero */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-16 pb-12 px-6">
                <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">
                    {/* Team Info */}
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border shadow-sm ring-2 ring-indigo-50 dark:ring-indigo-900/30">
                            <AvatarImage src={portfolio.team?.logo_url} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                                {portfolio.team?.name?.[0] || 'T'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">MCN Partner</p>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{portfolio.team?.name}</h2>
                        </div>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-3xl">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            {portfolio.brand_name ? `${portfolio.brand_name}님을 위한` : '특별한 가치를 전하는'}
                        </span>
                        <br />크리에이터 제안서
                    </h1>

                    {/* Message Area */}
                    {portfolio.message && (
                        <div className="mt-8 relative max-w-2xl bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="absolute -top-3 left-6 text-2xl">💬</div>
                            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {portfolio.message}
                            </p>
                        </div>
                    )}
                </div>
            </header>

            {/* Creator Roster */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6 text-slate-400" />
                        추천 크리에이터 <span className="text-indigo-600">{creators.length}</span>
                    </h3>
                </div>

                {creators.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">추천된 크리에이터가 없습니다.</p>
                        <p className="text-sm text-slate-500 mt-1">링크가 삭제되었거나 크리에이터 라인업이 비어있습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {creators.map((creator) => (
                            <Card key={creator.id} className="group overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900 flex flex-col">

                                {/* Top Banner Image (Simulated blur background) */}
                                <div className="h-24 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center blur-xl opacity-50 scale-110"
                                        style={{ backgroundImage: `url(${creator.avatar_url})` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                                </div>

                                {/* Avatar & Content */}
                                <CardContent className="px-6 pb-6 pt-0 relative flex-1 flex flex-col">
                                    <div className="flex justify-between items-end mb-4">
                                        <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-900 shadow-md -mt-10 relative z-10 bg-white">
                                            <AvatarImage src={creator.avatar_url || ''} className="object-cover" />
                                            <AvatarFallback className="text-2xl font-bold">{creator.display_name?.[0]}</AvatarFallback>
                                        </Avatar>

                                        {creator.instagram_handle && (
                                            <a
                                                href={`https://instagram.com/${creator.instagram_handle}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1 text-xs font-semibold bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 px-3 py-1.5 rounded-full hover:bg-pink-200 transition-colors"
                                            >
                                                <Instagram className="h-3.5 w-3.5" />
                                                @{creator.instagram_handle}
                                            </a>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {creator.display_name}
                                        </h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                            {creator.category || '크리에이터'}
                                        </p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 mt-5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">팔로워</p>
                                            <p className="font-bold text-slate-800 dark:text-slate-200">{fmtFollowers(creator.followers_count)}명</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">릴스단가</p>
                                            <p className="font-bold text-indigo-600 dark:text-indigo-400">
                                                {creator.price_video > 0 ? `₩${(creator.price_video / 10000).toFixed(0)}만` : '협의'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1.5 mt-5">
                                        {creator.tags?.slice(0, 3).map((tag: string) => (
                                            <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 font-normal">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Spacer */}
                                    <div className="flex-1" />

                                    {/* Action Button */}
                                    <Button
                                        onClick={() => handleCollaborate(creator.id)}
                                        disabled={loadingCreatorId !== null}
                                        className="w-full mt-6 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                                    >
                                        {loadingCreatorId === creator.id ? (
                                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> 개설 중...</>
                                        ) : (
                                            <><Handshake className="h-4 w-4 mr-2" /> 바로 협업 시작하기</>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="text-center pb-12 pt-8 text-sm text-slate-400">
                Powered by <span className="font-semibold text-slate-500">CreadyPick Workspace</span>
            </footer>
        </div>
    )
}
