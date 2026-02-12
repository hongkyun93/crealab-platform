"use client"

import React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
    LayoutDashboard,
    MessageSquare,
    Search,
    User,
    Settings,
    FileText,
    Image as ImageIcon,
    Bell
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CreatorSidebarProps {
    className?: string
    user?: {
        name: string
        email: string
        handle?: string
        image?: string
    }
}

export function DesignLabCreatorSidebar({ className, user }: CreatorSidebarProps) {
    const router = useRouter()
    const pathname = usePathname()

    const displayUser = user || { name: 'Kim Soomin', email: 'soomin@crealab.com', handle: '@soomin_kim', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80' }

    const isActive = (path: string) => pathname.includes(path)

    return (
        <div className={cn("w-64 border-r bg-card hidden md:block h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto", className)}>
            <div className="flex flex-col h-full bg-white">
                {/* Profile Section (Matched to Production) */}
                <div className="p-6 pb-2">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0">
                            {displayUser.image ? (
                                <img src={displayUser.image} alt={displayUser.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold text-lg bg-gray-100">
                                    {displayUser.name[0]}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex flex-col justify-center">
                            <div className="font-bold text-base leading-none mb-1 text-gray-900">{displayUser.name}</div>
                            <div className="text-sm text-gray-500 font-normal leading-none truncate">
                                {displayUser.handle || displayUser.email}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-2">
                    <div className="h-px bg-gray-100 w-full"></div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 space-y-1">
                    <div className="text-xs font-semibold text-muted-foreground px-4 py-2 mt-2">메인 메뉴</div>

                    <Button
                        variant={isActive('/design-lab/creator/campaign-search') ? "secondary" : "ghost"}
                        className="w-full justify-start font-medium"
                        onClick={() => router.push('/design-lab/creator/campaign-search')}
                    >
                        <Search className="mr-2 h-4 w-4" />
                        캠페인 찾기
                    </Button>

                    <Button
                        variant={isActive('/design-lab/creator/my-moments') ? "secondary" : "ghost"}
                        className="w-full justify-start font-medium"
                        onClick={() => router.push('/design-lab/creator/my-moments')}
                    >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        내 모먼트 관리
                    </Button>

                    <Button
                        variant={isActive('/design-lab/creator/workspace') ? "secondary" : "ghost"}
                        className="w-full justify-start font-medium"
                        onClick={() => router.push('/design-lab/creator/workspace')}
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        워크스페이스
                    </Button>

                    <div className="text-xs font-semibold text-muted-foreground px-4 py-2 mt-6">커뮤니케이션</div>

                    <Button
                        variant={isActive('/design-lab/creator/notifications') ? "secondary" : "ghost"}
                        className="w-full justify-start font-medium"
                        onClick={() => router.push('/design-lab/creator/notifications')}
                    >
                        <Bell className="mr-2 h-4 w-4" />
                        알림 센터
                    </Button>

                    <div className="text-xs font-semibold text-muted-foreground px-4 py-2 mt-6">설정</div>

                    <Button
                        variant={isActive('/design-lab/creator/profile') ? "secondary" : "ghost"}
                        className="w-full justify-start font-medium"
                        onClick={() => router.push('/design-lab/creator/profile')}
                    >
                        <User className="mr-2 h-4 w-4" />
                        프로필 & Rate Card
                    </Button>
                </nav>

                <div className="p-4 mt-auto">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <div className="text-xs font-bold text-blue-900 mb-1">Design Lab Mode</div>
                        <div className="text-[10px] text-blue-700">Creator Interface V2.0</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
