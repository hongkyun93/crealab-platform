"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import {
    Trash2, Shield, Users, ShoppingBag, Send, Briefcase,
    CheckCircle2, Wallet, AlertCircle, Layers, Calendar
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/providers/auth-provider"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────
interface AdminMoment {
    id: string
    title: string
    category: string
    created_at: string
    influencer_id: string
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
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("moments")

    // ── 데이터 ────────────────────────────────────────────────────
    const [moments, setMoments] = useState<AdminMoment[]>([])
    const [proposals, setProposals] = useState<AdminProposal[]>([])
    const [workspaces, setWorkspaces] = useState<AdminWorkspace[]>([])
    const [pendingPayments, setPendingPayments] = useState<any[]>([])
    const [settlements, setSettlements] = useState<any[]>([])

    // ── 로딩 ─────────────────────────────────────────────────────
    const [loadingMoments, setLoadingMoments] = useState(false)
    const [loadingProposals, setLoadingProposals] = useState(false)
    const [loadingWorkspaces, setLoadingWorkspaces] = useState(false)
    const [loadingPayments, setLoadingPayments] = useState(false)
    const [loadingSettlements, setLoadingSettlements] = useState(false)

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
                .select('id, title, category, created_at, influencer_id, profiles(display_name, avatar_url)')
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
                .select('id, price_offer, status, content_submission_status, created_at, brand_id, influencer_id')
                .order('created_at', { ascending: false })
                .limit(100)
            if (bpErr) console.error('[Admin] brand_proposals error:', bpErr)

            // moment_proposals
            const { data: mp, error: mpErr } = await supabase
                .from('moment_proposals')
                .select('id, price_offer, status, content_submission_status, created_at, brand_id, influencer_id')
                .order('created_at', { ascending: false })
                .limit(100)
            if (mpErr) console.error('[Admin] moment_proposals error:', mpErr)

            // campaign_applications
            const { data: ca, error: caErr } = await supabase
                .from('campaign_applications')
                .select('id, status, created_at, influencer_id')
                .order('created_at', { ascending: false })
                .limit(100)
            // caErr는 RLS 차단 시 {} 로 오는 경우 있음 — admin_rls_bypass.sql 마이그레이션 실행 후 해결
            if (caErr && Object.keys(caErr).length > 0) console.error('[Admin] campaign_applications error:', caErr)

            const mapped: AdminProposal[] = [
                ...(bp ?? []).map((p: any) => ({
                    id: p.id, type: 'product_application' as const,
                    brand_name: p.brand_id,
                    creator_name: p.influencer_id,
                    price_offer: p.price_offer,
                    status: p.status,
                    content_submission_status: p.content_submission_status,
                    created_at: p.created_at,
                })),
                ...(mp ?? []).map((p: any) => ({
                    id: p.id, type: 'moment_proposal' as const,
                    brand_name: p.brand_id,
                    creator_name: p.influencer_id,
                    price_offer: p.price_offer,
                    status: p.status,
                    content_submission_status: p.content_submission_status,
                    created_at: p.created_at,
                })),
                ...(ca ?? []).map((p: any) => ({
                    id: p.id, type: 'campaign_application' as const,
                    creator_name: p.influencer_id,
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
                .select('id, brand_id, influencer_id, status, type, created_at')
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
            const { data, error } = await supabase
                .from('product_applications')
                .select('id, price_offer, contract_status, payment_confirmed_at, created_at, brand_id, influencer_id')
                .eq('contract_status', 'signed')
                .is('payment_confirmed_at', null)
                .order('created_at', { ascending: false })
            if (error) console.error('[Admin] pending payments error:', error)
            setPendingPayments(data ?? [])
        } catch (e) { console.error(e) }
        finally { setLoadingPayments(false) }
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
        if (activeTab === 'settlements') fetchSettlements()
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

    const handleConfirmPayment = async (proposalId: string) => {
        setConfirmingId(proposalId)
        const { error } = await supabase
            .from('product_applications')
            .update({ payment_confirmed_at: new Date().toISOString() })
            .eq('id', proposalId)
        if (error) toast.error(error.message)
        else { toast.success('입금 확인 완료! 배송 단계가 활성화됩니다.'); fetchPendingPayments() }
        setConfirmingId(null)
    }

    const handleMarkPaid = async (settlementId: string) => {
        setPayingId(settlementId)
        const { error } = await supabase
            .from('settlements')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', settlementId)
        if (error) toast.error(error.message)
        else { toast.success('지급 완료 처리되었습니다.'); fetchSettlements() }
        setPayingId(null)
    }

    // ── Helpers ───────────────────────────────────────────────────
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
                                            <span className="text-[10px] text-muted-foreground text-right">{new Date(w.created_at).toLocaleDateString()}</span>
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
                                    <Card key={p.id} className="flex items-center justify-between p-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold">{p.brand?.display_name ?? '브랜드'} → {p.influencer?.display_name ?? '크리에이터'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                금액: <span className="font-mono font-bold text-foreground">{(p.price_offer ?? 0).toLocaleString()}원</span>
                                                {' '}(+VAT {Math.round((p.price_offer ?? 0) * 0.1).toLocaleString()}원)
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">계약일: {new Date(p.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
                                            onClick={() => handleConfirmPayment(p.id)} disabled={confirmingId === p.id}>
                                            <CheckCircle2 className="h-3.5 w-3.5" /> 입금 확인
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ── 정산 관리 ── */}
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

                </Tabs>
            </main>
        </div>
    )
}
