"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { AlertTriangle, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

const DELETION_REASONS = [
    "더 이상 서비스를 사용하지 않습니다",
    "다른 서비스로 이전합니다",
    "개인정보 보호 우려",
    "원하는 기능이 없습니다",
    "기타",
]

export function AccountDeleteDialog() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [confirmText, setConfirmText] = useState("")
    const [reason, setReason] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)

    const canDelete = confirmText === "탈퇴합니다"

    const handleDelete = async () => {
        if (!canDelete) return

        setIsDeleting(true)
        try {
            const res = await fetch('/api/account/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || '탈퇴 처리 중 오류가 발생했습니다.')
            }

            // Sign out locally
            const supabase = createClient()
            await supabase.auth.signOut()

            // Clear all local data
            localStorage.clear()
            sessionStorage.clear()

            toast.success('회원탈퇴가 완료되었습니다.')
            window.location.href = '/'
        } catch (err: any) {
            toast.error(err.message || '탈퇴 처리 중 오류가 발생했습니다.')
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    회원탈퇴
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        정말 탈퇴하시겠습니까?
                    </DialogTitle>
                    <DialogDescription className="space-y-2 pt-2">
                        <p>회원탈퇴 시 다음 데이터가 <strong className="text-destructive">영구 삭제</strong>됩니다:</p>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                            <li>프로필 정보</li>
                            <li>등록한 모먼트(이벤트)</li>
                            <li>크리에이터 상세 정보</li>
                        </ul>
                        <p className="text-sm font-medium text-destructive mt-3">
                            ⚠️ 이 작업은 되돌릴 수 없습니다.
                        </p>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>탈퇴 사유 (선택)</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="사유를 선택해주세요" />
                            </SelectTrigger>
                            <SelectContent>
                                {DELETION_REASONS.map(r => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm">
                            확인을 위해 <strong className="text-destructive">&quot;탈퇴합니다&quot;</strong>를 입력해주세요
                        </Label>
                        <Input
                            id="confirm"
                            placeholder="탈퇴합니다"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            disabled={isDeleting}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
                        취소
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={!canDelete || isDeleting}
                    >
                        {isDeleting ? "처리 중..." : "회원탈퇴"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
