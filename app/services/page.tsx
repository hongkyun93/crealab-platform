"use client"

import { useState, useEffect, useRef } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    ArrowRight, Sparkles, Users, Building2, Briefcase,
    Calendar, Shield, MessageSquare, FileText, Target,
    Zap, BarChart3, Search, Star, Clock, Lock,
    Megaphone, Package, CheckCircle2, Heart, Globe,
    UserPlus, Eye, Banknote, Layers, ChevronDown, Gift
} from "lucide-react"
import Link from "next/link"

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

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
    const { ref, isVisible } = useScrollReveal()
    return (
        <div ref={ref} className={className} style={{
            opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)",
            transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        }}>{children}</div>
    )
}

// ───── Tabs Data ─────
const TABS = [
    { id: "creator", label: "크리에이터", icon: Sparkles, color: "from-violet-500 to-purple-600" },
    { id: "mcn", label: "MCN / 에이전시", icon: Users, color: "from-emerald-500 to-teal-600" },
    { id: "brand", label: "브랜드", icon: Building2, color: "from-blue-500 to-indigo-600" },
] as const
type TabId = typeof TABS[number]["id"]

// ───── Feature Data (preserved from original) ─────
const CREATOR_FEATURES = [
    { icon: Calendar, title: "라이프 모먼트 등록", desc: "이사, 결혼, 출산, 여행 등 인생의 중요한 순간을 등록하면 관련 브랜드가 먼저 협업을 제안합니다.", highlight: "내가 영업하지 않아도 브랜드가 먼저 찾아옵니다" },
    { icon: Banknote, title: "레이트 카드 설정", desc: "숏폼, 롱폼, 라이브 등 콘텐츠 유형별로 직접 단가를 설정하세요. 브랜드에게 투명하게 공개됩니다.", highlight: "내 가치를 내가 정합니다" },
    { icon: Lock, title: "프라이버시 제어", desc: "모먼트별로 공개/비공개를 선택할 수 있습니다. 민감한 모먼트는 비공개로 설정하고 원하는 브랜드에게만 오픈하세요.", highlight: "내 정보는 내가 관리합니다" },
    { icon: Globe, title: "소셜 채널 통합", desc: "인스타그램, 유튜브, 틱톡, 블로그 등 다양한 채널 정보를 한 곳에서 관리하고 브랜드에게 보여주세요.", highlight: "모든 채널을 한눈에" },
    { icon: FileText, title: "AI 전자 계약서", desc: "협업 조건이 확정되면 AI가 자동으로 전자 계약서를 생성합니다. 디지털 서명으로 간편하게 계약을 완료하세요.", highlight: "복잡한 계약을 30초 만에" },
    { icon: Sparkles, title: "AI 콘텐츠 플랜", desc: "캠페인 가이드를 기반으로 AI가 콘텐츠 기획안을 자동 생성합니다. 아이디어가 막힐 때 활용하세요.", highlight: "AI가 기획안을 대신 작성" },
    { icon: Layers, title: "협업 워크스페이스", desc: "브랜드와의 협업 진행 상황을 한눈에 확인합니다. 제안→계약→배송→콘텐츠 제출→완료까지 전체 라이프사이클을 관리하세요.", highlight: "제안부터 정산까지 원스톱" },
    { icon: Calendar, title: "캘린더 뷰", desc: "일정 기반으로 모먼트와 협업 스케줄을 확인하세요. 중복 일정을 방지하고 효율적으로 관리합니다.", highlight: "스케줄을 놓치지 않도록" },
]
const MCN_FEATURES = [
    { icon: Users, title: "팀 멤버 관리", desc: "소속 크리에이터 목록을 한 곳에서 확인하고 관리합니다. 각 크리에이터의 채널, 팔로워, 협업 현황을 한눈에 파악하세요.", highlight: "전체 크리에이터 현황을 실시간으로" },
    { icon: Eye, title: "프록시 모드", desc: "소속 크리에이터를 대리하여 모먼트 등록, 브랜드 제안 관리, 계약 처리를 모두 수행할 수 있습니다.", highlight: "크리에이터 대신 모든 업무를 처리" },
    { icon: UserPlus, title: "초대 링크", desc: "고유 초대 링크를 생성하여 새로운 크리에이터를 팀에 간편하게 합류시킬 수 있습니다.", highlight: "클릭 한 번으로 크리에이터 영입" },
    { icon: BarChart3, title: "팀 통계", desc: "팀 전체의 협업 수, 제안 수, 활성 모먼트 등 핵심 지표를 대시보드에서 실시간으로 확인합니다.", highlight: "데이터 기반 의사결정" },
    { icon: Briefcase, title: "크리에이터별 대시보드", desc: "팀 스위처를 통해 각 크리에이터의 개별 대시보드로 자유롭게 전환합니다.", highlight: "크리에이터별 맞춤 관리" },
    { icon: Shield, title: "브랜드 제안 일괄 관리", desc: "모든 소속 크리에이터에게 온 브랜드 제안을 한 곳에서 확인하고, 수락/거절/협상을 대리합니다.", highlight: "흩어진 제안을 한 곳에서" },
]
const BRAND_FEATURES = [
    { icon: Search, title: "모먼트 디스커버리", desc: "전국 크리에이터들의 라이프 모먼트를 탐색합니다. 카테고리, 팔로워 수, 지역, 가격대 등 정밀 필터로 최적의 크리에이터를 찾으세요.", highlight: "제품이 필요한 사람을 정확히 찾습니다" },
    { icon: Target, title: "타이밍 매칭", desc: "이사 예정인 크리에이터에게 가전 제품을, 결혼 예정인 크리에이터에게 웨딩 서비스를 제안합니다.", highlight: "\"필요해서 쓰는 제품\"이 최고의 광고" },
    { icon: MessageSquare, title: "실시간 메시징", desc: "크리에이터와 직접 메시지를 주고받으며 협업 조건을 조율합니다.", highlight: "중간 브로커 없이 직접 소통" },
    { icon: Package, title: "제품 관리", desc: "제공할 제품의 상세 정보를 등록하고 제안서에 자동으로 연동합니다.", highlight: "제품 정보를 한 번만 등록하세요" },
    { icon: Megaphone, title: "캠페인 운영", desc: "다수의 크리에이터에게 동시에 제안하는 캠페인을 만들 수 있습니다.", highlight: "대규모 협업도 손쉽게" },
    { icon: FileText, title: "AI 계약서 & 서명", desc: "제안 수락 후 AI가 협업 전자 계약서를 자동 생성합니다.", highlight: "계약서 작성 시간 zero" },
    { icon: Star, title: "AI 적정 가격 계산기", desc: "크리에이터의 팔로워 수, 채널, 콘텐츠 유형에 기반한 적정 협업 단가를 AI가 추천합니다.", highlight: "\"이 크리에이터, 얼마가 적절할까?\"" },
    { icon: Layers, title: "협업 워크스페이스", desc: "수락→계약→배송→콘텐츠 검수→완료까지 전체 과정을 프로그레스 바로 시각화합니다.", highlight: "파편화된 업무를 하나로 통합" },
]

// ───── Moment Examples (all 19 preserved) ─────
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

// ───── FAQ Data ─────
const FAQ_DATA = [
    { q: "수수료가 있나요?", a: "런칭 기간에는 브랜드와 크리에이터 모두 수수료 0%입니다. 중개 수수료 없이 직접 거래하세요." },
    { q: "크리에이터 팔로워 수 제한이 있나요?", a: "없습니다! 팔로워 1,000명의 나노 인플루언서부터 100만 이상 메가 인플루언서까지 모두 가입하실 수 있습니다." },
    { q: "어떤 모먼트를 등록할 수 있나요?", a: "이사, 결혼, 출산부터 여행, 다이어트, 게임 장비 교체까지 — 제품 소비가 연결되는 모든 라이프 이벤트를 등록할 수 있습니다." },
    { q: "계약은 어떻게 진행되나요?", a: "AI가 협업 조건을 바탕으로 전자 계약서를 자동 생성합니다. 양측 디지털 서명으로 법적 효력 있는 계약을 체결합니다." },
    { q: "MCN/에이전시도 사용할 수 있나요?", a: "네! MCN 전용 프록시 모드로 소속 크리에이터를 대리하여 모든 업무를 수행할 수 있습니다." },
    { q: "가입하면 바로 시작할 수 있나요?", a: "네, 가입 후 즉시 프로필을 설정하고 모먼트 등록(크리에이터) 또는 크리에이터 탐색(브랜드)을 시작할 수 있습니다." },
]

// ───── Components ─────
function FeatureCard({ icon: Icon, title, desc, highlight, accentColor }: {
    icon: any, title: string, desc: string, highlight: string, accentColor: string
}) {
    return (
        <Card className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardContent className="p-6 space-y-3">
                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${accentColor} text-white shadow-sm`}>
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                <p className="text-xs font-semibold text-primary flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />{highlight}
                </p>
            </CardContent>
        </Card>
    )
}

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

function FAQItem({ q, a }: { q: string, a: string }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors">
                <span className="font-semibold">{q}</span>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t pt-4">{a}</div>}
        </div>
    )
}

// ───── Main Page ─────
export default function ServicesDesignPage() {
    const [activeTab, setActiveTab] = useState<TabId>("creator")
    const [selectedMoment, setSelectedMoment] = useState<number | null>(1)
    const currentTab = TABS.find(t => t.id === activeTab)!

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />
            <main>
                {/* ─── Hero (Dark Premium) ─── */}
                <section className="relative overflow-hidden bg-slate-950 text-white">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(79,70,229,0.3),transparent)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(5,150,105,0.15),transparent)]" />
                    </div>
                    <div className="relative container mx-auto px-6 md:px-8 pt-7 pb-20 max-w-5xl text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium backdrop-blur-sm">
                            <Sparkles className="h-4 w-4" />세계 유일의 라이프 모먼트 기반 매칭 플랫폼
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                            제품이 필요한{" "}<span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">바로 그 순간</span>에 연결합니다
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            CreadyPick은 <strong className="text-white">&quot;누구&quot;</strong>에게는 물론,<br /><strong className="text-white">&quot;언제&quot;</strong> 맡길지에 집중합니다.
                        </p>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-background to-transparent" />
                </section>

                {/* ─── Before vs After (Story) ─── */}
                <section className="container mx-auto px-6 md:px-8 max-w-5xl py-16">
                    <Reveal className="text-center space-y-3 mb-10">
                        <h2 className="text-2xl md:text-3xl font-black">기존 방식 vs CreadyPick</h2>
                        <p className="text-muted-foreground">같은 예산, 완전히 다른 결과</p>
                    </Reveal>
                    <Reveal delay={100}>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="bg-muted/30 border-muted"><CardContent className="p-8 space-y-4">
                                <span className="inline-block text-xs font-bold uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1 rounded-full">기존 방식</span>
                                <h3 className="text-xl font-bold text-muted-foreground">&quot;누구(Who)에게만 집중&quot;</h3>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    {["DM 100개 보내면 답장 3개", "그 중 진행 가능 1명", "제품에 관심 없어서 억지 광고", "시청자도 \"광고구나\" 하고 스킵"].map((t, i) => (
                                        <div key={i} className="flex gap-2 items-start"><span className="text-red-400 mt-0.5">✕</span>{t}</div>
                                    ))}
                                </div>
                                <div className="pt-4 border-t text-center"><p className="text-3xl font-black text-red-400/60">ROI ???</p><p className="text-xs text-muted-foreground">성과 예측 불가능</p></div>
                            </CardContent></Card>
                            <Card className="bg-gradient-to-br from-primary/5 to-violet-500/5 border-primary/20 shadow-lg shadow-primary/5"><CardContent className="p-8 space-y-4">
                                <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">CreadyPick 방식</span>
                                <h3 className="text-xl font-bold text-primary">&quot;누구(Who) + 언제(When) 둘 다&quot;</h3>
                                <div className="space-y-2 text-sm">
                                    {["모먼트 검색으로 최적 크리에이터 발견", "수락 확률 ↑↑", "\"필요해서 쓰는 제품\" → 진정성 극대화", "시청자도 공감하며 구매 전환"].map((t, i) => (
                                        <div key={i} className="flex gap-2 items-start"><span className="text-green-500">✓</span>{t}</div>
                                    ))}
                                </div>
                                <div className="pt-4 border-t text-center"><p className="text-3xl font-black text-emerald-500">ROI 10x</p><p className="text-xs text-muted-foreground">타이밍 기반 예측 가능한 성과</p></div>
                            </CardContent></Card>
                        </div>
                    </Reveal>
                </section>

                {/* ─── Moment Examples: Side-by-Side (preserved) ─── */}



                {/* ─── Tab Section (preserved + enhanced) ─── */}
                <section className="container mx-auto px-6 md:px-8 max-w-5xl py-20">
                    <Reveal className="text-center space-y-3 mb-12">
                        <h2 className="text-2xl md:text-3xl font-black">누구에게나 유용한 올인원 플랫폼</h2>
                        <p className="text-muted-foreground">크리에이터, MCN, 브랜드 모두를 위한 맞춤 기능</p>
                    </Reveal>
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex flex-wrap justify-center bg-muted/50 p-1.5 rounded-2xl gap-1">
                            {TABS.map(tab => {
                                const Icon = tab.icon; const isActive = activeTab === tab.id
                                return (<button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${isActive ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />{tab.label}
                                </button>)
                            })}
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className={`p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-br ${currentTab.color} text-white`}>
                            <div className="max-w-2xl">
                                <p className="text-sm font-medium uppercase tracking-widest opacity-80 mb-3">{activeTab === "creator" ? "Creator Benefit" : activeTab === "mcn" ? "MCN / Agency Benefit" : "Brand Benefit"}</p>
                                <h3 className="text-2xl md:text-3xl font-black mb-4">{activeTab === "creator" ? "\"내 일상이 곧 수익이 됩니다\"" : activeTab === "mcn" ? "\"소속 크리에이터 관리를 하나로\"" : "\"본업에만 집중하세요\""}</h3>
                                <p className="text-white/80 leading-relaxed">{activeTab === "creator" ? "영업·계약·정산은 CreadyPick이 처리합니다. 라이프 모먼트에 필요한 제품을 광고하세요. 광고주는 CreadyPick이 찾아드립니다." : activeTab === "mcn" ? "흩어진 크리에이터 관리, 브랜드 제안, 계약을 하나의 대시보드에서 해결합니다." : "인플루언서 서치·컨택·계약은 CreadyPick에 맡기고, 본업에만 집중하세요."}</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(activeTab === "creator" ? CREATOR_FEATURES : activeTab === "mcn" ? MCN_FEATURES : BRAND_FEATURES).map((feature, i) => (
                                <FeatureCard key={`${activeTab}-${i}`} {...feature} accentColor={currentTab.color} />
                            ))}
                        </div>
                        <div className="flex flex-col items-center text-center p-10 rounded-3xl border border-dashed bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="text-2xl font-bold mb-2">{activeTab === "creator" ? "지금 첫 모먼트를 등록하세요" : activeTab === "mcn" ? "팀을 만들고 크리에이터를 초대하세요" : "제품이 필요한 크리에이터를 찾아보세요"}</h3>
                            <p className="text-muted-foreground mb-8">{activeTab === "creator" ? "무료 가입, 수수료 0%. 당신의 일상을 기회로 바꿔보세요." : activeTab === "mcn" ? "소속 크리에이터 수에 관계없이 무료로 시작하세요." : "타이밍이 맞는 크리에이터가 기다리고 있습니다."}</p>
                            <Button size="lg" className={`bg-gradient-to-r ${currentTab.color} text-white border-0 px-8 py-6 text-lg shadow-lg hover:shadow-xl`} asChild>
                                <Link href="/signup">무료로 시작하기 <ArrowRight className="ml-2 h-5 w-5" /></Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ─── Why CreadyPick ─── */}
                <section className="bg-slate-50 dark:bg-slate-950/50 border-y py-20">
                    <div className="container mx-auto px-6 md:px-8 max-w-5xl">
                        <Reveal className="text-center space-y-3 mb-12">
                            <h2 className="text-2xl md:text-3xl font-black">왜 CreadyPick인가?</h2>
                            <p className="text-muted-foreground">기존 플랫폼과 근본적으로 다릅니다</p>
                        </Reveal>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { icon: Clock, title: "타이밍이 전부입니다", desc: "팔로워 100만의 크리에이터보다, 지금 이사 중인 팔로워 1만의 크리에이터가 가전 광고에 10배 더 효과적입니다.", color: "from-amber-400 to-orange-500" },
                                { icon: Heart, title: "진정성이 곧 성과", desc: "\"돈 받고 하는 광고\"가 아니라 \"내가 진짜 필요해서 쓰는 제품\"입니다. 자연스러운 콘텐츠.", color: "from-rose-400 to-pink-500" },
                                { icon: Zap, title: "제로 수수료", desc: "브랜드도 크리에이터도 중개 수수료 0%. 직접 연결되어 양쪽 모두 최대 수익을 가져가세요.", color: "from-cyan-400 to-blue-500" },
                            ].map((item, i) => (
                                <Reveal key={i} delay={i * 100}>
                                    <div className="text-center space-y-4 p-6 rounded-2xl hover:bg-background hover:shadow-lg transition-all duration-300">
                                        <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}><item.icon className="h-7 w-7" /></div>
                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── Pricing / Launch Special ─── */}
                <section className="py-20">
                    <div className="container mx-auto px-6 md:px-8 max-w-4xl">
                        <Reveal className="text-center space-y-3 mb-12">
                            <h2 className="text-2xl md:text-3xl font-black">🎉 런칭 특별 혜택</h2>
                            <p className="text-muted-foreground">지금 가입하면 모든 기능이 무료!</p>
                        </Reveal>
                        <Reveal delay={100}>
                            <div className="relative rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-violet-500/5 p-8 sm:p-10 pt-10 sm:pt-12 text-center space-y-6 shadow-xl shadow-primary/5">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-lg">
                                    <Gift className="h-4 w-4" /> 런칭 프로모션
                                </div>
                                <div className="grid md:grid-cols-3 gap-8 pt-4">
                                    {[
                                        { label: "가입비", value: "무료", sub: "영원히" },
                                        { label: "수수료", value: "0%", sub: "런칭 기간 동안" },
                                        { label: "모든 기능", value: "무제한", sub: "AI 계약서·콘텐츠 플랜 포함" },
                                    ].map((item, i) => (
                                        <div key={i} className="space-y-2">
                                            <p className="text-sm text-muted-foreground font-medium">{item.label}</p>
                                            <p className="text-4xl font-black text-primary">{item.value}</p>
                                            <p className="text-xs text-muted-foreground">{item.sub}</p>
                                        </div>
                                    ))}
                                </div>
                                <Button size="lg" className="px-10 py-6 text-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-0 shadow-lg hover:shadow-xl" asChild>
                                    <Link href="/signup">지금 무료로 시작하기 <ArrowRight className="ml-2 h-5 w-5" /></Link>
                                </Button>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ─── FAQ ─── */}
                <section className="py-20 bg-muted/20 border-t">
                    <div className="container mx-auto px-6 md:px-8 max-w-3xl">
                        <Reveal className="text-center space-y-3 mb-12">
                            <h2 className="text-2xl md:text-3xl font-black">자주 묻는 질문</h2>
                            <p className="text-muted-foreground">궁금한 점이 있으신가요?</p>
                        </Reveal>
                        <div className="space-y-3">
                            {FAQ_DATA.map((faq, i) => <Reveal key={i} delay={i * 50}><FAQItem {...faq} /></Reveal>)}
                        </div>
                    </div>
                </section>

                {/* ─── Global CTA ─── */}
                <section className="relative py-24 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
                    <Reveal className="relative container mx-auto px-6 md:px-8 max-w-3xl text-center space-y-8 text-white">
                        <h2 className="text-3xl md:text-4xl font-black">지금 시작하세요</h2>
                        <p className="text-lg text-white/70">크리에이터, MCN, 브랜드 — 누구든 무료로 가입하고 바로 시작할 수 있습니다.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" asChild className="h-14 px-10 text-lg bg-white text-indigo-700 hover:bg-white/90 border-0 shadow-xl"><Link href="/signup">무료 가입하기 <ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
                            <Button size="lg" variant="outline" asChild className="h-14 px-10 text-lg border-white/30 text-white hover:bg-white/10"><Link href="/login">이미 계정이 있으신가요?</Link></Button>
                        </div>
                    </Reveal>
                </section>
            </main>
        </div>
    )
}
