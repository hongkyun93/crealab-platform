"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Printer, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Settlement {
    id: string
    creator_id: string
    creator_name: string
    creator_avatar: string | null
    brand_name: string | null
    proposal_type: string
    gross_amount: number
    split_ratio: number
    creator_amount: number
    mcn_amount: number
    withholding_rate?: number
    withholding_amount?: number
    net_creator_amount?: number
    status: string
    paid_at: string | null
    created_at: string
}

const PROPOSAL_TYPE_LABELS: Record<string, string> = {
    brand_proposal: '브랜드 제안',
    moment_proposal: '모먼트 제안',
    campaign_application: '캠페인 지원',
}

interface PaymentStatementModalProps {
    mcnName: string
    creatorName: string
    creatorAvatar: string | null
    bankName: string | null
    accountNumber: string | null
    accountHolder: string | null
    settlementMonth: string      // 'YYYY-MM'
    items: Settlement[]
    onClose: () => void
}

export function PaymentStatementModal({
    mcnName,
    creatorName,
    creatorAvatar,
    bankName,
    accountNumber,
    accountHolder,
    settlementMonth,
    items,
    onClose,
}: PaymentStatementModalProps) {
    const printRef = useRef<HTMLDivElement>(null)

    const totalGross = items.reduce((s, r) => s + r.gross_amount, 0)
    const totalCreator = items.reduce((s, r) => s + r.creator_amount, 0)
    const totalMcn = items.reduce((s, r) => s + r.mcn_amount, 0)
    const totalWithhold = items.reduce((s, r) =>
        s + (r.withholding_amount ?? Math.round(r.creator_amount * 0.033)), 0)
    const totalNet = items.reduce((s, r) =>
        s + (r.net_creator_amount ?? (r.creator_amount - Math.round(r.creator_amount * 0.033))), 0)

    const [year, month] = settlementMonth.split('-')
    const displayMonth = `${year}년 ${Number(month)}월`

    const handlePrint = () => {
        window.print()
    }

    return (
        <>
            {/* Print styles injected in head via style tag effect */}
            <style>{`
                @media print {
                    body > *:not(#payment-statement-print-root) { display: none !important; }
                    #payment-statement-print-root { display: block !important; position: fixed; inset: 0; padding: 40px; background: white; }
                    .no-print { display: none !important; }
                }
            `}</style>

            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 no-print"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                id="payment-statement-print-root"
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
                <div
                    className="pointer-events-auto bg-white dark:bg-gray-950 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b no-print">
                        <h2 className="text-base font-bold">지급명세서</h2>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handlePrint} className="gap-1.5 h-8">
                                <Printer className="h-3.5 w-3.5" />
                                인쇄 / PDF 저장
                            </Button>
                            <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Statement body */}
                    <div ref={printRef} className="px-8 py-6 space-y-5 text-sm">
                        {/* Title */}
                        <div className="text-center space-y-1 pb-2">
                            <p className="text-xs text-muted-foreground">{mcnName}</p>
                            <h1 className="text-2xl font-bold tracking-tight">지 급 명 세 서</h1>
                            <p className="text-muted-foreground text-sm">{displayMonth} 정산</p>
                        </div>

                        <Separator />

                        {/* Creator info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">수령인</p>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={creatorAvatar || ''} />
                                        <AvatarFallback className="text-xs">{creatorName[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold">{creatorName}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">입금 계좌</p>
                                {bankName ? (
                                    <div className="space-y-0.5">
                                        <p className="font-medium">{bankName}</p>
                                        <p className="text-muted-foreground">{accountNumber}</p>
                                        <p className="text-muted-foreground text-xs">예금주: {accountHolder}</p>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-xs">계좌 정보 없음</p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Items table */}
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">정산 내역</p>
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-1.5 font-medium text-muted-foreground">협업</th>
                                        <th className="text-right py-1.5 font-medium text-muted-foreground">총액</th>
                                        <th className="text-right py-1.5 font-medium text-muted-foreground">배분({Math.round((items[0]?.split_ratio ?? 0.7) * 100)}%)</th>
                                        <th className="text-right py-1.5 font-medium text-muted-foreground">원천징수</th>
                                        <th className="text-right py-1.5 font-medium text-muted-foreground">실수령</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => {
                                        const wh = item.withholding_amount ?? Math.round(item.creator_amount * 0.033)
                                        const net = item.net_creator_amount ?? (item.creator_amount - wh)
                                        return (
                                            <tr key={item.id} className="border-b border-muted">
                                                <td className="py-2">
                                                    <span>{item.brand_name || '브랜드'} 협업</span>
                                                    <span className="ml-1.5 text-muted-foreground">
                                                        ({PROPOSAL_TYPE_LABELS[item.proposal_type] || item.proposal_type})
                                                    </span>
                                                </td>
                                                <td className="py-2 text-right">₩{item.gross_amount.toLocaleString()}</td>
                                                <td className="py-2 text-right text-blue-600">₩{item.creator_amount.toLocaleString()}</td>
                                                <td className="py-2 text-right text-orange-500">-₩{wh.toLocaleString()}</td>
                                                <td className="py-2 text-right text-emerald-600 font-semibold">₩{net.toLocaleString()}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="font-semibold">
                                        <td className="pt-3">합계</td>
                                        <td className="pt-3 text-right">₩{totalGross.toLocaleString()}</td>
                                        <td className="pt-3 text-right text-blue-600">₩{totalCreator.toLocaleString()}</td>
                                        <td className="pt-3 text-right text-orange-500">-₩{totalWithhold.toLocaleString()}</td>
                                        <td className="pt-3 text-right text-emerald-600">₩{totalNet.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <Separator />

                        {/* Summary box */}
                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">최종 지급액 (원천징수 3.3% 공제 후)</p>
                                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                                    ₩{totalNet.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-right text-xs text-muted-foreground space-y-0.5">
                                <p>MCN 수수료: ₩{totalMcn.toLocaleString()}</p>
                                <p>원천징수: ₩{totalWithhold.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <p className="text-center text-xs text-muted-foreground pt-2">
                            발행일: {new Date().toLocaleDateString('ko-KR')} · {mcnName}
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
