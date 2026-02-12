"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
    Briefcase,
    Globe,
    LayoutDashboard,
    MessageSquare,
    Package,
    Search,
    User,
    Settings,
    Bell,
    FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { WorkspaceProgressBar } from "@/components/workspace-progress-bar"

interface BrandSidebarProps {
    className?: string
    user?: { name: string, email: string }
}

export function BrandSidebar({ className, user }: BrandSidebarProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Determine active view based on URL params or path
    const currentView = searchParams.get('view') || 'discover'

    const displayUser = user || { name: '브랜드', email: '브랜드 계정' }

    return (
        <div className={cn("w-64 border-r bg-card hidden md:block h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto", className)}>
            <div className="p-6 space-y-6">
                {/* Profile Section */}
                <div className="flex items-center gap-4 py-2">
                    <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200 flex items-center justify-center">
                        {/* Brand Avatar Placeholder or Image if we add it later */}
                        <div className="font-serif font-bold text-xl text-gray-700">B</div>
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                        <div className="font-bold text-base leading-none mb-1 text-gray-900">{displayUser.name}</div>
                        <div className="text-sm text-gray-500 font-normal leading-none">{displayUser.email}</div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="space-y-1">
                    <Button
                        variant={currentView === 'discover' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push('/brand?view=discover')}
                    >
                        <Search className="mr-2 h-4 w-4" />
                        크리에이터 찾기
                    </Button>
                    <Button
                        variant={currentView === 'my-campaigns' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push('/brand?view=my-campaigns')}
                    >
                        <Briefcase className="mr-2 h-4 w-4" />
                        내 캠페인 관리
                    </Button>
                    <Button
                        variant={currentView === 'workspace' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push('/brand?view=workspace')}
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        협업 워크스페이스
                    </Button>
                    <Button
                        variant={currentView === 'products' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push('/brand?view=products')}
                    >
                        <Package className="mr-2 h-4 w-4" />
                        내 제품 관리
                    </Button>
                    <div className="pt-4 pb-2">
                        <div className="text-xs font-semibold text-muted-foreground px-4 mb-2">설정</div>
                        <Button
                            variant={currentView === 'profile' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => router.push('/brand?view=profile')}
                        >
                            <User className="mr-2 h-4 w-4" />
                            브랜드 프로필
                        </Button>
                        <Button
                            variant={currentView === 'billing' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => router.push('/brand?view=billing')}
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
