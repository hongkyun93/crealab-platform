'use client'
import { useState } from 'react'

// ── Shared logic ──
function calc(er: number, cpe: number, ct: string, conds: boolean[]) {
    const cm = ct === 'reels' ? 1.5 : ct === 'feed' ? 1.0 : 0.5
    const add = (conds[0] ? 1.35 : 1) * (conds[1] ? 1.5 : 1) * (conds[2] ? 1.3 : 1) * (conds[3] ? 1.15 : 1)
    const v = Math.round(10000 * (er / 100) * cpe * cm * add)
    return { min: Math.round(v * 0.8), avg: v, max: Math.round(v * 1.2) }
}
const won = (n: number) => n >= 10000000 ? `${(n / 10000000).toFixed(1)}천만원` : n >= 10000 ? `${Math.round(n / 10000)}만원` : `${n.toLocaleString()}원`
const wonShort = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n.toLocaleString()
const CONDS_DATA = [
    { label: '2차 활용권', pct: '+35%' },
    { label: '독점 계약', pct: '+50%' },
    { label: '고제작 난이도', pct: '+30%' },
    { label: '시의성', pct: '+15%' },
]
function useS() {
    const [ct, setCt] = useState<'reels' | 'feed' | 'story'>('reels')
    const [cs, setCs] = useState([false, false, false, false])
    const toggle = (i: number) => setCs(p => p.map((v, j) => j === i ? !v : v))
    const r = calc(9.0, 900, ct, cs)
    return { ct, setCt, cs, toggle, r }
}

// ── V1: Apple Stocks Dark ──
function V1() {
    const s = useS()
    const pct = (s.r.avg / 900000 - 1) * 100  // base is 90만
    const metrics = [
        ['팔로워', '10,000'], ['ER', '9.00%'], ['CPE', '₩900'],
        ['카테고리', '뷰티'], ['데이터 소스', 'Instagram API'], ['콘텐츠', s.ct === 'reels' ? '릴스 ×1.5' : s.ct === 'feed' ? '피드 ×1.0' : '스토리 ×0.5'],
    ]
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#1c1c1e', color: 'white' }}>
            {/* 헤더 */}
            <div className="px-5 pt-5 pb-3">
                <div className="flex items-start justify-between mb-1">
                    <div>
                        <p className="text-xl font-bold tracking-tight">{won(s.r.avg)}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: pct >= 0 ? '#30d158' : '#ff453a' }}>
                            {pct >= 0 ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}% · 릴스 기준
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs" style={{ color: '#636366' }}>범위</p>
                        <p className="text-[11px] font-semibold" style={{ color: '#98989d' }}>{wonShort(s.r.min)} ~ {wonShort(s.r.max)}</p>
                    </div>
                </div>
                {/* 시각적 바 */}
                <div className="mt-3 mb-1 h-12 relative rounded-lg overflow-hidden" style={{ background: '#2c2c2e' }}>
                    <div className="absolute inset-y-0 left-0 rounded-lg" style={{ width: `${(s.r.avg / s.r.max) * 100}%`, background: 'linear-gradient(90deg, rgba(48,209,88,0.15), rgba(48,209,88,0.4))' }} />
                    <div className="absolute inset-0 flex items-center px-4 justify-between">
                        <span className="text-[10px]" style={{ color: '#636366' }}>MIN {wonShort(s.r.min)}만</span>
                        <span className="text-sm font-bold" style={{ color: '#30d158' }}>{wonShort(s.r.avg)}만</span>
                        <span className="text-[10px]" style={{ color: '#636366' }}>MAX {wonShort(s.r.max)}만</span>
                    </div>
                </div>
            </div>

            {/* 콘텐츠 유형 탭 */}
            <div className="px-5 pb-3">
                <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: '#2c2c2e' }}>
                    {(['reels', 'feed', 'story'] as const).map(ct => (
                        <button key={ct} onClick={() => s.setCt(ct)}
                            className="flex-1 py-1.5 rounded-md text-xs font-semibold transition-all duration-150"
                            style={s.ct === ct ? { background: '#3a3a3c', color: 'white' } : { color: '#636366' }}>
                            {ct === 'reels' ? '릴스' : ct === 'feed' ? '피드' : '스토리'}
                        </button>
                    ))}
                </div>
            </div>

            {/* 데이터 그리드 */}
            <div style={{ borderTop: '0.5px solid #3a3a3c' }}>
                {[0, 1, 2].map(row => (
                    <div key={row} className="grid grid-cols-2" style={{ borderBottom: row < 2 ? '0.5px solid #3a3a3c' : 'none' }}>
                        {metrics.slice(row * 2, row * 2 + 2).map((m, i) => (
                            <div key={m[0]} className="px-5 py-2.5" style={{ borderRight: i === 0 ? '0.5px solid #3a3a3c' : 'none' }}>
                                <p className="text-[10px] mb-0.5" style={{ color: '#636366' }}>{m[0]}</p>
                                <p className="text-xs font-semibold" style={{ color: '#f2f2f7' }}>{m[1]}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* 부가 조건 */}
            <div className="px-5 pt-3 pb-4" style={{ borderTop: '0.5px solid #3a3a3c' }}>
                <p className="text-[10px] mb-2" style={{ color: '#636366' }}>부가 조건</p>
                <div className="grid grid-cols-2 gap-1.5">
                    {CONDS_DATA.map((c, i) => (
                        <button key={c.label} onClick={() => s.toggle(i)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all"
                            style={s.cs[i] ? { background: 'rgba(48,209,88,0.15)', border: '0.5px solid rgba(48,209,88,0.3)' } : { background: '#2c2c2e', border: '0.5px solid transparent' }}>
                            <span className="text-[10px] font-medium" style={{ color: s.cs[i] ? '#30d158' : '#98989d' }}>{c.label}</span>
                            <span className="text-[10px] font-bold" style={{ color: s.cs[i] ? '#30d158' : '#48484a' }}>{c.pct}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── V2: Bloomberg Terminal Dark ──
function V2() {
    const s = useS()
    const rows = [
        ['FOLLOWERS', '10,000'], ['ER_RATE', '9.00%'],
        ['CPE_BASE', '₩900'], ['CATEGORY', 'BEAUTY'],
        ['CONTENT', s.ct.toUpperCase()], ['ADJ_MULT', `×${((s.cs[0] ? 1.35 : 1) * (s.cs[1] ? 1.5 : 1) * (s.cs[2] ? 1.3 : 1) * (s.cs[3] ? 1.15 : 1)).toFixed(2)}`],
    ]
    return (
        <div className="rounded-lg overflow-hidden" style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', fontFamily: '"Courier New", monospace' }}>
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: '#f59e0b', color: '#0a0a0a' }}>
                <p className="text-xs font-black tracking-widest uppercase">Creadypick / Rate Engine</p>
                <p className="text-[9px] font-bold">ADV-VALUE</p>
            </div>
            <div className="px-4 pt-4 pb-3">
                <p className="text-[9px] text-amber-500/60 mb-1 tracking-widest">ESTIMATED_OUTPUT KRW</p>
                <p className="text-4xl font-black" style={{ color: '#f59e0b', letterSpacing: '-0.02em' }}>
                    {won(s.r.avg).replace('만원', '')}<span className="text-xl">만원</span>
                </p>
                <div className="flex gap-4 mt-1">
                    <span className="text-[9px] text-zinc-600">LOW {wonShort(s.r.min)}만</span>
                    <span className="text-[9px] text-zinc-600">HIGH {wonShort(s.r.max)}만</span>
                    <span className="text-[9px]" style={{ color: '#f59e0b' }}>SPREAD {wonShort(s.r.max - s.r.min)}만</span>
                </div>
            </div>
            <div className="px-4 pb-3">
                <div className="flex gap-1">
                    {(['reels', 'feed', 'story'] as const).map(ct => (
                        <button key={ct} onClick={() => s.setCt(ct)}
                            className="px-3 py-1 text-[9px] font-bold tracking-widest uppercase transition-all"
                            style={s.ct === ct ? { background: '#f59e0b', color: '#0a0a0a' } : { color: '#3f3f3f', border: '1px solid #1f1f1f' }}>
                            {ct}
                        </button>
                    ))}
                </div>
            </div>
            <div style={{ borderTop: '1px solid #1f1f1f' }}>
                {rows.map((r, i) => (
                    <div key={r[0]} className="grid grid-cols-2 px-4 py-1.5" style={{ borderBottom: i < rows.length - 1 ? '1px solid #111' : 'none' }}>
                        <span className="text-[9px] tracking-widest" style={{ color: '#3f3f3f' }}>{r[0]}</span>
                        <span className="text-[9px] font-bold text-right" style={{ color: '#e5e5e5' }}>{r[1]}</span>
                    </div>
                ))}
            </div>
            <div className="px-4 py-3" style={{ borderTop: '1px solid #1f1f1f' }}>
                <div className="grid grid-cols-2 gap-1">
                    {CONDS_DATA.map((c, i) => (
                        <button key={c.label} onClick={() => s.toggle(i)}
                            className="flex justify-between items-center px-2 py-1.5 transition-all"
                            style={s.cs[i] ? { background: '#f59e0b20', border: '1px solid #f59e0b40', color: '#f59e0b' } : { border: '1px solid #1f1f1f', color: '#3f3f3f' }}>
                            <span className="text-[8px] tracking-wider uppercase">{c.label}</span>
                            <span className="text-[9px] font-black">{c.pct}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── V3: Stripe Dashboard Light ──
function V3() {
    const s = useS()
    return (
        <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #e3e8ef', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #f0f2f5' }}>
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full" style={{ background: '#635bff' }} />
                    <p className="text-xs font-semibold" style={{ color: '#425466' }}>광고 단가 예측</p>
                </div>
                <p className="text-[11px] mb-1" style={{ color: '#8898a9' }}>예상 범위 (±20%)</p>
                <p className="text-3xl font-bold tracking-tight" style={{ color: '#0a2540', letterSpacing: '-0.02em' }}>
                    {won(s.r.avg)}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#eef2ff' }}>
                        <div className="h-full rounded-full" style={{ width: '65%', background: '#635bff' }} />
                    </div>
                    <p className="text-[10px]" style={{ color: '#8898a9' }}>{won(s.r.min)} ~ {won(s.r.max)}</p>
                </div>
            </div>
            <div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f2f5' }}>
                <div className="flex gap-1.5">
                    {(['reels', 'feed', 'story'] as const).map(ct => (
                        <button key={ct} onClick={() => s.setCt(ct)}
                            className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
                            style={s.ct === ct ? { background: '#635bff', color: 'white' } : { background: '#f6f8fa', color: '#8898a9' }}>
                            {ct === 'reels' ? '릴스' : ct === 'feed' ? '피드' : '스토리'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="px-5 py-3 grid grid-cols-2 gap-y-3" style={{ borderBottom: '1px solid #f0f2f5' }}>
                {[['팔로워', '10,000명'], ['참여율', '9.00%'], ['카테고리 CPE', '₩900'], ['데이터 출처', 'Instagram API']].map(([l, v]) => (
                    <div key={l}>
                        <p className="text-[10px] mb-0.5" style={{ color: '#8898a9' }}>{l}</p>
                        <p className="text-xs font-semibold" style={{ color: '#0a2540' }}>{v}</p>
                    </div>
                ))}
            </div>
            <div className="px-5 py-3">
                <p className="text-[10px] mb-2" style={{ color: '#8898a9' }}>추가 조건</p>
                <div className="space-y-1.5">
                    {CONDS_DATA.map((c, i) => (
                        <button key={c.label} onClick={() => s.toggle(i)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all"
                            style={s.cs[i] ? { background: '#eef2ff', border: '1px solid #c7d2fe' } : { background: '#f6f8fa', border: '1px solid transparent' }}>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded flex items-center justify-center transition-all"
                                    style={s.cs[i] ? { background: '#635bff' } : { background: 'white', border: '1.5px solid #d1d9e0' }}>
                                    {s.cs[i] && <span className="text-white text-[8px] font-black">✓</span>}
                                </div>
                                <span className="text-[11px] font-medium" style={{ color: s.cs[i] ? '#4338ca' : '#425466' }}>{c.label}</span>
                            </div>
                            <span className="text-[11px] font-bold" style={{ color: s.cs[i] ? '#635bff' : '#c4cbd3' }}>{c.pct}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── V4: Linear Dark ──
function V4() {
    const s = useS()
    return (
        <div className="rounded-xl overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>광고 가치 추정</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(94,106,210,0.15)', color: '#5e6ad2' }}>뷰티</span>
                </div>
                <p className="text-4xl font-bold tracking-tight text-white mb-1" style={{ letterSpacing: '-0.03em' }}>{won(s.r.avg)}</p>
                <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.25)' }}>{won(s.r.min)} — {won(s.r.max)}</p>

                {/* 범위 시각화 */}
                <div className="relative h-1 rounded-full mb-5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="absolute h-full rounded-full left-[15%]" style={{ width: '35%', background: '#5e6ad2', opacity: 0.7 }} />
                    <div className="absolute w-2 h-2 rounded-full -top-0.5 bg-white" style={{ left: `calc(40% - 4px)`, boxShadow: '0 0 0 2px rgba(94,106,210,0.5)' }} />
                </div>

                {/* 콘텐츠 유형 */}
                <div className="flex gap-1 mb-4">
                    {(['reels', 'feed', 'story'] as const).map(ct => (
                        <button key={ct} onClick={() => s.setCt(ct)}
                            className="px-3 py-1.5 rounded-md text-[11px] font-medium transition-all"
                            style={s.ct === ct ? { background: 'rgba(255,255,255,0.1)', color: 'white' } : { color: 'rgba(255,255,255,0.3)' }}>
                            {ct === 'reels' ? '릴스' : ct === 'feed' ? '피드' : '스토리'}
                            <span className="ml-1 opacity-50">{ct === 'reels' ? '×1.5' : ct === 'feed' ? '×1.0' : '×0.5'}</span>
                        </button>
                    ))}
                </div>

                {/* 지표 */}
                <div className="grid grid-cols-3 gap-3 p-3 rounded-lg mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {[['팔로워', '1.0만'], ['ER', '9.0%'], ['CPE', '₩900']].map(([l, v]) => (
                        <div key={l} className="text-center">
                            <p className="text-base font-bold text-white">{v}</p>
                            <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{l}</p>
                        </div>
                    ))}
                </div>

                {/* 조건 */}
                <div className="space-y-1">
                    {CONDS_DATA.map((c, i) => (
                        <button key={c.label} onClick={() => s.toggle(i)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left"
                            style={s.cs[i] ? { background: 'rgba(94,106,210,0.12)', border: '1px solid rgba(94,106,210,0.2)' } : { border: '1px solid rgba(255,255,255,0.06)' }}>
                            <span className="text-[11px]" style={{ color: s.cs[i] ? '#a5b0ff' : 'rgba(255,255,255,0.4)' }}>{c.label}</span>
                            <span className="text-[11px] font-semibold" style={{ color: s.cs[i] ? '#5e6ad2' : 'rgba(255,255,255,0.15)' }}>{c.pct}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── V5: Vercel / Minimal Dark ──
function V5() {
    const s = useS()
    const totalMult = (s.cs[0] ? 1.35 : 1) * (s.cs[1] ? 1.5 : 1) * (s.cs[2] ? 1.3 : 1) * (s.cs[3] ? 1.15 : 1)
    return (
        <div className="bg-black rounded-2xl overflow-hidden" style={{ border: '1px solid #333' }}>
            <div className="px-5 pt-5 pb-4 flex items-start justify-between" style={{ borderBottom: '1px solid #222' }}>
                <div>
                    <p className="text-xs text-neutral-500 mb-2">예상 광고 단가</p>
                    <p className="text-3xl font-bold text-white tracking-tight">{won(s.r.avg)}</p>
                    <p className="text-[11px] text-neutral-600 mt-1">{won(s.r.min)} ~ {won(s.r.max)}</p>
                </div>
                <div className="px-2 py-1 rounded text-[10px] font-bold" style={{ border: '1px solid #333', color: '#888' }}>
                    IG 실측
                </div>
            </div>

            {/* 탭 */}
            <div className="flex px-5 pt-3 gap-1 pb-3" style={{ borderBottom: '1px solid #222' }}>
                {(['reels', 'feed', 'story'] as const).map(ct => (
                    <button key={ct} onClick={() => s.setCt(ct)}
                        className="px-3 py-1 text-xs font-medium rounded-md transition-all"
                        style={s.ct === ct ? { background: 'white', color: 'black' } : { color: '#555', }}>
                        {ct === 'reels' ? '릴스 ×1.5' : ct === 'feed' ? '피드 ×1.0' : '스토리 ×0.5'}
                    </button>
                ))}
            </div>

            {/* 지표 테이블 */}
            <div>
                {[
                    ['팔로워', '10,000명', '마이크로 티어'],
                    ['참여율', '9.00%', 'Instagram 실측'],
                    ['기준 CPE', '₩900', '뷰티 카테고리'],
                    ['부가 배율', `×${totalMult.toFixed(2)}`, totalMult > 1 ? `조건 ${s.cs.filter(Boolean).length}개 적용` : '없음'],
                ].map(([l, v, sub], i, arr) => (
                    <div key={l} className="grid grid-cols-2 items-center px-5 py-3"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid #161616' : 'none' }}>
                        <div>
                            <p className="text-xs text-neutral-500">{l}</p>
                            {sub && <p className="text-[9px] text-neutral-700 mt-0.5">{sub}</p>}
                        </div>
                        <p className="text-xs font-semibold text-white text-right">{v}</p>
                    </div>
                ))}
            </div>

            {/* 조건 */}
            <div className="p-4" style={{ borderTop: '1px solid #222' }}>
                <div className="grid grid-cols-2 gap-1">
                    {CONDS_DATA.map((c, i) => (
                        <button key={c.label} onClick={() => s.toggle(i)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                            style={s.cs[i] ? { background: '#111', border: '1px solid #0ea5e9' } : { background: '#0a0a0a', border: '1px solid #1f1f1f' }}>
                            <div className="w-3.5 h-3.5 rounded-full shrink-0 transition-all"
                                style={{ background: s.cs[i] ? '#0ea5e9' : '#1f1f1f' }} />
                            <span className="text-[10px] font-medium" style={{ color: s.cs[i] ? '#7dd3fc' : '#444' }}>{c.label}</span>
                            <span className="text-[10px] ml-auto" style={{ color: s.cs[i] ? '#0ea5e9' : '#333' }}>{c.pct}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── V6: Notion-inspired Warm ──
function V6() {
    const s = useS()
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#fbfaf8', border: '1px solid #e9e5df' }}>
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">📊</span>
                    <p className="text-sm font-semibold text-stone-700">광고 단가 계산기</p>
                </div>
                <p className="text-4xl font-bold text-stone-900 tracking-tight mb-1">{won(s.r.avg)}</p>
                <p className="text-xs text-stone-400">{won(s.r.min)} ~ {won(s.r.max)}</p>
            </div>
            <div className="mx-6 mb-4 p-3 rounded-xl" style={{ background: '#f1ede6' }}>
                <div className="flex gap-1">
                    {(['reels', 'feed', 'story'] as const).map(ct => (
                        <button key={ct} onClick={() => s.setCt(ct)}
                            className="flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                            style={s.ct === ct ? { background: 'white', color: '#a16207', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : { color: '#92817a' }}>
                            {ct === 'reels' ? '릴스' : ct === 'feed' ? '피드' : '스토리'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="mx-6 mb-4" style={{ borderTop: '1px solid #e9e5df' }}>
                {[['팔로워', '10,000명 · 마이크로'], ['참여율 (ER)', '9.00% · Instagram 실측'], ['기준 CPE', '₩900 · 뷰티'], ['콘텐츠', s.ct === 'reels' ? '릴스 (×1.5)' : s.ct === 'feed' ? '피드 (×1.0)' : '스토리 (×0.5)']].map(([l, v], i, arr) => (
                    <div key={l} className="flex justify-between items-center py-2.5"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid #f1ede6' : 'none' }}>
                        <span className="text-[11px] text-stone-400">{l}</span>
                        <span className="text-[11px] font-semibold text-stone-700">{v}</span>
                    </div>
                ))}
            </div>
            <div className="px-6 pb-5">
                <p className="text-[10px] text-stone-400 mb-2">추가 조건</p>
                <div className="space-y-1.5">
                    {CONDS_DATA.map((c, i) => (
                        <button key={c.label} onClick={() => s.toggle(i)}
                            className="w-full flex items-center gap-3 py-2 transition-all text-left"
                            style={{ borderBottom: i < CONDS_DATA.length - 1 ? '1px solid #f1ede6' : 'none' }}>
                            <div className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
                                style={s.cs[i] ? { background: '#92400e', borderColor: '#92400e' } : { borderColor: '#d6cfc5' }}>
                                {s.cs[i] && <span className="text-white text-[8px]">✓</span>}
                            </div>
                            <span className="text-[11px] flex-1" style={{ color: s.cs[i] ? '#92400e' : '#78716c' }}>{c.label}</span>
                            <span className="text-[11px] font-bold" style={{ color: s.cs[i] ? '#a16207' : '#c4b5a0' }}>{c.pct}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── V7: Robinhood Green ──
function V7() {
    const s = useS()
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0f0f0f' }}>
            <div className="px-5 pt-6 pb-4">
                <p className="text-[11px] font-medium mb-3" style={{ color: '#666' }}>예상 광고 수익</p>
                <p className="text-5xl font-black text-white tracking-tighter">{won(s.r.avg)}</p>
                <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-sm font-bold" style={{ color: '#00c805' }}>▲</span>
                    <span className="text-sm font-bold" style={{ color: '#00c805' }}>릴스 ×1.5 적용</span>
                </div>
                <div className="mt-4 h-1 rounded-full" style={{ background: '#1c1c1c' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: '68%', background: '#00c805' }} />
                </div>
                <div className="flex justify-between mt-1.5">
                    <span className="text-[9px]" style={{ color: '#444' }}>최소 {won(s.r.min)}</span>
                    <span className="text-[9px]" style={{ color: '#444' }}>최대 {won(s.r.max)}</span>
                </div>
            </div>
            <div className="flex gap-1 px-5 pb-4">
                {(['reels', 'feed', 'story'] as const).map(ct => (
                    <button key={ct} onClick={() => s.setCt(ct)}
                        className="flex-1 py-2 rounded-full text-xs font-bold transition-all"
                        style={s.ct === ct ? { background: '#00c805', color: 'black' } : { background: '#1c1c1c', color: '#444' }}>
                        {ct === 'reels' ? '릴스' : ct === 'feed' ? '피드' : '스토리'}
                    </button>
                ))}
            </div>
            <div style={{ borderTop: '1px solid #1c1c1c' }}>
                {[['팔로워', '10,000'], ['참여율', '9.00%'], ['CPE', '₩900']].map(([l, v], i, arr) => (
                    <div key={l} className="flex justify-between items-center px-5 py-3"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid #111' : 'none' }}>
                        <span className="text-[11px]" style={{ color: '#555' }}>{l}</span>
                        <span className="text-[11px] font-semibold" style={{ color: '#ddd' }}>{v}</span>
                    </div>
                ))}
            </div>
            <div className="px-5 py-3 grid grid-cols-2 gap-1.5">
                {CONDS_DATA.map((c, i) => (
                    <button key={c.label} onClick={() => s.toggle(i)}
                        className="rounded-lg px-3 py-2 text-left transition-all"
                        style={s.cs[i] ? { background: '#00c80515', border: '1px solid #00c80540' } : { background: '#111', border: '1px solid transparent' }}>
                        <p className="text-[9px] font-bold" style={{ color: s.cs[i] ? '#00c805' : '#333' }}>{c.pct}</p>
                        <p className="text-[9px] mt-0.5" style={{ color: s.cs[i] ? '#00c80590' : '#333' }}>{c.label}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}

// ── V8: Glass Card Premium ──
function V8() {
    const s = useS()
    return (
        <div className="rounded-3xl overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #1a1033 0%, #0d1a2d 50%, #0a1628 100%)' }}>
            <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(ellipse at 20% 20%, rgba(99,91,255,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(6,182,212,0.08) 0%, transparent 50%)'
            }} />
            <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Ad Value</p>
                        <p className="text-3xl font-bold text-white">{won(s.r.avg)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>범위</p>
                        <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{wonShort(s.r.min)} ~ {wonShort(s.r.max)}만</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-5">
                    {[['10,000', '팔로워'], ['9.0%', '참여율'], ['₩900', 'CPE']].map(([v, l]) => (
                        <div key={l} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
                            <p className="text-sm font-bold text-white">{v}</p>
                            <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{l}</p>
                        </div>
                    ))}
                </div>
                <div className="flex gap-1.5 p-1 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {(['reels', 'feed', 'story'] as const).map(ct => (
                        <button key={ct} onClick={() => s.setCt(ct)}
                            className="flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all"
                            style={s.ct === ct ? { background: 'rgba(255,255,255,0.12)', color: 'white', backdropFilter: 'blur(8px)' } : { color: 'rgba(255,255,255,0.25)' }}>
                            {ct === 'reels' ? '릴스' : ct === 'feed' ? '피드' : '스토리'}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                    {CONDS_DATA.map((c, i) => (
                        <button key={c.label} onClick={() => s.toggle(i)}
                            className="px-3 py-2.5 rounded-xl text-left transition-all"
                            style={s.cs[i]
                                ? { background: 'rgba(99,91,255,0.2)', border: '1px solid rgba(99,91,255,0.35)', backdropFilter: 'blur(8px)' }
                                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <p className="text-[9px] font-medium" style={{ color: s.cs[i] ? '#a5b4ff' : 'rgba(255,255,255,0.35)' }}>{c.label}</p>
                            <p className="text-xs font-bold mt-0.5" style={{ color: s.cs[i] ? '#635bff' : 'rgba(255,255,255,0.15)' }}>{c.pct}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── V9: Clean Analytics ──
function V9() {
    const s = useS()
    const segments = [
        { label: 'ER', pct: Math.min(90, (9 / 15) * 100), color: '#0ea5e9' },
        { label: '팔로워', pct: 45, color: '#8b5cf6' },
        { label: 'CPE', pct: 55, color: '#10b981' },
        { label: '배율', pct: Math.min(95, ((s.cs.filter(Boolean).length / 4) * 40) + 30), color: '#f59e0b' },
    ]
    return (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
            <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>Ad Value Estimate</p>
                        <p className="text-3xl font-bold tracking-tight" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>{won(s.r.avg)}</p>
                        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{won(s.r.min)} — {won(s.r.max)}</p>
                    </div>
                    <div className="flex gap-1">
                        {(['reels', 'feed', 'story'] as const).map(ct => (
                            <button key={ct} onClick={() => s.setCt(ct)}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                                style={s.ct === ct ? { background: '#0f172a', color: 'white' } : { background: '#f8fafc', color: '#94a3b8' }}>
                                {ct === 'reels' ? '릴스' : ct === 'feed' ? '피드' : '스토리'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>지표 분석</p>
                <div className="space-y-2.5">
                    {segments.map(seg => (
                        <div key={seg.label}>
                            <div className="flex justify-between mb-1">
                                <span className="text-[10px] font-medium" style={{ color: '#64748b' }}>{seg.label}</span>
                                <span className="text-[10px] font-bold" style={{ color: seg.color }}>{Math.round(seg.pct)}점</span>
                            </div>
                            <div className="h-1 rounded-full" style={{ background: '#f1f5f9' }}>
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${seg.pct}%`, background: seg.color }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="px-5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: '#94a3b8' }}>조건</p>
                <div className="space-y-1">
                    {CONDS_DATA.map((c, i) => (
                        <button key={c.label} onClick={() => s.toggle(i)}
                            className="w-full flex items-center gap-2.5 py-1.5 transition-all text-left">
                            <div className="w-4 h-4 rounded-sm flex items-center justify-center shrink-0 transition-all"
                                style={s.cs[i] ? { background: '#0f172a' } : { border: '1.5px solid #e2e8f0' }}>
                                {s.cs[i] && <span className="text-white text-[8px] font-black">✓</span>}
                            </div>
                            <span className="text-[11px] flex-1" style={{ color: s.cs[i] ? '#0f172a' : '#94a3b8' }}>{c.label}</span>
                            <span className="text-[11px] font-bold" style={{ color: s.cs[i] ? '#2563eb' : '#e2e8f0' }}>{c.pct}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── V10: Executive Report ──
function V10() {
    const s = useS()
    const totalAdj = (s.cs[0] ? 1.35 : 1) * (s.cs[1] ? 1.5 : 1) * (s.cs[2] ? 1.3 : 1) * (s.cs[3] ? 1.15 : 1)
    return (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #d1d5db' }}>
            {/* 상단 헤더 */}
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#111827' }}>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-white">Rate Card Estimate</p>
                <p className="text-[9px]" style={{ color: '#6b7280' }}>뷰티 · Instagram</p>
            </div>
            <div className="px-5 py-5" style={{ borderBottom: '1px solid #f3f4f6' }}>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs text-gray-400 mb-1">예상 단가 (±20%)</p>
                        <p className="text-4xl font-black text-gray-900" style={{ letterSpacing: '-0.03em' }}>{won(s.r.avg)}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                        <p>{won(s.r.min)}</p>
                        <p className="text-gray-200 text-[10px]">MIN / MAX</p>
                        <p>{won(s.r.max)}</p>
                    </div>
                </div>
            </div>
            {/* 콘텐츠 */}
            <div className="flex border-b border-gray-100">
                {(['reels', 'feed', 'story'] as const).map((ct, i) => (
                    <button key={ct} onClick={() => s.setCt(ct)}
                        className="flex-1 py-2.5 text-xs font-semibold transition-all"
                        style={{
                            borderRight: i < 2 ? '1px solid #f3f4f6' : 'none',
                            background: s.ct === ct ? '#111827' : 'white',
                            color: s.ct === ct ? 'white' : '#9ca3af'
                        }}>
                        {ct === 'reels' ? '릴스 ×1.5' : ct === 'feed' ? '피드 ×1.0' : '스토리 ×0.5'}
                    </button>
                ))}
            </div>
            {/* 데이터 테이블 */}
            <table className="w-full text-xs" style={{ borderBottom: '1px solid #f3f4f6' }}>
                <tbody>
                    {[
                        ['팔로워', '10,000명', '마이크로 (1~10만)'],
                        ['참여율', '9.00%', 'Instagram API 실측'],
                        ['기준 CPE', '₩900', '뷰티 카테고리'],
                        ['부가 배율', `×${totalAdj.toFixed(2)}`, `조건 ${s.cs.filter(Boolean).length}개`],
                    ].map(([l, v, note], i, arr) => (
                        <tr key={l} style={{ borderBottom: i < arr.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                            <td className="px-5 py-2.5 text-gray-400 w-28">{l}</td>
                            <td className="py-2.5 font-semibold text-gray-800">{v}</td>
                            <td className="py-2.5 text-gray-400 text-right pr-5">{note}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* 조건 */}
            <div className="px-5 py-3">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {CONDS_DATA.map((c, i) => (
                        <button key={c.label} onClick={() => s.toggle(i)}
                            className="flex items-center gap-2 text-left py-0.5 transition-all">
                            <div className="w-3.5 h-3.5 rounded-full shrink-0 transition-all"
                                style={{ background: s.cs[i] ? '#111827' : '#e5e7eb' }} />
                            <span className="text-[10px]" style={{ color: s.cs[i] ? '#111827' : '#9ca3af' }}>{c.label} <span className="font-bold">{c.pct}</span></span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

const VARIANTS = [
    { id: 1, name: 'Apple Stocks Dark', desc: 'iOS 주식 앱', comp: V1 },
    { id: 2, name: 'Bloomberg', desc: '금융 터미널', comp: V2 },
    { id: 3, name: 'Stripe', desc: '결제 대시보드', comp: V3 },
    { id: 4, name: 'Linear', desc: '프로젝트 툴', comp: V4 },
    { id: 5, name: 'Vercel', desc: '배포 플랫폼', comp: V5 },
    { id: 6, name: 'Notion', desc: '워크스페이스', comp: V6 },
    { id: 7, name: 'Robinhood', desc: '투자 앱', comp: V7 },
    { id: 8, name: 'Glass Premium', desc: '럭셔리 글래스', comp: V8 },
    { id: 9, name: 'Analytics', desc: '데이터 분석', comp: V9 },
    { id: 10, name: 'Executive', desc: '레포트 스타일', comp: V10 },
]

export default function Page() {
    const [modal, setModal] = useState<number | null>(null)
    const ModalComp = modal ? VARIANTS[modal - 1].comp : null

    return (
        <div className="min-h-screen p-8 md:p-12" style={{ background: '#f8f9fb' }}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <p className="text-[11px] tracking-widest uppercase text-gray-400 mb-1">Design Lab · Calculator</p>
                    <h1 className="text-2xl font-bold text-gray-900">광고 단가 계산기 — 10가지 방향</h1>
                    <p className="text-sm text-gray-400 mt-1">팔로워 10,000 · ER 9% · 뷰티 · CPE ₩900 기준 더미 데이터</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {VARIANTS.map(v => {
                        const C = v.comp
                        return (
                            <div key={v.id} onClick={() => setModal(v.id)} className="cursor-pointer group">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <span className="text-[10px] font-bold text-gray-400 w-5">{String(v.id).padStart(2, '0')}</span>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{v.name}</p>
                                        <p className="text-[10px] text-gray-400">{v.desc}</p>
                                    </div>
                                </div>
                                <div className="transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-0.5 pointer-events-none rounded-2xl overflow-hidden">
                                    <C />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {modal && ModalComp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} onClick={() => setModal(null)}>
                    <div className="w-full max-w-xs" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-white font-semibold text-sm">{VARIANTS[modal - 1].name}</p>
                            <button onClick={() => setModal(null)} className="text-white/40 hover:text-white text-xs">닫기 ✕</button>
                        </div>
                        <ModalComp />
                    </div>
                </div>
            )}
        </div>
    )
}
