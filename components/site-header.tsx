"use client"

import { useTeam } from "@/components/providers/team-provider"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { TeamSwitcher } from "@/components/team-switcher"
import { Button } from "@/components/ui/button"
import { useMobileSidebar } from "@/lib/hooks/use-mobile-sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/ui/mode-toggle"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import { Bell, Briefcase, Check, ChevronDown, LogOut, Menu, Plus, Settings, Shield, User, AlertCircle, CheckCircle2, MessageSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

export function SiteHeader() {
    const { user, messages, logout, notifications, markAsRead, teams, currentTeam, switchTeam } = useUnifiedProvider()
    const { isProxyMode, selectedMember } = useTeam() // Added useTeam hook
    const router = useRouter()
    const pathname = usePathname()
    const { toggle: toggleMobileSidebar } = useMobileSidebar()

    // Check if current route is a dashboard route that has a sidebar
    const isDashboardRoute = pathname?.startsWith('/brand') ||
        pathname?.startsWith('/creator') ||
        pathname?.startsWith('/mcn')

    const unreadNotifications = notifications?.filter(n => !n.is_read) || []

    const [activeTab, setActiveTab] = useState<'all' | 'action' | 'update' | 'message'>('action')

    const getNotificationStyle = (type: string) => {
        const actionTypes = [
            'contract_negotiating', 'content_revision', 'proposal_update', 'application_received'
        ]
        const successTypes = [
            'contract_signed', 'proposal_accepted', 'content_approved', 'collaboration_complete', 'collaboration_final_complete', 'deposit_confirmed', 'settlement_paid'
        ]

        if (actionTypes.includes(type)) {
            return { icon: <AlertCircle className="w-4 h-4 text-red-500" />, bg: "bg-red-50/50 dark:bg-red-900/10", border: "border-l-4 border-red-500" }
        } else if (successTypes.includes(type)) {
            return { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, bg: "bg-green-50/50 dark:bg-green-900/10", border: "border-l-4 border-green-500" }
        }
        return { icon: <MessageSquare className="w-4 h-4 text-muted-foreground" />, bg: "bg-transparent", border: "border-l-4 border-transparent" }
    }

    const isActionType = (type: string) => {
        if (user?.role === 'brand') {
            return [
                'application_received', 'application_updated',
                'contract_negotiating', 'shipping_address_saved',
                'performance_submitted', 'condition_confirmed'
            ].includes(type);
        } else if (user?.role === 'creator') {
            return [
                'proposal_received', 'moment_proposal',
                'proposal_update', 'contract_signed', 'shipping_started',
                'delivery_confirmed', 'content_revision', 'content_approved',
                'collaboration_complete'
            ].includes(type);
        }
        return false;
    };

    const isMessageType = (type: string) => {
        return ['new_message', 'feedback_received'].includes(type);
    };

    const actionNotifs = notifications?.filter(n => isActionType(n.type)) || [];
    const messageNotifs = notifications?.filter(n => isMessageType(n.type)) || [];
    const updateNotifs = notifications?.filter(n => !isActionType(n.type) && !isMessageType(n.type)) || [];

    const unreadActionCount = actionNotifs.filter(n => !n.is_read).length;
    const unreadMessageCount = messageNotifs.filter(n => !n.is_read).length;
    const unreadUpdateCount = updateNotifs.filter(n => !n.is_read).length;

    const filteredNotifications = notifications?.filter(n => {
        if (activeTab === 'all') return true;
        if (activeTab === 'action') return isActionType(n.type);
        if (activeTab === 'message') return isMessageType(n.type);
        if (activeTab === 'update') return !isActionType(n.type) && !isMessageType(n.type);
        return true;
    }) || []

    // Display logic for MCN proxy mode
    const displayUserType = () => {
        if (user?.role === 'mcn' && isProxyMode && selectedMember) {
            return `크리에이터 (${selectedMember.profile?.display_name || selectedMember.profile?.email || 'Unknown'})`
        }
        return user?.role === 'brand' ? '브랜드'
            : user?.role === 'creator' ? '크리에이터'
                : user?.role === 'mcn' ? 'MCN'
                    : user?.role === 'agency' ? '에이전시'
                        : '관리자'
    }

    const handleNotificationClick = (n: any) => {
        // markAsRead는 백그라운드에서 실행 — 라우팅을 블로킹하지 않음
        if (!n.is_read) {
            markAsRead(n.id).catch(e => console.warn('markAsRead 실패 (무시):', e))
        }

        console.log('[알림 클릭]', { type: n.type, reference_id: n.reference_id, user_role: user?.role, action_url: n.action_url })

        // 1. action_url이 있으면 최우선으로 해당 링크로 이동
        if (n.action_url) {
            router.push(n.action_url)
            return
        }

        const brandActive = `/brand?view=proposals&workspaceTab=active&proposalId=${n.reference_id}`
        const brandInbound = `/brand?view=proposals&workspaceTab=inbound&proposalId=${n.reference_id}`
        // 크리에이터: 알림 type에 따라 탭 결정
        const creatorInbound = `/creator?view=proposals&workspaceTab=inbound&proposalId=${n.reference_id}`   // 받은 제안
        const creatorOutbound = `/creator?view=proposals&workspaceTab=outbound&proposalId=${n.reference_id}` // 보낸 제안
        const creatorActive = `/creator?view=proposals&workspaceTab=active&proposalId=${n.reference_id}`     // 진행중

        switch (n.type) {
            // ── 공통: 제안 수신/수락/거절/조건/계약 ──
            case 'proposal_received':
            case 'moment_proposal':
                // 브랜드가 크리에이터에게 직접 제안 → 받은제안 탭
                if (user?.role === 'creator') router.push(creatorInbound)
                else if (user?.role === 'brand') router.push(brandInbound)
                break

            case 'proposal_rejected':
            case 'contract_rejected':
                // 크리에이터가 지원/계약한 것에 대한 거절 → 보낸제안 탭 (기록용)
                if (user?.role === 'creator') router.push(creatorOutbound)
                else if (user?.role === 'brand') router.push(brandInbound)
                break

            case 'condition_confirmed':
            case 'contract_negotiating':
                // 조건/계약 조율 & 확정 → 진행중 탭 (Active)
                if (user?.role === 'creator') router.push(creatorActive)
                else if (user?.role === 'brand') router.push(brandActive)
                break

            case 'contract_signed':
            case 'proposal_accepted':
                // 협업 확정 → 진행중 탭
                if (user?.role === 'creator') router.push(creatorActive)
                else if (user?.role === 'brand') router.push(brandActive)
                break

            // ── 브랜드 수신: 크리에이터 지원/업데이트 ──
            case 'application_received':
                router.push(brandInbound)
                break

            case 'application_updated':
                // 크리에이터가 지원서 수정 → 브랜드가 받는 알림
                router.push(brandInbound)
                break

            // ── 브랜드 수신: 협업 진행 중 이벤트 ──
            case 'shipping_address_saved':
            case 'delivery_confirmed':
            case 'content_submission':
            case 'content_final_uploaded':
            case 'content_clean_uploaded':
            case 'performance_submitted':
                router.push(brandActive)
                break

            // ── 메시지 ──
            case 'new_message':
                if (user?.role === 'creator') {
                    if (n.reference_id) router.push(`${creatorActive}&proposalId=${n.reference_id}`)
                    else router.push(creatorActive)
                } else if (user?.role === 'brand') {
                    if (n.reference_id) router.push(`${brandActive}&proposalId=${n.reference_id}`)
                    else router.push(brandActive)
                }
                break

            // ── 크리에이터 수신: 브랜드 액션 (진행중) ──
            case 'shipping_started':
            case 'content_revision':
            case 'content_approved':
            case 'feedback_received':
            case 'proposal_update':
                router.push(creatorActive)
                break

            case 'collaboration_complete':
            case 'collaboration_final_complete':
                router.push(`/creator?view=settlement&proposalId=${n.reference_id}`)
                break

            // ── 정산/입금 ──
            case 'settlement_paid':
                if (user?.role === 'creator') router.push('/creator?view=settlement')
                else if (user?.role === 'mcn' || user?.role === 'agency') router.push('/mcn')
                break

            case 'payment_confirmed':
            case 'deposit_confirmed':
                if (user?.role === 'brand') router.push('/brand?view=deposit')
                else if (user?.role === 'creator') router.push('/creator?view=settlement')
                break

            case 'payment_pending':
                router.push('/brand?view=deposit')
                break

            default:
                // 처리되지 않은 타입: 역할별 기본 페이지로
                if (user?.role === 'brand') router.push('/brand?view=proposals')
                else if (user?.role === 'creator') router.push('/creator?view=proposals')
                break
        }
    }

    const handleLogout = async () => {
        await logout()
        // No router.push here - AuthProvider does hard redirect
    }

    const handleProfileClick = () => {
        if (user?.role === 'brand') router.push('/brand?view=settings')
        else if (user?.role === 'mcn' || user?.role === 'agency') router.push('/mcn')
        else router.push('/creator?view=settings')
    }

    const isActive = (path: string) => pathname?.startsWith(path)

    return (
        <header className="sticky top-0 z-[60] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center max-w-[1920px] px-3 sm:px-6 md:px-8">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-3 sm:mr-6 flex items-center space-x-2">
                        <Image src="/logo.png" alt="CreadyPick" width={238} height={48} className="h-12 w-auto" priority />
                        <span className="hidden md:inline-block text-[10px] font-bold text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full dark:text-primary dark:bg-primary/20">V5.1.2</span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/services"
                            className={`transition-colors hover:text-foreground/80 ${isActive('/services') ? 'text-foreground font-semibold' : 'text-foreground/60'}`}
                        >
                            서비스 소개
                        </Link>

                        {(!user || user.role === 'brand' || user.role === 'admin') && (
                            <Link
                                href="/brand"
                                className={`transition-colors hover:text-foreground/80 ${isActive('/brand') ? 'text-foreground font-semibold' : 'text-foreground/60'}`}
                            >
                                브랜드
                            </Link>
                        )}

                        {(!user || user.role === 'creator' || user.role === 'mcn' || user.role === 'agency' || user.role === 'admin') && (
                            <Link
                                href={user?.role === 'mcn' || user?.role === 'agency' ? '/mcn' : '/creator'}
                                className={`transition-colors hover:text-foreground/80 ${(isActive('/creator') || isActive('/mcn')) ? 'text-foreground font-semibold' : 'text-foreground/60'}`}
                            >
                                {(user?.role === 'mcn' || user?.role === 'agency') ? 'MCN 관리' : '크리에이터'}
                            </Link>
                        )}

                        <Link
                            href="/message"
                            className={`relative transition-colors hover:text-foreground/80 ${isActive('/message') ? 'text-foreground font-semibold' : 'text-foreground/60'}`}
                        >
                            메시지
                            {user && messages.filter(m => m.receiverId === user.id && !m.read).length > 0 && (
                                <span className="absolute -top-1 -right-2 h-2 w-2 bg-red-500 rounded-full border border-background"></span>
                            )}
                        </Link>

                    </nav>

                    {/* Mobile Menu */}
                    <div className="md:hidden flex items-center">
                        {isDashboardRoute ? (
                            <Button variant="ghost" size="icon" className="-ml-2" onClick={toggleMobileSidebar}>
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">사이드바 열기</span>
                            </Button>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="-ml-2">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">메뉴 열기</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-[200px]">
                                    <DropdownMenuItem asChild>
                                        <Link href="/services" className="w-full">서비스 소개</Link>
                                    </DropdownMenuItem>
                                    {(!user || user.role === 'brand' || user.role === 'admin') && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/brand" className="w-full">브랜드</Link>
                                        </DropdownMenuItem>
                                    )}
                                    {(!user || user.role === 'creator' || user.role === 'mcn' || user.role === 'agency' || user.role === 'admin') && (
                                        <DropdownMenuItem asChild>
                                            <Link href={(user?.role === 'mcn' || user?.role === 'agency') ? '/mcn' : '/creator'} className="w-full">{(user?.role === 'mcn' || user?.role === 'agency') ? 'MCN 관리' : '크리에이터'}</Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href="/message" className="w-full flex justify-between">
                                            메시지
                                            {user && messages.filter(m => m.receiverId === user.id && !m.read).length > 0 && (
                                                <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                                            )}
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
                <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
                    <ModeToggle />
                    {user ? (
                        <div className="flex items-center gap-4">
                            {/* Team Switcher - Hidden for Creators */}
                            {teams && teams.length > 0 && user.role !== 'creator' && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 max-w-[200px]">
                                            {currentTeam?.logo_url ? (
                                                <img src={currentTeam.logo_url} alt={currentTeam.name} className="w-5 h-5 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                    {currentTeam?.name?.[0] || <Briefcase className="h-3 w-3" />}
                                                </div>
                                            )}
                                            <span className="truncate flex-1 text-left">{currentTeam?.name || "팀 선택"}</span>
                                            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[240px]">
                                        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">팀 전환</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {teams.filter((t: any) => ['owner', 'admin', 'manager'].includes(t.my_role)).map((team: any) => (
                                            <DropdownMenuItem key={team.id} onSelect={() => switchTeam(team.id)} className="cursor-pointer">
                                                <div className="flex items-center gap-2 w-full">
                                                    {team.logo_url ? (
                                                        <img src={team.logo_url} alt={team.name} className="w-6 h-6 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                            {team.name?.[0]}
                                                        </div>
                                                    )}
                                                    <span className={`truncate flex-1 ${team.id === currentTeam?.id ? "font-bold" : ""}`}>{team.name}</span>
                                                    {team.id === currentTeam?.id && <Check className="ml-auto h-4 w-4 text-primary" />}
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={() => router.push('/settings/team')} className="cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            팀 관리
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => router.push('/settings/team')} className="cursor-pointer">
                                            <Plus className="mr-2 h-4 w-4" />
                                            새 팀 만들기
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                            {/* Notification Bell */}
                            <Popover modal={false}>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative text-foreground/60 hover:text-foreground">
                                        <Bell className="h-5 w-5" />
                                        {unreadNotifications.length > 0 && (
                                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-background" />
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0" align="end">
                                    <div className="p-4 font-semibold border-b flex justify-between items-center bg-muted/30">
                                        <span>알림센터</span>
                                        {unreadNotifications.length > 0 && (
                                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                                                {unreadNotifications.length} NEW
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex border-b text-sm font-medium">
                                        <button
                                            onClick={() => setActiveTab('action')}
                                            className={`flex-1 py-2.5 text-center transition-colors relative ${activeTab === 'action' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            할 일 {unreadActionCount > 0 && <span className="ml-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadActionCount}</span>}
                                            {activeTab === 'action' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('update')}
                                            className={`flex-1 py-2.5 text-center transition-colors relative ${activeTab === 'update' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            업데이트 {unreadUpdateCount > 0 && <span className="ml-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadUpdateCount}</span>}
                                            {activeTab === 'update' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('message')}
                                            className={`flex-1 py-2.5 text-center transition-colors relative ${activeTab === 'message' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            메시지 {unreadMessageCount > 0 && <span className="ml-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadMessageCount}</span>}
                                            {activeTab === 'message' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('all')}
                                            className={`flex-1 py-2.5 text-center transition-colors relative ${activeTab === 'all' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            전체보기
                                            {activeTab === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                                        </button>
                                    </div>
                                    <div className="max-h-[350px] overflow-y-auto">
                                        {filteredNotifications.length > 0 ? (
                                            <div className="divide-y divide-muted/50">
                                                {filteredNotifications.map((n) => {
                                                    const style = getNotificationStyle(n.type)
                                                    return (
                                                        <div
                                                            key={n.id}
                                                            className={`p-4 text-sm hover:bg-muted/50 cursor-pointer transition-colors flex gap-3 ${!n.is_read ? style.bg : ''} ${style.border}`}
                                                            onClick={() => handleNotificationClick(n)}
                                                        >
                                                            <div className="mt-0.5 shrink-0">
                                                                {style.icon}
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <div className={`font-medium leading-snug ${!n.is_read ? 'text-foreground' : 'text-foreground/80'}`}>
                                                                    {n.content}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground font-medium">
                                                                    {new Date(n.created_at).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                            {!n.is_read && (
                                                                <div className="shrink-0 mt-1.5">
                                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-10 text-center flex flex-col items-center justify-center text-muted-foreground">
                                                <Bell className="w-8 h-8 opacity-20 mb-3" />
                                                <p className="text-sm font-medium">새로운 알림이 없습니다.</p>
                                            </div>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {user.role === 'admin' && (
                                <Link
                                    href="/admin"
                                    className="text-xs font-bold bg-red-500 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors"
                                >
                                    관리자 패널
                                </Link>
                            )}

                            {/* MCN Team Switcher */}
                            {user.role === 'mcn' && <TeamSwitcher />}

                            <span className="text-sm text-muted-foreground hidden md:flex items-center">
                                환영합니다, <span className="text-primary font-bold mr-1 mx-1">{displayUserType()}</span> <span className="font-semibold text-foreground truncate max-w-[100px] lg:max-w-[200px]">{user.name}</span>님
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                user.name[0]
                                            )}
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => router.push(user.role === 'brand' ? '/brand' : '/creator?view=profile')} className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        프로필 보기
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleProfileClick} className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        프로필 설정
                                    </DropdownMenuItem>
                                    {user.role === 'admin' && (
                                        <DropdownMenuItem onSelect={() => router.push('/admin')} className="cursor-pointer font-bold text-red-600">
                                            <Shield className="mr-2 h-4 w-4" />
                                            관리자 패널
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        로그아웃
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 animate-in fade-in duration-300">
                            <Button variant="default" size="sm" asChild>
                                <Link href="/login">로그인 / 회원가입</Link>
                            </Button>
                        </div>
                    )}
                </div >
            </div >
        </header >
    )
}
