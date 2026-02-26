"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Building2, Download, Printer, Stamp, X } from "lucide-react"
import { useRef } from "react"

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
    statement_number?: string | null
}

const PROPOSAL_TYPE_LABELS: Record<string, string> = {
    product_application: '제품 지원',
    moment_proposal: '모먼트 제안',
    campaign_application: '캠페인 지원',
}

// ─── CSV Export Helper ────────────────────────────────────────────────────────
function exportIndividualStatementToCSV(
    mcnInfo: McnBusinessInfo,
    creatorName: string,
    settlementMonth: string,
    statementNumber: string,
    items: Settlement[]
) {
    const totalGross = items.reduce((s, r) => s + r.gross_amount, 0)
    const totalCreator = items.reduce((s, r) => s + r.creator_amount, 0)
    const totalWithhold = items.reduce((s, r) => s + (r.withholding_amount ?? Math.round(r.creator_amount * 0.033)), 0)
    const totalNet = items.reduce((s, r) => s + (r.net_creator_amount ?? (r.creator_amount - Math.round(r.creator_amount * 0.033))), 0)

    const [year, month] = settlementMonth.split('-')
    const displayMonth = `${year}년 ${Number(month)}월`

    // 세무사용 헤더
    const header = ['순번', '협업 내용', '총 협업 금액', `크리에이터 몫 (${Math.round((items[0]?.split_ratio ?? 0.7) * 100)}%)`, '원천징수상당액 (3.3%)', '실수령액', '지급 상태', '지급일자']

    const rows = items.map((item, idx) => {
        const wh = item.withholding_amount ?? Math.round(item.creator_amount * 0.033)
        const net = item.net_creator_amount ?? (item.creator_amount - wh)
        const typeLabel = PROPOSAL_TYPE_LABELS[item.proposal_type] || item.proposal_type
        const title = `${item.brand_name || '브랜드'} 협업 (${typeLabel})`

        return [
            idx + 1,
            title,
            item.gross_amount,
            item.creator_amount,
            wh,
            net,
            item.status === 'paid' ? '지급완료' : '지급대기',
            item.paid_at ? new Date(item.paid_at).toLocaleDateString('ko-KR') : ''
        ]
    })

    // 요약(합계) 열 추가
    rows.push(['-', '합계', totalGross, totalCreator, totalWithhold, totalNet, '-', '-'])

    // 최상단 정보 구성
    const metaData = [
        ['지급명세서', '', '', '', '', '', '', ''],
        ['문서번호', statementNumber, '', '', '', '', '', ''],
        ['정산월', displayMonth, '', '', '', '', '', ''],
        ['수령인(크리에이터)', creatorName, '', '', '', '', '', ''],
        ['발행처(MCN)', mcnInfo.name, '', '', '', '', '', ''],
        ['사업자등록번호', mcnInfo.business_registration_number || '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''] // 빈 줄
    ]

    const csvData = [...metaData, header, ...rows]
    const csvString = csvData
        .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n')

    const bom = '\uFEFF' // UTF-8 BOM
    const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `지급명세서_${creatorName}_${settlementMonth}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

// MCN 사업자 정보 인터페이스
export interface McnBusinessInfo {
    name: string                            // MCN 팀 이름
    representative_name?: string | null     // 대표자명
    business_registration_number?: string | null  // 사업자등록번호
    business_address?: string | null        // 사업장 주소
    stamp_url?: string | null              // 도장 이미지 URL
}

interface PaymentStatementModalProps {
    mcnInfo: McnBusinessInfo
    creatorName: string
    creatorAvatar: string | null
    bankName: string | null
    accountNumber: string | null
    accountHolder: string | null
    settlementMonth: string      // 'YYYY-MM'
    statementNumber: string      // 'YYYYMM-XXXXX'
    items: Settlement[]
    onClose: () => void
}

export function PaymentStatementModal({
    mcnInfo,
    creatorName,
    creatorAvatar,
    bankName,
    accountNumber,
    accountHolder,
    settlementMonth,
    statementNumber,
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
    const issueDate = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric'
    })

    const handlePrint = () => {
        window.print()
    }

    const handleDownloadCSV = () => {
        exportIndividualStatementToCSV(mcnInfo, creatorName, settlementMonth, statementNumber, items)
    }

    // 사업자등록번호 포맷팅 (123-45-67890)
    const formatBizNumber = (num: string | null | undefined) => {
        if (!num) return null
        const digits = num.replace(/\D/g, '')
        if (digits.length === 10) {
            return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
        }
        return num
    }

    return (
        <>
            <style>{`
                @media print {
                    body > *:not(#payment-statement-print-root) { display: none !important; }
                    #payment-statement-print-root { display: block !important; position: fixed; inset: 0; padding: 32px 48px; background: white; z-index: 9999; }
                    .no-print { display: none !important; }
                    .print-page { box-shadow: none !important; border: none !important; max-height: none !important; overflow: visible !important; }
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
                    className="pointer-events-auto bg-white dark:bg-gray-950 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto print-page"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Toolbar (인쇄 시 숨김) */}
                    <div className="flex items-center justify-between px-6 py-4 border-b no-print">
                        <div>
                            <h2 className="text-base font-bold">지급명세서</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">문서번호: {statementNumber}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={handleDownloadCSV} className="gap-1.5 h-8">
                                <Download className="h-3.5 w-3.5" />
                                CSV 다운로드
                            </Button>
                            <Button size="sm" onClick={handlePrint} className="gap-1.5 h-8">
                                <Printer className="h-3.5 w-3.5" />
                                인쇄 / PDF 저장
                            </Button>
                            <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0 ml-2">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Document body */}
                    <div ref={printRef} className="px-8 py-7 space-y-5 text-sm">

                        {/* ── Document Title ───────────────────────────────── */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">지 급 명 세 서</h1>
                                <p className="text-xs text-muted-foreground mt-1">
                                    문서번호: <span className="font-mono font-semibold">{statementNumber}</span>
                                </p>
                            </div>
                            <div className="text-right text-xs text-muted-foreground space-y-0.5">
                                <p>발행일: {issueDate}</p>
                                <p className="font-semibold">{displayMonth} 정산</p>
                            </div>
                        </div>

                        <Separator />

                        {/* ── MCN 발행처 정보 ──────────────────────────────── */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* 발행처: MCN */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">발 행 처</p>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="font-bold text-base">{mcnInfo.name}</span>
                                    </div>
                                    {mcnInfo.representative_name && (
                                        <p className="text-xs text-muted-foreground pl-5">
                                            대표자: <span className="text-foreground font-medium">{mcnInfo.representative_name}</span>
                                        </p>
                                    )}
                                    {mcnInfo.business_registration_number && (
                                        <p className="text-xs text-muted-foreground pl-5">
                                            사업자등록번호: <span className="font-mono text-foreground">{formatBizNumber(mcnInfo.business_registration_number)}</span>
                                        </p>
                                    )}
                                    {mcnInfo.business_address && (
                                        <p className="text-xs text-muted-foreground pl-5">
                                            주소: {mcnInfo.business_address}
                                        </p>
                                    )}
                                    {!mcnInfo.representative_name && !mcnInfo.business_registration_number && (
                                        <p className="text-xs text-amber-600/80 pl-5">
                                            ※ 팀 설정에서 사업자 정보를 등록하세요
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* 수령인: 크리에이터 */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">수 령 인</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarImage src={creatorAvatar || ''} />
                                            <AvatarFallback className="text-xs font-bold">{creatorName[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-bold">{creatorName}</span>
                                    </div>
                                    {bankName ? (
                                        <div className="text-xs space-y-0.5 pl-10">
                                            <p className="text-muted-foreground">
                                                입금 계좌: <span className="text-foreground font-medium">{bankName}</span>
                                            </p>
                                            <p className="font-mono text-foreground">{accountNumber}</p>
                                            <p className="text-muted-foreground">예금주: {accountHolder}</p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground pl-10">계좌 정보 없음</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* ── 정산 내역 테이블 ─────────────────────────────── */}
                        <div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">정 산 내 역</p>
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-foreground/20">
                                        <th className="text-left py-2 font-semibold pr-2 w-6">#</th>
                                        <th className="text-left py-2 font-semibold">협업 내용</th>
                                        <th className="text-right py-2 font-semibold">총 금액</th>
                                        <th className="text-right py-2 font-semibold whitespace-nowrap">
                                            크리에이터 몫<br />
                                            <span className="font-normal text-muted-foreground">
                                                ({Math.round((items[0]?.split_ratio ?? 0.7) * 100)}%)
                                            </span>
                                        </th>
                                        <th className="text-right py-2 font-semibold whitespace-nowrap">원천징수<br /><span className="font-normal text-muted-foreground">(3.3%)</span></th>
                                        <th className="text-right py-2 font-semibold text-emerald-700">실수령액</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => {
                                        const wh = item.withholding_amount ?? Math.round(item.creator_amount * 0.033)
                                        const net = item.net_creator_amount ?? (item.creator_amount - wh)
                                        return (
                                            <tr key={item.id} className="border-b border-muted/60 hover:bg-muted/20">
                                                <td className="py-2.5 text-muted-foreground">{idx + 1}</td>
                                                <td className="py-2.5 pr-2">
                                                    <span className="font-medium">{item.brand_name || '브랜드'} 협업</span>
                                                    <span className="ml-1.5 text-muted-foreground">
                                                        ({PROPOSAL_TYPE_LABELS[item.proposal_type] || item.proposal_type})
                                                    </span>
                                                    {item.paid_at && (
                                                        <span className="ml-1.5 text-muted-foreground/60">
                                                            · {new Date(item.paid_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} 지급
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 text-right">₩{item.gross_amount.toLocaleString()}</td>
                                                <td className="py-2.5 text-right text-blue-600">₩{item.creator_amount.toLocaleString()}</td>
                                                <td className="py-2.5 text-right text-orange-500">-₩{wh.toLocaleString()}</td>
                                                <td className="py-2.5 text-right text-emerald-600 font-bold">₩{net.toLocaleString()}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-foreground/20 font-bold">
                                        <td className="pt-3" colSpan={2}>합   계</td>
                                        <td className="pt-3 text-right">₩{totalGross.toLocaleString()}</td>
                                        <td className="pt-3 text-right text-blue-600">₩{totalCreator.toLocaleString()}</td>
                                        <td className="pt-3 text-right text-orange-500">-₩{totalWithhold.toLocaleString()}</td>
                                        <td className="pt-3 text-right text-emerald-600 text-base">₩{totalNet.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <Separator />

                        {/* ── 최종 지급액 요약 박스 ────────────────────────── */}
                        <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-6 py-4">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">최종 지급액 (원천징수 3.3% 공제 후)</p>
                                    <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">
                                        ₩{totalNet.toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right text-xs text-muted-foreground space-y-1">
                                    <p>총 협업 금액: ₩{totalGross.toLocaleString()}</p>
                                    <p>MCN 수수료: ₩{totalMcn.toLocaleString()}</p>
                                    <p>원천징수 합계: ₩{totalWithhold.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* ── 서명/도장 영역 ────────────────────────────────── */}
                        <div className="flex items-end justify-between pt-2">
                            <p className="text-xs text-muted-foreground">
                                위 금액을 정히 지급합니다.
                                <br />
                                {issueDate}
                            </p>
                            <div className="text-right">
                                <p className="text-sm font-semibold">{mcnInfo.name}</p>
                                {mcnInfo.representative_name && (
                                    <p className="text-xs text-muted-foreground">대표 {mcnInfo.representative_name} (인)</p>
                                )}
                                {mcnInfo.stamp_url ? (
                                    <div className="mt-1 inline-block">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={mcnInfo.stamp_url}
                                            alt="도장"
                                            className="h-16 w-16 object-contain opacity-80"
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-2 h-14 w-14 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center ml-auto">
                                        <Stamp className="h-5 w-5 text-muted-foreground/30" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── 법적 고지 ─────────────────────────────────────── */}
                        <div className="pt-2 border-t border-muted/40">
                            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                                본 지급명세서는 소득세법 제145조에 따른 원천징수 내역을 포함합니다.
                                원천징수 세액은 매월 10일까지 관할 세무서에 납부됩니다.
                                문의사항은 {mcnInfo.name}으로 연락하시기 바랍니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
