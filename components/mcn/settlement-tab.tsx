"use client"

import { CreatorSettlementHistory } from "@/components/creator/settlement-history"
import { useAuth } from "@/components/providers/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Building2, CheckCircle2, ChevronDown, ChevronRight, Clock, DollarSign, Download, FileText, Loader2, Receipt, Settings2, Users, Wallet } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { BankConfirmModal } from "./bank-confirm-modal"
import { PaymentStatementModal, type McnBusinessInfo } from "./payment-statement-modal"
import { RevenueSplitEditor } from "./revenue-split-editor"

// ─── Types ───────────────────────────────────────────────────────────────────
interface Settlement {
    id: string
    creator_id: string
    creator_name: string
    creator_avatar: string | null
    brand_id: string | null
    brand_name: string | null
    proposal_type: string
    proposal_id: string
    gross_amount: number
    split_ratio: number
    creator_amount: number
    mcn_amount: number
    withholding_rate: number
    withholding_amount: number
    net_creator_amount: number
    status: 'pending' | 'processing' | 'paid' | 'cancelled'
    paid_at: string | null
    settlement_month: string | null
    statement_number?: string | null
    note: string | null
    created_at: string
}

interface RevenueSplit {
    creator_id: string
    split_ratio: number
}

// Bank info per creator (fetched from team_members → profiles)
interface CreatorBankInfo {
    bank_name: string | null
    account_number: string | null
    account_holder: string | null
}

interface SettlementTabProps {
    teamId: string
    // If set, we're in proxy mode showing THIS creator's settlement history
    proxyCreatorId?: string | null
    mcnName?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PROPOSAL_TYPE_LABELS: Record<string, string> = {
    product_application: '제품 지원',
    moment_proposal: '모먼트 제안',
    campaign_application: '캠페인 지원',
}

const STATUS_CONFIG = {
    pending: { label: '지급 대기', color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' },
    processing: { label: '처리 중', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
    paid: { label: '지급 완료', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' },
    cancelled: { label: '취소됨', color: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400' },
}

function getMonthOptions() {
    const months: { value: string; label: string }[] = []
    const now = new Date()
    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월`
        months.push({ value, label })
    }
    return months
}

// ─── CSV Export Helper ────────────────────────────────────────────────────────
function exportSettlementsToCSV(settlements: Settlement[], month: string) {
    const header = ['크리에이터', '협업유형', '브랜드', '총액', '배분율', '크리에이터몫', 'MCN수수료', '원천징수', '실수령액', '상태', '지급일']
    const rows = settlements.map(s => {
        const wh = s.withholding_amount || Math.round(s.creator_amount * 0.033)
        const net = s.net_creator_amount || (s.creator_amount - wh)
        return [
            s.creator_name,
            PROPOSAL_TYPE_LABELS[s.proposal_type] || s.proposal_type,
            s.brand_name || '',
            s.gross_amount,
            `${Math.round(s.split_ratio * 100)}%`,
            s.creator_amount,
            s.mcn_amount,
            wh,
            net,
            STATUS_CONFIG[s.status]?.label || s.status,
            s.paid_at ? new Date(s.paid_at).toLocaleDateString('ko-KR') : '',
        ]
    })

    const csv = [header, ...rows]
        .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n')

    const bom = '\uFEFF' // UTF-8 BOM for Excel Korean compatibility
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `정산내역_${month}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function SettlementTab({ teamId, proxyCreatorId, mcnName = 'MCN' }: SettlementTabProps) {
    const { user, supabase } = useAuth()
    const [settlements, setSettlements] = useState<Settlement[]>([])
    const [revenueSplits, setRevenueSplits] = useState<Record<string, number>>({})
    const [bankInfoMap, setBankInfoMap] = useState<Record<string, CreatorBankInfo>>({})
    const [mcnBusinessInfo, setMcnBusinessInfo] = useState<McnBusinessInfo>({ name: mcnName })
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    })
    const [isLoading, setIsLoading] = useState(true)
    const [splitEditorOpen, setSplitEditorOpen] = useState(false)
    const [editingCreator, setEditingCreator] = useState<{ id: string; name: string; avatar: string | null; currentRatio: number } | null>(null)

    // Bank confirm modal state
    const [bankConfirm, setBankConfirm] = useState<{
        settlementId: string
        creatorId: string
        creatorName: string
        creatorAvatar: string | null
        netAmount: number
        withholdingAmount: number
    } | null>(null)

    // Payment statement modal state
    const [statementCreator, setStatementCreator] = useState<{
        creatorId: string
        creatorName: string
        creatorAvatar: string | null
        items: Settlement[]
        statementNumber: string
    } | null>(null)

    const monthOptions = getMonthOptions()

    // If in proxy creator mode, show CreatorSettlementHistory instead
    if (proxyCreatorId) {
        return (
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        정산 내역
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">이 크리에이터의 정산 수령 내역입니다</p>
                </div>
                <CreatorSettlementHistory />
            </div>
        )
    }

    const fetchSettlements = useCallback(async (month: string) => {
        setIsLoading(true)
        try {
            // Try RPC first, fall back to direct table query
            const { data: rpcData, error: rpcErr } = await supabase.rpc('get_team_settlements', {
                target_team_id: teamId,
                target_month: month,
            })
            if (!rpcErr && rpcData) {
                setSettlements((rpcData as Settlement[]) || [])
            } else {
                // Direct table fallback
                const { data, error } = await supabase
                    .from('settlements')
                    .select(`
                        id, creator_id, brand_id,
                        proposal_type, proposal_id,
                        gross_amount, split_ratio, creator_amount, mcn_amount,
                        withholding_rate, withholding_amount, net_creator_amount,
                        status, paid_at, settlement_month, note, created_at,
                        creator:creator_id (display_name, avatar_url),
                        brand:brand_id (display_name)
                    `)
                    .eq('team_id', teamId)
                    .eq('settlement_month', month)
                    .order('created_at', { ascending: false })
                if (error) {
                    console.warn('[Settlement] fetch error:', error.message)
                    setSettlements([])
                } else {
                    const mapped = (data || []).map((r: any) => ({
                        ...r,
                        creator_name: r.creator?.display_name || '크리에이터',
                        creator_avatar: r.creator?.avatar_url || null,
                        brand_name: r.brand?.display_name || null,
                    }))
                    setSettlements(mapped)
                }
            }
        } catch (err) {
            console.error('[Settlement] fetch error:', err)
            setSettlements([])
        } finally {
            setIsLoading(false)
        }
    }, [supabase, teamId])

    const fetchRevenueSplits = useCallback(async () => {
        try {
            const { data } = await supabase
                .from('mcn_revenue_splits')
                .select('creator_id, split_ratio')
                .eq('team_id', teamId)
            if (data) {
                const map: Record<string, number> = {}
                data.forEach((r: RevenueSplit) => { map[r.creator_id] = r.split_ratio })
                setRevenueSplits(map)
            }
        } catch (err) {
            console.error('[Settlement] fetch splits error:', err)
        }
    }, [supabase, teamId])

    // Fetch bank info for all team creators
    const fetchBankInfo = useCallback(async () => {
        try {
            const { data: members } = await supabase
                .from('team_members')
                .select('user_id, profile:profiles(bank_name, account_number, account_holder)')
                .eq('team_id', teamId)
            if (members) {
                const map: Record<string, CreatorBankInfo> = {}
                for (const m of members as any[]) {
                    map[m.user_id] = {
                        bank_name: m.profile?.bank_name || null,
                        account_number: m.profile?.account_number || null,
                        account_holder: m.profile?.account_holder || null,
                    }
                }
                setBankInfoMap(map)
            }
        } catch (err) {
            console.error('[Settlement] fetch bank info error:', err)
        }
    }, [supabase, teamId])

    // Fetch MCN team business info
    const fetchMcnBusinessInfo = useCallback(async () => {
        if (!teamId) return
        try {
            const { data } = await supabase
                .from('teams')
                .select('name, business_registration_number, representative_name, business_address, stamp_url')
                .eq('id', teamId)
                .single()
            if (data) {
                setMcnBusinessInfo({
                    name: data.name || mcnName,
                    business_registration_number: data.business_registration_number,
                    representative_name: data.representative_name,
                    business_address: data.business_address,
                    stamp_url: data.stamp_url,
                })
            }
        } catch (err) {
            console.warn('[Settlement] fetch MCN business info error:', err)
        }
    }, [supabase, teamId, mcnName])

    // Generate sequential statement number: YYYYMM-XXXXX
    const generateStatementNumber = useCallback((month: string, existingItems: Settlement[]) => {
        const monthKey = month.replace('-', '')
        // Count how many statements in the current data already have a number
        const existingCount = existingItems.filter(s => s.statement_number).length
        const seq = existingCount + 1
        return `${monthKey}-${String(seq).padStart(5, '0')}`
    }, [])

    useEffect(() => {
        if (!teamId) return
        fetchSettlements(selectedMonth)
        fetchRevenueSplits()
        fetchBankInfo()
        fetchMcnBusinessInfo()
    }, [teamId, selectedMonth, fetchSettlements, fetchRevenueSplits, fetchBankInfo, fetchMcnBusinessInfo])

    // ─── Aggregates ────────────────────────────────────
    const totalGross = settlements.reduce((s, r) => s + r.gross_amount, 0)
    const totalCreator = settlements.reduce((s, r) => s + r.creator_amount, 0)
    const totalMcn = settlements.reduce((s, r) => s + r.mcn_amount, 0)
    const totalWithholding = settlements.reduce((s, r) => s + (r.withholding_amount || Math.round(r.creator_amount * 0.033)), 0)
    const totalNet = settlements.reduce((s, r) => s + (r.net_creator_amount || (r.creator_amount - Math.round(r.creator_amount * 0.033))), 0)
    const pendingCount = settlements.filter(r => r.status === 'pending').length
    const paidCount = settlements.filter(r => r.status === 'paid').length

    // Group by creator
    const byCreator = settlements.reduce<Record<string, { name: string; avatar: string | null; total: number; items: Settlement[] }>>(
        (acc, s) => {
            if (!acc[s.creator_id]) {
                acc[s.creator_id] = { name: s.creator_name, avatar: s.creator_avatar, total: 0, items: [] }
            }
            acc[s.creator_id].total += s.net_creator_amount || (s.creator_amount - Math.round(s.creator_amount * 0.033))
            acc[s.creator_id].items.push(s)
            return acc
        },
        {}
    )

    // ─── Handlers ──────────────────────────────────────
    // Open bank confirm instead of direct pay
    const handlePayClick = (s: Settlement) => {
        const bank = bankInfoMap[s.creator_id] || {}
        const wh = s.withholding_amount || Math.round(s.creator_amount * 0.033)
        const net = s.net_creator_amount || (s.creator_amount - wh)
        setBankConfirm({
            settlementId: s.id,
            creatorId: s.creator_id,
            creatorName: s.creator_name,
            creatorAvatar: s.creator_avatar,
            netAmount: net,
            withholdingAmount: wh,
        })
    }

    // Actual mark-paid after bank confirmation
    const handleConfirmPay = async () => {
        if (!bankConfirm) return
        const { settlementId, creatorId, creatorName, netAmount, withholdingAmount } = bankConfirm

        const { error } = await supabase
            .from('settlements')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', settlementId)

        if (error) {
            toast.error('지급 처리 실패: ' + error.message)
            return
        }

        // Update local state
        setSettlements(prev => prev.map(s =>
            s.id === settlementId ? { ...s, status: 'paid', paid_at: new Date().toISOString() } : s
        ))

        // Insert notification to creator
        await supabase.from('notifications').insert({
            recipient_id: creatorId,
            sender_id: user?.id || null,
            type: 'settlement_paid',
            content: `₩${netAmount.toLocaleString()} 정산이 지급되었습니다 (원천징수 3.3% ₩${withholdingAmount.toLocaleString()} 공제 후)`,
            reference_id: settlementId,
            is_read: false,
        })

        toast.success(`${creatorName}님께 ₩${netAmount.toLocaleString()} 지급 완료!`)
        setBankConfirm(null)
    }

    const handleOpenSplitEditor = (creatorId: string, name: string, avatar: string | null) => {
        setEditingCreator({ id: creatorId, name, avatar, currentRatio: revenueSplits[creatorId] ?? 0.70 })
        setSplitEditorOpen(true)
    }

    const handleSplitSaved = (creatorId: string, newRatio: number) => {
        setRevenueSplits(prev => ({ ...prev, [creatorId]: newRatio }))
        setSplitEditorOpen(false)
        setEditingCreator(null)
    }

    const handleOpenStatement = (creatorId: string, name: string, avatar: string | null, items: Settlement[]) => {
        const statementNumber = generateStatementNumber(selectedMonth, settlements)
        setStatementCreator({ creatorId, creatorName: name, creatorAvatar: avatar, items, statementNumber })
    }

    return (
        <div className="space-y-6">
            {/* Header row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        정산 관리
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        완료된 협업의 수익을 크리에이터에게 배분하세요
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 h-9"
                        onClick={() => exportSettlementsToCSV(settlements, selectedMonth)}
                        disabled={settlements.length === 0}
                    >
                        <Download className="h-3.5 w-3.5" />
                        CSV 내보내기
                    </Button>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[160px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {monthOptions.map(m => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary cards — 5개 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs text-muted-foreground">총 매출</span>
                        </div>
                        <p className="text-xl font-bold">₩{totalGross.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-muted-foreground">크리에이터 몫</span>
                        </div>
                        <p className="text-xl font-bold text-blue-600">₩{totalCreator.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-4 w-4 text-violet-600" />
                            <span className="text-xs text-muted-foreground">MCN 수수료</span>
                        </div>
                        <p className="text-xl font-bold text-violet-600">₩{totalMcn.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="border-orange-100 dark:border-orange-900/30">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-orange-500" />
                            <span className="text-xs text-muted-foreground">원천징수 (3.3%)</span>
                        </div>
                        <p className="text-xl font-bold text-orange-500">₩{totalWithholding.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="border-emerald-100 dark:border-emerald-900/30">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span className="text-xs text-muted-foreground">실수령 / 대기</span>
                        </div>
                        <p className="text-xl font-bold text-emerald-600">₩{totalNet.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">대기 {pendingCount}건 · 완료 {paidCount}건</p>
                    </CardContent>
                </Card>
            </div>

            {/* Settlement list */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    정산 내역 로딩 중...
                </div>
            ) : Object.keys(byCreator).length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                        <Wallet className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                        <p className="text-base font-medium text-muted-foreground">
                            {monthOptions.find(m => m.value === selectedMonth)?.label}에는 정산 내역이 없습니다
                        </p>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                            협업이 완료되면 자동으로 정산 내역이 생성됩니다
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Object.entries(byCreator).map(([creatorId, group]) => (
                        <CreatorSettlementGroup
                            key={creatorId}
                            creatorId={creatorId}
                            name={group.name}
                            avatar={group.avatar}
                            totalNetAmount={group.total}
                            splitRatio={revenueSplits[creatorId] ?? 0.70}
                            items={group.items}
                            onPayClick={handlePayClick}
                            onEditSplit={() => handleOpenSplitEditor(creatorId, group.name, group.avatar)}
                            onViewStatement={() => handleOpenStatement(creatorId, group.name, group.avatar, group.items)}
                        />
                    ))}
                </div>
            )}

            {/* Revenue Split Editor Modal */}
            {splitEditorOpen && editingCreator && (
                <RevenueSplitEditor
                    teamId={teamId}
                    creator={editingCreator}
                    onClose={() => { setSplitEditorOpen(false); setEditingCreator(null) }}
                    onSaved={handleSplitSaved}
                />
            )}

            {/* Bank Confirm Modal */}
            {bankConfirm && (
                <BankConfirmModal
                    creatorName={bankConfirm.creatorName}
                    creatorAvatar={bankConfirm.creatorAvatar}
                    bankName={bankInfoMap[bankConfirm.creatorId]?.bank_name || null}
                    accountNumber={bankInfoMap[bankConfirm.creatorId]?.account_number || null}
                    accountHolder={bankInfoMap[bankConfirm.creatorId]?.account_holder || null}
                    netAmount={bankConfirm.netAmount}
                    withholdingAmount={bankConfirm.withholdingAmount}
                    onConfirm={handleConfirmPay}
                    onClose={() => setBankConfirm(null)}
                />
            )}

            {/* Payment Statement Modal */}
            {statementCreator && (
                <PaymentStatementModal
                    mcnInfo={mcnBusinessInfo}
                    creatorName={statementCreator.creatorName}
                    creatorAvatar={statementCreator.creatorAvatar}
                    bankName={bankInfoMap[statementCreator.creatorId]?.bank_name || null}
                    accountNumber={bankInfoMap[statementCreator.creatorId]?.account_number || null}
                    accountHolder={bankInfoMap[statementCreator.creatorId]?.account_holder || null}
                    settlementMonth={selectedMonth}
                    statementNumber={statementCreator.statementNumber}
                    items={statementCreator.items}
                    onClose={() => setStatementCreator(null)}
                />
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────
// Sub-component: Creator Settlement Group (collapsible)
// ─────────────────────────────────────────────────────
interface CreatorSettlementGroupProps {
    creatorId: string
    name: string
    avatar: string | null
    totalNetAmount: number
    splitRatio: number
    items: Settlement[]
    onPayClick: (s: Settlement) => void
    onEditSplit: () => void
    onViewStatement: () => void
}

function CreatorSettlementGroup({
    name, avatar, totalNetAmount, splitRatio, items, onPayClick, onEditSplit, onViewStatement
}: CreatorSettlementGroupProps) {
    const [expanded, setExpanded] = useState(true)
    const hasPending = items.some(i => i.status === 'pending')

    return (
        <Card className={cn("overflow-hidden", hasPending && "ring-1 ring-amber-200 dark:ring-amber-800")}>
            {/* Creator header row */}
            <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => setExpanded(e => !e)}
            >
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={avatar || ''} />
                    <AvatarFallback className="font-bold">{name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{name}</span>
                        <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                            배분율 {Math.round(splitRatio * 100)}%
                        </span>
                        {hasPending && (
                            <Badge variant="outline" className="text-[10px] h-5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400">
                                지급 대기
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {items.length}건 · 실수령 예정 ₩{totalNetAmount.toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 no-print"
                        onClick={e => { e.stopPropagation(); onViewStatement() }}
                        title="지급명세서"
                    >
                        <Receipt className="h-3 w-3" />
                        명세서
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 no-print"
                        onClick={e => { e.stopPropagation(); onEditSplit() }}
                    >
                        <Settings2 className="h-3 w-3" />
                        배분율
                    </Button>
                    {expanded
                        ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    }
                </div>
            </div>

            {expanded && (
                <>
                    <Separator />
                    <div className="divide-y divide-border">
                        {items.map(s => (
                            <SettlementRow
                                key={s.id}
                                settlement={s}
                                onPayClick={() => onPayClick(s)}
                            />
                        ))}
                    </div>
                </>
            )}
        </Card>
    )
}

// ─────────────────────────────────────────────────────
// Sub-component: Individual Settlement Row
// ─────────────────────────────────────────────────────
interface SettlementRowProps {
    settlement: Settlement
    onPayClick: () => void
}

function SettlementRow({ settlement, onPayClick }: SettlementRowProps) {
    const cfg = STATUS_CONFIG[settlement.status]
    const typeLabel = PROPOSAL_TYPE_LABELS[settlement.proposal_type] || settlement.proposal_type
    const withholding = settlement.withholding_amount || Math.round(settlement.creator_amount * 0.033)
    const netAmount = settlement.net_creator_amount || (settlement.creator_amount - withholding)

    return (
        <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">
                        {settlement.brand_name || '브랜드'} 협업
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {typeLabel}
                    </span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", cfg.color)}>
                        {cfg.label}
                    </span>
                </div>
                {/* Amount breakdown 2-line */}
                <div className="mt-1.5 text-xs space-y-0.5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span>총 ₩{settlement.gross_amount.toLocaleString()}</span>
                        <span>→</span>
                        <span className="text-blue-600 font-medium">크리에이터 ₩{settlement.creator_amount.toLocaleString()}</span>
                        <span className="hidden sm:inline text-violet-600">MCN ₩{settlement.mcn_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-orange-500">원천징수 -₩{withholding.toLocaleString()}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-emerald-600 font-semibold">실수령 ₩{netAmount.toLocaleString()}</span>
                        <span className="text-muted-foreground ml-auto">
                            {new Date(settlement.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>
            {settlement.status === 'pending' && (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs shrink-0 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                    onClick={onPayClick}
                >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    지급하기
                </Button>
            )}
            {settlement.status === 'paid' && settlement.paid_at && (
                <span className="text-xs text-emerald-600 shrink-0">
                    {new Date(settlement.paid_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })} 지급완료
                </span>
            )}
        </div>
    )
}
