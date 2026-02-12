"use client"

import React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
    Briefcase,
    LayoutDashboard,
    Package,
    Search,
    User,
    Bell,
    FileText,
    LogOut,
    Menu,
    ShoppingBag
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface BrandSidebarProps {
    className?: string
    user?: { name: string, email: string }
}

export function DesignLabBrandSidebar({ className, user }: BrandSidebarProps) {
    const router = useRouter()
    const pathname = usePathname()

    // Determine active view based on path
    // Matching the logic: /design-lab/brand/moment-search -> 'moment-search'
    const currentPath = pathname?.split('/').pop() || ''

    const displayUser = user || { name: 'Voib', email: 'brand@voib.com' }

    return (
        <div className={cn("w-64 border-r bg-card hidden md:block h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto", className)}>
            <div className="p-6 space-y-6">
                {/* Profile Section - Exactly matches BrandSidebar */}
                <div className="flex items-center gap-4 py-2">
                    <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200 flex items-center justify-center">
                        <div className="font-serif font-bold text-xl text-gray-700">B</div>
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                        <div className="font-bold text-base leading-none mb-1 text-gray-900">{displayUser.name}</div>
                        <div className="text-sm text-gray-500 font-normal leading-none">{displayUser.email}</div>
                    </div>
                </div>

                {/* Navigation Menu - Matches visual style of BrandSidebar */}
                <nav className="space-y-1">
                    <Button
                        variant={currentPath === 'moment-search' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push('/design-lab/brand/moment-search')}
                    >
                        <Search className="mr-2 h-4 w-4" />
                        모먼트 검색
                    </Button>
                    <Button
                        variant={currentPath === 'my-campaigns' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push('/design-lab/brand/my-campaigns')}
                    >
                        <Briefcase className="mr-2 h-4 w-4" />
                        내 캠페인 관리
                    </Button>
                    <Button
                        variant={currentPath === 'workspace' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push('/design-lab/brand/workspace')}
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        협업 워크스페이스
                    </Button>
                    <Button
                        variant={currentPath === 'my-products' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push('/design-lab/brand/my-products')}
                    >
                        <Package className="mr-2 h-4 w-4" />
                        내 제품 관리
                    </Button>

                    {/* New items requested/implied for Design Lab but styling matches existing */}
                    <Button
                        variant={currentPath === 'browse-products' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push('/design-lab/brand/browse-products')}
                    >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        브랜드 제품 둘러보기
                    </Button>

                    <div className="pt-4 pb-2">
                        <div className="text-xs font-semibold text-muted-foreground px-4 mb-2">설정</div>
                        <Button
                            variant={currentPath === 'notifications' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => router.push('/design-lab/brand/notifications')}
                        >
                            <Bell className="mr-2 h-4 w-4" />
                            알림 센터
                        </Button>
                        <Button
                            variant={currentPath === 'profile' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => router.push('/design-lab/brand/profile')}
                        >
                            <User className="mr-2 h-4 w-4" />
                            브랜드 프로필
                        </Button>
                        <Button
                            variant={currentPath === 'billing' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => router.push('/design-lab/brand/billing')}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            결제 및 플랜
                        </Button>
                    </div>
                </nav>
            </div>
        </div>
    )
}
