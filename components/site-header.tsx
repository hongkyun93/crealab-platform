"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePlatform } from "@/components/providers/platform-provider"
import { LogOut, Settings, User, Shield, Menu } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter, usePathname } from "next/navigation"
import { Bell } from "lucide-react"

export function SiteHeader() {
    const { user, messages, logout, notifications, markAsRead } = usePlatform()
    const router = useRouter()
    const pathname = usePathname()

    const unreadNotifications = notifications?.filter(n => !n.is_read) || []

    const handleNotificationClick = async (n: any) => {
        if (!n.is_read) {
            await markAsRead(n.id)
        }

        // Redirect Logic based on Notification Type
        if (n.type === 'proposal_received' || n.type === 'proposal_accepted' || n.type === 'condition_confirmed' || n.type === 'contract_signed') {
            // Check user role to determine destination
            // If user is influencer, go to Creator Dashboard
            // If user is brand, go to Brand Dashboard
            // However, the notification is specific to the recipient.

            if (user?.type === 'influencer') {
                router.push(`/creator?view=proposals&proposalId=${n.reference_id}`)
            } else if (user?.type === 'brand') {
                router.push(`/brand?view=inbound&proposalId=${n.reference_id}`)
            }
        } else if (n.type === 'application_received') {
            // Brand received an application
            router.push(`/brand?view=outbound&proposalId=${n.reference_id}`)
        } else if (n.type === 'new_message') {
            // Generic message redirect - ideally should link to chat
            if (user?.type === 'influencer') {
                router.push(`/creator?view=inbound&proposalId=${n.reference_id}`)
            } else if (user?.type === 'brand') {
                router.push(`/brand?view=inbound&proposalId=${n.reference_id}`)
            }
        }
    }

    const handleLogout = async () => {
        await logout()
        router.push("/")
    }

    const handleProfileClick = () => {
        if (user?.type === 'brand') router.push('/brand?view=settings')
        else router.push('/creator?view=settings')
    }

    const isActive = (path: string) => pathname?.startsWith(path)

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center max-w-[1920px] px-6 md:px-8">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="font-bold text-xl tracking-tight">CreadyPick.</span>
                        <span className="text-[10px] font-bold text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full">V1.7.2</span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/services"
                            className={`transition-colors hover:text-foreground/80 ${isActive('/services') ? 'text-foreground font-semibold' : 'text-foreground/60'}`}
                        >
                            서비스 소개
                        </Link>

                        {(!user || user.type === 'brand' || user.type === 'admin') && (
                            <Link
                                href="/brand"
                                className={`transition-colors hover:text-foreground/80 ${isActive('/brand') ? 'text-foreground font-semibold' : 'text-foreground/60'}`}
                            >
                                브랜드
                            </Link>
                        )}

                        {(!user || user.type === 'influencer' || user.type === 'admin') && (
                            <Link
                                href="/creator"
                                className={`transition-colors hover:text-foreground/80 ${isActive('/creator') ? 'text-foreground font-semibold' : 'text-foreground/60'}`}
                            >
                                크리에이터
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
                                {(!user || user.type === 'brand' || user.type === 'admin') && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/brand" className="w-full">브랜드</Link>
                                    </DropdownMenuItem>
                                )}
                                {(!user || user.type === 'influencer' || user.type === 'admin') && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/creator" className="w-full">크리에이터</Link>
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
                    </div>
                </div>
                <div className="ml-auto flex items-center space-x-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {/* Notification Bell */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative text-foreground/60 hover:text-foreground">
                                        <Bell className="h-5 w-5" />
                                        {unreadNotifications.length > 0 && (
                                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-background" />
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0" align="end">
                                    <div className="p-4 font-semibold border-b flex justify-between items-center">
                                        <span>알림</span>
                                        {unreadNotifications.length > 0 && (
                                            <span className="text-xs text-muted-foreground">{unreadNotifications.length}개의 읽지 않은 알림</span>
                                        )}
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications && notifications.length > 0 ? (
                                            <div className="divide-y">
                                                {notifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        className={`p-4 text-sm hover:bg-muted/50 cursor-pointer transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                                                        onClick={() => handleNotificationClick(n)}
                                                    >
                                                        <div className="font-medium mb-1">{n.content}</div>
                                                        <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-muted-foreground text-sm">
                                                새로운 알림이 없습니다.
                                            </div>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {user.type === 'admin' && (
                                <Link
                                    href="/admin"
                                    className="text-xs font-bold bg-red-500 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors"
                                >
                                    관리자 패널
                                </Link>
                            )}
                            <span className="text-sm text-muted-foreground hidden md:inline-block">
                                환영합니다, <span className="text-primary font-bold mr-1">{user.type === 'brand' ? '브랜드' : user.type === 'influencer' ? '크리에이터' : '관리자'}</span> <span className="font-semibold text-foreground">{user.name}</span>님
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
                                    <DropdownMenuItem onSelect={() => router.push(user.type === 'brand' ? '/brand' : '/creator?view=profile')} className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        프로필 보기
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleProfileClick} className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        프로필 설정
                                    </DropdownMenuItem>
                                    {user.type === 'admin' && (
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
                            <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                                <Link href="/login">로그인</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/login">무료로 시작하기</Link>
                            </Button>
                        </div>
                    )}
                </div >
            </div >
        </header >
    )
}
