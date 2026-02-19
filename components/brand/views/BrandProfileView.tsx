"use client"

import React from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AvatarUpload } from "@/components/ui/avatar-upload"
import { useUnifiedProvider } from "@/components/providers/unified-provider"

interface BrandProfileViewProps {
    user: any
    isSaving: boolean
    editName: string
    setEditName: (value: string) => void
    editWebsite: string
    setEditWebsite: (value: string) => void
    editPhone: string
    setEditPhone: (value: string) => void
    editAddress: string
    setEditAddress: (value: string) => void
    editBio: string
    setEditBio: (value: string) => void
    handleSaveProfile: () => void
    updateUser: (data: any) => Promise<void>
    switchRole: (role: string) => Promise<void>
    refreshData?: () => void
}

export const BrandProfileView = React.memo(function BrandProfileView({
    user,
    isSaving,
    editName,
    setEditName,
    editWebsite,
    setEditWebsite,
    editPhone,
    setEditPhone,
    editAddress,
    setEditAddress,
    editBio,
    setEditBio,
    handleSaveProfile,
    updateUser,
    switchRole
}: BrandProfileViewProps) {
    const { supabase } = useUnifiedProvider()

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h1 className="text-3xl font-bold tracking-tight">브랜드 설정</h1>
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>브랜드 프로필</CardTitle>
                    <CardDescription>크리에이터에게 보여질 브랜드 정보를 관리합니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center justify-center mb-6">
                        <Label className="mb-2">프로필 이미지</Label>
                        <AvatarUpload
                            uid={user?.id || "brand"}
                            url={user?.avatar}
                            onUpload={async (url) => {
                                await updateUser({ avatar: url })
                            }}
                            size={120}
                        />
                        <p className="text-xs text-muted-foreground mt-2">클릭하여 이미지 변경</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="b-name">브랜드명</Label>
                        <Input id="b-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="b-web">공식 웹사이트</Label>
                        <Input
                            id="b-web"
                            value={editWebsite}
                            onChange={(e) => setEditWebsite(e.target.value)}
                            onFocus={() => { if (!editWebsite) setEditWebsite("https://") }}
                            onBlur={() => { if (editWebsite === "https://") setEditWebsite("") }}
                            placeholder="https://"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="b-phone">대표 연락처</Label>
                        <Input id="b-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="02-0000-0000" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="b-address">브랜드 주소</Label>
                        <Input id="b-address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="서울시 강남구..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="b-bio">브랜드 소개</Label>
                        <Textarea id="b-bio" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="브랜드의 비전과 가치를 설명해주세요." className="min-h-[120px]" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "저장하기"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
})
