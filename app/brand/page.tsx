"use client"

import React from "react"
import { Camera, Image as ImageIcon, Save, AlertCircle, Calculator } from "lucide-react" // Explicit import for debugging
import { WorkspaceProgressBar } from "@/components/workspace-progress-bar"
import { RateCardMessage } from "@/components/chat/rate-card-message"
import { BrandWorkspaceLayout } from "@/components/workspace/brand/layout";
import { useWorkspaceStore } from "@/components/workspace/hooks/use-workspace-store";
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn, formatDateToMonth } from "@/lib/utils"
import { AIPriceCalculator } from "@/components/ai-price-calculator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
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
import {
    BadgeCheck,
    CheckCircle2,
    Calendar,
    FileText,
    Filter,
    MapPin,
    Settings,
    Package,
    Send,
    X,
    Trash2,
    Pencil,
    Search,
    Bell,
    Plus,
    ArrowRight,
    Loader2,
    Globe,
    Info,
    ShoppingBag,

    ExternalLink,
    Upload,
    Gift,
    Star,
    Briefcase,
    Link as LinkIcon,
    AtSign,
    Hash,
    MoreVertical,
    MessageSquare,
    Check,
    Clock,
    Megaphone,
    Download,
    ChevronRight,
    Menu,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SignatureCanvas from 'react-signature-canvas'
import Link from "next/link"
import { ProductDetailView } from "@/components/dashboard/product-detail-view"
import { useEffect, useState, Suspense, useRef, useCallback } from "react"
import { MOCK_BRAND_USER } from "@/components/providers/legacy-platform-hook"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { AvatarUpload } from "@/components/ui/avatar-upload"

// Brand View Components
import { BrandProfileView } from "@/components/brand/views/BrandProfileView"
import { MyProductsView } from "@/components/brand/views/MyProductsView"
import { DiscoverView } from "@/components/brand/views/DiscoverView"
import { MyCampaignsView } from "@/components/brand/views/MyCampaignsView"
import { WorkspaceView } from "@/components/brand/views/WorkspaceView"
import { ReadonlyProposalDialog } from "@/components/proposal/readonly-proposal-dialog"

const POPULAR_TAGS = [
    "✈️ 여행", "💄 뷰티", "👗 패션", "🍽️ 맛집",
    "🏡 리빙/인테리어", "💍 웨딩/결혼", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
    "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
    "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
]

function BrandDashboardContent() {

    const {
        events, user, resetData, isLoading, campaigns, deleteCampaign,
        brandProposals, updateBrandProposal, deleteBrandProposal, sendMessage, messages,
        submissionFeedback: contextSubmissionFeedback, fetchSubmissionFeedback, sendSubmissionFeedback,
        updateUser, products, addProduct, updateProduct, deleteProduct, deleteEvent, supabase, createBrandProposal,
        switchRole, campaignProposals, updateCampaignStatus, updateProposal, notifications, sendNotification, refreshData,
        favorites, toggleFavorite,

        allEvents, fetchAllEvents, isAuthLoading, deleteMomentProposal // New: Public events & Moment deletion
    } = useUnifiedProvider()

    // AI Calculator State
    const [showCalculator, setShowCalculator] = useState(false)

    // Fetch public events for discovery on mount
    useEffect(() => {
        fetchAllEvents() // Fetch public events for discovery
    }, [])

    const displayUser = user

    const router = useRouter()
    const searchParams = useSearchParams()

    const initialViewRaw = searchParams.get('view') || "discover"
    const initialView = initialViewRaw === "dashboard" ? "my-campaigns" : initialViewRaw
    const [currentView, setCurrentView] = useState(initialView)
    const [sortOrder, setSortOrder] = useState("latest")

    // Filter Query States
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [followerFilter, setFollowerFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all") // all, upcoming, past, favorites
    const [minFollowers, setMinFollowers] = useState<string>("")
    const [maxFollowers, setMaxFollowers] = useState<string>("")


    // Collaboration Workspace State
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [chatProposal, setChatProposal] = useState<any>(null)
    const [chatMessage, setChatMessage] = useState("")
    const [generatedContract, setGeneratedContract] = useState("")
    const [isGeneratingContract, setIsGeneratingContract] = useState(false)
    const [isSendingContract, setIsSendingContract] = useState(false)
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


    // Refs for auto-scrolling
    const workspaceChatRef = useRef<HTMLDivElement>(null)
    const workFeedbackChatRef = useRef<HTMLDivElement>(null)

    // Auto-scroll for Main Workspace Chat
    useEffect(() => {
        if (workspaceChatRef.current) {
            workspaceChatRef.current.scrollTop = workspaceChatRef.current.scrollHeight
        }
    }, [messages, isChatOpen, workspaceTab])

    // Fetch Feedback History when Chat Opens
    useEffect(() => {
        if (chatProposal) {
            const isCampaign = !!chatProposal?.campaignId || (chatProposal as any)?.type === 'creator_apply'
            const pId = chatProposal.id.toString()
            console.log('[Brand] Fetching feedback for:', pId, 'isCampaign:', isCampaign)
            fetchSubmissionFeedback(pId, !isCampaign)
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
        // Background data (isLoading) might still be fetching.
        if (isAuthLoading) return;

        if (proposalId && !chatProposal) {
            console.log("[Brand] Checking URL proposalId:", proposalId)

            // Search in brandProposals (Direct Offers)
            let target = brandProposals.find((p: any) => p.id === proposalId)

            // Search in campaigns (Applications)
            if (!target) {
                // Flatten all proposals from campaigns
                for (const campaign of campaigns) {
                    const anyCampaign = campaign as any
                    if (anyCampaign.proposals) {
                        const found = anyCampaign.proposals.find((p: any) => p.id === proposalId)
                        if (found) {
                            target = found
                            break
                        }
                    }
                }
            }

            if (target) {
                console.log("[Brand] Auto-opening proposal:", target)
                setChatProposal(target)
                setIsChatOpen(true)
            }
        }
    }, [searchParams, brandProposals, campaigns, isAuthLoading, chatProposal])

    // Fetch Messages when Chat Opens, workspaceTab])

    // Auto-scroll for Work Feedback Chat
    useEffect(() => {
        if (workFeedbackChatRef.current) {
            workFeedbackChatRef.current.scrollTop = workFeedbackChatRef.current.scrollHeight
        }
    }, [contextSubmissionFeedback, isChatOpen, activeProposalTab])

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

    // Sync contract content from proposal when loaded or switched
    useEffect(() => {
        if (chatProposal?.contract_content) {
            setGeneratedContract(chatProposal.contract_content)
        } else {
            setGeneratedContract("")
        }
    }, [chatProposal])

    const handleSendFeedback = async () => {
        if (!feedbackMsg.trim() || !chatProposal || !user || isSendingFeedback) return
        setIsSendingFeedback(true)
        try {
            const isCampaign = !!chatProposal?.campaignId || (chatProposal as any).type === 'creator_apply'
            const isBrandProposal = !isCampaign;
            const success = await sendSubmissionFeedback(
                chatProposal.id.toString(),
                isBrandProposal,
                user!.id,
                feedbackMsg
            )

            if (success) {
                setFeedbackMsg("")
                setIsSendingFeedback(false)
                await fetchSubmissionFeedback(chatProposal.id.toString(), isBrandProposal)

                // 🔔 Send notification to influencer
                await sendNotification(
                    chatProposal.influencer_id,
                    `${user?.name}님이 피드백을 남겼습니다.`,
                    'feedback_received',
                    chatProposal.id.toString()
                )
            } else {
                setIsSendingFeedback(false)
            }
        } catch (e) {
            console.error("Feedback error:", e)
        }
    }

    // Effect to fetch feedback when work tab is visited
    useEffect(() => {
        if (activeProposalTab === 'work' && chatProposal?.id) { // Only fetch feedback if we have a valid proposal ID
            const isCampaign = !!chatProposal?.campaignId || (chatProposal as any)?.type === 'creator_apply'
            fetchSubmissionFeedback(chatProposal.id.toString(), !isCampaign)
        }
    }, [activeProposalTab, chatProposal, fetchSubmissionFeedback])
    const handleStatusUpdate = useCallback(async (id: string | number, status: 'accepted' | 'rejected' | 'hold') => {
        if (confirm(`이 지원서를 ${status === 'accepted' ? '수락' : status === 'hold' ? '보류' : '거절'}하시겠습니까?`)) {
            try {
                const { updateApplicationStatus } = await import('@/app/actions/proposal')
                const result = await updateApplicationStatus(id.toString(), status)
                if (result.error) toast.error(result.error)
                else {
                    toast.success("상태가 변경되었습니다.")
                    await refreshData()
                    if (status === 'accepted') {
                        // Switch to Active tab and open Chat (Workstation)
                        setWorkspaceTab('active')
                        setActiveProposalTab('chat')
                    }
                }
            } catch (err) {
                toast.error("상태 변경 중 오류가 발생했습니다.")
            }
        }
    }, [refreshData])

    const handleGenerateContract = async () => {
        if (!chatProposal || !user) return

        setIsGeneratingContract(true)
        try {
            const influencerId = chatProposal.influencer_id || chatProposal.influencerId
            const influencerMessages = messages.filter((m: any) => m.proposalId === chatProposal.id?.toString() || m.brandProposalId === chatProposal.id?.toString())

            const response = await fetch('/api/generate-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: influencerMessages,
                    proposal: chatProposal,
                    brandName: (user as any).display_name || (user as any).name || "브랜드",
                    influencerName: chatProposal.influencer_name || chatProposal.influencerName || "크리에이터"
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

    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const handleConfirmCondition = () => {
        setIsConfirmDialogOpen(true);
    };

    const executeConfirmCondition = async () => {
        if (!chatProposal) return;
        setIsConfirmDialogOpen(false);

        const isMutualConfirmed = chatProposal.influencer_condition_confirmed;

        // Optimistic UI Update
        const optimizedProposal = {
            ...chatProposal,
            brand_condition_confirmed: true,
            status: isMutualConfirmed ? 'confirmed' : chatProposal.status
        };
        setChatProposal(optimizedProposal as any);

        const isCampaign = !!chatProposal?.campaignId || (chatProposal as any)?.type === 'creator_apply';
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
                await updateBrandProposal(pId, updates);
            }

            // 2. Send System Message
            const msgContent = isMutualConfirmed
                ? "✅ [시스템 알림] 브랜드가 조건을 확정했습니다. 양측 확정이 완료되어 계약서 작성이 시작됩니다."
                : "✅ [시스템 알림] 브랜드가 조건을 확정했습니다. 크리에이터님의 확정을 기다리고 있습니다.";

            await sendMessage(
                chatProposal.influencer_id || chatProposal.influencerId || "creator",
                msgContent,
                isCampaign ? pId : undefined,
                !isCampaign ? pId : undefined
            );

            // 3. Notify Creator
            await sendNotification(
                chatProposal.influencer_id || chatProposal.influencerId || "creator",
                isMutualConfirmed
                    ? "조건 협의가 완료되었습니다. 계약서를 작성해주세요."
                    : `${user?.name}님이 조건을 확정했습니다.`,
                "proposal_update",
                pId
            );

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

        const receiverId = chatProposal.influencer_id || chatProposal.influencerId || chatProposal.influencer?.id

        if (!receiverId) {
            toast.error("수신자를 찾을 수 없습니다.")
            return
        }

        const msgContent = chatMessage
        setChatMessage("")
        setIsSendingMessage(true)

        try {
            // Determine if it's a Campaign Application (proposals table) or Direct Offer (brand_proposals table)
            const isCampaignProposal = (chatProposal as any)?.type === 'creator_apply' || !!(chatProposal as any)?.campaignId

            if (isCampaignProposal) {
                // For Campaign Applications -> proposals table
                await sendMessage(receiverId, msgContent, chatProposal.id?.toString(), undefined)
            } else {
                // For Direct Offers -> brand_proposals table
                await sendMessage(receiverId, msgContent, undefined, chatProposal.id?.toString())
            }
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
    const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null)
    const [offerProduct, setOfferProduct] = useState("")
    const [confirmStatusData, setConfirmStatusData] = useState<{ id: string, status: string } | null>(null)
    const [confirmContractSend, setConfirmContractSend] = useState(false)

    const [productType, setProductType] = useState("gift") // gift, loan
    const [compensation, setCompensation] = useState("")
    const [hasIncentive, setHasIncentive] = useState(false)
    const [incentiveDetail, setIncentiveDetail] = useState("")
    const [contentType, setContentType] = useState("")
    const [message, setMessage] = useState("")
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
    const [productLink, setProductLink] = useState("") // New: Product URL
    const [isSubmitting, setIsSubmitting] = useState(false)



    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
    const sigCanvas = useRef<any>(null)

    const handleSendContract = () => {
        if (!chatProposal || !generatedContract) return
        if (isSendingContract) return
        setIsSignatureModalOpen(true)
    }

    const performContractSend = async () => {
        if (!chatProposal || !generatedContract) return
        if (isSendingContract) return
        if (sigCanvas.current.isEmpty()) {
            toast.error("서명을 입력해주세요.")
            return
        }

        setConfirmContractSend(true)
    }

    const executeStatusChange = async () => {
        if (!confirmStatusData) return

        try {
            await updateProposal(confirmStatusData.id, {
                status: confirmStatusData.status
            })
            toast.success("상태가 변경되었습니다.")
            setConfirmStatusData(null)
        } catch (error) {
            console.error('Status change error:', error)
            toast.error("상태 변경에 실패했습니다.")
        }
    }


    const executeContractSend = async () => {
        setIsSendingContract(true)
        try {
            const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')

            // Determine if this is a 'Brand Proposal' (Direct Offer) or 'Proposal' (Campaign Apply)
            // Brand Proposals don't have campaignId, regular Proposals do.
            const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'creator_apply';
            const proposalId = chatProposal.id?.toString();

            let success = false;

            if (isCampaignProposal) {
                // It's a Campaign Application -> Use proposals table
                success = await updateProposal(proposalId, {
                    contract_content: generatedContract,
                    contract_status: 'sent',
                    brand_signature: signatureData,
                    brand_signed_at: new Date().toISOString()
                })
            } else {
                // It's a Brand Direct Offer -> Use brand_proposals table
                success = await updateBrandProposal(proposalId, {
                    contract_content: generatedContract,
                    contract_status: 'sent',
                    brand_signature: signatureData,
                    brand_signed_at: new Date().toISOString()
                })
            }

            if (!success) {
                return
            }

            // Update local state for immediate feedback
            setChatProposal((prev: any) => ({ ...prev, contract_status: 'sent', contract_content: generatedContract, brand_signature: signatureData }))
            setIsSignatureModalOpen(false)

            // Send system message
            const receiverId = chatProposal.influencer_id || chatProposal.influencerId || chatProposal.influencer?.id
            if (receiverId) {
                const msgContent = "📄 [시스템] 표준 계약서가 발송되었습니다. (브랜드 서명 완료)\n[계약 관리] 탭에서 확인 후 서명해주세요."

                // Pass ID to correct argument to avoid FK error
                if (isCampaignProposal) {
                    // (to, content, proposalId, brandProposalId)
                    await sendMessage(receiverId, msgContent, proposalId, undefined)
                } else {
                    await sendMessage(receiverId, msgContent, undefined, proposalId)
                }
            }

            toast.success("계약서가 성공적으로 발송되었습니다.")
        } catch (e) {
            console.error(e)
            toast.error("계약서 발송 중 오류가 발생했습니다.")
        } finally {
            setIsSendingContract(false)
            setConfirmContractSend(false)
        }
    }
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | number | null>(null)
    const [submitProgress, setSubmitProgress] = useState(0) // New: Progress state

    // Product Upload State
    const [productModalOpen, setProductModalOpen] = useState(false)
    const [editingProductId, setEditingProductId] = useState<string | null>(null)
    const [newProductName, setNewProductName] = useState("")
    const [newProductPrice, setNewProductPrice] = useState("")
    const [newProductCategory, setNewProductCategory] = useState("")
    const [newProductDescription, setNewProductDescription] = useState("")
    const [isFullContractOpen, setIsFullContractOpen] = useState(false)
    const [isSendingMessage, setIsSendingMessage] = useState(false)
    const [newProductImage, setNewProductImage] = useState("")
    const [trackingInput, setTrackingInput] = useState("")
    const [isUpdatingShipping, setIsUpdatingShipping] = useState(false)

    const handleDownloadContract = () => {
        if (!generatedContract && !chatProposal?.contract_content) {
            toast.error("계약서 내용이 없습니다.")
            return
        }

        const contractText = chatProposal?.contract_content || generatedContract
        const win = window.open('', '', 'width=800,height=600')
        win?.document.write(`
            <html>
                <head>
                    <title>표준 광고 협업 계약서</title>
                    <style>
                        body { font-family: 'Malgun Gothic', sans-serif; padding: 40px; line-height: 1.6; }
                        h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                        pre { white-space: pre-wrap; font-family: inherit; }
                        .signature-section { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
                        .sign-box { width: 45%; border-top: 1px solid #333; padding-top: 10px; }
                        .sign-img { max-height: 50px; margin-top: 10px; }
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
                            <p><strong>을 (크리에이터):</strong> ${chatProposal?.influencer_name || chatProposal?.influencer?.name || user?.name}</p>
                            ${chatProposal?.influencer_signature ? `<img src="${chatProposal.influencer_signature}" class="sign-img" />` : '<p>(서명 없음)</p>'}
                            <p><small>${chatProposal?.influencer_signed_at ? new Date(chatProposal.influencer_signed_at).toLocaleDateString() : ''}</small></p>
                        </div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `)
        win?.document.close()
    }
    const handleUpdateShipping = async () => {
        if (!trackingInput.trim()) {
            toast.error("운송장 번호를 입력해주세요.")
            return
        }
        if (!chatProposal) return

        setIsUpdatingShipping(true)
        try {
            const isCampaignProposal = !!chatProposal.campaignId || (chatProposal as any)?.type === 'creator_apply'
            const proposalId = chatProposal.id?.toString()
            const receiverId = chatProposal.influencer_id || chatProposal.influencerId || chatProposal.influencer?.id

            const updateData = {
                tracking_number: trackingInput,
                delivery_status: 'shipped'
            }

            let success = false
            if (isCampaignProposal) {
                success = await updateProposal(proposalId, updateData)
            } else {
                success = await updateBrandProposal(proposalId, updateData)
            }

            if (success) {
                // Update local state
                setChatProposal((prev: any) => ({ ...prev, ...updateData }))

                // Notify Creator
                if (receiverId) {
                    const msgContent = `📦 [시스템] 제품 발송이 시작되었습니다.\n운송장 번호: ${trackingInput}`
                    if (isCampaignProposal) {
                        await sendMessage(receiverId, msgContent, proposalId, undefined)
                    } else {
                        await sendMessage(receiverId, msgContent, undefined, proposalId)
                    }
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
    const [newProductLink, setNewProductLink] = useState("")
    const [newProductPoints, setNewProductPoints] = useState("")

    const [newProductShots, setNewProductShots] = useState("")
    const [newProductContentGuide, setNewProductContentGuide] = useState("")
    const [newProductFormatGuide, setNewProductFormatGuide] = useState("")
    const [newProductAccountTag, setNewProductAccountTag] = useState("")
    const [newProductHashtags, setNewProductHashtags] = useState("")

    // Preview Modal State
    const [previewModalOpen, setPreviewModalOpen] = useState(false) // Store as string, split on save

    const [isUploading, setIsUploading] = useState(false)
    const [isImageUploading, setIsImageUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [productSearchQuery, setProductSearchQuery] = useState("")
    const [selectedBrandProduct, setSelectedBrandProduct] = useState<any>(null) // Brand Detail View State
    const [priceFilter, setPriceFilter] = useState("all")

    const PRICE_FILTER_RANGES = [
        { k: 'all', l: '전체', min: 0, max: Infinity },
        { k: 'under_10', l: '10만원 이하', min: 0, max: 100000 },
        { k: '10_30', l: '10만원 ~ 30만원', min: 100000, max: 300000 },
        { k: '30_50', l: '30만원 ~ 50만원', min: 300000, max: 500000 },
        { k: '50_100', l: '50만원 ~ 100만원', min: 500000, max: 1000000 },
        { k: '100_300', l: '100만원 ~ 300만원', min: 1000000, max: 3000000 },
        { k: 'over_300', l: '300만원 이상', min: 3000000, max: Infinity },
    ]

    const filteredProducts = products?.filter(p =>
        p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        p.brandName?.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearchQuery.toLowerCase())
    ) || []

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 300MB limit check
        if (file.size > 300 * 1024 * 1024) {
            toast.error("파일 크기는 300MB 이하여야 합니다.")
            return
        }

        setIsImageUploading(true)
        console.log('[handleImageUpload] Starting upload for file:', file.name, 'size:', file.size)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `products/${fileName}`

            console.log('[handleImageUpload] Target path:', filePath)

            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Upload timed out (15s)')), 15000)
            )

            // Race the upload against the timeout
            const { data, error } = await Promise.race([
                supabase.storage
                    .from('product-images')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    }),
                timeoutPromise
            ]) as any

            if (error) {
                console.error('[handleImageUpload] Supabase Storage Error:', error)
                throw error
            }

            console.log('[handleImageUpload] Upload successful, getting public URL...')
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath)

            console.log('[handleImageUpload] Public URL:', publicUrl)
            setNewProductImage(publicUrl)
        } catch (error: any) {
            console.error('[handleImageUpload] Exception:', error)
            // Detailed error message for the user
            const errorMessage = error?.message || "알 수 없는 오류"
            const errorCode = error?.code || error?.error || "UNKNOWN"
            toast.error(`이미지 업로드 실패\n오류 코드: ${errorCode}\n내용: ${errorMessage}\n(잠시 후 다시 시도해보세요)`)
        } finally {
            setIsImageUploading(false)
            // Reset file input
            e.target.value = ''
        }
    }

    // Settings States
    const [editName, setEditName] = useState("")
    const [editWebsite, setEditWebsite] = useState("")
    const [editBio, setEditBio] = useState("")
    const [editPhone, setEditPhone] = useState("")
    const [editAddress, setEditAddress] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (displayUser) {
            setEditName(displayUser.name || "")
            setEditWebsite(displayUser.website || "")
            setEditBio(displayUser.bio || "")
            setEditPhone(displayUser.phone || "")
            setEditAddress(displayUser.address || "")
        }
    }, [displayUser])

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

    const handlePresetClick = useCallback((key: string) => {
        setFollowerFilter(key)
        if (key === "all") {
            setMinFollowers("")
            setMaxFollowers("")
        } else if (key === "starter") {
            setMinFollowers("0")
            setMaxFollowers("1000")
        } else if (key === "nano") {
            setMinFollowers("1000")
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
    }, [])

    const handleManualChange = useCallback((type: 'min' | 'max', value: string) => {
        if (type === 'min') setMinFollowers(value)
        else setMaxFollowers(value)
        setFollowerFilter("custom")
    }, [])

    const getFilteredAndSortedEvents = () => {
        // Use allEvents for discovery, default empty array if undefined
        let result = [...(allEvents || [])]
        if (selectedTag) {
            result = result.filter(e =>
                e.category === selectedTag ||
                e.tags.some(t => t.includes(selectedTag) || selectedTag.includes(t))
            )
        }
        if (statusFilter === "upcoming") {
            result = result.filter(e => e.status !== 'completed')
        } else if (statusFilter === "past") {
            result = result.filter(e => e.status === 'completed')
        } else if (statusFilter === "favorites") {
            result = result.filter(e => favorites.some(f => f.target_id === e.id && f.target_type === 'event'))
        }
        if (minFollowers !== "" || maxFollowers !== "") {
            const min = minFollowers === "" ? 0 : parseInt(minFollowers)
            const max = maxFollowers === "" ? Infinity : parseInt(maxFollowers)
            result = result.filter(e => {
                const count = e.followers || 0
                return count >= min && count <= max
            })
        }
        if (priceFilter !== 'all') {
            const range = PRICE_FILTER_RANGES.find(r => r.k === priceFilter)
            if (range) {
                result = result.filter(e => {
                    const price = e.priceVideo || 0
                    return price >= range.min && price < range.max
                })
            }
        }
        if (sortOrder === "deadline") result.reverse()
        else if (sortOrder === "match") result.sort(() => Math.random() - 0.5)
        else if (sortOrder === "verified") result = result.filter(e => e.verified)
        else if (sortOrder === "followers_high") result.sort((a, b) => (b.followers || 0) - (a.followers || 0))
        if (sortOrder === "latest") result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        return result
    }



    const submitProposal = async () => {
        // Prevent duplicate submissions
        if (isSubmitting) return

        if (!user) {
            toast.error("세션이 만료되었습니다. 다시 로그인해주세요.")
            return
        }

        if (!offerProduct || !compensation || !contentType) {
            toast.error("필수 항목을 모두 입력해주세요.")
            return
        }
        setIsSubmitting(true)
        setSubmitProgress(10) // Start progress

        // Simulate progress
        const progressInterval = setInterval(() => {
            setSubmitProgress(prev => {
                if (prev >= 90) return prev;
                return prev + Math.floor(Math.random() * 10) + 1;
            })
        }, 500)

        try {
            const proposalData = {
                brand_id: user?.id,
                influencer_id: selectedInfluencer?.influencerId,
                product_name: offerProduct,
                product_url: productLink,
                product_type: productType,
                compensation_amount: compensation,
                has_incentive: hasIncentive,
                incentive_detail: incentiveDetail,
                event_id: selectedInfluencer?.id,
                content_type: contentType,
                message: message,

                // Pre-filled Conditions
                condition_draft_submission_date: conditionDraftDate,
                condition_final_submission_date: conditionFinalDate,
                condition_upload_date: conditionUploadDate,
                condition_secondary_usage_period: conditionSecondary
            }

            // Optional: Remove fields that might not exist in schema if needed
            // But we created createBrandProposal to handle it more safely

            // [FIX] Logic Split: Use specific handler for Moments
            let insertedProposal;
            try {
                if (proposalData.event_id) {
                    console.log("[submitProposal] Routing to Moment Proposal...", proposalData);
                    insertedProposal = await createMomentProposal({
                        ...proposalData,
                        moment_id: proposalData.event_id // Map event_id to moment_id
                    });
                } else {
                    insertedProposal = await createBrandProposal(proposalData);
                }
            } catch (err: any) {
                console.warn("Proposal submission failed, retrying fallback...", err)
                // ... existing fallback attempt ...
                if (err?.code === '42703' || err?.message?.includes('column')) {
                    // ... existing fallback attempt ...
                    const fallbackData: any = { ...proposalData }
                    delete fallbackData.event_id
                    delete fallbackData.has_incentive
                    delete fallbackData.incentive_detail
                    insertedProposal = await createBrandProposal(fallbackData);
                } else {
                    throw err;
                }
            }

            if (insertedProposal) {
                await sendMessage(selectedInfluencer?.influencerId, `협업 제안서가 전송되었습니다.\n[${offerProduct}]`, undefined, insertedProposal.id)
            }

            clearInterval(progressInterval)
            setSubmitProgress(100) // Complete
            await new Promise(resolve => setTimeout(resolve, 800)) // Slight delay for user to see 100%

            // alert(`${selectedInfluencer?.influencer}님에게 제안서가 성공적으로 발송되었습니다!`) // Removed alert in favor of UI message
            setProposeModalOpen(false)
            setSubmitProgress(0) // Reset

            // Refresh the data to show the new proposal immediately
            refreshData()
        } catch (error: any) {
            console.error("Proposal Error:", error)

            // Helpful error message for Schema/Table issues
            if (error?.code === '42703') { // undefined_column
                toast.error(`제안서 발송 실패: 데이터베이스 스키마와 일치하지 않는 필드가 있습니다.\n(${error.message})`)
            } else if (error.code === '23503') {
                toast.error(`제안서 발송 실패: 참조 데이터 오류 (이벤트 또는 사용자 ID가 유효하지 않음)\n(${error.message})`)
            } else {
                toast.error(`제안서 발송에 실패했습니다: ${error?.message || "알 수 없는 오류"}`)
            }
        } finally {
            clearInterval(progressInterval)
            setIsSubmitting(false)
            if (submitProgress < 100) setSubmitProgress(0) // Reset on error
        }
    }

    const handleViewGuide = useCallback((product: any) => {
        setEditingProductId(null) // Ensure we are not in "edit mode" for submission
        setNewProductName(product.name)
        setNewProductPrice(product.price?.toString() || "")
        setNewProductCategory(product.category)
        setNewProductDescription(product.description || "")
        setNewProductImage(product.image === "📦" ? "" : (product.image || ""))
        setNewProductPoints(product.points || "")
        setNewProductShots(product.shots || "")
        setNewProductContentGuide(product.contentGuide || "")
        setNewProductFormatGuide(product.formatGuide || "")
        setNewProductAccountTag(product.accountTag || "")
        setNewProductHashtags(product.tags ? product.tags.join(" ") : "")
        // Do NOT open productModal (form), ONLY previewModal
        setPreviewModalOpen(true)
    }, [])

    const handleEditProduct = useCallback((product: any) => {
        setEditingProductId(product.id)
        setNewProductName(product.name)
        setNewProductPrice(product.price?.toString() || "")
        setNewProductCategory(product.category)
        setNewProductDescription(product.description || "")
        // Remove emoji if present so user can input URL cleanly
        setNewProductImage(product.image === "📦" ? "" : (product.image || ""))
        setNewProductPoints(product.points || "")
        setNewProductShots(product.shots || "")
        setNewProductContentGuide(product.contentGuide || "")
        setNewProductFormatGuide(product.formatGuide || "")
        setNewProductAccountTag(product.accountTag || "")
        setNewProductHashtags(product.tags ? product.tags.join(" ") : "")
        setProductModalOpen(true)
    }, [])


    const handlePreview = () => {
        if (!newProductName || !newProductCategory) {
            toast.error("제품명과 카테고리는 필수입니다.")
            return
        }
        if (isImageUploading) {
            toast.error("이미지 업로드가 아직 완료되지 않았습니다.")
            return
        }
        setPreviewModalOpen(true)
    }

    const handleFinalSubmit = async () => {
        // Prevent duplicate submissions or submitting while image is still uploading
        if (isUploading) return

        console.log('[handleFinalSubmit] Starting upload for:', newProductName)
        setIsUploading(true)

        try {
            const isEditing = !!editingProductId
            const cleanImage = newProductImage.replace('📦', '').trim()

            const productData = {
                name: newProductName,
                price: parseInt(newProductPrice) || 0,
                category: newProductCategory,
                description: newProductDescription,
                image: cleanImage || "📦",
                link: newProductLink,
                points: newProductPoints,
                shots: newProductShots,
                contentGuide: newProductContentGuide,
                formatGuide: newProductFormatGuide,
                accountTag: newProductAccountTag,
                tags: newProductHashtags.split(/[\s,]+/).filter(tag => tag.trim() !== "").map(tag => tag.startsWith('#') ? tag : `#${tag}`)
            }

            console.log('[handleFinalSubmit] Product data prepared:', productData)

            let result;
            if (editingProductId) {
                result = await updateProduct(editingProductId, productData)
            } else {
                result = await addProduct(productData)
            }

            console.log('[handleFinalSubmit] Result:', result)


            // Clear inputs
            setNewProductName("")
            setNewProductPrice("")
            setNewProductCategory("")
            setNewProductDescription("")
            setNewProductImage("")
            setNewProductLink("")
            setNewProductPoints("")
            setNewProductShots("")
            setNewProductContentGuide("")
            setNewProductFormatGuide("")
            setNewProductAccountTag("")
            setNewProductHashtags("")
            setEditingProductId(null)

            setPreviewModalOpen(false) // Close preview
            setProductModalOpen(false) // Close form
            console.log('[handleFinalSubmit] Success!')
            toast.success(isEditing ? "제품이 성공적으로 수정되었습니다!" : "제품이 성공적으로 등록되었습니다!")
            setProductModalOpen(false);
            refreshData()
        } catch (e: any) {
            console.error(e)
            toast.error(`제품 ${editingProductId ? '수정' : '등록'} 실패: ${e?.message || "알 수 없는 오류"}`)
        } finally {
            setIsUploading(false)
        }
    }



    const handleSaveProfile = async () => {
        setIsSaving(true)
        try {
            await updateUser({
                name: editName,
                website: editWebsite,
                bio: editBio,
                phone: editPhone,
                address: editAddress
            })
            toast.success("프로필 정보가 저장되었습니다.")
        } catch (e: any) {
            console.error("Save profile error:", e)
            toast.error("저장 중 오류가 발생했습니다.")
        } finally {
            setIsSaving(false)
        }
    }

    const filteredEvents = getFilteredAndSortedEvents()

    // [FIXED] Removed redundant filters - Provider and RLS already filter correctly by team_id
    // The page-level brandId filter was causing campaigns to not display
    const myCampaigns = campaigns  // Already filtered by RLS (team_id) and Provider
    const mySentProposals = brandProposals  // Already filtered by RLS
    const myProducts = products  // Already filtered by RLS

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
                    <DiscoverView
                        filteredEvents={filteredEvents}
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                        followerFilter={followerFilter}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        selectedTag={selectedTag}
                        setSelectedTag={setSelectedTag}
                        handlePresetClick={handlePresetClick}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                        priceFilter={priceFilter}
                        setPriceFilter={setPriceFilter}
                        POPULAR_TAGS={POPULAR_TAGS}
                        PRICE_FILTER_RANGES={PRICE_FILTER_RANGES}
                        user={user}
                        deleteEvent={deleteEvent}
                    />
                )
            case "my-campaigns":
                return (
                    <MyCampaignsView
                        myCampaigns={myCampaigns}
                        campaignProposals={campaignProposals}
                        selectedCampaignId={selectedCampaignId}
                        setSelectedCampaignId={setSelectedCampaignId}
                        deleteCampaign={deleteCampaign}
                        updateCampaignStatus={updateCampaignStatus}
                        refreshData={refreshData}
                    />
                )

            case "proposals":
                return (
                    <WorkspaceView
                        campaignProposals={campaignProposals}
                        brandProposals={brandProposals}
                        workspaceTab={workspaceTab}
                        setWorkspaceTab={setWorkspaceTab}
                        setChatProposal={setChatProposal}
                        setIsChatOpen={setIsChatOpen}
                        handleStatusUpdate={handleStatusUpdate}
                        onViewProposal={(proposal) => {
                            setReadonlyProposal(proposal)
                            setShowReadonlyProposalDialog(true)
                        }}
                    />
                )

            case "my-products":
                return (
                    <MyProductsView
                        products={myProducts}
                        setProductModalOpen={setProductModalOpen}
                        handleViewGuide={handleViewGuide}
                        handleEditProduct={handleEditProduct}
                        deleteProduct={deleteProduct}
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
            case "discover-products":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">브랜드 제품 둘러보기</h1>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    다른 브랜드의 제품을 둘러보고 협업 아이디어를 얻어보세요.
                                </p>
                            </div>
                            <div className="flex w-full sm:max-w-sm items-center space-x-2">
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="브랜드, 제품명 검색"
                                        className="pl-9"
                                        value={productSearchQuery}
                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <Card className="p-20 text-center border-dashed bg-muted/20">
                                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground">검색 결과가 없습니다.</h3>
                            </Card>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="cursor-pointer" onClick={() => {
                                        setSelectedProductId(String(product.id));
                                        setCurrentView("product-detail");
                                    }}>
                                        <Card className="h-full overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 bg-background border-border/60 group">
                                            <div className="aspect-square bg-muted flex items-center justify-center text-6xl overflow-hidden relative">
                                                {product.image?.startsWith('http') ? (
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                ) : (
                                                    <span className="transition-transform group-hover:scale-125">{product.image || "📦"}</span>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button variant="secondary" size="sm" className="font-bold">자세히 보기</Button>
                                                </div>
                                            </div>
                                            <CardHeader className="p-4 pb-2">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-bold text-primary uppercase tracking-tight truncate max-w-[120px]">{product.brandName || "브랜드"}</span>
                                                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-medium">{product.category}</Badge>
                                                </div>
                                                <CardTitle className="text-sm font-bold line-clamp-2 leading-tight h-10">
                                                    {product.name}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-1">
                                                <p className="font-extrabold text-lg text-foreground">
                                                    {product.price > 0 ? `${product.price.toLocaleString()}원` : "가격 미정"}
                                                </p>
                                            </CardContent>
                                            <CardFooter className="p-4 pt-0 text-[10px] font-bold text-muted-foreground uppercase flex items-center border-t mt-2 pt-3">
                                                <span className="text-primary group-hover:underline">상세 정보 보기</span>
                                                <ChevronRight className="ml-auto h-3 w-3 text-primary" />
                                            </CardFooter>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            case "notifications":
                const sortedNotifications = [...(notifications || [])].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 sm:gap-3">
                                    <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-primary" /> 알림 센터
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">캠페인 지원 및 협업 진행 상황을 실시간으로 확인하세요.</p>
                            </div>
                        </div>

                        {sortedNotifications.length === 0 ? (
                            <Card className="p-20 text-center border-dashed bg-muted/30/50 rounded-[40px] border-2">
                                <Bell className="mx-auto h-16 w-16 text-slate-200 mb-6" />
                                <h3 className="text-xl font-bold text-foreground">새로운 알림이 없습니다.</h3>
                                <p className="text-sm text-muted-foreground/70 mt-2">중요한 협업 업데이트가 발생하면 여기에 실시간으로 표시됩니다.</p>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {sortedNotifications.map((n: any) => (
                                    <Card
                                        key={n.id}
                                        className={`overflow-hidden border-0 shadow-sm transition-all hover:shadow-md cursor-pointer group rounded-3xl ${n.is_read ? 'bg-white opacity-70' : 'bg-white ring-2 ring-primary/5'}`}
                                        onClick={() => {
                                            const content = n.content || "";
                                            if (content.includes('지원') || content.includes('제안') || content.includes('계약')) {
                                                setCurrentView("proposals")
                                                if (content.includes('지원')) setWorkspaceTab("inbound")
                                            }
                                        }}
                                    >
                                        <CardContent className="p-6 flex items-start gap-5">
                                            <div className={`mt-1 h-14 w-14 shrink-0 rounded-[22px] flex items-center justify-center transition-all group-hover:scale-110 shadow-sm ${n.is_read ? 'bg-muted text-muted-foreground/70' : 'bg-primary/10 text-primary'}`}>
                                                {(n.content || "").includes('지원') || (n.content || "").includes('제안') ? <Briefcase className="h-7 w-7" /> :
                                                    (n.content || "").includes('계약') || (n.content || "").includes('서명') ? <FileText className="h-7 w-7" /> :
                                                        (n.content || "").includes('배송') || (n.content || "").includes('운송장') ? <Package className="h-7 w-7" /> : <Bell className="h-7 w-7" />}
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Notification</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground/70 bg-muted/30 border border-border/50 px-3 py-1 rounded-full">{new Date(n.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-[15px] font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">{n.content}</p>
                                                <div className="flex items-center gap-2">
                                                    {!n.is_read && (
                                                        <Badge className="text-[9px] h-5 px-2 font-black bg-primary rounded-lg shadow-md border-0 uppercase">New Update</Badge>
                                                    )}
                                                    <span className="text-[11px] text-muted-foreground/70 font-medium opacity-0 group-hover:opacity-100 transition-opacity">워크스페이스로 이동하여 확인하기 →</span>
                                                </div>
                                            </div>
                                            <div className="self-center">
                                                <div className="h-10 w-10 rounded-full bg-muted/30 border border-border/50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                                                    <ArrowRight className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )
            case "settings":
                return (
                    <BrandProfileView
                        user={user}
                        isSaving={isSaving}
                        editName={editName}
                        setEditName={setEditName}
                        editWebsite={editWebsite}
                        setEditWebsite={setEditWebsite}
                        editPhone={editPhone}
                        setEditPhone={setEditPhone}
                        editAddress={editAddress}
                        setEditAddress={setEditAddress}
                        editBio={editBio}
                        setEditBio={setEditBio}
                        handleSaveProfile={handleSaveProfile}
                        updateUser={updateUser}
                        switchRole={switchRole}
                    />
                )
            default:
                return null
        }
    }

    // Assuming usePlatform is called here or higher up in the component
    // const { deleteBrandProposal, deleteMomentProposal } = usePlatform();

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
                // Assuming deleteBrandProposal is destructured from usePlatform()
                await deleteBrandProposal(proposalId);
            }
            toast.success("제안이 취소되었습니다.");
            refreshData();
        } catch (e) {
            console.error(e);
            toast.error("제안 취소 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                    {/* Sidebar */}
                    <aside className="hidden lg:flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-2 py-4 border-b">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xl overflow-hidden">
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
                                onClick={() => setCurrentView("discover")}
                            >
                                <Search className="mr-2 h-4 w-4" /> 모먼트 검색
                            </Button>
                            <Button
                                variant={currentView === "my-campaigns" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("my-campaigns")}
                            >
                                <Package className="mr-2 h-4 w-4" /> 내 캠페인
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
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`w-full justify-start text-xs h-8 ${workspaceTab === 'inbound' ? 'bg-primary/20 text-primary font-bold' : 'text-muted-foreground'}`}
                                        onClick={() => setWorkspaceTab("inbound")}
                                    >
                                        받은 제안
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`w-full justify-start text-xs h-8 ${workspaceTab === 'outbound' ? 'bg-primary/5 text-primary font-medium' : 'text-muted-foreground'}`}
                                        onClick={() => setWorkspaceTab("outbound")}
                                    >
                                        보낸 제안
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`w-full justify-start text-xs h-8 ${workspaceTab === 'active' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-muted-foreground'}`}
                                        onClick={() => setWorkspaceTab("active")}
                                    >
                                        진행중
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`w-full justify-start text-xs h-8 ${workspaceTab === 'completed' ? 'bg-muted text-foreground/90 font-medium' : 'text-muted-foreground'}`}
                                        onClick={() => setWorkspaceTab("completed")}
                                    >
                                        완료됨
                                    </Button>
                                </div>
                            )}
                            <Button
                                variant={currentView === "my-products" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("my-products")}
                            >
                                <ShoppingBag className="mr-2 h-4 w-4" /> 내 브랜드 제품
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
                                <Bell className={`mr-2 h-4 w-4 ${notifications.some(n => !n.is_read) ? 'text-blue-500 animate-bounce' : ''}`} /> 알림 센터
                                {notifications.filter(n => !n.is_read).length > 0 && (
                                    <Badge className="ml-auto bg-blue-500 text-[10px] h-4 px-1">{notifications.filter(n => !n.is_read).length}</Badge>
                                )}
                            </Button>

                            <div className="my-2 border-t" />
                            <Button
                                variant={currentView === "settings" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("settings")}
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

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        {renderContent()}
                    </div>
                </div>
            </main>

            {/* Propose Modal */}
            <Dialog open={proposeModalOpen} onOpenChange={setProposeModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>협업 제안하기</DialogTitle>
                        <DialogDescription>
                            {selectedInfluencer?.influencer}님에게 보낼 제안서를 작성해주세요.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="p-product" className="text-right pt-2 text-xs font-bold">제품명</Label>
                            <div className="col-span-3 space-y-2">
                                <Input id="p-product" value={offerProduct} onChange={(e) => setOfferProduct(e.target.value)} placeholder="브랜드 제품명" />
                                <Input id="p-link" value={productLink} onChange={(e) => setProductLink(e.target.value)} placeholder="제품 링크 (https://...)" className="text-xs" />
                                <RadioGroup value={productType} onValueChange={setProductType} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="gift" id="r-gift" />
                                        <Label htmlFor="r-gift" className="text-xs font-normal">제품 제공</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="loan" id="r-loan" />
                                        <Label htmlFor="r-loan" className="text-xs font-normal">제품 대여</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="p-pay" className="text-right pt-2 text-xs font-bold">원고료</Label>
                            <div className="col-span-3 space-y-2">
                                <div className="flex gap-2">
                                    <Input id="p-pay" value={compensation} onChange={(e) => setCompensation(e.target.value)} placeholder="0원 (또는 협의)" />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setShowCalculator(!showCalculator)}
                                        className={showCalculator ? "bg-indigo-50 border-indigo-200 text-indigo-600" : ""}
                                        title="AI 적정 단가 계산기"
                                    >
                                        <Calculator className="h-4 w-4" />
                                    </Button>
                                </div>
                                {showCalculator && (
                                    <div className="animate-in slide-in-from-top-2 fade-in">
                                        <AIPriceCalculator
                                            initialFollowers={selectedInfluencer?.followers || 0}
                                            initialCategory={selectedInfluencer?.category || "뷰티"}
                                            onPriceCalculated={(price) => {
                                                setCompensation(price)
                                                // Don't auto-close, let user see result
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="p-inc" checked={hasIncentive} onCheckedChange={(c: any) => setHasIncentive(c as boolean)} />
                                    <Label htmlFor="p-inc" className="text-xs">성과급(인센티브) 협의 가능</Label>
                                </div>
                                {hasIncentive && (
                                    <div className="animate-in fade-in slide-in-from-top-1">
                                        <Textarea
                                            placeholder="인센티브 상세 조건 (예: 판매 건당 10% 지급, 조회수 1만 달성 시 추가금 등)"
                                            value={incentiveDetail}
                                            onChange={(e) => setIncentiveDetail(e.target.value)}
                                            className="text-xs h-20 mt-2"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="p-type" className="text-right text-xs font-bold">희망 채널</Label>
                            <Select value={contentType} onValueChange={setContentType}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="콘텐츠 형태 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="reels">인스타그램 릴스</SelectItem>
                                    <SelectItem value="shorts">유튜브 쇼츠</SelectItem>
                                    <SelectItem value="post">이미지 피드</SelectItem>
                                    <SelectItem value="blog">블로그 리뷰</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Condition Pre-fill Section */}
                        <div className="space-y-4 border-t pt-4 mt-2">
                            <h4 className="text-xs font-bold text-foreground mb-2">📅 예상 일정 및 조건 (제안 시 입력)</h4>
                            <div className="grid grid-cols-2 gap-4">

                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">초안 제출일</Label>
                                    <Input type="date" className="h-8 text-xs" value={conditionDraftDate} onChange={(e) => setConditionDraftDate(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">최종본 제출일</Label>
                                    <Input type="date" className="h-8 text-xs" value={conditionFinalDate} onChange={(e) => setConditionFinalDate(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">업로드일</Label>
                                    <Input type="date" className="h-8 text-xs" value={conditionUploadDate} onChange={(e) => setConditionUploadDate(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">

                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">2차 활용 기간</Label>
                                    <Select value={conditionSecondary} onValueChange={setConditionSecondary}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="불가">활용 불가 (기본)</SelectItem>
                                            <SelectItem value="3개월">3개월 (+비용 협의)</SelectItem>
                                            <SelectItem value="6개월">6개월 (+비용 협의)</SelectItem>
                                            <SelectItem value="1년">1년 (+비용 협의)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                            <Label htmlFor="p-msg" className="text-right pt-2 text-xs font-bold">전달 메시지</Label>
                            <div className="col-span-3 space-y-1">
                                <Textarea id="p-msg" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[100px]" />
                                <p className="text-xs text-muted-foreground pt-1">
                                    * 크리에이터가 제안을 수락하면 예상 단가를 열람할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    </div>
                    {isSubmitting && (
                        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-lg">
                            <div className="w-[80%] max-w-sm space-y-4 text-center">
                                <h3 className="text-lg font-bold text-foreground animate-pulse">
                                    {submitProgress === 100 ? "발송 완료되었습니다!" : "제안서를 발송하고 있습니다..."}
                                </h3>
                                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300 ease-out"
                                        style={{ width: `${submitProgress}%` }}
                                    />
                                </div>
                                <p className="text-sm font-medium text-primary">{submitProgress}%</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProposeModalOpen(false)}>취소</Button>
                        <Button onClick={submitProposal} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "제안서 전송"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Product Upload Modal */}
            <Dialog open={productModalOpen} onOpenChange={(open) => {
                setProductModalOpen(open)
                if (!open) {
                    // Reset form when closing
                    setEditingProductId(null)
                    setNewProductName("")
                    setNewProductPrice("")
                    setNewProductCategory("")
                    setNewProductDescription("")
                    setNewProductImage("")
                    setNewProductLink("")
                    setNewProductPoints("")
                    setNewProductShots("")
                }
            }}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
                    <DialogHeader>
                        <DialogTitle>{editingProductId ? "제품 수정" : "우리 브랜드 제품 등록"}</DialogTitle>
                        <DialogDescription>
                            {editingProductId ? "제품 정보를 수정해주세요." : "크리에이터가 확인하고 제안할 수 있도록 제품 상세 정보를 입력해 주세요."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                        {/* Left Column: Basic Info & Social */}
                        <div className="space-y-6">
                            <div className="space-y-4 p-5 bg-muted/30 rounded-2xl border border-border/50">
                                <h4 className="font-bold text-sm text-foreground/90 flex items-center gap-2">
                                    <Package className="h-4 w-4" /> 기본 정보
                                </h4>
                                <div className="space-y-2">
                                    <Label htmlFor="op-name">제품명 <span className="text-red-500">*</span></Label>
                                    <Input id="op-name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="예: 보이브 룸 스프레이 필로우토크" className="bg-background" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="op-cat">카테고리 <span className="text-red-500">*</span></Label>
                                        <Select value={newProductCategory} onValueChange={setNewProductCategory}>
                                            <SelectTrigger id="op-cat" className="bg-background">
                                                <SelectValue placeholder="선택" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="뷰티">💄 뷰티</SelectItem>
                                                <SelectItem value="패션">👗 패션</SelectItem>
                                                <SelectItem value="푸드">🍽️ 푸드</SelectItem>
                                                <SelectItem value="여행">✈️ 여행</SelectItem>
                                                <SelectItem value="라이프">🏡 라이프</SelectItem>
                                                <SelectItem value="테크">💻 테크</SelectItem>
                                                <SelectItem value="육아">👶 육아</SelectItem>
                                                <SelectItem value="반려동물">🐶 반려동물</SelectItem>
                                                <SelectItem value="운동">💪 운동</SelectItem>
                                                <SelectItem value="다이어트">🥗 다이어트</SelectItem>
                                                <SelectItem value="건강">💊 건강</SelectItem>
                                                <SelectItem value="게임">🎮 게임</SelectItem>
                                                <SelectItem value="도서">📚 도서</SelectItem>
                                                <SelectItem value="취미">🎨 취미</SelectItem>
                                                <SelectItem value="교육">🎓 교육</SelectItem>
                                                <SelectItem value="문화">🎬 문화</SelectItem>
                                                <SelectItem value="재테크">💰 재테크</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="op-price">판매가 (원)</Label>
                                        <Input id="op-price" type="number" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} placeholder="0" className="bg-background" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="op-img">제품 이미지 (300MB 이하)</Label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isImageUploading}
                                            className="w-full bg-background"
                                        >
                                            {isImageUploading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Upload className="mr-2 h-4 w-4" />
                                            )}
                                            {isImageUploading ? "업로드 중..." : "이미지 업로드"}
                                        </Button>
                                        {newProductImage && newProductImage !== "📦" && (
                                            <div className="h-10 w-10 relative bg-muted rounded overflow-hidden shrink-0 border">
                                                <img src={newProductImage} alt="Preview" className="h-full w-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="op-link">브랜드 몰 링크</Label>
                                    <Input
                                        id="op-link"
                                        value={newProductLink}
                                        onChange={(e) => setNewProductLink(e.target.value)}
                                        onBlur={() => {
                                            if (newProductLink && !/^https?:\/\//i.test(newProductLink)) {
                                                setNewProductLink('https://' + newProductLink)
                                            }
                                        }}
                                        placeholder="https://..."
                                        className="bg-background"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 p-5 bg-muted/30 rounded-2xl border border-border/50">
                                <h4 className="font-bold text-sm text-foreground/90 flex items-center gap-2">
                                    <AtSign className="h-4 w-4" /> 태그 및 필수 표기
                                </h4>
                                <div className="space-y-2">
                                    <Label htmlFor="op-account">브랜드 계정 태그</Label>
                                    <Input
                                        id="op-account"
                                        value={newProductAccountTag}
                                        onChange={(e) => {
                                            let value = e.target.value
                                            // Auto-prepend @ if user types something and it's missing
                                            if (value && !value.startsWith('@')) {
                                                value = '@' + value
                                            }
                                            setNewProductAccountTag(value)
                                        }}
                                        placeholder="@voib_official"
                                        className="bg-background"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="op-tags">필수 해시태그 (공백 구분)</Label>
                                    <Input
                                        id="op-tags"
                                        value={newProductHashtags}
                                        onChange={(e) => {
                                            let val = e.target.value
                                            // Ensure first char is # if not empty
                                            if (val && !val.startsWith('#')) {
                                                val = '#' + val
                                            }
                                            setNewProductHashtags(val)
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === ' ') {
                                                e.preventDefault()
                                                setNewProductHashtags(prev => prev + ' #')
                                            }
                                        }}
                                        placeholder="#보이브 #룸스프레이"
                                        className="bg-background"
                                    />
                                </div>
                                <div className="bg-background p-3 rounded-lg text-xs text-muted-foreground flex items-start gap-2 border border-border">
                                    <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                    <span>
                                        <span className="font-bold text-red-500">*[광고] 또는 [협찬] 문구</span>를 상단에 필수로 기재해달라는 안내가 자동으로 포함됩니다.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Detailed Guide */}
                        <div className="space-y-6">
                            <div className="space-y-4 p-5 bg-background rounded-2xl border border-border shadow-sm h-full">
                                <h4 className="font-bold text-sm text-foreground/90 flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> 상세 가이드라인
                                </h4>

                                <div className="space-y-2">
                                    <Label htmlFor="op-desc">제품 상세 설명</Label>
                                    <Textarea id="op-desc" value={newProductDescription} onChange={(e) => setNewProductDescription(e.target.value)} placeholder="제품의 핵심 특징을 요약해주세요." className="min-h-[80px] resize-none" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="op-pts">제품 소구 포인트 (Selling Points)</Label>
                                    <Textarea id="op-pts" value={newProductPoints} onChange={(e) => setNewProductPoints(e.target.value)} placeholder="크리에이터가 강조해주길 원하는 장점" className="min-h-[80px] resize-none" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="op-shot">필수 촬영 컷 (Required Shots)</Label>
                                    <Textarea id="op-shot" value={newProductShots} onChange={(e) => setNewProductShots(e.target.value)} placeholder="예: 언박싱 장면, 얼굴 근접 샷 1회 이상" className="min-h-[80px] resize-none" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="op-content-guide">필수 포함 내용</Label>
                                    <Textarea id="op-content-guide" value={newProductContentGuide} onChange={(e) => setNewProductContentGuide(e.target.value)} placeholder="예: 향 지속력을 강조해주세요." className="min-h-[80px] resize-none" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="op-format-guide">필수 형식</Label>
                                    <Textarea id="op-format-guide" value={newProductFormatGuide} onChange={(e) => setNewProductFormatGuide(e.target.value)} placeholder="예: 9:16 비율, 30초 이내 영상" className="min-h-[80px] resize-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProductModalOpen(false)}>취소</Button>
                        <Button onClick={handlePreview} disabled={isUploading} type="button">
                            미리보기 및 등록
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Product Guide Preview Modal */}
            <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-muted/30">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold text-foreground">제작 가이드 미리보기</DialogTitle>
                        <DialogDescription className="text-center">
                            크리에이터에게 보여질 가이드 화면입니다.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden my-2">
                        {/* Header Image */}
                        <div className="h-40 bg-muted relative group">
                            {newProductImage && newProductImage !== "📦" ? (
                                <img src={newProductImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                            )}
                            <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                                {newProductCategory || "카테고리"}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            <div className="text-center space-y-2 border-b border-border/50 pb-6">
                                <h3 className="text-xl font-black text-foreground">{newProductName || "제품명 없음"}</h3>
                                <p className="text-lg font-bold text-primary">
                                    {newProductPrice ? `${parseInt(newProductPrice).toLocaleString()}원` : "가격 미정"}
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed px-4">
                                    {newProductDescription || "제품 설명이 없습니다."}
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* Points */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> 소구 포인트
                                    </h4>
                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap">
                                        {newProductPoints || "등록된 소구 포인트가 없습니다."}
                                    </div>
                                </div>

                                {/* Required Shots */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1">
                                        <Camera className="h-3 w-3" /> 필수 촬영 컷
                                    </h4>
                                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">
                                        {newProductShots || "등록된 필수 촬영 컷이 없습니다."}
                                    </div>
                                </div>

                                {/* Guide */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1">
                                        <FileText className="h-3 w-3" /> 필수 가이드
                                    </h4>
                                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm space-y-4">
                                        {newProductContentGuide && (
                                            <div>
                                                <strong className="block text-foreground mb-1 font-bold">필수 포함 내용</strong>
                                                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{newProductContentGuide}</p>
                                            </div>
                                        )}
                                        {newProductFormatGuide && (
                                            <div>
                                                <strong className="block text-foreground mb-1 font-bold">필수 형식</strong>
                                                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{newProductFormatGuide}</p>
                                            </div>
                                        )}
                                        {!newProductContentGuide && !newProductFormatGuide && <p className="text-muted-foreground/70">등록된 필수 가이드가 없습니다.</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1">
                                        <AtSign className="h-3 w-3" /> 태그 및 계정
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {newProductAccountTag && (
                                            <span className="px-2 py-1 bg-background border border-border rounded-md text-xs font-bold text-foreground/90 shadow-sm">
                                                {newProductAccountTag}
                                            </span>
                                        )}
                                        {newProductHashtags.split(/[\s,]+/).filter(t => t).map((tag, i) => (
                                            <span key={i} className="px-2 py-1 bg-muted border border-border rounded-md text-xs text-muted-foreground">
                                                {tag.startsWith('#') ? tag : `#${tag}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>



                    <DialogFooter className="gap-2 sm:gap-0">
                        {!productModalOpen ? (
                            <Button onClick={() => setPreviewModalOpen(false)} className="w-full sm:w-auto font-bold">
                                닫기
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setPreviewModalOpen(false)} className="w-full sm:w-auto">
                                    <Pencil className="mr-2 h-4 w-4" /> 수정하기
                                </Button>
                                <Button onClick={handleFinalSubmit} disabled={isUploading} className="w-full sm:w-auto font-bold bg-primary hover:bg-primary/90">
                                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" /> {editingProductId ? "이대로 수정" : "이대로 등록"}
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Premium Deal Room Dialog */}
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <DialogContent className="max-w-[1500px] w-[95vw] h-[90vh] max-h-[900px] p-0 gap-0 overflow-hidden flex flex-col bg-background border-0 shadow-2xl rounded-2xl">
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

                    {/* Contract Send Confirmation Dialog */}
                    <AlertDialog open={confirmContractSend} onOpenChange={setConfirmContractSend}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>계약서 발송</AlertDialogTitle>
                                <AlertDialogDescription>
                                    서명과 함께 계약서를 발송하시겠습니까?
                                    <br />
                                    상대방이 서명하기 전까지는 수정하여 다시 보낼 수 있습니다.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setConfirmContractSend(false)}>취소</AlertDialogCancel>
                                <AlertDialogAction onClick={executeContractSend}>발송하기</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <BrandWorkspaceLayout />
                </DialogContent>
            </Dialog>

            {/* Signature Modal */}
            < Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen} >
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
                        <Button onClick={performContractSend} disabled={isSendingContract} className="gap-2">
                            {isSendingContract ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                            서명 완료 및 발송
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {/* Full Contract Viewer Dialog */}
            < Dialog open={isFullContractOpen} onOpenChange={setIsFullContractOpen} >
                <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col p-6 overflow-hidden">
                    <DialogHeader className="mb-4">
                        <DialogTitle>표준 광고 협업 계약서</DialogTitle>
                        <DialogDescription>작성된 계약서의 전체 내용입니다.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6 bg-muted/30 rounded-xl border border-border font-mono text-sm whitespace-pre-wrap">
                        {generatedContract || `제 1조 [목적]
본 계약은 '갑'(${user?.name || '브랜드'})과 '을'(${chatProposal?.influencer_name || '크리에이터'})간의 콘텐츠 제작 및 홍보 업무에 관한 제반 사항을 규정함을 목적으로 한다.

제 2조 [원고료 및 지급]
1. '갑'은 '을'에게 콘텐츠 제작의 대가로 금 ${chatProposal?.cost ? parseInt(chatProposal.cost).toLocaleString() : chatProposal?.compensation_amount || '0'}원을 지급한다.
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

export default function BrandDashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <BrandDashboardContent />
        </Suspense>
    )
}
