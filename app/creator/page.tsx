"use client"

import React from "react"
import { SiteHeader } from "@/components/site-header"
import { RateCardMessage } from "@/components/chat/rate-card-message"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, formatDateToMonth, formatPriceRange } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioItem,
    DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Bell, Briefcase, Calendar, ChevronRight, Plus, Rocket, Settings, ShoppingBag, User, Trash2, Pencil, BadgeCheck, Search, ExternalLink, Filter, Send, Gift, Megaphone, FileText, Upload, X, Package, Archive, Lock, Star, MessageSquare, Clock, Download, MapPin, Info, Check, Image as ImageIcon, CalendarIcon, Sparkles, MoreVertical, ArrowRight, LayoutGrid, List, Banknote, Table as TableIcon, Menu } from "lucide-react"
import Link from "next/link"
import { usePlatform, MOCK_INFLUENCER_USER, type SubmissionFeedback, type Campaign, type InfluencerEvent } from "@/components/providers/legacy-platform-hook"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkspaceProgressBar } from "@/components/workspace-progress-bar"
import { CreatorWorkspaceLayout } from "@/components/workspace/creator/layout";
import { useWorkspaceStore } from "@/components/workspace/hooks/use-workspace-store";
import { ProductDetailView } from "@/components/dashboard/product-detail-view"
import SignatureCanvas from 'react-signature-canvas'
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { AvatarUpload } from "@/components/ui/avatar-upload"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { toast } from "sonner"
import { useEffect, useState, useRef, useCallback } from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { CalendarView } from "@/components/dashboard/calendar-view"
import dynamic from 'next/dynamic'

// Dialog Components - Dynamically loaded for code splitting
const ApplyDialog = dynamic(() => import("@/components/dialogs/ApplyDialog").then(m => ({ default: m.ApplyDialog })))
const GuideDialog = dynamic(() => import("@/components/dialogs/GuideDialog").then(m => ({ default: m.GuideDialog })))
const CampaignDetailDialog = dynamic(() => import("@/components/dialogs/CampaignDetailDialog").then(m => ({ default: m.CampaignDetailDialog })))
const DetailsModal = dynamic(() => import("@/components/dialogs/DetailsModal").then(m => ({ default: m.DetailsModal })))
const ProductGuideDialog = dynamic(() => import("@/components/dialogs/ProductGuideDialog").then(m => ({ default: m.ProductGuideDialog })))
const ReadonlyProposalDialog = dynamic(() => import("@/components/proposal/readonly-proposal-dialog").then(m => ({ default: m.ReadonlyProposalDialog })))

// View Components
import { DashboardView } from "@/components/creator/views/DashboardView"
import { MomentsView } from "@/components/creator/views/MomentsView"
import { MomentCard } from "@/components/creator/MomentCard"
import { ApplicationsView } from "@/components/creator/views/ApplicationsView"
import { InboundProposalsView } from "@/components/creator/views/InboundProposalsView"

// Imports for Design Options
import { BrandProductDiscoveryView } from "@/components/creator/views/BrandProductDiscoveryView"
import { BrandProductListView } from "@/components/creator/views/BrandProductListView"
import { BrandProductDetailView } from "@/components/creator/views/BrandProductDetailView"
import { CampaignCardA } from "@/components/creator/campaign-cards/CampaignCardA"
import { CampaignCardB } from "@/components/creator/campaign-cards/CampaignCardB"
import { CampaignCardC } from "@/components/creator/campaign-cards/CampaignCardC"
import { CampaignCardD } from "@/components/creator/campaign-cards/CampaignCardD"
import { CampaignCardE } from "@/components/creator/campaign-cards/CampaignCardE"
import { CampaignListRow } from "@/components/creator/CampaignListRow"

const POPULAR_TAGS = [
    "✈️ 여행", "💄 뷰티", "💊 건강", "💉 시술/병원", "👗 패션", "🍽️ 맛집",
    "🏡 리빙/인테리어", "💍 웨딩/결혼", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
    "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
    "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
]

import { Suspense } from "react"
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

function InfluencerDashboardContent() {
    const {
        user, updateUser, campaigns, events, isLoading, notifications, resetData, refreshData,
        brandProposals, momentProposals, updateBrandProposal, // [NEW] Added momentProposals
        sendNotification,
        submissionFeedback: contextSubmissionFeedback, fetchSubmissionFeedback, sendSubmissionFeedback,
        messages, sendMessage,
        deleteEvent, campaignProposals, updateProposal, addProposal,
        products, switchRole, updateEvent, supabase,
        favorites, toggleFavorite, isInitialized, isAuthLoading
    } = usePlatform()

    const router = useRouter()
    const searchParams = useSearchParams()
    const initialView = searchParams.get('view') || "dashboard"

    // State definitions moved up to avoid ReferenceError
    const [currentView, setCurrentView] = useState(initialView)
    const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null)
    const [chatProposal, setChatProposal] = useState<any>(null)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [chatMessage, setChatMessage] = useState("")
    const [generatedContract, setGeneratedContract] = useState("")
    const [isGeneratingContract, setIsGeneratingContract] = useState(false)
    const [isAddEventOpen, setIsAddEventOpen] = useState(false)
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
    const [favoritesOnly, setFavoritesOnly] = useState(false)
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

    // Design Option State
    const [designOption, setDesignOption] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('C')
    const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid')

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

    // ReadonlyProposalDialog State
    const [showReadonlyDialog, setShowReadonlyDialog] = useState(false)
    const [selectedProposal, setSelectedProposal] = useState<any>(null)

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

                alert("AI가 지원 동기와 콘텐츠 기획안을 자동으로 작성했습니다!")
                // setIsAIPlanModalOpen(true) // No longer needed
            } else {
                alert("AI 기획안 생성에 실패했습니다.")
            }
        } catch (e) {
            console.error("AI Plan Error:", e)
            alert("오류가 발생했습니다.")
        } finally {
            setIsAIPlanning(false)
        }
    }

    const handleViewProposal = (proposalId: string) => {
        // Find proposal in brandProposals (inbound) or proposals (outbound/active)
        // Open ReadonlyProposalDialog to show proposal details

        setIsDetailsModalOpen(false);

        const proposal = brandProposals.find((p: any) => p.id === proposalId) ||
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
                    const proposal = brandProposals.find((p: any) => p.id === proposalId)

                    if (!proposal) {
                        toast.error('제안을 찾을 수 없습니다.')
                        return
                    }

                    let error = null

                    // Update the correct table based on proposal type
                    if (proposal.moment_id) {
                        // Moment proposal
                        const result = await supabase
                            .from('moment_proposals')
                            .update({ status: 'accepted' })
                            .eq('id', proposalId)
                        error = result.error
                    } else if (proposal.campaign_id) {
                        // Campaign application
                        const result = await supabase
                            .from('campaign_applications')
                            .update({ status: 'accepted' })
                            .eq('id', proposalId)
                        error = result.error
                    } else {
                        // Brand proposal (default)
                        const result = await supabase
                            .from('brand_proposals')
                            .update({ status: 'accepted' })
                            .eq('id', proposalId)
                        error = result.error
                    }

                    if (error) {
                        toast.error('수락 실패: ' + error.message)
                        throw error
                    }

                    await refreshData() // Refresh proposal list
                    toast.success('제안을 수락했습니다!')
                } catch (error: any) {
                    console.error('Accept error:', error)
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
                    const proposal = brandProposals.find((p: any) => p.id === proposalId)

                    if (!proposal) {
                        toast.error('제안을 찾을 수 없습니다.')
                        return
                    }

                    let error = null

                    // Update the correct table based on proposal type
                    if (proposal.moment_id) {
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
                            .from('brand_proposals')
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
                    const proposal = allOutboundProposals.find((p: any) => p.id === proposalId)

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
                            .from('brand_proposals')
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
        if (proposalId && !chatProposal && brandProposals && brandProposals.length > 0) {
            console.log("Checking for proposalId:", proposalId)
            const targetProposal = brandProposals.find((p: any) => p.id === proposalId)
            if (targetProposal) {
                console.log("Auto-opening proposal from URL:", targetProposal)
                setChatProposal(targetProposal)
            }
        }
    }, [searchParams, brandProposals, chatProposal])

    // Reset sub-tab when main tab changes
    useEffect(() => {
        setWorkspaceSubTab('all')
    }, [workspaceTab])

    // Force data refresh on mount to avoid stale data from navigation
    useEffect(() => {
        console.log('[CreatorDashboard] Forcing data refresh on mount')
        refreshData()
    }, []) // Stable refresh once on mount

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
        if (chatProposal) {
            const isCampaign = !!chatProposal?.campaignId || (chatProposal as any)?.type === 'creator_apply'
            const pId = chatProposal.id.toString()
            console.log('[Creator] Fetching feedback for:', pId, 'isCampaign:', isCampaign)
            fetchSubmissionFeedback(pId, !isCampaign)
        }
    }, [chatProposal, isChatOpen])
    const workFeedbackChatRef = useRef<HTMLDivElement>(null)



    const displayUser = user

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
            let stage: 'negotiation' | 'contract' | 'shipping' | 'content' | 'completed' = 'negotiation';

            if (chatProposal.brand_condition_confirmed && chatProposal.influencer_condition_confirmed) stage = 'contract';
            if (chatProposal.contract_status === 'signed') stage = 'shipping';
            if (chatProposal.delivery_status === 'shipped' || chatProposal.delivery_status === 'delivered') stage = 'content';
            if (chatProposal.content_submission_url || chatProposal.content_submission_file_url) {
                if (chatProposal.content_submission_status === 'approved' || chatProposal.status === 'completed') {
                    stage = 'completed';
                } else {
                    stage = 'content';
                }
            }
            if (chatProposal.status === 'completed') stage = 'completed';

            useWorkspaceStore.getState().setCurrentStage(stage);
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
            alert("제작 가이드를 불러올 수 없습니다.");
        }
    }

    const handleOpenDetails = useCallback((item: any, type: 'moment' | 'campaign') => {
        setSelectedItemDetails(item)
        setDetailsType(type)

        let related: any[] = []
        if (type === 'moment') {
            // Filter brand proposals that target this specific moment event
            // The schema has 'event_id' in brand_proposals referencing influencer_events(id)
            if (item && item.id) {
                related = brandProposals.filter((p: any) => p.event_id === item.id);
            } else {
                related = [];
            }
        } else {
            // Campaign: Outbound applications
            // Ideally we find the application(s) we made for this campaign
            // But currently campaigns_list shows outbound APPLICATIONS (Campaign objects?)
            // If item is 'campaign', it might be the Campaign info, or the Application info.
            // If it's the Campaign, we need to find OUR application to it.
            // proposals -> campaign_id
            if (item && item.id) {
                // item is likely the Campaign object if from discover, or Application if from list?
                // In campaigns_list, we iterate 'applications' which are proposals joined with campaigns.
                // So item is the proposal(application).
                // We don't have 'related proposals' to an application usually.
                related = []
            }
        }

        setRelatedProposals(related)
        setIsDetailsModalOpen(true)
    }, [brandProposals])



    // Filter events (Admins see all, users see theirs)
    const displayEvents = displayUser?.type === 'admin' ? events : events.filter((e: any) => e.influencerId === displayUser?.id || e.handle === displayUser?.handle)

    // Date-based filtering for refined UI
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Date-based filtering with robust parsing
    const parseEventDate = (dateStr: string) => {
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



    const activeMoments = displayEvents.filter((e: any) => {
        const eventDate = parseEventDate(e.eventDate)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate < today && e.status !== 'completed'
    })


    const myMoments = displayEvents.filter((e: any) => {
        const eventDate = parseEventDate(e.eventDate)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate >= today && e.status !== 'completed'
    })


    const pastMoments = displayEvents.filter((e: any) => e.status === 'completed')

    const myEvents = events.filter((e: any) => e.influencerId === displayUser?.id || e.handle === displayUser?.handle)

    // Compatibility for upstream code using upcomingMoments
    const upcomingMoments = [...activeMoments, ...myMoments];

    // Helper function to deduplicate proposals by ID
    const deduplicateById = (items: any[]) => {
        const seenIds = new Set<string>()
        return items.filter(item => {
            if (!item?.id || seenIds.has(item.id)) return false
            seenIds.add(item.id)
            return true
        })
    }

    // [FIX] brandProposals already contains moment proposals (merged in ProposalProvider)
    // We should NOT merge them again here to avoid duplicate keys.
    const allInboundProposals = deduplicateById([
        ...(brandProposals || []),
        // ...(momentProposals || []) // REMOVED: Redundant merge triggering duplicate keys
    ]).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())

    const filteredProposalsByMoment = selectedMomentId
        ? (allInboundProposals.filter((p: any) => p.event_id === selectedMomentId) || [])
        : []

    // --- SHARED DATA LOGIC (Lifted for Dashboard & Proposals View) ---

    // [New Logic] Split brandProposals into "Offers" (Inbound) and "Applications" (Outbound)
    // Heuristic: If it has 'motivation' or 'content_plan', it's likely a Creator Application to a Brand Product.
    // [FIX] Filter by status to avoid duplicates in Active/Rejected/Completed Lists
    const brandApplications = brandProposals?.filter((p: any) =>
        (p.motivation || p.content_plan) &&
        (p.status === 'applied' || p.status === 'pending' || p.status === 'viewed' || p.status === 'offered')
    ) || []

    // Brand Offers are those WITHOUT motivation (pure offers from brand)
    const brandOffers = brandProposals?.filter((p: any) => !p.motivation && !p.content_plan) || []

    // 2. Outbound (Applied to Campaigns + Brand Products) - Waiting
    const campaignApplications = campaignProposals?.filter((p: any) => p.type === 'creator_apply' && (p.status === 'applied' || p.status === 'pending' || p.status === 'viewed')) || []

    // Combine Campaign Applications + Brand Applications
    const outboundApplications = [
        ...campaignApplications,
        ...brandApplications
    ].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())

    // 3. Active (In Progress) - Both sources (deduplicated)
    const activeInbound = allInboundProposals.filter((p: any) => p.status === 'accepted' || p.status === 'signed' || p.status === 'started' || p.status === 'confirmed') || []
    const activeOutbound = campaignProposals?.filter((p: any) => p.status === 'accepted' || p.status === 'signed' || p.status === 'started' || p.status === 'confirmed') || []
    const allActive = deduplicateById([...activeInbound, ...activeOutbound]).sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())

    // Refined Inbound (Waiting for Action)
    // brandOffers is filtered from brandProposals, which already contains merged moment_proposals
    // (See proposal-provider.tsx line 265-269: setBrandProposals([...mappedBrand, ...mappedMoment]))
    // Do NOT merge momentProposals again - it causes duplicate keys!
    const inboundProposals = brandOffers
        .filter((p: any) => !p.status || p.status === 'offered' || p.status === 'negotiating' || p.status === 'pending')
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
    const allWorkspaceItems = allWorkspaceItemsRaw
        .filter(item => {
            if (seenIds.has(item.id)) return false
            seenIds.add(item.id)
            return true
        })
        .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())

    // Filter items by type (moment/campaign/brand)
    const filterByType = (items: any[], type: 'all' | 'moment' | 'campaign' | 'brand') => {
        if (type === 'all') return items

        return items.filter(item => {
            if (type === 'moment') {
                // Moment proposals or brand proposals with event_id
                return item.moment_id || item.event_id
            }
            if (type === 'campaign') {
                // Campaign proposals
                return item.campaign_id && !item.moment_id && !item.event_id
            }
            if (type === 'brand') {
                // Brand proposals without event_id (direct offers)
                return !item.moment_id && !item.event_id && !item.campaign_id
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

    // --- WORKSPACE RENDERING HELPER ---
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
                                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => { setChatProposal(item); setIsChatOpen(true); }}>
                                    <TableCell>
                                        <Badge variant="outline" className={`
                                            ${item.status === 'accepted' || item.status === 'signed' || item.status === 'started' ? 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30' :
                                                item.status === 'completed' ? 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' :
                                                    item.status === 'rejected' ? 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30' :
                                                        'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/30'}
                                        `}>
                                            {item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? '진행중' :
                                                item.status === 'completed' ? '완료됨' :
                                                    item.status === 'rejected' ? '거절됨' : '대기중'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] overflow-hidden">
                                                {item.brand_name?.[0] || "B"}
                                            </div>
                                            {item.brand_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.product_name}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline" className={`text-[10px] h-5 px-2 font-medium border-2 rounded-full transition-all bg-background
                                            ${item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                                                item.status === 'completed' ? 'text-slate-700 dark:text-slate-300 border-slate-400/50 shadow-[0_0_10px_rgba(148,163,184,0.3)]' :
                                                    item.status === 'rejected' ? 'text-red-700 dark:text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' :
                                                        'text-orange-700 dark:text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]'}
                                        `}>
                                            {item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? '진행중' : item.status === 'completed' ? '완료' : item.status === 'rejected' ? '거절' : '수락 대기중'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
                                            : item.type === 'brand_offer'
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
                        `} onClick={() => { setChatProposal(item); setIsChatOpen(true); }}>
                            <CardHeader className="pb-3 flex-row gap-3 items-start space-y-0">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border overflow-hidden
                                    ${item.status === 'accepted' || item.status === 'signed' ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800' :
                                        item.status === 'completed' ? 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700' :
                                            'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800'}
                                `}>
                                    {item.brand_name?.[0] || "W"}
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
                                    {item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? '진행중' : item.status === 'completed' ? '완료' : item.status === 'rejected' ? '거절' : '수락 대기중'}
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
                            <CardFooter className="pt-0 pb-3 text-[10px] text-muted-foreground flex justify-between">
                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                <span className="group-hover:text-primary transition-colors">상세보기 →</span>
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
                    <Card key={proposal.id} className={`p-6 border-l-4 bg-card hover:bg-accent/5 cursor-pointer hover:shadow-md transition-all
                        ${type === 'all'
                            ? (proposal.status === 'accepted' || proposal.status === 'signed' || proposal.status === 'started' || proposal.status === 'confirmed'
                                ? 'border-l-emerald-500'  // Active
                                : proposal.status === 'completed'
                                    ? 'border-l-slate-400'  // Completed - Gray
                                    : proposal.status === 'rejected'
                                        ? 'border-l-red-500'  // Rejected
                                        : proposal.type === 'brand_offer'
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
                            if (type === 'active') {
                                setChatProposal(proposal);
                                setIsChatOpen(true);
                            } else {
                                setSelectedProposal(proposal);
                                setShowReadonlyDialog(true);
                            }
                        }}>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted/50 border border-border overflow-hidden">
                                <span className="font-bold text-lg text-muted-foreground">{proposal.brand_name?.[0] || "W"}</span>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-xl flex items-center gap-2 text-foreground">
                                            {proposal.product_name || proposal.brand_name}
                                            <Badge variant="outline" className={`text-xs font-medium border-2 rounded-full px-3 py-0.5 transition-all bg-background
                                                ${proposal.status === 'accepted' || proposal.status === 'signed' || proposal.status === 'started' || proposal.status === 'confirmed' ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]' :
                                                    proposal.status === 'completed' ? 'text-slate-700 dark:text-slate-300 border-slate-400/50 shadow-[0_0_12px_rgba(148,163,184,0.3)]' :
                                                        proposal.status === 'rejected' ? 'text-red-700 dark:text-red-400 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.3)]' :
                                                            'text-orange-700 dark:text-orange-400 border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.3)]'}
                                            `}>
                                                {proposal.status === 'accepted' || proposal.status === 'signed' || proposal.status === 'started' ? '진행중' :
                                                    proposal.status === 'completed' ? '완료됨' :
                                                        proposal.status === 'rejected' ? '거절됨' :
                                                            '수락 대기중'}
                                            </Badge>
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {proposal.brand_name} • {new Date(proposal.created_at).toLocaleDateString()}
                                            {/* Show moment title if available */}
                                            {proposal.moment_id && proposal.moment_title && (
                                                <span className="ml-2 text-purple-600 dark:text-purple-400">
                                                    → {proposal.moment_title}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
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
                                        <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="flex-1">
                                        <WorkspaceProgressBar
                                            status={proposal.status}
                                            contract_status={proposal.contract_status}
                                            delivery_status={proposal.delivery_status}
                                            content_submission_status={proposal.content_submission_status}
                                        />
                                    </div>

                                    {/* Accept/Reject Buttons - Only show for 'offered' status */}
                                    {proposal.status === 'offered' && (
                                        <div className="flex gap-2 shrink-0">
                                            <Button
                                                size="sm"
                                                onClick={(e) => handleAcceptProposal(e, proposal.id)}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                수락하기
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={(e) => handleRejectProposal(e, proposal.id)}
                                            >
                                                거절하기
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
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

    const performContractSign = async () => {
        if (!chatProposal) return
        if (sigCanvas.current.isEmpty()) {
            alert("서명을 입력해주세요.")
            return
        }

        if (!confirm("서명과 함께 계약서에 동의하시겠습니까?")) return

        const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
        await handleContractResponse('signed', signatureData)
        setIsSignatureModalOpen(false)
    }

    const handleContractResponse = async (status: 'signed' | 'negotiating' | 'rejected', signatureData?: string) => {
        if (!chatProposal) return

        if (!confirm(status === 'signed' ? "계약서에 서명하시겠습니까?" : status === 'negotiating' ? "수정 요청을 보내시겠습니까?" : "거절하시겠습니까?")) return

        try {
            const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'creator_apply';
            const proposalId = chatProposal.id?.toString();
            const brandId = isCampaignProposal ? chatProposal.campaign?.brand_id : chatProposal.brand_id;

            // Use getUpdateFunction helper concept or direct check
            if (isCampaignProposal) {
                // For Creator Apply -> proposals table
                // Use the updateProposal function from usePlatform context which is now Promise<boolean> and writes to DB
                // Only include signature if provided (and status is signed)
                const updateData: any = { contract_status: status }
                if (signatureData) {
                    updateData.influencer_signature = signatureData
                    updateData.influencer_signed_at = new Date().toISOString()
                }

                await updateProposal(proposalId, updateData)
            } else {
                // For Brand Offer -> brand_proposals table
                const updateData: any = { contract_status: status }
                if (signatureData) {
                    updateData.influencer_signature = signatureData
                    updateData.influencer_signed_at = new Date().toISOString()
                }

                await updateBrandProposal(proposalId, updateData)
            }

            // NOTE: The above logic inside 'if' is tricky because I need access to 'updateProposal' from context if I want to use it.
            // I see 'updateBrandProposal' is destructured. I need to make sure 'updateProposal' is also destructured.

            // Local update
            setChatProposal((prev: any) => ({ ...prev, contract_status: status, influencer_signature: signatureData }))

            // Notify brand
            const msg = status === 'signed' ? "✅ 계약서에 서명했습니다! 콘텐츠 제작을 시작하겠습니다." :
                status === 'negotiating' ? "📝 계약서 내용 수정을 요청했습니다. 확인 부탁드립니다." :
                    "❌ 계약 제안을 거절했습니다."

            // Send message with correct IDs
            if (isCampaignProposal) {
                // (to, content, proposalId, brandProposalId)
                await sendMessage(brandId, msg, proposalId, undefined)
            } else {
                await sendMessage(brandId, msg, undefined, proposalId)
            }

            alert("상태가 업데이트되었습니다.")
        } catch (e) {
            console.error("Contract update failed:", e)
            alert("오류가 발생했습니다.")
        }
    }

    const handleProductReceived = async (e?: React.MouseEvent) => {
        e?.preventDefault()
        e?.stopPropagation()
        if (!chatProposal) return

        if (!confirm("제품을 수령하셨습니까? 수령 처리 후에는 취소할 수 없습니다.")) return

        try {
            const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'creator_apply'
            const proposalId = chatProposal.id?.toString()
            const brandId = isCampaignProposal ? chatProposal.campaign?.brand_id : chatProposal.brand_id

            const updateData: any = {
                delivery_status: 'delivered'
            }

            if (isCampaignProposal) {
                await updateProposal(proposalId, updateData)
            } else {
                await updateBrandProposal(proposalId, updateData)
            }

            setChatProposal((prev: any) => ({ ...prev, ...updateData }))

            await sendMessage(brandId, "📦 [자동 알림] 크리에이터가 제품 수령을 완료했습니다.", isCampaignProposal ? proposalId : undefined, isCampaignProposal ? undefined : proposalId)

            alert("제품 수령이 확인되었습니다. 이제 작업물을 제출할 수 있습니다.")
        } catch (e) {
            console.error("Product update failed:", e)
            alert("오류가 발생했습니다.")
        }
    }

    const handleSaveShippingInfo = async () => {
        if (!shippingName || !shippingPhone || !shippingAddress) {
            alert("모든 배송 정보를 입력해주세요.")
            return
        }
        if (!chatProposal) return

        setIsSavingShipping(true)
        try {
            const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'creator_apply'
            const proposalId = chatProposal.id?.toString()
            const brandId = isCampaignProposal ? chatProposal.campaign?.brand_id : chatProposal.brand_id

            const updateData = {
                shipping_name: shippingName,
                shipping_phone: shippingPhone,
                shipping_address: shippingAddress,
                delivery_status: 'pending' // Ready to ship
            }

            if (isCampaignProposal) {
                await updateProposal(proposalId, updateData)
            } else {
                await updateBrandProposal(proposalId, updateData)
            }

            setChatProposal((prev: any) => ({ ...prev, ...updateData }))

            // Notify Brand
            await sendMessage(brandId, "🚚 배송지 정보를 입력했습니다. 제품 발송 부탁드립니다!", isCampaignProposal ? proposalId : undefined, isCampaignProposal ? undefined : proposalId)

            alert("배송지 정보가 저장되었습니다.")
        } catch (e) {
            console.error("Shipping info save failed:", e)
            alert("저장 중 오류가 발생했습니다.")
        } finally {
            setIsSavingShipping(false)
        }
    }

    // Profile Edit States
    const [editName, setEditName] = useState("")
    const [editBio, setEditBio] = useState("")
    const [editHandle, setEditHandle] = useState("")
    const [editFollowers, setEditFollowers] = useState<string>("")
    const [editPhone, setEditPhone] = useState("")
    const [editAddress, setEditAddress] = useState("")
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    const [editPriceVideo, setEditPriceVideo] = useState("")
    const [editPriceFeed, setEditPriceFeed] = useState("")
    const [editSecondaryRights, setEditSecondaryRights] = useState(false)

    // Extended Rate Card (V1.6.21)
    const [editUsageRightsMonth, setEditUsageRightsMonth] = useState("")
    const [editUsageRightsPrice, setEditUsageRightsPrice] = useState("")
    const [editAutoDmMonth, setEditAutoDmMonth] = useState("")
    const [editAutoDmPrice, setEditAutoDmPrice] = useState("")

    const [isSaving, setIsSaving] = useState(false)

    // Apply Modal States
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
    const [selectedBrandProduct, setSelectedBrandProduct] = useState<any>(null) // New state for Brand Detail View
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
    const [isCampaignDetailOpen, setIsCampaignDetailOpen] = useState(false)
    const [appealMessage, setAppealMessage] = useState("")
    const [desiredCost, setDesiredCost] = useState("")
    const [isApplying, setIsApplying] = useState(false)

    const [showSuccessDialog, setShowSuccessDialog] = useState(false)

    // Shipping States
    const [shippingName, setShippingName] = useState("")
    const [shippingPhone, setShippingPhone] = useState("")
    const [shippingAddress, setShippingAddress] = useState("")
    const [shippingZip, setShippingZip] = useState("")
    const [isSavingShipping, setIsSavingShipping] = useState(false)
    const [activeProposalTab, setActiveProposalTab] = useState("chat") // Controlled tab state for Proposal Dialog

    // Content Submission States

    const [feedbackInput, setFeedbackInput] = useState("")
    const [isSendingFeedback, setIsSendingFeedback] = useState(false)

    // Load feedback when chat proposal changes
    useEffect(() => {
        if (!chatProposal) return

        const loadFeedback = async () => {
            const isCampaign = !!chatProposal.campaignId || chatProposal.type === 'creator_apply'
            await fetchSubmissionFeedback(
                isCampaign ? chatProposal.id.toString() : undefined,
                !isCampaign ? chatProposal.id.toString() : undefined
            )
        }
        loadFeedback()
    }, [chatProposal, fetchSubmissionFeedback])



    const handleContentSubmission = async () => {
        console.log('[CreatorUpload] handleContentSubmission triggered', { submissionFile, submissionUrl })
        if (!chatProposal) {
            console.error('[CreatorUpload] No chatProposal found')
            return
        }
        const fileToUpload = submissionFile

        if (!submissionUrl && !fileToUpload) {
            alert("링크 또는 파일을 입력해주세요.")
            return
        }

        setIsSubmittingContent(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'creator_apply'
            const proposalId = chatProposal.id?.toString()
            const brandId = isCampaignProposal ? chatProposal.campaign?.brand_id : chatProposal.brand_id

            let fileUrl = ""

            // Actual File Upload using XHR for progress tracking
            if (fileToUpload) {
                const fileExt = fileToUpload.name.split('.').pop()
                const fileName = `${proposalId}_v${Date.now()}.${fileExt}`
                const filePath = `submissions/${fileName}`

                console.log('Uploading file to:', filePath)

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

                console.log('File uploaded successfully. URL:', fileUrl)
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
                await updateBrandProposal(proposalId, updateData)
            }

            setChatProposal((prev: any) => ({ ...prev, ...updateData }))

            // Send automatic notification in feedback chat
            const notificationContent = isReuploading
                ? `🔄 작업물이 v${nextVersion} 버전으로 업데이트되었습니다. (이전 파일은 자동 삭제 처리됨)`
                : `✅ 새로운 작업물(v${nextVersion})이 제출되었습니다.`

            await sendSubmissionFeedback(
                isCampaignProposal ? proposalId : undefined,
                !isCampaignProposal ? proposalId : undefined,
                notificationContent
            )

            // Also send global message for brand visibility
            await sendMessage(brandId, notificationContent, isCampaignProposal ? proposalId : undefined, isCampaignProposal ? undefined : proposalId)

            // 🔔 Send notification to brand
            await sendNotification(
                brandId,
                `${user?.name}님이 콘텐츠를 제출했습니다.`,
                'content_submission',
                proposalId
            )

            // Refresh feedback list
            await fetchSubmissionFeedback(
                isCampaignProposal ? proposalId : undefined,
                !isCampaignProposal ? proposalId : undefined
            )

            alert(`작업물(v${nextVersion})이 제출되었습니다.`)
            setSubmissionUrl("")
            setSubmissionFile(null)
            setIsReuploading(false)
        } catch (e) {
            console.error("Submission failed:", e)
            alert("제출 중 오류가 발생했습니다.")
        } finally {
            setIsSubmittingContent(false)
            setUploadProgress(0)
        }
    }

    const handleSendFeedback = async () => {
        if (!chatProposal || !feedbackInput.trim() || isSendingFeedback) return

        setIsSendingFeedback(true)
        try {
            const isCampaign = !!chatProposal.campaignId || chatProposal.type === 'creator_apply'
            const isBrandProposal = !isCampaign

            const success = await sendSubmissionFeedback(
                isCampaign ? chatProposal.id.toString() : undefined,
                isBrandProposal ? chatProposal.id.toString() : undefined,
                feedbackInput.trim()
            )

            if (success) { // sendSubmissionFeedback returns void/promise<void> usually, wait, check impl
                setFeedbackInput("")
                await fetchSubmissionFeedback(
                    isCampaign ? chatProposal.id.toString() : undefined,
                    isBrandProposal ? chatProposal.id.toString() : undefined
                )
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
            const influencerMessages = messages.filter((m: any) => m.proposalId === chatProposal.id?.toString() || m.brandProposalId === chatProposal.id?.toString())

            const response = await fetch('/api/generate-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: influencerMessages,
                    proposal: chatProposal,
                    brandName: chatProposal.brand_name || "브랜드",
                    influencerName: user.name || "크리에이터"
                })
            })

            const data = await response.json()
            if (data.result) {
                setGeneratedContract(data.result)
            } else {
                alert("계약서 생성에 실패했습니다: " + (data.error || "알 수 없는 오류"))
            }
        } catch (e) {
            console.error(e)
            alert("계약서 생성 중 오류가 발생했습니다.")
        } finally {
            setIsGeneratingContract(false)
        }
    }

    const [productSearchQuery, setProductSearchQuery] = useState("")
    const [isFullContractOpen, setIsFullContractOpen] = useState(false)
    const [isSendingMessage, setIsSendingMessage] = useState(false)

    // Discovery States (for searching other moments)
    const [discoverTag, setDiscoverTag] = useState<string | null>(null)
    const [discoverFollowerFilter, setDiscoverFollowerFilter] = useState<string>("all")
    const [discoverSortOrder, setDiscoverSortOrder] = useState("latest")
    const [minFollowers, setMinFollowers] = useState<string>("")
    const [maxFollowers, setMaxFollowers] = useState<string>("")

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

    const handlePresetClick = (key: string) => {
        setDiscoverFollowerFilter(key)
        if (key === "all") {
            setMinFollowers("")
            setMaxFollowers("")
        } else if (key === "nano") {
            setMinFollowers("0")
            setMaxFollowers("10000")
        } else if (key === "micro") {
            setMinFollowers("10000")
            setMaxFollowers("100000")
        } else if (key === "growing") {
            setMinFollowers("100000")
            setMaxFollowers("300000")
        } else if (key === "mid") {
            setMinFollowers("300000")
            setMaxFollowers("500000")
        } else if (key === "macro") {
            setMinFollowers("500000")
            setMaxFollowers("1000000")
        } else if (key === "mega") {
            setMinFollowers("1000000")
            setMaxFollowers("")
        }
    }

    const getFilteredAndSortedEvents = () => {
        let result = [...events]
        if (discoverTag) {
            result = result.filter(e =>
                e.category === discoverTag ||
                e.tags.some(t => t.includes(discoverTag) || discoverTag.includes(t))
            )
        }
        if (minFollowers !== "" || maxFollowers !== "") {
            const min = minFollowers === "" ? 0 : parseInt(minFollowers)
            const max = maxFollowers === "" ? Infinity : parseInt(maxFollowers)
            result = result.filter(e => {
                const count = e.followers || 0
                return count >= min && count <= max
            })
        }
        if (discoverSortOrder === "followers_high") result.sort((a, b) => (b.followers || 0) - (a.followers || 0))
        if (discoverSortOrder === "latest") result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        return result
    }

    const discoverEvents = getFilteredAndSortedEvents()


    // ... existing state ...
    const [selectedMoment, setSelectedMoment] = useState<InfluencerEvent | null>(null)

    // ... existing useEffects ...

    // Notification Navigation Logic
    useEffect(() => {
        const proposalId = searchParams.get('proposalId')
        if (proposalId && !isLoading && isInitialized) {
            // Check Inbound (Brand Proposals) first
            const inbound = brandProposals.find(p => p.id === proposalId)
            if (inbound) {
                console.log('[NotificationNav] Found Inbound Proposal:', proposalId)
                setCurrentView('inbound_list')
                setChatProposal(inbound)
                setIsChatOpen(true)
                return
            }

            // Check Outbound (Campaign Applications)
            const outbound = campaignProposals.find(p => p.id === proposalId)
            if (outbound) {
                console.log('[NotificationNav] Found Outbound Proposal:', proposalId)
                setCurrentView('campaigns_list')
                // For campaign applications, we might need a different view state or just open chat if supported
                // Currently campaigns_list opens details. Let's try to open the chat associated with it if possible.
                // Or just highlight it. For now, swiching view is good.
                // If we have a way to open chat for outbound:
                // setChatProposal(outbound) // This depends on if chatProposal supports outbound types
            }
        }
    }, [searchParams, isLoading, isInitialized, brandProposals, campaignProposals])


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
                        brandProposals={brandProposals}
                        onClick={setSelectedMoment}
                    />
                ))}
            </div>
        )}
    </TabsContent>

    {/* Sync Profile Data to Edit Form */ }
    useEffect(() => {
        if (displayUser) {
            setEditName(displayUser.name || "")
            setEditBio(displayUser.bio || "")
            setEditHandle(displayUser.handle || "")
            setEditFollowers(displayUser.followers?.toString() || "")
            setEditPhone(displayUser.phone || "")
            setEditAddress(displayUser.address || "")
            setEditPriceVideo(displayUser.priceVideo?.toString() || "")
            setEditPriceFeed(displayUser.priceFeed?.toString() || "")
            setEditSecondaryRights(!!displayUser.secondaryRights)

            // Extended Rate Card Initialization
            setEditUsageRightsMonth(displayUser.usageRightsMonth?.toString() || "")
            setEditUsageRightsPrice(displayUser.usageRightsPrice?.toString() || "")
            setEditAutoDmMonth(displayUser.autoDmMonth?.toString() || "")
            setEditAutoDmPrice(displayUser.autoDmPrice?.toString() || "")

            setSelectedTags(displayUser.tags || [])
        }
    }, [displayUser, currentView])

    // Onboarding Check: Automatically show settings if crucial info is missing
    useEffect(() => {
        if (user && !isLoading && user.type === 'influencer') {
            // Only force settings if name or handle is truly missing
            const isMissingInfo = !user.handle || !user.name
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
            // We search in both brandProposals (offers) and proposals (applications)
            const targetId = proposalId.toString()
            const found = brandProposals.find((p: any) => p.id?.toString() === targetId)
                || campaignProposals.find((p: any) => p.id?.toString() === targetId)

            if (found) {
                setChatProposal(found)
                setIsChatOpen(true)
            }
        }
    }, [searchParams, brandProposals, campaignProposals])

    // Auth Check & Redirect
    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/')
        } else if (user && user.type === 'brand' && user.id !== 'guest_influencer') {
            router.push('/brand')
        }
    }, [isAuthLoading, user, router])

    // Loading State
    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-muted-foreground font-medium animate-pulse">데이터를 불러오는 중입니다...</p>
                </div>
            </div>
        )
    }
    // if (!user) return null // Allow guest view



    const handleSaveProfile = async () => {
        setIsSaving(true)
        try {
            await updateUser({
                name: editName,
                bio: editBio,
                handle: editHandle,
                followers: parseInt(editFollowers) || 0,
                tags: selectedTags,
                phone: editPhone,
                address: editAddress,
                priceVideo: parseInt(editPriceVideo) || 0,
                priceFeed: parseInt(editPriceFeed) || 0,
                secondaryRights: editSecondaryRights ? 1 : 0,

                // Extended Rate Card Persistence
                usageRightsMonth: parseInt(editUsageRightsMonth) || 0,
                usageRightsPrice: parseInt(editUsageRightsPrice) || 0,
                autoDmMonth: parseInt(editAutoDmMonth) || 0,
                autoDmPrice: parseInt(editAutoDmPrice) || 0
            })
            setShowSuccessDialog(true)
        } catch (e) {
            console.error("Save profile error:", e)
            alert("프로필 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
        } finally {
            setIsSaving(false)
        }
    }


    const handleStatusUpdate = async (proposalId: string, status: string) => {
        if (isUpdatingStatus) return
        setIsUpdatingStatus(true)

        try {
            console.log(`[handleStatusUpdate] Updating proposal ${proposalId} to ${status}`)
            const success = await updateBrandProposal(proposalId, status)
            if (!success) {
                setIsUpdatingStatus(false)
                return
            }

            // Immediately update local UI state (chatProposal)
            if (chatProposal && chatProposal.id === proposalId) {
                setChatProposal((prev: any) => prev ? { ...prev, status } : prev)
            }

            if (status === 'accepted' || status === 'pending') {
                setIsChatOpen(true)

                // Try to find the proposal to get brand_id for messaging
                const proposal = brandProposals.find((p: any) => p.id === proposalId)
                    || (chatProposal?.id === proposalId ? chatProposal : null)

                if (proposal) {
                    if (!chatProposal) {
                        setChatProposal({ ...proposal, status })
                    }

                    // Send notification/message to brand
                    if (status === 'accepted') {
                        // Pass proposal.id as 4th argument (brandProposalId)
                        await sendMessage(proposal.brand_id, `✅ [시스템 알림] 크리에이터가 협업 제안을 수락했습니다! 대화를 시작해보세요.`, undefined, proposal.id)

                        // Force refresh so the list updates (moving from inbound to active)
                        await refreshData()

                        // Auto-switch to Active Tab & Workstation View
                        setWorkspaceTab('active')
                        setCurrentView('proposals')

                        // Auto-send Rate Card
                        if (user) {
                            const rateCardData = {
                                priceVideo: user.priceVideo,
                                priceFeed: user.priceFeed,
                                usageRightsPrice: user.usageRightsPrice,
                                usageRightsMonth: user.usageRightsMonth,
                                autoDmPrice: user.autoDmPrice,
                                autoDmMonth: user.autoDmMonth
                            };
                            const rateCardMsg = `[RATE_CARD_JSON]${JSON.stringify(rateCardData)}`;

                            // Send rate card slightly after the system message
                            setTimeout(async () => {
                                const brandName = proposal.brand_name || '브랜드';
                                const greetingMsg = `안녕하세요 '${brandName}'님. 좋은 협업 제안 요청주셔서 감사합니다.\n아래에 저의 예상단가를 보내드립니다.`;
                                try {
                                    await sendMessage(proposal.brand_id, greetingMsg, undefined, proposal.id);
                                    await sendMessage(proposal.brand_id, rateCardMsg, undefined, proposal.id)
                                } catch (e) {
                                    console.error("Failed to auto-send rate card:", e);
                                }
                            }, 500)
                        }

                        alert("제안을 수락했습니다. 이제 워크스페이스에서 브랜드와 대화할 수 있습니다.")
                    } else if (status === 'pending') {
                        await sendMessage(proposal.brand_id, `⏳ [시스템 알림] 크리에이터가 제안을 확인했으며, 현재 검토(보류) 중입니다.`, undefined, proposal.id)
                        alert("제안을 보류 처리했습니다. 나중에 다시 수락할 수 있습니다.")
                    }
                }
            } else if (status === 'rejected') {
                alert("제안을 거절했습니다.")
                await refreshData()
            }
        } catch (e) {
            console.error("Status update error:", e)
            alert("업데이트 중 오류가 발생했습니다. 다시 시도해주세요.")
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const handleReject = async (proposal: any) => {
        if (!confirm('정말 이 제안을 거절하시겠습니까?')) return

        try {
            // Update status to rejected
            await updateBrandProposal(proposal.id, 'rejected')

            // UI Update
            setChatProposal((prev: any) => prev ? { ...prev, status: 'rejected' } : prev)

            // Send polite rejection message
            await sendMessage(proposal.brand_id, `안녕하세요 ${proposal.brand_name}님, 제안 주셔서 감사합니다.\n아쉽게도 현재 제 일정 및 상황상 참여가 어려울 것 같습니다. 😢\n다음에 더 좋은 기회로 뵙기를 희망합니다!`, undefined, proposal.id)

            // Force refresh so the list updates (moving to rejected)
            await refreshData()

            alert('제안을 거절했습니다.')
            setIsChatOpen(false)
        } catch (e) {
            console.error('Reject error:', e)
            alert('오류가 발생했습니다.')
        }
    }

    const renderProposalCard = (proposalId: string) => {
        const proposal = brandProposals?.find(p => p.id === proposalId)
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
                        <p className="font-bold text-emerald-600 font-mono">{proposal.compensation_amount}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">희망 채널</p>
                        <p className="font-medium">{proposal.content_type}</p>
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
            alert("수신인 정보를 찾을 수 없습니다.")
            return
        }

        const msgContent = chatMessage
        setChatMessage("")
        setIsSendingMessage(true)

        try {
            // Determine if it's a Campaign Application (proposals table) or Direct Offer (brand_proposals table)
            const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'creator_apply'

            if (isCampaignProposal) {
                await sendMessage(receiverId, msgContent, chatProposal.id?.toString(), undefined)
            } else {
                await sendMessage(receiverId, msgContent, undefined, chatProposal.id?.toString())
            }
        } catch (e) {
            console.error("Message send failed:", e)
            setChatMessage(msgContent)
        } finally {
            setIsSendingMessage(false)
        }
    }

    const filteredProposals = (status: string) => {
        if (!displayUser) return []
        if (status === 'new') return brandProposals?.filter(p => (!p.status || p.status === 'offered') && p.influencer_id === displayUser.id)
        if (status === 'applied') return brandProposals?.filter(p => p.status === 'applied' && p.influencer_id === displayUser.id)
        return brandProposals?.filter(p => p.status === status && p.influencer_id === displayUser.id)
    }





    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
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
                                        {displayUser?.handle && <span className="text-primary font-medium">{displayUser.handle}</span>}
                                    </div>
                                    <p className="text-muted-foreground">{displayUser?.bio || "아직 소개글이 없습니다."}</p>
                                </div>


                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                    <div className="p-4 bg-muted/50 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-primary">{displayUser?.followers?.toLocaleString() || 0}</div>
                                        <div className="text-xs text-muted-foreground">팔로워</div>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-primary">{myEvents.length}</div>
                                        <div className="text-xs text-muted-foreground">등록된 모먼트</div>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-emerald-600">{brandProposals?.filter((p: any) => p.status === 'accepted').length || 0}</div>
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
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">모먼트 둘러보기</h1>
                                <p className="text-muted-foreground mt-1">다른 크리에이터들은 어떤 모먼트를 공유하고 있는지 확인해보세요.</p>
                            </div>
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="gap-2">
                                            <Filter className="h-4 w-4" />
                                            {discoverSortOrder === "latest" ? "최신 등록순" : discoverSortOrder === "followers_high" ? "팔로워 많은순" : "정렬"}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>정렬 기준</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup value={discoverSortOrder} onValueChange={setDiscoverSortOrder}>
                                            <DropdownMenuRadioItem value="latest">최신 등록순</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="followers_high">팔로워 많은순</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Filters */}
                        <Card className="bg-background/50 backdrop-blur-sm shadow-none border-dashed">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                                    <span className="text-sm font-semibold w-24">팔로워 규모</span>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { k: "all", l: "전체" },
                                            { k: "nano", l: "나노 (<1만)" },
                                            { k: "micro", l: "마이크로 (1~10만)" },
                                            { k: "growing", l: "그로잉 (10~30만)" },
                                            { k: "mid", l: "미드 (30~50만)" },
                                            { k: "macro", l: "매크로 (50~100만)" },
                                            { k: "mega", l: "메가 (>100만)" }
                                        ].map(opt => (
                                            <Button
                                                key={opt.k}
                                                variant={discoverFollowerFilter === opt.k ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePresetClick(opt.k)}
                                                className="rounded-full h-8"
                                            >
                                                {opt.l}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 md:items-start">
                                    <span className="text-sm font-semibold w-24 pt-2">전문 분야</span>
                                    <div className="flex flex-wrap gap-2 flex-1">
                                        <Button
                                            variant={discoverTag === null ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setDiscoverTag(null)}
                                            className="h-8"
                                        >
                                            전체
                                        </Button>
                                        {POPULAR_TAGS.map(tag => (
                                            <Button
                                                key={tag}
                                                variant={discoverTag === tag ? "secondary" : "ghost"}
                                                size="sm"
                                                onClick={() => setDiscoverTag(discoverTag === tag ? null : tag)}
                                                className={`h-8 ${discoverTag === tag ? 'bg-primary/10 text-primary' : ''}`}
                                            >
                                                {tag}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {discoverEvents.map((item) => (
                                <Link key={item.id} href={`/event/${item.id}`} className="block group">
                                    <Card className="overflow-hidden transition-all hover:shadow-lg border-border/60 bg-background flex flex-col h-full cursor-pointer">
                                        <CardHeader className="pb-3 flex-row gap-3 items-start space-y-0">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold overflow-hidden">
                                                {item.avatar && item.avatar.startsWith('http') ? (
                                                    <img src={item.avatar} alt={item.influencer} className="h-full w-full object-cover" />
                                                ) : (
                                                    item.avatar || item.influencer?.[0]
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold truncate text-sm">{item.influencer}</h4>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">{item.handle}</p>
                                                <span className="text-[10px] font-medium bg-secondary/50 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                    {(item.followers || 0).toLocaleString()} 팔로워
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3 flex-1">
                                            <h3 className="font-bold text-sm line-clamp-2">{item.event}</h3>
                                            <div className="space-y-1 py-1">
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                    <Calendar className="h-3 w-3 shrink-0" />
                                                    <span className="font-medium text-foreground/80">일정:</span> {formatDateToMonth(item.eventDate)}
                                                </div>
                                                {item.postingDate && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                        <Send className="h-3 w-3 shrink-0" />
                                                        <span className="font-medium text-foreground/80">업로드:</span>
                                                        {item.dateFlexible ? (
                                                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 text-emerald-600 bg-emerald-50 border-emerald-100">협의가능</Badge>
                                                        ) : (
                                                            formatDateToMonth(item.postingDate)
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                    <Gift className="h-3 w-3 shrink-0" />
                                                    <span className="font-medium text-foreground/80">희망:</span> {item.targetProduct}
                                                </div>
                                            </div>
                                            <p className="text-xs text-foreground/70 line-clamp-2">{item.description}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {item.tags.slice(0, 2).map(t => (
                                                    <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{t}</span>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )
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

                        {/* Selected Moment Detail View */}
                        {selectedMomentId ? (
                            <div className="grid gap-6 md:grid-cols-[2fr_1fr] animate-in slide-in-from-bottom-4 duration-500">
                                {/* Left: Moment Details */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedMomentId(null)} className="h-8">
                                            <ChevronRight className="h-4 w-4 rotate-180 mr-1" /> 목록으로
                                        </Button>
                                    </div>
                                    {/* Find the selected moment */}
                                    {myMoments.find(e => e.id === selectedMomentId) && (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-emerald-600 border-emerald-100 bg-emerald-50">
                                                            {myMoments.find(e => e.id === selectedMomentId)?.category}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-xl font-bold">
                                                        {myMoments.find(e => e.id === selectedMomentId)?.event}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 bg-muted/30 rounded-xl space-y-1 text-center">
                                                    <div className="text-xs text-muted-foreground/70 flex items-center justify-center gap-1.5"><Calendar className="h-3 w-3" /> 일정</div>
                                                    <span className="font-semibold">
                                                        {myMoments.find(e => e.id === selectedMomentId)?.date}
                                                    </span>
                                                </div>
                                                <div className="p-3 bg-muted/30 rounded-xl space-y-1 text-center">
                                                    <div className="text-xs text-muted-foreground/70 flex items-center justify-center gap-1.5"><Package className="h-3 w-3" /> 희망 제품</div>
                                                    <span className="font-semibold">{myMoments.find(e => e.id === selectedMomentId)?.targetProduct}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="text-sm font-bold text-foreground">모먼트 소개</h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                    {myMoments.find(e => e.id === selectedMomentId)?.description}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Proposals List */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-primary" />
                                        도착한 제안
                                    </h3>
                                    <div className="space-y-3">
                                        {filteredProposalsByMoment.length > 0 ? (
                                            filteredProposalsByMoment.map((proposal: any) => (
                                                <Card
                                                    key={proposal.id}
                                                    className="p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                                                    onClick={() => {
                                                        setChatProposal(proposal)
                                                        setIsChatOpen(true)
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="font-bold text-sm truncate pr-2">
                                                            {proposal.brand_name || "익명 브랜드"}
                                                        </div>
                                                        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                                                            {new Date(proposal.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-emerald-600 mb-1">
                                                        {proposal.product_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        "{proposal.message}"
                                                    </p>
                                                    <div className="mt-3 text-xs w-full text-right text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                                        자세히 보기 →
                                                    </div>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 bg-muted/20 rounded-lg border-dashed border">
                                                <p className="text-sm text-muted-foreground">이 일정에 도착한 제안이 아직 없습니다.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <DashboardView
                                activeMoments={activeMoments}
                                myMoments={myMoments}
                                pastMoments={pastMoments}
                                outboundApplications={outboundApplications}
                                inboundProposals={inboundProposals}
                                allActive={allActive}
                                allCompleted={allCompleted}
                                setCurrentView={setCurrentView}
                                setSelectedMomentId={setSelectedMomentId}
                                setChatProposal={setChatProposal}
                                setIsChatOpen={setIsChatOpen}
                            />
                        )}
                    </div>
                )
            case "moments_list":
                return (
                    <MomentsView
                        activeMoments={activeMoments}
                        myMoments={myMoments}
                        pastMoments={pastMoments}
                        upcomingMoments={upcomingMoments}
                        brandProposals={allInboundProposals}
                        setCurrentView={setCurrentView}
                        handleOpenDetails={handleOpenDetails}
                        deleteEvent={deleteEvent}
                        updateEvent={updateEvent}
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
                        setChatProposal={setChatProposal}
                        setIsChatOpen={setIsChatOpen}
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
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">워크스페이스 아카이브</h1>
                                <p className="text-muted-foreground">브랜드와 진행 중인 모든 협업을 한곳에서 관리하세요.</p>
                            </div>
                            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                                <Button
                                    variant={workspaceViewMode === 'list' ? 'default' : 'ghost'}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setWorkspaceViewMode('list')}
                                    title="리스트형"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={workspaceViewMode === 'grid' ? 'default' : 'ghost'}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setWorkspaceViewMode('grid')}
                                    title="그리드형"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={workspaceViewMode === 'table' ? 'default' : 'ghost'}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setWorkspaceViewMode('table')}
                                    title="테이블형"
                                >
                                    <TableIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Tabs value={workspaceTab} onValueChange={setWorkspaceTab} className="w-full">
                            <TabsList className="flex flex-wrap h-auto w-full justify-start gap-2 bg-transparent p-0">
                                <TabsTrigger value="all" className="min-w-[130px] data-[state=active]:bg-slate-900 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full text-foreground/90 font-medium transition-all">
                                    전체 보기 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allWorkspaceItems.length}</span>
                                </TabsTrigger>
                                <TabsTrigger value="active" className="min-w-[120px] data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(16,185,129,0.6)] bg-background text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500/50 px-4 py-2 rounded-full font-medium transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                    진행중 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allActive.length}</span>
                                </TabsTrigger>
                                <TabsTrigger value="inbound" className="min-w-[130px] data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(59,130,246,0.6)] bg-background text-blue-700 dark:text-blue-400 border-2 border-blue-500/50 px-4 py-2 rounded-full transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                                    받은 제안 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{inboundProposals.length}</span>
                                </TabsTrigger>
                                <TabsTrigger value="outbound" className="min-w-[130px] data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(168,85,247,0.6)] bg-background text-purple-700 dark:text-purple-400 border-2 border-purple-500/50 px-4 py-2 rounded-full transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                    보낸 제안 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{outboundApplications.length}</span>
                                </TabsTrigger>
                                <TabsTrigger value="rejected" className="min-w-[120px] data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(239,68,68,0.6)] bg-background text-red-700 dark:text-red-400 border-2 border-red-500/50 px-4 py-2 rounded-full transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                                    거절됨 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{rejectedProposals.length}</span>
                                </TabsTrigger>
                                <TabsTrigger value="completed" className="min-w-[120px] data-[state=active]:bg-slate-400 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(148,163,184,0.6)] bg-background text-slate-700 dark:text-slate-400 border-2 border-slate-400/50 px-4 py-2 rounded-full transition-all hover:shadow-[0_0_15px_rgba(148,163,184,0.4)]">
                                    완료됨 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allCompleted.length}</span>
                                </TabsTrigger>
                            </TabsList>


                            {/* Tab 0: All Items */}
                            <TabsContent value="all" className="space-y-4 mt-6">
                                {renderSubTabs(allWorkspaceItems)}
                                {renderWorkspaceItems(filterByType(allWorkspaceItems, workspaceSubTab), 'all')}
                            </TabsContent>

                            {/* Tab 1: Active (In Progress) */}
                            <TabsContent value="active" className="space-y-4 mt-6">
                                {renderSubTabs(allActive)}
                                {renderWorkspaceItems(filterByType(allActive, workspaceSubTab), 'active')}
                            </TabsContent>

                            {/* Tab 2: Inbound Proposals (Received) - Moments only, no sub-tabs */}
                            <TabsContent value="inbound" className="space-y-4 mt-6">
                                {renderWorkspaceItems(inboundProposals, 'inbound')}
                            </TabsContent>

                            {/* Tab 3: Outbound Applications (Sent) */}
                            <TabsContent value="outbound" className="space-y-4 mt-6">
                                {renderSubTabs(outboundApplications)}
                                {renderWorkspaceItems(filterByType(outboundApplications, workspaceSubTab), 'outbound')}
                            </TabsContent>



                            {/* Tab 5: Completed */}
                            <TabsContent value="completed" className="space-y-4 mt-6">
                                {renderSubTabs(allCompleted)}
                                {renderWorkspaceItems(filterByType(allCompleted, workspaceSubTab), 'completed')}
                            </TabsContent>

                            {/* Tab 4: Rejected - Added Missing Tab Content */}
                            <TabsContent value="rejected" className="space-y-4 mt-6">
                                {renderSubTabs(rejectedProposals)}
                                {renderWorkspaceItems(filterByType(rejectedProposals, workspaceSubTab), 'rejected')}
                            </TabsContent>
                        </Tabs >
                    </div >
                )


            case "past_moments":
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')}>
                                <ChevronRight className="h-4 w-4 rotate-180" /> 돌아가기
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight">완료된 모먼트</h1>
                        </div>
                        <div className="grid gap-4">
                            {pastMoments.length === 0 ? (
                                <div className="text-center py-10 border rounded-lg border-dashed text-muted-foreground">
                                    완료된 모먼트가 없습니다.
                                </div>
                            ) : pastMoments.map((event) => (
                                <Card key={event.id} className="opacity-75">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{event.event}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                                <span className="font-medium">일정:</span> {event.eventDate || "미정"}
                                            </div>
                                            {event.postingDate && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Send className="h-3.5 w-3.5 text-primary" />
                                                    <span className="font-medium">업로드:</span>
                                                    {event.dateFlexible ? (
                                                        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5 text-emerald-600 bg-emerald-50 border-emerald-100">협의가능</Badge>
                                                    ) : (
                                                        event.postingDate
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-2 text-xs bg-muted/30 p-3 rounded-lg border border-border/50">
                                                <div className="flex items-center gap-2">
                                                    <Gift className="h-3.5 w-3.5 text-purple-500" />
                                                    <span className="text-muted-foreground shrink-0">희망 제품:</span>
                                                    <span className="font-medium truncate">{event.targetProduct || "미정"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                                    <Banknote className="h-3.5 w-3.5 text-blue-500" />
                                                    <span className="text-muted-foreground shrink-0">예상 단가:</span>
                                                    <span className="font-bold text-blue-600">{formatPriceRange(user?.price_video || 0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end pt-0 pb-4 pr-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm("모먼트를 다시 진행하시겠습니까? '내 모먼트' 탭으로 이동합니다.")) {
                                                    updateEvent(event.id, { status: "active" });
                                                }
                                            }}
                                        >
                                            진행하기
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                )

            case "notifications":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold tracking-tight">알림</h1>
                        <div className="space-y-2">
                            {notifications && notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div key={notif.id} className="p-4 bg-white dark:bg-card border rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                                        <div className={`w-2 h-2 mt-2 rounded-full ${notif.is_read ? "bg-gray-300" : "bg-red-500"}`}></div>
                                        <div>
                                            <p className="text-sm">{notif.content}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{new Date(notif.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                                    새로운 알림이 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                )
            case "settings":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold tracking-tight">프로필 설정</h1>
                        <Card className="max-w-2xl">
                            <CardHeader>
                                <CardTitle>기본 정보</CardTitle>
                                <CardDescription>브랜드에게 보여질 나의 프로필 정보를 수정합니다.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col items-center justify-center mb-6">
                                    <Label className="mb-2">프로필 이미지</Label>
                                    <AvatarUpload
                                        uid={user?.id || "creator"}
                                        url={user?.avatar}
                                        onUpload={async (url) => {
                                            await updateUser({ avatar: url })
                                        }}
                                        size={120}
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">클릭하여 이미지 변경</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">활동명 (닉네임)</Label>
                                    <Input
                                        id="name"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={(e) => setEditName(e.target.value)}
                                        autoComplete="off"
                                        placeholder="이름을 입력하세요"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="handle">핸들 (ID)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground">@</span>
                                        <Input
                                            id="handle"
                                            value={editHandle.replace(/^@/, '')} // Display without @
                                            onChange={(e) => {
                                                // Always save with @ internally
                                                const val = e.target.value.replace(/[^a-zA-Z0-9_.]/g, '') // Basic sanitization
                                                setEditHandle(`@${val}`)
                                            }}
                                            onBlur={(e) => {
                                                const val = e.target.value.replace(/[^a-zA-Z0-9_.]/g, '')
                                                setEditHandle(`@${val}`)
                                            }}
                                            autoComplete="off"
                                            placeholder="username"
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="followers">팔로워 수</Label>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            id="followers"
                                            type="number"
                                            value={editFollowers}
                                            onChange={(e) => setEditFollowers(e.target.value)}
                                            onBlur={(e) => setEditFollowers(e.target.value)}
                                            autoComplete="off"
                                            placeholder="Ex: 10000"
                                            className="max-w-[200px]"
                                        />
                                        <span className="text-sm text-muted-foreground">명</span>
                                        {editFollowers && (
                                            <Badge variant="secondary" className="ml-2">
                                                {(() => {
                                                    const count = parseInt(editFollowers) || 0
                                                    if (count <= 1000) return "스타터 (0~1천)"
                                                    if (count <= 10000) return "나노 (1천~1만)"
                                                    if (count <= 100000) return "마이크로 (1~10만)"
                                                    if (count <= 300000) return "그로잉 (10~30만)"
                                                    if (count <= 500000) return "미드 (30~50만)"
                                                    if (count <= 1000000) return "매크로 (50~100만)"
                                                    return "메가 (>100만)"
                                                })()}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        인스타그램, 유튜브 등 주요 채널의 팔로워 수를 입력해주세요.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">연락처</Label>
                                    <Input
                                        id="phone"
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                        onBlur={(e) => setEditPhone(e.target.value)}
                                        autoComplete="off"
                                        placeholder="010-0000-0000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">주소 (제품 수령)</Label>
                                    <Input
                                        id="address"
                                        value={editAddress}
                                        onChange={(e) => setEditAddress(e.target.value)}
                                        onBlur={(e) => setEditAddress(e.target.value)}
                                        autoComplete="off"
                                        placeholder="서울시 강남구..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">한줄 소개</Label>
                                    <Textarea
                                        id="bio"
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        onBlur={(e) => setEditBio(e.target.value)}
                                        autoComplete="off"
                                        placeholder="나를 표현하는 멋진 한마디를 적어주세요."
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="text-lg font-semibold">소셜 계정 연결</h3>
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Instagram 비즈니스 계정</p>
                                                <p className="text-xs text-muted-foreground">인사이트(도달수, 팔로워) 연동을 위해 필요합니다.</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => {
                                            alert("Facebook App ID가 설정되지 않아 실제 연결은 되지 않습니다. (구현 완료)");
                                            // In real implementation: call useInstagram().login()
                                        }}>
                                            연결하기
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="text-lg font-semibold">예상 단가표 (Rate Card)</h3>
                                    <p className="text-sm text-muted-foreground">브랜드에게 제안하고 싶은 콘텐츠 제작 단가를 입력해주세요. (협의 가능)</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price-video">숏폼 영상 (Reels/Shorts)</Label>
                                            <div className="relative">
                                                <Input
                                                    id="price-video"
                                                    type="number"
                                                    value={editPriceVideo}
                                                    onChange={(e) => setEditPriceVideo(e.target.value)}
                                                    className="pr-8"
                                                    placeholder="예: 150000"
                                                />
                                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">원</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                60초 이내의 숏폼 영상 제작 단가입니다.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="price-feed">피드 게시물 (Photo/Carousel)</Label>
                                            <div className="relative">
                                                <Input
                                                    id="price-feed"
                                                    type="number"
                                                    value={editPriceFeed}
                                                    onChange={(e) => setEditPriceFeed(e.target.value)}
                                                    className="pr-8"
                                                    placeholder="예: 100000"
                                                />
                                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">원</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                이미지 및 캐러셀 형태의 피드 게시물 단가입니다.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Extended Rate Card Section (Row 2) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* 2차 활용 (Usage Rights) */}
                                        <div className="space-y-2">
                                            <Label htmlFor="secondary-rights-price">2차 활용권 (Secondary Rights)</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="relative">
                                                    <Input
                                                        id="secondary-rights-month"
                                                        type="number"
                                                        value={editUsageRightsMonth}
                                                        onChange={(e) => setEditUsageRightsMonth(e.target.value)}
                                                        className="pr-8"
                                                        placeholder="기간"
                                                    />
                                                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">개월</span>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        id="secondary-rights-price"
                                                        type="number"
                                                        value={editUsageRightsPrice}
                                                        onChange={(e) => setEditUsageRightsPrice(e.target.value)}
                                                        className="pr-8"
                                                        placeholder="비용"
                                                    />
                                                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">원</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                브랜드가 콘텐츠를 광고 소재로 활용할 수 있는 기간과 비용을 설정하세요.
                                            </p>
                                        </div>

                                        {/* 자동 DM (Auto DM) */}
                                        <div className="space-y-2">
                                            <Label htmlFor="auto-dm-price">자동 DM (Auto Reply)</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="relative">
                                                    <Input
                                                        id="auto-dm-month"
                                                        type="number"
                                                        value={editAutoDmMonth}
                                                        onChange={(e) => setEditAutoDmMonth(e.target.value)}
                                                        className="pr-8"
                                                        placeholder="기간"
                                                    />
                                                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">개월</span>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        id="auto-dm-price"
                                                        type="number"
                                                        value={editAutoDmPrice}
                                                        onChange={(e) => setEditAutoDmPrice(e.target.value)}
                                                        className="pr-8"
                                                        placeholder="비용"
                                                    />
                                                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">원</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                게시물 댓글에 대해 자동으로 DM을 발송하는 기간과 추가 비용을 설정하세요.
                                            </p>
                                        </div>
                                    </div>
                                </div >
                                <div className="space-y-2">
                                    <Label>관심 태그 (전문 분야)</Label>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {POPULAR_TAGS.map(tag => (
                                            <Button
                                                key={tag}
                                                type="button"
                                                variant={selectedTags.includes(tag) ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => toggleTag(tag)}
                                                className={`rounded-full transition-all ${selectedTags.includes(tag) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                {tag}
                                            </Button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground pt-1">
                                        선택된 태그: {selectedTags.length > 0 ? selectedTags.join(", ") : "없음"}
                                    </p>
                                </div>
                            </CardContent >
                            <CardFooter>
                                <Button onClick={handleSaveProfile} disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    저장하기
                                </Button>
                            </CardFooter>
                        </Card >

                        <Card className="max-w-2xl border-red-100 bg-red-50/10">
                            <CardHeader>
                                <CardTitle className="text-red-600 flex items-center gap-2">
                                    계정 유형 전환
                                </CardTitle>
                                <CardDescription>
                                    브랜드 계정으로 전환하시겠습니까? 계정 유형을 변경하면 브랜드 전용 대시보드를 사용하게 됩니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground mb-4">
                                    * 전환 후에도 기존 크리에이터 정보는 유지되지만, 대시보드 인터페이스가 브랜드용으로 변경됩니다.
                                </p>
                                <Button
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                    onClick={async () => {
                                        if (confirm("정말로 브랜드 계정으로 전환하시겠습니까?")) {
                                            await switchRole('brand');
                                        }
                                    }}
                                >
                                    브랜드 계정으로 전환하기
                                </Button>
                            </CardContent>
                        </Card>

                        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>저장 완료</DialogTitle>
                                    <DialogDescription>
                                        프로필 정보가 성공적으로 업데이트되었습니다.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button onClick={() => {
                                        setShowSuccessDialog(false)
                                        setCurrentView("dashboard")
                                    }}>
                                        확인
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div >
                )
            case "discover-products":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">브랜드 제품 둘러보기</h1>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    마음에 들면 광고나 공구를 먼저 제안해보세요.
                                </p>
                            </div>
                            <div className="flex w-full max-w-md items-center space-x-2">
                                <Button
                                    variant={favoritesOnly ? "secondary" : "outline"}
                                    size="icon"
                                    onClick={() => setFavoritesOnly(!favoritesOnly)}
                                    className={favoritesOnly ? "bg-yellow-100 text-yellow-600 border-yellow-200 hover:bg-yellow-200" : "text-muted-foreground"}
                                    title="즐겨찾기만 보기"
                                >
                                    <Star className={`h-4 w-4 ${favoritesOnly ? "fill-current" : ""}`} />
                                </Button>
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="브랜드, 제품명 검색"
                                        className="pl-9"
                                        value={productSearchQuery}
                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg shrink-0">
                                    <Button
                                        variant={productViewMode === 'list' ? 'default' : 'ghost'}
                                        size="icon"
                                        className="h-9 w-9"
                                        onClick={() => setProductViewMode('list')}
                                        title="리스트형"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={productViewMode === 'grid' ? 'default' : 'ghost'}
                                        size="icon"
                                        className="h-9 w-9"
                                        onClick={() => setProductViewMode('grid')}
                                        title="그리드형"
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <Card className="p-20 text-center border-dashed bg-muted/20">
                                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground">검색 결과가 없습니다.</h3>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {productViewMode === 'grid' ? (
                                    <BrandProductDiscoveryView
                                        products={filteredProducts}
                                        handleViewGuide={(p) => {
                                            if (p.link) window.open(p.link, '_blank');
                                        }}
                                        handlePropose={(p) => {
                                            setSelectedProductId(String(p.id));
                                            setCurrentView("product-detail");
                                        }}
                                    />
                                ) : (
                                    <BrandProductListView
                                        products={filteredProducts}
                                        handleViewGuide={(p) => {
                                            if (p.link) window.open(p.link, '_blank');
                                        }}
                                        handlePropose={(p) => {
                                            setSelectedProductId(String(p.id));
                                            setCurrentView("product-detail");
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
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
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">브랜드 캠페인 둘러보기</h1>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        브랜드가 등록한 캠페인을 확인하고 지원해보세요.
                                    </p>
                                </div>
                                <div className="bg-muted p-1 rounded-lg flex items-center gap-1 overflow-x-auto max-w-[calc(100vw-40px)] scrollbar-hide">
                                    <Button
                                        variant={designOption === 'A' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setDesignOption('A')}
                                        className="text-xs h-7 whitespace-nowrap"
                                    >
                                        A: 브랜드(세로)
                                    </Button>
                                    <Button
                                        variant={designOption === 'D' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setDesignOption('D')}
                                        className="text-xs h-7 whitespace-nowrap"
                                    >
                                        D: 브랜드(가로)
                                    </Button>
                                    <Button
                                        variant={designOption === 'B' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setDesignOption('B')}
                                        className="text-xs h-7 whitespace-nowrap"
                                    >
                                        B: 비주얼
                                    </Button>
                                    <Button
                                        variant={designOption === 'C' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setDesignOption('C')}
                                        className="text-xs h-7 whitespace-nowrap"
                                    >
                                        C: 네모카드
                                    </Button>
                                    <Button
                                        variant={designOption === 'E' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setDesignOption('E')}
                                        className="text-xs h-7 whitespace-nowrap"
                                    >
                                        E: 리스트
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {campaigns.filter(c => c.status !== 'closed').length === 0 ? (
                            <Card className="p-20 text-center border-dashed bg-muted/20">
                                <Megaphone className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground">등록된 캠페인이 없습니다.</h3>
                            </Card>
                        ) : (
                            <div className={`grid gap-6 ${['D', 'E'].includes(designOption) ? 'grid-cols-1' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
                                {campaigns.filter(c => c.status !== 'closed').map((camp) => (
                                    <div key={camp.id} className={['D', 'E'].includes(designOption) ? 'w-full' : ''}>
                                        {designOption === 'A' && (
                                            <CampaignCardA
                                                campaign={camp}
                                                onClick={() => {
                                                    setSelectedCampaign(camp);
                                                    setIsCampaignDetailOpen(true);
                                                }}
                                                onApply={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    handleApplyClick(camp);
                                                }}
                                            />
                                        )}
                                        {designOption === 'B' && (
                                            <CampaignCardB
                                                campaign={camp}
                                                onClick={() => {
                                                    setSelectedCampaign(camp);
                                                    setIsCampaignDetailOpen(true);
                                                }}
                                                onApply={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    handleApplyClick(camp);
                                                }}
                                            />
                                        )}
                                        {designOption === 'C' && (
                                            <CampaignCardC
                                                campaign={camp}
                                                onClick={() => {
                                                    setSelectedCampaign(camp);
                                                    setIsCampaignDetailOpen(true);
                                                }}
                                                onApply={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    handleApplyClick(camp);
                                                }}
                                            />
                                        )}
                                        {designOption === 'D' && (
                                            <CampaignCardD
                                                campaign={camp}
                                                onClick={() => {
                                                    setSelectedCampaign(camp);
                                                    setIsCampaignDetailOpen(true);
                                                }}
                                                onApply={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    handleApplyClick(camp);
                                                }}
                                            />
                                        )}
                                        {designOption === 'E' && (
                                            <CampaignCardE
                                                campaign={camp}
                                                onClick={() => {
                                                    setSelectedCampaign(camp);
                                                    setIsCampaignDetailOpen(true);
                                                }}
                                                onApply={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    handleApplyClick(camp);
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            default:
                return null
        }
    }




    const handleApplyClick = (campaign: any) => {
        setSelectedCampaign(campaign)
        setAppealMessage("") // Reset general message
        setDesiredCost("")
        setMotivation("")
        setContentPlan("")
        setPortfolioLinks("")
        setInstagramHandle(user?.handle || "") // Pre-fill handle if available
        setInsightFile(null)
        setIsApplyDialogOpen(true)
    }

    const handleProductApply = (product: any) => {
        const mockCampaign = {
            id: product.id,
            brand: product.brandName || "Unknown Brand",
            product: product.name,
            budget: product.price ? `${product.price.toLocaleString()}원` : "협의",
        }
        handleApplyClick(mockCampaign)
    }

    const handleDownloadContract = () => {
        if (!chatProposal?.contract_content) {
            alert("계약서 내용이 없습니다.")
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
                                            <p><strong>을 (크리에이터):</strong> ${chatProposal?.influencer_name || user?.name || 'Creator'}</p>
                                            ${chatProposal?.influencer_signature ? `<img src="${chatProposal.influencer_signature}" class="sign-img" />` : '<p>(서명 없음)</p>'}
                                            <p><small>${chatProposal?.influencer_signed_at ? new Date(chatProposal.influencer_signed_at).toLocaleDateString() : ''}</small></p>
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
    const handleSubmitApplication = async () => {
        if (!instagramHandle || !motivation || !contentPlan) {
            alert("활동 계정, 지원 동기, 콘텐츠 제작 계획은 필수 입력 항목입니다.")
            return
        }

        setIsApplying(true)
        try {
            const { createClient } = await import('@/lib/supabase/client') // Client-side upload

            let insightUrl = null;
            if (insightFile) {
                const supabase = createClient()
                const fileExt = insightFile.name.split('.').pop()
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
                const filePath = `insights/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('campaigns')
                    .upload(filePath, insightFile)

                if (uploadError) {
                    throw new Error(`이미지 업로드 실패: ${uploadError.message}`)
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('campaigns')
                    .getPublicUrl(filePath)

                insightUrl = publicUrl
            }

            const priceOffer = desiredCost ? parseInt(desiredCost.replace(/[^0-9]/g, '')) : undefined
            const pLinks = portfolioLinks.split('\n').map(l => l.trim()).filter(Boolean)

            // Use addProposal from PlatformProvider instead of server action
            await addProposal({
                campaignId: selectedCampaign.id,
                message: appealMessage,
                motivation: motivation,
                contentPlan: contentPlan,
                portfolioLinks: pLinks,
                instagramHandle: instagramHandle,
                insightScreenshot: insightUrl || undefined,
                priceOffer: priceOffer,
                type: 'creator_apply',
                status: 'offered'
            })

            alert("지원서가 성공적으로 발송되었습니다!")
            setIsApplyDialogOpen(false)

        } catch (error: any) {
            console.error("Application error:", error)
            alert(`지원 중 오류가 발생했습니다: ${error.message}`)
        } finally {
            setIsApplying(false)
        }
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
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                    {/* Mobile Menu Button - Show only on mobile */}
                    <div className="lg:hidden flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold">크리에이터 대시보드</h1>
                        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[280px] p-0">
                                <div className="flex flex-col h-full">
                                    <SheetHeader className="p-4 border-b">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
                                                <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h2 className="font-bold">{user?.name || "사용자"}</h2>
                                                <p className="text-xs text-muted-foreground">{user?.handle || "핸들 없음"}</p>
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
                                        <div className="my-2 border-t" />
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
                                    </nav>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Sidebar ... */}

                    {/* ... skipping sidebar code ... */}
                    <aside className="hidden lg:flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-2 py-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
                                <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-bold">{user?.name || "사용자"}</h2>
                                <p className="text-xs text-muted-foreground">{user?.handle || "핸들 없음"}</p>
                            </div>
                        </div>
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
                            <Button
                                variant={currentView === "discover-campaigns" ? "secondary" : "ghost"}
                                className="w-full justify-start text-primary font-medium"
                                onClick={() => setCurrentView("discover-campaigns")}
                            >
                                <Megaphone className="mr-2 h-4 w-4" /> 브랜드 캠페인 둘러보기
                            </Button>
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
                            <div className="my-2 border-t" />
                            <Button
                                variant={currentView === "settings" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("settings")}
                            >
                                <Settings className="mr-2 h-4 w-4" /> 프로필 관리
                            </Button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    {renderContent()}

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
                        onApply={handleApplyClick}
                    />

                    <ApplyDialog
                        open={isApplyDialogOpen}
                        onOpenChange={setIsApplyDialogOpen}
                    />

                    {/* Workspace Dialog (Mobile & Desktop Unified) */}
                    <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                        <DialogContent className="max-w-[100vw] h-[100dvh] sm:max-w-[1500px] sm:w-[95vw] sm:h-[90vh] sm:max-h-[900px] p-0 gap-0 overflow-hidden flex flex-col bg-background border-0 shadow-2xl sm:rounded-2xl">
                            <DialogTitle className="sr-only">Creator Workspace</DialogTitle>
                            <CreatorWorkspaceLayout />
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
                        if (confirm("정말 이 모먼트를 삭제하시겠습니까? 복구할 수 없습니다.")) {
                            deleteEvent(id);
                            setIsDetailsModalOpen(false);
                        }
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
1. '갑'은 '을'에게 콘텐츠 제작의 대가로 금 ${chatProposal?.compensation_amount || '0'}을 지급한다.
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
            <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>전자 서명 (Electronic Signature)</DialogTitle>
                        <DialogDescription>
                            계약서에 첨부될 서명을 아래 영역에 그려주세요. 법적 서명란에 자동 삽입됩니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="border-2 border-dashed border-slate-300 rounded-xl bg-muted/30 overflow-hidden relative group">
                            <SignatureCanvas
                                ref={sigCanvas}
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
                                    handleProductApply(selectedBrandProduct);
                                    setSelectedBrandProduct(null);
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

            {/* Moment Detail Dialog */}
            <Dialog open={!!selectedMoment} onOpenChange={(open) => !open && setSelectedMoment(null)}>
                <DialogContent className="max-w-md md:max-w-2xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>모먼트 상세</DialogTitle>
                        <DialogDescription>
                            해당 모먼트의 상세 정보와 도착한 제안 목록입니다.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedMoment && (
                        <div className="space-y-6">
                            {/* Moment Info */}
                            <div className="space-y-4">
                                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                                    {selectedMoment.targetProduct ? (
                                        <div className="text-center p-4">
                                            <div className="text-4xl mb-2">📸</div>
                                            <p className="text-sm font-medium text-foreground">{selectedMoment.title}</p>
                                        </div>
                                    ) : (
                                        <span className="text-4xl">✨</span>
                                    )}
                                    {selectedMoment.status === 'completed' && (
                                        <div className="absolute top-2 right-2 bg-slate-800/80 text-white text-xs px-2 py-1 rounded-full">
                                            완료됨
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{selectedMoment.title}</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <Badge variant="secondary">{selectedMoment.category}</Badge>
                                        {selectedMoment.tags.map(tag => (
                                            <Badge key={tag} variant="outline" className="text-[10px]">#{tag}</Badge>
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap leading-relaxed">
                                        {selectedMoment.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                                    <div>
                                        <span className="text-muted-foreground block text-xs mb-1">희망 일정</span>
                                        <span className="font-medium">{selectedMoment.eventDate || '미정'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-xs mb-1">업로드 희망</span>
                                        <span className="font-medium">
                                            {selectedMoment.dateFlexible ? (
                                                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5 text-emerald-600 bg-emerald-50 border-emerald-100">협의가능</Badge>
                                            ) : (
                                                selectedMoment.postingDate || '미정'
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Linked Proposals */}
                            <div>
                                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center">
                                    📥 도착한 제안 <Badge className="ml-2 bg-indigo-600 hover:bg-indigo-700">{allInboundProposals.filter(p => p.event_id === selectedMoment.id).length}건</Badge>
                                </h4>

                                <div className="space-y-3">
                                    {allInboundProposals.filter(p => p.event_id === selectedMoment.id).length > 0 ? (
                                        allInboundProposals.filter(p => p.event_id === selectedMoment.id).map(proposal => (
                                            <div
                                                key={proposal.id}
                                                className="bg-white border hover:border-indigo-500 rounded-lg p-4 transition-all cursor-pointer shadow-sm hover:shadow-md group"
                                                onClick={() => {
                                                    setChatProposal(proposal)
                                                    setIsChatOpen(true)
                                                    setSelectedMoment(null)
                                                }}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarImage src={proposal.brand_avatar} />
                                                            <AvatarFallback>{proposal.brand_name?.substring(0, 2)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-bold text-foreground">{proposal.brand_name || '브랜드'}</p>
                                                            <p className="text-[10px] text-muted-foreground">{new Date(proposal.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant={proposal.status === 'accepted' ? 'default' : 'secondary'}>
                                                        {proposal.status === 'offered' ? '제안옴' :
                                                            proposal.status === 'accepted' ? '진행중' :
                                                                proposal.status === 'rejected' ? '거절됨' : proposal.status}
                                                    </Badge>
                                                </div>

                                                <div className="flex gap-3 mt-3">
                                                    {proposal.product && (
                                                        <div className="w-12 h-12 rounded bg-muted/30 flex-shrink-0 border flex items-center justify-center overflow-hidden">
                                                            {proposal.product.image_url ? (
                                                                <img src={proposal.product.image_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package className="w-5 h-5 text-slate-300" />
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate">{proposal.product_name}</p>
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{proposal.message}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex justify-end">
                                                    <Button size="sm" variant="outline" className="text-xs h-7 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200">
                                                        제안 확인하기 <ArrowRight className="w-3 h-3 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                                            <p className="text-muted-foreground text-sm">아직 이 모먼트에 도착한 제안이 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
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
                                .from('brand_proposals')
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
                                .from('brand_proposals')
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
                currentUserId={user?.id}
            />

            {/* Confirm Dialog for Accept/Reject Actions */}
            {confirmDialog && (
                <ConfirmDialog
                    open={confirmDialog.open}
                    onOpenChange={(open) => !open && setConfirmDialog(null)}
                    title={confirmDialog.title}
                    description={confirmDialog.description}
                    onConfirm={confirmDialog.onConfirm}
                    variant={confirmDialog.variant}
                />
            )}
        </div>
    )
}

export default function CreatorDashboardPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>}>
            <InfluencerDashboardContent />
        </Suspense>
    )
}
