"use client"

import { useState, useEffect, useRef } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
    ArrowRight, Sparkles, Users, Building2, Zap,
    Target, Heart, Clock, CheckCircle2, Shield,
    Star, TrendingUp, Search
} from "lucide-react"
import Link from "next/link"

// ───── Animated Counter ─────
function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number, suffix?: string, duration?: number }) {
    const [count, setCount] = useState(0)
    const ref = useRef<HTMLDivElement>(null)
    const [hasAnimated, setHasAnimated] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true)
                    const startTime = Date.now()
                    const animate = () => {
                        const elapsed = Date.now() - startTime
                        const progress = Math.min(elapsed / duration, 1)
                        const eased = 1 - Math.pow(1 - progress, 3)
                        setCount(Math.floor(eased * target))
                        if (progress < 1) requestAnimationFrame(animate)
                    }
                    requestAnimationFrame(animate)
                }
            },
            { threshold: 0.5 }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [target, duration, hasAnimated])

    return <div ref={ref}>{count.toLocaleString()}{suffix}</div>
}

// ───── Scroll Reveal ─────
function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [])
    return { ref, isVisible }
}

function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
    const { ref, isVisible } = useScrollReveal()
    return (
        <div ref={ref} className={className} style={{
            opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)",
            transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        }}>{children}</div>
    )
}

// ───── 19 Moment Examples (from services) ─────
const MOMENT_EXAMPLES = [
    { emoji: "✈️", label: "여행", products: "숙박, 카메라, 캐리어", brandNeed: "제주 캐리어 신상 출시했는데,\n여행 예정인 인플루언서 없나?", brandProduct: "캐리어 브랜드", example: { creator: "여행하는 하린", followers: "12.4만", title: "3월부터 제주 한달살기 예정 🏖️", date: "2026년 3월 예정" } },
    { emoji: "💄", label: "뷰티", products: "스킨케어, 메이크업, 헤어", brandNeed: "신상 스킨케어 라인 홍보하고 싶은데,\n피부 관리 중인 크리에이터 없을까?", brandProduct: "스킨케어 브랜드", example: { creator: "뷰티 수아", followers: "8.7만", title: "다음 주 피부과 시술 예정 — 전후 케어 제품 찾는 중 🧴", date: "2026년 2월 예정" } },
    { emoji: "💊", label: "건강", products: "건강식품, 영양제, 의료기기", brandNeed: "멀티비타민 신제품 런칭하는데,\n건강 관리에 관심 있는 사람 없나?", brandProduct: "영양제 브랜드", example: { creator: "헬시라이프 준호", followers: "5.2만", title: "3월 건강검진 예약 완료 — 영양제 루틴 새로 짤 계획 💊", date: "2026년 3월 예정" } },
    { emoji: "💉", label: "시술/병원", products: "병원, 시술, 의료 서비스", brandNeed: "투명교정 마케팅 하고 싶은데,\n교정 시작하는 크리에이터 없을까?", brandProduct: "치과 교정 클리닉", example: { creator: "리뷰어 민지", followers: "15.3만", title: "4월에 치아교정 시작 예정 — 병원 알아보는 중 🦷", date: "2026년 4월 예정" } },
    { emoji: "👗", label: "패션", products: "의류, 악세서리, 슈즈", brandNeed: "S/S 신상 컬렉션 출시인데,\n봄 옷 쇼핑 예정인 사람 없나?", brandProduct: "패션 브랜드", example: { creator: "스타일리스트 예은", followers: "22.1만", title: "봄맞이 옷장 교체 계획 중 🌸 — 코디 제품 필요", date: "2026년 3월 예정" } },
    { emoji: "🍽️", label: "맛집", products: "식품, 레스토랑, 주방용품", brandNeed: "성수 신규 매장 오픈했는데,\n맛집 탐방 좋아하는 크리에이터 없나?", brandProduct: "레스토랑 신규 매장", example: { creator: "먹방 다니엘", followers: "31.5만", title: "이번 주말 성수동 맛집 탐방 계획 🍜 — 방문 가능", date: "2026년 2월 예정" } },
    { emoji: "🏡", label: "리빙/인테리어", products: "가구, 가전, 홈데코", brandNeed: "프리미엄 가전 시리즈 광고하고 싶은데,\n이사 예정인 인플루언서 없나?", brandProduct: "가전 브랜드", example: { creator: "인테리어 소희", followers: "18.9만", title: "4월 신혼집 입주 예정 🏠 — 가구·가전 구매 계획 중", date: "2026년 4월 예정" } },
    { emoji: "💍", label: "웨딩/결혼", products: "웨딩, 혼수, 커플 아이템", brandNeed: "웨딩 촬영 패키지 홍보하고 싶은데,\n결혼 준비 중인 크리에이터 없을까?", brandProduct: "웨딩 스튜디오", example: { creator: "예비신부 지은", followers: "9.3만", title: "10월 결혼 예정 💐 — 웨딩홀·드레스·혼수 알아보는 중", date: "2026년 3월~" } },
    { emoji: "🏋️", label: "헬스/운동", products: "운동기구, 스포츠웨어, 보충제", brandNeed: "프로틴 신제품 출시했는데,\n운동 시작한 크리에이터 없을까?", brandProduct: "보충제 브랜드", example: { creator: "핏블리 태영", followers: "14.6만", title: "3월부터 바디프로필 준비 시작 💪 — 보충제·웨어 필요", date: "2026년 3월 예정" } },
    { emoji: "🥗", label: "다이어트", products: "다이어트 식품, 건강식단, 체중계", brandNeed: "저칼로리 도시락 광고하고 싶은데,\n다이어트 중인 인플루언서 없나?", brandProduct: "다이어트 식품 브랜드", example: { creator: "다이어터 하나", followers: "6.8만", title: "다음 달부터 30일 다이어트 챌린지 시작 🥗", date: "2026년 3월 예정" } },
    { emoji: "👶", label: "육아", products: "유아용품, 베이비케어, 교육완구", brandNeed: "유아 가방 신상 알리고 싶은데,\n곧 어린이집 입학하는 아기 없나?", brandProduct: "유아용품 브랜드", example: { creator: "육아맘 서연", followers: "11.2만", title: "3월 첫째 어린이집 입학 예정 🎒 — 준비물 구매 계획", date: "2026년 3월 예정" } },
    { emoji: "🐶", label: "반려동물", products: "사료, 간식, 펫용품", brandNeed: "프리미엄 사료 알리고 싶은데,\n새로 반려동물 입양한 사람 없나?", brandProduct: "반려동물 사료 브랜드", example: { creator: "멍스타그램 코코", followers: "7.5만", title: "다음 달 강아지 입양 예정 🐕 — 사료·용품 준비 중", date: "2026년 3월 예정" } },
    { emoji: "💻", label: "테크/IT", products: "노트북, 태블릿, 소프트웨어", brandNeed: "신형 노트북 알리고 싶은데,\n장비 교체하는 테크 크리에이터 없나?", brandProduct: "노트북 제조사", example: { creator: "테크리뷰어 상민", followers: "25.8만", title: "3월에 작업용 노트북 교체 예정 💻", date: "2026년 3월 예정" } },
    { emoji: "🎮", label: "게임", products: "게임기, 게이밍 기어", brandNeed: "게이밍 헤드셋 출시했는데,\n콘솔 교체하는 게이머 없을까?", brandProduct: "게이밍 기어 브랜드", example: { creator: "게이머 도윤", followers: "19.4만", title: "PS6 발매일에 구매 예정 🎮 — 주변기기도 교체 계획", date: "2026년 4월 예정" } },
    { emoji: "📚", label: "도서/자기계발", products: "도서, 강의, 문구", brandNeed: "자기계발 신간 홍보하고 싶은데,\n독서 콘텐츠 만드는 크리에이터 없나?", brandProduct: "출판사", example: { creator: "북튜버 시현", followers: "4.3만", title: "상반기 독서 챌린지 시작 예정 📖", date: "2026년 3월 예정" } },
    { emoji: "🎨", label: "취미/DIY", products: "공예 재료, 취미용품, 도구", brandNeed: "DIY 키트 제품 홍보하고 싶은데,\n공예 취미인 크리에이터 없을까?", brandProduct: "공예 키트 브랜드", example: { creator: "핸드메이드 유리", followers: "3.9만", title: "다음 달 도자기 공방 수업 등록 예정 🏺", date: "2026년 3월 예정" } },
    { emoji: "🎓", label: "교육/강의", products: "온라인 강의, 교재, 학습 앱", brandNeed: "코딩 교육 플랫폼 알리고 싶은데,\n코딩 독학 시작하는 크리에이터 없나?", brandProduct: "교육 플랫폼", example: { creator: "공부 브이로거 현우", followers: "8.1만", title: "3월부터 코딩 독학 시작 예정 🔥", date: "2026년 3월 예정" } },
    { emoji: "🎬", label: "영화/문화", products: "OTT, 공연 티켓, 문화 콘텐츠", brandNeed: "OTT 오리지널 시리즈 홍보인데,\n문화 콘텐츠 전문 크리에이터 없나?", brandProduct: "OTT 플랫폼", example: { creator: "시네필 지우", followers: "13.7만", title: "봄 시즌 OTT·극장 콘텐츠 몰아보기 계획 🎥", date: "2026년 3월 예정" } },
    { emoji: "💰", label: "재테크", products: "금융 상품, 투자 앱, 재무 서비스", brandNeed: "가계부 앱 신규 출시했는데,\n재테크 콘텐츠 만드는 사람 없나?", brandProduct: "핀테크 스타트업", example: { creator: "재테크 민수", followers: "16.2만", title: "새해 재무 계획 수립 중 💵", date: "2026년 2월~" } },
    { emoji: "📌", label: "기타", products: "기타 제품, 라이프스타일, 서비스", brandNeed: "우리 제품에 딱 맞는\n크리에이터를 찾고 있어요", brandProduct: "다양한 브랜드", example: { creator: "라이프 크리에이터 은비", followers: "6.1만", title: "새로운 취미·라이프 변화 계획 중 ✨ — 다양한 제품 관심", date: "2026년 3월 예정" } },
]

// ───── Matching Panel (from services) ─────
function MatchingPanel({ moment }: { moment: typeof MOMENT_EXAMPLES[number] }) {
    return (
        <div className="animate-in fade-in-50 duration-200 space-y-3 h-full flex flex-col justify-center">
            <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 dark:border-blue-800/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white"><Building2 className="h-3.5 w-3.5" /></div>
                    <div><p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">브랜드의 고민</p><p className="text-[10px] text-muted-foreground">{moment.brandProduct}</p></div>
                </div>
                <div className="bg-white/80 dark:bg-background/60 rounded-lg p-3 border border-blue-100 dark:border-blue-900/30">
                    <p className="text-[13px] font-medium leading-relaxed whitespace-pre-line text-foreground">&ldquo;{moment.brandNeed}&rdquo;</p>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-blue-500"><Search className="h-3 w-3" /><span className="text-[11px] font-medium">적절한 인플루언서를 찾는 중...</span></div>
            </div>
            <div className="flex items-center justify-center py-0.5">
                <div className="h-px w-6 bg-gradient-to-r from-blue-300 to-green-400" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20 mx-2 animate-pulse"><Zap className="h-3.5 w-3.5" /></div>
                <div className="h-px w-6 bg-gradient-to-r from-green-400 to-violet-400" />
            </div>
            <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50/50 dark:from-violet-950/30 dark:to-purple-950/20 dark:border-violet-800/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white"><Sparkles className="h-3.5 w-3.5" /></div>
                    <div><p className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">크리에이터 모먼트</p><p className="text-[10px] text-muted-foreground">CreadyPick에서 발견</p></div>
                </div>
                <div className="bg-white/80 dark:bg-background/60 rounded-lg p-3 border border-violet-100 dark:border-violet-900/30 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{moment.example.creator.charAt(0)}</div>
                        <div className="min-w-0"><p className="font-bold text-sm truncate">{moment.example.creator}</p><p className="text-[10px] text-muted-foreground">팔로워 {moment.example.followers}</p></div>
                        <span className="ml-auto text-[10px] text-green-600 font-semibold whitespace-nowrap flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />모집중</span>
                    </div>
                    <div><p className="font-bold text-[13px] leading-snug">{moment.example.title}</p><p className="text-[11px] text-muted-foreground mt-0.5">{moment.example.date}</p></div>
                    <div className="pt-1 border-t border-violet-100 dark:border-violet-900/30"><p className="text-[10px] text-muted-foreground mb-1">📦 광고 가능 제품</p><p className="text-[11px] font-medium text-violet-700 dark:text-violet-300">{moment.products}</p></div>
                </div>
                <Button size="sm" className="mt-2.5 text-xs h-7 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 w-full">바로 제안 보내기 <ArrowRight className="ml-1 h-3 w-3" /></Button>
            </div>
            <p className="text-center text-[10px] text-muted-foreground">⚡ <strong>타이밍 매칭</strong> — 제품이 필요한 바로 그 순간에 연결</p>
        </div>
    )
}

// ───── Main Page ─────
export default function HomeLandingPage() {
    const [selectedMoment, setSelectedMoment] = useState<number | null>(1)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => { setIsLoaded(true) }, [])

    // Auto-rotate hero demo
    const [heroMomentIdx, setHeroMomentIdx] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => setHeroMomentIdx(prev => (prev + 1) % MOMENT_EXAMPLES.length), 4000)
        return () => clearInterval(interval)
    }, [])
    const heroMoment = MOMENT_EXAMPLES[heroMomentIdx]

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />
            <main>
                {/* ═══════════════════════════════════════════════
                    SECTION 1: DARK PREMIUM HERO
                ═══════════════════════════════════════════════ */}
                <section className="relative overflow-hidden bg-slate-950 text-white">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(79,70,229,0.3),transparent)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(5,150,105,0.15),transparent)]" />
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                    </div>

                    <div className="relative container mx-auto px-6 md:px-8 max-w-7xl">
                        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-64px)] py-7">
                            {/* Left: Text */}
                            <div className="space-y-8" style={{
                                opacity: isLoaded ? 1 : 0, transform: isLoaded ? "translateY(0)" : "translateY(40px)",
                                transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 200ms"
                            }}>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium backdrop-blur-sm">
                                    <Sparkles className="h-4 w-4" />세계 유일의 라이프 모먼트 기반 매칭 플랫폼
                                </div>

                                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                                    <span className="block">광고는</span>
                                    <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">타이밍이다</span>
                                </h1>

                                <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-lg">
                                    크리에이터의 <strong className="text-white">라이프 모먼트</strong>에 맞춰 브랜드와 연결합니다.<br />필요한 순간, 진정성 있는 파트너십.
                                </p>

                                {/* 3 Buttons: Creator / MCN / Brand */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button size="lg" asChild className="h-13 px-6 text-base bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all">
                                        <Link href="/signup?role=creator">
                                            <Sparkles className="mr-2 h-4 w-4" /> 크리에이터로 시작
                                        </Link>
                                    </Button>
                                    <Button size="lg" asChild className="h-13 px-6 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
                                        <Link href="/signup?role=mcn">
                                            <Users className="mr-2 h-4 w-4" /> MCN으로 시작
                                        </Link>
                                    </Button>
                                    <Button size="lg" asChild className="h-13 px-6 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
                                        <Link href="/signup?role=brand">
                                            <Building2 className="mr-2 h-4 w-4" /> 브랜드로 시작
                                        </Link>
                                    </Button>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 가입비 무료</span>
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 수수료 0%</span>
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 즉시 시작</span>
                                </div>
                            </div>

                            {/* Right: Live Matching Demo */}
                            <div className="hidden lg:block" style={{
                                opacity: isLoaded ? 1 : 0, transform: isLoaded ? "translateY(0)" : "translateY(40px)",
                                transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 600ms"
                            }}>
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 rounded-3xl blur-xl" />
                                    <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                            </div>
                                            <span className="text-xs text-slate-600 font-mono">CreadyPick Matching Engine</span>
                                        </div>
                                        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-5 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"><Building2 className="h-5 w-5 text-white" /></div>
                                                <div><p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Brand</p><p className="text-sm text-slate-400">{heroMoment.brandProduct}</p></div>
                                            </div>
                                            <p className="text-sm text-slate-300 italic">&ldquo;{heroMoment.label} 관련 크리에이터를 찾고 있어요&rdquo;</p>
                                        </div>
                                        <div className="flex items-center justify-center gap-3 py-2">
                                            <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse"><Zap className="h-5 w-5 text-white" /></div>
                                            <div className="h-px flex-1 bg-gradient-to-l from-violet-500/50 to-transparent" />
                                        </div>
                                        <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-5 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm">{heroMoment.emoji}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm text-white">{heroMoment.example.creator}</p>
                                                    <p className="text-xs text-slate-500">팔로워 {heroMoment.example.followers}</p>
                                                </div>
                                                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 모집중</span>
                                            </div>
                                            <p className="text-sm text-slate-300 font-medium">{heroMoment.example.title}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {heroMoment.products.split(", ").map((p, i) => (
                                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/20">{p}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-center py-2"><p className="text-xs text-emerald-400 font-semibold">⚡ 타이밍 매치 완료 — 진정성 100%</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent" />
                </section>

                {/* ═══════════════════════════════════════════════
                    SECTION 2: PAIN POINTS (Creator → MCN → Brand)
                ═══════════════════════════════════════════════ */}
                <section className="py-24">
                    <div className="container mx-auto px-6 md:px-8" style={{ maxWidth: "1400px" }}>
                        <RevealSection className="text-center space-y-4 mb-16">
                            <h2 className="text-3xl md:text-4xl font-black">이런 고민, 있으신가요?</h2>
                            <p className="text-muted-foreground text-lg">CreadyPick이 해결해 드립니다</p>
                        </RevealSection>

                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Creator Pain */}
                            <RevealSection delay={100}>
                                <div className="h-full rounded-2xl border bg-gradient-to-br from-violet-50/50 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/10 p-7 space-y-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/25"><Star className="h-5 w-5" /></div>
                                        <div><h3 className="font-bold text-lg">크리에이터님</h3><p className="text-xs text-muted-foreground">광고 수익을 높이고 싶으신가요?</p></div>
                                    </div>
                                    <div className="space-y-2">
                                        {["나랑 안 맞는 광고 제안만 와요...", "팔로워 적다고 기회가 없어요", "내 가치를 얼마로 정해야 할지 모르겠어요", "브랜드 연락이 개인 DM에 묻혀서 놓쳐요..."].map((pain, i) => (
                                            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/40 border border-violet-100 dark:border-violet-900/20">
                                                <span className="text-violet-400 mt-0.5 text-xs">😩</span>
                                                <p className="text-xs text-muted-foreground">{pain}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t pt-4 space-y-1.5">
                                        <p className="font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1.5 text-sm"><Sparkles className="h-3.5 w-3.5" /> CreadyPick으로 해결!</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed"><strong className="text-foreground">일상을 등록하면 브랜드가 먼저 찾아옵니다.</strong> 전용 비즈니스 메시징으로 협업 대화만 한 곳에서 관리하세요.</p>
                                    </div>
                                </div>
                            </RevealSection>

                            {/* MCN Pain */}
                            <RevealSection delay={200}>
                                <div className="h-full rounded-2xl border bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 p-7 space-y-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25"><Users className="h-5 w-5" /></div>
                                        <div><h3 className="font-bold text-lg">MCN / 에이전시</h3><p className="text-xs text-muted-foreground">크리에이터 관리가 복잡하신가요?</p></div>
                                    </div>
                                    <div className="space-y-2">
                                        {["크리에이터마다 DM으로 제안 확인하고...", "각각 계약서 따로 관리해야 하고...", "크리에이터도 많은데, 카톡·DM·이메일 다 따로 확인해야 해요", "브랜드 제안을 일일이 전달하기 힘들어요"].map((pain, i) => (
                                            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/40 border border-emerald-100 dark:border-emerald-900/20">
                                                <span className="text-emerald-400 mt-0.5 text-xs">😤</span>
                                                <p className="text-xs text-muted-foreground">{pain}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t pt-4 space-y-1.5">
                                        <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-sm"><Sparkles className="h-3.5 w-3.5" /> CreadyPick으로 해결!</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed"><strong className="text-foreground">프록시 모드로 모든 크리에이터를 대리 관리.</strong> 전용 메시징·제안·계약·일정을 하나의 대시보드에서 통합 처리하세요.</p>
                                    </div>
                                </div>
                            </RevealSection>

                            {/* Brand Pain */}
                            <RevealSection delay={300}>
                                <div className="h-full rounded-2xl border bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 p-7 space-y-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25"><Building2 className="h-5 w-5" /></div>
                                        <div><h3 className="font-bold text-lg">브랜드 담당자님</h3><p className="text-xs text-muted-foreground">인플루언서 마케팅이 어려우신가요?</p></div>
                                    </div>
                                    <div className="space-y-2">
                                        {["DM 보내도 개인 메시지에 묻혀서 읽씹...", "제품에 관심 없는 크리에이터만 만나요", "광고비 대비 성과 측정이 안 돼요", "계약·정산·검수... 관리가 너무 복잡해요"].map((pain, i) => (
                                            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/40 border border-blue-100 dark:border-blue-900/20">
                                                <span className="text-blue-400 mt-0.5 text-xs">😤</span>
                                                <p className="text-xs text-muted-foreground">{pain}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t pt-4 space-y-1.5">
                                        <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 text-sm"><Sparkles className="h-3.5 w-3.5" /> CreadyPick으로 해결!</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed"><strong className="text-foreground">제품이 필요한 크리에이터</strong>가 이미 모여있습니다. 전용 메시징으로 협업 대화를 분리하고, 모먼트 검색으로 최적의 파트너를 찾으세요.</p>
                                    </div>
                                </div>
                            </RevealSection>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    SECTION 3: MOMENT EXAMPLES (from services — 19 categories + sticky panel)
                ═══════════════════════════════════════════════ */}
                <section className="py-20 bg-slate-50 dark:bg-slate-950/50 border-y">
                    <div className="container mx-auto px-6 md:px-8" style={{ maxWidth: "1200px" }}>
                        <RevealSection className="text-center space-y-3 mb-10">
                            <h2 className="text-2xl md:text-3xl font-black" style={{ wordBreak: "keep-all" }}>
                                크리에이터의 <span className="text-primary">라이프 모먼트</span>가 곧 마케팅 기회
                            </h2>
                            <p className="text-muted-foreground text-sm sm:text-base" style={{ wordBreak: "keep-all" }}>카테고리를 클릭하면 브랜드와 크리에이터가 매칭되는 과정을 확인할 수 있습니다</p>
                        </RevealSection>
                        {/* Desktop: side-by-side / Mobile: stacked */}
                        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
                            <div className="flex-1 min-w-0">
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {MOMENT_EXAMPLES.map((m, i) => (
                                        <button key={i} onClick={() => setSelectedMoment(i)}
                                            className={`group flex flex-col items-center gap-1 p-2 sm:p-2.5 rounded-xl border transition-all duration-200 ${selectedMoment === i
                                                ? "bg-primary/10 border-primary/40 shadow-md scale-[1.02]"
                                                : "bg-background hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5"}`}>
                                            <span className={`text-lg sm:text-xl md:text-2xl transition-transform ${selectedMoment === i ? "scale-110" : "group-hover:scale-105"}`}>{m.emoji}</span>
                                            <span className="font-semibold text-[10px] sm:text-[11px] md:text-xs leading-tight text-center">{m.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="w-full lg:w-[380px] lg:flex-shrink-0 lg:sticky lg:top-[80px]">
                                {selectedMoment !== null ? <MatchingPanel moment={MOMENT_EXAMPLES[selectedMoment]} /> : (
                                    <div className="flex flex-col items-center justify-center min-h-[300px] lg:min-h-[400px] text-center text-muted-foreground space-y-3 border-2 border-dashed rounded-2xl p-8">
                                        <span className="text-4xl">�</span><p className="font-medium">카테고리를 클릭해보세요</p><p className="text-sm" style={{ wordBreak: "keep-all" }}>브랜드의 니즈와 크리에이터 모먼트가 어떻게 매칭되는지 확인할 수 있습니다</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    SECTION 4: HOW IT WORKS (3 Steps)
                ═══════════════════════════════════════════════ */}
                <section className="py-24">
                    <div className="container mx-auto px-6 md:px-8 max-w-5xl">
                        <RevealSection className="text-center space-y-4 mb-16">
                            <h2 className="text-3xl md:text-4xl font-black">시작은 간단합니다</h2>
                            <p className="text-muted-foreground text-lg">3단계만 기억하세요</p>
                        </RevealSection>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { step: "01", title: "프로필 등록", desc: "제품 정보 또는 라이프 모먼트를 등록하세요.", icon: Users, color: "from-blue-500 to-indigo-600", bg: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10" },
                                { step: "02", title: "타이밍 매칭", desc: "제품이 필요한 순간의 크리에이터와 자동 연결됩니다.", icon: Target, color: "from-violet-500 to-purple-600", bg: "from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/10" },
                                { step: "03", title: "협업 시작", desc: "제안→계약→배송→콘텐츠→정산 모두를 '워크스테이션' 한 곳에서 관리합니다.", icon: TrendingUp, color: "from-emerald-500 to-green-600", bg: "from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/10" },
                            ].map((item, i) => (
                                <RevealSection key={i} delay={i * 150}>
                                    <div className={`rounded-2xl border bg-gradient-to-br ${item.bg} p-8 text-center space-y-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full`}>
                                        <div className="flex items-center justify-center">
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}><item.icon className="h-7 w-7" /></div>
                                        </div>
                                        <div className="text-xs font-black text-primary/40 tracking-widest">STEP {item.step}</div>
                                        <h3 className="text-xl font-bold">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed" style={{ wordBreak: "keep-all" }}>{item.desc}</p>
                                    </div>
                                </RevealSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    SECTION 5: WHY CreadyPick
                ═══════════════════════════════════════════════ */}
                <section className="py-24 bg-slate-50 dark:bg-slate-950/50 border-y">
                    <div className="container mx-auto px-6 md:px-8 max-w-5xl">
                        <RevealSection className="text-center space-y-4 mb-16">
                            <h2 className="text-3xl md:text-4xl font-black">왜 CreadyPick인가?</h2>
                            <p className="text-muted-foreground text-lg">기존 인플루언서 플랫폼과 근본적으로 다릅니다</p>
                        </RevealSection>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: Clock, title: "타이밍이 전부입니다", desc: "팔로워 100만의 크리에이터보다, 지금 이사 중인 팔로워 1만의 크리에이터가 가전 광고에 10배 더 효과적입니다.", color: "from-amber-400 to-orange-500" },
                                { icon: Heart, title: "진정성이 곧 성과", desc: "\"돈 받고 하는 광고\"가 아닙니다. \"내가 진짜 필요해서 쓰는 제품\" — 시청자가 구별 못하는 자연스러운 콘텐츠.", color: "from-rose-400 to-pink-500" },
                                { icon: Shield, title: "공정한 파트너십", desc: "크리에이터가 직접 레이트 카드를 설정하고, AI 적정가 추천으로 양쪽 모두 만족하는 거래를 보장합니다.", color: "from-cyan-400 to-blue-500" },
                            ].map((item, i) => (
                                <RevealSection key={i} delay={i * 100}>
                                    <div className="text-center space-y-5 p-8 rounded-2xl hover:bg-background hover:shadow-lg transition-all duration-300 h-full">
                                        <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}><item.icon className="h-7 w-7" /></div>
                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                    </div>
                                </RevealSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    SECTION 6: SOCIAL PROOF (moved to bottom)
                ═══════════════════════════════════════════════ */}
                <section className="py-20 border-b">
                    <div className="container mx-auto px-6 md:px-8 max-w-5xl">
                        <RevealSection>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                                {[
                                    { value: 19, suffix: "개+", label: "라이프 모먼트 카테고리", icon: Target },
                                    { value: 500, suffix: "+", label: "등록 크리에이터", icon: Users },
                                    { value: 95, suffix: "%", label: "매칭 만족도", icon: Heart },
                                    { value: 0, suffix: "원", label: "수수료", icon: Zap },
                                ].map((stat, i) => (
                                    <div key={i} className="space-y-2">
                                        <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                                        <div className="text-3xl md:text-4xl font-black text-foreground">
                                            <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </RevealSection>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    SECTION 7: FINAL CTA
                ═══════════════════════════════════════════════ */}
                <section className="relative py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />

                    <RevealSection className="relative container mx-auto px-6 md:px-8 max-w-3xl text-center space-y-8 text-white">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black mb-4">지금 시작하세요</h2>
                            <p className="text-lg text-white/70">가입비 무료, 수수료 0%. 크리에이터, MCN, 브랜드 — 누구든 바로 시작할 수 있습니다.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" asChild className="h-14 px-10 text-lg bg-white text-indigo-700 hover:bg-white/90 border-0 shadow-xl shadow-black/20">
                                <Link href="/signup">무료 가입하기 <ArrowRight className="ml-2 h-5 w-5" /></Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="h-14 px-10 text-lg border-2 border-white/40 text-white bg-white/10 hover:bg-white/20">
                                <Link href="/design-lab/services">서비스 더 알아보기</Link>
                            </Button>
                        </div>
                        <p className="text-sm text-white/50">이미 계정이 있으신가요? <Link href="/login" className="text-white/80 underline underline-offset-4 hover:text-white">로그인</Link></p>
                    </RevealSection>
                </section>
            </main>
        </div>
    )
}
