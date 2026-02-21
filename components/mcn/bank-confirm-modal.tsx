"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, X, Building2, CreditCard, AlertCircle } from "lucide-react"

interface BankConfirmModalProps {
    creatorName: string
    creatorAvatar: string | null
    bankName: string | null
    accountNumber: string | null
    accountHolder: string | null
    netAmount: number        // 실수령액 (원천징수 차감 후)
    withholdingAmount: number
    onConfirm: () => Promise<void>
    onClose: () => void
}

export function BankConfirmModal({
    creatorName,
    creatorAvatar,
    bankName,
    accountNumber,
    accountHolder,
    netAmount,
    withholdingAmount,
    onConfirm,
    onClose,
}: BankConfirmModalProps) {
    const [isProcessing, setIsProcessing] = useState(false)

    const handleConfirm = async () => {
        setIsProcessing(true)
        try {
            await onConfirm()
        } finally {
            setIsProcessing(false)
        }
    }

    const hasBank = bankName && accountNumber && accountHolder

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60"
                onClick={onClose}
            />
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="pointer-events-auto bg-background rounded-xl shadow-2xl w-full max-w-sm border"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b">
                        <h2 className="font-bold text-sm">지급 확인</h2>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="px-5 py-5 space-y-4">
                        {/* Creator info */}
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src={creatorAvatar || ''} />
                                <AvatarFallback className="font-bold text-sm">{creatorName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm">{creatorName}</p>
                                <p className="text-xs text-muted-foreground">수령인</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Bank info */}
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <CreditCard className="h-3 w-3" />
                                입금 계좌
                            </p>
                            {hasBank ? (
                                <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="font-medium text-sm">{bankName}</span>
                                    </div>
                                    <p className="text-sm font-mono tracking-wider pl-5">{accountNumber}</p>
                                    <p className="text-xs text-muted-foreground pl-5">예금주: {accountHolder}</p>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                        등록된 계좌 정보가 없습니다. 크리에이터에게 계좌 등록을 요청하세요.
                                    </p>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Amount breakdown */}
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">지급 금액</p>
                            <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>크리에이터 몫</span>
                                    <span>₩{(netAmount + withholdingAmount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-orange-500">
                                    <span>원천징수 (3.3%)</span>
                                    <span>-₩{withholdingAmount.toLocaleString()}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-base">
                                    <span>실 지급액</span>
                                    <span className="text-emerald-600">₩{netAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 pb-5 flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={onClose}
                            disabled={isProcessing}
                        >
                            취소
                        </Button>
                        <Button
                            size="sm"
                            className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={handleConfirm}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <span className="flex items-center gap-1.5">
                                    <span className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    처리 중...
                                </span>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    지급 완료 처리
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
