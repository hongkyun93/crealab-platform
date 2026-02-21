"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { Wallet, Loader2, CheckCircle2, Clock, TrendingUp, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Settlement {
    id: string
    brand_name: string | null
    proposal_type: string
    gross_amount: number
    split_ratio: number
    creator_amount: number
    status: 'pending' | 'processing' | 'paid' | 'cancelled'
    paid_at: string | null
    settlement_month: string | null
    created_at: string
}

const STATUS_CONFIG = {
    pending: { label: '지급 대기', icon: Clock, color: 'text-amber-600' },
    processing: { label: '처리 중', icon: Loader2, color: 'text-blue-600' },
    paid: { label: '지급 완료', icon: CheckCircle2, color: 'text-emerald-600' },
    cancelled: { label: '취소됨', icon: Clock, color: 'text-gray-400' },
}

const PROPOSAL_TYPE_LABELS: Record<string, string> = {
    brand_proposal: '브랜드 제안',
    moment_proposal: '모먼트 제안',
    campaign_application: '캠페인',
}

export function CreatorSettlementHistory() {
    const { user, supabase } = useAuth()
    const [settlements, setSettlements] = useState<Settlement[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchMySettlements = useCallback(async () => {
        if (!user?.id) return
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('settlements')
                .select(`
                    id,
                    proposal_type,
                    gross_amount,
                    split_ratio,
                    creator_amount,
                    status,
                    paid_at,
                    settlement_month,
                    created_at,
                    brand:brand_id (display_name)
                `)
                .eq('creator_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20)

            if (error) {
                // Table not yet deployed; show empty state gracefully
                console.warn('[CreatorSettlementHistory] Table not deployed yet:', error.message)
                setSettlements([])
            } else {
                const mapped = (data || []).map((r: any) => ({
                    ...r,
                    brand_name: r.brand?.display_name || null,
                }))
                setSettlements(mapped)
            }
        } catch (err) {
            console.error('[CreatorSettlementHistory] Error:', err)
            setSettlements([])
        } finally {
            setIsLoading(false)
        }
    }, [user?.id, supabase])

    useEffect(() => {
        fetchMySettlements()
    }, [fetchMySettlements])

    const totalPaid = settlements.filter(s => s.status === 'paid').reduce((a, s) => a + s.creator_amount, 0)
    const totalPending = settlements.filter(s => s.status === 'pending').reduce((a, s) => a + s.creator_amount, 0)

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-10 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    정산 내역 로딩 중...
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Wallet className="h-4 w-4 text-primary" />
                    내 정산 내역
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {/* Summary row */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 border border-emerald-100 dark:border-emerald-800">
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> 지급 완료
                        </p>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                            ₩{totalPaid.toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 border border-amber-100 dark:border-amber-800">
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> 지급 예정
                        </p>
                        <p className="text-xl font-bold text-amber-700 dark:text-amber-400">
                            ₩{totalPending.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Settlement list */}
                {settlements.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Wallet className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">아직 정산 내역이 없어요</p>
                        <p className="text-xs mt-1 opacity-70">협업이 완료되면 자동으로 정산 내역이 생성됩니다</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {settlements.map(s => {
                            const cfg = STATUS_CONFIG[s.status]
                            const StatusIcon = cfg.icon
                            const typeLabel = PROPOSAL_TYPE_LABELS[s.proposal_type] || s.proposal_type

                            return (
                                <div
                                    key={s.id}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                                >
                                    <div className={cn("p-1.5 rounded-md bg-background", cfg.color)}>
                                        <StatusIcon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-sm font-medium truncate">
                                                {s.brand_name || '브랜드'} 협업
                                            </span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-background border text-muted-foreground">
                                                {typeLabel}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            총 ₩{s.gross_amount.toLocaleString()} 중 내 몫 ·{' '}
                                            {new Date(s.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={cn("text-sm font-bold", cfg.color)}>
                                            ₩{s.creator_amount.toLocaleString()}
                                        </p>
                                        <p className={cn("text-[10px]", cfg.color)}>{cfg.label}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
