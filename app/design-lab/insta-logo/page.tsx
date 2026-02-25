"use client"

import { Instagram, Bookmark, Trash2 } from "lucide-react"

const MOCK = { handle: "go_gyeol_kim", followers: 10092 }

const VARIANTS = [
    {
        id: "A",
        name: "Midnight Charcoal",
        desc: "짙은 차콜 — 고급스럽고 중성적",
        bg: "from-slate-700 to-slate-900",
        icon: "text-white/90",
        text: "text-white",
        sub: "text-white/60",
        followerBg: "bg-white/10",
        badge: "bg-pink-500/80",
    },
    {
        id: "B",
        name: "Deep Navy",
        desc: "딥 네이비 — 신뢰감, 전문성",
        bg: "from-blue-900 to-slate-900",
        icon: "text-white/90",
        text: "text-white",
        sub: "text-white/60",
        followerBg: "bg-white/10",
        badge: "bg-blue-400/80",
    },
    {
        id: "C",
        name: "Graphite",
        desc: "그라파이트 — 애플 느낌, 미니멀",
        bg: "from-zinc-600 to-zinc-800",
        icon: "text-white/90",
        text: "text-white",
        sub: "text-white/60",
        followerBg: "bg-white/10",
        badge: "bg-zinc-400/80",
    },
    {
        id: "D",
        name: "Warm Dark",
        desc: "웜 다크 — 따뜻한 느낌, Notion 스타일",
        bg: "from-stone-700 to-stone-900",
        icon: "text-white/90",
        text: "text-white",
        sub: "text-white/60",
        followerBg: "bg-white/10",
        badge: "bg-amber-400/80",
    },
    {
        id: "E",
        name: "Forest Dark",
        desc: "다크 그린 — 자연/건강 카테고리 어울림",
        bg: "from-emerald-900 to-slate-900",
        icon: "text-white/90",
        text: "text-white",
        sub: "text-white/60",
        followerBg: "bg-white/10",
        badge: "bg-emerald-400/80",
    },
    {
        id: "F",
        name: "Light Stone",
        desc: "라이트 모드 — 밝은 중성, Notion 라이트",
        bg: "from-stone-100 to-stone-200",
        icon: "text-stone-600",
        text: "text-stone-800",
        sub: "text-stone-400",
        followerBg: "bg-stone-300/50",
        badge: "bg-pink-100 text-pink-700",
        light: true,
    },
    {
        id: "G",
        name: "Emerald Gradient",
        desc: "에메랄드 그라디언트 — 신선하고 생동감",
        bg: "from-emerald-500 to-teal-700",
        icon: "text-white/90",
        text: "text-white",
        sub: "text-white/60",
        followerBg: "bg-white/15",
        badge: "bg-white/20 text-white",
    },
    {
        id: "H",
        name: "Indigo Gradient",
        desc: "인디고 그라디언트 — 세련되고 프리미엄",
        bg: "from-indigo-500 to-violet-700",
        icon: "text-white/90",
        text: "text-white",
        sub: "text-white/60",
        followerBg: "bg-white/15",
        badge: "bg-white/20 text-white",
    },
    {
        id: "H2",
        name: "Deep Indigo",
        desc: "딥 인디고 — 더 진하고 묵직한 버전",
        bg: "from-indigo-700 to-purple-900",
        icon: "text-white/90",
        text: "text-white",
        sub: "text-white/60",
        followerBg: "bg-white/15",
        badge: "bg-white/20 text-white",
    },
    {
        id: "H3",
        name: "Indigo → Blue",
        desc: "인디고 → 블루 — 시원하고 밝은 느낌",
        bg: "from-indigo-400 to-blue-600",
        icon: "text-white/90",
        text: "text-white",
        sub: "text-white/60",
        followerBg: "bg-white/15",
        badge: "bg-white/20 text-white",
    },
    {
        id: "H4",
        name: "Indigo Soft",
        desc: "인디고 소프트 — 연한 파스텔 톤",
        bg: "from-indigo-300 to-violet-400",
        icon: "text-white/90",
        text: "text-white",
        sub: "text-white/70",
        followerBg: "bg-white/20",
        badge: "bg-white/30 text-white",
    },
    {
        id: "I",
        name: "Emerald × Indigo Mix",
        desc: "에메랄드 + 인디고 믹스 — 독창적, 브랜드 컬러",
        bg: "from-emerald-400 via-teal-500 to-indigo-600",
        icon: "text-white/90",
        text: "text-white",
        sub: "text-white/60",
        followerBg: "bg-white/15",
        badge: "bg-white/20 text-white",
    },
]

function MockCard({ v }: { v: typeof VARIANTS[0] }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-neutral-200">{v.id}.</span>
                <span className="text-sm font-semibold text-neutral-200">{v.name}</span>
            </div>
            <p className="text-xs text-neutral-500 mb-3">{v.desc}</p>

            <div className={`rounded-2xl bg-gradient-to-br ${v.bg} p-5 relative`}>
                {/* Header row */}
                <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-xl bg-white/10`}>
                        <Instagram className={`h-5 w-5 ${v.icon}`} />
                    </div>
                    <div className="flex gap-1.5">
                        <button className={`p-1.5 rounded-lg bg-white/10 ${v.sub} hover:bg-white/20`}>
                            <Bookmark className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg bg-red-400/20 text-red-300 hover:bg-red-400/30">
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Handle */}
                <p className={`text-base font-bold mt-3 mb-2 ${v.text}`}>{MOCK.handle}</p>

                {/* Follower row */}
                <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${v.followerBg}`}>
                    <span className={`text-xs ${v.sub}`}>👥 팔로워</span>
                    <span className={`text-sm font-bold ${v.text}`}>{MOCK.followers.toLocaleString()}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-2 pt-2">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className={`text-xs ${v.sub}`}>공개</span>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-semibold ${v.badge || 'bg-white/20 text-white'}`}>
                        🔥 메인 채널
                    </span>
                </div>
            </div>
        </div>
    )
}

export default function InstaLogoDesignLab() {
    return (
        <div className="min-h-screen bg-neutral-950 py-12 px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-2xl font-bold text-white mb-2">소셜채널 카드 — 중성 색상 디자인 3종</h1>
                    <p className="text-sm text-neutral-500">
                        Instagram 그라디언트 대신 사용할 수 있는 중성 색상 버전들입니다.
                        로고 아이콘은 유지, 배경색만 변경합니다.
                    </p>
                    <div className="mt-3 px-3 py-2 rounded-lg bg-amber-900/30 border border-amber-700/40 text-xs text-amber-400 inline-block">
                        ⚠️ Meta 브랜드 가이드라인: Instagram 시그니처 그라디언트 → 중성 배경으로 교체 권장
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {VARIANTS.map(v => <MockCard key={v.id} v={v} />)}
                </div>

                <div className="mt-10 p-4 rounded-xl border border-neutral-800 bg-neutral-900">
                    <p className="text-xs text-neutral-400">
                        현재 적용 중: <span className="text-orange-400 font-mono">Instagram 시그니처 그라디언트 (pink → orange)</span>
                        &nbsp;→ 위 A~F 중 선택 시 SocialChannelCard에 즉시 적용됩니다.
                    </p>
                </div>
            </div>
        </div>
    )
}
