"use client"

import { CreatorSettlementHistory } from "@/components/creator/settlement-history"
import { useAuth } from "@/components/providers/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ArrowRight, Building2, CheckCircle2, Clock, DollarSign, Download, FileText, Loader2, Minus, Receipt, Search, Users, Wallet } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { BankConfirmModal } from "./bank-confirm-modal"
import { PaymentStatementModal, type McnBusinessInfo } from "./payment-statement-modal"
import { RevenueSplitEditor } from "./revenue-split-editor"
import { Portal } from "@radix-ui/react-portal"

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
    status: 'escrow' | 'void' | 'pending' | 'processing' | 'paid' | 'cancelled'
    paid_at: string | null
    settlement_month: string | null
    statement_number?: string | null
    note: string | null
    created_at: string
    tax_invoice_status?: string | null
    tax_invoice_requested_at?: string | null
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
    escrow: { label: '입금 예정 (진행 중)', color: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400' },
    pending: { label: '지급 대기', color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' },
    processing: { label: '처리 중', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
    paid: { label: '지급 완료', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' },
    cancelled: { label: '취소됨', color: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400' },
    void: { label: '무효 처리됨', color: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400' },
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
export function SettlementTab({ teamId, mcnName = 'MCN' }: SettlementTabProps) {
    const { user, supabase } = useAuth()
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    })

    const fetchSettlements = async () => {
        if (!teamId) return null;

        // 1. Settlements
        const { data: rawSettlements, error: err1 } = await supabase
            .from('settlements')
            .select(`
                id, creator_id, brand_id, workspace_id,
                proposal_type, proposal_id,
                gross_amount, split_ratio, creator_amount, mcn_amount,
                withholding_rate, withholding_amount, net_creator_amount,
                status, paid_at, settlement_month, note, created_at,
                tax_invoice_status, tax_invoice_requested_at, statement_number,
                creator:profiles!settlements_creator_id_fkey (display_name, avatar_url),
                brand:profiles!settlements_brand_id_fkey (display_name)
            `)
            .eq('team_id', teamId)
            .eq('settlement_month', selectedMonth)
            .order('created_at', { ascending: false });

        if (err1) throw err1;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedSettlements = (rawSettlements || []).map((r: any) => ({
            ...r,
            creator_name: r.creator?.display_name || '크리에이터',
            creator_avatar: r.creator?.avatar_url || null,
            brand_name: r.brand?.display_name || null,
        }));

        // 2. Revenue Splits
        const { data: splitsData } = await supabase
            .from('mcn_revenue_splits')
            .select('creator_id, split_ratio')
            .eq('team_id', teamId);

        const splitsMap: Record<string, number> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (splitsData || []).forEach((r: any) => { splitsMap[r.creator_id] = r.split_ratio; });

        // 3. Bank Info
        const { data: members } = await supabase
            .from('team_members')
            .select('user_id, profile:profiles(bank_name, account_number, account_holder)')
            .eq('team_id', teamId);

        const bankMap: Record<string, CreatorBankInfo> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const m of (members as any[] || [])) {
            bankMap[m.user_id] = {
                bank_name: m.profile?.bank_name || null,
                account_number: m.profile?.account_number || null,
                account_holder: m.profile?.account_holder || null,
            };
        }

        // 4. MCN Biz Info
        const { data: teamData } = await supabase
            .from('teams')
            .select('name, business_registration_number, representative_name, business_address, stamp_url')
            .eq('id', teamId)
            .single();

        return {
            settlements: mappedSettlements,
            revenueSplits: splitsMap,
            bankInfoMap: bankMap,
            mcnBusinessInfo: teamData ? {
                name: teamData.name || mcnName,
                business_registration_number: teamData.business_registration_number,
                representative_name: teamData.representative_name,
                business_address: teamData.business_address,
                stamp_url: teamData.stamp_url,
            } : null
        };
    };

    const { data: swrData, error: swrError, mutate } = useSWR(
        teamId ? `settlements-${teamId}-${selectedMonth}` : null,
        fetchSettlements,
        {
            revalidateOnFocus: true,     // Instant refresh across tabs
            revalidateOnMount: true,     // Always fetch latest
            dedupingInterval: 2000       // Prevent spam
        }
    );

    const isLoading = !swrData && !swrError && !!teamId;
    const EMPTY_ARRAY: any[] = [];
    const settlements = swrData?.settlements || EMPTY_ARRAY;
    const revenueSplits = swrData?.revenueSplits || {};
    const bankInfoMap = swrData?.bankInfoMap || {};
    const mcnBusinessInfo = swrData?.mcnBusinessInfo || {
        name: mcnName,
    };

    const [splitEditorOpen, setSplitEditorOpen] = useState(false)
    const [editingCreator, setEditingCreator] = useState<{ id: string; name: string; avatar: string | null; currentRatio: number } | null>(null)

    // Filters state
    const [searchQuery, setSearchQuery] = useState("")
    const [creatorFilter, setCreatorFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    // Per-row manual deductions (local state — Phase 2: persist to DB)
    const [rowDeductions, setRowDeductions] = useState<Record<string, { deduction: number; recoup: number }>>({})
    const handleDeductionChange = useCallback((id: string, field: 'deduction' | 'recoup', val: number) => {
        setRowDeductions(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }))
    }, [])

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

    // Generate sequential statement number: YYYYMM-XXXXX
    const generateStatementNumber = useCallback((month: string, existingItems: Settlement[]) => {
        const monthKey = month.replace('-', '')
        // Count how many statements in the current data already have a number
        const existingCount = existingItems.filter(s => s.statement_number).length
        const seq = existingCount + 1
        return `${monthKey}-${String(seq).padStart(5, '0')}`
    }, [])

    // Unique creators for filter
    const uniqueCreators = useMemo(() => Array.from(
        new Map(settlements.map(s => [s.creator_id, { id: s.creator_id, name: s.creator_name }])).values()
    ), [settlements])

    // Apply filters
    const filteredSettlements = useMemo(() => {
        return settlements.filter(s => {
            if (statusFilter !== 'all' && s.status !== statusFilter) return false;
            if (creatorFilter !== 'all' && s.creator_id !== creatorFilter) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const typeLabel = PROPOSAL_TYPE_LABELS[s.proposal_type] || s.proposal_type;
                if (!s.brand_name?.toLowerCase().includes(q) && !typeLabel.toLowerCase().includes(q)) {
                    return false;
                }
            }
            return true;
        });
    }, [settlements, statusFilter, creatorFilter, searchQuery]);

    // ─── Aggregates ────────────────────────────────────
    const validSettlements = filteredSettlements.filter(s => s.status !== 'void' && s.status !== 'cancelled')
    const totalGross = validSettlements.reduce((s, r) => s + r.gross_amount, 0)
    const totalCreator = validSettlements.reduce((s, r) => s + r.creator_amount, 0)
    const totalMcn = validSettlements.reduce((s, r) => s + r.mcn_amount, 0)
    const totalWithholding = validSettlements.reduce((s, r) => s + (r.withholding_amount || Math.round(r.creator_amount * 0.033)), 0)
    const totalNet = validSettlements.reduce((s, r) => s + (r.net_creator_amount || (r.creator_amount - Math.round(r.creator_amount * 0.033))), 0)
    const pendingCount = validSettlements.filter(r => r.status === 'pending' || r.status === 'escrow').length
    const paidCount = validSettlements.filter(r => r.status === 'paid').length

    // Group by creator
    const byCreator = validSettlements.reduce<Record<string, { name: string; avatar: string | null; total: number; items: Settlement[] }>>(
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

        // Optimistic SWR Update
        if (swrData) {
            mutate({ ...swrData, settlements: swrData.settlements.map(s => s.id === settlementId ? { ...s, status: 'paid', paid_at: new Date().toISOString() } : s) }, false);
        }

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
        if (swrData) mutate({ ...swrData, revenueSplits: { ...swrData.revenueSplits, [creatorId]: newRatio } }, false);
        setSplitEditorOpen(false)
        setEditingCreator(null)
    }

    const handleOpenStatement = (creatorId: string, name: string, avatar: string | null, items: Settlement[]) => {
        const statementNumber = generateStatementNumber(selectedMonth, settlements)
        setStatementCreator({ creatorId, creatorName: name, creatorAvatar: avatar, items, statementNumber })
    }

    const handleRequestTaxInvoice = async (settlementId: string) => {
        const { error } = await supabase
            .from('settlements')
            .update({
                tax_invoice_status: 'requested',
                tax_invoice_requested_at: new Date().toISOString()
            })
            .eq('id', settlementId)

        if (error) {
            toast.error('세금계산서 요청 실패: ' + error.message)
            return
        }

        // Optimistic update via SWR mutate
        if (swrData) {
            mutate({
                ...swrData,
                settlements: swrData.settlements.map(s =>
                    s.id === settlementId
                        ? { ...s, tax_invoice_status: 'requested', tax_invoice_requested_at: new Date().toISOString() }
                        : s
                )
            }, false)
        }
        toast.success(`플랫폼에 세금계산서 발행을 요청했습니다.`)
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
                        onClick={() => exportSettlementsToCSV(filteredSettlements, selectedMonth)}
                        disabled={filteredSettlements.length === 0}
                    >
                        <Download className="h-3.5 w-3.5" />
                        CSV 내보내기 (표시된 내역)
                    </Button>
                    <Select value={selectedMonth} onValueChange={(v) => {
                        setSelectedMonth(v)
                        setSearchQuery("")
                        setCreatorFilter("all")
                        setStatusFilter("all")
                    }}>
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

            {/* Filters Row */}
            <div className="flex items-center gap-3 flex-wrap bg-muted/40 p-2.5 rounded-lg border border-border/50">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="브랜드명, 협업유형 검색..."
                        className="pl-9 h-9 bg-background"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                    <SelectTrigger className="w-[150px] h-9 bg-background">
                        <SelectValue placeholder="크리에이터 필터" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체 크리에이터</SelectItem>
                        {uniqueCreators.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-9 bg-background">
                        <SelectValue placeholder="상태 필터" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체 상태</SelectItem>
                        <SelectItem value="pending">지급 대기</SelectItem>
                        <SelectItem value="processing">처리 중</SelectItem>
                        <SelectItem value="paid">지급 완료</SelectItem>
                    </SelectContent>
                </Select>
                {(searchQuery || creatorFilter !== 'all' || statusFilter !== 'all') && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            setSearchQuery("")
                            setCreatorFilter("all")
                            setStatusFilter("all")
                        }}
                    >
                        초기화
                    </Button>
                )}
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
                <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                    {/* Waterfall Header */}
                    <div className="grid grid-cols-[220px_1fr_auto] gap-0 border-b bg-muted/40 px-4 py-2.5">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">크리에이터 · 프로젝트</span>
                        <div className="flex items-center gap-0">
                            <span className="w-[130px] text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right pr-3">Gross</span>
                            <span className="w-5" />
                            <span className="w-[130px] text-[11px] font-semibold text-violet-500 uppercase tracking-wide text-right pr-3">MCN 수수료</span>
                            <span className="w-5" />
                            <span className="w-[120px] text-[11px] font-semibold text-rose-400 uppercase tracking-wide text-right pr-3">제작비 공제</span>
                            <span className="w-5" />
                            <span className="w-[120px] text-[11px] font-semibold text-rose-500 uppercase tracking-wide text-right pr-3">선급금 회수</span>
                            <span className="w-5" />
                            <span className="w-[120px] text-[11px] font-semibold text-orange-400 uppercase tracking-wide text-right pr-3">원천징수 3.3%</span>
                            <span className="w-5" />
                            <span className="w-[140px] text-[11px] font-semibold text-emerald-600 uppercase tracking-wide text-right pr-3">실수령 Net</span>
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right">상태 · 관리</span>
                    </div>

                    {/* Waterfall Rows */}
                    <div className="divide-y divide-border/60">
                        {filteredSettlements.map(s => {
                            const ratio = revenueSplits[s.creator_id] ?? 0.70;
                            const cfg = STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG] || { label: s.status, color: '' };
                            const typeLabel = PROPOSAL_TYPE_LABELS[s.proposal_type] || s.proposal_type;
                            const mcnFee = s.mcn_amount || Math.round(s.gross_amount * (1 - ratio));
                            const creatorGross = s.creator_amount || Math.round(s.gross_amount * ratio);
                            // Manual deductions
                            const deduction = rowDeductions[s.id]?.deduction || 0;
                            const recoup = rowDeductions[s.id]?.recoup || 0;
                            const adjustedBase = Math.max(0, creatorGross - deduction - recoup);
                            const withholding = Math.round(adjustedBase * 0.033);
                            const netAmount = Math.max(0, adjustedBase - withholding);
                            const hasPending = s.status === 'pending';

                            return (
                                <div
                                    key={s.id}
                                    className="grid grid-cols-[220px_1fr_auto] gap-0 px-4 py-3.5 hover:bg-muted/20 transition-colors group items-center"
                                >
                                    {/* Left: Creator + Project */}
                                    <div className="flex items-center gap-3 min-w-0 pr-4">
                                        <Avatar className="h-9 w-9 border-2 border-border shrink-0">
                                            <AvatarImage src={s.creator_avatar || ''} />
                                            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{s.creator_name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-sm truncate">{s.creator_name}</span>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded truncate max-w-[100px]">{s.brand_name || '브랜드'}</span>
                                                <span className="text-[10px] text-muted-foreground/60">{typeLabel}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center: Waterfall Formula */}
                                    <div className="flex items-center gap-0">
                                        {/* GROSS */}
                                        <div className="w-[130px] flex flex-col items-end pr-3">
                                            <span className="text-[10px] text-muted-foreground font-medium mb-0.5">총 협찬금</span>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                                                ₩{s.gross_amount.toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Arrow + MCN Fee */}
                                        <div className="flex items-center">
                                            <div className="flex items-center justify-center w-5">
                                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                                            </div>
                                            <div className="w-[130px] flex flex-col items-end pr-3">
                                                <div className="flex items-center gap-1 mb-0.5">
                                                    <span className="text-[10px] text-violet-500 font-medium">MCN</span>
                                                    <span
                                                        className="text-[10px] text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-1 py-0.5 rounded cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-950/60 transition-colors"
                                                        onClick={() => handleOpenSplitEditor(s.creator_id, s.creator_name, s.creator_avatar)}
                                                        title="배분율 수정"
                                                    >
                                                        {Math.round((1 - ratio) * 100)}%
                                                    </span>
                                                </div>
                                                <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 tabular-nums">
                                                    −₩{mcnFee.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Arrow + 제작비 공제 (editable) */}
                                        <div className="flex items-center">
                                            <div className="flex items-center justify-center w-5">
                                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                                            </div>
                                            <div className="w-[120px] flex flex-col items-end pr-3">
                                                <span className="text-[10px] text-rose-400 font-medium mb-0.5">제작비 공제</span>
                                                <div className="flex items-center gap-0.5">
                                                    <span className="text-sm font-semibold text-rose-500">−₩</span>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        className="w-16 text-sm font-semibold text-rose-500 bg-transparent border-b border-rose-200 dark:border-rose-800 focus:outline-none focus:border-rose-400 text-right tabular-nums"
                                                        value={deduction || ''}
                                                        placeholder="0"
                                                        onChange={e => handleDeductionChange(s.id, 'deduction', Number(e.target.value) || 0)}
                                                        onClick={e => e.stopPropagation()}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Arrow + 선급금 회수 (editable) */}
                                        <div className="flex items-center">
                                            <div className="flex items-center justify-center w-5">
                                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                                            </div>
                                            <div className="w-[120px] flex flex-col items-end pr-3">
                                                <span className="text-[10px] text-rose-600 font-medium mb-0.5">선급금 회수</span>
                                                <div className="flex items-center gap-0.5">
                                                    <span className="text-sm font-semibold text-rose-600">−₩</span>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        className="w-16 text-sm font-semibold text-rose-600 bg-transparent border-b border-rose-300 dark:border-rose-700 focus:outline-none focus:border-rose-500 text-right tabular-nums"
                                                        value={recoup || ''}
                                                        placeholder="0"
                                                        onChange={e => handleDeductionChange(s.id, 'recoup', Number(e.target.value) || 0)}
                                                        onClick={e => e.stopPropagation()}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Arrow + Withholding (recalculated) */}
                                        <div className="flex items-center">
                                            <div className="flex items-center justify-center w-5">
                                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                                            </div>
                                            <div className="w-[120px] flex flex-col items-end pr-3">
                                                <span className="text-[10px] text-orange-400 font-medium mb-0.5">원천징수</span>
                                                <span className="text-sm font-semibold text-orange-500 dark:text-orange-400 tabular-nums">
                                                    −₩{withholding.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Arrow + NET */}
                                        <div className="flex items-center">
                                            <div className="flex items-center justify-center w-5">
                                                <ArrowRight className="h-3.5 w-3.5 text-emerald-400/70" strokeWidth={2.5} />
                                            </div>
                                            <div className="w-[140px] flex flex-col items-end pr-3">
                                                <span className="text-[10px] text-emerald-600 font-semibold mb-0.5">🏦 실수령</span>
                                                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
                                                    ₩{netAmount.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Status + Actions */}
                                    <div className="flex items-center gap-2 pl-4 border-l border-border/40">
                                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap", cfg.color)}>
                                            {cfg.label}
                                        </Badge>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                onClick={() => handleOpenStatement(s.creator_id, s.creator_name, s.creator_avatar, [s])}
                                                title="명세서 발급"
                                            >
                                                <Receipt className="h-3.5 w-3.5" />
                                            </Button>
                                            {s.status === 'pending' && (!s.tax_invoice_status || s.tax_invoice_status === 'none') && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-blue-600"
                                                    onClick={() => handleRequestTaxInvoice(s.id)}
                                                    title="세금계산서 요청"
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                            {hasPending && (
                                                <Button
                                                    size="sm"
                                                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-sm"
                                                    onClick={() => handlePayClick(s)}
                                                >
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    지급
                                                </Button>
                                            )}
                                            {s.status === 'paid' && s.paid_at && (
                                                <span className="text-[10px] text-emerald-600 font-semibold whitespace-nowrap">
                                                    ✓ {new Date(s.paid_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Revenue Split Editor Modal */}
            {splitEditorOpen && editingCreator && (
                <Portal>
                    <RevenueSplitEditor
                        teamId={teamId}
                        creator={editingCreator}
                        onClose={() => { setSplitEditorOpen(false); setEditingCreator(null) }}
                        onSaved={handleSplitSaved}
                    />
                </Portal>
            )}

            {/* Bank Confirm Modal */}
            {bankConfirm && (
                <Portal>
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
                </Portal>
            )}

            {/* Payment Statement Modal */}
            {statementCreator && (
                <Portal>
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
                </Portal>
            )}
        </div>
    )
}

