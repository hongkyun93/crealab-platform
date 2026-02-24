'use client'
import { useState } from 'react'

function calc(followers: number, er: number, cpe: number, content: string, conds: boolean[]) {
    const cm = content === 'reels' ? 1.5 : content === 'feed' ? 1.0 : 0.5
    const add = (conds[0] ? 1.35 : 1) * (conds[1] ? 1.5 : 1) * (conds[2] ? 1.3 : 1) * (conds[3] ? 1.15 : 1)
    const v = Math.round(followers * (er / 100) * cpe * cm * add)
    return { min: Math.round(v * 0.8), avg: v, max: Math.round(v * 1.2) }
}
const fmt = (n: number) => n >= 10000 ? `${Math.round(n / 10000)}만` : n.toLocaleString()
const CONDS = ['2차 활용권 +35%', '독점 계약 +50%', '고제작 +30%', '시의성 +15%']
const CONTENTS = ['reels', 'feed', 'story'] as const

function useS() {
    const [ct, setCt] = useState<'reels' | 'feed' | 'story'>('reels')
    const [cs, setCs] = useState([false, false, false, false])
    const toggle = (i: number) => setCs(p => p.map((v, j) => j === i ? !v : v))
    const r = calc(10000, 9, 900, ct, cs)
    return { ct, setCt, cs, toggle, r }
}

// ── 1. Liquid Pastel ──
function V1() {
    const s = useS()
    return (
        <div className="relative rounded-[32px] p-7 overflow-hidden" style={{ background: '#fef9f0' }}>
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-40" style={{ background: 'radial-gradient(#f9a8d4, #fde68a)' }} />
            <div className="absolute -bottom-12 -right-12 w-56 h-56 rounded-full opacity-30" style={{ background: 'radial-gradient(#a5f3fc, #c4b5fd)' }} />
            <div className="relative">
                <p className="text-xs font-semibold text-rose-300 tracking-widest mb-5">광고 가치 계산기</p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[['1.0만', '팔로워', '#f9a8d4'], ['9.0%', 'ER', '#86efac'], ['₩900', 'CPE', '#93c5fd']].map(([v, l, c]) => (
                        <div key={l} className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)' }}>
                            <p style={{ color: c, fontSize: 20, fontWeight: 900 }}>{v}</p>
                            <p className="text-[9px] mt-0.5" style={{ color: '#d1a8c4' }}>{l}</p>
                        </div>
                    ))}
                </div>
                <div className="flex gap-1.5 p-1.5 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.6)' }}>
                    {CONTENTS.map(ct => (
                        <button key={ct} onClick={() => s.setCt(ct)} className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                            style={s.ct === ct ? { background: 'linear-gradient(135deg,#f9a8d4,#c4b5fd)', color: 'white' } : { color: '#c4929e' }}>
                            {ct === 'reels' ? '릴스' : ct === 'feed' ? '피드' : '스토리'}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-5">
                    {CONDS.map((c, i) => (
                        <button key={c} onClick={() => s.toggle(i)} className="py-2 px-3 rounded-xl text-[10px] font-semibold transition-all"
                            style={s.cs[i] ? { background: 'linear-gradient(135deg,#fde68a,#f9a8d4)', color: '#92400e' } : { background: 'rgba(255,255,255,0.7)', color: '#b4928c' }}>
                            {c}
                        </button>
                    ))}
                </div>
                <div className="rounded-2xl p-5 text-center" style={{ background: 'linear-gradient(135deg, rgba(249,168,212,0.3), rgba(196,181,253,0.3))', backdropFilter: 'blur(12px)' }}>
                    <p className="text-[10px] text-rose-300 mb-1">예상 광고 단가</p>
                    <p style={{ fontSize: 30, fontWeight: 900, background: 'linear-gradient(135deg,#f472b6,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {fmt(s.r.min)}만원 ~ {fmt(s.r.max)}만원
                    </p>
                </div>
            </div>
        </div>
    )
}

// ── 2. Brutalist ──
function V2() {
    const s = useS()
    return (
        <div className="bg-white border-4 border-black rounded-none p-6">
            <div className="border-b-4 border-black pb-4 mb-5 flex justify-between items-start">
                <div>
                    <p className="font-mono text-[9px] tracking-widest">광고단가계산기.EXE</p>
                    <h2 className="text-4xl font-black leading-none mt-1">AD<br />VALUE</h2>
                </div>
                <div className="border-4 border-black p-3 text-right">
                    <p className="font-mono text-[9px]">ER</p>
                    <p className="text-3xl font-black">9%</p>
                </div>
            </div>
            <div className="grid grid-cols-3 border-t-2 border-l-2 border-black mb-5">
                {[['1.0만', '팔로워'], ['₩900', 'CPE'], ['뷰티', '카테고리']].map(([v, l]) => (
                    <div key={l} className="border-b-2 border-r-2 border-black p-3">
                        <p className="font-mono text-[8px]">{l}</p>
                        <p className="text-lg font-black">{v}</p>
                    </div>
                ))}
            </div>
            <div className="flex gap-0 border-t-2 border-l-2 border-black mb-5">
                {CONTENTS.map(ct => (
                    <button key={ct} onClick={() => s.setCt(ct)} className="flex-1 border-b-2 border-r-2 border-black py-2.5 font-mono text-[10px] font-bold transition-all uppercase"
                        style={s.ct === ct ? { background: '#000', color: '#fff' } : {}}>
                        {ct === 'reels' ? 'REELS×1.5' : ct === 'feed' ? 'FEED×1.0' : 'STORY×0.5'}
                    </button>
                ))}
            </div>
            <div className="space-y-1 mb-5">
                {CONDS.map((c, i) => (
                    <button key={c} onClick={() => s.toggle(i)} className="w-full flex justify-between items-center px-3 py-2.5 border-2 border-black font-mono text-[10px] font-bold transition-all uppercase"
                        style={s.cs[i] ? { background: '#fbbf24' } : {}}>
                        <span>{c.split(' ')[0]}</span><span>{c.split(' ').slice(1).join(' ')}</span>
                    </button>
                ))}
            </div>
            <div className="border-4 border-black p-4 bg-black text-white">
                <p className="font-mono text-[8px] mb-2">// OUTPUT</p>
                <p className="text-3xl font-black font-mono leading-none">{fmt(s.r.min)}~{fmt(s.r.max)}<span className="text-lg">만원</span></p>
                <p className="font-mono text-[9px] text-zinc-400 mt-2">AVG: {fmt(s.r.avg)}만원</p>
            </div>
        </div>
    )
}

// ── 3. iOS Frosted ──
function V3() {
    const s = useS()
    return (
        <div className="rounded-3xl p-5 overflow-hidden" style={{ background: 'linear-gradient(160deg, #e0e7ff 0%, #f0f9ff 50%, #fce7f3 100%)' }}>
            <div className="mb-5">
                <p className="text-sm font-semibold text-indigo-400 mb-0.5">광고 가치</p>
                <p className="text-4xl font-black text-indigo-900 tracking-tight">{fmt(s.r.avg)}<span className="text-2xl">만원</span></p>
                <p className="text-xs text-indigo-400 mt-1">{fmt(s.r.min)}만원 ~ {fmt(s.r.max)}만원</p>
            </div>
            <div className="rounded-2xl overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 20px rgba(99,102,241,0.1)' }}>
                {[['팔로워', '1.0만 · 마이크로'], ['참여율', '9.0% · Instagram 실측'], ['CPE', '₩900 · 뷰티']].map(([l, v], i, arr) => (
                    <div key={l} className="flex justify-between items-center px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none' }}>
                        <span className="text-xs text-indigo-400">{l}</span>
                        <span className="text-xs font-semibold text-indigo-900">{v}</span>
                    </div>
                ))}
            </div>
            <div className="flex gap-1 p-1 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)' }}>
                {CONTENTS.map(ct => (
                    <button key={ct} onClick={() => s.setCt(ct)} className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={s.ct === ct ? { background: 'white', color: '#4f46e5', boxShadow: '0 2px 8px rgba(99,102,241,0.15)' } : { color: '#a5b4fc' }}>
                        {ct === 'reels' ? '릴스' : ct === 'feed' ? '피드' : '스토리'}
                    </button>
                ))}
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)' }}>
                {CONDS.map((c, i, arr) => (
                    <button key={c} onClick={() => s.toggle(i)} className="w-full flex items-center justify-between px-4 py-3 transition-all"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full transition-all" style={{ background: s.cs[i] ? '#4f46e5' : 'rgba(99,102,241,0.15)' }}>
                                {s.cs[i] && <div className="w-full h-full flex items-center justify-center text-white text-[8px] font-bold">✓</div>}
                            </div>
                            <span className="text-xs font-medium text-indigo-900">{c.split(' ').slice(0, -1).join(' ')}</span>
                        </div>
                        <span className="text-xs font-bold text-indigo-400">{c.split(' ').pop()}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

// ── 4. Editorial Magazine ──
function V4() {
    const s = useS()
    return (
        <div className="bg-stone-50 p-7 rounded-xl" style={{ fontFamily: 'Georgia, serif' }}>
            <div className="border-b-2 border-stone-900 mb-5 pb-3">
                <p className="text-[9px] tracking-[0.3em] uppercase font-sans font-medium text-stone-400">Influencer Market Rate</p>
                <div className="flex justify-between items-end mt-2">
                    <h2 className="text-3xl font-black text-stone-900 italic leading-none">Ad Value</h2>
                    <p className="text-[10px] font-sans text-stone-400">Vol. 2026 · Feb</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="col-span-2 bg-stone-900 text-stone-50 p-5 rounded-lg">
                    <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 mb-1">Estimated Rate</p>
                    <p className="text-4xl font-black leading-none">{fmt(s.r.min)}~{fmt(s.r.max)}<span className="text-xl font-normal italic ml-1">만원</span></p>
                    <p className="font-sans text-[10px] text-stone-400 mt-2">평균 {fmt(s.r.avg)}만원</p>
                </div>
                {[['1.0만', '팔로워수'], ['9%', '참여율 ER'], ['₩900', 'CPE']].map(([v, l]) => (
                    <div key={l} className="border-t border-stone-900 pt-3">
                        <p className="text-2xl font-black text-stone-900">{v}</p>
                        <p className="font-sans text-[9px] text-stone-400 mt-0.5 uppercase tracking-widest">{l}</p>
                    </div>
                ))}
            </div>
            <p className="font-sans text-[8px] text-stone-400 uppercase tracking-widest mb-2">Content Format</p>
            <div className="flex border border-stone-300 rounded mb-4">
                {CONTENTS.map((ct, i) => (
                    <button key={ct} onClick={() => s.setCt(ct)} className="flex-1 py-2 text-xs font-sans font-bold transition-all"
                        style={{ background: s.ct === ct ? '#1c1917' : 'transparent', color: s.ct === ct ? 'white' : '#78716c', borderRight: i < 2 ? '1px solid #d6d3d1' : 'none' }}>
                        {ct === 'reels' ? 'Reels' : ct === 'feed' ? 'Feed' : 'Story'}
                    </button>
                ))}
            </div>
            <p className="font-sans text-[8px] text-stone-400 uppercase tracking-widest mb-2">Additional Terms</p>
            <div className="space-y-1">
                {CONDS.map((c, i) => (
                    <button key={c} onClick={() => s.toggle(i)} className="w-full text-left flex justify-between px-3 py-2 rounded transition-all font-sans text-[10px]"
                        style={{ background: s.cs[i] ? '#1c1917' : '#f5f5f4', color: s.cs[i] ? 'white' : '#78716c' }}>
                        <span>{c.split(' ').slice(0, -1).join(' ')}</span><span className="font-bold">{c.split(' ').pop()}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

// ── 5. Retro Memphis ──
function V5() {
    const s = useS()
    return (
        <div className="rounded-2xl p-6 overflow-hidden relative" style={{ background: '#1a1aff', border: '3px solid #ff1a1a' }}>
            <div className="absolute top-3 right-3 w-12 h-12 rounded-full" style={{ background: '#ffff00', border: '3px solid black' }} />
            <div className="absolute top-20 left-2 w-6 h-6 rotate-45" style={{ background: '#ff1a1a', border: '2px solid black' }} />
            <p className="font-mono font-black text-yellow-300 text-xs tracking-wider mb-4">★ AD VALUE CALC ★</p>
            <div className="bg-white border-4 border-black p-4 mb-4 rotate-[-0.5deg]">
                <p className="font-mono text-[9px] text-black uppercase">Estimated Ad Rate</p>
                <p className="font-mono font-black text-3xl text-black leading-none mt-1">{fmt(s.r.min)}~{fmt(s.r.max)}만</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
                {[['1만', '팔로워'], ['9%', 'ER'], ['₩900', 'CPE']].map(([v, l], i) => (
                    <div key={l} className="p-2 text-center border-3 font-mono"
                        style={{ background: ['#ffff00', '#ff69b4', '#00ff88'][i], border: '3px solid black' }}>
                        <p className="text-sm font-black text-black">{v}</p>
                        <p className="text-[8px] text-black font-bold">{l}</p>
                    </div>
                ))}
            </div>
            <div className="flex gap-1 mb-3">
                {CONTENTS.map((ct, i) => (
                    <button key={ct} onClick={() => s.setCt(ct)} className="flex-1 py-2 font-mono font-black text-[10px] border-3 transition-all uppercase"
                        style={{ border: '3px solid black', background: s.ct === ct ? '#ffff00' : ['#ff69b4', '#00ff88', '#ff8c00'][i], color: 'black' }}>
                        {ct === 'reels' ? 'REELS' : ct === 'feed' ? 'FEED' : 'STORY'}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-1">
                {CONDS.map((c, i) => (
                    <button key={c} onClick={() => s.toggle(i)} className="p-2 font-mono font-bold text-[8px] border-3 uppercase transition-all"
                        style={{ border: '3px solid black', background: s.cs[i] ? '#ff1a1a' : '#ffffff', color: s.cs[i] ? 'white' : 'black' }}>
                        {c.split(' ').pop()}
                    </button>
                ))}
            </div>
        </div>
    )
}

// ── 6. Aurora Luxury ──
function V6() {
    const s = useS()
    return (
        <div className="rounded-3xl p-7 overflow-hidden relative" style={{ background: '#020617' }}>
            <div className="absolute inset-0 opacity-30" style={{ background: 'conic-gradient(from 180deg at 50% 0%, #06b6d4, #8b5cf6, #ec4899, #06b6d4)', filter: 'blur(60px)', transform: 'scaleY(0.4) translateY(-50%)' }} />
            <div className="relative mb-7">
                <p className="text-[9px] font-medium tracking-[0.3em] uppercase text-cyan-400/60 mb-2">Creator Value Index</p>
                <div className="flex items-end gap-2">
                    <p className="text-5xl font-black text-white tracking-tighter">{fmt(s.r.avg)}</p>
                    <p className="text-xl text-slate-400 mb-1 font-light">만원</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #06b6d4, transparent)' }} />
                    <p className="text-[9px] text-slate-500">{fmt(s.r.min)} — {fmt(s.r.max)}만원</p>
                </div>
            </div>
            <div className="space-y-2 mb-6">
                {[['팔로워', '1.0만', '마이크로'], ['참여율', '9.0%', 'IG 실측'], ['CPE', '₩900', '뷰티']].map(([l, v, s2]) => (
                    <div key={l} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span className="text-[10px] text-slate-500">{l}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-300 font-semibold">{v}</span>
                            <span className="text-[9px] text-slate-600">{s2}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-1.5 mb-5">
                {CONTENTS.map(ct => (
                    <button key={ct} onClick={() => s.setCt(ct)} className="flex-1 py-2.5 rounded-xl text-[10px] font-semibold transition-all duration-300"
                        style={s.ct === ct ? { background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', color: 'white', boxShadow: '0 0 16px rgba(6,182,212,0.3)' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {ct === 'reels' ? '릴스 ×1.5' : ct === 'feed' ? '피드 ×1.0' : '스토리 ×0.5'}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
                {CONDS.map((c, i) => (
                    <button key={c} onClick={() => s.toggle(i)} className="px-3 py-2.5 rounded-xl text-left transition-all duration-300"
                        style={s.cs[i] ? { background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', boxShadow: '0 0 12px rgba(139,92,246,0.15)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p className="text-[9px]" style={{ color: s.cs[i] ? '#c4b5fd' : 'rgba(255,255,255,0.3)' }}>{c.split(' ').slice(0, -1).join(' ')}</p>
                        <p className="text-xs font-bold mt-0.5" style={{ color: s.cs[i] ? '#a78bfa' : 'rgba(255,255,255,0.15)' }}>{c.split(' ').pop()}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}

// ── 7. Neumorphic ──
function V7() {
    const s = useS()
    const bg = '#e8ecf0'
    const raised = { boxShadow: '6px 6px 14px #c8ccd0, -6px -6px 14px #ffffff', background: bg }
    const inset = { boxShadow: 'inset 4px 4px 10px #c8ccd0, inset -4px -4px 10px #ffffff', background: bg }
    return (
        <div className="rounded-3xl p-7" style={{ ...raised }}>
            <p className="text-[10px] tracking-widest uppercase text-slate-400 mb-1">광고 단가</p>
            <p className="text-4xl font-black text-slate-700 mb-1 tracking-tight">{fmt(s.r.avg)}<span className="text-xl font-normal">만원</span></p>
            <p className="text-[10px] text-slate-400 mb-6">{fmt(s.r.min)} ~ {fmt(s.r.max)}만원</p>
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[['1만', '팔로워'], ['9%', 'ER'], ['₩900', 'CPE']].map(([v, l]) => (
                    <div key={l} className="rounded-2xl p-3 text-center" style={inset}>
                        <p className="text-base font-black text-slate-600">{v}</p>
                        <p className="text-[8px] text-slate-400 mt-0.5">{l}</p>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 mb-4">
                {CONTENTS.map(ct => (
                    <button key={ct} onClick={() => s.setCt(ct)} className="flex-1 py-2.5 rounded-xl text-[10px] font-bold text-slate-600 transition-all"
                        style={s.ct === ct ? inset : raised}>
                        {ct === 'reels' ? '릴스' : ct === 'feed' ? '피드' : '스토리'}
                    </button>
                ))}
            </div>
            <div className="space-y-2">
                {CONDS.map((c, i) => (
                    <button key={c} onClick={() => s.toggle(i)} className="w-full flex justify-between items-center px-4 py-2.5 rounded-xl transition-all"
                        style={s.cs[i] ? { ...inset, color: '#6366f1' } : { ...raised, color: '#94a3b8' }}>
                        <span className="text-[10px] font-semibold">{c.split(' ').slice(0, -1).join(' ')}</span>
                        <span className="text-[10px] font-black">{c.split(' ').pop()}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

// ── 8. Finance Dark ──
function V8() {
    const s = useS()
    const up = s.r.avg > 1000000
    return (
        <div className="rounded-xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid #21262d' }}>
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#161b22', borderBottom: '1px solid #21262d' }}>
                <p className="font-mono text-[10px] text-green-400">● CREADYPICK RATE ENGINE</p>
                <p className="font-mono text-[9px] text-slate-600">v2.1.0</p>
            </div>
            <div className="p-5">
                <div className="mb-5 pb-4" style={{ borderBottom: '1px solid #21262d' }}>
                    <p className="font-mono text-[9px] text-slate-600 mb-1">ADV_VALUE / REALS_KRW</p>
                    <div className="flex items-end gap-3">
                        <p className="font-mono text-4xl font-black" style={{ color: up ? '#3fb950' : '#f85149' }}>
                            {fmt(s.r.avg)}만
                        </p>
                        <p className="font-mono text-sm mb-1" style={{ color: up ? '#3fb950' : '#f85149' }}>
                            {up ? '▲' : '▼'} {fmt(s.r.max - s.r.min)}만 ({((s.r.max - s.r.min) / s.r.avg * 100).toFixed(0)}%)
                        </p>
                    </div>
                    <p className="font-mono text-[9px] text-slate-600 mt-1">Range: {fmt(s.r.min)} — {fmt(s.r.max)}만원</p>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {[['FLWR', '10,000'], ['ER', '9.00%'], ['CPE', '₩900']].map(([l, v]) => (
                        <div key={l} className="rounded px-2 py-2" style={{ background: '#161b22', border: '1px solid #21262d' }}>
                            <p className="font-mono text-[8px] text-slate-600">{l}</p>
                            <p className="font-mono text-xs font-bold text-slate-300 mt-0.5">{v}</p>
                        </div>
                    ))}
                </div>
                <div className="flex gap-1 mb-4">
                    {CONTENTS.map(ct => (
                        <button key={ct} onClick={() => s.setCt(ct)} className="flex-1 py-1.5 font-mono text-[9px] font-bold rounded transition-all"
                            style={s.ct === ct ? { background: '#388bfd26', color: '#388bfd', border: '1px solid #388bfd' } : { color: '#484f58', border: '1px solid #21262d' }}>
                            {ct === 'reels' ? 'REELS' : ct === 'feed' ? 'FEED' : 'STORY'}
                        </button>
                    ))}
                </div>
                <div className="space-y-1">
                    {CONDS.map((c, i) => (
                        <button key={c} onClick={() => s.toggle(i)} className="w-full flex justify-between items-center px-3 py-2 rounded font-mono text-[9px] transition-all"
                            style={{ border: '1px solid #21262d', background: s.cs[i] ? '#3fb95020' : '#161b22', color: s.cs[i] ? '#3fb950' : '#484f58' }}>
                            <span>{c.split(' ').slice(0, -1).join('_')}</span>
                            <span className="font-black">{s.cs[i] ? '● ON' : '○ OFF'} {c.split(' ').pop()}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── 9. Kawaii Cute ──
function V9() {
    const s = useS()
    return (
        <div className="rounded-3xl p-6" style={{ background: 'linear-gradient(135deg, #fdf2f8, #eff6ff)' }}>
            <div className="text-center mb-5">
                <p className="text-2xl mb-1">✨🌸✨</p>
                <p className="text-xs font-bold text-pink-300 tracking-widest">MY AD VALUE</p>
                <p className="text-4xl font-black mt-1" style={{ color: '#ec4899' }}>{fmt(s.r.avg)}<span className="text-xl">만원 💰</span></p>
                <p className="text-[10px] text-pink-300 mt-1">{fmt(s.r.min)}~ {fmt(s.r.max)}만원 사이</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
                {[['1.0만', '👥', '#fce7f3'], ['9%', '💫', '#ede9fe'], ['뷰티', '💄', '#fef3c7']].map(([v, e, bg]) => (
                    <div key={v} className="rounded-2xl p-3 text-center" style={{ background: bg }}>
                        <p className="text-base">{e}</p>
                        <p className="text-sm font-black text-pink-700 mt-1">{v}</p>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 mb-4">
                {CONTENTS.map(ct => (
                    <button key={ct} onClick={() => s.setCt(ct)} className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                        style={s.ct === ct ? { background: 'linear-gradient(135deg,#f9a8d4,#c4b5fd)', color: 'white', boxShadow: '0 4px 12px rgba(244,114,182,0.3)' } : { background: 'white', color: '#f9a8d4' }}>
                        {ct === 'reels' ? '🎬 릴스' : ct === 'feed' ? '🖼️ 피드' : '⏱️ 스토리'}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
                {CONDS.map((c, i) => (
                    <button key={c} onClick={() => s.toggle(i)} className="py-2.5 px-3 rounded-2xl text-[10px] font-bold transition-all"
                        style={s.cs[i] ? { background: 'linear-gradient(135deg,#f9a8d4,#fde68a)', color: '#9d174d', boxShadow: '0 2px 10px rgba(249,168,212,0.4)' } : { background: 'white', color: '#fbcfe8' }}>
                        {['✌️', '👑', '🎬', '⚡'][i]} {c.split(' ').pop()}
                    </button>
                ))}
            </div>
        </div>
    )
}

// ── 10. Blueprint / Technical ──
function V10() {
    const s = useS()
    return (
        <div className="rounded-xl p-6 overflow-hidden relative" style={{ background: '#003366', fontFamily: 'monospace' }}>
            <div className="absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: 'linear-gradient(#6ab0f5 1px, transparent 1px), linear-gradient(90deg, #6ab0f5 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: 'linear-gradient(#6ab0f5 1px, transparent 1px), linear-gradient(90deg, #6ab0f5 1px, transparent 1px)', backgroundSize: '120px 120px' }} />
            <div className="relative">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-[8px] text-blue-300/50 tracking-widest uppercase">CREALAB RATE SPEC</p>
                    <p className="text-[8px] text-blue-300/50">REV.4 · DWG-2026-02</p>
                </div>
                <div className="border border-blue-300/20 rounded p-4 mb-4">
                    <p className="text-[8px] text-blue-300/50 mb-2 uppercase tracking-widest">Output: Estimated Ad Value</p>
                    <p className="text-4xl font-black text-blue-100">{fmt(s.r.min)}<span className="text-blue-300/50 mx-1 text-2xl">~</span>{fmt(s.r.max)}</p>
                    <p className="text-[9px] text-blue-300/50 mt-1">Unit: KRW · Avg {fmt(s.r.avg)}만원</p>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {[['FOLLOWERS', '10,000'], ['ER_RATE', '9.00%'], ['CPE_BASE', '₩900']].map(([l, v]) => (
                        <div key={l} className="border border-blue-300/20 rounded p-2">
                            <p className="text-[7px] text-blue-300/40 uppercase">{l}</p>
                            <p className="text-sm font-black text-blue-200 mt-1">{v}</p>
                        </div>
                    ))}
                </div>
                <div className="border border-blue-300/20 rounded mb-3 overflow-hidden">
                    <p className="text-[7px] text-blue-300/40 uppercase px-3 py-1.5 border-b border-blue-300/10">CONTENT_MULTIPLIER</p>
                    <div className="flex">
                        {CONTENTS.map((ct, i) => (
                            <button key={ct} onClick={() => s.setCt(ct)} className="flex-1 py-2 text-[9px] font-bold uppercase transition-all"
                                style={{ borderRight: i < 2 ? '1px solid rgba(147,197,253,0.1)' : 'none', background: s.ct === ct ? 'rgba(147,197,253,0.15)' : 'transparent', color: s.ct === ct ? '#93c5fd' : 'rgba(147,197,253,0.3)' }}>
                                {ct === 'reels' ? 'REELS×1.5' : ct === 'feed' ? 'FEED×1.0' : 'STORY×0.5'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="border border-blue-300/20 rounded overflow-hidden">
                    <p className="text-[7px] text-blue-300/40 uppercase px-3 py-1.5 border-b border-blue-300/10">ADDITIONAL_PARAMETERS</p>
                    {CONDS.map((c, i, arr) => (
                        <button key={c} onClick={() => s.toggle(i)} className="w-full flex justify-between items-center px-3 py-2 transition-all"
                            style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(147,197,253,0.08)' : 'none', background: s.cs[i] ? 'rgba(147,197,253,0.1)' : 'transparent' }}>
                            <span className="text-[9px] uppercase" style={{ color: s.cs[i] ? '#93c5fd' : 'rgba(147,197,253,0.3)' }}>{c.split(' ').slice(0, -1).join('_')}</span>
                            <span className="text-[9px] font-black" style={{ color: s.cs[i] ? '#6ee7b7' : 'rgba(147,197,253,0.2)' }}>
                                {s.cs[i] ? `[ACTIVE] ${c.split(' ').pop()}` : `[ OFF ]`}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

const VARIANTS = [
    { id: 1, name: 'Liquid Pastel', desc: '파스텔 블롭 그라디언트', comp: V1 },
    { id: 2, name: 'Brutalist', desc: '브루탈리즘 레트로', comp: V2 },
    { id: 3, name: 'iOS Frosted', desc: '아이폰 글래스', comp: V3 },
    { id: 4, name: 'Magazine', desc: '편집 잡지풍', comp: V4 },
    { id: 5, name: 'Memphis Retro', desc: '90s 멤피스', comp: V5 },
    { id: 6, name: 'Aurora', desc: '오로라 럭셔리', comp: V6 },
    { id: 7, name: 'Neumorphic', desc: '뉴모피즘 소프트', comp: V7 },
    { id: 8, name: 'Finance Dark', desc: '금융 다크 대시', comp: V8 },
    { id: 9, name: 'Kawaii', desc: '귀여운 파스텔', comp: V9 },
    { id: 10, name: 'Blueprint', desc: '기술 도면 스타일', comp: V10 },
]

export default function Page() {
    const [active, setActive] = useState<number | null>(null)
    const Comp = active ? VARIANTS[active - 1].comp : null

    return (
        <div className="min-h-screen bg-zinc-100 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <p className="text-xs text-zinc-400 tracking-widest uppercase mb-1">Design Lab / Calculator</p>
                    <h1 className="text-3xl font-black text-zinc-900">광고 단가 계산기 · 10 Variants</h1>
                    <p className="text-sm text-zinc-500 mt-1">더미 기준: 팔로워 1만 · ER 9% · 뷰티 · CPE ₩900</p>
                </div>

                {/* 전체 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {VARIANTS.map(v => {
                        const C = v.comp
                        return (
                            <div key={v.id} className="group cursor-pointer" onClick={() => setActive(v.id)}>
                                <div className="flex items-center gap-2 mb-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-black text-white">{v.id}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900 leading-tight">{v.name}</p>
                                        <p className="text-[10px] text-zinc-400">{v.desc}</p>
                                    </div>
                                </div>
                                <div className="transition-all duration-200 group-hover:scale-[1.01] group-hover:shadow-xl rounded-2xl overflow-hidden pointer-events-none">
                                    <C />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* 모달 확대 보기 */}
                {active && Comp && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setActive(null)}>
                        <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-white font-bold">{VARIANTS[active - 1].name}</p>
                                <button onClick={() => setActive(null)} className="text-white/60 text-xs hover:text-white">✕ 닫기</button>
                            </div>
                            <Comp />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
