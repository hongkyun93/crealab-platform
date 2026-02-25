"use client"

import { AccountDeleteDialog } from "@/components/account-delete-dialog"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { uploadFileViaAPI } from "@/lib/upload"
import { ArrowLeft, Camera } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export default function BrandSettingsPage() {
    const { user, updateUser } = useUnifiedProvider()
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [name, setName] = useState("")
    const [website, setWebsite] = useState("")
    const [bio, setBio] = useState("")
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

    useEffect(() => {
        if (user) {
            setName(user.name || "")
            setWebsite(user.website || "")
            setBio(user.bio || "")
            setAvatarUrl(user.avatar)
        }
    }, [user])

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user?.id) return
        setIsUploadingAvatar(true)
        try {
            const url = await uploadFileViaAPI(file, 'avatars', user.id)
            setAvatarUrl(url)
            await updateUser({ avatar: url })
            toast.success("프로필 이미지가 업데이트되었습니다.")
        } catch (err) {
            console.error('Avatar upload error:', err)
            toast.error("이미지 업로드에 실패했습니다.")
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    const handleSave = async () => {
        try {
            await updateUser({
                name,
                website,
                bio
            })
            toast.success("브랜드 정보가 저장되었습니다.")
            router.push("/brand")
        } catch (error) {
            console.error("Failed to save brand settings:", error)
            toast.error("저장에 실패했습니다. 다시 시도해주세요.")
        }
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-2xl px-6 md:px-8 mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/brand">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">브랜드 설정</h1>
                        <p className="text-muted-foreground">
                            크리에이터에게 보여질 브랜드 정보를 관리하세요.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>브랜드 프로필</CardTitle>
                        <CardDescription>
                            신뢰감을 줄 수 있는 정확한 정보를 입력해주세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center justify-center mb-6">
                            <Label className="mb-2">프로필 이미지</Label>
                            <div
                                className="relative w-[120px] h-[120px] rounded-full overflow-hidden cursor-pointer group border-2 border-border"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground">
                                        {name?.[0]?.toUpperCase() || 'B'}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                                {isUploadingAvatar && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            <p className="text-xs text-muted-foreground mt-2">클릭하여 이미지 변경</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">브랜드명</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={(e) => setName(e.target.value)}
                                autoComplete="off"
                                placeholder="브랜드 이름 입력"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">공식 웹사이트</Label>
                            <Input
                                id="website"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                onFocus={() => { if (!website) setWebsite("https://") }}
                                onBlur={() => { if (website === "https://") setWebsite("") }}
                                autoComplete="off"
                                placeholder="https://example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">브랜드 소개</Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                onBlur={(e) => setBio(e.target.value)}
                                autoComplete="off"
                                placeholder="브랜드의 비전과 가치를 설명해주세요. 크리에이터들이 참고하게 됩니다."
                                className="min-h-[120px]"
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <h3 className="text-sm font-medium mb-4 text-muted-foreground">계정 정보</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">이메일</Label>
                                    <Input
                                        id="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        이메일은 변경할 수 없습니다.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">역할</Label>
                                    <Input
                                        id="role"
                                        value={user?.role === 'brand' ? '브랜드' : user?.role === 'mcn' ? 'MCN' : user?.role === 'agency' ? '에이전시' : '크리에이터'}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        역할은 변경할 수 없습니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/brand">취소</Link>
                        </Button>
                        <Button onClick={handleSave}>저장하기</Button>
                    </CardFooter>
                </Card>

                {/* 위험 구역 */}
                <Card className="mt-6 border-destructive/30">
                    <CardHeader>
                        <CardTitle className="text-destructive text-base">위험 구역</CardTitle>
                        <CardDescription>
                            계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AccountDeleteDialog />
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
