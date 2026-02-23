"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    ArrowRight, Banknote, BarChart3, Briefcase, Building2, Calendar, CheckCircle2, Clock, Eye, FileText, Globe, Heart, Layers, Lock,
    Megaphone, MessageSquare, Package, Search, Shield, Sparkles, Star, Target, UserPlus, Users, Zap
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const TABS = [
    { id: "creator", label: "크리에이터", icon: Sparkles, color: "from-violet-500 to-purple-600" },
    { id: "mcn", label: "MCN / 에이전시", icon: Users, color: "from-emerald-500 to-teal-600" },
    { id: "brand", label: "브랜드", icon: Building2, color: "from-blue-500 to-indigo-600" },
] as const

type TabId = typeof TABS[number]["id"]

// ───── Feature Data ─────

const CREATOR_FEATURES = [
    {
        icon: Calendar,
        title: "라이프 모먼트 등록",
        desc: "이사, 결혼, 출산, 여행 등 인생의 중요한 순간을 등록하면 관련 브랜드가 먼저 협업을 제안합니다.",
        highlight: "내가 영업하지 않아도 브랜드가 먼저 찾아옵니다"
    },
    {
        icon: Banknote,
        title: "레이트 카드 설정",
        desc: "숏폼, 롱폼, 라이브 등 콘텐츠 유형별로 직접 단가를 설정하세요. 브랜드에게 투명하게 공개됩니다.",
        highlight: "내 가치를 내가 정합니다"
    },
    {
        icon: Lock,
        title: "프라이버시 제어",
        desc: "모먼트별로 공개/비공개를 선택할 수 있습니다. 민감한 모먼트는 비공개로 설정하고 원하는 브랜드에게만 오픈하세요.",
        highlight: "내 정보는 내가 관리합니다"
    },
    {
        icon: Globe,
        title: "소셜 채널 통합",
        desc: "인스타그램, 유튜브, 틱톡, 블로그 등 다양한 채널 정보를 한 곳에서 관리하고 브랜드에게 보여주세요.",
        highlight: "모든 채널을 한눈에"
    },
    {
        icon: FileText,
        title: "AI 전자 계약서",
        desc: "협업 조건이 확정되면 AI가 자동으로 전자 계약서를 생성합니다. 디지털 서명으로 간편하게 계약을 완료하세요.",
        highlight: "복잡한 계약을 30초 만에"
    },
    {
        icon: Sparkles,
        title: "AI 콘텐츠 플랜",
        desc: "캠페인 가이드를 기반으로 AI가 콘텐츠 기획안을 자동 생성합니다. 아이디어가 막힐 때 활용하세요.",
        highlight: "AI가 기획안을 대신 작성"
    },
    {
        icon: Layers,
        title: "협업 워크스페이스",
        desc: "브랜드와의 협업 진행 상황을 한눈에 확인합니다. 제안→계약→배송→콘텐츠 제출→완료까지 전체 라이프사이클을 관리하세요.",
        highlight: "제안부터 정산까지 원스톱"
    },
    {
        icon: Calendar,
        title: "캘린더 뷰",
        desc: "일정 기반으로 모먼트와 협업 스케줄을 확인하세요. 중복 일정을 방지하고 효율적으로 관리합니다.",
        highlight: "스케줄을 놓치지 않도록"
    },
]

const MCN_FEATURES = [
    {
        icon: Users,
        title: "팀 멤버 관리",
        desc: "소속 크리에이터 목록을 한 곳에서 확인하고 관리합니다. 각 크리에이터의 채널, 팔로워, 협업 현황을 한눈에 파악하세요.",
        highlight: "전체 크리에이터 현황을 실시간으로"
    },
    {
        icon: Eye,
        title: "프록시 모드",
        desc: "소속 크리에이터를 대리하여 모먼트 등록, 브랜드 제안 관리, 계약 처리를 모두 수행할 수 있습니다.",
        highlight: "크리에이터 대신 모든 업무를 처리"
    },
    {
        icon: UserPlus,
        title: "초대 링크",
        desc: "고유 초대 링크를 생성하여 새로운 크리에이터를 팀에 간편하게 합류시킬 수 있습니다.",
        highlight: "클릭 한 번으로 크리에이터 영입"
    },
    {
        icon: BarChart3,
        title: "팀 통계",
        desc: "팀 전체의 협업 수, 제안 수, 활성 모먼트 등 핵심 지표를 대시보드에서 실시간으로 확인합니다.",
        highlight: "데이터 기반 의사결정"
    },
    {
        icon: Briefcase,
        title: "크리에이터별 대시보드",
        desc: "팀 스위처를 통해 각 크리에이터의 개별 대시보드로 자유롭게 전환합니다. 각각의 모먼트, 협업, 메시지를 독립적으로 관리하세요.",
        highlight: "크리에이터별 맞춤 관리"
    },
    {
        icon: Shield,
        title: "브랜드 제안 일괄 관리",
        desc: "모든 소속 크리에이터에게 온 브랜드 제안을 한 곳에서 확인하고, 수락/거절/협상을 대리합니다.",
        highlight: "흩어진 제안을 한 곳에서"
    },
]

const BRAND_FEATURES = [
    {
        icon: Search,
        title: "모먼트 디스커버리",
        desc: "전국 크리에이터들의 라이프 모먼트를 탐색합니다. 카테고리, 팔로워 수, 지역, 가격대 등 정밀 필터로 최적의 크리에이터를 찾으세요.",
        highlight: "제품이 필요한 사람을 정확히 찾습니다"
    },
    {
        icon: Target,
        title: "타이밍 매칭",
        desc: "이사 예정인 크리에이터에게 가전 제품을, 결혼 예정인 크리에이터에게 웨딩 서비스를 제안합니다. '필요한 순간'에 연결되어 광고 진정성이 압도적으로 높아집니다.",
        highlight: "\"필요해서 쓰는 제품\"이 최고의 광고"
    },
    {
        icon: MessageSquare,
        title: "실시간 메시징",
        desc: "크리에이터와 직접 메시지를 주고받으며 협업 조건을 조율합니다. 레이트 카드 기반 가격 제안으로 빠르게 합의에 도달하세요.",
        highlight: "중간 브로커 없이 직접 소통"
    },
    {
        icon: Package,
        title: "제품 관리",
        desc: "제공할 제품의 상세 정보(이미지, 설명, 셀링포인트)를 등록하고 제안서에 자동으로 연동합니다.",
        highlight: "제품 정보를 한 번만 등록하세요"
    },
    {
        icon: Megaphone,
        title: "캠페인 운영",
        desc: "다수의 크리에이터에게 동시에 제안하는 캠페인을 만들 수 있습니다. 지원자 관리부터 선정까지 한 곳에서 처리합니다.",
        highlight: "대규모 협업도 손쉽게"
    },
    {
        icon: FileText,
        title: "AI 계약서 & 서명",
        desc: "제안 수락 후 AI가 협업 전자 계약서를 자동 생성합니다. 양측 디지털 서명으로 법적 효력 있는 계약을 체결하세요.",
        highlight: "계약서 작성 시간 zero"
    },
    {
        icon: Star,
        title: "AI 적정 가격 계산기",
        desc: "크리에이터의 팔로워 수, 채널, 콘텐츠 유형에 기반한 적정 협업 단가를 AI가 추천합니다.",
        highlight: "\"이 크리에이터, 얼마가 적절할까?\""
    },
    {
        icon: Layers,
        title: "협업 워크스페이스",
        desc: "수락→계약→배송→콘텐츠 검수→완료까지 전체 과정을 프로그레스 바로 시각화합니다. 진행 중인 모든 협업을 대시보드 하나로 관리하세요.",
        highlight: "파편화된 업무를 하나로 통합"
    },
]

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
    { emoji: "🥗", label: "다이어트", products: "다이어트 식품, 건강식단, 체중계", brandNeed: "저칼로리 도시락 광고하고 싶은데,\n다이어트 중인 인플루언서 없나?", brandProduct: "다이어트 식품 브랜드", example: { creator: "다이어터 하나", followers: "6.8만", title: "다음 달부터 30일 다이어트 챌린지 시작 🥗 — 식단 제품 구함", date: "2026년 3월 예정" } },
    { emoji: "👶", label: "육아", products: "유아용품, 베이비케어, 교육완구", brandNeed: "유아 가방 신상 알리고 싶은데,\n곧 어린이집 입학하는 아기 없나?", brandProduct: "유아용품 브랜드", example: { creator: "육아맘 서연", followers: "11.2만", title: "3월 첫째 어린이집 입학 예정 🎒 — 준비물 구매 계획", date: "2026년 3월 예정" } },
    { emoji: "🐶", label: "반려동물", products: "사료, 간식, 펫용품", brandNeed: "프리미엄 사료 알리고 싶은데,\n새로 반려동물 입양한 사람 없나?", brandProduct: "반려동물 사료 브랜드", example: { creator: "멍스타그램 코코", followers: "7.5만", title: "다음 달 강아지 입양 예정 🐕 — 사료·용품 준비 중", date: "2026년 3월 예정" } },
    { emoji: "💻", label: "테크/IT", products: "노트북, 태블릿, 소프트웨어", brandNeed: "신형 노트북 알리고 싶은데,\n장비 교체하는 테크 크리에이터 없나?", brandProduct: "노트북 제조사", example: { creator: "테크리뷰어 상민", followers: "25.8만", title: "3월에 작업용 노트북 교체 예정 💻 — 추천 제품 찾는 중", date: "2026년 3월 예정" } },
    { emoji: "🎮", label: "게임", products: "게임기, 게이밍 기어, 게임 소프트웨어", brandNeed: "게이밍 헤드셋 출시했는데,\n콘솔 교체하는 게이머 없을까?", brandProduct: "게이밍 기어 브랜드", example: { creator: "게이머 도윤", followers: "19.4만", title: "PS6 발매일에 구매 예정 🎮 — 주변기기도 교체 계획", date: "2026년 4월 예정" } },
    { emoji: "📚", label: "도서/자기계발", products: "도서, 강의, 문구", brandNeed: "자기계발 신간 홍보하고 싶은데,\n독서 콘텐츠 만드는 크리에이터 없나?", brandProduct: "출판사", example: { creator: "북튜버 시현", followers: "4.3만", title: "상반기 독서 챌린지 시작 예정 📖 — 추천 도서 모집 중", date: "2026년 3월 예정" } },
    { emoji: "🎨", label: "취미/DIY", products: "공예 재료, 취미용품, 도구", brandNeed: "DIY 키트 제품 홍보하고 싶은데,\n공예 취미인 크리에이터 없을까?", brandProduct: "공예 키트 브랜드", example: { creator: "핸드메이드 유리", followers: "3.9만", title: "다음 달 도자기 공방 수업 등록 예정 🏺 — 도구 구매 계획", date: "2026년 3월 예정" } },
    { emoji: "🎓", label: "교육/강의", products: "온라인 강의, 교재, 학습 앱", brandNeed: "코딩 교육 플랫폼 알리고 싶은데,\n코딩 독학 시작하는 크리에이터 없나?", brandProduct: "교육 플랫폼", example: { creator: "공부 브이로거 현우", followers: "8.1만", title: "3월부터 코딩 독학 시작 예정 🔥 — 강의·교재 찾는 중", date: "2026년 3월 예정" } },
    { emoji: "🎬", label: "영화/문화", products: "OTT, 공연 티켓, 문화 콘텐츠", brandNeed: "OTT 오리지널 시리즈 홍보인데,\n영화/문화 콘텐츠 전문 크리에이터 없나?", brandProduct: "OTT 플랫폼", example: { creator: "시네필 지우", followers: "13.7만", title: "봄 시즌 OTT·극장 콘텐츠 몰아보기 계획 🎥 — 추천 환영", date: "2026년 3월 예정" } },
    { emoji: "💰", label: "재테크", products: "금융 상품, 투자 앱, 재무 서비스", brandNeed: "가계부 앱 신규 출시했는데,\n재테크 콘텐츠 만드는 사람 없나?", brandProduct: "핀테크 스타트업", example: { creator: "재테크 민수", followers: "16.2만", title: "새해 재무 계획 수립 중 💵 — 가계부·투자 앱 비교 예정", date: "2026년 2월~" } },
]

// ───── Components ─────

function FeatureCard({ icon: Icon, title, desc, highlight, accentColor }: {
    icon: any, title: string, desc: string, highlight: string, accentColor: string
}) {
    return (
        <Card className="group relative overflow-hidden border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            <CardContent className="p-6 space-y-3">
                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${accentColor} text-white shadow-sm`}>
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                <p className="text-xs font-semibold text-primary flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {highlight}
                </p>
            </CardContent>
        </Card>
    )
}

function MatchingPanel({ moment }: { moment: typeof MOMENT_EXAMPLES[number] }) {
    return (
        <div className="animate-in fade-in-50 duration-200 space-y-3 h-full flex flex-col justify-center">
            {/* Brand Need */}
            <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 dark:border-blue-800/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                        <Building2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">브랜드의 고민</p>
                        <p className="text-[10px] text-muted-foreground">{moment.brandProduct}</p>
                    </div>
                </div>
                <div className="bg-white/80 dark:bg-background/60 rounded-lg p-3 border border-blue-100 dark:border-blue-900/30">
                    <p className="text-[13px] font-medium leading-relaxed whitespace-pre-line text-foreground">
                        &ldquo;{moment.brandNeed}&rdquo;
                    </p>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-blue-500 dark:text-blue-400">
                    <Search className="h-3 w-3" />
                    <span className="text-[11px] font-medium">적절한 인플루언서를 찾는 중...</span>
                </div>
            </div>

            {/* Match Indicator */}
            <div className="flex items-center justify-center py-0.5">
                <div className="h-px w-6 bg-gradient-to-r from-blue-300 to-green-400" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20 mx-2 animate-pulse">
                    <Zap className="h-3.5 w-3.5" />
                </div>
                <div className="h-px w-6 bg-gradient-to-r from-green-400 to-violet-400" />
            </div>

            {/* Creator Moment */}
            <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50/50 dark:from-violet-950/30 dark:to-purple-950/20 dark:border-violet-800/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
                        <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">크리에이터 모먼트</p>
                        <p className="text-[10px] text-muted-foreground">CreadyPick에서 발견</p>
                    </div>
                </div>
                <div className="bg-white/80 dark:bg-background/60 rounded-lg p-3 border border-violet-100 dark:border-violet-900/30 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {moment.example.creator.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm truncate">{moment.example.creator}</p>
                            <p className="text-[10px] text-muted-foreground">팔로워 {moment.example.followers}</p>
                        </div>
                        <span className="ml-auto text-[10px] text-green-600 font-semibold whitespace-nowrap flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            모집중
                        </span>
                    </div>
                    <div>
                        <p className="font-bold text-[13px] leading-snug">{moment.example.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{moment.example.date}</p>
                    </div>
                    <div className="pt-1 border-t border-violet-100 dark:border-violet-900/30">
                        <p className="text-[10px] text-muted-foreground mb-1">📦 광고 가능 제품</p>
                        <p className="text-[11px] font-medium text-violet-700 dark:text-violet-300">{moment.products}</p>
                    </div>
                </div>
                <Button size="sm" className="mt-2.5 text-xs h-7 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 w-full">
                    바로 제안 보내기 <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
            </div>

            <p className="text-center text-[10px] text-muted-foreground">
                ⚡ <strong>타이밍 매칭</strong> — 제품이 필요한 바로 그 순간에 연결
            </p>
        </div>
    )
}

export default function ServicesDesignPage() {
    const [activeTab, setActiveTab] = useState<TabId>("creator")
    const [selectedMoment, setSelectedMoment] = useState<number | null>(1) // default: 뷰티
    const currentTab = TABS.find(t => t.id === activeTab)!

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />
            <main>
                {/* ─── Hero ─── */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-950/30" />
                    <div className="relative container mx-auto px-6 md:px-8 pt-16 pb-12 max-w-5xl">
                        <div className="text-center space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                <Sparkles className="h-4 w-4" />
                                세계 유일의 라이프 모먼트 기반 매칭 플랫폼
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                                제품이 필요한{" "}
                                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                                    바로 그 순간
                                </span>
                                에<br />
                                연결합니다
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                기존 인플루언서 마케팅은 <strong className="text-foreground">"누구"</strong>에게 맡길지에 집중합니다.<br />
                                CreadyPick은 <strong className="text-foreground">"언제"</strong> 맡길지에 집중합니다.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ─── Comparison: Before vs After ─── */}
                <section className="container mx-auto px-6 md:px-8 max-w-5xl pb-16">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Card className="bg-muted/30 border-muted">
                            <CardContent className="p-8 space-y-4">
                                <span className="inline-block text-xs font-bold uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1 rounded-full">기존 방식</span>
                                <h3 className="text-xl font-bold text-muted-foreground">"누구(Who)에게 맡길까?"</h3>
                                <ul className="space-y-3 text-muted-foreground text-sm">
                                    <li className="flex gap-2"><span className="text-red-400">✕</span> 팔로워 수와 카테고리만 보고 매칭</li>
                                    <li className="flex gap-2"><span className="text-red-400">✕</span> 제품이 필요 없는 시점에 광고 진행</li>
                                    <li className="flex gap-2"><span className="text-red-400">✕</span> "돈 받고 하는 광고" 티가 남</li>
                                    <li className="flex gap-2"><span className="text-red-400">✕</span> 광고 효과 예측 불가능</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-primary/5 to-violet-500/5 border-primary/20 shadow-lg shadow-primary/5">
                            <CardContent className="p-8 space-y-4">
                                <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">CreadyPick 방식</span>
                                <h3 className="text-xl font-bold text-primary">"언제(When) 맡길까?"</h3>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex gap-2"><span className="text-green-500">✓</span> 크리에이터의 <strong>라이프 모먼트</strong>에 매칭</li>
                                    <li className="flex gap-2"><span className="text-green-500">✓</span> 실제로 제품이 필요한 바로 그 순간</li>
                                    <li className="flex gap-2"><span className="text-green-500">✓</span> "필요해서 쓰는 제품" → 진정성 극대화</li>
                                    <li className="flex gap-2"><span className="text-green-500">✓</span> 타이밍 기반 예측 가능한 성과</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* ─── Moment Examples: Side-by-Side ─── */}
                <section className="bg-muted/20 border-y py-12">
                    <div className="container mx-auto px-6 md:px-8" style={{ maxWidth: "1200px" }}>
                        <div className="text-center space-y-3 mb-8">
                            <h2 className="text-2xl md:text-3xl font-black">
                                크리에이터의 <span className="text-primary">라이프 모먼트</span>가 곧 마케팅 기회
                            </h2>
                            <p className="text-muted-foreground">카테고리를 클릭하면 브랜드와 크리에이터가 매칭되는 과정을 확인할 수 있습니다</p>
                        </div>
                        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                            {/* Left: Category Grid */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="grid grid-cols-4 gap-2">
                                    {MOMENT_EXAMPLES.map((m, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedMoment(i)}
                                            className={`group flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all duration-200 ${selectedMoment === i
                                                ? "bg-primary/10 border-primary/40 shadow-md scale-[1.02]"
                                                : "bg-background hover:border-primary/30 hover:shadow-sm"
                                                }`}
                                        >
                                            <span className={`text-xl md:text-2xl transition-transform ${selectedMoment === i ? "scale-110" : "group-hover:scale-105"}`}>
                                                {m.emoji}
                                            </span>
                                            <span className="font-semibold text-[11px] md:text-xs leading-tight text-center">{m.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Matching Visualization */}
                            <div style={{ width: "380px", flexShrink: 0, position: "sticky", top: "80px" }}>
                                {selectedMoment !== null ? (
                                    <MatchingPanel moment={MOMENT_EXAMPLES[selectedMoment]} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-muted-foreground space-y-3 border-2 border-dashed rounded-2xl p-8">
                                        <span className="text-4xl">👈</span>
                                        <p className="font-medium">카테고리를 클릭해보세요</p>
                                        <p className="text-sm">브랜드의 니즈와 크리에이터 모먼트가<br />어떻게 매칭되는지 확인할 수 있습니다</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Tab Section ─── */}
                <section className="container mx-auto px-6 md:px-8 max-w-5xl py-20">
                    <div className="text-center space-y-3 mb-12">
                        <h2 className="text-2xl md:text-3xl font-black">
                            누구에게나 유용한 올인원 플랫폼
                        </h2>
                        <p className="text-muted-foreground">크리에이터, MCN, 브랜드 모두를 위한 맞춤 기능</p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex bg-muted/50 p-1.5 rounded-2xl gap-1">
                            {TABS.map(tab => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                            ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-8">
                        {/* Value Proposition */}
                        <div className={`p-8 md:p-10 rounded-3xl bg-gradient-to-br ${currentTab.color} text-white`}>
                            <div className="max-w-2xl">
                                <p className="text-sm font-medium uppercase tracking-widest opacity-80 mb-3">
                                    {activeTab === "creator" ? "Creator Benefit" : activeTab === "mcn" ? "MCN / Agency Benefit" : "Brand Benefit"}
                                </p>
                                <h3 className="text-2xl md:text-3xl font-black mb-4">
                                    {activeTab === "creator"
                                        ? "\"내 일상이 곧 수익이 됩니다\""
                                        : activeTab === "mcn"
                                            ? "\"소속 크리에이터 관리를 하나로\""
                                            : "\"본업에만 집중하세요\""}
                                </h3>
                                <p className="text-white/80 leading-relaxed">
                                    {activeTab === "creator"
                                        ? "영업, 계약, 정산 — 복잡한 비즈니스는 CreadyPick이 처리합니다. 크리에이터는 오직 콘텐츠 창작에만 몰입하세요. 인생의 순간을 등록하면 관련 브랜드가 알아서 찾아옵니다."
                                        : activeTab === "mcn"
                                            ? "흩어진 크리에이터 관리, 브랜드 제안 응대, 계약 처리를 하나의 대시보드에서 모두 해결합니다. 프록시 모드로 크리에이터를 대리하여 모든 업무를 수행하세요."
                                            : "복잡한 인플루언서 서치, 컨택, 계약은 CreadyPick에 맡기세요. 대표님과 담당자님은 더 좋은 제품을 만드는 '본업'에만 몰입하세요."}
                                </p>
                            </div>
                        </div>

                        {/* Feature Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(activeTab === "creator" ? CREATOR_FEATURES :
                                activeTab === "mcn" ? MCN_FEATURES :
                                    BRAND_FEATURES
                            ).map((feature, i) => (
                                <FeatureCard
                                    key={`${activeTab}-${i}`}
                                    {...feature}
                                    accentColor={currentTab.color}
                                />
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col items-center text-center p-10 rounded-3xl border border-dashed bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="text-2xl font-bold mb-2">
                                {activeTab === "creator"
                                    ? "지금 첫 모먼트를 등록하세요"
                                    : activeTab === "mcn"
                                        ? "팀을 만들고 크리에이터를 초대하세요"
                                        : "제품이 필요한 크리에이터를 찾아보세요"}
                            </h3>
                            <p className="text-muted-foreground mb-8">
                                {activeTab === "creator"
                                    ? "무료 가입, 수수료 0%. 당신의 일상을 기회로 바꿔보세요."
                                    : activeTab === "mcn"
                                        ? "소속 크리에이터 수에 관계없이 무료로 시작하세요."
                                        : "타이밍이 맞는 크리에이터가 기다리고 있습니다."}
                            </p>
                            <Button size="lg" className={`bg-gradient-to-r ${currentTab.color} text-white border-0 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-shadow`} asChild>
                                <Link href={activeTab === "brand" ? "/signup" : "/signup"}>
                                    무료로 시작하기 <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ─── Why CreadyPick ─── */}
                <section className="bg-muted/20 border-t py-20">
                    <div className="container mx-auto px-6 md:px-8 max-w-5xl">
                        <div className="text-center space-y-3 mb-12">
                            <h2 className="text-2xl md:text-3xl font-black">
                                왜 CreadyPick인가?
                            </h2>
                            <p className="text-muted-foreground">기존 플랫폼과 근본적으로 다릅니다</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center space-y-4 p-6">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                                    <Clock className="h-7 w-7" />
                                </div>
                                <h3 className="font-bold text-lg">타이밍이 전부입니다</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    팔로워 100만의 크리에이터보다, <strong>지금 이사 중</strong>인 팔로워 1만의 크리에이터가 가전 광고에 10배 더 효과적입니다.
                                </p>
                            </div>
                            <div className="text-center space-y-4 p-6">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-lg">
                                    <Heart className="h-7 w-7" />
                                </div>
                                <h3 className="font-bold text-lg">진정성이 곧 성과</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    "돈 받고 하는 광고"가 아니라 <strong>"내가 진짜 필요해서 쓰는 제품"</strong>입니다. 시청자가 구별 못하는 수준의 자연스러운 콘텐츠.
                                </p>
                            </div>
                            <div className="text-center space-y-4 p-6">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-lg">
                                    <Zap className="h-7 w-7" />
                                </div>
                                <h3 className="font-bold text-lg">제로 수수료</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    브랜드도 크리에이터도 <strong>중개 수수료 0%</strong>. 직접 연결되어 양쪽 모두 최대 수익을 가져가세요.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Global CTA ─── */}
                <section className="py-20">
                    <div className="container mx-auto px-6 md:px-8 max-w-3xl text-center space-y-8">
                        <h2 className="text-3xl md:text-4xl font-black">
                            지금 시작하세요
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            크리에이터, MCN, 브랜드 — 누구든 무료로 가입하고 바로 시작할 수 있습니다.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="px-8 py-6 text-lg" asChild>
                                <Link href="/signup">
                                    무료 가입하기 <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="px-8 py-6 text-lg" asChild>
                                <Link href="/login">
                                    이미 계정이 있으신가요?
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
