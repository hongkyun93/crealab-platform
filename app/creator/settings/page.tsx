"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePlatform } from "@/components/providers/platform-provider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AvatarUpload } from "@/components/ui/avatar-upload"

export default function CreatorSettingsPage() {
    const { user, updateUser } = usePlatform()
    const router = useRouter()

    const [name, setName] = useState("")
    const [handle, setHandle] = useState("")
    const [bio, setBio] = useState("")

    // Additional Creator Fields (Optional but good to have)
    // For now stick to basic profile info requested.

    useEffect(() => {
        if (user) {
            setName(user.name || "")
            setHandle(user.handle || "")
            setBio(user.bio || "")
        }
    }, [user])

    const handleSave = async () => {
        try {
            await updateUser({
                name,
                handle, // Assuming handle is editable for internal use or display
                bio
            })
            alert("프로필 정보가 저장되었습니다.")
            router.push("/creator")
        } catch (error) {
            console.error("Failed to save creator settings:", error)
            alert("저장에 실패했습니다. 다시 시도해주세요.")
        }
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-2xl px-6 md:px-8 mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/creator">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">프로필 설정</h1>
                        <p className="text-muted-foreground">
                            브랜드에게 보여질 나의 프로필 정보를 관리하세요.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>기본 정보</CardTitle>
                        <CardDescription>
                            나를 표현하는 매력적인 프로필 사진과 소개를 등록해보세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Profile Picture Upload */}
                        <div className="flex flex-col items-center justify-center mb-6">
                            <Label className="mb-2">프로필 이미지</Label>
                            <AvatarUpload
                                uid={user?.id || "creator"}
                                url={user?.avatar}
                                onUpload={async (url) => {
                                    await updateUser({ avatar: url })
                                }}
                                size={120}
                            />
                            <p className="text-xs text-muted-foreground mt-2">클릭하여 이미지 변경</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">이름 (닉네임)</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="off"
                                placeholder="활동명을 입력해주세요"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="handle">인스타그램 ID</Label>
                            <Input
                                id="handle"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                autoComplete="off"
                                placeholder="@username"
                            />
                            <p className="text-xs text-muted-foreground">
                                ※ 실제 인스타그램 계정과 연동된 ID는 변경되지 않을 수 있습니다.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">자기소개</Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                autoComplete="off"
                                placeholder="브랜드에게 나를 어필할 수 있는 짧은 소개를 적어주세요."
                                className="min-h-[120px]"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/creator">취소</Link>
                        </Button>
                        <Button onClick={handleSave}>저장하기</Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    )
}
