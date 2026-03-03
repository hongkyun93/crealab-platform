"use client"

import { ProductDetailView } from "@/components/dashboard/product-detail-view"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { ChannelSelector } from "@/components/shared/ChannelSelector"
import { SiteHeader } from "@/components/site-header"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent, DialogDescription, DialogFooter, DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { WorkspaceLayout } from "@/components/workspace/common/workspace-layout"
import { useWorkspaceStore } from "@/components/workspace/hooks/use-workspace-store"
import { useMobileSidebar } from "@/lib/hooks/use-mobile-sidebar"
import { Search, MapPin, Grid, List as ListIcon, X, Megaphone, AlertCircle, TrendingUp, Filter, Users, Calendar, Sparkles, Building2, HelpCircle, FileText, ChevronRight, Share2, Heart, MessageCircle, Wallet, LogOut, Link2, Download, ExternalLink, RefreshCw, Send, CheckCircle2, ChevronLeft, CalendarPlus, Receipt, ArrowRight, Package, Image as ImageIcon, Briefcase, Hash, Star, Edit, Trash2, Camera, Bell, Loader2, ShoppingBag, Settings, Info } from "lucide-react"
import { FEATURES } from "@/lib/config/features"
import { MomentProposalDialog, MomentProposalFormData } from "@/components/dialogs/MomentProposalDialog"
import { ProductRegistrationDialog, ProductFormData } from "@/components/dialogs/ProductRegistrationDialog"
import dynamic from 'next/dynamic'
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
// [PERF Plan B] AIPriceCalculator is only shown in a specific tab. Dynamic import removes it from initial bundle.
const AIPriceCalculator = dynamic(() => import('@/components/ai-price-calculator').then(m => m.AIPriceCalculator), {
    ssr: false,
    loading: () => <div className="w-full h-32 bg-muted/30 rounded-xl flex items-center justify-center text-sm text-muted-foreground">AI 가격 계산기 로딩 중...</div>
})
// [PERF Plan B] SignatureCanvas is only needed when the signature modal opens.
const SignatureCanvas = dynamic(() => import('react-signature-canvas'), {
    ssr: false,
    loading: () => <div className="w-full h-48 bg-muted/30 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-sm text-muted-foreground">서명 영역 로딩 중...</div>
}) as any

// Brand View Components
import { BrandProfileView } from "@/components/brand/views/BrandProfileView"
import { DepositView } from "@/components/brand/views/DepositView"
import { DiscoverView } from "@/components/brand/views/DiscoverView"
import { MyCampaignsView } from "@/components/brand/views/MyCampaignsView"
import { MyProductsView } from "@/components/brand/views/MyProductsView"
import { WorkspaceView } from "@/components/brand/views/WorkspaceView"
import { NotificationsView } from "@/components/brand/views/NotificationsView"
import { ReadonlyProposalDialog } from "@/components/proposal/readonly-proposal-dialog"
import { useProducts } from "@/components/providers/product-provider"

import { DemoBanner } from "@/components/demo-banner"
import { POPULAR_TAGS } from "@/lib/constants/categories"
import { CampaignBrowseView } from "@/components/shared/CampaignBrowseView"
import { ProductBrowseView } from "@/components/shared/ProductBrowseView"

export function BrandDashboard() {

    const { moments, user, isLoading, campaigns, deleteCampaign,
        productApplications, updateProductApplication, deleteProductApplication, sendMessage, messages,
        submissionFeedback: contextSubmissionFeedback, fetchSubmissionFeedback, sendSubmissionFeedback,
        updateUser, products, addProduct, updateProduct, deleteProduct, deleteMoment, supabase, createProductApplication,
        switchRole, campaignProposals, updateCampaignStatus, updateProposal, notifications, sendNotification, refreshData,
        favorites, toggleFavorite,
        createMomentProposal, // [FIX] was missing from destructure
        momentProposals, // [FIX] needed for chatProposal sync
        allMoments, fetchAllMoments, isAuthLoading, deleteMomentProposal, enablePublicMoments, // New: Public events & Moment deletion
        markAsRead, // [딥링크] 알림 센터 클릭 시 읽음 처리용
    } = useUnifiedProvider()

    // 비공개 상품 관련 (product-provider에서 직접 가져옴)
    const { hiddenProducts, hideProduct, activateProduct } = useProducts()

    const { isOpen: isMobileSidebarOpen, setIsOpen: setIsMobileSidebarOpen } = useMobileSidebar()

    // AI Calculator State
    const [showCalculator, setShowCalculator] = useState(false)


    const displayUser = user

    const router = useRouter()
    const searchParams = useSearchParams()

    const initialViewRaw = searchParams.get('view') || "discover"
    let initialView = initialViewRaw === "dashboard" ? "my-campaigns" : initialViewRaw

    // [FEATURE FLAG] 캠페인 관련 URL 접근 차단
    if (!FEATURES.ENABLE_CAMPAIGNS && ['my-campaigns', 'browse-campaigns', 'new'].includes(initialView)) {
        initialView = "discover"
    }

    const [currentView, setCurrentView] = useState(initialView)
    // Default Sorting extracted to views

    // [딥링크] URL의 view 및 campaignId 파라미터 변경 시 동기화 (알림 클릭 시 필요)
    useEffect(() => {
        const viewParam = searchParams.get('view')
        if (viewParam) {
            let normalized = viewParam === 'dashboard' ? 'my-campaigns' : viewParam
            // [FEATURE FLAG] 캠페인 관련 URL 접근 차단
            if (!FEATURES.ENABLE_CAMPAIGNS && ['my-campaigns', 'browse-campaigns', 'new'].includes(normalized)) {
                normalized = "discover"
            }
            setCurrentView(normalized)
        }

        const campaignIdParam = searchParams.get('campaignId')
        if (campaignIdParam) {
            setSelectedCampaignId(campaignIdParam)
        }
    }, [searchParams])

    // [새로고침 유지] currentView 변경 시 URL 동기화 → 새로고침 후 원래 페이지로 돌아옴
    useEffect(() => {
        const currentUrlView = searchParams.get('view')
        if (currentUrlView === currentView) return  // 이미 동기화됨 (루프 방지)
        const params = new URLSearchParams(searchParams.toString())
        params.set('view', currentView)
        router.replace(`/brand?${params.toString()}`, { scroll: false })
    }, [currentView]) // eslint-disable-line react-hooks/exhaustive-deps

    // Discover 탭 진입 시에만 public events 활성화 (enablePublicMoments는 idempotent - 여러 번 호출해도 안전)
    useEffect(() => {
        if (currentView === 'discover') {
            enablePublicMoments()
        }
    }, [currentView])

    // Compute set of moment IDs where the brand has already sent an active proposal
    const sentMomentIds = useMemo(() => {
        const ids = new Set<string>()
        if (momentProposals) {
            momentProposals.forEach((p: any) => {
                if (p.moment_id && p.status !== 'cancelled' && p.status !== 'rejected') {
                    ids.add(p.moment_id)
                }
            })
        }
        return ids
    }, [momentProposals])


    // Filter Query States (Moved to DiscoverView)


    // Collaboration Workspace State
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [chatProposal, setChatProposal] = useState<any>(null)
    const [chatMessage, setChatMessage] = useState("")
    const [workspaceTab, setWorkspaceTab] = useState("inbound") // Lifted state for sidebar control
    const [workspaceSubTab, setWorkspaceSubTab] = useState<'all' | 'moment' | 'campaign' | 'brand'>('all')
    const [workspaceViewMode, setWorkspaceViewMode] = useState<'list' | 'grid' | 'table'>('list') // View mode for workspace archive
    const [activeProposalTab, setActiveProposalTab] = useState("chat") // Controlled tab state for Proposal Dialog
    const [feedbackMsg, setFeedbackMsg] = useState("")

    const [isSendingFeedback, setIsSendingFeedback] = useState(false)

    // Readonly Proposal Modal State
    const [readonlyProposal, setReadonlyProposal] = useState<any>(null)
    const [showReadonlyProposalDialog, setShowReadonlyProposalDialog] = useState(false)

    // Proposal Condition Fields (Pre-fill)
    const [conditionDraftDate, setConditionDraftDate] = useState("")
    const [conditionFinalDate, setConditionFinalDate] = useState("")
    const [conditionUploadDate, setConditionUploadDate] = useState("")
    const [conditionSecondary, setConditionSecondary] = useState("불가")
    const [secondaryUsageFee, setSecondaryUsageFee] = useState("")
    const [conditionMaintenance, setConditionMaintenance] = useState("")

    // [Badge] 탭별 새 이벤트 여부 계산
    const workspaceTabBadges = useMemo(() => {
        const allProposals: any[] = [
            ...(productApplications || []),
            ...(campaignProposals || []),
            ...(momentProposals || []),
        ]
        // 내가 받은 unread 메시지 중 workspace_id가 있는 것
        const unreadWorkspaceIds = new Set(
            (messages || [])
                .filter(m => m.senderId !== user?.id && !m.read && m.workspaceId)
                .map(m => m.workspaceId)
        )
        const hasUnread = (proposals: any[]) =>
            proposals.some(p => p.workspace_id && unreadWorkspaceIds.has(p.workspace_id))

        // 진행중: 협업 진행 중 & unread 메시지 있음
        const activeProposals = allProposals.filter(p =>
            p.status === 'accepted' || p.status === 'active' || p.status === 'in_progress'
        )
        // 받은 제안: 새로 지원이 들어온 것 (applied) — unread 여부도 체크
        const inboundProposals = allProposals.filter(p => p.status === 'applied')
        // 보낸 제안: 브랜드가 보낸 것 (offered) 중 상대가 읽지 않았거나 응답 옴
        const outboundProposals = allProposals.filter(p => p.status === 'offered' || p.status === 'pending')
        // 거절됨
        const rejectedProposals = allProposals.filter(p => p.status === 'rejected')
        // 완료됨
        const completedProposals = allProposals.filter(p => p.status === 'completed')

        return {
            active: hasUnread(activeProposals),
            inbound: inboundProposals.length > 0 || hasUnread(inboundProposals),
            outbound: hasUnread(outboundProposals),
            rejected: hasUnread(rejectedProposals),
            completed: hasUnread(completedProposals),
        }
    }, [productApplications, campaignProposals, momentProposals, messages, user?.id])

    // Refs for auto-scrolling
    const workspaceChatRef = useRef<HTMLDivElement>(null)
    const workFeedbackChatRef = useRef<HTMLDivElement>(null)

    // 전체 캠페인 더보기 (browse-campaigns)
    const [allCampaigns, setAllCampaigns] = useState<any[]>([])
    const [brandApplicantCounts, setBrandApplicantCounts] = useState<Record<string, number>>({})

    useEffect(() => {
        if (currentView !== 'browse-campaigns' || !supabase) return
        const fetchAllCampaigns = async () => {
            const { data } = await supabase
                .from('campaigns')
                .select('*')
                .order('created_at', { ascending: false })
            if (data && data.length > 0) {
                setAllCampaigns(data)
                const ids = data.map((c: any) => c.id)
                const { data: apps } = await supabase
                    .from('campaign_applications')
                    .select('campaign_id')
                    .in('campaign_id', ids)
                if (apps) {
                    const counts: Record<string, number> = {}
                    apps.forEach((a: any) => {
                        counts[a.campaign_id] = (counts[a.campaign_id] || 0) + 1
                    })
                    setBrandApplicantCounts(counts)
                }
            }
        }
        fetchAllCampaigns()
    }, [currentView, supabase])

    // Auto-scroll for Main Workspace Chat
    useEffect(() => {
        if (isChatOpen && workspaceChatRef.current) {
            workspaceChatRef.current.scrollTop = workspaceChatRef.current.scrollHeight
        }
    }, [messages, isChatOpen, workspaceTab])

    // Fetch Feedback History when Chat Opens
    useEffect(() => {
        if (chatProposal?.workspace_id) {
            fetchSubmissionFeedback(chatProposal.workspace_id.toString())
        }
    }, [chatProposal])

    // Reset sub-tab when main workspace tab changes
    useEffect(() => {
        setWorkspaceSubTab('all')
    }, [workspaceTab])

    // Auto-open proposal from URL (Notification Redirect)
    useEffect(() => {
        const proposalId = searchParams.get('proposalId')

        // IMPORTANT: Wait for auth loading to finish only.
        if (isAuthLoading) return

        if (!proposalId) return

        // 워크스페이스가 이미 열린 상태에서 같은 proposal이면 무시 (루프 방지)
        // 닫혀있을 때는 chatProposal이 남아있어도 재오픈 허용
        if (isChatOpen && (chatProposal?.workspace_id?.toString() === proposalId || chatProposal?.id?.toString() === proposalId)) return

        // 1. productApplications (product_applications) 탐색
        let target: any = productApplications.find((p: any) => p.workspace_id?.toString() === proposalId || p.id?.toString() === proposalId)

        // 2. campaignProposals (campaign_applications) 탐색
        if (!target) {
            target = campaignProposals.find((p: any) => p.workspace_id?.toString() === proposalId || p.id?.toString() === proposalId)
        }

        // 3. momentProposals 탐색
        if (!target) {
            target = (momentProposals as any[])?.find((p: any) => p.workspace_id?.toString() === proposalId || p.id?.toString() === proposalId)
        }

        // 4. campaigns[].proposals 레거시 폴백
        if (!target) {
            for (const campaign of campaigns) {
                const found = (campaign as any).proposals?.find((p: any) => p.id?.toString() === proposalId)
                if (found) { target = found; break }
            }
        }

        if (target) {
            setChatProposal(target)
            setIsChatOpen(true)
        }
    }, [searchParams, productApplications, campaignProposals, momentProposals, campaigns, isAuthLoading]) // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-set workspaceTab from URL (Notification Redirect)
    useEffect(() => {
        const tab = searchParams.get('workspaceTab')
        if (tab && ['inbound', 'outbound', 'active', 'rejected', 'completed'].includes(tab)) {
            setWorkspaceTab(tab)
        }
    }, [searchParams])

    // [URL Sync] dialog 열릴 때 URL에 proposalId 기록, 닫힐 때 제거
    // → 새로고침해도 위 auto-open 로직이 proposalId를 읽어 dialog 복원
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (isChatOpen && chatProposal?.id) {
            params.set('proposalId', chatProposal.workspace_id?.toString() || chatProposal.id.toString())
        } else {
            params.delete('proposalId')
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`
        // scroll:false, replace(not push) — 뒤로가기 기록에 안 남음
        router.replace(newUrl, { scroll: false })
    }, [isChatOpen, chatProposal?.id]) // eslint-disable-line react-hooks/exhaustive-deps

    // [FIX] 워크스페이스가 열릴 때마다 최신 DB 데이터 강제 fetch
    // Realtime 미작동 시에도 브랜드가 크리에이터 배송지, 입금 정보 등을 정확히 볼 수 있게 함
    useEffect(() => {
        if (isChatOpen && chatProposal?.id) {
            refreshData()
        }
    }, [isChatOpen, chatProposal?.id]) // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch Messages when Chat Opens, workspaceTab])


    // Auto-scroll for Work Feedback Chat
    useEffect(() => {
        if (isChatOpen && workFeedbackChatRef.current) {
            workFeedbackChatRef.current.scrollTop = workFeedbackChatRef.current.scrollHeight
        }
    }, [contextSubmissionFeedback, isChatOpen, activeProposalTab])

    // [FIX] Sync chatProposal when productApplications, campaignProposals, or momentProposals updates
    useEffect(() => {
        if (chatProposal?.id) {
            const updatedBrand = productApplications.find((p: any) => p.id === chatProposal.id);
            const updatedCampaign = campaignProposals.find((p: any) => p.id === chatProposal.id);
            const updatedMoment = (momentProposals as any[])?.find((p: any) => p.id === chatProposal.id);
            // [FIX] moment proposal은 productApplications(mappedMoment)에도 포함되지만
            // Realtime 업데이트 시 momentProposals(rawMomentProposals)만 갱신됨.
            // updatedMoment가 있으면 최신 필드들을 brandProposal 위에 merge하여 사용.
            const updated = updatedMoment
                ? { ...(updatedBrand || updatedMoment), ...updatedMoment }
                : updatedBrand || updatedCampaign;
            if (updated) {
                setChatProposal(updated);
            }
        }
    }, [productApplications, campaignProposals, momentProposals]); // eslint-disable-line react-hooks/exhaustive-deps

    // [New] Sync Workspace Store
    useEffect(() => {
        if (chatProposal) {
            // 1. Set Proposal
            useWorkspaceStore.getState().setProposal(chatProposal);

            // 2. Determine Current Stage
            let stage: 'negotiation' | 'contract' | 'shipping' | 'content' | 'settlement' | 'final_complete' = 'negotiation';

            if (chatProposal.brand_condition_confirmed && chatProposal.creator_condition_confirmed) stage = 'contract';

            // [FIX] Realtime 버그로 인해 DB에 'partial'로 잘못 저장되었을 경우를 대비한 양측 서명 강제 체크
            const isFullySigned = chatProposal.contract_status === 'signed' || (chatProposal.brand_signature && chatProposal.creator_signature);
            if (isFullySigned) stage = 'contract'; // 계약 서명 완료 → 입금 대기
            // [입금 확인 게이트] 관리자가 payment_confirmed_at 세팅 후에야만 shipping으로 이동
            if (isFullySigned && (chatProposal as any).payment_confirmed_at) stage = 'shipping';

            if (chatProposal.delivery_status === 'shipped') stage = 'shipping';
            if (chatProposal.delivery_status === 'delivered') stage = 'content';
            if (chatProposal.content_submission_url || chatProposal.content_submission_file_url) {
                stage = 'content'; // 초안 제출 → content 단계 유지
            }
            // [FIX] 최종본(content_final_url) 제출 완료 시 content 단계 유지
            if (chatProposal.content_final_url) {
                stage = 'content';
            }
            // 브랜드가 협업완료/정산승인 → settlement 단계
            if ((chatProposal as any).status === 'settlement') {
                stage = 'settlement';
            }
            // 크리에이터 성과 제출 완료 → final_complete 단계
            if ((chatProposal as any).status === 'completed') {
                stage = 'final_complete';
            }

            useWorkspaceStore.getState().setCurrentStage(stage);

            // Auto-open VideoReviewPanel when content has been submitted
            const hasSubmittedContent = !!(chatProposal.content_submission_url || chatProposal.content_submission_file_url)
            useWorkspaceStore.getState().setVideoReviewOpen(hasSubmittedContent && (stage === 'content' || stage === 'settlement' || stage === 'final_complete'))
        }
    }, [chatProposal]);


    const handleSendFeedback = async () => {
        if (!feedbackMsg.trim() || !chatProposal || !user || isSendingFeedback) return
        setIsSendingFeedback(true)
        try {
            const isCampaign = !!chatProposal?.campaignId || (chatProposal as any).type === 'campaign_apply'
            const pId = chatProposal.id.toString()
            // [FIX] sendSubmissionFeedback(proposalId, productApplicationId, content) - 3 args
            // [FIX] sendSubmissionFeedback returns void, use try/catch instead of if(success)
            await sendSubmissionFeedback(
                chatProposal.workspace_id?.toString(),
                feedbackMsg
            )
            setFeedbackMsg("")
            setIsSendingFeedback(false)
            if (chatProposal.workspace_id) {
                await fetchSubmissionFeedback(chatProposal.workspace_id.toString())
            }

            // 🔔 Send notification to influencer
            await sendNotification(
                chatProposal.creator_id,
                `${user?.name}님이 피드백을 남겼습니다.`,
                'feedback_received',
                chatProposal.workspace_id?.toString() || chatProposal.id.toString()
            )
        } catch (e) {
            console.error("Feedback error:", e)
        }
    }

    // Effect to fetch feedback when work tab is visited
    useEffect(() => {
        if (activeProposalTab === 'work' && chatProposal?.workspace_id) {
            fetchSubmissionFeedback(chatProposal.workspace_id.toString())
        }
    }, [activeProposalTab, chatProposal, fetchSubmissionFeedback])
    const handleStatusUpdate = useCallback(async (id: string | number, status: 'accepted' | 'rejected' | 'hold') => {
        if (confirm(`이 지원서를 ${status === 'accepted' ? '수락' : status === 'hold' ? '보류' : '거절'}하시겠습니까?`)) {
            try {
                const supabaseCli = (await import('@/lib/supabase/client')).createClient()
                const { error: statusErr } = await supabaseCli
                    .from('campaign_applications')
                    .update({ status })
                    .eq('id', id.toString())
                if (statusErr) { toast.error(statusErr.message); return }
                else {
                    toast.success("상태가 변경되었습니다.")
                    await refreshData()
                    if (status === 'accepted') {
                        // Switch to Active tab and open Chat (Workstation)
                        setWorkspaceTab('active')
                        setActiveProposalTab('chat')
                    }
                    // 🔔 거절 시 크리에이터에게 알림
                    if (status === 'rejected') {
                        const targetProposal = [
                            ...productApplications,
                            ...campaignProposals,
                            ...(momentProposals as any[])
                        ].find((p: any) => p.id?.toString() === id.toString())
                        const creatorId = targetProposal?.creator_id || targetProposal?.creatorId
                        if (creatorId) {
                            await sendNotification(
                                creatorId,
                                `${user?.name || '브랜드'}님이 지원서를 검토 후 다음 단계로 진행하지 않기로 결정했습니다.`,
                                'proposal_rejected',
                                targetProposal?.workspace_id?.toString() || id.toString()
                            )
                        }
                    }
                }
            } catch (err) {
                toast.error("상태 변경 중 오류가 발생했습니다.")
            }
        }
    }, [refreshData, productApplications, campaignProposals, momentProposals, sendNotification, user])


    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const handleConfirmCondition = () => {
        setIsConfirmDialogOpen(true);
    };

    const executeConfirmCondition = async () => {
        if (!chatProposal) return;
        setIsConfirmDialogOpen(false);

        const isMutualConfirmed = chatProposal.creator_condition_confirmed;

        // Optimistic UI Update
        const optimizedProposal = {
            ...chatProposal,
            brand_condition_confirmed: true,
            status: isMutualConfirmed ? 'confirmed' : chatProposal.status
        };
        setChatProposal(optimizedProposal as any);

        const isCampaign = !!chatProposal?.campaignId || (chatProposal as any)?.type === 'campaign_apply';
        const pId = chatProposal.id.toString();

        try {
            // 1. Update Proposal Status
            const updates: any = { brand_condition_confirmed: true };
            if (isMutualConfirmed) {
                updates.status = 'confirmed';
            }

            if (isCampaign) {
                await updateProposal(pId, updates);
            } else {
                await updateProductApplication(pId, updates);
            }

            // 2. Send System Message
            const msgContent = isMutualConfirmed
                ? "✅ [시스템 알림] 브랜드가 조건을 확정했습니다. 양측 확정이 완료되어 계약서 작성이 시작됩니다."
                : "✅ [시스템 알림] 브랜드가 조건을 확정했습니다. 크리에이터님의 확정을 기다리고 있습니다.";

            const targetCreatorId = chatProposal.creator_id || chatProposal.creatorId || chatProposal.influencer?.id;

            if (targetCreatorId) {
                await sendMessage(
                    targetCreatorId,
                    msgContent,
                    undefined,
                    chatProposal.workspace_id?.toString()
                );

                // 3. Notify Creator
                await sendNotification(
                    targetCreatorId,
                    isMutualConfirmed
                        ? "조건 협의가 완료되었습니다. 계약서를 작성해주세요."
                        : `${user?.name}님이 조건을 확정했습니다.`,
                    "proposal_update",
                    chatProposal.workspace_id?.toString() || pId
                );
            }

            // Force refresh to update dashboard lists (e.g., move to 'confirmed' status)
            if (refreshData) await refreshData();

        } catch (error) {
            console.error("Condition Confirmation Error:", error);
            toast.error("조건 확정 중 오류가 발생했습니다.");
            setChatProposal(chatProposal); // Revert
        }
    };

    const handleSendMessage = async () => {
        if (!chatMessage.trim() || !chatProposal || !user || isSendingMessage) return

        const receiverId = chatProposal.creator_id || chatProposal.creatorId || chatProposal.influencer?.id

        if (!receiverId) {
            toast.error("수신자를 찾을 수 없습니다.")
            return
        }

        const msgContent = chatMessage
        setChatMessage("")
        setIsSendingMessage(true)

        try {
            // Determine if it's a Campaign Application (proposals table) or Direct Offer (brand_proposals table)
            const isCampaignProposal = (chatProposal as any)?.type === 'campaign_apply' || !!(chatProposal as any)?.campaignId

            // sendMessage signature: (receiverId, content, file?, workspaceId?, projectName?)
            await sendMessage(receiverId, msgContent, undefined, chatProposal.workspace_id?.toString())
        } catch (e) {
            console.error("Message send failed:", e)
            setChatMessage(msgContent)
            toast.error("메시지 전송에 실패했습니다.")
        } finally {
            setIsSendingMessage(false)
        }
    }

    // Propose Modal State
    const [proposeModalOpen, setProposeModalOpen] = useState(false)
    const [selectedCreator, setSelectedInfluencer] = useState<any>(null)
    const [productName, setProductName] = useState("")
    const [confirmStatusData, setConfirmStatusData] = useState<{ id: string, status: string } | null>(null)

    const executeStatusChange = async () => {
        if (!confirmStatusData) return
        try {
            await updateProposal(confirmStatusData.id, {
                status: confirmStatusData.status as any
            })
            toast.success("✓ 상태가 변경되었습니다", { description: "목록에 즉시 반영됩니다." })
            setConfirmStatusData(null)
            await refreshData()
        } catch (error) {
            console.error('Status change error:', error)
            toast.error("상태 변경에 실패했습니다.")
        }
    }

    const [productType, setProductType] = useState("gift") // gift, loan
    const [videoGuide, setVideoGuide] = useState("brand_provided") // brand_provided, creator_planned
    const [priceOffer, setPriceOffer] = useState("")
    const [hasIncentive, setHasIncentive] = useState(false)
    const [incentiveDetail, setIncentiveDetail] = useState("")
    const [channelType, setChannelType] = useState("")
    const [message, setMessage] = useState("")
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
    const [productUrl, setProductUrl] = useState("") // New: Product URL
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | number | null>(null)
    const [submitProgress, setSubmitProgress] = useState(0) // New: Progress state

    // Product Upload State
    // Removed productFormOpen and related dialog states as they are moved to MyProductsView
    const [isSendingMessage, setIsSendingMessage] = useState(false)
    const [trackingInput, setTrackingInput] = useState("")
    const [isUpdatingShipping, setIsUpdatingShipping] = useState(false)

    const handleUpdateShipping = async () => {
        if (!trackingInput.trim()) {
            toast.error("운송장 번호를 입력해주세요.")
            return
        }
        if (!chatProposal) return

        setIsUpdatingShipping(true)
        try {
            const isCampaignProposal = !!chatProposal.campaignId || (chatProposal as any)?.type === 'campaign_apply'
            const proposalId = chatProposal.id?.toString()
            const receiverId = chatProposal.creator_id || chatProposal.creatorId || chatProposal.influencer?.id

            const updateData = {
                tracking_number: trackingInput,
                delivery_status: 'shipped'
            }

            let success = false
            if (isCampaignProposal) {
                success = await updateProposal(proposalId, updateData)
            } else {
                success = await updateProductApplication(proposalId, updateData)
            }

            if (success) {
                // Update local state
                setChatProposal((prev: any) => ({ ...prev, ...updateData }))

                // Notify Creator (message + notification)
                if (receiverId) {
                    const msgContent = `📦 [시스템] 제품 발송이 시작되었습니다.\n운송장 번호: ${trackingInput}`
                    await sendMessage(receiverId, msgContent, undefined, chatProposal.workspace_id?.toString())
                    // 🔔 배송 운송장 알림
                    await sendNotification(
                        receiverId,
                        `${user?.name || '브랜드'}님이 제품을 발송했습니다. 운송장 번호: ${trackingInput}`,
                        'shipping_started',
                        chatProposal?.workspace_id?.toString() || proposalId
                    )
                }

                toast.success("발송 정보가 업데이트되었습니다.")
            }
        } catch (e) {
            console.error("Shipping update failed:", e)
            toast.error("업데이트 중 오류가 발생했습니다.")
        } finally {
            setIsUpdatingShipping(false)
        }
    }
    const [productSearchQuery, setProductSearchQuery] = useState("")
    const [selectedBrandProduct, setSelectedBrandProduct] = useState<any>(null) // Brand Detail View State

    const PRICE_FILTER_RANGES = [
        { k: 'all', l: '전체', s: '전체', min: 0, max: Infinity },
        { k: 'under_10', l: '10만원 이하', s: '10만이하', min: 0, max: 100000 },
        { k: '10_30', l: '10만원 ~ 30만원', s: '10~30만', min: 100000, max: 300000 },
        { k: '30_50', l: '30만원 ~ 50만원', s: '30~50만', min: 300000, max: 500000 },
        { k: '50_100', l: '50만원 ~ 100만원', s: '50~100만', min: 500000, max: 1000000 },
        { k: '100_300', l: '100만원 ~ 300만원', s: '100~300만', min: 1000000, max: 3000000 },
        { k: 'over_300', l: '300만원 이상', s: '300만+', min: 3000000, max: Infinity },
    ]

    const filteredProducts = products?.filter(p => {
        if ((p as any).is_draft) return false
        const q = productSearchQuery.toLowerCase()
        if (!q) return true
        return (
            p.name.toLowerCase().includes(q) ||
            (p.brandName || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q)
        )
    }) || []



    // Removed Settings States as they are now encapsulated in BrandProfileView

    // Sync view with URL
    useEffect(() => {
        const view = searchParams.get('view')
        if (view) {
            const mappedView = view === "dashboard" ? "my-campaigns" : view
            // Only update if the view from URL is different and it's a fresh navigation (not just a re-render)
            // Ideally, we should just let the initial state handle it, or update ONLY when searchParams change.
            // Removing 'currentView' from dependency array to avoid the loop.
            if (mappedView !== currentView) {
                setCurrentView(mappedView)
            }
        }
    }, [searchParams]) // Remove currentView from dependency array




    const [isCreating, setIsCreating] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null) // Assuming this holds the product selected for proposal
    const [channelName, setChannelName] = useState<string>("")
    const [channelSubtype, setChannelSubtype] = useState<string>("")
    const [dateFlexible, setDateFlexible] = useState<boolean>(false)
    const [conditionSecondaryUsagePeriod, setConditionSecondaryUsagePeriod] = useState<string>("불가")
    const [conditionMaintenancePeriod, setConditionMaintenancePeriod] = useState<string>("")
    const [proposalMessage, setProposalMessage] = useState<string>("")
    const [desiredDate, setDesiredDate] = useState<string>("")

    const handleCreateProposal = async (formData: MomentProposalFormData) => {
        if (!user || user.role !== "brand") return
        if (!selectedCreator) return

        setIsCreating(true)
        try {
            const proposalData = {
                brand_id: user.id,
                creator_id: selectedCreator.creatorId,
                moment_id: selectedCreator.id || null, // null if it's not a moment
                product_id: formData.selectedProductId || selectedProduct?.id || null,
                message: formData.proposalMessage,
                conditions: {
                    product_name: formData.productName,
                    product_type: formData.productType,
                    price_offer: formData.priceOffer ? parseInt(formData.priceOffer.replace(/[^0-9]/g, '')) : null,
                    has_incentive: formData.hasIncentive,
                    incentive_detail: formData.hasIncentive ? formData.incentiveDetail : null,
                    channel_name: formData.channelName,
                    channel_subtype: formData.channelSubtype || null,
                    desired_date: formData.desiredDate ? format(formData.desiredDate, "yyyy-MM-dd") : null,
                    condition_draft_submission_date: formData.draftSubmissionDate ? format(formData.draftSubmissionDate, "yyyy-MM-dd") : null,
                    condition_final_submission_date: formData.finalSubmissionDate ? format(formData.finalSubmissionDate, "yyyy-MM-dd") : null,
                    condition_upload_date: formData.desiredDate ? format(formData.desiredDate, "yyyy-MM-dd") : null,
                    condition_secondary_usage_period: formData.secondaryUsagePeriod || "불가",
                    secondary_usage_fee: formData.secondaryUsageFee ? parseInt(formData.secondaryUsageFee.replace(/[^0-9]/g, '')) : 0,
                    condition_maintenance_period: formData.maintenancePeriod || null,
                    date_flexible: formData.dateFlexible,
                    video_guide: formData.videoGuide,
                    product_url: formData.productUrl || null,
                },
                status: "offered"
            }

            const insertedProposal = await createMomentProposal(proposalData)
            toast.success("제안서가 전송되었습니다!")

            // 알림 발송은 trigger에서 자동 처리되지만 클라이언트 알림용 
            if (insertedProposal) {
                await sendMessage(selectedCreator.creatorId, `협업 제안서가 전송되었습니다.\n[${formData.productName}]`, undefined, insertedProposal.workspace_id?.toString())
            }

            setProposeModalOpen(false)
        } catch (error: any) {
            console.error("Proposal error:", error)
            toast.error(error.message || "제안 전송에 실패했습니다.")
        } finally {
            setIsCreating(false)
        }
    }

    // handleFinalSubmit and Product form logic were moved to MyProductsView



    // [FIXED] Removed redundant filters - Provider and RLS already filter correctly by team_id
    // The page-level brandId filter was causing campaigns to not display
    const myCampaigns = campaigns  // Already filtered by RLS (team_id) and Provider
    const mySentProposals = productApplications  // Already filtered by RLS
    // [FIX] 내 브랜드 제품만: RLS가 동작 안 할 경우를 대비해 brandId로 추가 필터링
    const myProducts = user?.id
        ? (products || []).filter(p => p.brandId === user.id)
        : (products || [])

    // Filter items by type (moment/campaign/brand)
    const filterByType = (items: any[], type: 'all' | 'moment' | 'campaign' | 'brand') => {
        if (type === 'all') return items

        return items.filter(item => {
            if (type === 'moment') {
                // Moment proposals or brand proposals with event_id
                return item.moment_id || item.moment_id
            }
            if (type === 'campaign') {
                // Campaign proposals  
                return item.campaign_id && !item.moment_id && !item.moment_id
            }
            if (type === 'brand') {
                // Brand proposals without event_id (direct offers)
                return !item.moment_id && !item.moment_id && !item.campaign_id
            }
            return false
        })
    }

    // Render sub-tabs for type filtering
    const renderSubTabs = (items: any[]) => {
        const momentCount = filterByType(items, 'moment').length
        const campaignCount = filterByType(items, 'campaign').length
        const brandCount = filterByType(items, 'brand').length

        return (
            <div className="flex gap-2 mb-4 flex-wrap">
                <button
                    onClick={() => setWorkspaceSubTab('all')}
                    className={`min-w-[90px] px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    전체 <span className="ml-1.5 text-xs opacity-70">{items.length}</span>
                </button>
                <button
                    onClick={() => setWorkspaceSubTab('moment')}
                    className={`min-w-[100px] px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'moment'
                        ? 'bg-slate-900 text-white'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    모먼트 <span className="ml-1.5 text-xs opacity-70">{momentCount}</span>
                </button>
                <button
                    onClick={() => setWorkspaceSubTab('campaign')}
                    className={`min-w-[100px] px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'campaign'
                        ? 'bg-slate-900 text-white'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    캠페인 <span className="ml-1.5 text-xs opacity-70">{campaignCount}</span>
                </button>
                <button
                    onClick={() => setWorkspaceSubTab('brand')}
                    className={`min-w-[100px] px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'brand'
                        ? 'bg-slate-900 text-white'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    브랜드 <span className="ml-1.5 text-xs opacity-70">{brandCount}</span>
                </button>
            </div>
        )
    }

    // Non-blocking loading state (optional: show a small spinner elsewhere if needed)
    // if (isLoading) { return <Loader...> } - REMOVED to prevent infinite lock

    const renderContent = () => {
        switch (currentView) {
            case "discover":
                return (
                    <DiscoverView />
                )
            case "my-campaigns":
                return (
                    <MyCampaignsView
                        myCampaigns={myCampaigns}
                        campaignProposals={campaignProposals}
                        selectedCampaignId={selectedCampaignId as any}
                        setSelectedCampaignId={setSelectedCampaignId}
                        deleteCampaign={deleteCampaign}
                        updateCampaignStatus={updateCampaignStatus as any}
                        refreshData={refreshData}
                    />
                )

            case "browse-campaigns":
                return (
                    <CampaignBrowseView
                        campaigns={(allCampaigns || []).filter((c: any) => c.status !== 'draft')}
                        applicantCounts={brandApplicantCounts}
                        favorites={favorites}
                        onCampaignClick={() => { }}
                        title="캠페인 둘러보기"
                        description="크리에이터들이 보는 실제 캐페인 목록을 확인하세요."
                    />
                )

            case "proposals":
                return (
                    <WorkspaceView
                        campaignProposals={campaignProposals}
                        productApplications={productApplications}
                        momentProposals={momentProposals as any[]}
                        workspaceTab={workspaceTab}
                        setWorkspaceTab={setWorkspaceTab}
                        setChatProposal={setChatProposal}
                        setIsChatOpen={setIsChatOpen}
                        handleStatusUpdate={handleStatusUpdate as any}
                        onViewProposal={(proposal: any) => {
                            setReadonlyProposal(proposal)
                            setShowReadonlyProposalDialog(true)
                        }}
                    />
                )

            case "my-products":
                return (
                    <MyProductsView
                        onViewDetail={(productId) => {
                            setSelectedProductId(productId)
                            setCurrentView("product-detail")
                        }}
                    />
                )
            case "product-detail":
                return (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <ProductDetailView
                            productId={selectedProductId!}
                            onBack={() => setCurrentView("discover-products")}
                        />
                    </div>
                )
            case "deposit":
                return (
                    <DepositView
                        userId={user?.id as string}
                        depositBalance={(displayUser as any)?.deposit_balance || 0}
                        onBalanceRefresh={refreshData}
                    />
                )
            case "discover-products":
                return (
                    <ProductBrowseView
                        products={filteredProducts}
                        favorites={favorites}
                        onViewDetail={(p) => {
                            setSelectedProductId(String(p.id))
                            setCurrentView("product-detail")
                        }}
                        onViewGuide={(p) => {
                            if (p.link) window.open(p.link, "_blank")
                        }}
                        description="다른 브랜드의 제품을 둘러보고 협업 아이디어를 얻어보세요."
                    />
                )
            case "notifications":
                return <NotificationsView />
            case "deposit":
                return (
                    <DepositView
                        userId={user?.id ?? ''}
                        depositBalance={(user as any)?.deposit_balance ?? 0}
                        onBalanceRefresh={refreshData}
                    />
                )
            case "settings":
                return (
                    <BrandProfileView refreshData={refreshData} />
                )
            default:
                return null
        }
    }

    // Assuming usePlatform is called here or higher up in the component
    // const { deleteProductApplication, deleteMomentProposal } = usePlatform();

    if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

    const handleCancelProposal = async (proposalId: string) => {
        if (!readonlyProposal) return;
        try {
            // Determine type by checking moment_id (which exists on moment proposals)
            // or by checking custom type field if available.
            const isMomentProposal = !!readonlyProposal.moment_id || readonlyProposal.type === 'moment_offer';

            if (isMomentProposal) {
                // Assuming deleteMomentProposal is destructured from usePlatform()
                await deleteMomentProposal(proposalId);
            } else {
                // Assuming deleteProductApplication is destructured from usePlatform()
                await deleteProductApplication(proposalId);
            }
            toast.success("제안이 취소되었습니다.");
            refreshData();
        } catch (e) {
            console.error(e);
            toast.error("제안 취소 중 오류가 발생했습니다.");
        }
    };

    const renderSidebarNav = (isMobile = false) => {
        const handleNavClick = (view: string) => {
            setCurrentView(view)
            if (isMobile) setIsMobileSidebarOpen(false)
        }

        const handleTabClick = (tab: string) => {
            setWorkspaceTab(tab)
            if (isMobile) setIsMobileSidebarOpen(false)
        }

        return (
            <aside className={isMobile ? "flex flex-col gap-4 p-4" : "hidden lg:flex flex-col gap-4"}>
                <div className="flex items-center gap-3 px-2 py-4 border-b">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xl overflow-hidden shrink-0">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            user?.name?.[0] || "B"
                        )}
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-bold truncate">{user?.name || "브랜드"}</h2>
                        <p className="text-xs text-muted-foreground truncate">{user?.role === 'brand' ? '브랜드 계정' : user?.role}</p>
                    </div>
                </div>
                <nav className="space-y-1">
                    <Button
                        variant={currentView === "discover" ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleNavClick("discover")}
                    >
                        <Search className="mr-2 h-4 w-4" /> 모먼트 검색
                    </Button>
                    <Button
                        variant={currentView === "proposals" ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleNavClick("proposals")}
                    >
                        <Briefcase className="mr-2 h-4 w-4" /> 워크스페이스 아카이브
                    </Button>
                    {currentView === "proposals" && (
                        <div className="ml-9 space-y-1 mt-1 border-l pl-2">
                            {/* 진행중 */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start text-xs h-8 ${workspaceTab === 'active' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-muted-foreground'}`}
                                onClick={() => handleTabClick("active")}
                            >
                                <span className="flex-1 text-left">진행중</span>
                                {workspaceTabBadges.active && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />}
                            </Button>
                            {/* 받은 제안 */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start text-xs h-8 ${workspaceTab === 'inbound' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-muted-foreground'}`}
                                onClick={() => handleTabClick("inbound")}
                            >
                                <span className="flex-1 text-left">받은 제안</span>
                                {workspaceTabBadges.inbound && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />}
                            </Button>
                            {/* 보낸 제안 */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start text-xs h-8 ${workspaceTab === 'outbound' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-muted-foreground'}`}
                                onClick={() => handleTabClick("outbound")}
                            >
                                <span className="flex-1 text-left">보낸 제안</span>
                                {workspaceTabBadges.outbound && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />}
                            </Button>
                            {/* 거절됨 */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start text-xs h-8 ${workspaceTab === 'rejected' ? 'bg-red-50 text-red-600 font-medium' : 'text-muted-foreground'}`}
                                onClick={() => handleTabClick("rejected")}
                            >
                                <span className="flex-1 text-left">거절됨</span>
                                {workspaceTabBadges.rejected && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />}
                            </Button>
                            {/* 완료됨 */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start text-xs h-8 ${workspaceTab === 'completed' ? 'bg-muted text-foreground/90 font-medium' : 'text-muted-foreground'}`}
                                onClick={() => handleTabClick("completed")}
                            >
                                <span className="flex-1 text-left">완료됨</span>
                                {workspaceTabBadges.completed && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />}
                            </Button>
                        </div>
                    )}
                    {FEATURES.ENABLE_CAMPAIGNS && (
                        <Button
                            variant={currentView === "my-campaigns" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handleNavClick("my-campaigns")}
                        >
                            <Package className="mr-2 h-4 w-4" /> 내 캠페인 관리
                        </Button>
                    )}
                    {FEATURES.ENABLE_CAMPAIGNS && (
                        <Button
                            variant={currentView === "browse-campaigns" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handleNavClick("browse-campaigns")}
                        >
                            <Search className="mr-2 h-4 w-4" /> 캠페인 둘러보기
                        </Button>
                    )}
                    <Button
                        variant={currentView === "my-products" ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleNavClick("my-products")}
                    >
                        <ShoppingBag className="mr-2 h-4 w-4" /> 내 브랜드 제품 관리
                    </Button>
                    <Button
                        variant={currentView === "discover-products" ? "secondary" : "ghost"}
                        className="w-full justify-start text-primary font-medium"
                        onClick={() => handleNavClick("discover-products")}
                    >
                        <ShoppingBag className="mr-2 h-4 w-4" /> 브랜드 제품 둘러보기
                    </Button>
                    <Button
                        variant={currentView === "notifications" ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleNavClick("notifications")}
                    >
                        <Bell className={`mr-2 h-4 w-4 ${notifications.some(n => !n.is_read) ? 'text-blue-500 animate-bounce' : ''}`} /> 알림 센터
                        {notifications.filter(n => !n.is_read).length > 0 && (
                            <Badge className="ml-auto bg-blue-500 text-[10px] h-4 px-1">{notifications.filter(n => !n.is_read).length}</Badge>
                        )}
                    </Button>

                    <div className="my-2 border-t" />
                    <Button
                        variant={currentView === "deposit" ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleNavClick("deposit")}
                    >
                        <Wallet className="mr-2 h-4 w-4" /> 예치금 관리
                    </Button>
                    <Button
                        variant={currentView === "settings" ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleNavClick("settings")}
                    >
                        <Settings className="mr-2 h-4 w-4" /> 브랜드 설정
                    </Button>
                </nav>

                {/* Quick Action */}
                <div className="mt-auto p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
                        <Info className="h-3 w-3" /> 빠른 등록
                    </h4>
                    <p className="text-[10px] text-muted-foreground mb-3">새로운 캠페인을 등록하고 최고의 크리에이터를 만나보세요.</p>
                    <Button size="sm" className="w-full text-xs h-8" asChild>
                        <Link href="/brand/new">공고 올리기</Link>
                    </Button>
                </div>
            </aside>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                    <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                        <SheetContent side="left" className="w-[300px] p-0 flex flex-col h-full overflow-hidden">
                            <SheetHeader className="p-4 border-b bg-background z-10 sticky top-0">
                                <SheetTitle className="text-left font-bold text-lg">브랜드 메뉴</SheetTitle>
                            </SheetHeader>
                            <div className="flex-1 overflow-y-auto">
                                {renderSidebarNav(true)}
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Desktop Sidebar */}
                    {renderSidebarNav(false)}

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        {renderContent()}
                    </div>
                </div>
            </main>
            {/* Propose Modal (Unified) */}
            <MomentProposalDialog
                open={proposeModalOpen}
                onOpenChange={setProposeModalOpen}
                targetInfluencer={selectedCreator?.influencer}
                onSubmit={handleCreateProposal}
                isSubmitting={isCreating}
                initialData={
                    channelName ? {
                        productName: productName || "",
                        productUrl: productUrl || "",
                        productType: (productType || "gift") as "gift" | "loan",
                        videoGuide: (videoGuide || "brand_provided") as "brand_provided" | "creator_planned",
                        priceOffer: priceOffer || "",
                        hasIncentive: hasIncentive || false,
                        incentiveDetail: incentiveDetail || "",
                        channelName: channelName,
                        channelSubtype: channelSubtype || "",
                        dateFlexible: dateFlexible || false,
                        secondaryUsagePeriod: conditionSecondaryUsagePeriod || "불가",
                        secondaryUsageFee: secondaryUsageFee || "",
                        maintenancePeriod: conditionMaintenancePeriod || "",
                        proposalMessage: proposalMessage || "",
                        draftSubmissionDate: conditionDraftDate ? new Date(conditionDraftDate) : undefined,
                        finalSubmissionDate: conditionFinalDate ? new Date(conditionFinalDate) : undefined,
                        desiredDate: desiredDate ? new Date(desiredDate) : undefined,
                        selectedProductId: selectedProduct?.id,
                    } : null
                }
            />
            {/* Product Registration / Preview Dialog was moved to MyProductsView */}

            {/* Premium Deal Room Dialog */}
            < Dialog open={isChatOpen} onOpenChange={setIsChatOpen} >
                <DialogContent className="left-0 top-14 translate-x-0 translate-y-0 max-w-[100vw] w-full h-[calc(100dvh-3.5rem)] rounded-none sm:left-[50%] sm:top-[50%] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-[1500px] sm:w-[95vw] sm:h-[90vh] sm:max-h-[900px] sm:rounded-2xl p-0 gap-0 overflow-hidden flex flex-col bg-background border-0 shadow-2xl">
                    <DialogTitle className="sr-only">Brand Workspace</DialogTitle>
                    {/* Status Change Confirmation Dialog */}
                    <AlertDialog open={!!confirmStatusData} onOpenChange={(open) => !open && setConfirmStatusData(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>지원서 상태 변경</AlertDialogTitle>
                                <AlertDialogDescription>
                                    이 지원서를 {confirmStatusData?.status === 'accepted' ? '수락' : confirmStatusData?.status === 'hold' ? '보류' : '거절'}하시겠습니까?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setConfirmStatusData(null)}>취소</AlertDialogCancel>
                                <AlertDialogAction onClick={executeStatusChange}>확인</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <WorkspaceLayout userRole="brand" />
                </DialogContent>
            </Dialog >

            {/* Confirmation Dialog */}
            < AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen} >
                <AlertDialogContent className="bg-background rounded-2xl border-0 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-foreground">
                            조건을 최종 확정하시겠습니까?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
                            현재 입력된 날짜 및 조건으로 확정됩니다.<br />
                            양측이 모두 확정하면 계약서 작성이 가능해집니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl border-0 bg-muted hover:bg-slate-200 text-muted-foreground">취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeConfirmCondition}
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                        >
                            확정하기
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog >

            {/* Read-only Proposal Dialog */}
            < ReadonlyProposalDialog
                open={showReadonlyProposalDialog}
                onOpenChange={setShowReadonlyProposalDialog}
                proposal={readonlyProposal}
                currentUserId={user?.id}
                onCancel={handleCancelProposal} // [NEW] Pass cancel handler
            />

        </div >
    )
}

