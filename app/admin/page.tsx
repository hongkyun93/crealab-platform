"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { AlertCircle, Briefcase, Calendar, CheckCircle2, Layers, Shield, Trash2, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

// ─── Types ───────────────────────────────────────────────────────────────────
interface AdminMoment {
    id: string
    title: string
    category: string
    created_at: string
    creator_id: string
    creator?: { display_name: string }
}

interface AdminProposal {
    id: string
    type: 'product_application' | 'moment_proposal' | 'campaign_application'
    brand_name?: string
    creator_name?: string
    price_offer?: number
    status?: string
    content_submission_status?: string
    created_at: string
}

interface AdminPaymentPending {
    id: string
    type: 'product_application' | 'moment_proposal' | 'campaign_application'
    brand_id?: string
    creator_id?: string
    price_offer?: number
    contract_status?: string
    payment_confirmed_at?: string | null
    created_at: string
}

interface AdminWorkspace {
    id: string
    brand_id?: string
    creator_id?: string
    status?: string
    type?: string
    created_at: string
    brand?: { display_name: string }
    creator?: { display_name: string }
}

export default function AdminPage() {
    const { user, supabase } = useAuth()
    const { sendNotification } = useUnifiedProvider()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("moments")

    // ── 데이터 ────────────────────────────────────────────────────
    const [moments, setMoments] = useState<AdminMoment[]>([])
    const [proposals, setProposals] = useState<AdminProposal[]>([])
    const [workspaces, setWorkspaces] = useState<AdminWorkspace[]>([])
    const [pendingPayments, setPendingPayments] = useState<AdminPaymentPending[]>([])
    const [confirmedPayments, setConfirmedPayments] = useState<AdminPaymentPending[]>([])
    const [settlements, setSettlements] = useState<any[]>([])

    // ── 로딩 ─────────────────────────────────────────────────────
    const [loadingMoments, setLoadingMoments] = useState(false)
    const [loadingProposals, setLoadingProposals] = useState(false)
    const [loadingWorkspaces, setLoadingWorkspaces] = useState(false)
    const [loadingPayments, setLoadingPayments] = useState(false)
    const [loadingConfirmed, setLoadingConfirmed] = useState(false)
    const [loadingSettlements, setLoadingSettlements] = useState(false)
    const [loadingDeposits, setLoadingDeposits] = useState(false)

    // ── 예치금 충전 대기 ──
    const [pendingDeposits, setPendingDeposits] = useState<any[]>([])
    const [confirmingDepositId, setConfirmingDepositId] = useState<string | null>(null)

    // ── 액션 상태 ─────────────────────────────────────────────────
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmingId, setConfirmingId] = useState<string | null>(null)
    const [payingId, setPayingId] = useState<string | null>(null)

    // ── 접근 제어 ─────────────────────────────────────────────────
    useEffect(() => {
        if (user && user.role !== 'admin') router.push('/')
    }, [user, router])

    // ── Fetch Functions ────────────────────────────────────────────

    const fetchMoments = useCallback(async () => {
        setLoadingMoments(true)
        try {
            const { data, error } = await supabase
                .from('life_moments')
                .select('id, title, category, created_at, creator_id, profiles(display_name, avatar_url)')
                .order('created_at', { ascending: false })
                .limit(200)
            if (error) console.error('[Admin] moments error:', error)
            setMoments((data ?? []) as unknown as AdminMoment[])
        } catch (e) { console.error(e) }
        finally { setLoadingMoments(false) }
    }, [supabase])

    const fetchProposals = useCallback(async () => {
        setLoadingProposals(true)
        try {
            // brand_proposals
            const { data: bp, error: bpErr } = await supabase
                .from('product_applications')
                .select('id, price_offer, status, content_submission_status, created_at, brand_id, creator_id, brand:profiles!product_applications_brand_id_fkey(display_name), creator:profiles!product_applications_creator_id_fkey(display_name)')

                .order('created_at', { ascending: false })
                .limit(100)
            if (bpErr) console.error('[Admin] brand_proposals error:', bpErr)

            // moment_proposals
            const { data: mp, error: mpErr } = await supabase
                .from('moment_proposals')
                .select('id, price_offer, status, content_submission_status, created_at, brand_id, creator_id, brand:profiles!moment_proposals_brand_id_fkey(display_name), creator:profiles!moment_proposals_creator_id_fkey(display_name)')
                .order('created_at', { ascending: false })
                .limit(100)
            if (mpErr) console.error('[Admin] moment_proposals error:', mpErr)

            // campaign_applications
            const { data: ca, error: caErr } = await supabase
                .from('campaign_applications')
                .select('id, status, created_at, creator_id')
                .order('created_at', { ascending: false })
                .limit(100)
            // caErr는 RLS 차단 시 {} 로 오는 경우 있음 — admin_rls_bypass.sql 마이그레이션 실행 후 해결
            if (caErr && Object.keys(caErr).length > 0) console.error('[Admin] campaign_applications error:', caErr)

            const mapped: AdminProposal[] = [
                ...(bp ?? []).map((p: any) => ({
                    id: p.id, type: 'product_application' as const,
                    brand_name: p.brand?.display_name || p.brand_id?.slice(0, 8) || '-',
                    creator_name: p.creator?.display_name || p.creator_id?.slice(0, 8) || '-',
                    price_offer: p.price_offer,
                    status: p.status,
                    content_submission_status: p.content_submission_status,
                    created_at: p.created_at,
                })),
                ...(mp ?? []).map((p: any) => ({
                    id: p.id, type: 'moment_proposal' as const,
                    brand_name: p.brand?.display_name || p.brand_id?.slice(0, 8) || '-',
                    creator_name: p.creator?.display_name || p.creator_id?.slice(0, 8) || '-',
                    price_offer: p.price_offer,
                    status: p.status,
                    content_submission_status: p.content_submission_status,
                    created_at: p.created_at,
                })),
                ...(ca ?? []).map((p: any) => ({
                    id: p.id, type: 'campaign_application' as const,
                    creator_name: p.creator_id?.slice(0, 8) || '-',
                    status: p.status,
                    created_at: p.created_at,
                })),
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

            setProposals(mapped)
        } catch (e) { console.error(e) }
        finally { setLoadingProposals(false) }
    }, [supabase])

    const fetchWorkspaces = useCallback(async () => {
        setLoadingWorkspaces(true)
        try {
            const { data, error } = await supabase
                .from('workspaces')
                .select('id, brand_id, creator_id, status, type, created_at')
                .order('created_at', { ascending: false })
                .limit(200)
            if (error && Object.keys(error).length > 0) console.error('[Admin] workspaces error:', error)
            setWorkspaces((data ?? []) as unknown as AdminWorkspace[])
        } catch (e) { console.error(e) }
        finally { setLoadingWorkspaces(false) }
    }, [supabase])

    const fetchPendingPayments = useCallback(async () => {
        setLoadingPayments(true)
        try {
            const fields = 'id, price_offer, contract_status, payment_confirmed_at, created_at, brand_id, creator_id'

            const [{ data: pa }, { data: mp }, { data: ca }] = await Promise.all([
                supabase.from('product_applications')
                    .select(fields)
                    .eq('contract_status', 'signed')
                    .is('payment_confirmed_at', null)
                    .order('created_at', { ascending: false }),
                supabase.from('moment_proposals')
                    .select(fields)
                    .eq('contract_status', 'signed')
                    .is('payment_confirmed_at', null)
                    .order('created_at', { ascending: false }),
                supabase.from('campaign_applications')
                    .select(fields)
                    .eq('contract_status', 'signed')
                    .is('payment_confirmed_at', null)
                    .order('created_at', { ascending: false }),
            ])

            const merged: AdminPaymentPending[] = [
                ...(pa ?? []).map((r: any) => ({ ...r, type: 'product_application' as const })),
                ...(mp ?? []).map((r: any) => ({ ...r, type: 'moment_proposal' as const })),
                ...(ca ?? []).map((r: any) => ({ ...r, type: 'campaign_application' as const })),
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

            // profiles 배치 조회 → 브랜드 이름 매핑
            const allIds = [...new Set(merged.map(r => r.brand_id).filter(Boolean))]
            if (allIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, display_name')
                    .in('id', allIds)
                const profileMap: Record<string, string> = {}
                profiles?.forEach((p: any) => { profileMap[p.id] = p.display_name })
                merged.forEach((r: any) => { r.brand_name = profileMap[r.brand_id] || r.brand_id?.slice(0, 8) })
            }

            setPendingPayments(merged)
        } catch (e) { console.error('[Admin] fetchPendingPayments error:', e) }
        finally { setLoadingPayments(false) }
    }, [supabase])

    const fetchConfirmedPayments = useCallback(async () => {
        setLoadingConfirmed(true)
        try {
            const fields = 'id, price_offer, contract_status, payment_confirmed_at, created_at, brand_id, creator_id'
            const [{ data: pa }, { data: mp }, { data: ca }] = await Promise.all([
                supabase.from('product_applications')
                    .select(fields)
                    .eq('contract_status', 'signed')
                    .not('payment_confirmed_at', 'is', null)
                    .order('payment_confirmed_at', { ascending: false }),
                supabase.from('moment_proposals')
                    .select(fields)
                    .eq('contract_status', 'signed')
                    .not('payment_confirmed_at', 'is', null)
                    .order('payment_confirmed_at', { ascending: false }),
                supabase.from('campaign_applications')
                    .select(fields)
                    .eq('contract_status', 'signed')
                    .not('payment_confirmed_at', 'is', null)
                    .order('payment_confirmed_at', { ascending: false }),
            ])
            const merged: AdminPaymentPending[] = [
                ...(pa ?? []).map((r: any) => ({ ...r, type: 'product_application' as const })),
                ...(mp ?? []).map((r: any) => ({ ...r, type: 'moment_proposal' as const })),
                ...(ca ?? []).map((r: any) => ({ ...r, type: 'campaign_application' as const })),
            ].sort((a, b) => new Date(b.payment_confirmed_at!).getTime() - new Date(a.payment_confirmed_at!).getTime())
            setConfirmedPayments(merged)
        } catch (e) { console.error('[Admin] fetchConfirmedPayments error:', e) }
        finally { setLoadingConfirmed(false) }
    }, [supabase])

    const fetchSettlements = useCallback(async () => {
        setLoadingSettlements(true)
        try {
            const { data, error } = await supabase
                .from('settlements')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100)
            if (error) console.error('[Admin] settlements error:', error)
            setSettlements(data ?? [])
        } catch (e) { console.error(e) }
        finally { setLoadingSettlements(false) }
    }, [supabase])

    // ── Tab 전환 시 로드 ──────────────────────────────────────────
    useEffect(() => {
        if (activeTab === 'moments') fetchMoments()
        if (activeTab === 'proposals') fetchProposals()
        if (activeTab === 'workspaces') fetchWorkspaces()
        if (activeTab === 'payments') fetchPendingPayments()
        if (activeTab === 'payments_done') fetchConfirmedPayments()
        if (activeTab === 'settlements') fetchSettlements()
        if (activeTab === 'deposits') fetchPendingDeposits()
    }, [activeTab]) // eslint-disable-line

    // ── 액션 ──────────────────────────────────────────────────────

    const handleDeleteMoment = async (id: string) => {
        if (!confirm('이 모먼트를 삭제하시겠습니까?')) return
        setDeletingId(id)
        const { error } = await supabase.from('influencer_events').delete().eq('id', id)
        if (error) toast.error(error.message)
        else { toast.success('삭제되었습니다.'); fetchMoments() }
        setDeletingId(null)
    }

    const handleConfirmPayment = async (item: AdminPaymentPending) => {
        setConfirmingId(item.id)
        const tableMap = {
            product_application: 'product_applications',
            moment_proposal: 'moment_proposals',
            campaign_application: 'campaign_applications',
        } as const
        const table = tableMap[item.type]
        const confirmedAt = new Date().toISOString()

        const { error } = await supabase
            .from(table)
            .update({ payment_confirmed_at: confirmedAt })
            .eq('id', item.id)

        if (error) {
            toast.error(error.message)
        } else {
            toast.success('입금 확인 완료! 배송 단계가 활성화됩니다.')

            // 브랜드 알림
            if (item.brand_id) {
                await sendNotification(
                    item.brand_id,
                    '광고비 입금이 확인되었습니다. 이제 제품을 배송해 주세요.',
                    'payment_confirmed',
                    item.id
                )
            }
            // 크리에이터 알림
            if (item.creator_id) {
                await sendNotification(
                    item.creator_id,
                    '브랜드 광고비 입금이 확인되었습니다. 배송 준비 중입니다.',
                    'payment_confirmed',
                    item.id
                )
            }

            fetchPendingPayments()
            fetchConfirmedPayments()
        }
        setConfirmingId(null)
    }

    const handleMarkPaid = async (settlementId: string) => {
        setPayingId(settlementId)

        // Fetch creator_id before updating
        const { data: settlement } = await supabase
            .from('settlements')
            .select('creator_id, amount')
            .eq('id', settlementId)
            .single()

        const { error } = await supabase
            .from('settlements')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', settlementId)
        if (error) {
            toast.error(error.message)
        } else {
            toast.success('지급 완료 처리되었습니다.')
            fetchSettlements()

            // 🔔 크리에이터에게 정산 완료 알림
            if (settlement?.creator_id) {
                try {
                    const amountText = settlement.amount ? `${Number(settlement.amount).toLocaleString()}원` : '정산금'
                    await sendNotification(
                        settlement.creator_id,
                        `${amountText}이 정산 지급되었습니다. 확인해보세요!`,
                        'settlement_paid',
                        settlementId
                    )
                } catch (notifErr) {
                    console.warn('정산 알림 발송 실패 (무시):', notifErr)
                }
            }
        }
        setPayingId(null)
    }

    // ── 예치금 충전 확인 ──────────────────────────────────────────
    const fetchPendingDeposits = useCallback(async () => {
        setLoadingDeposits(true)
        try {
            const { data, error } = await supabase
                .from('brand_deposits')
                .select('*, brand:profiles!brand_deposits_brand_id_fkey(display_name, representative_name)')
                .eq('type', 'charge')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
            if (error) console.error('[Admin] fetchPendingDeposits:', error)
            setPendingDeposits(data ?? [])
        } finally { setLoadingDeposits(false) }
    }, [supabase])

    const handleConfirmDeposit = async (deposit: any, amount: number) => {
        setConfirmingDepositId(deposit.id)
        try {
            // 1. 현재 잔액 조회
            const { data: profileData } = await supabase
                .from('profiles')
                .select('deposit_balance')
                .eq('id', deposit.brand_id)
                .single()
            const currentBalance = profileData?.deposit_balance ?? 0
            const newBalance = currentBalance + amount

            // 2+3. SECURITY DEFINER 함수로 brand_deposits + profiles.deposit_balance 동시 업데이트
            // (profiles UPDATE RLS는 본인만 허용 → 함수가 DB owner 권한으로 우회)
            const { error: rpcErr } = await supabase.rpc('admin_confirm_deposit', {
                p_deposit_id: deposit.id,
                p_brand_id: deposit.brand_id,
                p_amount: amount,
                p_new_balance: newBalance,
                p_confirmed_by: user?.id ?? null,
            })
            if (rpcErr) throw rpcErr

            // 4. 브랜드 알림
            await sendNotification(
                deposit.brand_id,
                `예치금 ₩${amount.toLocaleString()} 충전이 완료되었습니다. 현재 잔액: ₩${newBalance.toLocaleString()}`,
                'deposit_confirmed',
                deposit.id
            )

            toast.success(`₩${amount.toLocaleString()} 충전 완료!`)
            fetchPendingDeposits()
        } catch (err: any) {
            toast.error(err?.message ?? '충전 확인 중 오류가 발생했습니다.')
        } finally {
            setConfirmingDepositId(null)
        }
    }

    const typeLabel: Record<string, string> = {
        product_application: '제품 지원',
        moment_proposal: '모먼트 제안',
        campaign_application: '캠페인 지원',
    }
    const typeColor: Record<string, string> = {
        product_application: 'bg-indigo-100 text-indigo-700',
        moment_proposal: 'bg-emerald-100 text-emerald-700',
        campaign_application: 'bg-amber-100 text-amber-700',
    }

    if (!user || user.role !== 'admin') return null

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-10 max-w-7xl mx-auto px-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">관리자 패널</h1>
                        <p className="text-muted-foreground">플랫폼의 모든 데이터를 관리합니다.</p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-background border flex-wrap h-auto gap-1 p-1">
                        <TabsTrigger value="moments" className="gap-1.5"><Calendar className="h-3.5 w-3.5" /> 모먼트 ({moments.length})</TabsTrigger>
                        <TabsTrigger value="proposals" className="gap-1.5"><Briefcase className="h-3.5 w-3.5" /> 협업 제안 ({proposals.length})</TabsTrigger>
                        <TabsTrigger value="workspaces" className="gap-1.5"><Layers className="h-3.5 w-3.5" /> 워크스페이스 ({workspaces.length})</TabsTrigger>
                        <TabsTrigger value="payments" className="gap-1.5 text-amber-600"><AlertCircle className="h-3.5 w-3.5" /> 입금 확인 ({pendingPayments.length})</TabsTrigger>
                        <TabsTrigger value="payments_done" className="gap-1.5 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> 입금완료 ({confirmedPayments.length})</TabsTrigger>
                        <TabsTrigger value="deposits" className="gap-1.5 text-orange-600"><Wallet className="h-3.5 w-3.5" /> 예치금 충전 ({pendingDeposits.length})</TabsTrigger>
                        <TabsTrigger value="settlements" className="gap-1.5 text-emerald-600"><Wallet className="h-3.5 w-3.5" /> 정산 관리 ({settlements.length})</TabsTrigger>
                    </TabsList>

                    {/* ── 모먼트 ── */}
                    <TabsContent value="moments" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">플랫폼의 모든 크리에이터 모먼트</p>
                            <Button size="sm" variant="outline" onClick={fetchMoments}>새로고침</Button>
                        </div>
                        {loadingMoments ? <p className="text-sm text-muted-foreground">로딩 중...</p> : moments.length === 0 ? (
                            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">데이터 없음</CardContent></Card>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {moments.map(m => (
                                    <Card key={m.id} className="p-4 flex items-start justify-between gap-2">
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{m.title}</p>
                                            <p className="text-xs text-muted-foreground">{(m.creator as any)?.display_name} · {m.category}</p>
                                            <p className="text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="shrink-0 text-muted-foreground hover:text-red-500"
                                            onClick={() => handleDeleteMoment(m.id)} disabled={deletingId === m.id}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ── 협업 제안 ── */}
                    <TabsContent value="proposals" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">brand_proposal + moment_proposal + campaign_application 통합</p>
                            <Button size="sm" variant="outline" onClick={fetchProposals}>새로고침</Button>
                        </div>
                        {loadingProposals ? <p className="text-sm text-muted-foreground">로딩 중...</p> : proposals.length === 0 ? (
                            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">데이터 없음</CardContent></Card>
                        ) : (
                            <div className="grid gap-2">
                                {proposals.map(p => (
                                    <Card key={`${p.type}-${p.id}`} className="p-4 flex items-center gap-4">
                                        <div className="flex-1 grid grid-cols-5 gap-2 items-center">
                                            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full text-center', typeColor[p.type] ?? '')}>
                                                {typeLabel[p.type]}
                                            </span>
                                            <span className="text-sm font-medium truncate">{p.brand_name ?? '-'} → {p.creator_name ?? '-'}</span>
                                            <span className="text-xs text-muted-foreground font-mono">{p.price_offer ? `${p.price_offer.toLocaleString()}원` : '-'}</span>
                                            <span className="text-xs"><Badge variant="secondary">{p.status ?? '-'}</Badge></span>
                                            <span className="text-[10px] text-muted-foreground text-right">{new Date(p.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ── 워크스페이스 ── */}
                    <TabsContent value="workspaces" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">플랫폼의 모든 협업 워크스페이스</p>
                            <Button size="sm" variant="outline" onClick={fetchWorkspaces}>새로고침</Button>
                        </div>
                        {loadingWorkspaces ? <p className="text-sm text-muted-foreground">로딩 중...</p> : workspaces.length === 0 ? (
                            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">데이터 없음</CardContent></Card>
                        ) : (
                            <div className="grid gap-2">
                                {workspaces.map(w => (
                                    <Card key={w.id} className="p-4 flex items-center gap-4">
                                        <div className="flex-1 grid grid-cols-4 gap-2 items-center">
                                            <span className="text-sm font-medium">{(w.brand as any)?.display_name ?? '-'} → {(w.creator as any)?.display_name ?? '-'}</span>
                                            <span className="text-xs text-muted-foreground">{w.type ?? '-'}</span>
                                            <Badge variant="secondary" className="w-fit">{w.status ?? '-'}</Badge>
                                            <div className="text-right">
                                                <span className="text-[10px] text-muted-foreground block">{new Date(w.created_at).toLocaleDateString()}</span>
                                                <span className="text-[9px] font-mono text-muted-foreground/50">관리번호 : #{String(w.id).replace(/-/g, '').slice(-6).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ── 입금 확인 ── */}
                    <TabsContent value="payments" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">계약 서명 완료 후 입금 대기 중인 협업</p>
                            <Button size="sm" variant="outline" onClick={fetchPendingPayments}>새로고침</Button>
                        </div>
                        {loadingPayments ? <p className="text-sm text-muted-foreground">로딩 중...</p> : pendingPayments.length === 0 ? (
                            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">입금 대기 건이 없습니다 ✅</CardContent></Card>
                        ) : (
                            <div className="grid gap-3">
                                {pendingPayments.map(p => (
                                    <Card key={`${p.type}-${p.id}`} className="flex items-center justify-between p-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', typeColor[p.type] ?? 'bg-muted')}>
                                                    {typeLabel[p.type] ?? p.type}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold">
                                                {(() => {
                                                    const code = String(parseInt((p.id || '').replace(/-/g, '').slice(-4) || '0', 16) % 100).padStart(2, '0')
                                                    const name = (p as any).brand_name || p.brand_id?.slice(0, 8) || '브랜드'
                                                    return `입금자명: ${name}${code}`
                                                })()}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                금액: <span className="font-mono font-bold text-foreground">{(p.price_offer ?? 0).toLocaleString()}원</span>
                                                {' '}(+VAT {Math.round((p.price_offer ?? 0) * 0.1).toLocaleString()}원)
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">계약일: {new Date(p.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
                                            onClick={() => handleConfirmPayment(p)} disabled={confirmingId === p.id}>
                                            <CheckCircle2 className="h-3.5 w-3.5" /> 입금 확인
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ── 입금완료 ── */}
                    <TabsContent value="payments_done" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">입금 확인 완료된 협업 목록</p>
                            <Button size="sm" variant="outline" onClick={fetchConfirmedPayments}>새로고침</Button>
                        </div>
                        {loadingConfirmed ? <p className="text-sm text-muted-foreground">로딩 중...</p> : confirmedPayments.length === 0 ? (
                            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">입금 확인 완료 내역이 없습니다.</CardContent></Card>
                        ) : (
                            <div className="grid gap-3">
                                {confirmedPayments.map(p => (
                                    <Card key={`done-${p.type}-${p.id}`} className="flex items-center justify-between p-4 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-900/10">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', typeColor[p.type] ?? 'bg-muted')}>
                                                    {typeLabel[p.type] ?? p.type}
                                                </span>
                                                <Badge className="bg-emerald-500 text-[10px] h-5">입금완료</Badge>
                                            </div>
                                            <p className="text-sm font-bold">{p.brand_id?.slice(0, 8) ?? '브랜드'} → {p.creator_id?.slice(0, 8) ?? '크리에이터'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                금액: <span className="font-mono font-bold text-foreground">{(p.price_offer ?? 0).toLocaleString()}원</span>
                                                {' '}(+VAT {Math.round((p.price_offer ?? 0) * 0.1).toLocaleString()}원)
                                            </p>
                                            <p className="text-[10px] text-emerald-600 font-medium">
                                                ✅ 확인일시: {p.payment_confirmed_at ? new Date(p.payment_confirmed_at).toLocaleString('ko-KR') : '-'}
                                            </p>
                                        </div>
                                        <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="settlements" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">크리에이터 정산 현황. 이체 완료 후 "지급 완료" 버튼을 눌러주세요.</p>
                            <Button size="sm" variant="outline" onClick={fetchSettlements}>새로고침</Button>
                        </div>
                        {loadingSettlements ? <p className="text-sm text-muted-foreground">로딩 중...</p> : settlements.length === 0 ? (
                            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">정산 데이터가 없습니다.</CardContent></Card>
                        ) : (
                            <div className="grid gap-3">
                                {settlements.map(s => (
                                    <Card key={s.id} className="flex items-center justify-between p-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge className={cn(s.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-100 text-amber-700 border-amber-200')}>
                                                    {s.status === 'paid' ? '지급완료' : '지급대기'}
                                                </Badge>
                                                <p className="text-sm font-bold">{s.creator?.display_name ?? '크리에이터'}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                총액 <span className="font-mono font-bold text-foreground">{s.gross_amount?.toLocaleString()}원</span>
                                                {' · '}크리에이터 수령 <span className="font-mono font-bold text-emerald-600">{s.creator_amount?.toLocaleString()}원</span>
                                                {s.mcn_amount > 0 && <> · MCN <span className="font-mono">{s.mcn_amount?.toLocaleString()}원</span></>}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">{s.settlement_month} · {s.proposal_type}</p>
                                        </div>
                                        {s.status === 'pending' && (
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                                onClick={() => handleMarkPaid(s.id)} disabled={payingId === s.id}>
                                                <CheckCircle2 className="h-3.5 w-3.5" /> 지급 완료
                                            </Button>
                                        )}
                                        {s.status === 'paid' && (
                                            <p className="text-xs text-emerald-600">{s.paid_at ? new Date(s.paid_at).toLocaleDateString() : ''}</p>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ── 예치금 충전 확인 ── */}
                    <TabsContent value="deposits" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">브랜드가 요청한 충전 대기 목록 (수동 입금 후 확인)</p>
                            <Button size="sm" variant="outline" onClick={fetchPendingDeposits}>새로고침</Button>
                        </div>
                        {loadingDeposits ? <p className="text-sm text-muted-foreground">로딩 중...</p> : pendingDeposits.length === 0 ? (
                            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">충전 대기 건이 없습니다 ✅</CardContent></Card>
                        ) : (
                            <div className="grid gap-3">
                                {pendingDeposits.map((d: any) => (
                                    <Card key={d.id} className="flex items-center justify-between p-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold">{(d.brand as any)?.display_name ? `${(d.brand as any).display_name}_DEPOSIT` : d.brand_id?.slice(0, 8)}</p>
                                            <p className="text-xs text-muted-foreground">노트: {d.note ?? '-'}</p>
                                            <p className="text-[10px] text-muted-foreground">요청일시: {new Date(d.created_at).toLocaleString('ko-KR')}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="충전 금액"
                                                    className="w-36 h-8 rounded-md border border-input px-2 text-xs text-right font-mono"
                                                    id={`deposit-amount-${d.id}`}
                                                />
                                                <span className="text-xs text-muted-foreground">원</span>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                                                onClick={() => {
                                                    const input = document.getElementById(`deposit-amount-${d.id}`) as HTMLInputElement
                                                    const amount = parseInt(input?.value ?? '0', 10)
                                                    if (!amount || amount <= 0) { toast.error('충전 금액을 입력하세요.'); return }
                                                    handleConfirmDeposit(d, amount)
                                                }}
                                                disabled={confirmingDepositId === d.id}
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5" /> 충전 확인
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                </Tabs>
            </main>
        </div>
    )
}
