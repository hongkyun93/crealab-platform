"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Briefcase, Calendar, Megaphone, Settings, ShoppingBag } from "lucide-react"
import { usePlatform } from "@/components/providers/platform-provider"

export function CreatorSidebar() {
    const pathname = usePathname()
    const { user } = usePlatform()

    return (
        <aside className="hidden lg:flex flex-col gap-4">
            {/* User Profile */}
            <div className="flex items-center gap-3 px-2 py-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
                    <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="font-bold">{user?.name || "사용자"}</h2>
                    <p className="text-xs text-muted-foreground">{user?.handle || "핸들 없음"}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
                <Link href="/creator/moments">
                    <Button
                        variant={pathname === "/creator/moments" ? "secondary" : "ghost"}
                        className="w-full justify-start"
                    >
                        <Calendar className="mr-2 h-4 w-4" /> 내 모먼트 아카이브
                    </Button>
                </Link>

                <Link href="/creator/workspace">
                    <Button
                        variant={pathname === "/creator/workspace" ? "secondary" : "ghost"}
                        className="w-full justify-start"
                    >
                        <Briefcase className="mr-2 h-4 w-4" /> 워크스페이스 아카이브
                    </Button>
                </Link>

                <Link href="/creator/campaigns">
                    <Button
                        variant={pathname === "/creator/campaigns" ? "secondary" : "ghost"}
                        className="w-full justify-start text-primary font-medium"
                    >
                        <Megaphone className="mr-2 h-4 w-4" /> 브랜드 캠페인 둘러보기
                    </Button>
                </Link>

                <Link href="/creator/products">
                    <Button
                        variant={pathname === "/creator/products" ? "secondary" : "ghost"}
                        className="w-full justify-start text-primary font-medium"
                    >
                        <ShoppingBag className="mr-2 h-4 w-4" /> 브랜드 제품 둘러보기
                    </Button>
                </Link>

                <Link href="/creator/notifications">
                    <Button
                        variant={pathname === "/creator/notifications" ? "secondary" : "ghost"}
                        className="w-full justify-start"
                    >
                        <Bell className="mr-2 h-4 w-4" /> 알림
                    </Button>
                </Link>

                <div className="my-2 border-t" />

                <Link href="/creator/settings">
                    <Button
                        variant={pathname === "/creator/settings" ? "secondary" : "ghost"}
                        className="w-full justify-start"
                    >
                        <Settings className="mr-2 h-4 w-4" /> 프로필 관리
                    </Button>
                </Link>
            </nav>
        </aside>
    )
}
