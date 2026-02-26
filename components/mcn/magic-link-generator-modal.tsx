"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTeam } from "@/components/providers/team-provider"
import { Building2, Copy, Loader2, Plus, Sparkles, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function MagicLinkGeneratorModal() {
    const { teamMembers } = useTeam()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Form state
    const [influencerId, setInfluencerId] = useState<string>("")
    const [brandName, setBrandName] = useState<string>("")
    const [priceOffer, setPriceOffer] = useState<string>("")
    const [message, setMessage] = useState<string>("")

    // Result state
    const [magicLink, setMagicLink] = useState<string | null>(null)
    const [isCopied, setIsCopied] = useState(false)

    // Reset when modal closes
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setTimeout(() => {
                setMagicLink(null)
                setIsCopied(false)
                setInfluencerId("")
                setBrandName("")
                setPriceOffer("")
                setMessage("")
            }, 300)
        }
    }

    const handleGenerate = async () => {
        if (!influencerId) {
            toast.error("매칭할 크리에이터를 선택해주세요.")
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch("/api/workspace/magic-link/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    influencerId,
                    brandName,
                    priceOffer,
                    message
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "생성 실패")
            }

            setMagicLink(data.magicLink)
            toast.success("워크스페이스 매직 링크가 생성되었습니다.")
        } catch (error: any) {
            console.error("Generate error:", error)
            toast.error(error.message || "매직 링크 생성 중 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopy = () => {
        if (!magicLink) return
        navigator.clipboard.writeText(magicLink)
        setIsCopied(true)
        toast.success("링크가 클립보드에 복사되었습니다.")
        setTimeout(() => setIsCopied(false), 2000)
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-md">
                    <Sparkles className="h-4 w-4" />
                    새 워크스페이스 개설 (초대)
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-violet-500" />
                        브랜드 파트너 초대하기
                    </DialogTitle>
                    <DialogDescription>
                        가입하지 않은 브랜드 담당자를 마찰 없이 워크스페이스에 초대할 수 있는 1회용 링크를 생성합니다.
                    </DialogDescription>
                </DialogHeader>

                {!magicLink ? (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="influencer">매칭할 크리에이터 <span className="text-red-500">*</span></Label>
                            <Select value={influencerId} onValueChange={setInfluencerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="소속 크리에이터 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamMembers.map((member) => (
                                        <SelectItem key={member.user_id} value={member.user_id}>
                                            {member.profile?.display_name || '이름 없음'}
                                        </SelectItem>
                                    ))}
                                    {teamMembers.length === 0 && (
                                        <SelectItem value="empty" disabled>크리에이터가 없습니다.</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="brandName">브랜드명 (가칭) <span className="text-muted-foreground text-xs font-normal">선택</span></Label>
                            <Input
                                id="brandName"
                                placeholder="예: 나이키 코리아"
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="priceOffer">협상 금액 <span className="text-muted-foreground text-xs font-normal">선택</span></Label>
                            <Input
                                id="priceOffer"
                                placeholder="예: 500000"
                                type="text"
                                inputMode="numeric"
                                value={priceOffer}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/[^0-9]/g, '')
                                    if (rawValue) {
                                        setPriceOffer(Number(rawValue).toLocaleString())
                                    } else {
                                        setPriceOffer('')
                                    }
                                }}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="message">첫 메시지 <span className="text-muted-foreground text-xs font-normal">선택</span></Label>
                            <Input
                                id="message"
                                placeholder="메시지를 입력하세요 (옵션)"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="py-6 space-y-4">
                        <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 flex flex-col items-center justify-center text-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 dark:bg-green-900/50 dark:text-green-400">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-green-800 dark:text-green-300">초대 링크가 생성되었습니다!</h4>
                                <p className="text-sm text-green-600 dark:text-green-400/80 mt-1 line-clamp-2 break-all text-xs">
                                    {magicLink}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>초대 링크 복사 (7일 뒤 만료)</Label>
                            <div className="flex gap-2">
                                <Input disabled value={magicLink} className="bg-muted" />
                                <Button
                                    variant="secondary"
                                    className="shrink-0"
                                    onClick={handleCopy}
                                >
                                    {isCopied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            담당자에게 이 링크를 전달해주세요. 담당자가 접속하여 간편 로그인을 완료하면 자동으로 매핑됩니다.
                        </p>
                    </div>
                )}

                <DialogFooter className="sm:justify-end">
                    {!magicLink ? (
                        <Button
                            type="button"
                            disabled={isLoading || !influencerId}
                            onClick={handleGenerate}
                            className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700"
                        >
                            {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 생성 중...</>
                            ) : (
                                "링크 생성하기"
                            )}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="default"
                            onClick={() => setIsOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            완료
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
