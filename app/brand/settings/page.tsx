"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePlatform } from "@/components/providers/legacy-platform-hook"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AvatarUpload } from "@/components/ui/avatar-upload"

export default function BrandSettingsPage() {
    const { user, updateUser } = usePlatform()
    const router = useRouter()

    const [name, setName] = useState("")
    const [website, setWebsite] = useState("")
    const [bio, setBio] = useState("")

    useEffect(() => {
        if (user) {
            setName(user.name || "")
            setWebsite(user.website || "")
            setBio(user.bio || "")
        }
    }, [user])

    const handleSave = async () => {
        try {
            await updateUser({
                name,
                website,
                bio
            })
            alert("브랜드 정보가 저장되었습니다.")
            router.push("/brand")
        } catch (error) {
            console.error("Failed to save brand settings:", error)
            alert("저장에 실패했습니다. 다시 시도해주세요.")
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
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center justify-center mb-6">
                            <Label className="mb-2">프로필 이미지</Label>
                            <AvatarUpload
                                uid={user?.id || "brand"}
                                url={user?.avatar}
                                onUpload={async (url) => {
                                    // Immediate update
                                    await updateUser({ avatar: url })
                                }}
                                size={120}
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
                                onBlur={(e) => setWebsite(e.target.value)}
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
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/brand">취소</Link>
                        </Button>
                        <Button onClick={handleSave}>저장하기</Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    )
}
