"use client"

import InsightAnalyzer from "@/components/creator/InsightAnalyzer"
import { type Campaign, type CreatorMoment } from "@/lib/types"
import { useTeam } from "@/components/providers/team-provider"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { CampaignApplicationDialog } from "@/components/dialogs/CampaignApplicationDialog"
import { WorkspaceProgressBar } from "@/components/workspace-progress-bar"
import { WorkspaceLayout } from "@/components/workspace/common/workspace-layout"
import { useWorkspaceStore } from "@/components/workspace/hooks/use-workspace-store"
import { formatDateToMonth, formatPriceRange } from "@/lib/utils"
import { AlertCircle, ArrowRight, BadgeCheck, Banknote, Bell, Briefcase, Building2, Calendar, CheckCircle2, ChevronRight, DollarSign, ExternalLink, FileText, Filter, Gift, Image as ImageIcon, LayoutGrid, List, Megaphone, Menu, MessageSquare, Package, Pencil, Plus, Rocket, Search, Send, Settings, Shield, ShoppingBag, Sparkles, Star, Table as TableIcon, X } from "lucide-react"
import Link from "next/link"
import React from "react"
import { FEATURES } from "@/lib/config/features"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet"
import { useMobileSidebar } from "@/lib/hooks/use-mobile-sidebar"

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Loader2 } from "lucide-react"
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from "next/navigation"

// Dialog Components - Dynamically loaded for code splitting
const CreatorProposalDialog = dynamic(() => import("@/components/dialogs/CreatorProposalDialog").then(m => ({ default: m.CreatorProposalDialog })))
const GuideDialog = dynamic(() => import("@/components/dialogs/GuideDialog").then(m => ({ default: m.GuideDialog })))
const CampaignDetailDialog = dynamic(() => import("@/components/dialogs/CampaignDetailDialog").then(m => ({ default: m.CampaignDetailDialog })))
const DetailsModal = dynamic(() => import("@/components/dialogs/DetailsModal").then(m => ({ default: m.DetailsModal })))
const ProductGuideDialog = dynamic(() => import("@/components/dialogs/ProductGuideDialog").then(m => ({ default: m.ProductGuideDialog })))
const ReadonlyProposalDialog = dynamic(() => import("@/components/proposal/readonly-proposal-dialog").then(m => ({ default: m.ReadonlyProposalDialog })))
// [PERF Plan B] SignatureCanvas is only needed when the signature modal opens.
const SignatureCanvasDynamic = dynamic(() => import('react-signature-canvas'), {
    ssr: false,
    loading: () => <div className="w-full h-48 bg-muted/30 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-sm text-muted-foreground">서명 영역 로딩 중...</div>
}) as any

// View Components
import { MomentCard } from "@/components/creator/MomentCard"
import { ApplicationsView } from "@/components/creator/views/ApplicationsView"
import { DashboardView } from "@/components/creator/views/DashboardView"
import { InboundProposalsView } from "@/components/creator/views/InboundProposalsView"
import { MomentsView } from "@/components/creator/views/MomentsView"
import { DiscoverMomentsView } from "@/components/creator/views/DiscoverMomentsView"
import { NotificationsView } from "@/components/creator/views/NotificationsView"
import { WorkspaceView } from "@/components/creator/views/WorkspaceView"
import { PastMomentsView } from "@/components/creator/views/PastMomentsView"
// Imports for Design Options
import { CampaignCardA } from "@/components/creator/campaign-cards/CampaignCardA"
import { CampaignCardB } from "@/components/creator/campaign-cards/CampaignCardB"
import { CampaignCardC } from "@/components/creator/campaign-cards/CampaignCardC"
import { BrandProductDetailView } from "@/components/creator/views/BrandProductDetailView"
import { BrandProductDiscoveryView } from "@/components/creator/views/BrandProductDiscoveryView"
import { BrandProductListView } from "@/components/creator/views/BrandProductListView"
import { FavoriteButton } from "@/components/ui/favorite-button"
import { CampaignBrowseView } from "@/components/shared/CampaignBrowseView"
import { ProductBrowseView } from "@/components/shared/ProductBrowseView"

// MCN Components
import { CampaignCardD } from "@/components/creator/campaign-cards/CampaignCardD"
import { CampaignCardE } from "@/components/creator/campaign-cards/CampaignCardE"
import { SettingsView } from "@/components/creator/views/SettingsView"
import { EarningsView } from "@/components/creator/views/EarningsView"
import { InviteLinkGenerator } from "@/components/mcn/invite-link-generator"
import { TeamMembersCard } from "@/components/mcn/team-members-card"
import { TeamStatistics } from "@/components/mcn/team-statistics"
import { useEffectiveUser } from "@/lib/hooks/use-effective-user"
import { Users as UsersIcon } from "lucide-react"

import { POPULAR_TAGS } from "@/lib/constants/categories"

import { DemoBanner } from "@/components/demo-banner"
import { Suspense } from "react"
import { PerformanceSubmitDialog } from "@/components/workspace/creator/performance-submit-dialog"
const INITIAL_CAMPAIGNS: Campaign[] = []

// Dialog components imported from @/components/dialogs/
// Removed 5 dialog functions: ApplyDialog, GuideDialog, CampaignDetailDialog, DetailsModal, ProductGuideDialog (~625 lines)

function AIPlanModal({ isOpen, onOpenChange, planContent }: { isOpen: boolean; onOpenChange: (open: boolean) => void; planContent: string }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" /> AI 기획안
                    </DialogTitle>
                    <DialogDescription>
                        AI가 제안하는 캠페인 콘텐츠 기획안입니다. 참고하여 어필 메시지를 작성해보세요.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    <Textarea
                        value={planContent}
                        readOnly
                        className="min-h-[250px] bg-muted border-border text-foreground"
                    />
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>닫기</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function CreatorDashboard() {
    const {
        user, updateUser, campaigns, moments, isLoading, notifications,
        productApplications, momentProposals, updateProductApplication, // [NEW] Added momentProposals
        sendNotification,
        submissionFeedback: contextSubmissionFeedback, fetchSubmissionFeedback, sendSubmissionFeedback,
        messages, sendMessage,
        deleteMoment, campaignProposals, updateProposal, addProposal,
        products, switchRole, updateMoment, supabase,
        favorites, toggleFavorite, isInitialized, isAuthLoading, refreshData,
        markAsRead, // [딥링크] 알림 센터 읽음 처리용
    } = useUnifiedProvider()

    // MCN Proxy Mode Support
    const { effectiveUser, isProxyMode, actualUser } = useEffectiveUser()
    // Treat 'agency' same as 'mcn' for dashboard logic
    const isMCN = user?.role === 'mcn' || user?.role === 'agency'

    const router = useRouter()
    const { switchToMember } = useTeam()
    const searchParams = useSearchParams()
    const initialViewRaw = searchParams.get('view') || "dashboard"
    let initialView = initialViewRaw
    // [FEATURE FLAG] 캠페인 숨김 관련 보호
    if (!FEATURES.ENABLE_CAMPAIGNS && initialView === 'discover-campaigns') {
        initialView = 'dashboard'
    }

    // State definitions moved up to avoid ReferenceError
    // MCN/Agency: If no teams, show "Waiting for Team" state
    const { teams } = useUnifiedProvider()

    // State definitions moved up to avoid ReferenceError
    const [currentView, setCurrentView] = useState(initialView)
    const [notificationFilter, setNotificationFilter] = useState<'all' | 'action' | 'update' | 'message'>('action')

    const [chatProposal, setChatProposal] = useState<any>(null)
    const [isChatOpen, setIsChatOpen] = useState(false)
    // Performance Submit Dialog (settlement 단계 성과 제출)
    const [perfSubmitProposal, setPerfSubmitProposal] = useState<any>(null)
    const [perfSubmitOpen, setPerfSubmitOpen] = useState(false)
    const [chatMessage, setChatMessage] = useState("")
    // ... (rest of state definitions)
    const [generatedContract, setGeneratedContract] = useState("")
    const [isGeneratingContract, setIsGeneratingContract] = useState(false)
    const [isAddMomentOpen, setIsAddMomentOpen] = useState(false)
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
    const [favoritesOnly, setFavoritesOnly] = useState(false)
    const { isOpen: isMobileSidebarOpen, setIsOpen: setIsMobileSidebarOpen } = useMobileSidebar()

    // Design Option State
    const [designOption, setDesignOption] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A')
    const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid')

    // === G: Search / Filter / Pagination states ===
    // 브랜드 캐페인 둘러보기
    const [campaignSearchQuery, setCampaignSearchQuery] = useState('')
    const [campaignTagFilter, setCampaignTagFilter] = useState<string[]>([])
    const [campaignPageSize, setCampaignPageSize] = useState<number>(20)
    const [campaignFavoritesOnly, setCampaignFavoritesOnly] = useState(false)
    const [campaignViewMode, setCampaignViewMode] = useState<'grid' | 'list'>('grid')
    const [campaignStatusFilter, setCampaignStatusFilter] = useState<'all' | 'active' | 'closed'>('all')
    // 브랜드 제품 둘러보기
    const [productTagFilter, setProductTagFilter] = useState<string[]>([])
    const [productPageSize, setProductPageSize] = useState<20 | 50 | 100>(20)
    // 워크스페이스 아카이브 검색
    const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState('')
    // 워크스페이스 아카이브 필터/페이지네이션
    const [workspaceFavoritesOnly, setWorkspaceFavoritesOnly] = useState(false)
    const [workspacePageSize, setWorkspacePageSize] = useState<20 | 50 | 100>(20)

    // Guide Modal State
    const [guideModalOpen, setGuideModalOpen] = useState(false)
    const [guideModalData, setGuideModalData] = useState<any>(null)

    // Product Guide View State (Restored)
    const [isProductGuideOpen, setIsProductGuideOpen] = useState(false)
    const [guideProduct, setGuideProduct] = useState<any>(null)

    // Confirm Dialog State for Accept/Reject
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean
        title: string
        description: string
        onConfirm: () => Promise<void>
        variant?: 'default' | 'destructive'
    } | null>(null)

    // Content Submission State
    const [submissionFile, setSubmissionFile] = useState<File | null>(null)
    const [submissionUrl, setSubmissionUrl] = useState("")
    const [isSubmittingContent, setIsSubmittingContent] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isReuploading, setIsReuploading] = useState(false)


    // Details Modal State
    const [selectedItemDetails, setSelectedItemDetails] = useState<any>(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [detailsType, setDetailsType] = useState<'moment' | 'campaign'>('moment')
    const [relatedProposals, setRelatedProposals] = useState<any[]>([])
    const [workspaceTab, setWorkspaceTab] = useState("active")
    const [workspaceViewMode, setWorkspaceViewMode] = useState<'list' | 'grid' | 'table'>('list')
    const [workspaceSubTab, setWorkspaceSubTab] = useState<'all' | 'moment' | 'campaign' | 'brand'>('all')

    // [Badge] 탭별 새 이벤트 여부 계산
    const workspaceTabBadges = useMemo(() => {
        const allProposals: any[] = [
            ...(productApplications || []),
            ...(campaignProposals || []),
            ...(momentProposals || []),
        ]
        const unreadWorkspaceIds = new Set(
            (messages || [])
                .filter(m => m.senderId !== user?.id && !m.read && m.workspaceId)
                .map(m => m.workspaceId)
        )
        const hasUnread = (proposals: any[]) =>
            proposals.some(p => p.workspace_id && unreadWorkspaceIds.has(p.workspace_id))

        const activeProposals = allProposals.filter(p =>
            p.status === 'accepted' || p.status === 'active' || p.status === 'in_progress' ||
            p.status === 'signed' || p.status === 'confirmed' || p.status === 'settlement' || p.status === 'final_complete'
        )
        const inboundProposals = allProposals.filter(p => p.status === 'applied')
        const outboundProposals = allProposals.filter(p => p.status === 'offered' || p.status === 'pending')
        const rejectedProposals = allProposals.filter(p => p.status === 'rejected')
        const completedProposals = allProposals.filter(p => p.status === 'completed')

        return {
            active: hasUnread(activeProposals),
            inbound: inboundProposals.length > 0 || hasUnread(inboundProposals),
            outbound: hasUnread(outboundProposals),
            rejected: hasUnread(rejectedProposals),
            completed: hasUnread(completedProposals),
        }
    }, [productApplications, campaignProposals, momentProposals, messages, user?.id])

    // 지원서 수정 모달
    const [editingApplication, setEditingApplication] = useState<any>(null)
    const [editAppealMessage, setEditAppealMessage] = useState('')
    const [editDesiredCost, setEditDesiredCost] = useState('')
    const [isSavingApplication, setIsSavingApplication] = useState(false)

    // 지원서 작성/수정 모달 등 (Outbound Application / Campaign Application)
    const [isProposalOpen, setIsProposalOpen] = useState(false);
    const [proposalTarget, setProposalTarget] = useState<any>(null);
    const [isCampaignApplyOpen, setIsCampaignApplyOpen] = useState(false);
    const [editApplicationParams, setEditApplicationParams] = useState<any>(null);

    // ReadonlyProposalDialog    // 읽기 전용 다이얼로그
    const [showReadonlyDialog, setShowReadonlyDialog] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<any>(null)

    // 캠페인 모달
    const [isCampaignDetailOpen, setIsCampaignDetailOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

    // AI Planner State
    const [isAIPlanning, setIsAIPlanning] = useState(false)
    const [aiPlanResult, setAiPlanResult] = useState("")
    const [isAIPlanModalOpen, setIsAIPlanModalOpen] = useState(false)

    // Application Form States (Moved to top)
    const [motivation, setMotivation] = useState("")
    const [contentPlan, setContentPlan] = useState("")
    const [portfolioLinks, setPortfolioLinks] = useState("")
    const [instagramHandle, setInstagramHandle] = useState("")
    const [insightFile, setInsightFile] = useState<File | null>(null)
    // [New] Proxy Application State
    const [targetCreatorId, setTargetCreatorId] = useState<string>("")
    const [teamMembers, setTeamMembers] = useState<any[]>([])

    // NOTE: MCN no-team check moved below all hooks (React rules: no early returns before hooks)

    // [URL Sync] workspace에 chatProposal 열릴 때 URL에 proposalId 기록, 닫힐 때 제거
    // 모바일에서 캠페인 페이지 사이즈 10으로 고정
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setCampaignPageSize(10)
        }
    }, [])

    // [URL Sync] workspace에 chatProposal 열릴 때 URL에 proposalId 기록, 닫힐 때 제거
    // 추가로 currentView와 workspaceTab 상태도 URL과 함께 동기화하여 뒤로가기/닫기 시 유지
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        let changed = false;

        // Sync proposalId
        const activeModalId = (() => {
            if (currentView !== 'proposals') return null;
            if (isChatOpen && chatProposal?.id) return chatProposal.workspace_id?.toString() || chatProposal.id.toString();
            if (showReadonlyDialog && selectedProposal?.id) return selectedProposal.workspace_id?.toString() || selectedProposal.id.toString();
            return null;
        })();

        if (activeModalId) {
            if (params.get('proposalId') !== activeModalId) {
                params.set('proposalId', activeModalId)
                changed = true;
            }
        } else {
            if (params.has('proposalId')) {
                params.delete('proposalId')
                changed = true;
            }
        }

        // Sync view
        if (params.get('view') !== currentView) {
            params.set('view', currentView)
            changed = true;
        }

        // Sync workspaceTab (only if we are in proposals view)
        if (currentView === 'proposals' && params.get('workspaceTab') !== workspaceTab) {
            params.set('workspaceTab', workspaceTab)
            changed = true;
        }

        if (changed) {
            const newUrl = `${window.location.pathname}?${params.toString()}`
            router.replace(newUrl, { scroll: false })
        }
    }, [currentView, isChatOpen, chatProposal?.id, showReadonlyDialog, selectedProposal?.id, workspaceTab, searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

    // [URL Auto-open] 새로고침 시 URL proposalId 기반 workspace 자동 복원
    useEffect(() => {
        const proposalId = searchParams.get('proposalId')
        if (!proposalId || isAuthLoading) return

        // 이미 해당 모달이 화면에 떠있는 상태라면 무시 (닫혀있을 때는 재오픈 허용)
        if (isChatOpen && (chatProposal?.workspace_id?.toString() === proposalId || chatProposal?.id?.toString() === proposalId)) return
        if (showReadonlyDialog && (selectedProposal?.workspace_id?.toString() === proposalId || selectedProposal?.id?.toString() === proposalId)) return

        const allProposals = [
            ...(productApplications || []),
            ...(campaignProposals || []),
            ...(momentProposals as any[] || []),
        ]
        const target = allProposals.find((p: any) => p.workspace_id?.toString() === proposalId || p.id?.toString() === proposalId)
        if (target) {
            setChatProposal((prev: any) => (prev?.workspace_id?.toString() === target.workspace_id?.toString() || prev?.id?.toString() === target.id?.toString()) ? prev : target)

            const targetView = searchParams.get('view')
            if (targetView === 'settlement' || target.status === 'settlement' || target.status === 'final_complete') {
                // 이미 정산 뷰인 경우 모달을 띄우는 대신 정산 뷰를 유지
                setCurrentView('settlement')
                setIsChatOpen(false)
                setShowReadonlyDialog(false)
            } else {
                setCurrentView('proposals')
                // active, inbound, outbound, completed 등 상태에 따라 적절한 모달 선택
                if (target.status === 'active' || target.status === 'accepted' || target.status === 'confirmed' || target.status === 'in_progress' || target.status === 'signed' || target.status === 'started') {
                    setShowReadonlyDialog(false) // 👈 기존의 읽기전용 창이 열려있다면 닫아줌
                    setIsChatOpen(true)
                } else {
                    setIsChatOpen(false) // 👈 기존의 워크스페이스(대화창)가 열려있다면 닫아줌
                    setSelectedProposal(target)
                    setShowReadonlyDialog(true)
                }
            }
        }
    }, [searchParams, productApplications, campaignProposals, momentProposals, isAuthLoading]) // Removed chatProposal from deps to prevent loop

    useEffect(() => {
        const fetchTeamMembers = async () => {

            if (user?.role === 'agency' || user?.role === 'mcn') {
                const { data, error } = await supabase
                    .from('team_members')
                    .select(`
                        id,
                        user_id,
                        role,
                        profile:profiles!team_members_user_id_fkey (
                            display_name,
                            email
                        )
                    `)
                    .eq('team_id', user.teamId)

                if (data) {
                    const members = data.map((m: any) => ({
                        id: m.id,
                        user_id: m.user_id,
                        name: m.profile?.display_name || m.profile?.email || 'Unknown',
                        email: m.profile?.email
                    }))
                    setTeamMembers(members)
                }
            }
        }
        fetchTeamMembers()
    }, [user, supabase])

    const handleGenerateAIPlan = async (campaign: any) => {
        if (!campaign) return
        setIsAIPlanning(true)
        try {
            const response = await fetch('/api/generate-content-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: campaign.product || campaign.productName,
                    sellingPoints: campaign.description, // Using description as selling points proxy if not strictly defined
                    category: campaign.category || "기타",
                    requiredShots: "제품 사용하는 모습, 비포 애프터 비교" // Default shots
                })
            })
            const data = await response.json()
            if (data.result) {
                // Auto-fill fields
                if (data.result.motivation) setMotivation(data.result.motivation)
                if (data.result.content_plan) setContentPlan(data.result.content_plan)

                toast.success("AI가 지원 동기와 콘텐츠 기획안을 자동으로 작성했습니다!")
                // setIsAIPlanModalOpen(true) // No longer needed
            } else {
                toast.error("AI 기획안 생성에 실패했습니다.")
            }
        } catch (e) {
            console.error("AI Plan Error:", e)
            toast.error("오류가 발생했습니다.")
        } finally {
            setIsAIPlanning(false)
        }
    }

    const handleViewProposal = (proposalId: string) => {
        // Find proposal in productApplications (inbound) or proposals (outbound/active)
        // Open ReadonlyProposalDialog to show proposal details

        setIsDetailsModalOpen(false);

        const proposal = productApplications.find((p: any) => p.id === proposalId) ||
            momentProposals.find((p: any) => p.id === proposalId) ||
            campaignProposals.find((p: any) => p.id === proposalId);

        if (proposal) {
            setSelectedProposal(proposal);
            setShowReadonlyDialog(true);
        } else {
            // If not found in loaded list (maybe archived or bug), just navigate to inbound list as fallback
            setCurrentView('inbound_list');
        }
    }

    // Accept Proposal Handler
    const handleAcceptProposal = (e: React.MouseEvent, proposalId: string) => {
        e.stopPropagation() // Prevent card click

        setConfirmDialog({
            open: true,
            title: '제안 수락',
            description: '이 제안을 수락하시겠습니까?',
            onConfirm: async () => {
                try {
                    // Find the proposal to determine its type
                    const proposal = productApplications.find((p: any) => p.id === proposalId) ||
                        momentProposals.find((p: any) => p.id === proposalId) ||
                        campaignProposals.find((p: any) => p.id === proposalId)

                    if (!proposal) {
                        toast.error('제안을 찾을 수 없습니다.')
                        return
                    }

                    let error = null
                    let updatedWorkspaceId: string | null = null;

                    // Update the correct table based on proposal type
                    if ((proposal as any).moment_id) {
                        // Moment proposal
                        const result = await supabase
                            .from('moment_proposals')
                            .update({ status: 'accepted' })
                            .eq('id', proposalId)
                            .select('workspace_id')
                            .single()
                        error = result.error
                        if (result.data) updatedWorkspaceId = result.data.workspace_id
                    } else if ((proposal as any).campaign_id) {
                        // Campaign application
                        const result = await supabase
                            .from('campaign_applications')
                            .update({ status: 'accepted' })
                            .eq('id', proposalId)
                            .select('workspace_id')
                            .single()
                        error = result.error
                        if (result.data) updatedWorkspaceId = result.data.workspace_id
                    } else {
                        // Brand proposal (default)
                        const result = await supabase
                            .from('product_applications')
                            .update({ status: 'accepted' })
                            .eq('id', proposalId)
                            .select('workspace_id')
                            .single()
                        error = result.error
                        if (result.data) updatedWorkspaceId = result.data.workspace_id
                    }

                    if (error) {
                        console.error('Update error details:', JSON.stringify(error));
                        toast.error('수락 실패: ' + (error.message || '알 수 없는 오류'));
                        throw error;
                    }

                    // 1. 워크스페이스 자동 오픈 (DB에서 받아온 새 workspace_id 병합)
                    const newProposalData = updatedWorkspaceId
                        ? { ...proposal, workspace_id: updatedWorkspaceId, status: 'accepted' }
                        : { ...proposal, status: 'accepted' };

                    setChatProposal(newProposalData)
                    setCurrentView('proposals')

                    // 2. 브랜드에게 알림 발송
                    try {
                        const brandId = (proposal as any).brand_id
                        const creatorName = (displayUser as any)?.display_name || displayUser?.name || '크리에이터'
                        if (brandId) {
                            await sendNotification(
                                brandId,
                                `${creatorName}님이 "${(proposal as any).product_name || '제안'}"을 수락했습니다. 협업을 시작하세요!`,
                                'proposal_accepted',
                                proposalId
                            )
                        }
                    } catch (notifErr) {
                        console.warn('알림 발송 실패 (무시):', notifErr)
                    }

                    await refreshData() // Refresh proposal list
                    toast.success('제안을 수락했습니다!')
                } catch (error: any) {
                    console.error('Accept error:', error?.message || error, JSON.stringify(error, Object.getOwnPropertyNames(error)))
                    toast.error('오류 발생: 콘솔을 확인해주세요.')
                }
            }
        })
    }

    // Reject Proposal Handler
    const handleRejectProposal = (e: React.MouseEvent, proposalId: string) => {
        e.stopPropagation() // Prevent card click

        setConfirmDialog({
            open: true,
            title: '제안 거절',
            description: '이 제안을 거절하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            onConfirm: async () => {
                try {
                    // Find the proposal to determine its type
                    const proposal = productApplications.find((p: any) => p.id === proposalId)

                    if (!proposal) {
                        toast.error('제안을 찾을 수 없습니다.')
                        return
                    }

                    let error = null

                    // Update the correct table based on proposal type
                    if ((proposal as any).moment_id) {
                        // Moment proposal
                        const result = await supabase
                            .from('moment_proposals')
                            .update({ status: 'rejected' })
                            .eq('id', proposalId)
                        error = result.error
                    } else if (proposal.campaign_id) {
                        // Campaign application
                        const result = await supabase
                            .from('campaign_applications')
                            .update({ status: 'rejected' })
                            .eq('id', proposalId)
                        error = result.error
                    } else {
                        // Brand proposal (default)
                        const result = await supabase
                            .from('product_applications')
                            .update({ status: 'rejected' })
                            .eq('id', proposalId)
                        error = result.error
                    }

                    if (error) {
                        toast.error('거절 실패: ' + error.message)
                        throw error
                    }

                    await refreshData()
                    toast.success('제안을 거절했습니다.')
                } catch (error: any) {
                    console.error('Reject error:', error)
                }
            }
        })
    }

    // Creator cancels outbound proposals (brand_proposals + campaign_applications)
    const handleCancelProposal = (e: React.MouseEvent, proposalId: string) => {
        e.stopPropagation()

        setConfirmDialog({
            open: true,
            title: '제안 취소',
            description: '이 제안을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            variant: 'destructive',
            onConfirm: async () => {
                try {
                    const proposal = (productApplications as any[]).find((p: any) => p.id === proposalId)

                    if (!proposal) {
                        toast.error('제안을 찾을 수 없습니다.')
                        return
                    }

                    let error = null

                    // Creator's outbound = brand_proposals or campaign_applications
                    if (proposal.campaign_id) {
                        const result = await supabase
                            .from('campaign_applications')
                            .update({ status: 'cancelled' })
                            .eq('id', proposalId)
                        error = result.error
                    } else {
                        const result = await supabase
                            .from('product_applications')
                            .update({ status: 'cancelled' })
                            .eq('id', proposalId)
                        error = result.error
                    }

                    if (error) {
                        toast.error('취소 실패: ' + error.message)
                        throw error
                    }

                    await refreshData()
                    toast.success('제안을 취소했습니다.')
                } catch (error: any) {
                    console.error('Cancel error:', error)
                }
            }
        })
    }

    // Auto-open proposal from URL (Notification Redirect)
    useEffect(() => {
        const proposalId = searchParams.get('proposalId')
        if (proposalId && !chatProposal && productApplications && productApplications.length > 0) {
            const targetProposal = productApplications.find((p: any) => p.id === proposalId)
            if (targetProposal) {
                setChatProposal((prev: any) => prev?.id === targetProposal.id ? prev : targetProposal)
            }
        }
    }, [searchParams, productApplications])

    // [SYNC] Sync chatProposal when productApplications/campaignProposals/momentProposals updates
    // (e.g., when brand updates conditions, creator workspace reflects changes in real-time)
    useEffect(() => {
        if (chatProposal?.id) {
            const updatedBrand = productApplications?.find((p: any) => p.id === chatProposal.id);
            const updatedCampaign = campaignProposals?.find((p: any) => p.id === chatProposal.id);
            const updatedMoment = (momentProposals as any[])?.find((p: any) => p.id === chatProposal.id);
            // [FIX] moment proposal은 productApplications(mappedMoment)에도 포함되지만
            // Realtime 업데이트 시 momentProposals(rawMomentProposals)만 갱신됨.
            // updatedMoment가 있으면 최신 content 필드들을 brandProposal 위에 merge하여 사용.
            const updated = updatedMoment
                ? { ...(updatedBrand || updatedMoment), ...updatedMoment }
                : updatedBrand || updatedCampaign;
            if (updated) {
                setChatProposal(updated);
            }
        }
    }, [productApplications, campaignProposals, momentProposals]); // eslint-disable-line react-hooks/exhaustive-deps

    // Reset sub-tab when main tab changes
    // Reset sub-tab when main tab changes
    useEffect(() => {
        setWorkspaceSubTab('all')
    }, [workspaceTab])

    // Refs for auto-scrolling
    const workspaceChatRef = useRef<HTMLDivElement>(null)

    // Auto-scroll for Chat
    useEffect(() => {
        if (workspaceChatRef.current) {
            workspaceChatRef.current.scrollTop = workspaceChatRef.current.scrollHeight
        }
    }, [messages, isChatOpen])

    // Fetch Feedback History when Chat Opens (Data Sync Fix)
    useEffect(() => {
        if (chatProposal?.workspace_id) {
            fetchSubmissionFeedback(chatProposal.workspace_id.toString())
        }
    }, [chatProposal, isChatOpen])
    const workFeedbackChatRef = useRef<HTMLDivElement>(null)



    const displayUser = (isProxyMode && effectiveUser) ? effectiveUser : user

    // Auto-scroll for Main Workspace Chat
    useEffect(() => {
        if (workspaceChatRef.current) {
            workspaceChatRef.current.scrollTop = workspaceChatRef.current.scrollHeight
        }
    }, [messages, chatProposal])

    // Auto-scroll for Work Feedback Chat
    useEffect(() => {
        if (workFeedbackChatRef.current) {
            workFeedbackChatRef.current.scrollTop = workFeedbackChatRef.current.scrollHeight
        }
    }, [contextSubmissionFeedback, chatProposal])

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
            // [입금 확인 게이트] 관리자가 payment_confirmed_at 세팅 후에만 shipping으로 이동
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

    const fetchProductGuide = async (productId: string) => {
        if (!productId) return;
        try {
            const { data, error } = await supabase
                .from('brand_products')
                .select('*')
                .eq('id', productId)
                .single()

            if (error) throw error;
            setGuideProduct(data);
            setIsProductGuideOpen(true);
        } catch (e) {
            console.error("Failed to fetch product guide:", e);
            toast.error("제작 가이드를 불러올 수 없습니다.");
        }
    }

    const handleOpenDetails = useCallback((item: any, type: 'moment' | 'campaign') => {
        setSelectedItemDetails(item)
        setDetailsType(type)

        let related: any[] = []
        if (type === 'moment') {
            // Filter moment proposals that target this specific moment event
            if (item && item.id) {
                related = (momentProposals as any[]).filter((p: any) =>
                    (p.moment_id === item.id || p.moment_id === item.id) &&
                    p.status !== 'cancelled'
                );
            } else {
                related = [];
            }
        } else {
            // Campaign: Outbound applications
            if (item && item.id) {
                related = []
            }
        }

        setRelatedProposals(related)
        setIsDetailsModalOpen(true)
    }, [momentProposals])



    // Filter events (Admins see all, users see theirs)
    const { displayMoments, activeMoments, myMoments, pastMoments, allMyMoments, upcomingMoments } = useMemo(() => {
        const display = (displayUser as any)?.type === 'admin' ? moments : moments.filter((e: any) => e.creatorId === displayUser?.id || e.handle === displayUser?.handle)

        // Date-based filtering for refined UI
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Date-based filtering with robust parsing
        const parseMomentDate = (dateStr: string) => {
            if (!dateStr) return new Date(0); // Return epoch if invalid
            // Handle "YYYY년 M월" format
            if (dateStr.includes('년') && dateStr.includes('월')) {
                const parts = dateStr.match(/(\d+)년\s*(\d+)월/);
                if (parts) {
                    return new Date(parseInt(parts[1]), parseInt(parts[2]) - 1, 1);
                }
            }
            return new Date(dateStr);
        }

        const active = display.filter((e: any) => {
            const momentDate = parseMomentDate(e.momentDate)
            momentDate.setHours(0, 0, 0, 0)
            return momentDate < today && e.status !== 'completed'
        })

        const my = display.filter((e: any) => {
            const momentDate = parseMomentDate(e.momentDate)
            momentDate.setHours(0, 0, 0, 0)
            return momentDate >= today && e.status !== 'completed'
        })

        const past = display.filter((e: any) => e.status === 'completed')

        const mine = moments.filter((e: any) => e.creatorId === displayUser?.id || e.handle === displayUser?.handle)

        // Compatibility for upstream code using upcomingMoments
        const upcoming = [...active, ...my];

        return {
            displayMoments: display,
            activeMoments: active,
            myMoments: my,
            pastMoments: past,
            allMyMoments: mine,
            upcomingMoments: upcoming
        }
    }, [displayUser, moments])

    // Helper function to deduplicate proposals by ID
    const deduplicateById = useMemo(() => (items: any[]) => {
        const seenIds = new Set<string>()
        return items.filter(item => {
            if (!item?.id || seenIds.has(item.id)) return false
            seenIds.add(item.id)
            return true
        })
    }, [])

    const allInboundProposals = useMemo(() => {
        // productApplications = pure brand_proposals table data
        // momentProposals = pure moment_proposals table data
        // Both are now separate — merge explicitly here for inbound view, but exclude cancelled proposals
        return deduplicateById([
            ...(productApplications?.filter((p: any) => p.status !== 'cancelled') || []),
            ...(momentProposals?.filter((p: any) => p.status !== 'cancelled') || []),
        ]).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    }, [productApplications, momentProposals, deduplicateById])



    // --- SHARED DATA LOGIC (Lifted for Dashboard & Proposals View) ---

    // Outbound Applications: creator applied to brand products (has motivation/content_plan)
    // 'offered' is excluded here — if brand counter-offers, it becomes an inbound offer (brandOffers)
    const brandApplications = productApplications?.filter((p: any) =>
        (p.motivation || p.content_plan || p.status === 'draft') &&
        (p.status === 'draft' || p.status === 'offered' || p.status === 'applied' || p.status === 'pending' || p.status === 'viewed')
    ) || []

    // Brand Offers are those WITHOUT motivation (pure offers from brand, excluding drafts since brand creates them)
    const brandOffers = productApplications?.filter((p: any) => !p.motivation && !p.content_plan && p.status !== 'draft') || []

    // 2. Outbound (Applied to Campaigns + Brand Products) - Waiting
    const campaignApplications = campaignProposals?.filter((p: any) => p.type === 'campaign_apply' && (p.status === 'draft' || p.status === 'applied' || p.status === 'pending' || p.status === 'viewed')) || []

    // Combine Campaign Applications + Brand Applications
    const outboundApplications = [
        ...campaignApplications,
        ...brandApplications
    ].sort((a, b) => {
        // [NEW] draft 상태가 항상 맨 위로 오도록 정렬
        if (a.status === 'draft' && b.status !== 'draft') return -1
        if (a.status !== 'draft' && b.status === 'draft') return 1
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    })

    // 3. Active (In Progress) - Both sources (deduplicated)
    const CREATOR_ACTIVE_STATUSES = ['accepted', 'signed', 'started', 'confirmed', 'settlement', 'final_complete']
    const activeInbound = allInboundProposals.filter((p: any) => CREATOR_ACTIVE_STATUSES.includes(p.status)) || []
    const activeOutbound = campaignProposals?.filter((p: any) => CREATOR_ACTIVE_STATUSES.includes(p.status)) || []
    const allActive = deduplicateById([...activeInbound, ...activeOutbound]).sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())

    // [FIX] Inbound (Waiting for Action): pure brand offers (brand→creator) + moment proposals (brand→creator)
    // previously only took from brandOffers, missing pure momentProposals
    const inboundProposals = allInboundProposals
        .filter((p: any) => {
            // Include if it's a moment proposal OR if it's a brand proposal without creator motivation
            const isMoment = !!p.moment_id;
            const isPureBrandOffer = !p.motivation && !p.content_plan;
            const isWaitingStatus = !p.status || p.status === 'offered' || p.status === 'negotiating' || p.status === 'pending';

            // Draft 상태는 브랜드가 작성 중인 것이므로 제외
            return isWaitingStatus && p.status !== 'draft' && (isMoment || isPureBrandOffer);
        })
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())

    // New Rejected List - Both Inbound (Brand Offers) and Outbound (Campaign Apps) (deduplicated)
    const rejectedInbound = allInboundProposals.filter((p: any) => p.status === 'rejected') || []
    const rejectedOutbound = campaignProposals?.filter((p: any) => p.status === 'rejected') || []
    const rejectedProposals = deduplicateById([...rejectedInbound, ...rejectedOutbound]).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())

    // 4. Completed - Both sources (deduplicated)
    const completedInbound = allInboundProposals.filter((p: any) => p.status === 'completed') || []
    const completedOutbound = campaignProposals?.filter((p: any) => p.status === 'completed') || []
    const allCompleted = deduplicateById([...completedInbound, ...completedOutbound]).sort((a, b) => new Date(b.completed_at || b.created_at || 0).getTime() - new Date(a.completed_at || a.created_at || 0).getTime())

    // 5. All Items (Deduplicated)
    // Filter out duplicates that may appear in multiple arrays (e.g., a proposal in both inboundProposals and activeInbound)
    const allWorkspaceItemsRaw = [
        ...inboundProposals,
        ...outboundApplications,
        ...activeInbound,
        ...activeOutbound,
        ...rejectedProposals,
        ...completedInbound,
        ...completedOutbound
    ]

    // Deduplicate by ID
    const seenIds = new Set<string>()
    const allWorkspaceItemsDeduped = allWorkspaceItemsRaw
        .filter(item => {
            if (seenIds.has(item.id)) return false
            seenIds.add(item.id)
            return true
        })
        .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())

    // Apply workspace search query filter
    const applyWorkspaceSearch = (items: any[]) => {
        const q = workspaceSearchQuery.toLowerCase()
        if (!q) return items
        return items.filter(item =>
            (item.brand_name || '').toLowerCase().includes(q) ||
            (item.product_name || '').toLowerCase().includes(q) ||
            (item.campaign_title || item.title || '').toLowerCase().includes(q) ||
            (item.moment_title || item.title || '').toLowerCase().includes(q) ||
            (item.message || '').toLowerCase().includes(q)
        )
    }
    const allWorkspaceItems = applyWorkspaceSearch(allWorkspaceItemsDeduped)

    // Apply workspace favorites filter
    const applyWorkspaceFavorites = (items: any[]) => {
        if (!workspaceFavoritesOnly) return items
        return items.filter(item =>
            favorites?.some((f: any) =>
                f.target_id === item.id &&
                f.target_type === 'workspace'
            )
        )
    }

    // Filter items by type (moment/campaign/brand)
    const filterByType = (items: any[], type: 'all' | 'moment' | 'campaign' | 'brand') => {
        if (type === 'all') return items

        return items.filter(item => {
            if (type === 'moment') {
                return !!item.moment_id // 1. Moment has highest priority
            }
            if (type === 'campaign') {
                // 2. Campaign has second priority
                return (!!item.campaign_id || !!item.campaignId) && !item.moment_id
            }
            if (type === 'brand') {
                // 3. Brand is the fallback (contains brand_id but no moment/campaign id)
                // Note: brand_id exists in almost all proposals, so we check for absence of others
                return !!item.brand_id && !item.moment_id && !item.campaign_id
            }
            return false
        })
    }

    // --- SUB-TAB RENDERING HELPER ---
    const renderSubTabs = (items: any[]) => {
        const momentCount = filterByType(items, 'moment').length
        const campaignCount = filterByType(items, 'campaign').length
        const brandCount = filterByType(items, 'brand').length

        return (
            <div className="grid grid-cols-4 gap-2 mb-4 md:flex md:flex-wrap">
                <button
                    onClick={() => setWorkspaceSubTab('all')}
                    className={`w-full md:w-auto md:min-w-[90px] px-2 md:px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    전체 <span className="hidden md:inline ml-1.5 text-xs opacity-70">{items.length}</span>
                </button>
                <button
                    onClick={() => setWorkspaceSubTab('moment')}
                    className={`w-full md:w-auto md:min-w-[100px] px-2 md:px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'moment'
                        ? 'bg-slate-900 text-white'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    모먼트 <span className="hidden md:inline ml-1.5 text-xs opacity-70">{momentCount}</span>
                </button>
                {FEATURES.ENABLE_CAMPAIGNS && (
                    <button
                        onClick={() => setWorkspaceSubTab('campaign')}
                        className={`w-full md:w-auto md:min-w-[100px] px-2 md:px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'campaign'
                            ? 'bg-slate-900 text-white'
                            : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                            }`}
                    >
                        캠페인 <span className="hidden md:inline ml-1.5 text-xs opacity-70">{campaignCount}</span>
                    </button>
                )}
                <button
                    onClick={() => setWorkspaceSubTab('brand')}
                    className={`w-full md:w-auto md:min-w-[100px] px-2 md:px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'brand'
                        ? 'bg-slate-900 text-white'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    브랜드 <span className="hidden md:inline ml-1.5 text-xs opacity-70">{brandCount}</span>
                </button>
            </div>
        )
    }

    // --- WORKSPACE RENDERING HELPER ---
    const fmtRelTime = (d: string) => {
        if (!d) return ''
        const diff = Date.now() - new Date(d).getTime()
        const m = Math.floor(diff / 60000), h = Math.floor(m / 60), day = Math.floor(h / 24)
        return day > 0 ? `${day}일 전` : h > 0 ? `${h}시간 전` : m > 0 ? `${m}분 전` : '방금 전'
    }
    const getUpdaterCreator = (p: any) => {
        if (p.content_submission_status === 'submitted') return '나'
        if (p.payment_confirmed_at) return p.brand_name || '브랜드'
        if (p.delivery_status === 'shipped' || p.delivery_status === 'delivered') return p.brand_name || '브랜드'
        if (p.type === 'product_apply' || p.status === 'offered') return p.brand_name || '브랜드'
        if (p.type === 'campaign_apply' || p.status === 'applied') return '나'
        return null
    }
    const renderWorkspaceItems = (items: any[], type: string) => {
        if (items.length === 0) {
            return <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground bg-muted/10">내역이 없습니다.</div>
        }

        // TABLE VIEW
        if (workspaceViewMode === 'table') {
            return (
                <div className="rounded-md border border-border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-muted/50">
                                <TableHead className="w-[100px]">상태</TableHead>
                                <TableHead>브랜드/캠페인</TableHead>
                                <TableHead>제품</TableHead>
                                <TableHead>일정</TableHead>
                                <TableHead className="text-right">진행률</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                                    if (type === 'active' || ['accepted', 'signed', 'started', 'confirmed', 'settlement', 'final_complete'].includes(item.status)) {
                                        setChatProposal(item);
                                        setIsChatOpen(true);
                                    } else {
                                        if (item.status === 'draft' && type === 'outbound') {
                                            if (item.type === 'campaign_apply') {
                                                setEditApplicationParams({
                                                    brandId: item.brand_id,
                                                    campaignId: item.campaign_id,
                                                    existingData: item
                                                })
                                                setIsCampaignApplyOpen(true)
                                            } else {
                                                setProposalTarget({
                                                    brandName: item.brand_name || '브랜드',
                                                    targetName: item.product_name || '제품 제안',
                                                    productId: item.product_id,
                                                    brandId: item.brand_id,
                                                    productName: item.product_name,
                                                })
                                                setEditApplicationParams({ existingData: item })
                                                setIsProposalOpen(true)
                                            }
                                        } else {
                                            setSelectedProposal(item);
                                            setShowReadonlyDialog(true);
                                        }
                                    }
                                }}>
                                    <TableCell>
                                        <Badge variant="outline" className={`
                                            ${item.status === 'accepted' || item.status === 'signed' || item.status === 'started' ? 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30' :
                                                item.status === 'completed' ? 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' :
                                                    item.status === 'rejected' ? 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30' :
                                                        'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/30'}
                                        `}>
                                            {item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? '진행중' :
                                                item.status === 'settlement' ? '성과 대기' :
                                                    item.status === 'final_complete' ? '완료 대기' :
                                                        item.status === 'completed' ? '완료됨' :
                                                            item.status === 'rejected' ? '거절됨' : '대기중'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] overflow-hidden">
                                                {(item.brandAvatar || item.brand_avatar)
                                                    ? <img src={item.brandAvatar || item.brand_avatar} alt="Brand" className="h-full w-full object-cover" />
                                                    : (item.brand_name?.[0] || "B")}
                                            </div>
                                            {item.brand_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.product_name}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        <div className="flex flex-col gap-0.5">
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                            <span className="font-mono text-[9px] text-muted-foreground/50">관리번호 : #{String(item.workspace_id || item.id).replace(/-/g, '').slice(-6).toUpperCase()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline" className={`text-[10px] h-5 px-2 font-medium border-2 rounded-full transition-all bg-background
                                            ${item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                                                item.status === 'completed' ? 'text-slate-700 dark:text-slate-300 border-slate-400/50 shadow-[0_0_10px_rgba(148,163,184,0.3)]' :
                                                    item.status === 'rejected' ? 'text-red-700 dark:text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' :
                                                        'text-orange-700 dark:text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]'}
                                        `}>
                                            {item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? '진행중' : item.status === 'settlement' ? '성과 대기' : item.status === 'final_complete' ? '완료 대기' : item.status === 'completed' ? '완료' : item.status === 'rejected' ? '거절' : '수락 대기중'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <FavoriteButton targetId={String(item.id)} targetType="workspace" />
                                            {item.moment_id && (
                                                <Button size="icon" variant="ghost" className="h-7 w-7" title="제안서 보기"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedProposal(item); setShowReadonlyDialog(true); }}>
                                                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                                                </Button>
                                            )}
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )
        }

        // GRID VIEW
        if (workspaceViewMode === 'grid') {
            return (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <Card key={item.id} className={`cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 bg-card border-l-4 overflow-hidden group
                            ${type === 'all'
                                ? (item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed'
                                    ? 'border-l-emerald-500'
                                    : item.status === 'completed'
                                        ? 'border-l-slate-400'
                                        : item.status === 'rejected'
                                            ? 'border-l-red-500'
                                            : item.type === 'product_apply'
                                                ? 'border-l-blue-500'
                                                : 'border-l-purple-500')
                                : type === 'active'
                                    ? 'border-l-emerald-500'
                                    : type === 'inbound'
                                        ? 'border-l-blue-500'
                                        : type === 'outbound'
                                            ? 'border-l-purple-500'
                                            : type === 'rejected'
                                                ? 'border-l-red-500'
                                                : type === 'completed'
                                                    ? 'border-l-slate-400'
                                                    : 'border-l-emerald-500'}
                        `} onClick={() => {
                                if (type === 'active' || ['accepted', 'signed', 'started', 'confirmed', 'settlement', 'final_complete'].includes(item.status)) {
                                    setChatProposal(item);
                                    setIsChatOpen(true);
                                } else {
                                    // [NEW] draft 상태의 보낸 제안이면 수정 모달 열기
                                    if (item.status === 'draft' && type === 'outbound') {
                                        if (item.type === 'campaign_apply') {
                                            setEditApplicationParams({
                                                brandId: item.brand_id,
                                                campaignId: item.campaign_id,
                                                // existingData에 item 원본 객체 전체를 전달
                                                existingData: item
                                            })
                                            setIsCampaignApplyOpen(true)
                                        } else {
                                            // 일반 제품 지원서
                                            setProposalTarget({
                                                brandName: item.brand_name || '브랜드',
                                                targetName: item.product_name || '제품 제안',
                                                productId: item.product_id,
                                                brandId: item.brand_id,
                                                productName: item.product_name,
                                            })
                                            setEditApplicationParams({ existingData: item })
                                            setIsProposalOpen(true)
                                        }
                                    } else {
                                        // 일반 읽기 전용 뷰
                                        setSelectedProposal(item);
                                        setShowReadonlyDialog(true);
                                    }
                                }
                            }}>
                            <CardHeader className="pb-3 flex-row gap-3 items-start space-y-0">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border overflow-hidden
                                    ${item.status === 'accepted' || item.status === 'signed' ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800' :
                                        item.status === 'completed' ? 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700' :
                                            'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800'}
                                `}>
                                    {(item.brandAvatar || item.brand_avatar)
                                        ? <img src={item.brandAvatar || item.brand_avatar} alt="Brand" className="h-full w-full object-cover" />
                                        : (item.brand_name?.[0] || "W")}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold truncate text-sm">{item.brand_name}</h4>
                                    <p className="text-xs text-muted-foreground truncate">{item.product_name}</p>
                                </div>
                                <Badge variant="outline" className={`text-[10px] h-5 px-2 font-medium shrink-0 border-2 rounded-full transition-all bg-background
                                    ${item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                                        item.status === 'completed' ? 'text-slate-700 dark:text-slate-300 border-slate-400/50 shadow-[0_0_10px_rgba(148,163,184,0.3)]' :
                                            item.status === 'rejected' ? 'text-red-700 dark:text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' :
                                                'text-orange-700 dark:text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]'}
                                `}>
                                    {item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? '진행중' : item.status === 'settlement' ? '성과 대기' : item.status === 'final_complete' ? '완료 대기' : item.status === 'completed' ? '완료' : item.status === 'rejected' ? '거절' : '수락 대기중'}
                                </Badge>
                            </CardHeader>
                            <CardContent className="pb-3 text-xs space-y-2">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>계약상태</span>
                                    <span className={item.contract_status === 'signed' ? 'text-primary font-medium' : ''}>{item.contract_status || '대기중'}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>배송상태</span>
                                    <span className={item.delivery_status === 'delivered' ? 'text-primary font-medium' : ''}>{item.delivery_status || '대기중'}</span>
                                </div>
                                <div className="w-full bg-muted h-1.5 rounded-full mt-2">
                                    <div
                                        className="bg-primary h-1.5 rounded-full transition-all"
                                        style={{ width: item.contract_status === 'signed' ? (item.content_submission_status === 'submitted' ? '100%' : '66%') : '33%' }}
                                    ></div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 pb-3 text-[10px] text-muted-foreground flex justify-between items-center">
                                <div className="flex flex-col gap-0.5">
                                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    <span className="font-mono text-[9px] text-muted-foreground/40">관리번호 : #{String(item.workspace_id || item.id).replace(/-/g, '').slice(-6).toUpperCase()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FavoriteButton targetId={String(item.id)} targetType="workspace" />
                                    {item.moment_id && (
                                        <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                            onClick={(e) => { e.stopPropagation(); setSelectedProposal(item); setShowReadonlyDialog(true); }}>
                                            <FileText className="h-3 w-3 mr-1" /> 제안서
                                        </Button>
                                    )}
                                    <span className="group-hover:text-primary transition-colors">상세보기 →</span>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )
        }

        // LIST VIEW (Default - Enhanced)
        return (
            <div className="space-y-4">
                {items.map((proposal) => (
                    <Card key={proposal.id} className={`relative px-6 pt-6 pb-3.5 border-l-4 bg-card hover:bg-accent/5 cursor-pointer hover:shadow-md transition-all overflow-hidden
                        ${type === 'all'
                            ? (proposal.status === 'accepted' || proposal.status === 'signed' || proposal.status === 'started' || proposal.status === 'confirmed'
                                ? 'border-l-emerald-500'  // Active
                                : proposal.status === 'completed'
                                    ? 'border-l-slate-400'  // Completed - Gray
                                    : proposal.status === 'rejected'
                                        ? 'border-l-red-500'  // Rejected
                                        : proposal.type === 'product_apply'
                                            ? 'border-l-blue-500'  // Inbound
                                            : 'border-l-purple-500')  // Outbound
                            : type === 'active'
                                ? 'border-l-emerald-500'
                                : type === 'inbound'
                                    ? 'border-l-blue-500'
                                    : type === 'outbound'
                                        ? 'border-l-purple-500'
                                        : type === 'rejected'
                                            ? 'border-l-red-500'
                                            : type === 'completed'
                                                ? 'border-l-slate-400'
                                                : 'border-l-emerald-500'}
                    `} onClick={() => {
                            if (type === 'active' || ['accepted', 'signed', 'started', 'confirmed', 'settlement', 'final_complete'].includes(proposal.status)) {
                                setChatProposal(proposal);
                                setIsChatOpen(true);
                            } else {
                                // [NEW] draft 상태의 보낸 제안이면 수정 모달 열기
                                if (proposal.status === 'draft' && type === 'outbound') {
                                    if (proposal.type === 'campaign_apply') {
                                        setEditApplicationParams({
                                            brandId: proposal.brand_id,
                                            campaignId: proposal.campaign_id,
                                            // existingData에 proposal 원본 객체 전체를 전달
                                            existingData: proposal
                                        })
                                        setIsCampaignApplyOpen(true)
                                    } else {
                                        // 일반 제품 지원서
                                        setProposalTarget({
                                            brandName: proposal.brand_name || '브랜드',
                                            targetName: proposal.product_name || '제품 제안',
                                            productId: proposal.product_id,
                                            brandId: proposal.brand_id,
                                            productName: proposal.product_name,
                                        })
                                        setEditApplicationParams({ existingData: proposal })
                                        setIsProposalOpen(true)
                                    }
                                } else {
                                    // 일반 읽기 전용 뷰
                                    setSelectedProposal(proposal);
                                    setShowReadonlyDialog(true);
                                }
                            }
                        }}>
                        {/* 모바일: 우상단 즐겨찾기 버튼 */}
                        <div className="absolute top-3 right-3 sm:hidden">
                            <FavoriteButton targetId={String(proposal.id)} targetType="workspace" />
                        </div>
                        <div className="flex flex-row items-start gap-4 md:gap-6">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted/50 border border-border overflow-hidden">
                                {(proposal.brandAvatar || proposal.brand_avatar)
                                    ? <img src={proposal.brandAvatar || proposal.brand_avatar} alt="Brand" className="h-full w-full object-cover" />
                                    : <span className="font-bold text-lg text-muted-foreground">{proposal.brand_name?.[0] || "W"}</span>}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-base md:text-xl flex items-center gap-2 text-foreground">
                                            {proposal.product_name || proposal.brand_name}
                                            <Badge variant="outline" className={`text-xs font-medium border-2 rounded-full px-3 py-0.5 transition-all bg-background
                                                ${proposal.status === 'accepted' || proposal.status === 'signed' || proposal.status === 'started' || proposal.status === 'confirmed' ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]' :
                                                    proposal.status === 'completed' ? 'text-slate-700 dark:text-slate-300 border-slate-400/50 shadow-[0_0_12px_rgba(148,163,184,0.3)]' :
                                                        proposal.status === 'rejected' ? 'text-red-700 dark:text-red-400 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.3)]' :
                                                            'text-orange-700 dark:text-orange-400 border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.3)]'}
                                            hidden md:inline-flex`}>
                                                {proposal.status === 'accepted' || proposal.status === 'signed' || proposal.status === 'started' || proposal.status === 'confirmed' ? '진행중' :
                                                    proposal.status === 'settlement' ? '성과 대기' :
                                                        proposal.status === 'final_complete' ? '완료 대기' :
                                                            proposal.status === 'completed' ? '완료됨' :
                                                                proposal.status === 'rejected' ? '거절됨' :
                                                                    '수락 대기중'}
                                            </Badge>
                                        </h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span>{proposal.brand_name}</span>
                                            <span className="font-mono text-[9px] text-muted-foreground/40 bg-muted/50 px-1.5 py-0.5 rounded">관리번호 : #{String(proposal.workspace_id || proposal.id).replace(/-/g, '').slice(-6).toUpperCase()}</span>
                                            {proposal.moment_id && proposal.moment_title && (
                                                <span className="text-purple-600 dark:text-purple-400">
                                                    → {proposal.moment_title}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FavoriteButton targetId={String(proposal.id)} targetType="workspace" className="hidden sm:flex" />
                                        {/* 제안서 보기 button for moment proposals */}
                                        {proposal.moment_id && (
                                            <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hidden md:flex" onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProposal(proposal);
                                                setShowReadonlyDialog(true);
                                            }}>
                                                <FileText className="mr-1 h-3 w-3" /> 제안서
                                            </Button>
                                        )}
                                        {/* Contextual Actions based on type/status */}
                                        {type === 'active' && (
                                            <Button size="sm" variant="outline" className="border-border hidden md:flex" onClick={(e) => {
                                                e.stopPropagation();
                                                const pId = proposal.product_id;
                                                if (pId) fetchProductGuide(pId);
                                                else {
                                                    setGuideProduct({ name: proposal.product_name, image_url: proposal.product?.image_url });
                                                    setIsProductGuideOpen(true);
                                                }
                                            }}>
                                                가이드 보기
                                            </Button>
                                        )}
                                        {/* 🆕 성과 제출 버튼 — settlement 단계 전용 */}
                                        {proposal.status === 'settlement' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 font-semibold gap-1.5 hidden md:flex"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setPerfSubmitProposal(proposal)
                                                    setPerfSubmitOpen(true)
                                                }}
                                            >
                                                📊 성과 제출
                                            </Button>
                                        )}
                                        <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Progress bar — full-width below on mobile, indented on desktop */}
                        <div className="mt-4 md:pl-[88px] flex items-center gap-4">
                            <div className="flex-1">
                                <WorkspaceProgressBar
                                    proposal={proposal}
                                />
                            </div>

                            {/* Accept/Reject Buttons - Only show for inbound offers (brand→creator), not outbound (creator→brand) */}
                            {proposal.status === 'offered' && proposal.type !== 'campaign_apply' && type !== 'outbound' && (
                                <div className="flex gap-2 shrink-0">
                                    <Button
                                        size="sm"
                                        onClick={(e) => handleAcceptProposal(e, proposal.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        수락하기
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => handleRejectClick(chatProposal)}
                                    >
                                        거절하기
                                    </Button>
                                </div>
                            )}

                            {/* G3: 크리에이터가 보낸 지원서 수정 (outbound + pending/applied) */}
                            {type === 'outbound' && (proposal.status === 'applied' || proposal.status === 'pending' || !proposal.status) && (
                                <div className="shrink-0">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                                        onClick={(e) => { e.stopPropagation(); handleOpenEditApplication(proposal); }}
                                    >
                                        <Pencil className="mr-1 h-3 w-3" /> 수정
                                    </Button>
                                </div>
                            )}
                        </div>
                        {/* 최근 업데이트 */}
                        <div className="flex justify-end mt-1.5 md:pl-[88px]">
                            <span className="text-[10px] text-muted-foreground/50">
                                최근 업데이트 : {fmtRelTime(proposal.updated_at || proposal.created_at)}{getUpdaterCreator(proposal) ? ` (${getUpdaterCreator(proposal)})` : ''}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>
        )
    }
    // ----------------------------------------------------------------

    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
    const sigCanvas = useRef<any>(null)

    // Triggered when user clicks "Agree & Sign"
    const handleStartSigning = () => {
        setIsSignatureModalOpen(true)
    }

    const processContractResponse = async (status: 'signed' | 'negotiating' | 'rejected', signatureData?: string) => {
        try {
            const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'campaign_apply';
            const proposalId = chatProposal.id?.toString();
            const brandId = isCampaignProposal ? chatProposal.campaign?.brand_id : chatProposal.brand_id;

            // Use getUpdateFunction helper concept or direct check
            if (isCampaignProposal) {
                // For Creator Apply -> proposals table
                // Use the updateProposal function from usePlatform context which is now Promise<boolean> and writes to DB
                // Only include signature if provided (and status is signed)
                const updateData: any = { contract_status: status }
                if (signatureData) {
                    updateData.creator_signature = signatureData
                    updateData.creator_signed_at = new Date().toISOString()
                }

                await updateProposal(proposalId, updateData)
            } else {
                // For Brand Offer -> brand_proposals table
                const updateData: any = { contract_status: status }
                if (signatureData) {
                    updateData.creator_signature = signatureData
                    updateData.creator_signed_at = new Date().toISOString()
                }

                await updateProductApplication(proposalId, updateData)
            }

            // Local update
            setChatProposal((prev: any) => ({ ...prev, contract_status: status, creator_signature: signatureData }))

            // Notify brand
            const msg = status === 'signed' ? "✅ 계약서에 서명했습니다! 콘텐츠 제작을 시작하겠습니다." :
                status === 'negotiating' ? "📝 계약서 내용 수정을 요청했습니다. 확인 부탁드립니다." :
                    "❌ 계약 제안을 거절했습니다."

            // Send message with correct IDs
            const targetBrandId = brandId || chatProposal?.campaign?.brand_id;
            await sendMessage(targetBrandId, msg, undefined, chatProposal.workspace_id?.toString())

            // 🔔 브랜드에게 계약 관련 알림 발송
            if (targetBrandId) {
                try {
                    const notifContent = status === 'signed'
                        ? `${displayUser?.name}님이 계약서에 서명했습니다. 협업을 시작하세요!`
                        : status === 'negotiating'
                            ? `${displayUser?.name}님이 계약서 내용 수정을 요청했습니다.`
                            : `${displayUser?.name}님이 계약 제안을 거절했습니다.`
                    const notifType = status === 'signed' ? 'contract_signed'
                        : status === 'negotiating' ? 'contract_negotiating'
                            : 'contract_rejected'
                    await sendNotification(targetBrandId, notifContent, notifType, chatProposal?.workspace_id?.toString() || proposalId)
                } catch (notifErr) {
                    console.warn('알림 발송 실패 (무시):', notifErr)
                }
            }

            toast.success("상태가 업데이트되었습니다.")
        } catch (e) {
            console.error("Contract update failed:", e)
            toast.error("오류가 발생했습니다.")
        }
    }

    const performContractSign = () => {
        if (!chatProposal) return
        if (sigCanvas.current.isEmpty()) {
            toast.error("서명을 입력해주세요.")
            return
        }

        setConfirmDialog({
            open: true,
            title: "서명 확인",
            description: "서명과 함께 계약서에 동의하시겠습니까?",
            onConfirm: async () => {
                const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
                await processContractResponse('signed', signatureData)
                setIsSignatureModalOpen(false)
            }
        })
    }

    const handleContractResponse = async (status: 'signed' | 'negotiating' | 'rejected', signatureData?: string) => {
        if (!chatProposal) return

        const message = status === 'signed' ? "계약서에 서명하시겠습니까?" : status === 'negotiating' ? "수정 요청을 보내시겠습니까?" : "거절하시겠습니까?"

        setConfirmDialog({
            open: true,
            title: "확인",
            description: message,
            onConfirm: async () => {
                await processContractResponse(status, signatureData)
            }
        })
    }

    const handleProductReceived = async (e?: React.MouseEvent) => {
        e?.preventDefault()
        e?.stopPropagation()
        if (!chatProposal) return

        setConfirmDialog({
            open: true,
            title: "제품 수령 확인",
            description: "제품을 수령하셨습니까? 수령 처리 후에는 취소할 수 없습니다.",
            onConfirm: async () => {
                try {
                    const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'campaign_apply'
                    const proposalId = chatProposal.id?.toString()
                    const brandId = isCampaignProposal ? chatProposal.campaign?.brand_id : chatProposal.brand_id

                    const updateData: any = {
                        delivery_status: 'delivered'
                    }

                    if (isCampaignProposal) {
                        await updateProposal(proposalId, updateData)
                    } else {
                        await updateProductApplication(proposalId, updateData)
                    }

                    await sendMessage(brandId, "📦 [자동 알림] 크리에이터가 제품 수령을 완료했습니다.", undefined, chatProposal.workspace_id?.toString())

                    toast.success("제품 수령이 확인되었습니다. 이제 작업물을 제출할 수 있습니다.")
                } catch (e) {
                    console.error("Product update failed:", e)
                    toast.error("오류가 발생했습니다.")
                }
            }
        })
    }

    const handleSaveShippingInfo = async () => {
        if (!shippingName || !shippingPhone || !shippingAddress) {
            toast.error("모든 배송 정보를 입력해주세요.")
            return
        }
        if (!chatProposal) return

        setIsSavingShipping(true)
        try {
            const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'campaign_apply'
            const proposalId = chatProposal.id?.toString()
            const brandId = isCampaignProposal ? chatProposal.campaign?.brand_id : chatProposal.brand_id

            const updateData = {
                receiver_name: shippingName,
                shipping_phone: shippingPhone,
                shipping_address: shippingAddress,
                delivery_status: 'pending' // Ready to ship
            }

            if (isCampaignProposal) {
                await updateProposal(proposalId, updateData)
            } else {
                await updateProductApplication(proposalId, updateData)
            }

            setChatProposal((prev: any) => ({ ...prev, ...updateData }))

            // Notify Brand
            await sendMessage(brandId, "🚚 배송지 정보를 입력했습니다. 제품 발송 부탁드립니다!", undefined, chatProposal.workspace_id?.toString())

            toast.success("배송지 정보가 저장되었습니다.")
        } catch (e) {
            console.error("Shipping info save failed:", e)
            toast.error("저장 중 오류가 발생했습니다.")
        } finally {
            setIsSavingShipping(false)
        }
    }

    // Profile Edit States - REMOVED (Moved to SettingsView)

    // Apply Modal States

    const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
    const [selectedBrandProduct, setSelectedBrandProduct] = useState<any>(null) // New state for Brand Detail View
    const [appealMessage, setAppealMessage] = useState("")
    const [desiredCost, setDesiredCost] = useState("")

    // 쳪페인 지원자 수 (campaign_id -> count)
    const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({})

    useEffect(() => {
        if (!campaigns || campaigns.length === 0) return
        const ids = campaigns.map((c: any) => c.id).filter(Boolean)
        if (ids.length === 0) return
        supabase
            .from('campaign_applications')
            .select('campaign_id')
            .in('campaign_id', ids)
            .then(({ data }) => {
                if (!data) return
                const counts: Record<string, number> = {}
                data.forEach((row: any) => {
                    counts[row.campaign_id] = (counts[row.campaign_id] || 0) + 1
                })
                setApplicantCounts(counts)
            })
    }, [campaigns])




    // Shipping States
    const [shippingName, setShippingName] = useState("")
    const [shippingPhone, setShippingPhone] = useState("")
    const [shippingAddress, setShippingAddress] = useState("")
    const [shippingZip, setShippingZip] = useState("")
    const [isSavingShipping, setIsSavingShipping] = useState(false)
    const [activeProposalTab, setActiveProposalTab] = useState("chat") // Controlled tab state for Proposal Dialog

    // 프로포절 다이얼로그 열릴 때 기존 배송지 정보 자동 채우기
    useEffect(() => {
        if (chatProposal) {
            setShippingName((chatProposal as any).receiver_name || "")
            setShippingPhone((chatProposal as any).shipping_phone || "")
            setShippingAddress((chatProposal as any).shipping_address || "")
        }
    }, [(chatProposal as any)?.id])


    // Content Submission States

    const [feedbackInput, setFeedbackInput] = useState("")
    const [isSendingFeedback, setIsSendingFeedback] = useState(false)

    // Load feedback when chat proposal changes
    useEffect(() => {
        if (!chatProposal) return

        const loadFeedback = async () => {
            if (chatProposal.workspace_id) {
                await fetchSubmissionFeedback(chatProposal.workspace_id.toString())
            }
        }
        loadFeedback()
    }, [chatProposal, fetchSubmissionFeedback])



    const handleContentSubmission = async () => {
        if (!chatProposal) {
            console.error('[CreatorUpload] No chatProposal found')
            return
        }
        const fileToUpload = submissionFile

        if (!submissionUrl && !fileToUpload) {
            toast.error("링크 또는 파일을 입력해주세요.")
            return
        }

        setIsSubmittingContent(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'campaign_apply'
            const proposalId = chatProposal.id?.toString()
            const brandId = isCampaignProposal ? chatProposal.campaign?.brand_id : chatProposal.brand_id

            let fileUrl = ""

            // Actual File Upload using XHR for progress tracking
            if (fileToUpload) {
                const fileExt = fileToUpload.name.split('.').pop()
                const fileName = `${proposalId}_v${Date.now()}.${fileExt}`
                const filePath = `submissions/${fileName}`


                fileUrl = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest()
                    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/submissions/${filePath}`

                    xhr.upload.addEventListener('progress', (event) => {
                        if (event.lengthComputable) {
                            const progress = Math.round((event.loaded / event.total) * 100)
                            setUploadProgress(progress)
                        }
                    })

                    xhr.addEventListener('load', () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            const { data: { publicUrl } } = supabase.storage
                                .from('submissions')
                                .getPublicUrl(filePath)
                            resolve(publicUrl)
                        } else {
                            reject(new Error(`업로드 실패 (HTTP ${xhr.status})`))
                        }
                    })

                    xhr.addEventListener('error', () => reject(new Error('네트워크 오류로 업로드에 실패했습니다.')))
                    xhr.addEventListener('abort', () => reject(new Error('업로드가 취소되었습니다.')))

                    xhr.open('POST', url)
                    xhr.setRequestHeader('Authorization', `Bearer ${session?.access_token}`)
                    xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

                    xhr.send(fileToUpload)
                })

            }

            const currentVersion = chatProposal.content_submission_version || 0.9
            const nextVersion = parseFloat((currentVersion + 0.1).toFixed(1))

            const updateData: any = {
                content_submission_url: submissionUrl || (fileToUpload ? "" : chatProposal.content_submission_url),
                content_submission_file_url: fileUrl || (submissionUrl ? "" : chatProposal.content_submission_file_url),
                content_submission_status: 'submitted',
                content_submission_date: new Date().toISOString(),
                content_submission_version: nextVersion
            }

            if (isCampaignProposal) {
                await updateProposal(proposalId, updateData)
            } else {
                await updateProductApplication(proposalId, updateData)
            }

            setChatProposal((prev: any) => ({ ...prev, ...updateData }))

            // Send automatic notification in feedback chat
            const notificationContent = isReuploading
                ? `🔄 작업물이 v${nextVersion} 버전으로 업데이트되었습니다. (이전 파일은 자동 삭제 처리됨)`
                : `✅ 새로운 작업물(v${nextVersion})이 제출되었습니다.`

            await sendSubmissionFeedback(
                chatProposal.workspace_id?.toString(),
                notificationContent
            )

            // Also send global message for brand visibility
            await sendMessage(brandId, notificationContent, undefined, chatProposal.workspace_id?.toString())

            // 🔔 Send notification to brand
            const targetBrandId = brandId || chatProposal?.campaign?.brand_id;
            if (targetBrandId) {
                await sendNotification(
                    targetBrandId,
                    `${displayUser?.name}님이 콘텐츠를 제출했습니다.`,
                    'content_submission',
                    chatProposal?.workspace_id?.toString() || proposalId
                )
            }

            // Refresh feedback list
            if (chatProposal.workspace_id) {
                await fetchSubmissionFeedback(chatProposal.workspace_id.toString())
            }

            toast.success(`작업물(v${nextVersion})이 제출되었습니다.`)
            setSubmissionUrl("")
            setSubmissionFile(null)
            setIsReuploading(false)
        } catch (e) {
            console.error("Submission failed:", e)
            toast.error("제출 중 오류가 발생했습니다.")
        } finally {
            setIsSubmittingContent(false)
            setUploadProgress(0)
        }
    }

    const handleSendFeedback = async () => {
        if (!chatProposal || !feedbackInput.trim() || isSendingFeedback) return

        setIsSendingFeedback(true)
        try {
            await sendSubmissionFeedback(
                chatProposal.workspace_id?.toString(),
                feedbackInput.trim()
            )
            // [FIX] sendSubmissionFeedback returns void, no truthiness check needed
            setFeedbackInput("")
            if (chatProposal.workspace_id) {
                await fetchSubmissionFeedback(chatProposal.workspace_id.toString())
            }
        } catch (e) {
            console.error("Failed to send feedback:", e)
        } finally {
            setIsSendingFeedback(false)
        }
    }

    // Chat states
    // Chat states moved to top

    const handleGenerateContract = async () => {
        if (!chatProposal || !user) return

        setIsGeneratingContract(true)
        try {
            const proposalId = chatProposal.id?.toString()
            const creatorMessages = messages.filter((m: any) => m.proposalId === chatProposal.id?.toString() || m.productApplicationId === chatProposal.id?.toString())

            const response = await fetch('/api/generate-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: creatorMessages,
                    proposal: chatProposal,
                    brandName: chatProposal.brand_name || "브랜드",
                    creatorName: displayUser?.name || "크리에이터"
                })
            })

            const data = await response.json()
            if (data.result) {
                setGeneratedContract(data.result)
            } else {
                toast.error("계약서 생성에 실패했습니다: " + (data.error || "알 수 없는 오류"))
            }
        } catch (e) {
            console.error(e)
            toast.error("계약서 생성 중 오류가 발생했습니다.")
        } finally {
            setIsGeneratingContract(false)
        }
    }

    const [productSearchQuery, setProductSearchQuery] = useState("")
    const [isFullContractOpen, setIsFullContractOpen] = useState(false)
    const [isSendingMessage, setIsSendingMessage] = useState(false)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    const filteredProducts = products?.filter(p => {
        const matchesQuery =
            p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
            p.brandName?.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(productSearchQuery.toLowerCase())

        if (favoritesOnly) {
            return matchesQuery && favorites.some(f => f.target_id === p.id && f.target_type === 'product')
        }
        return matchesQuery
    }) || []


    // ... existing state ...


    // ... existing useEffects ...

    // Notification Navigation Logic
    useEffect(() => {
        const proposalId = searchParams.get('proposalId')
        if (proposalId && !isLoading && isInitialized) {
            // Check Inbound (Brand Proposals) first
            const inbound = productApplications.find(p => p.id === proposalId)
            if (inbound) {
                setCurrentView('inbound_list')
                setChatProposal((prev: any) => prev?.id === inbound.id ? prev : inbound)
                setIsChatOpen(true)
                return
            }

            // Check Outbound (Campaign Applications)
            const outbound = campaignProposals.find(p => p.id === proposalId)
            if (outbound) {
                setCurrentView('campaigns_list')
                // For campaign applications, we might need a different view state or just open chat if supported
                // Currently campaigns_list opens details. Let's try to open the chat associated with it if possible.
                // Or just highlight it. For now, swiching view is good.
                // If we have a way to open chat for outbound:
                // setChatProposal(outbound) // This depends on if chatProposal supports outbound types
            }
        }
    }, [searchParams, isLoading, isInitialized, productApplications, campaignProposals])


    // ... inside renderContent case 'moments_list' ...
    {/* Combined/Upcoming Moments */ }
    <TabsContent value="combined" className="mt-0 space-y-4">
        {activeMoments.length === 0 && myMoments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-border/50">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">진행 중인 일정이 없어요</h3>
                <p className="text-muted-foreground/70 text-sm mb-6">나의 모먼트를 등록하고 협업 제안을 받아보세요!</p>
                <Button asChild>
                    <Link href="/creator/new"><Plus className="mr-2 h-4 w-4" />첫 모먼트 등록하기</Link>
                </Button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...activeMoments, ...myMoments].map(moment => (
                    <MomentCard
                        key={moment.id}
                        moment={moment}
                        productApplications={productApplications}
                        onClick={(moment) => router.push(`/moment/${moment.id}`)}
                    />
                ))}
            </div>
        )}
    </TabsContent>

    // Sync Profile Data to Edit Form - REMOVED (Moved to SettingsView)

    // Onboarding Check: Automatically show settings if crucial info is missing
    useEffect(() => {
        if (user && !isLoading && user.role === 'creator') {
            // Only force settings if name is truly missing (handle is managed separately in social channels)
            const isMissingInfo = !user.name
            if (isMissingInfo && currentView !== 'settings' && initialView !== 'settings' && currentView !== 'profile') {
                setCurrentView("settings")
            }
        }
    }, [user, isLoading, currentView, initialView])

    // Sync currentView with URL changes (e.g., when clicking "View Profile" from header)
    useEffect(() => {
        const view = searchParams.get('view')
        if (view && view !== currentView) {
            setCurrentView(view)
        }
    }, [searchParams])

    // Handle Deep Linking to Workspace/Proposals
    useEffect(() => {
        const view = searchParams.get('view')
        const proposalId = searchParams.get('proposalId')

        if (view === 'proposals' && proposalId) {
            // Force tab to 'all' as requested ("Workspace Entire View")
            setWorkspaceTab("all")

            // Find and open the proposal
            // We search in both productApplications (offers) and proposals (applications)
            const targetId = proposalId.toString()
            const found = productApplications.find((p: any) => p.id?.toString() === targetId)
                || campaignProposals.find((p: any) => p.id?.toString() === targetId)

            if (found) {
                setChatProposal((prev: any) => prev?.id === found.id ? prev : found)
                setIsChatOpen(true)
            }
        }
    }, [searchParams, productApplications, campaignProposals])

    // Auth Check & Redirect
    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/')
        } else if (user && user.role === 'brand' && user.id !== 'guest_creator') {
            router.push('/brand')
        }
    }, [isAuthLoading, user, router])

    // Get unified provider data
    const {
        isLoading: isDataLoading,
        loadingStates,
        refreshData: refreshAllData
    } = useUnifiedProvider()

    // Show content immediately, monitor loading in corner
    // if (!user) return null // Allow guest view



    // handleSaveProfile - REMOVED (Moved to SettingsView)


    const handleStatusUpdate = async (proposalId: string, status: string) => {
        if (isUpdatingStatus) return
        setIsUpdatingStatus(true)

        try {
            const success = await updateProductApplication(proposalId, { status })
            if (!success) {
                setIsUpdatingStatus(false)
                return
            }

            // Immediately update local UI state (chatProposal)
            if (chatProposal && chatProposal.id === proposalId) {
                setChatProposal((prev: any) => prev ? { ...prev, status } : prev)
            }

            const newStatus = status; // Renamed for clarity
            if (newStatus === 'accepted' || newStatus === 'pending') {
                setIsChatOpen(true)

                // Try to find the proposal to get brand_id for messaging
                const proposal = productApplications.find((p: any) => p.id === proposalId)
                    || (chatProposal?.id === proposalId ? chatProposal : null)

                if (proposal) {
                    if (!chatProposal) {
                        setChatProposal({ ...proposal, status })
                    }

                    // Send notification/message to brand
                    if (newStatus === 'accepted') {
                        // Pass proposal.id as 4th argument (productApplicationId)
                        const targetBrandId = proposal.brand_id || proposal.brandId || proposal.campaign?.brand_id;
                        await sendMessage(targetBrandId, `✅ [시스템 알림] 크리에이터가 협업 제안을 수락했습니다! 대화를 시작해보세요.`, undefined, proposal.workspace_id?.toString())

                        // 🔔 브랜드에게 제안 수락 알림
                        try {
                            const creatorName = (displayUser as any)?.display_name || displayUser?.name || '크리에이터'
                            if (targetBrandId) {
                                await sendNotification(
                                    targetBrandId,
                                    `${creatorName}님이 '${proposal.product_name || '협업 제안'}'을 수락했습니다! 지금 대화를 시작해보세요.`,
                                    'proposal_accepted',
                                    proposal.workspace_id?.toString() || proposal.id.toString()
                                )
                            }
                        } catch (notifErr) {
                            console.warn('알림 발송 실패 (무시):', notifErr)
                        }

                        // Force refresh so the list updates (moving from inbound to active)
                        await refreshData()

                        // Auto-switch to Active Tab & Workstation View
                        setWorkspaceTab('active')
                        setCurrentView('proposals')

                        // Auto-send Rate Card
                        if (displayUser) {
                            const rateCardData = {
                                priceVideo: displayUser.priceVideo,
                                priceFeed: displayUser.priceFeed,
                                usageRightsPrice: displayUser.usageRightsPrice,
                                usageRightsMonth: displayUser.usageRightsMonth,
                                autoDmPrice: displayUser.autoDmPrice,
                                autoDmMonth: displayUser.autoDmMonth
                            };
                            const rateCardMsg = `[RATE_CARD_JSON]${JSON.stringify(rateCardData)}`;

                            // Send rate card slightly after the system message
                            setTimeout(async () => {
                                const brandName = proposal.brand_name || '브랜드';
                                const greetingMsg = `안녕하세요 '${brandName}'님. 좋은 협업 제안 요청주셔서 감사합니다.\n아래에 저의 예상단가를 보내드립니다.`;
                                try {
                                    await sendMessage(proposal.brand_id, greetingMsg, undefined, proposal.workspace_id?.toString());
                                    await sendMessage(proposal.brand_id, rateCardMsg, undefined, proposal.workspace_id?.toString())
                                } catch (e) {
                                    console.error("Failed to auto-send rate card:", e);
                                }
                            }, 500)
                        }

                        toast.success("제안을 수락했습니다. 이제 워크스페이스에서 브랜드와 대화할 수 있습니다.")
                    } else if (newStatus === 'pending') {
                        await sendMessage(proposal.brand_id, `⏳ [시스템 알림] 크리에이터가 제안을 확인했으며, 현재 검토(보류) 중입니다.`, undefined, proposal.workspace_id?.toString())
                        toast.success("제안을 보류 처리했습니다. 나중에 다시 수락할 수 있습니다.")
                    }
                }
            } else if (newStatus === 'rejected') {
                // This case is handled by separate function usually but kept for completeness
            } else {
                toast.success("상태가 업데이트되었습니다.")
            }

            refreshData()
        } catch (e) {
            console.error(e)
            toast.error("업데이트 중 오류가 발생했습니다. 다시 시도해주세요.")
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const handleRejectClick = (proposal: any) => {
        setConfirmDialog({
            open: true,
            title: "정말 이 제안을 거절하시겠습니까?",
            description: "거절 시 해당 브랜드에게 자동으로 정중한 거절 메시지가 발송되며, 제안 상태가 '거절됨'으로 변경됩니다.",
            onConfirm: async () => {
                try {
                    // Update status to rejected
                    await updateProductApplication(proposal.id, { status: 'rejected' })

                    // UI Update
                    setChatProposal((prev: any) => prev ? { ...prev, status: 'rejected' } : prev)

                    // Send polite rejection message
                    const targetBrandId = proposal.brand_id || proposal.brandId || proposal.campaign?.brand_id;
                    await sendMessage(targetBrandId, `안녕하세요 ${proposal.brand_name}님, 제안 주셔서 감사합니다.\n아쉽게도 현재 제 일정 및 상황상 참여가 어려울 것 같습니다. 😢\n다음에 더 좋은 기회로 뵙기를 희망합니다!`, undefined, proposal.workspace_id?.toString())

                    // 🔔 브랜드에게 거절 알림
                    try {
                        const creatorName = (displayUser as any)?.display_name || displayUser?.name || '크리에이터'
                        if (targetBrandId) {
                            await sendNotification(
                                targetBrandId,
                                `${creatorName}님이 '${proposal.product_name || '제안'}'을 거절했습니다.`,
                                'proposal_rejected',
                                proposal.workspace_id?.toString() || proposal.id.toString()
                            )
                        }
                    } catch (notifErr) {
                        console.warn('알림 발송 실패 (무시):', notifErr)
                    }

                    // Force refresh so the list updates (moving to rejected)
                    await refreshData()

                    toast.success('제안을 거절했습니다.')
                } catch (e) {
                    console.error("Rejection error:", e)
                    toast.error("처리 중 오류가 발생했습니다.")
                }
            },
            variant: "destructive"
        })
    }

    // G3: Edit outbound (creator→brand) application
    // State declarations moved to top level to avoid duplicate block-scope variables

    const handleOpenEditApplication = (proposal: any) => {
        setEditingApplication(proposal)
        setEditAppealMessage(proposal.motivation || proposal.content_plan || '')
        setEditDesiredCost(proposal.desired_cost?.toString() || proposal.cost?.toString() || '')
    }

    const handleSaveEditApplication = async () => {
        if (!editingApplication) return
        setIsSavingApplication(true)
        try {
            const isCampaign = !!editingApplication.campaignId || !!editingApplication.campaign_id || editingApplication.type === 'campaign_apply'
            if (isCampaign) {
                const success = await updateProposal(editingApplication.id, {
                    motivation: editAppealMessage,
                    desired_cost: editDesiredCost ? parseInt(editDesiredCost) : undefined,
                } as any)
                if (!success) throw new Error('업데이트 실패')
            } else {
                const { error } = await supabase
                    .from('product_applications')
                    .update({ content_plan: editAppealMessage })
                    .eq('id', editingApplication.id)
                if (error) throw error
            }

            // 🔔 브랜드에게 지원서 수정 알림
            try {
                const creatorName = (displayUser as any)?.display_name || displayUser?.name || '크리에이터'
                const brandId = editingApplication.brand_id || editingApplication.campaign?.brand_id
                if (brandId) {
                    await sendNotification(
                        brandId,
                        `${creatorName}님이 지원서를 수정했습니다. 변경 내용을 확인해보세요.`,
                        'application_updated',
                        editingApplication.id
                    )
                }
            } catch (notifErr) {
                console.warn('알림 발송 실패 (무시):', notifErr)
            }

            toast.success('지원서가 수정되었습니다.')
            setEditingApplication(null)
            await refreshData()
        } catch (err: any) {
            toast.error(err.message || '지원서 수정에 실패했습니다.')
        } finally {
            setIsSavingApplication(false)
        }
    }

    const renderProposalCard = (proposalId: string) => {
        const proposal = productApplications?.find(p => p.id === proposalId)
        if (!proposal) return null

        return (
            <Card className="mt-2 border-primary/20 bg-primary/5 p-4 space-y-3 max-w-sm shadow-sm group hover:border-primary/40 transition-all text-foreground">
                <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">COLLABORATION PROPOSAL</span>
                    <BadgeCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <h4 className="font-bold text-sm">{proposal.product_name}</h4>
                    <p className="text-[11px] text-muted-foreground">{proposal.product_type === 'gift' ? '제품 협찬' : '제품 대여'}</p>
                </div>

                {/* Product Card Preview (New) */}
                {proposal.product && (
                    <div className="flex gap-3 bg-white border border-border/50 p-2 rounded-lg">
                        {/* Use product.image_url from DB relation */}
                        {proposal.product.image_url ? (
                            <img src={proposal.product.image_url} alt={proposal.product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-slate-300">
                                <Package className="h-5 w-5" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="text-xs font-bold truncate">{proposal.product.name}</div>
                            <div className="text-[10px] text-muted-foreground">{proposal.product.price}</div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/50 p-2 rounded">
                    <div>
                        <p className="text-muted-foreground">제시 원고료</p>
                        <p className="font-bold text-emerald-600 font-mono">{proposal.price_offer ? `${proposal.price_offer.toLocaleString()}원` : '미정'}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">희망 채널</p>
                        <p className="font-medium">{proposal.channel_name || '미정'}</p>
                    </div>
                </div>

                {/* Message */}
                <div className="bg-white/80 p-2 rounded text-[11px] text-muted-foreground italic line-clamp-2">
                    "{proposal.message}"
                </div>

                {/* Product Link (New) */}
                {(proposal.product_url || proposal.product?.url) && (
                    <a
                        href={proposal.product_url || proposal.product?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                    >
                        <Button variant="outline" size="sm" className="w-full text-[10px] h-7 gap-1 border-blue-200 text-blue-600 hover:bg-blue-50">
                            <ExternalLink className="h-3 w-3" /> 제품 정보 보기
                        </Button>
                    </a>
                )}

                <Button variant="outline" size="sm" className="w-full text-[10px] h-7 font-bold border-primary/30 text-primary hover:bg-primary/10">
                    상태: {proposal.status === 'accepted' ? '수락됨' : '제안됨'}
                </Button>
            </Card>
        )
    }

    const handleSendMessage = async () => {
        if (!chatMessage.trim() || !chatProposal || isSendingMessage) return
        const receiverId = chatProposal.brand_id || chatProposal.brandId || chatProposal.toId || chatProposal.to_id || chatProposal.brand?.id || chatProposal.campaign?.brand_id
        if (!receiverId) {
            console.error("[handleSendMessage] No receiver ID found in chatProposal:", chatProposal)
            toast.error("수신인 정보를 찾을 수 없습니다.")
            return
        }

        const msgContent = chatMessage
        setChatMessage("")
        setIsSendingMessage(true)

        try {
            // Determine if it's a Campaign Application (proposals table) or Direct Offer (brand_proposals table)
            const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'campaign_apply'

            // sendMessage signature: (receiverId, content, file?, workspaceId?, projectName?)
            await sendMessage(receiverId, msgContent, undefined, chatProposal.workspace_id?.toString())
        } catch (e) {
            console.error("Message send failed:", e)
            setChatMessage(msgContent)
        } finally {
            setIsSendingMessage(false)
        }
    }

    const filteredProposals = (status: string) => {
        if (!displayUser) return []
        if (status === 'new') return productApplications?.filter(p => (!p.status || p.status === 'offered') && p.creator_id === displayUser.id)
        if (status === 'applied') return productApplications?.filter(p => p.status === 'applied' && p.creator_id === displayUser.id)
        return productApplications?.filter(p => p.status === status && p.creator_id === displayUser.id)
    }






    const renderContent = () => {
        switch (currentView) {
            case "profile":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold tracking-tight">내 프로필 미리보기</h1>
                            <Button onClick={() => setCurrentView('settings')}>편집하기</Button>
                        </div>

                        <Card className="overflow-hidden">
                            <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                            <CardContent className="relative pt-12 pb-8 px-6">
                                <div className="absolute -top-12 left-6 h-24 w-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center font-bold text-3xl text-primary">
                                    {displayUser?.avatar ? (
                                        <img src={displayUser.avatar} alt={displayUser.name} className="h-full w-full object-cover" />
                                    ) : (
                                        displayUser?.name?.[0] || '?'
                                    )}
                                </div>


                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-bold">{displayUser?.name}</h2>
                                    </div>
                                    <p className="text-muted-foreground">{(displayUser as any)?.bio || "아직 소개글이 없습니다."}</p>
                                </div>


                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                    <div className="p-4 bg-muted/50 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-primary">{displayUser?.followers?.toLocaleString() || 0}</div>
                                        <div className="text-xs text-muted-foreground">팔로워</div>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-primary">{allMyMoments.length}</div>
                                        <div className="text-xs text-muted-foreground">등록된 모먼트</div>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-emerald-600">{productApplications?.filter((p: any) => p.status === 'accepted').length || 0}</div>
                                        <div className="text-xs text-muted-foreground">진행중 협업</div>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-indigo-600">{displayUser?.tags?.length || 0}</div>
                                        <div className="text-xs text-muted-foreground">보유 태그</div>
                                    </div>
                                </div>


                                <div className="mt-8 space-y-4">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <Rocket className="h-4 w-4 text-primary" /> 활동 키워드
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {displayUser?.tags && displayUser.tags.length > 0 ? (
                                            displayUser.tags.map((tag: string) => (
                                                <div key={tag} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                                                    {tag}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground italic">아직 태그가 설정되지 않았습니다.</span>
                                        )}
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            case "discover-moments":
                return <DiscoverMomentsView />
            case "dashboard":
                return (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold tracking-tight">내 일정 관리</h1>
                            <Button className="gap-2" asChild>
                                <Link href="/creator/new">
                                    <Plus className="h-4 w-4" /> 새 모먼트 만들기
                                </Link>
                            </Button>
                        </div>

                        <DashboardView
                            activeMoments={activeMoments}
                            myMoments={myMoments}
                            pastMoments={pastMoments}
                            outboundApplications={outboundApplications}
                            inboundProposals={inboundProposals}
                            allActive={allActive}
                            allCompleted={allCompleted}
                            setCurrentView={setCurrentView}
                            handleOpenDetails={handleOpenDetails}
                            setChatProposal={setChatProposal}
                            setIsChatOpen={setIsChatOpen}
                        />
                    </div>
                )
            case "moments_list":
                return (
                    <MomentsView
                        activeMoments={activeMoments}
                        myMoments={myMoments}
                        pastMoments={pastMoments}
                        upcomingMoments={upcomingMoments}
                        momentProposals={momentProposals}
                        setCurrentView={setCurrentView}
                        handleOpenDetails={handleOpenDetails}
                        deleteMoment={deleteMoment}
                        updateMoment={updateMoment}
                        user={displayUser}
                    />
                )

            case "campaigns_list":
                return (
                    <ApplicationsView
                        outboundApplications={outboundApplications}
                        setCurrentView={setCurrentView}
                        handleOpenDetails={handleOpenDetails}
                    />
                )

            case "inbound_list":
                return (
                    <InboundProposalsView
                        inboundProposals={inboundProposals}
                        setCurrentView={setCurrentView}
                        setSelectedProposal={setSelectedProposal}
                        setShowReadonlyDialog={setShowReadonlyDialog}
                    />
                )

            case "product-detail":
                if (!selectedProductId) return null;
                return (
                    <BrandProductDetailView
                        productId={selectedProductId}
                        onBack={() => setCurrentView("discover-products")}
                    />
                )

            case "proposals":
                return (
                    <WorkspaceView
                        workspaceTab={workspaceTab}
                        setWorkspaceTab={setWorkspaceTab}
                        workspaceSubTab={workspaceSubTab}
                        setWorkspaceSubTab={setWorkspaceSubTab}
                        workspaceFavoritesOnly={workspaceFavoritesOnly}
                        setWorkspaceFavoritesOnly={setWorkspaceFavoritesOnly}
                        workspaceSearchQuery={workspaceSearchQuery}
                        setWorkspaceSearchQuery={setWorkspaceSearchQuery}
                        workspacePageSize={workspacePageSize}
                        setWorkspacePageSize={setWorkspacePageSize}
                        workspaceViewMode={workspaceViewMode}
                        setWorkspaceViewMode={setWorkspaceViewMode}

                        allWorkspaceItems={allWorkspaceItems}
                        allActive={allActive}
                        inboundProposals={inboundProposals}
                        outboundApplications={outboundApplications}
                        rejectedProposals={rejectedProposals}
                        allCompleted={allCompleted}
                        favorites={favorites}

                        setChatProposal={setChatProposal}
                        setIsChatOpen={setIsChatOpen}
                        setEditApplicationParams={setEditApplicationParams}
                        setIsCampaignApplyOpen={setIsCampaignApplyOpen}
                        setProposalTarget={setProposalTarget}
                        setIsProposalOpen={setIsProposalOpen}
                        setSelectedProposal={setSelectedProposal}
                        setShowReadonlyDialog={setShowReadonlyDialog}
                        fetchProductGuide={fetchProductGuide}
                        setGuideProduct={setGuideProduct}
                        setIsProductGuideOpen={setIsProductGuideOpen}
                        setPerfSubmitProposal={setPerfSubmitProposal}
                        setPerfSubmitOpen={setPerfSubmitOpen}
                        handleAcceptProposal={handleAcceptProposal}
                        handleRejectClick={handleRejectClick}
                        handleOpenEditApplication={handleOpenEditApplication}
                    />
                )


            case "past_moments":
                return (
                    <PastMomentsView
                        pastMoments={pastMoments}
                        setCurrentView={setCurrentView}
                        updateMoment={updateMoment}
                        displayUser={displayUser}
                    />
                )

            case "notifications":
                return <NotificationsView />

            case "insight-analyzer":
                return <InsightAnalyzer />
            case "settings":
                return <SettingsView />
            case "earnings":
                return <EarningsView />
            case "discover-products":
                return (
                    <ProductBrowseView
                        products={filteredProducts}
                        favorites={favorites}
                        onViewDetail={(p) => {
                            setSelectedProductId(String(p.id))
                            setCurrentView("discover-products")
                        }}
                        onViewGuide={(p) => {
                            if (p.link) window.open(p.link, "_blank")
                        }}
                    />
                )

            case "product-detail":
                return (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <BrandProductDetailView
                            productId={selectedProductId!}
                            onBack={() => setCurrentView("discover-products")}
                        />
                    </div>
                )


            case "discover-campaigns":
                return (
                    <CampaignBrowseView
                        campaigns={(campaigns || []).filter((c: any) => c.status !== 'draft')}
                        applicantCounts={applicantCounts}
                        favorites={favorites}
                        onCampaignClick={(camp: any) => { setSelectedCampaign(camp); setIsCampaignDetailOpen(true); }}
                        onApply={(e: any, camp: any) => { e.stopPropagation(); handleApplyClick(camp); }}
                        description="브랜드가 등록한 쳪페인을 확인하고 지원해보세요."
                    />
                )
            default:
                return null
        }
    }





    // [CONSOLIDATED] 캠페인 지원은 CampaignDetailDialog → CampaignApplicationDialog 단일 경로로 처리
    const handleApplyClick = (campaign: any) => {
        setSelectedCampaign(campaign)
        setIsCampaignDetailOpen(true)
    }

    const handleDownloadContract = () => {
        if (!chatProposal?.contract_content) {
            toast.error("계약서 내용이 없습니다.")
            return
        }

        const contractText = chatProposal.contract_content
        const win = window.open('', '', 'width=800,height=600')
        win?.document.write(`
                        <html>
                            <head>
                                <title>표준 광고 협업 계약서</title>
                                <style>
                                    body {font - family: 'Malgun Gothic', sans-serif; padding: 40px; line-height: 1.6; }
                                    h1 {text - align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                                    pre {white - space: pre-wrap; font-family: inherit; }
                                    .signature-section {margin - top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
                                    .sign-box {width: 45%; border-top: 1px solid #333; padding-top: 10px; }
                                    .sign-img {max - height: 50px; margin-top: 10px; }
                                </style>
                            </head>
                            <body>
                                <h1>표준 광고 협업 계약서</h1>
                                <pre>${contractText}</pre>

                                <div class="signature-section">
                                    <div class="sign-box">
                                        <p><strong>갑 (브랜드):</strong> ${chatProposal?.brand_name || 'CreadyPick'}</p>
                                        ${chatProposal?.brand_signature ? `<img src="${chatProposal.brand_signature}" class="sign-img" />` : '<p>(서명 없음)</p>'}
                                        <p><small>${chatProposal?.brand_signed_at ? new Date(chatProposal.brand_signed_at).toLocaleDateString() : ''}</small></p>
                                    </div>
                                    <div class="sign-box">
                                        <p><strong>을 (크리에이터):</strong> ${chatProposal?.creator_name || user?.name || 'Creator'}</p>
                                        ${chatProposal?.creator_signature ? `<img src="${chatProposal.creator_signature}" class="sign-img" />` : '<p>(서명 없음)</p>'}
                                        <p><small>${chatProposal?.creator_signed_at ? new Date(chatProposal.creator_signed_at).toLocaleDateString() : ''}</small></p>
                                    </div>
                                </div>
                                <script>
                                    window.onload = function() {window.print(); window.close(); }
                                </script>
                            </body>
                        </html>
                        `)
        win?.document.close()
    }



    if (!displayUser || isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30">
            {/* MCN with no teams: show waiting screen */}
            {isMCN && !isLoading && isInitialized && teams && teams.length === 0 ? (
                <div className="min-h-screen flex items-center justify-center bg-muted/20">
                    <div className="text-center max-w-md p-8 bg-background border rounded-2xl shadow-sm space-y-6">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">소속된 팀이 없습니다</h2>
                            <p className="text-muted-foreground">
                                아직 소속된 MCN/Agency 팀이 없습니다.<br />
                                관리자에게 초대를 요청하거나, 직접 팀을 만들어보세요.
                            </p>
                        </div>
                        <div className="pt-2 flex flex-col gap-3">
                            <div className="p-4 bg-muted rounded-lg text-sm break-all">
                                내 이메일: <span className="font-mono font-bold">{user?.email}</span>
                            </div>
                            <Button onClick={() => router.push('/onboarding')} variant="outline">
                                온보딩 다시하기 (팀 생성)
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <SiteHeader />
                    <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                            <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                                <SheetContent side="left" className="w-[280px] p-0">
                                    <div className="flex flex-col h-full">
                                        <SheetHeader className="p-4 border-b">
                                            <SheetTitle className="sr-only">크리에이터 메뉴</SheetTitle>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
                                                    <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h2 className="font-bold">{user?.name || "사용자"}</h2>
                                                    {user?.tags?.[0] && (
                                                        <p className="text-xs text-muted-foreground">
                                                            🏷 {user.tags[0]}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </SheetHeader>
                                        <nav className="space-y-2 p-4">
                                            <Button
                                                variant={currentView === "dashboard" ? "secondary" : "ghost"}
                                                className="w-full justify-start"
                                                onClick={() => {
                                                    setCurrentView("dashboard")
                                                    setIsMobileSidebarOpen(false)
                                                }}
                                            >
                                                <Calendar className="mr-2 h-4 w-4" /> 내 일정 관리
                                            </Button>
                                            <Button
                                                variant={currentView === "proposals" ? "secondary" : "ghost"}
                                                className="w-full justify-start"
                                                onClick={() => {
                                                    setCurrentView("proposals")
                                                    setIsMobileSidebarOpen(false)
                                                }}
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
                                                        onClick={() => { setWorkspaceTab("active"); setIsMobileSidebarOpen(false) }}
                                                    >
                                                        <span className="flex-1 text-left">진행중</span>
                                                        {workspaceTabBadges.active && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />}
                                                    </Button>
                                                    {/* 받은 제안 */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`w-full justify-start text-xs h-8 ${workspaceTab === 'inbound' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-muted-foreground'}`}
                                                        onClick={() => { setWorkspaceTab("inbound"); setIsMobileSidebarOpen(false) }}
                                                    >
                                                        <span className="flex-1 text-left">받은 제안</span>
                                                        {workspaceTabBadges.inbound && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />}
                                                    </Button>
                                                    {/* 보낸 제안 */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`w-full justify-start text-xs h-8 ${workspaceTab === 'outbound' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-muted-foreground'}`}
                                                        onClick={() => { setWorkspaceTab("outbound"); setIsMobileSidebarOpen(false) }}
                                                    >
                                                        <span className="flex-1 text-left">보낸 제안</span>
                                                        {workspaceTabBadges.outbound && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />}
                                                    </Button>
                                                    {/* 거절됨 */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`w-full justify-start text-xs h-8 ${workspaceTab === 'rejected' ? 'bg-red-50 text-red-600 font-medium' : 'text-muted-foreground'}`}
                                                        onClick={() => { setWorkspaceTab("rejected"); setIsMobileSidebarOpen(false) }}
                                                    >
                                                        <span className="flex-1 text-left">거절됨</span>
                                                        {workspaceTabBadges.rejected && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />}
                                                    </Button>
                                                    {/* 완료됨 */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`w-full justify-start text-xs h-8 ${workspaceTab === 'completed' ? 'bg-muted text-foreground/90 font-medium' : 'text-muted-foreground'}`}
                                                        onClick={() => { setWorkspaceTab("completed"); setIsMobileSidebarOpen(false) }}
                                                    >
                                                        <span className="flex-1 text-left">완료됨</span>
                                                        {workspaceTabBadges.completed && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />}
                                                    </Button>
                                                </div>
                                            )}
                                            {FEATURES.ENABLE_CAMPAIGNS && (
                                                <Button
                                                    variant={currentView === "discover-campaigns" ? "secondary" : "ghost"}
                                                    className="w-full justify-start text-primary font-medium"
                                                    onClick={() => {
                                                        setCurrentView("discover-campaigns")
                                                        setIsMobileSidebarOpen(false)
                                                    }}
                                                >
                                                    <Megaphone className="mr-2 h-4 w-4" /> 브랜드 캠페인 둘러보기
                                                </Button>
                                            )}
                                            <Button
                                                variant={currentView === "discover-products" ? "secondary" : "ghost"}
                                                className="w-full justify-start text-primary font-medium"
                                                onClick={() => {
                                                    setCurrentView("discover-products")
                                                    setIsMobileSidebarOpen(false)
                                                }}
                                            >
                                                <ShoppingBag className="mr-2 h-4 w-4" /> 브랜드 제품 둘러보기
                                            </Button>
                                            <Button
                                                variant={currentView === "notifications" ? "secondary" : "ghost"}
                                                className="w-full justify-start"
                                                onClick={() => {
                                                    setCurrentView("notifications")
                                                    setIsMobileSidebarOpen(false)
                                                }}
                                            >
                                                <Bell className="mr-2 h-4 w-4" /> 알림
                                            </Button>
                                            <Button
                                                variant={currentView === "earnings" ? "secondary" : "ghost"}
                                                className="w-full justify-start text-emerald-600 dark:text-emerald-400 font-medium"
                                                onClick={() => {
                                                    setCurrentView("earnings")
                                                    setIsMobileSidebarOpen(false)
                                                }}
                                            >
                                                <DollarSign className="mr-2 h-4 w-4" /> 수익 관리
                                            </Button>
                                            <div className="my-2 border-t" />
                                            <Button
                                                variant={currentView === "insight-analyzer" ? "secondary" : "ghost"}
                                                className="w-full justify-start text-violet-600 dark:text-violet-400 font-medium"
                                                onClick={() => {
                                                    setCurrentView("insight-analyzer")
                                                    setIsMobileSidebarOpen(false)
                                                }}
                                            >
                                                <Sparkles className="mr-2 h-4 w-4" /> AI 단가 분석기
                                            </Button>
                                            {(!isMCN || isProxyMode) && (
                                                <Button
                                                    variant={currentView === "settings" ? "secondary" : "ghost"}
                                                    className="w-full justify-start"
                                                    onClick={() => {
                                                        setCurrentView("settings")
                                                        setIsMobileSidebarOpen(false)
                                                    }}
                                                >
                                                    <Settings className="mr-2 h-4 w-4" /> 프로필 관리
                                                </Button>
                                            )}
                                        </nav>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            {/* Sidebar ... */}

                            {/* ... skipping sidebar code ... */}
                            <aside className="hidden lg:flex flex-col gap-4">
                                {/* Proxy Mode Banner */}
                                {isMCN && isProxyMode && effectiveUser && (
                                    <div className="mx-1 mt-3 rounded-2xl overflow-hidden border border-violet-500/25 bg-gradient-to-br from-violet-950/70 via-purple-950/50 to-indigo-950/60 shadow-xl shadow-violet-950/30">
                                        <div className="px-4 pt-4 pb-3 space-y-3">
                                            {/* Badge */}
                                            <div className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-violet-500/20 border border-violet-400/30">
                                                <Shield className="h-3 w-3 text-violet-400" />
                                                <span className="text-[10px] font-bold text-violet-300 tracking-widest uppercase">대리 관리 모드</span>
                                            </div>
                                            {/* Creator info */}
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border-2 border-violet-400/40 shadow-md shadow-violet-900/50">
                                                    <AvatarImage src={effectiveUser.avatar || ''} className="object-cover" />
                                                    <AvatarFallback className="bg-violet-900/80 text-violet-200 font-bold text-sm">
                                                        {effectiveUser.name?.[0] || '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] text-violet-400/70 font-medium">현재 관리 중인 계정</p>
                                                    <p className="font-bold text-sm text-foreground truncate">{effectiveUser.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Exit button */}
                                        <button
                                            onClick={() => { switchToMember(null); router.push('/mcn') }}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-violet-300 bg-violet-950/50 hover:bg-violet-800/30 border-t border-violet-500/20 transition-all duration-200 hover:text-violet-200"
                                        >
                                            <Building2 className="h-3.5 w-3.5" />
                                            MCN 대시보드로 돌아가기
                                        </button>
                                    </div>
                                )}

                                {!isProxyMode && (
                                    <div className="flex items-center gap-3 px-2 py-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
                                            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="font-bold">{user?.name || "사용자"}</h2>
                                            {user?.tags?.[0] && (
                                                <p className="text-xs text-muted-foreground">
                                                    🏷 {user.tags[0]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <nav className="space-y-2">
                                    <Button
                                        variant={currentView === "dashboard" ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                        onClick={() => setCurrentView("dashboard")}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" /> 내 일정 관리
                                    </Button>
                                    <Button
                                        variant={currentView === "proposals" ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                        onClick={() => setCurrentView("proposals")}
                                    >
                                        <Briefcase className="mr-2 h-4 w-4" /> 워크스페이스 아카이브
                                    </Button>
                                    {currentView === "proposals" && (
                                        <div className="ml-9 space-y-1 mt-1 border-l pl-2">
                                            <Button variant="ghost" size="sm"
                                                className={`w-full justify-start text-xs h-8 ${workspaceTab === 'active' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-muted-foreground'}`}
                                                onClick={() => setWorkspaceTab("active")}>
                                                <span className="flex-1 text-left">진행중</span>
                                                {workspaceTabBadges.active && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />}
                                            </Button>
                                            <Button variant="ghost" size="sm"
                                                className={`w-full justify-start text-xs h-8 ${workspaceTab === 'inbound' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-muted-foreground'}`}
                                                onClick={() => setWorkspaceTab("inbound")}>
                                                <span className="flex-1 text-left">받은 제안</span>
                                                {workspaceTabBadges.inbound && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />}
                                            </Button>
                                            <Button variant="ghost" size="sm"
                                                className={`w-full justify-start text-xs h-8 ${workspaceTab === 'outbound' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-muted-foreground'}`}
                                                onClick={() => setWorkspaceTab("outbound")}>
                                                <span className="flex-1 text-left">보낸 제안</span>
                                                {workspaceTabBadges.outbound && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />}
                                            </Button>
                                            <Button variant="ghost" size="sm"
                                                className={`w-full justify-start text-xs h-8 ${workspaceTab === 'rejected' ? 'bg-red-50 text-red-600 font-medium' : 'text-muted-foreground'}`}
                                                onClick={() => setWorkspaceTab("rejected")}>
                                                <span className="flex-1 text-left">거절됨</span>
                                                {workspaceTabBadges.rejected && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />}
                                            </Button>
                                            <Button variant="ghost" size="sm"
                                                className={`w-full justify-start text-xs h-8 ${workspaceTab === 'completed' ? 'bg-muted text-foreground/90 font-medium' : 'text-muted-foreground'}`}
                                                onClick={() => setWorkspaceTab("completed")}>
                                                <span className="flex-1 text-left">완료됨</span>
                                                {workspaceTabBadges.completed && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />}
                                            </Button>
                                        </div>
                                    )}
                                    {FEATURES.ENABLE_CAMPAIGNS && (
                                        <Button
                                            variant={currentView === "discover-campaigns" ? "secondary" : "ghost"}
                                            className="w-full justify-start text-primary font-medium"
                                            onClick={() => setCurrentView("discover-campaigns")}
                                        >
                                            <Megaphone className="mr-2 h-4 w-4" /> 브랜드 캠페인 둘러보기
                                        </Button>
                                    )}
                                    <Button
                                        variant={currentView === "discover-products" ? "secondary" : "ghost"}
                                        className="w-full justify-start text-primary font-medium"
                                        onClick={() => setCurrentView("discover-products")}
                                    >
                                        <ShoppingBag className="mr-2 h-4 w-4" /> 브랜드 제품 둘러보기
                                    </Button>
                                    <Button
                                        variant={currentView === "notifications" ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                        onClick={() => setCurrentView("notifications")}
                                    >
                                        <Bell className="mr-2 h-4 w-4" /> 알림
                                    </Button>
                                    <Button
                                        variant={currentView === "earnings" ? "secondary" : "ghost"}
                                        className="w-full justify-start text-emerald-600 dark:text-emerald-400 font-medium"
                                        onClick={() => setCurrentView("earnings")}
                                    >
                                        <DollarSign className="mr-2 h-4 w-4" /> 수익 관리
                                    </Button>
                                    <div className="my-2 border-t" />
                                    <Button
                                        variant={currentView === "insight-analyzer" ? "secondary" : "ghost"}
                                        className="w-full justify-start text-violet-600 dark:text-violet-400 font-medium"
                                        onClick={() => setCurrentView("insight-analyzer")}
                                    >
                                        <Sparkles className="mr-2 h-4 w-4" /> AI 단가 분석기
                                    </Button>
                                    {(!isMCN || isProxyMode) && (
                                        <Button
                                            variant={currentView === "settings" ? "secondary" : "ghost"}
                                            className="w-full justify-start"
                                            onClick={() => setCurrentView("settings")}
                                        >
                                            <Settings className="mr-2 h-4 w-4" /> 프로필 관리
                                        </Button>
                                    )}

                                </nav>

                                {/* MCN Management Tools (Sidebar) */}
                                {isMCN && !isProxyMode && (
                                    <div className="p-4 space-y-6 overflow-y-auto border-t">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building2 className="h-4 w-4 text-primary" />
                                            <h4 className="font-bold text-sm">MCN 관리</h4>
                                        </div>

                                        <TeamStatistics />
                                        {/* Compact versions or full cards - Scrollable sidebar allows vertical flow */}
                                        <div className="space-y-4">
                                            <TeamMembersCard />
                                            <InviteLinkGenerator />
                                        </div>
                                    </div>
                                )}

                            </aside>

                            {/* Main Content */}
                            {isMCN && !isProxyMode ? (
                                /* MCN 본인 모드: MCN 대시보드로 안내 */
                                <div className="flex-1 p-8 pt-0">
                                    <Card className="p-12 text-center bg-muted/20 border-dashed">
                                        <UsersIcon className="h-20 w-20 mx-auto mb-6 text-muted-foreground/40" />
                                        <h2 className="text-3xl font-bold mb-3">
                                            MCN 대시보드를 이용하세요
                                        </h2>
                                        <p className="text-muted-foreground text-lg mb-2">
                                            소속 크리에이터 현황을 한 눈에 확인하고 관리할 수 있습니다
                                        </p>
                                        <p className="text-muted-foreground text-lg mb-6">
                                            또는 헤더에서 크리에이터를 선택해 대리 관리할 수 있습니다
                                        </p>
                                        <Button
                                            size="lg"
                                            onClick={() => router.push('/mcn')}
                                            className="gap-2"
                                        >
                                            <Building2 className="h-5 w-5" />
                                            MCN 대시보드 이동
                                        </Button>
                                    </Card>
                                </div>
                            ) : (
                                /* 일반 크리에이터 OR 프록시 모드: 정상 표시 */
                                <div className="overflow-x-hidden min-w-0 flex-1">
                                    {renderContent()}
                                </div>
                            )}

                            {/* Render the Dialog */}
                            {/* AI Plan Modal */}
                            <AIPlanModal
                                isOpen={isAIPlanModalOpen}
                                onOpenChange={setIsAIPlanModalOpen}
                                planContent={aiPlanResult}
                            />

                            {/* Campaign Detail Dialog */}
                            <CampaignDetailDialog
                                open={isCampaignDetailOpen}
                                onOpenChange={setIsCampaignDetailOpen}
                                campaign={selectedCampaign}
                            />

                            {/* [ADDED] 캠페인 임시저장용 existingApplication 전달 */}
                            <CampaignApplicationDialog
                                open={isCampaignApplyOpen}
                                onOpenChange={(open) => {
                                    setIsCampaignApplyOpen(open);
                                    if (!open) setEditApplicationParams(null);
                                }}
                                campaign={{
                                    id: editApplicationParams?.campaignId,
                                    brandId: editApplicationParams?.brandId
                                }}
                                existingApplication={editApplicationParams?.existingData}
                                onSuccess={() => {
                                    refreshData()
                                    toast.success("캠페인 지원이 완료되었습니다.")
                                }}
                            />

                            {/* Workspace Dialog (Mobile & Desktop Unified) */}
                            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                                <DialogContent className="left-0 top-14 translate-x-0 translate-y-0 max-w-[100vw] w-full h-[calc(100dvh-3.5rem)] rounded-none sm:left-[50%] sm:top-[50%] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-[1500px] sm:w-[95vw] sm:h-[90vh] sm:max-h-[900px] sm:rounded-2xl p-0 gap-0 overflow-hidden flex flex-col bg-background border-0 shadow-2xl">
                                    <DialogTitle className="sr-only">Creator Workspace</DialogTitle>
                                    <WorkspaceLayout userRole="creator" />
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Details Modal */}
                        <DetailsModal
                            isOpen={isDetailsModalOpen}
                            onOpenChange={setIsDetailsModalOpen}
                            data={selectedItemDetails}
                            type={detailsType}
                            proposals={relatedProposals}
                            onViewProposal={handleViewProposal}
                            onEdit={(id) => {
                                setIsDetailsModalOpen(false);
                                router.push(`/creator/edit/${id}`);
                            }}
                            onDelete={(id) => {
                                setConfirmDialog({
                                    open: true,
                                    title: "모먼트 삭제",
                                    description: "정말 이 모먼트를 삭제하시겠습니까? 복구할 수 없습니다.",
                                    onConfirm: async () => {
                                        // 협업 이력 체크
                                        const { count } = await supabase
                                            .from('moment_proposals')
                                            .select('id', { count: 'exact', head: true })
                                            .eq('moment_id', id)
                                        if (count && count > 0) {
                                            // 이력 있으면 비공개 처리로 유도
                                            setConfirmDialog({
                                                open: true,
                                                title: "협업 이력이 있는 모먼트",
                                                description: `이 모먼트에 협업 이력(${count}건)이 있어 삭제하면 이력이 함께 삭제됩니다. 삭제 대신 비공개로 전환하시겠어요?`,
                                                onConfirm: async () => {
                                                    await supabase
                                                        .from('life_moments')
                                                        .update({ is_private: true })
                                                        .eq('id', id)
                                                    setIsDetailsModalOpen(false)
                                                },
                                                variant: "destructive"
                                            })
                                            return
                                        }
                                        await deleteMoment(id);
                                        setIsDetailsModalOpen(false);
                                    },
                                    variant: "destructive"
                                })
                            }}
                        />

                        {/* Full Contract Viewer Dialog */}
                        <Dialog open={isFullContractOpen} onOpenChange={setIsFullContractOpen}>
                            <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col p-6 overflow-hidden">
                                <DialogHeader className="mb-4">
                                    <DialogTitle>표준 광고 협업 계약서</DialogTitle>
                                    <DialogDescription>작성된 계약서의 전체 내용입니다.</DialogDescription>
                                </DialogHeader>
                                <div className="flex-1 overflow-y-auto p-6 bg-muted/30 rounded-xl border border-border font-mono text-sm whitespace-pre-wrap">
                                    {generatedContract || `제 1조 [목적]
본 계약은 '갑'(${chatProposal?.brand_name || '브랜드'})과 '을'(${user?.name || '크리에이터'})간의 콘텐츠 제작 및 홍보 업무에 관한 제반 사항을 규정함을 목적으로 한다.

제 2조 [원고료 및 지급]
1. '갑'은 '을'에게 콘텐츠 제작의 대가로 금 ${chatProposal?.price_offer ? `${chatProposal.price_offer.toLocaleString()}원` : '0원'}을 지급한다.
                                    2. 지급 시기는 콘텐츠 업로드 후 30일 이내로 한다.

                                    제 3조 [콘텐츠 제작]
                                    '을'은 '갑'의 가이드를 준수하여 고품질의 콘텐츠를 제작하며, 합의된 일정 내에 업로드한다.

                                    ... (중략) ...

상기 내용을 확인하였으며, 계약에 동의합니다.`}
                                </div>
                                <DialogFooter className="mt-6">
                                    <Button onClick={() => setIsFullContractOpen(false)}>닫기</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                    </main>
                    {/* Signature Modal */}
                    <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen} >
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle>전자 서명 (Electronic Signature)</DialogTitle>
                                <DialogDescription>
                                    계약서에 첨부될 서명을 아래 영역에 그려주세요. 법적 서명란에 자동 삽입됩니다.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <div className="border-2 border-dashed border-slate-300 rounded-xl bg-muted/30 overflow-hidden relative group">
                                    <SignatureCanvasDynamic
                                        ref={sigCanvas as any}
                                        penColor="black"
                                        canvasProps={{
                                            className: "w-full h-48 cursor-crosshair active:cursor-none",
                                            style: { width: '100%', height: '192px' }
                                        }}
                                    />
                                    <div className="absolute top-2 right-2 opacity-50 text-[10px] pointer-events-none group-hover:opacity-100 transition-opacity">
                                        ✍️ Sign Here
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                                    <span>마우스나 터치로 서명하세요.</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs text-muted-foreground/70 hover:text-red-500"
                                        onClick={() => sigCanvas.current.clear()}
                                    >
                                        <X className="h-3 w-3 mr-1" /> 초기화
                                    </Button>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsSignatureModalOpen(false)}>취소</Button>
                                <Button onClick={performContractSign} className="gap-2">
                                    <BadgeCheck className="h-4 w-4" />
                                    동의 및 서명 완료
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Product Guide Dialog Render */}
                    {
                        isProductGuideOpen && guideProduct && (
                            <ProductGuideDialog
                                isOpen={isProductGuideOpen}
                                onOpenChange={setIsProductGuideOpen}
                                product={guideProduct}
                            />
                        )
                    }
                    {/* [ADDED] 임시저장 데이터 연동을 위해 existingProposal 프롭 전달 */}
                    <CreatorProposalDialog
                        open={isProposalOpen}
                        onOpenChange={(open) => {
                            setIsProposalOpen(open);
                            if (!open) setEditApplicationParams(null); // 닫을 때 초기화
                        }}
                        target={proposalTarget}
                        onSubmit={async (data) => {
                            if (!proposalTarget || !user) return;
                            await addProposal({
                                toId: proposalTarget.brandId,
                                creator_id: user.id,
                                productId: proposalTarget.productId,
                                product_name: proposalTarget.productName,
                                message: data.appealMessage || data.motivation,
                                status: 'applied',
                                instagramHandle: data.channelUrl,
                                channel_name: data.channelName,
                                channel_subtype: data.channelSubtype,
                                channel_url: data.channelUrl,
                                product_type: 'ad',
                                price_offer: data.desiredCost ? parseInt(data.desiredCost) : 0,
                                motivation: data.motivation,
                                content_plan: data.contentPlan,
                                portfolioLinks: data.portfolioLinks ? data.portfolioLinks.split("\n").map(l => l.trim()).filter(Boolean) : [],
                                insightScreenshot: undefined,
                            });
                            toast.success("제안이 송신되었습니다.")
                            setIsProposalOpen(false);
                            refreshData()
                        }}
                    />
                    {/* Brand Detail Modal */}
                    <Dialog open={!!selectedBrandProduct} onOpenChange={(open) => !open && setSelectedBrandProduct(null)}>
                        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                            <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-600">
                                <div className="absolute -bottom-10 left-6 h-20 w-20 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
                                    {selectedBrandProduct?.brandAvatar ? (
                                        <img src={selectedBrandProduct.brandAvatar} alt={selectedBrandProduct.brandName} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground/70">
                                            {selectedBrandProduct?.brandName?.[0]}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="pt-12 pb-6 px-6">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-foreground">{selectedBrandProduct?.brandName}</h2>
                                    <p className="text-sm text-muted-foreground font-medium">@{selectedBrandProduct?.brandHandle || 'brand_official'}</p>
                                    {selectedBrandProduct?.brandBio && (
                                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/50">
                                            "{selectedBrandProduct.brandBio}"
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Package className="h-4 w-4 text-indigo-600" />
                                        관심 제품 정보
                                    </h4>
                                    <div className="flex gap-4 p-4 border rounded-xl bg-white shadow-sm">
                                        <div className="h-20 w-20 shrink-0 bg-muted rounded-lg overflow-hidden border border-border/50">
                                            {selectedBrandProduct?.image ? (
                                                <img src={selectedBrandProduct.image} alt={selectedBrandProduct.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                    <ImageIcon className="h-8 w-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <Badge variant="outline" className="mb-1 text-[10px]">{selectedBrandProduct?.category || 'General'}</Badge>
                                                    <h3 className="font-bold text-foreground truncate">{selectedBrandProduct?.name}</h3>
                                                </div>
                                                <p className="font-bold text-indigo-600 text-sm">{selectedBrandProduct?.price?.toLocaleString()}원</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{selectedBrandProduct?.description}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                                            // BrandProductDetailView로 이동 — 거기서 CreatorProposalDialog 제공
                                            setSelectedProductId(String(selectedBrandProduct.id))
                                            setCurrentView("product-detail")
                                            setSelectedBrandProduct(null)
                                        }}>
                                            <Send className="mr-2 h-4 w-4" /> 제안 보내기
                                        </Button>
                                        <Button variant="outline" className="flex-1" onClick={() => setSelectedBrandProduct(null)}>
                                            닫기
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>



                    {/* ReadonlyProposalDialog for viewing proposal details */}
                    <ReadonlyProposalDialog
                        open={showReadonlyDialog}
                        onOpenChange={setShowReadonlyDialog}
                        proposal={selectedProposal}
                        onAccept={async (proposalId) => {
                            // Determine which table to update based on proposal type
                            const proposal = selectedProposal
                            if (!proposal) return

                            try {
                                if (proposal.moment_id) {
                                    // Moment proposal
                                    const { error } = await supabase
                                        .from('moment_proposals')
                                        .update({ status: 'accepted' })
                                        .eq('id', proposalId)
                                    if (error) throw error
                                } else if (proposal.campaign_id) {
                                    // Campaign application
                                    const { error } = await supabase
                                        .from('campaign_applications')
                                        .update({ status: 'accepted' })
                                        .eq('id', proposalId)
                                    if (error) throw error
                                } else {
                                    // Brand proposal (default)
                                    const { error } = await supabase
                                        .from('product_applications')
                                        .update({ status: 'accepted' })
                                        .eq('id', proposalId)
                                    if (error) throw error
                                }

                                await refreshData()
                                toast.success('제안을 수락했습니다!')
                            } catch (error: any) {
                                toast.error('수락 실패: ' + error.message)
                                throw error
                            }
                        }}
                        onReject={async (proposalId) => {
                            const proposal = selectedProposal
                            if (!proposal) return

                            try {
                                if (proposal.moment_id) {
                                    const { error } = await supabase
                                        .from('moment_proposals')
                                        .update({ status: 'rejected' })
                                        .eq('id', proposalId)
                                    if (error) throw error
                                } else if (proposal.campaign_id) {
                                    const { error } = await supabase
                                        .from('campaign_applications')
                                        .update({ status: 'rejected' })
                                        .eq('id', proposalId)
                                    if (error) throw error
                                } else {
                                    const { error } = await supabase
                                        .from('product_applications')
                                        .update({ status: 'rejected' })
                                        .eq('id', proposalId)
                                    if (error) throw error
                                }

                                await refreshData()
                                toast.success('제안을 거절했습니다!')
                            } catch (error: any) {
                                toast.error('거절 실패: ' + error.message)
                                throw error
                            }
                        }}
                    />

                    {/* G3: 크리에이터가 보낸 지원서 수정 다이얼로그 */}
                    <Dialog open={!!editingApplication} onOpenChange={(open) => !open && setEditingApplication(null)}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>지원서 수정</DialogTitle>
                                <DialogDescription>
                                    {editingApplication?.campaign_name || editingApplication?.brand_name || '캐맠페인'}에 보낸 지원서를 수정합니다.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">희망 비용 (원)</label>
                                    <Input
                                        type="number"
                                        value={editDesiredCost}
                                        onChange={(e) => setEditDesiredCost(e.target.value)}
                                        placeholder="예: 200000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">지원 동기 / 콘텐츠 계획</label>
                                    <Textarea
                                        value={editAppealMessage}
                                        onChange={(e) => setEditAppealMessage(e.target.value)}
                                        className="min-h-[120px]"
                                        placeholder="지원 동기나 콘텐츠 계획을 수정하세요."
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingApplication(null)}>취소</Button>
                                <Button onClick={handleSaveEditApplication} disabled={isSavingApplication}>
                                    {isSavingApplication ? '저장 중...' : '저장'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Confirm Dialog for Accept/Reject Actions */}
                    {
                        confirmDialog && (
                            <ConfirmDialog
                                open={confirmDialog.open}
                                onOpenChange={(open) => !open && setConfirmDialog(null)}
                                title={confirmDialog.title}
                                description={confirmDialog.description}
                                onConfirm={confirmDialog.onConfirm}
                                variant={confirmDialog.variant}
                            />
                        )
                    }

                    {/* 성과 제출 다이얼로그 (settlement 단계) */}
                    {perfSubmitProposal && (
                        <PerformanceSubmitDialog
                            open={perfSubmitOpen}
                            onClose={() => { setPerfSubmitOpen(false); setPerfSubmitProposal(null) }}
                            proposal={perfSubmitProposal}
                            onSubmitted={async () => { await refreshData() }}
                        />
                    )}
                </>
            )
            }
        </div >
    )
}

