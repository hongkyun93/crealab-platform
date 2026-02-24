'use client'

import { useState } from 'react'

// ── 공통 계산 로직 ──
function calcAdValue(
    followers: number,
    erPct: number,
    cpE: number,
    contentMult: number,
    conditions: { usage: boolean; exclusive: boolean; production: boolean; season: boolean }
) {
    const base = Math.round(followers * (erPct / 100) * cpE)
    const condMult =
        (conditions.usage ? 1.35 : 1) *
        (conditions.exclusive ? 1.5 : 1) *
        (conditions.production ? 1.3 : 1) *
        (conditions.season ? 1.15 : 1)
    const val = Math.round(base * contentMult * condMult)
    return { min: Math.round(val * 0.8), max: Math.round(val * 1.2), avg: val }
}

function fmt(n: number) {
    if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`
    if (n >= 10000) return `${Math.round(n / 10000)}만원`
    return `${n.toLocaleString()}원`
}

// ── 공통 상태 ──
function useCalcState() {
    const followers = 10000
    const er = 9.0
    const cpe = 900
    const [content, setContent] = useState<'reels' | 'feed' | 'story'>('reels')
    const [usage, setUsage] = useState(false)
    const [exclusive, setExclusive] = useState(false)
    const [production, setProduction] = useState(false)
    const [season, setSeason] = useState(false)
    const contentMult = content === 'reels' ? 1.5 : content === 'feed' ? 1.0 : 0.5
    const result = calcAdValue(followers, er, cpe, contentMult, { usage, exclusive, production, season })
    return { followers, er, cpe, content, setContent, usage, setUsage, exclusive, setExclusive, production, setProduction, season, setSeason, result, contentMult }
}

// ═══════════════════════════════════════════════
// VARIANT A: 다크 글래스모피즘
// ═══════════════════════════════════════════════
function VariantA() {
    const s = useCalcState()
    const conditions = [
        { label: '2차 활용권', desc: '+35%', active: s.usage, set: s.setUsage },
        { label: '독점 계약', desc: '+50%', active: s.exclusive, set: s.setExclusive },
        { label: '고제작 난이도', desc: '+30%', active: s.production, set: s.setProduction },
        { label: '시의성 콘텐츠', desc: '+15%', active: s.season, set: s.setSeason },
    ]
    return (
        <div className="relative rounded-3xl overflow-hidden p-8"
            style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
            {/* 배경 광원 */}
            <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl"
                style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
            <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full opacity-20 blur-3xl"
                style={{ background: 'radial-gradient(circle, #34d399, transparent)' }} />

            {/* 헤더 */}
            <div className="relative mb-8">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-300 mb-1">Ad Value Calculator</p>
                <h2 className="text-2xl font-bold text-white">내 광고 단가</h2>
            </div>

            {/* 기본 지표 */}
            <div className="relative grid grid-cols-3 gap-3 mb-6">
                {[
                    { label: '팔로워', value: '1.0만', sub: '마이크로', color: '#a78bfa' },
                    { label: '참여율', value: `${s.er}%`, sub: 'Instagram 실측', color: '#34d399' },
                    { label: 'CPE', value: `₩${s.cpe}`, sub: '뷰티', color: '#60a5fa' },
                ].map(item => (
                    <div key={item.label}
                        className="rounded-2xl p-4 backdrop-blur-md border border-white/10 text-center"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <p className="text-[10px] text-white/40 mb-1">{item.label}</p>
                        <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                        <p className="text-[9px] text-white/30 mt-0.5">{item.sub}</p>
                    </div>
                ))}
            </div>

            {/* 콘텐츠 유형 */}
            <div className="relative mb-6">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-3">Content Type</p>
                <div className="grid grid-cols-3 gap-2">
                    {(['reels', 'feed', 'story'] as const).map(ct => (
                        <button key={ct}
                            onClick={() => s.setContent(ct)}
                            className="relative py-3 rounded-xl font-semibold text-xs transition-all duration-300 overflow-hidden"
                            style={s.content === ct
                                ? { background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', color: 'white', boxShadow: '0 0 20px rgba(167,139,250,0.4)' }
                                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {ct === 'reels' ? '🎬 릴스 ×1.5' : ct === 'feed' ? '🖼️ 피드 ×1.0' : '⏱️ 스토리 ×0.5'}
                        </button>
                    ))}
                </div>
            </div>

            {/* 부가 조건 */}
            <div className="relative mb-6">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-3">Conditions</p>
                <div className="grid grid-cols-2 gap-2">
                    {conditions.map(c => (
                        <button key={c.label}
                            onClick={() => c.set(!c.active)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300"
                            style={c.active
                                ? { background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.5)' }
                                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                                style={c.active ? { background: '#a78bfa' } : { border: '2px solid rgba(255,255,255,0.2)' }}>
                                {c.active && <span className="text-white text-[8px]">✓</span>}
                            </div>
                            <div>
                                <p className="text-xs font-medium text-white/80">{c.label}</p>
                                <p className="text-[9px] text-white/30">{c.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* 결과 */}
            <div className="relative rounded-2xl p-6 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(52,211,153,0.1))', border: '1px solid rgba(255,255,255,0.12)' }}>
                <p className="text-[10px] tracking-widest uppercase text-white/40 mb-2">Estimated Value</p>
                <p className="text-4xl font-black text-white tracking-tight">
                    {fmt(s.result.min)}<span className="text-white/30 mx-2">~</span>{fmt(s.result.max)}
                </p>
                <p className="text-sm text-purple-300 mt-2 font-medium">평균 {fmt(s.result.avg)}</p>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════
// VARIANT B: 미니멀 모노크롬
// ═══════════════════════════════════════════════
function VariantB() {
    const s = useCalcState()
    const conditions = [
        { label: '2차 활용권', desc: '+35%', active: s.usage, set: s.setUsage },
        { label: '독점 계약', desc: '+50%', active: s.exclusive, set: s.setExclusive },
        { label: '고제작 난이도', desc: '+30%', active: s.production, set: s.setProduction },
        { label: '시의성', desc: '+15%', active: s.season, set: s.setSeason },
    ]
    return (
        <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
            {/* 헤더 */}
            <div className="flex items-end justify-between mb-10 pb-8 border-b border-zinc-100">
                <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-400 mb-1">광고 가치 계산기</p>
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Ad Value</h2>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-zinc-400">Instagram 실측 ER</p>
                    <p className="text-2xl font-black text-zinc-900">{s.er}%</p>
                </div>
            </div>

            {/* 기본 지표 */}
            <div className="grid grid-cols-3 gap-px mb-8 bg-zinc-100 rounded-2xl overflow-hidden">
                {[
                    { label: '팔로워', value: '1.0만', sub: '마이크로' },
                    { label: 'CPE', value: `₩${s.cpe}`, sub: '뷰티' },
                    { label: '콘텐츠', value: s.content === 'reels' ? '릴스' : s.content === 'feed' ? '피드' : '스토리', sub: `×${s.contentMult}` },
                ].map(item => (
                    <div key={item.label} className="bg-white p-5 text-center">
                        <p className="text-[9px] text-zinc-400 uppercase tracking-widest mb-2">{item.label}</p>
                        <p className="text-lg font-black text-zinc-900">{item.value}</p>
                        <p className="text-[9px] text-zinc-400 mt-1">{item.sub}</p>
                    </div>
                ))}
            </div>

            {/* 콘텐츠 유형 */}
            <div className="flex gap-1 p-1 bg-zinc-50 rounded-xl mb-6">
                {(['reels', 'feed', 'story'] as const).map(ct => (
                    <button key={ct}
                        onClick={() => s.setContent(ct)}
                        className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200"
                        style={s.content === ct
                            ? { background: '#09090b', color: 'white' }
                            : { color: '#71717a' }}>
                        {ct === 'reels' ? '릴스' : ct === 'feed' ? '피드' : '스토리'}
                    </button>
                ))}
            </div>

            {/* 부가 조건 */}
            <div className="space-y-2 mb-8">
                {conditions.map(c => (
                    <button key={c.label}
                        onClick={() => c.set(!c.active)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all"
                        style={c.active
                            ? { borderColor: '#09090b', background: '#09090b' }
                            : { borderColor: '#f4f4f5', background: '#fafafa' }}>
                        <span className={`text-xs font-semibold ${c.active ? 'text-white' : 'text-zinc-700'}`}>{c.label}</span>
                        <span className={`text-xs font-bold ${c.active ? 'text-zinc-300' : 'text-zinc-400'}`}>{c.desc}</span>
                    </button>
                ))}
            </div>

            {/* 결과 */}
            <div className="rounded-2xl p-6" style={{ background: '#09090b' }}>
                <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-500 mb-3">Estimated Range</p>
                <p className="text-3xl font-black text-white tracking-tight leading-none">
                    {fmt(s.result.min)}<span className="text-zinc-600 mx-2 font-light">—</span>{fmt(s.result.max)}
                </p>
                <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                    <span className="text-[10px] text-zinc-600">평균 단가</span>
                    <span className="text-sm font-bold text-zinc-300">{fmt(s.result.avg)}</span>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════
// VARIANT C: 네온 데이터 대시보드
// ═══════════════════════════════════════════════
function VariantC() {
    const s = useCalcState()
    const conditions = [
        { label: '2차 활용권', desc: '+35%', active: s.usage, set: s.setUsage, color: '#f472b6' },
        { label: '독점 계약', desc: '+50%', active: s.exclusive, set: s.setExclusive, color: '#fb923c' },
        { label: '고제작 난이도', desc: '+30%', active: s.production, set: s.setProduction, color: '#facc15' },
        { label: '시의성', desc: '+15%', active: s.season, set: s.setSeason, color: '#4ade80' },
    ]
    const totalMult = (s.usage ? 1.35 : 1) * (s.exclusive ? 1.5 : 1) * (s.production ? 1.3 : 1) * (s.season ? 1.15 : 1)

    return (
        <div className="rounded-3xl p-6 relative overflow-hidden"
            style={{ background: '#050814' }}>

            {/* 그리드 배경 패턴 */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />

            {/* 헤더 */}
            <div className="relative flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
                    <span className="text-xs font-mono text-cyan-400 tracking-wider">AD_VALUE_CALC_v2</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-600">Instagram API 실측</span>
            </div>

            {/* 메인 수치 */}
            <div className="relative mb-6 p-5 rounded-2xl border"
                style={{ background: 'rgba(56,189,248,0.04)', borderColor: 'rgba(56,189,248,0.12)' }}>
                <p className="text-[9px] font-mono text-cyan-600 mb-3 tracking-widest">ESTIMATED_OUTPUT</p>
                <p className="font-mono font-black leading-none"
                    style={{ fontSize: '36px', background: 'linear-gradient(90deg, #38bdf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {fmt(s.result.avg)}
                </p>
                <div className="flex gap-4 mt-3">
                    <span className="text-[10px] font-mono text-zinc-500">↓ {fmt(s.result.min)}</span>
                    <span className="text-zinc-700">|</span>
                    <span className="text-[10px] font-mono text-zinc-500">↑ {fmt(s.result.max)}</span>
                </div>
            </div>

            {/* 지표 바 */}
            <div className="relative space-y-3 mb-6">
                {[
                    { label: 'FOLLOWERS', value: '10,000', pct: 45, color: '#a78bfa' },
                    { label: 'ER_RATE', value: `${s.er}%`, pct: 75, color: '#34d399' },
                    { label: 'CPE_BASE', value: `₩${s.cpe}`, pct: 55, color: '#60a5fa' },
                    { label: 'CONTENT_MULT', value: `×${s.contentMult}`, pct: s.contentMult === 1.5 ? 100 : s.contentMult === 1.0 ? 65 : 35, color: '#f472b6' },
                ].map(item => (
                    <div key={item.label}>
                        <div className="flex justify-between mb-1">
                            <span className="text-[9px] font-mono text-zinc-600">{item.label}</span>
                            <span className="text-[9px] font-mono" style={{ color: item.color }}>{item.value}</span>
                        </div>
                        <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${item.pct}%`, background: item.color, boxShadow: `0 0 6px ${item.color}60` }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* 콘텐츠 유형 */}
            <div className="grid grid-cols-3 gap-2 mb-5">
                {(['reels', 'feed', 'story'] as const).map(ct => (
                    <button key={ct}
                        onClick={() => s.setContent(ct)}
                        className="py-2.5 rounded-xl font-mono text-[10px] font-bold transition-all duration-200 border"
                        style={s.content === ct
                            ? { borderColor: '#38bdf8', color: '#38bdf8', background: 'rgba(56,189,248,0.1)', boxShadow: '0 0 12px rgba(56,189,248,0.15)' }
                            : { borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', background: 'transparent' }}>
                        {ct === 'reels' ? 'REELS' : ct === 'feed' ? 'FEED' : 'STORY'}
                        <span className="block text-[8px] opacity-60 mt-0.5">
                            {ct === 'reels' ? '×1.5' : ct === 'feed' ? '×1.0' : '×0.5'}
                        </span>
                    </button>
                ))}
            </div>

            {/* 부가 조건 */}
            <div className="grid grid-cols-2 gap-2">
                {conditions.map(c => (
                    <button key={c.label}
                        onClick={() => c.set(!c.active)}
                        className="relative px-3 py-2.5 rounded-xl text-left overflow-hidden transition-all duration-200 border"
                        style={c.active
                            ? { borderColor: c.color, background: `${c.color}15` }
                            : { borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                        {c.active && (
                            <div className="absolute top-0 right-0 w-16 h-16 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"
                                style={{ background: c.color, filter: 'blur(16px)' }} />
                        )}
                        <p className="text-[9px] font-mono relative" style={{ color: c.active ? c.color : 'rgba(255,255,255,0.3)' }}>
                            {c.label}
                        </p>
                        <p className="text-xs font-black relative mt-0.5" style={{ color: c.active ? c.color : 'rgba(255,255,255,0.15)' }}>
                            {c.desc}
                        </p>
                    </button>
                ))}
            </div>

            {/* 총 배율 표시 */}
            {totalMult > 1 && (
                <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-[9px] font-mono text-zinc-600">TOTAL_MULTIPLIER</span>
                    <span className="text-sm font-mono font-black"
                        style={{ color: '#facc15', textShadow: '0 0 12px rgba(250,204,21,0.5)' }}>
                        ×{totalMult.toFixed(2)}
                    </span>
                </div>
            )}
        </div>
    )
}

// ═══════════════════════════════════════════════
// 메인 페이지
// ═══════════════════════════════════════════════
export default function CalculatorDesignLab() {
    const [active, setActive] = useState<'A' | 'B' | 'C'>('A')
    const variants = [
        { id: 'A' as const, name: 'Dark Glass', desc: '글래스모피즘' },
        { id: 'B' as const, name: 'Mono Clean', desc: '미니멀 모노크롬' },
        { id: 'C' as const, name: 'Neon Dash', desc: '네온 대시보드' },
    ]

    return (
        <div className="min-h-screen bg-zinc-100 p-8">
            <div className="max-w-5xl mx-auto">
                {/* 헤더 */}
                <div className="mb-10">
                    <p className="text-xs text-zinc-400 font-medium tracking-widest uppercase mb-1">Design Lab / Calculator</p>
                    <h1 className="text-3xl font-black text-zinc-900">광고 단가 계산기 디자인</h1>
                    <p className="text-sm text-zinc-500 mt-2">3가지 디자인 방향 — 더미 데이터 기준 (팔로워 1만, ER 9%, 뷰티)</p>
                </div>

                {/* 탭 선택 (모바일) */}
                <div className="flex gap-2 mb-8 md:hidden">
                    {variants.map(v => (
                        <button key={v.id}
                            onClick={() => setActive(v.id)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${active === v.id ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500'}`}>
                            {v.id}. {v.name}
                        </button>
                    ))}
                </div>

                {/* 3열 그리드 (데스크톱) */}
                <div className="hidden md:grid grid-cols-3 gap-6">
                    {variants.map((v, i) => (
                        <div key={v.id}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center">
                                    <span className="text-[10px] font-black text-white">{v.id}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-900">{v.name}</p>
                                    <p className="text-[10px] text-zinc-400">{v.desc}</p>
                                </div>
                            </div>
                            {i === 0 ? <VariantA /> : i === 1 ? <VariantB /> : <VariantC />}
                        </div>
                    ))}
                </div>

                {/* 모바일 - 선택된 것만 */}
                <div className="md:hidden">
                    {active === 'A' ? <VariantA /> : active === 'B' ? <VariantB /> : <VariantC />}
                </div>

                {/* 하단 노트 */}
                <div className="mt-12 p-6 bg-white rounded-2xl border border-zinc-100">
                    <p className="text-sm font-bold text-zinc-900 mb-3">디자인 포인트</p>
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { id: 'A', points: ['다크 배경 + 글로우 효과', '보라/민트 컬러 팔레트', '프리미엄 고급 느낌'] },
                            { id: 'B', points: ['흑백 미니멀 타이포', '탭 스위처 UI', '에디토리얼 브랜드 느낌'] },
                            { id: 'C', points: ['네온 + 모노스페이스', '바 차트 진행도', '데이터 분석 대시보드'] },
                        ].map(v => (
                            <div key={v.id}>
                                <p className="text-xs font-bold text-zinc-500 mb-2">Variant {v.id}</p>
                                <ul className="space-y-1">
                                    {v.points.map(p => (
                                        <li key={p} className="text-xs text-zinc-600 flex items-start gap-1.5">
                                            <span className="text-zinc-300 mt-0.5">·</span>{p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
