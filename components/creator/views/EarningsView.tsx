"use client"

import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Download, RefreshCw, TrendingUp, Wallet } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface Settlement {
    id: string
    brand_id: string | null
    proposal_type: string
    proposal_id: string
    gross_amount: number
    creator_amount: number
    mcn_amount: number
    withholding_rate: number | null
    withholding_amount: number | null
    net_creator_amount: number | null
    status: 'pending' | 'processing' | 'paid' | 'cancelled'
    paid_at: string | null
    settlement_month: string | null
    note: string | null
    created_at: string
    brand_name?: string | null
}


function printSettlement(s: Settlement) {
    const wh = s.withholding_amount ?? Math.round((s.creator_amount ?? 0) * 0.033)
    const net = s.net_creator_amount ?? ((s.creator_amount ?? 0) - wh)
    const w = window.open('', '_blank', 'width=700,height=900')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>정산 확인서</title>
<style>body{font-family:sans-serif;padding:40px;color:#111}h1{font-size:22px;font-weight:bold;margin-bottom:4px}
.meta{color:#888;font-size:13px;margin-bottom:32px}
table{width:100%;border-collapse:collapse}
td,th{border:1px solid #e0e0e0;padding:12px;font-size:13px}
th{background:#f7f7f7;text-align:left;font-weight:600}
.total td{font-weight:bold;font-size:15px;background:#f0f9f0}
.footer{margin-top:40px;font-size:11px;color:#aaa}</style></head><body>
<h1>정산 확인서</h1>
<div class="meta">발행일: ${new Date().toLocaleDateString('ko-KR')} · 정산월: ${s.settlement_month ?? '-'}</div>
<table>
<tr><th>항목</th><th>금액</th></tr>
<tr><td>브랜드</td><td>${s.brand_name ?? '-'}</td></tr>
<tr><td>협업 유형</td><td>${s.proposal_type === 'moment_proposal' ? '모먼트' : s.proposal_type === 'campaign_application' ? '캠페인' : '브랜드 제안'}</td></tr>
<tr><td>총 협업 금액</td><td>${s.gross_amount.toLocaleString()}원</td></tr>
<tr><td>크리에이터 배분액</td><td>${(s.creator_amount ?? 0).toLocaleString()}원</td></tr>
<tr><td>원천징수 (${(((s.withholding_rate ?? 0.033) * 100).toFixed(1))}%)</td><td>-${wh.toLocaleString()}원</td></tr>
<tr class="total"><td>실수령액</td><td>${net.toLocaleString()}원</td></tr>
</table>
<div class="footer">본 정산 확인서는 Creadypick 플랫폼에서 자동 발행된 참고용 문서입니다.</div>
</body></html>`)
    w.document.close()
    w.print()
}

const STATUS_CONFIG = {
    pending: { label: '정산 대기', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    processing: { label: '처리 중', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    paid: { label: '지급 완료', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    cancelled: { label: '취소', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

const TYPE_LABEL: Record<string, string> = {
    moment_proposal: '모먼트',
    campaign_application: '캠페인',
    product_application: '브랜드 제안',
}

export function EarningsView() {
    const { supabase, user } = useAuth()
    const userId = user?.id
    const [settlements, setSettlements] = useState<Settlement[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMonth, setSelectedMonth] = useState<string>('all')
    const [months, setMonths] = useState<string[]>([])
    const [performanceMap, setPerformanceMap] = useState<Record<string, boolean>>({})

    const fetchData = useCallback(async () => {
        if (!userId) return
        setLoading(true)
        try {
            // 정산 내역 조회 (브랜드 이름 JOIN)
            const { data, error } = await supabase
                .from('settlements')
                .select('*, brand:brand_id(display_name)')
                .eq('creator_id', userId)
                .order('created_at', { ascending: false })
                .limit(100)

            if (error) {
                console.error('[EarningsView] fetch error:', error)
                return
            }

            const parsed: Settlement[] = (data ?? []).map((s: any) => ({
                ...s,
                brand_name: s.brand?.display_name ?? null,
            }))
            setSettlements(parsed)

            // 월별 목록 추출
            const uniqueMonths = [
                ...new Set(parsed.map(s => s.settlement_month).filter(Boolean))
            ] as string[]
            setMonths(uniqueMonths.sort().reverse())

            // 성과 제출 여부 확인
            if (parsed.length > 0) {
                const ids = parsed.map(s => s.proposal_id)
                const { data: perfData } = await supabase
                    .from('campaign_performance')
                    .select('proposal_id')
                    .in('proposal_id', ids)

                const map: Record<string, boolean> = {}
                for (const p of (perfData ?? [])) map[p.proposal_id] = true
                setPerformanceMap(map)
            }
        } finally {
            setLoading(false)
        }
    }, [supabase, userId])

    useEffect(() => { fetchData() }, [fetchData])

    const filtered = selectedMonth === 'all'
        ? settlements
        : settlements.filter(s => s.settlement_month === selectedMonth)

    // 요약 수치 계산
    const totalGross = settlements.reduce((s, r) => s + r.gross_amount, 0)
    const totalPending = settlements
        .filter(s => s.status === 'pending' || s.status === 'processing')
        .reduce((s, r) => s + (r.net_creator_amount ?? r.creator_amount), 0)
    const totalPaid = settlements
        .filter(s => s.status === 'paid')
        .reduce((s, r) => s + (r.net_creator_amount ?? r.creator_amount), 0)
    const totalWH = settlements.reduce((s, r) => s + (r.withholding_amount ?? Math.round((r.creator_amount ?? 0) * 0.033)), 0)

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">수익 관리</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    협업 정산 내역과 실수령 금액을 확인하세요.
                </p>
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-2 gap-3">
                {/* 누적 수익 */}
                <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                                <Wallet className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">누적 수익</p>
                        </div>
                        <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">
                            {totalGross.toLocaleString()}원
                        </p>
                    </CardContent>
                </Card>

                {/* 입금 예정 */}
                <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">입금 예정</p>
                        </div>
                        <p className="text-2xl font-black text-orange-700 dark:text-orange-300 tracking-tight">
                            {totalPending.toLocaleString()}원
                        </p>
                    </CardContent>
                </Card>

                {/* 지급 완료 */}
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">지급 완료</p>
                        <p className="text-xl font-bold">{totalPaid.toLocaleString()}원</p>
                    </CardContent>
                </Card>

                {/* 원천징수 */}
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">원천징수 합계 (3.3%)</p>
                        <p className="text-xl font-bold text-muted-foreground">-{totalWH.toLocaleString()}원</p>
                    </CardContent>
                </Card>
            </div>

            {/* 정산 내역 */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">정산 내역</CardTitle>
                        <div className="flex items-center gap-2">
                            {/* 월별 필터 */}
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="h-8 w-[110px] text-xs">
                                    <SelectValue placeholder="전체" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">전체</SelectItem>
                                    {months.map(m => (
                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <button
                                type="button"
                                onClick={fetchData}
                                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                            >
                                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">로딩 중...</div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <Wallet className="h-10 w-10 mb-3 opacity-20" />
                            <p className="text-sm font-medium">정산 내역이 없습니다</p>
                            <p className="text-xs mt-1">협업이 완료되면 여기에 표시됩니다</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filtered.map((s) => {
                                const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.pending
                                const wh = s.withholding_amount ?? Math.round((s.creator_amount ?? 0) * 0.033)
                                const net = s.net_creator_amount ?? ((s.creator_amount ?? 0) - wh)
                                const hasPerf = !!performanceMap[s.proposal_id]

                                return (
                                    <div key={s.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-sm font-semibold truncate max-w-[140px]">
                                                    {s.brand_name ?? '브랜드'}
                                                </span>
                                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                                    {TYPE_LABEL[s.proposal_type] ?? s.proposal_type}
                                                </span>
                                                <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', cfg.className)}>
                                                    {cfg.label}
                                                </span>
                                                {/* 성과 제출 상태 배지 */}
                                                {hasPerf ? (
                                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-0.5">
                                                        <CheckCircle2 className="h-2.5 w-2.5" /> 성과 제출 완료
                                                    </span>
                                                ) : s.status === 'pending' || s.status === 'processing' ? (
                                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-0.5">
                                                        <AlertCircle className="h-2.5 w-2.5" /> 성과 제출 필요
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {s.settlement_month ?? '-'} · 등록 {new Date(s.created_at).toLocaleDateString('ko-KR')}
                                                {s.paid_at && ` · 지급 ${new Date(s.paid_at).toLocaleDateString('ko-KR')}`}
                                            </p>
                                        </div>

                                        <div className="text-right shrink-0 flex items-center gap-2">
                                            <div>
                                                <p className="text-sm font-black">{net.toLocaleString()}원</p>
                                                <p className="text-[10px] text-muted-foreground">세후 실수령</p>
                                            </div>
                                            {/* 정산서 다운로드 */}
                                            <button
                                                type="button"
                                                onClick={() => printSettlement(s)}
                                                title="정산 확인서 출력"
                                                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                                            >
                                                <Download className="h-3.5 w-3.5 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <p className="text-[11px] text-muted-foreground">
                정산 금액은 원천징수(3.3%) 공제 후 실수령액 기준입니다. 세금계산서 발행은 고객센터로 문의해 주세요.
            </p>
        </div>
    )
}
