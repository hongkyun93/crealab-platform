import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { formatDateToMonth } from "@/lib/utils"
import { Calendar, Filter, Gift, Send } from "lucide-react"
import Link from "next/link"
import React, { useState } from "react"
import { POPULAR_TAGS } from "@/lib/constants/categories"

export const DiscoverMomentsView = React.memo(function DiscoverMomentsView() {
    const { moments } = useUnifiedProvider()

    const [discoverTag, setDiscoverTag] = useState<string | null>(null)
    const [discoverFollowerFilter, setDiscoverFollowerFilter] = useState<string>("all")
    const [discoverSortOrder, setDiscoverSortOrder] = useState("latest")
    const [minFollowers, setMinFollowers] = useState<string>("")
    const [maxFollowers, setMaxFollowers] = useState<string>("")

    const handlePresetClick = (key: string) => {
        setDiscoverFollowerFilter(key)
        if (key === "all") {
            setMinFollowers("")
            setMaxFollowers("")
        } else if (key === "nano") {
            setMinFollowers("0")
            setMaxFollowers("10000")
        } else if (key === "micro") {
            setMinFollowers("10000")
            setMaxFollowers("100000")
        } else if (key === "growing") {
            setMinFollowers("100000")
            setMaxFollowers("300000")
        } else if (key === "mid") {
            setMinFollowers("300000")
            setMaxFollowers("500000")
        } else if (key === "macro") {
            setMinFollowers("500000")
            setMaxFollowers("1000000")
        } else if (key === "mega") {
            setMinFollowers("1000000")
            setMaxFollowers("")
        }
    }

    const getFilteredAndSortedMoments = () => {
        let result = [...(moments || [])]
        if (discoverTag) {
            result = result.filter(e =>
                e.category === discoverTag ||
                e.tags?.some((t: string) => t.includes(discoverTag) || discoverTag.includes(t))
            )
        }
        if (minFollowers !== "" || maxFollowers !== "") {
            const min = minFollowers === "" ? 0 : parseInt(minFollowers)
            const max = maxFollowers === "" ? Infinity : parseInt(maxFollowers)
            result = result.filter(e => {
                const count = e.followers || 0
                return count >= min && count <= max
            })
        }
        if (discoverSortOrder === "followers_high") result.sort((a, b) => (b.followers || 0) - (a.followers || 0))
        if (discoverSortOrder === "latest") result.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
        return result
    }

    const discoverMoments = getFilteredAndSortedMoments()

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">모먼트 둘러보기</h1>
                    <p className="text-muted-foreground mt-1">다른 크리에이터들은 어떤 모먼트를 공유하고 있는지 확인해보세요.</p>
                </div>
                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                {discoverSortOrder === "latest" ? "최신 등록순" : discoverSortOrder === "followers_high" ? "팔로워 많은순" : "정렬"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>정렬 기준</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={discoverSortOrder} onValueChange={setDiscoverSortOrder}>
                                <DropdownMenuRadioItem value="latest">최신 등록순</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="followers_high">팔로워 많은순</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Filters */}
            <Card className="bg-background/50 backdrop-blur-sm shadow-none border-dashed">
                <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 md:items-center">
                        <span className="text-sm font-semibold w-24">팔로워 규모</span>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { k: "all", l: "전체" },
                                { k: "nano", l: "나노 (<1만)" },
                                { k: "micro", l: "마이크로 (1~10만)" },
                                { k: "growing", l: "그로잉 (10~30만)" },
                                { k: "mid", l: "미드 (30~50만)" },
                                { k: "macro", l: "매크로 (50~100만)" },
                                { k: "mega", l: "메가 (>100만)" }
                            ].map(opt => (
                                <Button
                                    key={opt.k}
                                    variant={discoverFollowerFilter === opt.k ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePresetClick(opt.k)}
                                    className="rounded-full h-8"
                                >
                                    {opt.l}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 md:items-start">
                        <span className="text-sm font-semibold w-24 pt-2">전문 분야</span>
                        <div className="flex flex-wrap gap-2 flex-1">
                            <Button
                                variant={discoverTag === null ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setDiscoverTag(null)}
                                className="h-8"
                            >
                                전체
                            </Button>
                            {POPULAR_TAGS.map(tag => (
                                <Button
                                    key={tag}
                                    variant={discoverTag === tag ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setDiscoverTag(discoverTag === tag ? null : tag)}
                                    className={`h-8 ${discoverTag === tag ? 'bg-primary/10 text-primary' : ''}`}
                                >
                                    {tag}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {discoverMoments.map((item: any) => (
                    <Link key={item.id} href={`/moment/${item.id}`} className="block group">
                        <Card className="overflow-hidden transition-all hover:shadow-lg border-border/60 bg-background flex flex-col h-full cursor-pointer">
                            <CardHeader className="pb-3 flex-row gap-3 items-start space-y-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold overflow-hidden">
                                    {item.avatar && item.avatar.startsWith('http') ? (
                                        <img src={item.avatar} alt={item.influencer} className="h-full w-full object-cover" />
                                    ) : (
                                        item.avatar || item.influencer?.[0]
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold truncate text-sm">{item.influencer}</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{item.category}</p>
                                    <span className="text-[10px] font-medium bg-secondary/50 px-2 py-0.5 rounded-full mt-1 inline-block">
                                        {(item.followers || 0).toLocaleString()} 팔로워
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 flex-1">
                                <h3 className="font-bold text-sm line-clamp-2">{item.title}</h3>
                                <div className="space-y-1 py-1">
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                        <Calendar className="h-3 w-3 shrink-0" />
                                        <span className="font-medium text-foreground/80">일정:</span> {formatDateToMonth(item.momentDate)}
                                    </div>
                                    {item.postingDate && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                            <Send className="h-3 w-3 shrink-0" />
                                            <span className="font-medium text-foreground/80">업로드:</span>
                                            {item.dateFlexible ? (
                                                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 text-emerald-600 bg-emerald-50 border-emerald-100">협의가능</Badge>
                                            ) : (
                                                formatDateToMonth(item.postingDate)
                                            )}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                        <Gift className="h-3 w-3 shrink-0" />
                                        <span className="font-medium text-foreground/80">희망:</span> {item.targetProduct}
                                    </div>
                                </div>
                                <p className="text-xs text-foreground/70 line-clamp-2">{item.description}</p>
                                <div className="flex flex-wrap gap-1">
                                    {item.tags?.slice(0, 2).map((t: string) => (
                                        <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{t}</span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
})
