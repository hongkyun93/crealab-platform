"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePlatform } from "@/components/providers/platform-provider"
import { LogOut, Settings, User } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation"

export function SiteHeader() {
    const { user, messages, logout } = usePlatform()
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = async () => {
        await logout()
        router.push("/")
    }

    const handleProfileClick = () => {
        if (user?.type === 'brand') router.push('/brand?view=settings')
        else router.push('/influencer?view=settings')
    }

    const isActive = (path: string) => pathname?.startsWith(path)

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center max-w-[1920px] px-6 md:px-8">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="font-bold text-xl tracking-tight">Crealab.</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/services"
                            className={`transition-colors hover:text-foreground/80 ${isActive('/services') ? 'text-foreground font-semibold' : 'text-foreground/60'}`}
                        >
                            서비스 소개
                        </Link>
                        <Link
                            href="/brand"
                            className={`transition-colors hover:text-foreground/80 ${isActive('/brand') ? 'text-foreground font-semibold' : 'text-foreground/60'}`}
                        >
                            브랜드
                        </Link>
                        <Link
                            href="/influencer"
                            className={`transition-colors hover:text-foreground/80 ${isActive('/influencer') ? 'text-foreground font-semibold' : 'text-foreground/60'}`}
                        >
                            크리에이터
                        </Link>
                        {user && (
                            <Link
                                href="/message"
                                className={`relative transition-colors hover:text-foreground/80 ${isActive('/message') ? 'text-foreground font-semibold' : 'text-foreground/60'}`}
                            >
                                메시지
                                {messages.filter(m => m.receiverId === user.id && !m.read).length > 0 && (
                                    <span className="absolute -top-1 -right-2 h-2 w-2 bg-red-500 rounded-full border border-background"></span>
                                )}
                            </Link>
                        )}
                    </nav>
                </div>
                <div className="ml-auto flex items-center space-x-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden md:inline-block">
                                환영합니다, <span className="font-semibold text-foreground">{user.name}</span>님
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
                                    <DropdownMenuItem onSelect={() => router.push(user.type === 'brand' ? '/brand' : '/influencer?view=profile')} className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        프로필 보기
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleProfileClick} className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        프로필 설정
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        로그아웃
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login">로그인</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/signup">무료로 시작하기</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
