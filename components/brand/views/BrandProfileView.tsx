"use client"

import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { AvatarUpload } from "@/components/ui/avatar-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import React from "react"

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
    // Brand Business Fields
    editRepresentativeName: string; setEditRepresentativeName: (v: string) => void
    editBusinessNumber: string; setEditBusinessNumber: (v: string) => void
    editCompanyAddress: string; setEditCompanyAddress: (v: string) => void
    editCompanyPhone: string; setEditCompanyPhone: (v: string) => void
    editTaxEmail: string; setEditTaxEmail: (v: string) => void
    editBusinessCategory: string; setEditBusinessCategory: (v: string) => void
    editBusinessType: string; setEditBusinessType: (v: string) => void
    editContactPersonName: string; setEditContactPersonName: (v: string) => void
    editContactPersonPhone: string; setEditContactPersonPhone: (v: string) => void
    editContactPersonEmail: string; setEditContactPersonEmail: (v: string) => void
    // Bank fields (3 separate)
    editBankName: string; setEditBankName: (v: string) => void
    editAccountNumber: string; setEditAccountNumber: (v: string) => void
    editAccountHolder: string; setEditAccountHolder: (v: string) => void
    handleSaveProfile: () => void
    updateUser: (data: any) => Promise<void>
    switchRole: (role: string) => Promise<void>
    refreshData?: () => void
}

export const BrandProfileView = React.memo(function BrandProfileView({
    user,
    isSaving,
    editName, setEditName,
    editWebsite, setEditWebsite,
    editPhone, setEditPhone,
    editAddress, setEditAddress,
    editBio, setEditBio,
    editRepresentativeName, setEditRepresentativeName,
    editBusinessNumber, setEditBusinessNumber,
    editCompanyAddress, setEditCompanyAddress,
    editCompanyPhone, setEditCompanyPhone,
    editTaxEmail, setEditTaxEmail,
    editBusinessCategory, setEditBusinessCategory,
    editBusinessType, setEditBusinessType,
    editContactPersonName, setEditContactPersonName,
    editContactPersonPhone, setEditContactPersonPhone,
    editContactPersonEmail, setEditContactPersonEmail,
    editBankName, setEditBankName,
    editAccountNumber, setEditAccountNumber,
    editAccountHolder, setEditAccountHolder,
    handleSaveProfile,
    updateUser,
    switchRole
}: BrandProfileViewProps) {
    const { supabase } = useUnifiedProvider()

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h1 className="text-3xl font-bold tracking-tight">브랜드 설정</h1>

            {/* Card 1: 기본 프로필 */}
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
            </Card>

            {/* Card 2: 사업자 정보 */}
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>사업자 정보</CardTitle>
                    <CardDescription>계약서 생성 및 세금계산서 발행에 사용됩니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="b-rep">대표자명</Label>
                            <Input id="b-rep" value={editRepresentativeName} onChange={(e) => setEditRepresentativeName(e.target.value)} placeholder="홍길동" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="b-biz-num">사업자 등록번호</Label>
                            <Input id="b-biz-num" value={editBusinessNumber} onChange={(e) => setEditBusinessNumber(e.target.value)} placeholder="000-00-00000" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="b-biz-type">사업자 유형</Label>
                            <Input id="b-biz-type" value={editBusinessType} onChange={(e) => setEditBusinessType(e.target.value)} placeholder="법인 / 개인사업자" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="b-biz-cat">업태 / 업종</Label>
                            <Input id="b-biz-cat" value={editBusinessCategory} onChange={(e) => setEditBusinessCategory(e.target.value)} placeholder="서비스업 / 광고업" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="b-comp-addr">회사 주소 (계약서용)</Label>
                        <Input id="b-comp-addr" value={editCompanyAddress} onChange={(e) => setEditCompanyAddress(e.target.value)} placeholder="서울시 강남구 테헤란로 000" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="b-comp-phone">회사 전화번호</Label>
                        <Input id="b-comp-phone" value={editCompanyPhone} onChange={(e) => setEditCompanyPhone(e.target.value)} placeholder="02-0000-0000" />
                    </div>
                </CardContent>
            </Card>

            {/* Card 3: 담당자 / 정산 */}
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>담당자 · 정산 정보</CardTitle>
                    <CardDescription>실무 담당자 연락처 및 세금계산서/정산 정보입니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="b-contact-name">담당자명</Label>
                            <Input id="b-contact-name" value={editContactPersonName} onChange={(e) => setEditContactPersonName(e.target.value)} placeholder="김담당" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="b-contact-phone">담당자 연락처</Label>
                            <Input id="b-contact-phone" value={editContactPersonPhone} onChange={(e) => setEditContactPersonPhone(e.target.value)} placeholder="010-0000-0000" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="b-contact-email">담당자 이메일</Label>
                        <Input id="b-contact-email" value={editContactPersonEmail} onChange={(e) => setEditContactPersonEmail(e.target.value)} placeholder="contact@brand.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="b-tax-email">세금계산서 발행 이메일</Label>
                        <Input id="b-tax-email" value={editTaxEmail} onChange={(e) => setEditTaxEmail(e.target.value)} placeholder="tax@brand.com" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="b-bank-name">은행명</Label>
                            <select
                                id="b-bank-name"
                                value={editBankName}
                                onChange={(e) => setEditBankName(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">선택</option>
                                <option value="KB국민">KB국민</option>
                                <option value="신한">신한</option>
                                <option value="우리">우리</option>
                                <option value="하나">하나</option>
                                <option value="NH농협">NH농협</option>
                                <option value="IBK기업">IBK기업</option>
                                <option value="카카오뱅크">카카오뱅크</option>
                                <option value="토스뱅크">토스뱅크</option>
                                <option value="케이뱅크">케이뱅크</option>
                                <option value="SC제일">SC제일</option>
                                <option value="대구">대구</option>
                                <option value="부산">부산</option>
                                <option value="경남">경남</option>
                                <option value="광주">광주</option>
                                <option value="전북">전북</option>
                                <option value="제주">제주</option>
                                <option value="수협">수협</option>
                                <option value="새마을금고">새마을금고</option>
                                <option value="신협">신협</option>
                                <option value="우체국">우체국</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="b-account-number">계좌번호</Label>
                            <Input id="b-account-number" value={editAccountNumber} onChange={(e) => setEditAccountNumber(e.target.value.replace(/[^0-9-]/g, ''))} placeholder="110-000-000000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="b-account-holder">예금주</Label>
                            <Input id="b-account-holder" value={editAccountHolder} onChange={(e) => setEditAccountHolder(e.target.value)} placeholder="(주)브랜드명" />
                        </div>
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
