"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

// ============================================================
// 공용 필터 데이터
// ============================================================
const FOLLOWER_FILTERS = [
    { k: "all", l: "전체" },
    { k: "starter", l: "스타터 (0~1천)" },
    { k: "nano", l: "나노 (1천~1만)" },
    { k: "micro", l: "마이크로 (1~10만)" },
    { k: "growing", l: "그로잉 (10~30만)" },
    { k: "mid", l: "미드 (30~50만)" },
    { k: "macro", l: "매크로 (50~100만)" },
    { k: "mega", l: "메가 (>100만)" },
]

const STATUS_FILTERS = [
    { k: "all", l: "전체보기" },
    { k: "upcoming", l: "모집중인 모먼트" },
    { k: "past", l: "완료된 모먼트" },
    { k: "favorites", l: "즐겨찾기만 보기", icon: true },
]

const PRICE_FILTERS = [
    { k: "all", l: "전체" },
    { k: "under30", l: "30만원 이하" },
    { k: "30to50", l: "30~50만원" },
    { k: "50to100", l: "50~100만원" },
    { k: "over100", l: "100만원 이상" },
]

// ============================================================
// 스타일 옵션 A: 하단 언더라인
// ============================================================
function StyleA() {
    const [follower, setFollower] = useState("all")
    const [status, setStatus] = useState("all")
    const [price, setPrice] = useState("all")

    return (
        <Card className="bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Style A — 하단 언더라인</CardTitle>
                <p className="text-xs text-muted-foreground">선택된 항목에 primary 컬러 밑줄 + 볼드</p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 팔로워 규모 */}
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                    <span className="text-sm font-semibold w-24">팔로워 규모</span>
                    <div className="flex flex-wrap gap-1">
                        {FOLLOWER_FILTERS.map(opt => (
                            <button
                                key={opt.k}
                                onClick={() => setFollower(opt.k)}
                                className={cn(
                                    "px-3 py-1.5 text-sm rounded-md transition-all border-b-2",
                                    follower === opt.k
                                        ? "border-primary text-primary font-semibold bg-primary/5"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {opt.l}
                            </button>
                        ))}
                    </div>
                </div>
                {/* 모먼트 상태 */}
                <div className="flex flex-col md:flex-row gap-4 md:items-center pt-3 border-t border-border/40">
                    <span className="text-sm font-semibold w-24">모먼트 상태</span>
                    <div className="flex flex-wrap gap-1">
                        {STATUS_FILTERS.map(opt => (
                            <button
                                key={opt.k}
                                onClick={() => setStatus(opt.k)}
                                className={cn(
                                    "px-3 py-1.5 text-sm rounded-md transition-all border-b-2 flex items-center gap-1.5",
                                    status === opt.k
                                        ? "border-primary text-primary font-semibold bg-primary/5"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {opt.icon && <Star className="h-3.5 w-3.5 text-yellow-500" fill={status === opt.k ? "currentColor" : "none"} />}
                                {opt.l}
                            </button>
                        ))}
                    </div>
                </div>
                {/* 영상 단가 */}
                <div className="flex flex-col md:flex-row gap-4 md:items-center pt-3 border-t border-border/40">
                    <span className="text-sm font-semibold w-24">영상 단가</span>
                    <div className="flex flex-wrap gap-1">
                        {PRICE_FILTERS.map(opt => (
                            <button
                                key={opt.k}
                                onClick={() => setPrice(opt.k)}
                                className={cn(
                                    "px-3 py-1.5 text-sm rounded-md transition-all border-b-2",
                                    price === opt.k
                                        ? "border-primary text-primary font-semibold bg-primary/5"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {opt.l}
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// ============================================================
// 스타일 옵션 B: 서브틀 배경 + 텍스트 컬러 변경
// ============================================================
function StyleB() {
    const [follower, setFollower] = useState("all")
    const [status, setStatus] = useState("all")
    const [price, setPrice] = useState("all")

    return (
        <Card className="bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Style B — 서브틀 배경 강조</CardTitle>
                <p className="text-xs text-muted-foreground">선택된 항목에 primary 반투명 배경 + 텍스트 색상</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                    <span className="text-sm font-semibold w-24">팔로워 규모</span>
                    <div className="flex flex-wrap gap-1.5">
                        {FOLLOWER_FILTERS.map(opt => (
                            <button
                                key={opt.k}
                                onClick={() => setFollower(opt.k)}
                                className={cn(
                                    "px-3 py-1.5 text-sm rounded-lg transition-all",
                                    follower === opt.k
                                        ? "bg-primary/15 text-primary font-semibold ring-1 ring-primary/30"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {opt.l}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:items-center pt-3 border-t border-border/40">
                    <span className="text-sm font-semibold w-24">모먼트 상태</span>
                    <div className="flex flex-wrap gap-1.5">
                        {STATUS_FILTERS.map(opt => (
                            <button
                                key={opt.k}
                                onClick={() => setStatus(opt.k)}
                                className={cn(
                                    "px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5",
                                    status === opt.k
                                        ? "bg-primary/15 text-primary font-semibold ring-1 ring-primary/30"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {opt.icon && <Star className="h-3.5 w-3.5 text-yellow-500" fill={status === opt.k ? "currentColor" : "none"} />}
                                {opt.l}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:items-center pt-3 border-t border-border/40">
                    <span className="text-sm font-semibold w-24">영상 단가</span>
                    <div className="flex flex-wrap gap-1.5">
                        {PRICE_FILTERS.map(opt => (
                            <button
                                key={opt.k}
                                onClick={() => setPrice(opt.k)}
                                className={cn(
                                    "px-3 py-1.5 text-sm rounded-lg transition-all",
                                    price === opt.k
                                        ? "bg-primary/15 text-primary font-semibold ring-1 ring-primary/30"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {opt.l}
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// ============================================================
// 스타일 옵션 C: 미니멀 볼드 + 좌측 도트
// ============================================================
function StyleC() {
    const [follower, setFollower] = useState("all")
    const [status, setStatus] = useState("all")
    const [price, setPrice] = useState("all")

    return (
        <Card className="bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Style C — 좌측 도트 인디케이터</CardTitle>
                <p className="text-xs text-muted-foreground">선택된 항목 앞에 primary 색 도트 + 볼드</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                    <span className="text-sm font-semibold w-24">팔로워 규모</span>
                    <div className="flex flex-wrap gap-1">
                        {FOLLOWER_FILTERS.map(opt => (
                            <button
                                key={opt.k}
                                onClick={() => setFollower(opt.k)}
                                className={cn(
                                    "px-3 py-1.5 text-sm rounded-md transition-all flex items-center gap-1.5",
                                    follower === opt.k
                                        ? "text-foreground font-semibold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {follower === opt.k && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                                {opt.l}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:items-center pt-3 border-t border-border/40">
                    <span className="text-sm font-semibold w-24">모먼트 상태</span>
                    <div className="flex flex-wrap gap-1">
                        {STATUS_FILTERS.map(opt => (
                            <button
                                key={opt.k}
                                onClick={() => setStatus(opt.k)}
                                className={cn(
                                    "px-3 py-1.5 text-sm rounded-md transition-all flex items-center gap-1.5",
                                    status === opt.k
                                        ? "text-foreground font-semibold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {status === opt.k && !opt.icon && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                                {opt.icon && <Star className="h-3.5 w-3.5 text-yellow-500" fill={status === opt.k ? "currentColor" : "none"} />}
                                {opt.l}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:items-center pt-3 border-t border-border/40">
                    <span className="text-sm font-semibold w-24">영상 단가</span>
                    <div className="flex flex-wrap gap-1">
                        {PRICE_FILTERS.map(opt => (
                            <button
                                key={opt.k}
                                onClick={() => setPrice(opt.k)}
                                className={cn(
                                    "px-3 py-1.5 text-sm rounded-md transition-all flex items-center gap-1.5",
                                    price === opt.k
                                        ? "text-foreground font-semibold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {price === opt.k && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                                {opt.l}
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// ============================================================
// 스타일 옵션 D: 칩(Chip) 스타일
// ============================================================
function StyleD() {
    const [follower, setFollower] = useState("all")
    const [status, setStatus] = useState("all")
    const [price, setPrice] = useState("all")

    return (
        <Card className="bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Style D — 칩(Chip) 스타일</CardTitle>
                <p className="text-xs text-muted-foreground">선택 시 배경 채워진 칩 형태 (pill + filled)</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                    <span className="text-sm font-semibold w-24">팔로워 규모</span>
                    <div className="flex flex-wrap gap-2">
                        {FOLLOWER_FILTERS.map(opt => (
                            <button
                                key={opt.k}
                                onClick={() => setFollower(opt.k)}
                                className={cn(
                                    "px-3 py-1 text-sm rounded-full transition-all border",
                                    follower === opt.k
                                        ? "bg-primary text-primary-foreground border-primary font-medium"
                                        : "text-muted-foreground border-border/50 hover:border-border hover:text-foreground"
                                )}
                            >
                                {opt.l}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:items-center pt-3 border-t border-border/40">
                    <span className="text-sm font-semibold w-24">모먼트 상태</span>
                    <div className="flex flex-wrap gap-2">
                        {STATUS_FILTERS.map(opt => (
                            <button
                                key={opt.k}
                                onClick={() => setStatus(opt.k)}
                                className={cn(
                                    "px-3 py-1 text-sm rounded-full transition-all border flex items-center gap-1.5",
                                    status === opt.k
                                        ? "bg-primary text-primary-foreground border-primary font-medium"
                                        : "text-muted-foreground border-border/50 hover:border-border hover:text-foreground"
                                )}
                            >
                                {opt.icon && <Star className="h-3.5 w-3.5" fill={status === opt.k ? "currentColor" : "none"} />}
                                {opt.l}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:items-center pt-3 border-t border-border/40">
                    <span className="text-sm font-semibold w-24">영상 단가</span>
                    <div className="flex flex-wrap gap-2">
                        {PRICE_FILTERS.map(opt => (
                            <button
                                key={opt.k}
                                onClick={() => setPrice(opt.k)}
                                className={cn(
                                    "px-3 py-1 text-sm rounded-full transition-all border",
                                    price === opt.k
                                        ? "bg-primary text-primary-foreground border-primary font-medium"
                                        : "text-muted-foreground border-border/50 hover:border-border hover:text-foreground"
                                )}
                            >
                                {opt.l}
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// ============================================================
// 메인 페이지: 탭으로 전환
// ============================================================
export default function MomentDiscoverDesignPage() {
    const [activeTab, setActiveTab] = useState<string>("A")
    const tabs = [
        { id: "A", label: "하단 언더라인" },
        { id: "B", label: "서브틀 배경" },
        { id: "C", label: "좌측 도트" },
        { id: "D", label: "칩 스타일" },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold">Discover 필터 스타일 비교</h1>
                    <p className="text-muted-foreground mt-1">각 스타일을 클릭하여 선택 상태를 직접 테스트해보세요</p>
                </div>

                {/* 스타일 선택 탭 */}
                <div className="flex gap-2 border-b border-border pb-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-[3px]",
                                activeTab === tab.id
                                    ? "border-primary text-primary bg-primary/5"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Style {tab.id}: {tab.label}
                        </button>
                    ))}
                </div>

                {/* 선택된 스타일 표시 */}
                {activeTab === "A" && <StyleA />}
                {activeTab === "B" && <StyleB />}
                {activeTab === "C" && <StyleC />}
                {activeTab === "D" && <StyleD />}

                {/* 전체 비교 (스크롤) */}
                <div className="pt-8 border-t">
                    <h2 className="text-lg font-semibold mb-4">전체 비교</h2>
                    <div className="space-y-6">
                        <StyleA />
                        <StyleB />
                        <StyleC />
                        <StyleD />
                    </div>
                </div>
            </div>
        </div>
    )
}
