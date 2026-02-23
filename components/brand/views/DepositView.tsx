"use client"

import { useAuth } from '@/components/providers/auth-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowDownCircle, ArrowUpCircle, Copy, CreditCard, RefreshCw, Wallet } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface DepositTx {
    id: string
    type: 'charge' | 'use' | 'refund'
    amount: number
    balance_after: number
    note: string | null
    reference_id: string | null
    status: 'pending' | 'confirmed' | 'cancelled'
    confirmed_at: string | null
    created_at: string
}

interface DepositViewProps {
    userId: string
    depositBalance?: number
    onBalanceRefresh?: () => void
}

export function DepositView({ userId, depositBalance = 0, onBalanceRefresh }: DepositViewProps) {
    const { supabase } = useAuth()
    const [transactions, setTransactions] = useState<DepositTx[]>([])
    const [loading, setLoading] = useState(true)
    const [showChargeInfo, setShowChargeInfo] = useState(false)
    const [balance, setBalance] = useState(depositBalance)

    const fetchTransactions = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('brand_deposits')
                .select('*')
                .eq('brand_id', userId)
                .order('created_at', { ascending: false })
                .limit(50)
            if (error) console.error('[DepositView] fetch error:', error)
            setTransactions(data ?? [])
        } finally {
            setLoading(false)
        }
    }, [supabase, userId])

    const fetchBalance = useCallback(async () => {
        const { data } = await supabase
            .from('profiles')
            .select('deposit_balance')
            .eq('id', userId)
            .single()
        if (data) setBalance(data.deposit_balance ?? 0)
    }, [supabase, userId])

    useEffect(() => {
        fetchTransactions()
        fetchBalance()
    }, [fetchTransactions, fetchBalance])

    const handleRequestCharge = async () => {
        // 충전 요청 레코드 생성 (pending 상태)
        const { error } = await supabase.from('brand_deposits').insert({
            brand_id: userId,
            type: 'charge',
            amount: 0,    // 관리자가 실제 금액 확인 후 업데이트
            balance_after: balance,
            status: 'pending',
            note: '충전 요청 (계좌이체 대기)',
        })
        if (error) {
            toast.error('충전 요청 등록에 실패했습니다.')
        } else {
            toast.success('충전 요청이 등록되었습니다. 아래 계좌로 입금해 주세요.')
            setShowChargeInfo(true)
            fetchTransactions()
        }
    }

    const txTypeConfig = {
        charge: { label: '충전', icon: ArrowUpCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', sign: '+' },
        use: { label: '사용', icon: ArrowDownCircle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', sign: '-' },
        refund: { label: '환불', icon: ArrowUpCircle, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', sign: '+' },
    }

    const statusConfig = {
        pending: { label: '확인 대기', variant: 'warning' as any },
        confirmed: { label: '완료', variant: 'success' as any },
        cancelled: { label: '취소', variant: 'destructive' as any },
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">예치금 관리</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    선급금을 충전하고 워크스페이스에서 광고비로 즉시 사용하세요.
                </p>
            </div>

            {/* Balance Card */}
            <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center">
                                <Wallet className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">현재 예치금 잔액</p>
                                <p className="text-3xl font-black text-orange-700 dark:text-orange-300 tracking-tight">
                                    {balance.toLocaleString()}원
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowChargeInfo(!showChargeInfo)}
                            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                        >
                            <ArrowUpCircle className="h-4 w-4" /> 충전하기
                        </Button>
                    </div>

                    {/* Charge Info Banner */}
                    {showChargeInfo && (
                        <div className="mt-4 rounded-xl bg-white dark:bg-orange-950/40 border border-orange-200 dark:border-orange-700 p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-orange-600" />
                                <p className="text-sm font-bold text-orange-700 dark:text-orange-300">충전 계좌 안내</p>
                            </div>
                            <p className="text-xs text-orange-700/80 dark:text-orange-300/70 leading-relaxed">
                                아래 계좌로 입금하시면 관리자 확인 후 잔액이 자동 반영됩니다.<br />
                                입금 확인은 영업일 기준 2~4시간 내 처리됩니다.
                            </p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-orange-700/70">은행</span>
                                    <span className="font-bold">{process.env.NEXT_PUBLIC_DEPOSIT_BANK_NAME ?? '우리은행'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-orange-700/70">계좌번호</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold">{process.env.NEXT_PUBLIC_DEPOSIT_ACCOUNT_NUMBER ?? '-'}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const raw = (process.env.NEXT_PUBLIC_DEPOSIT_ACCOUNT_NUMBER ?? '').replace(/-/g, '')
                                                navigator.clipboard.writeText(raw)
                                                toast.success('계좌번호가 복사되었습니다')
                                            }}
                                            className="p-0.5 rounded hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
                                        >
                                            <Copy className="h-3.5 w-3.5 text-orange-500" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-orange-700/70">예금주</span>
                                    <span className="font-bold">{process.env.NEXT_PUBLIC_DEPOSIT_HOLDER ?? process.env.NEXT_PUBLIC_DEPOSIT_ACCOUNT_HOLDER ?? '-'}</span>
                                </div>
                                <div className="pt-2 border-t border-orange-200 dark:border-orange-700">
                                    <p className="text-[11px] text-orange-600/60">
                                        ※ 입금자명: <span className="font-mono font-semibold">[회사명]_DEPOSIT</span> 형식으로 입력해 주세요.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                                onClick={handleRequestCharge}
                            >
                                입금 완료 — 확인 요청하기
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">거래 내역</CardTitle>
                        <button
                            type="button"
                            onClick={() => { fetchTransactions(); fetchBalance(); onBalanceRefresh?.() }}
                            className="p-1.5 rounded-md hover:bg-muted transition-colors"
                        >
                            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                            로딩 중...
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <Wallet className="h-10 w-10 mb-3 opacity-20" />
                            <p className="text-sm font-medium">거래 내역이 없습니다</p>
                            <p className="text-xs mt-1">예치금을 충전하면 여기에 표시됩니다</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {transactions.map((tx) => {
                                const cfg = txTypeConfig[tx.type]
                                const statusCfg = statusConfig[tx.status]
                                const Icon = cfg.icon
                                return (
                                    <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                                        <div className={cn('h-9 w-9 rounded-full flex items-center justify-center shrink-0', cfg.bg)}>
                                            <Icon className={cn('h-4 w-4', cfg.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold">{cfg.label}</span>
                                                <Badge
                                                    variant={tx.status === 'confirmed' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}
                                                    className="text-[9px] h-4 px-1.5"
                                                >
                                                    {statusCfg.label}
                                                </Badge>
                                            </div>
                                            {tx.note && <p className="text-[11px] text-muted-foreground truncate mt-0.5">{tx.note}</p>}
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                {new Date(tx.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={cn('text-sm font-black', cfg.color)}>
                                                {cfg.sign}{tx.amount.toLocaleString()}원
                                            </p>
                                            {tx.status === 'confirmed' && (
                                                <p className="text-[10px] text-muted-foreground">잔액 {tx.balance_after.toLocaleString()}원</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <p className="text-[11px] text-muted-foreground">
                예치금은 선급금(광고 집행 대금) 성격으로 충전됩니다. 세금계산서는 충전 확인 후 발행됩니다.
            </p>
        </div>
    )
}
