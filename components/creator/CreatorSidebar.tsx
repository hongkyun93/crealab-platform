"use client"

import React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
    LayoutDashboard,
    MessageSquare,
    Search,
    User,
    Settings,
    FileText,
    Image as ImageIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { WorkspaceProgressBar } from "@/components/workspace-progress-bar"

interface CreatorSidebarProps {
    className?: string
    user?: {
        name: string
        email: string
        handle?: string
        image?: string
    }
}

export function CreatorSidebar({ className, user }: CreatorSidebarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Determine active view based on URL params or path
    const currentView = searchParams.get('view') || 'dashboard'

    const displayUser = user || { name: '크리에이터', email: 'creator@example.com', handle: '@creator', image: '' }

    return (
        <div className={cn("w-64 border-r bg-card hidden md:block h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto", className)}>
            <div className="p-6 space-y-6">
                {/* Profile Section */}
                <div className="flex items-center gap-4 py-2">
                    <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0">
                        {displayUser.image ? (
                            <img src={displayUser.image} alt={displayUser.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold text-lg">
                                {displayUser.name[0]}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                        <div className="font-bold text-base leading-none mb-1 text-gray-900">{displayUser.name}</div>
                        <div className="text-sm text-gray-500 font-normal leading-none">
                            {displayUser.handle || displayUser.email}
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="space-y-1">
                    <Button
                        variant={currentView === 'dashboard' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push('/creator?view=dashboard')}
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        대시보드
                    </Button>
                    <Button
                        variant={currentView === 'moments' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push('/creator?view=moments')}
                    >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        내 모먼트 관리
                    </Button>
                    <Button
                        variant={currentView === 'campaigns' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push('/creator?view=campaigns')}
                    >
                        <Search className="mr-2 h-4 w-4" />
                        캠페인 찾기
                    </Button>
                    <Button
                        variant={currentView === 'applications' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push('/creator?view=applications')}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        지원 현황
                    </Button>
                    <Button
                        variant={currentView === 'inbound' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push('/creator?view=inbound')}
                    >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        받은 제안
                    </Button>

                    <div className="pt-4 pb-2">
                        <div className="text-xs font-semibold text-muted-foreground px-4 mb-2">설정</div>
                        <Button
                            variant={currentView === 'profile' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => router.push('/creator?view=profile')}
                        >
                            <User className="mr-2 h-4 w-4" />
                            프로필 설정
                        </Button>
                        <Button
                            variant={currentView === 'settings' ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => router.push('/creator?view=settings')}
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            계정 설정
                        </Button>
                    </div>
                </nav>
            </div>
        </div>
    )
}
