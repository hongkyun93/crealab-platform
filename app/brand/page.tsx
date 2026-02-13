"use client"

import React from "react"
import { Camera, Image as ImageIcon, Save, AlertCircle, Calculator } from "lucide-react" // Explicit import for debugging
import { WorkspaceProgressBar } from "@/components/workspace-progress-bar"
import { RateCardMessage } from "@/components/chat/rate-card-message"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { usePlatform, MOCK_BRAND_USER } from "@/components/providers/legacy-platform-hook"
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
        allEvents, fetchAllEvents, isAuthLoading // New: Public events
    } = usePlatform()

    // AI Calculator State
    const [showCalculator, setShowCalculator] = useState(false)

    // Force data refresh on mount to avoid stale data from navigation
    useEffect(() => {
        refreshData()
        fetchAllEvents() // New: Fetch public events for discovery
    }, []) // Stable refresh once on mount

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
                if (result.error) alert(result.error)
                else {
                    alert("상태가 변경되었습니다.")
                    await refreshData()
                    if (status === 'accepted') {
                        // Switch to Active tab and open Chat (Workstation)
                        setWorkspaceTab('active')
                        setActiveProposalTab('chat')
                    }
                }
            } catch (err) {
                alert("상태 변경 중 오류가 발생했습니다.")
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
                alert("계약서 생성에 실패했습니다: " + (data.error || "알 수 없는 오류"))
            }
        } catch (e) {
            console.error(e)
            alert("계약서 생성 중 오류가 발생했습니다.")
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
                chatProposal.influencer_id || chatProposal.influencerId || "influencer",
                msgContent,
                isCampaign ? pId : undefined,
                !isCampaign ? pId : undefined
            );

            // 3. Notify Creator
            await sendNotification(
                chatProposal.influencer_id || chatProposal.influencerId || "influencer",
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
            alert("조건 확정 중 오류가 발생했습니다.");
            setChatProposal(chatProposal); // Revert
        }
    };

    const handleSendMessage = async () => {
        if (!chatMessage.trim() || !chatProposal || !user || isSendingMessage) return

        const receiverId = chatProposal.influencer_id || chatProposal.influencerId || chatProposal.influencer?.id

        if (!receiverId) {
            alert("수신자를 찾을 수 없습니다.")
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
            alert("메시지 전송에 실패했습니다.")
        } finally {
            setIsSendingMessage(false)
        }
    }

    // Propose Modal State
    const [proposeModalOpen, setProposeModalOpen] = useState(false)
    const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null)
    const [offerProduct, setOfferProduct] = useState("")
    const [productType, setProductType] = useState("gift") // gift, loan
    const [compensation, setCompensation] = useState("")
    const [hasIncentive, setHasIncentive] = useState(false)
    const [incentiveDetail, setIncentiveDetail] = useState("")
    const [contentType, setContentType] = useState("")
    const [message, setMessage] = useState("")
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
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
            alert("서명을 입력해주세요.")
            return
        }

        if (!confirm("서명과 함께 계약서를 발송하시겠습니까? (상대방이 서명하기 전까지는 수정하여 다시 보낼 수 있습니다)")) return

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

            alert("계약서가 성공적으로 발송되었습니다.")
        } catch (e) {
            console.error(e)
            alert("계약서 발송 중 오류가 발생했습니다.")
        } finally {
            setIsSendingContract(false)
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
            alert("계약서 내용이 없습니다.")
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
            alert("운송장 번호를 입력해주세요.")
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

                alert("발송 정보가 업데이트되었습니다.")
            }
        } catch (e) {
            console.error("Shipping update failed:", e)
            alert("업데이트 중 오류가 발생했습니다.")
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
            alert("파일 크기는 300MB 이하여야 합니다.")
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
            alert(`이미지 업로드 실패\n오류 코드: ${errorCode}\n내용: ${errorMessage}\n(잠시 후 다시 시도해보세요)`)
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
            alert("세션이 만료되었습니다. 다시 로그인해주세요.")
            return
        }

        if (!offerProduct || !compensation || !contentType) {
            alert("필수 항목을 모두 입력해주세요.")
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

            let insertedProposal;
            try {
                insertedProposal = await createBrandProposal(proposalData);
            } catch (err: any) {
                console.warn("Retrying proposal submit...", err)
                if (err?.code === '42703' || err?.message?.includes('column')) {
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
                alert(`제안서 발송 실패: 데이터베이스 스키마와 일치하지 않는 필드가 있습니다.\n(${error.message})`)
            } else if (error?.code === '23503') { // foreign_key_violation
                alert(`제안서 발송 실패: 참조 데이터 오류 (이벤트 또는 사용자 ID가 유효하지 않음)\n(${error.message})`)
            } else {
                alert(`제안서 발송에 실패했습니다: ${error?.message || "알 수 없는 오류"}`)
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
            alert("제품명과 카테고리는 필수입니다.")
            return
        }
        if (isImageUploading) {
            alert("이미지 업로드가 아직 완료되지 않았습니다.")
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

            // Temporary Debug Alert
            // alert(`Debug: Submission Successful\nID: ${result?.id}\nTags: ${result?.tags}\nAccountTag: ${result?.accountTag}\nLink: ${result?.link}`)


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
            alert(isEditing ? "제품이 성공적으로 수정되었습니다!" : "제품이 성공적으로 등록되었습니다!")
        } catch (e: any) {
            console.error("[handleFinalSubmit] Exception:", e)
            alert(`제품 ${editingProductId ? '수정' : '등록'} 실패: ${e?.message || "알 수 없는 오류"}`)
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
            alert("프로필 정보가 저장되었습니다.")
        } catch (e: any) {
            console.error("Save profile error:", e)
            alert("저장 중 오류가 발생했습니다.")
        } finally {
            setIsSaving(false)
        }
    }

    const filteredEvents = getFilteredAndSortedEvents()
    const myCampaigns = user?.type === 'admin' ? campaigns : campaigns.filter(c => c.brandId === user?.id)
    const mySentProposals = user?.type === 'admin' ? brandProposals : brandProposals.filter(p => p.brand_id === user?.id)
    const myProducts = user?.type === 'admin' ? products : products.filter(p => p.brandId === user?.id)

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
                        myProducts={myProducts}
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

    if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

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
                                <p className="text-xs text-muted-foreground truncate">{user?.type === 'brand' ? '브랜드 계정' : user?.type}</p>
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
                <DialogContent className="max-w-[1100px] p-0 overflow-hidden flex h-[85vh] bg-background border-0 shadow-2xl rounded-2xl">
                    <div className="flex h-full w-full">
                        {/* Left Sidebar: Deal Info & Workflow */}
                        <div className="w-80 bg-muted/30 border-r border-border flex flex-col shrink-0 animate-in slide-in-from-left duration-300">
                            <div className="p-6 border-b border-border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-14 w-14 rounded-full border-2 border-background shadow-md overflow-hidden bg-background flex items-center justify-center font-bold text-xl text-primary">
                                        {(chatProposal?.influencer_avatar || chatProposal?.influencerId) ? (
                                            <img
                                                src={chatProposal?.influencer_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatProposal?.influencer_name}`}
                                                className="h-full w-full object-cover"
                                                alt="avatar"
                                            />
                                        ) : (
                                            chatProposal?.influencer_name?.[0] || 'C'
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-foreground truncate">{chatProposal?.influencer_name || chatProposal?.influencerName}</h3>
                                        <p className="text-xs text-muted-foreground truncate">{chatProposal?.product_name || "제품 협력"}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${chatProposal?.status === 'accepted' ? 'bg-emerald-500 text-white' :
                                                chatProposal?.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'
                                                }`}>
                                                {chatProposal?.status === 'accepted' ? '진행 중' :
                                                    chatProposal?.status === 'rejected' ? '거절됨' :
                                                        chatProposal?.status === 'pending' ? '보류 중' : '검토 요청됨'}
                                            </span>
                                            <span className="text-[10px] font-bold text-emerald-600">
                                                {chatProposal?.cost ? `${(chatProposal.cost as any).toLocaleString()}원` : chatProposal?.compensation_amount || '0'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Workflow Steps */}
                                <div className="space-y-6 overflow-y-auto">
                                    <div>
                                        <h4 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider mb-4 px-2">진행 단계</h4>
                                        <ul className="space-y-1">
                                            {(() => {
                                                // Determine current step index
                                                // 0: Negotiation (Default)
                                                // 1: Contract (Accepted status)
                                                // 2: Shipping (Contract Signed)
                                                // 3: Content (Shipped)
                                                // 4: Complete (Completed)

                                                let currentStepIndex = 0;
                                                if (chatProposal?.brand_condition_confirmed && chatProposal?.influencer_condition_confirmed) currentStepIndex = 1;
                                                if (chatProposal?.contract_status === 'signed') currentStepIndex = 2;
                                                if (chatProposal?.delivery_status === 'shipped' || chatProposal?.delivery_status === 'delivered') currentStepIndex = 3;
                                                if (chatProposal?.content_submission_url || chatProposal?.content_submission_file_url) {
                                                    if (chatProposal?.content_submission_status === 'approved' || chatProposal?.status === 'completed') {
                                                        currentStepIndex = 4;
                                                    } else {
                                                        currentStepIndex = 3;
                                                    }
                                                }
                                                if (chatProposal?.status === 'completed') currentStepIndex = 5; // All done

                                                const steps = [
                                                    { id: 0, label: "조건 조율 및 확정", tab: "chat" },
                                                    { id: 1, label: "전자 계약서 (서명/발송)", tab: "contract" },
                                                    { id: 2, label: "제품 발송/제공", tab: "shipping" },
                                                    { id: 3, label: "콘텐츠 작업 및 제출", tab: "content" },
                                                    { id: 4, label: "최종 완료 및 정산", tab: "content" }
                                                ];

                                                return steps.map((step, idx) => {
                                                    const isDone = idx < currentStepIndex || chatProposal?.status === 'completed';
                                                    const isCurrent = idx === currentStepIndex && chatProposal?.status !== 'completed';
                                                    const isLocked = idx > currentStepIndex;

                                                    return (
                                                        <li
                                                            key={step.id}
                                                            onClick={() => !isLocked && setActiveProposalTab(step.tab)}
                                                            className={`
                                                                relative pl-8 py-2.5 text-sm rounded-lg transition-all duration-200 cursor-pointer
                                                                ${isDone ? 'text-emerald-700 font-bold bg-emerald-50/50 hover:bg-emerald-100' :
                                                                    isCurrent ? 'text-amber-900 font-bold bg-yellow-50 border border-yellow-200 shadow-sm' :
                                                                        'text-muted-foreground/70 opacity-60 hover:opacity-100 hover:bg-muted/30'}
                                                            `}
                                                        >
                                                            <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 
                                                                ${isDone ? 'bg-emerald-500 border-emerald-500' :
                                                                    isCurrent ? 'bg-background border-yellow-500 animate-pulse' :
                                                                        'border-slate-300'}
                                                            `} />
                                                            {isCurrent && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] bg-amber-600 text-white px-1.5 py-0.5 rounded-full font-bold">NOW</span>}
                                                            {step.label}
                                                        </li>
                                                    );
                                                });
                                            })()}
                                        </ul>
                                    </div>

                                    {chatProposal?.status === 'accepted' && (
                                        <div className="px-2">
                                            <Button
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md animate-in slide-in-from-bottom-2 fade-in duration-500"
                                                onClick={async () => {
                                                    if (!confirm("모든 절차(정산 포함)가 완료되었나요? 완료 처리하면 '완료된 워크스페이스'로 이동합니다.")) return;

                                                    const isCampaignProposal = !!chatProposal.campaignId || (chatProposal as any)?.type === 'creator_apply';
                                                    const proposalId = chatProposal.id?.toString();

                                                    try {
                                                        if (isCampaignProposal) {
                                                            await updateProposal(proposalId as string, { status: 'completed', completed_at: new Date().toISOString() });
                                                        } else {
                                                            await updateBrandProposal(proposalId as string, { status: 'completed', completed_at: new Date().toISOString() });
                                                        }
                                                        setChatProposal((prev: any) => ({ ...prev, status: 'completed', completed_at: new Date().toISOString() }));
                                                        alert("협업이 성공적으로 완료되었습니다!");
                                                    } catch (e) {
                                                        console.error(e);
                                                        alert("상태 업데이트 실패");
                                                    }
                                                }}
                                            >
                                                <BadgeCheck className="mr-2 h-4 w-4" /> 프로젝트 최종 완료
                                            </Button>
                                            <p className="text-[10px] text-muted-foreground/70 mt-2 text-center">
                                                * 정산 및 성과 보고가 끝난 후 눌러주세요.
                                            </p>
                                        </div>
                                    )}

                                    <div className="px-2">
                                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-xs shadow-sm">
                                            <p className="font-bold text-primary mb-2 flex items-center gap-1.5">
                                                <Info className="h-3.5 w-3.5" /> MD's Tip
                                            </p>
                                            <p className="text-muted-foreground leading-relaxed">
                                                크리에이터에게 <strong>계약서</strong>를 먼저 발송해주세요. 서명이 완료되면 다음 단계로 넘어갑니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto p-4 border-t border-border bg-muted/50 text-[10px] text-muted-foreground/70 text-center font-medium tracking-tight">
                                CreadyPick Secure Workspace™
                            </div>
                        </div>

                        {/* Right Content: Workspace Tabs */}
                        <Tabs value={activeProposalTab} onValueChange={setActiveProposalTab} className="flex-1 flex flex-col min-w-0 bg-background shadow-inner">
                            <div className="px-8 py-5 border-b border-border/50 flex items-center justify-between shrink-0 bg-background z-10">
                                <div>
                                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground">워크스페이스</DialogTitle>
                                    <DialogDescription className="text-muted-foreground text-sm">{chatProposal?.influencer_name}님과의 협업 공간입니다.</DialogDescription>
                                </div>
                                <TabsList className="bg-muted p-1 rounded-xl h-11 overflow-x-auto inline-flex w-full sm:w-auto">
                                    <TabsTrigger value="chat" className="rounded-lg px-6 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">소통</TabsTrigger>
                                    <TabsTrigger value="contract" className="rounded-lg px-6 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">계약 관리</TabsTrigger>
                                    <TabsTrigger value="shipping" className="rounded-lg px-6 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">배송 관리</TabsTrigger>
                                    <TabsTrigger value="content" className="rounded-lg px-6 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">콘텐츠 관리</TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Chat Tab */}
                            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 m-0 data-[state=active]:flex bg-muted/30/30">
                                <div className="flex-1 overflow-hidden flex">
                                    {/* Left Panel: Conditions & Summary (Persistent) */}
                                    <div className="w-[400px] border-r border-border bg-background overflow-y-auto p-6 space-y-6">

                                        {/* 0. Application Review (For Inbound Proposals) */}
                                        {(chatProposal?.status === 'pending' || chatProposal?.status === 'viewed') && (
                                            <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-4 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <BadgeCheck className="h-5 w-5 text-blue-600" />
                                                    <h3 className="font-bold text-lg text-foreground">지원서 검토</h3>
                                                </div>

                                                <div className="space-y-4 py-2">
                                                    {chatProposal.instagramHandle && (
                                                        <div className="bg-card p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                                            <Label className="text-xs text-muted-foreground block mb-1">활동 계정</Label>
                                                            <p className="font-medium text-sm">{chatProposal.instagramHandle}</p>
                                                        </div>
                                                    )}

                                                    {chatProposal.motivation && (
                                                        <div className="bg-card p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                                            <Label className="text-xs text-muted-foreground block mb-1">지원 동기</Label>
                                                            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{chatProposal.motivation}</p>
                                                        </div>
                                                    )}

                                                    {chatProposal.content_plan && (
                                                        <div className="bg-card p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                                            <Label className="text-xs text-muted-foreground block mb-1">콘텐츠 제작 계획</Label>
                                                            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{chatProposal.content_plan}</p>
                                                        </div>
                                                    )}

                                                    {chatProposal.portfolioLinks && chatProposal.portfolioLinks.length > 0 && (
                                                        <div className="bg-card p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                                            <Label className="text-xs text-muted-foreground block mb-1">포트폴리오</Label>
                                                            <ul className="text-sm list-disc pl-4 space-y-1">
                                                                {chatProposal.portfolioLinks.map((link: string, i: number) => (
                                                                    <li key={i}>
                                                                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                                                            {link}
                                                                        </a>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {chatProposal.insightScreenshot && (
                                                        <div className="bg-card p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                                            <Label className="text-xs text-muted-foreground block mb-1">인사이트 캡처</Label>
                                                            <a href={chatProposal.insightScreenshot} target="_blank" rel="noopener noreferrer">
                                                                <img src={chatProposal.insightScreenshot} alt="Insight" className="mt-1 w-full rounded-md border border-border hover:opacity-90 transition-opacity" />
                                                            </a>
                                                        </div>
                                                    )}

                                                    <div className="bg-card p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                                        <Label className="text-xs text-muted-foreground block mb-1">어필 메시지</Label>
                                                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{chatProposal.message || "메시지 없음"}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md font-bold"
                                                        onClick={() => handleStatusUpdate(chatProposal.id, 'accepted')}
                                                    >
                                                        수락하기
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 border-border hover:bg-red-50 hover:text-red-600 hover:border-red-100 font-bold text-muted-foreground"
                                                        onClick={() => handleStatusUpdate(chatProposal.id, 'rejected')}
                                                    >
                                                        거절하기
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 mb-2">
                                            <BadgeCheck className="h-5 w-5 text-primary" />
                                            <h3 className="font-bold text-lg text-foreground">협업 조건</h3>
                                        </div>

                                        {/* 1. Shared Conditions Summary */}
                                        {chatProposal && (
                                            <Card className="bg-muted/30 border-border/50 shadow-sm">
                                                <CardContent className="p-4 space-y-4">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-muted-foreground">제품명</Label>
                                                        <p className="font-bold text-sm">{chatProposal.product_name || chatProposal.productName || "-"}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-muted-foreground">제공 혜택</Label>
                                                            <p className="font-bold text-sm">
                                                                {chatProposal.compensation_amount || chatProposal.cost ?
                                                                    (chatProposal.compensation_amount || `${parseInt(chatProposal.cost).toLocaleString()}원`) :
                                                                    "협의"}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-muted-foreground">콘텐츠 유형</Label>
                                                            <Badge variant="outline" className="bg-background">{chatProposal.content_type || "유형 미정"}</Badge>
                                                        </div>
                                                    </div>
                                                    {chatProposal.has_incentive && (
                                                        <div className="space-y-1 pt-2 border-t border-border/50">
                                                            <Label className="text-xs text-primary font-bold">인센티브 (판매 수수료)</Label>
                                                            <p className="text-xs text-foreground/90">{chatProposal.incentive_detail || `${chatProposal.commission}%`}</p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* 2. Condition Editing Card (Mutual Confirmation) - Synced with Creator View */}
                                        {chatProposal && (
                                            <div className="mb-6 p-6 bg-muted/30 border border-border rounded-2xl animate-in fade-in slide-in-from-top-5 duration-700">
                                                <div className="flex flex-col gap-2 mb-4">
                                                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                                        <BadgeCheck className="h-5 w-5 text-indigo-600" /> 조건 확정 (Mutual Confirmation)
                                                    </h4>
                                                    <div className="flex items-center">
                                                        {chatProposal.brand_condition_confirmed && chatProposal.influencer_condition_confirmed ? (
                                                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-200 whitespace-nowrap">
                                                                ✅ 양측 확정 완료
                                                            </span>
                                                        ) : (
                                                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-200 whitespace-nowrap">
                                                                ⏳ 확정 대기 중
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-6">
                                                    계약서 작성 전, 협의된 조건(금액, 일정 등)에 대해 양측이 최종 확정을 해야 합니다.<br />
                                                    양측 모두 확정 버튼을 누르면 계약서 생성 단계로 넘어갑니다.
                                                </p>

                                                {/* Condition Fields Grid */}
                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    {[
                                                        { label: "초안 제출", key: "condition_draft_submission_date", placeholder: "날짜 선택" },
                                                        { label: "최종본 제출", key: "condition_final_submission_date", placeholder: "날짜 선택" },
                                                        { label: "업로드 일정", key: "condition_upload_date", placeholder: "날짜 선택" },
                                                    ].map((field) => (
                                                        <div key={field.key} className="space-y-1">
                                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{field.label}</Label>
                                                            <Input
                                                                type="date"
                                                                className="h-8 text-xs bg-background"
                                                                value={chatProposal?.[field.key] || ""}
                                                                onChange={(e) => setChatProposal({ ...chatProposal, [field.key]: e.target.value })}
                                                                onBlur={async (e) => {
                                                                    const val = e.target.value;
                                                                    const isCampaign = !!chatProposal.campaignId || (chatProposal as any)?.type === 'creator_apply'
                                                                    const pId = chatProposal.id.toString()
                                                                    try {
                                                                        if (isCampaign) {
                                                                            await updateProposal(pId, { [field.key]: val })
                                                                        } else {
                                                                            await updateBrandProposal(pId, { [field.key]: val })
                                                                        }
                                                                    } catch (err) {
                                                                        console.error("Save failed", err)
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">2차 활용 기간 (개월)</Label>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                className="h-8 text-xs bg-background pr-8"
                                                                placeholder="0"
                                                                value={(() => {
                                                                    // Extract number from string cleanly
                                                                    const val = chatProposal.condition_secondary_usage_period || "";
                                                                    if (val === "불가능") return "0";
                                                                    return val.replace(/[^0-9]/g, "");
                                                                })()}
                                                                onChange={(e) => {
                                                                    const numVal = e.target.value;
                                                                    setChatProposal({
                                                                        ...chatProposal,
                                                                        condition_secondary_usage_period: numVal ? `${numVal}개월` : ""
                                                                    });
                                                                }}
                                                                onBlur={async (e) => {
                                                                    const numVal = e.target.value;
                                                                    // If 0 or empty, save as '불가능' or '0개월' -> User asked for 0 to n. 
                                                                    // '0개월' is clearer than '불가능' given the new input style, but sticking to text format for compatibility.
                                                                    // Let's save as 'X개월'. If 0, '0개월'.
                                                                    const valToSave = numVal ? `${numVal}개월` : "0개월";

                                                                    const isCampaign = !!chatProposal.campaignId || (chatProposal as any)?.type === 'creator_apply'
                                                                    const pId = chatProposal.id.toString()
                                                                    try {
                                                                        if (isCampaign) {
                                                                            await updateProposal(pId, { condition_secondary_usage_period: valToSave })
                                                                        } else {
                                                                            await updateBrandProposal(pId, { condition_secondary_usage_period: valToSave })
                                                                        }
                                                                    } catch (err) {
                                                                        console.error(err)
                                                                    }
                                                                }}
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/70">개월</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end mb-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs text-muted-foreground/70 hover:text-muted-foreground"
                                                        onClick={() => alert("자동 저장됩니다.")}
                                                    >
                                                        <Save className="mr-1.5 h-3 w-3" /> 변경사항 자동 저장됨
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    {/* Creator Status (Them) */}
                                                    <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${chatProposal.influencer_condition_confirmed ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-background border-border'}`}>
                                                        <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">Creator</span>
                                                        {chatProposal.influencer_condition_confirmed ? (
                                                            <div className="text-indigo-700 font-bold text-sm flex items-center gap-1">
                                                                <BadgeCheck className="h-4 w-4" /> 확정 완료
                                                            </div>
                                                        ) : (
                                                            <div className="text-muted-foreground/70 font-bold text-xs">확정 대기 중</div>
                                                        )}
                                                    </div>

                                                    {/* Brand Status (Me) */}
                                                    <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${chatProposal.brand_condition_confirmed ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-background border-border'}`}>
                                                        <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">Brand (본인)</span>
                                                        {chatProposal.brand_condition_confirmed ? (
                                                            <Button size="sm" className="h-8 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold shadow-none border border-indigo-200 pointer-events-none">
                                                                <BadgeCheck className="mr-1.5 h-4 w-4" /> 확정 완료
                                                            </Button>
                                                        ) : (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-8 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md"
                                                                    >
                                                                        조건 확정하기
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>조건 확정</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            현재 작성된 조건(일정 및 활용 기간 등)으로 확정하시겠습니까?<br />
                                                                            확정 후에는 수정이 제한될 수 있습니다.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>취소</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={executeConfirmCondition}>확정</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Right Panel: Chat Stream */}
                                    <div className="flex-1 flex flex-col min-w-0 bg-muted/30/30">
                                        <div className="flex-1 overflow-y-auto p-8 space-y-6" ref={workspaceChatRef}>
                                            <div className="flex justify-center pb-4">
                                                <span className="text-[10px] text-slate-300 bg-muted px-3 py-1 rounded-full">
                                                    채팅 내역의 시작입니다
                                                </span>
                                            </div>

                                            {messages
                                                .filter(m => {
                                                    if (!chatProposal) return false
                                                    const pId = chatProposal.influencer_id || chatProposal.influencerId || chatProposal.influencer?.id

                                                    // 1. Basic User Match
                                                    const isUserMatch = (m.senderId === user?.id && m.receiverId === pId) || (m.senderId === pId && m.receiverId === user?.id)
                                                    if (!isUserMatch) return false

                                                    // 2. Strict Context Match (Proposal ID)
                                                    const isCampaignProposal = (chatProposal as any)?.type === 'creator_apply' || !!(chatProposal as any)?.campaignId
                                                    const currentProposalId = chatProposal.id?.toString()

                                                    if (isCampaignProposal) {
                                                        return m.proposalId == currentProposalId
                                                    } else {
                                                        return m.brandProposalId == currentProposalId
                                                    }
                                                })
                                                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                                .map((msg, idx) => {
                                                    // Helper to render Guide Card (Brand View)
                                                    const renderGuideCard = () => {
                                                        const pId = chatProposal?.product_id;
                                                        const pName = chatProposal?.product_name;

                                                        const prod = pId ? myProducts.find(p => p.id === pId) : null;

                                                        // @ts-ignore
                                                        if (!prod || (!prod.selling_points && !prod.required_shots && !prod.points && !prod.shots)) return null;

                                                        const gData = {
                                                            name: prod.name,
                                                            // @ts-ignore
                                                            sellingPoints: prod.selling_points || prod.points,
                                                            // @ts-ignore
                                                            requiredShots: prod.required_shots || prod.shots,
                                                            // @ts-ignore
                                                            imageUrl: prod.image_url || prod.image || ((prod as any).image_url)
                                                        };

                                                        return (
                                                            <div className="flex justify-end animate-in fade-in slide-in-from-right-2 delay-150 mt-4">
                                                                <div className="max-w-[75%] flex flex-col items-end">
                                                                    <div className="bg-muted/30 border border-border rounded-2xl rounded-tr-none p-4 shadow-sm text-left relative">
                                                                        <div className="w-[280px]">
                                                                            <div className="flex items-center gap-2 mb-3 border-b border-border/50 pb-2">
                                                                                <div className="bg-emerald-100 text-emerald-600 p-1 rounded-md">
                                                                                    <Package className="h-4 w-4" />
                                                                                </div>
                                                                                <span className="font-bold text-sm text-foreground/90">제작 가이드 {pName}</span>
                                                                            </div>
                                                                            {gData.imageUrl && (
                                                                                <div className="mb-3 rounded-md overflow-hidden h-32 bg-slate-200">
                                                                                    <img src={gData.imageUrl} alt="Product" className="w-full h-full object-cover" />
                                                                                </div>
                                                                            )}
                                                                            <div className="space-y-3 text-xs">
                                                                                {gData.sellingPoints && (
                                                                                    <div>
                                                                                        <strong className="block text-emerald-700 mb-1">✨ 소구 포인트</strong>
                                                                                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{gData.sellingPoints}</p>
                                                                                    </div>
                                                                                )}
                                                                                {gData.requiredShots && (
                                                                                    <div>
                                                                                        <strong className="block text-red-600 mb-1">📸 필수 촬영 컷</strong>
                                                                                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{gData.requiredShots}</p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <span className="block text-[10px] opacity-70 mt-1 text-right">
                                                                            자동 발송됨
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    }

                                                    return (
                                                        <React.Fragment key={msg.id}>
                                                            <div className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                                                <div className={`max-w-[75%] flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                                                                    <div className={`p-4 rounded-2xl text-sm shadow-sm leading-relaxed transition-all hover:shadow-md ${msg.senderId === user?.id
                                                                        ? 'bg-primary text-white rounded-tr-none'
                                                                        : 'bg-background border border-border text-foreground rounded-tl-none'
                                                                        }`}>
                                                                        {msg.content.startsWith('[RATE_CARD_JSON]') ? (
                                                                            (() => {
                                                                                try {
                                                                                    const jsonStr = msg.content.replace('[RATE_CARD_JSON]', '');
                                                                                    const rateData = JSON.parse(jsonStr);
                                                                                    return <RateCardMessage {...rateData} />;
                                                                                } catch (e) {
                                                                                    return "단가표 로딩 오류";
                                                                                }
                                                                            })()
                                                                        ) : msg.content.startsWith('[GUIDE_CARD_JSON]') ? (
                                                                            (() => {
                                                                                try {
                                                                                    const jsonStr = msg.content.replace('[GUIDE_CARD_JSON]', '');
                                                                                    const guideData = JSON.parse(jsonStr);
                                                                                    return (
                                                                                        <div className="w-[280px] bg-muted/30 border border-border rounded-lg p-4 overflow-hidden text-left">
                                                                                            <div className="flex items-center gap-2 mb-3 border-b border-border/50 pb-2">
                                                                                                <div className="bg-emerald-100 text-emerald-600 p-1 rounded-md">
                                                                                                    <Package className="h-4 w-4" />
                                                                                                </div>
                                                                                                <span className="font-bold text-sm text-foreground/90">제작 가이드 (자동 발송)</span>
                                                                                            </div>
                                                                                            {guideData.imageUrl && (
                                                                                                <div className="mb-3 rounded-md overflow-hidden h-32 bg-slate-200">
                                                                                                    <img src={guideData.imageUrl} alt="Product" className="w-full h-full object-cover" />
                                                                                                </div>
                                                                                            )}
                                                                                            <div className="space-y-3 text-xs">
                                                                                                {guideData.sellingPoints && (
                                                                                                    <div>
                                                                                                        <strong className="block text-emerald-700 mb-1">✨ 소구 포인트</strong>
                                                                                                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{guideData.sellingPoints}</p>
                                                                                                    </div>
                                                                                                )}
                                                                                                {guideData.requiredShots && (
                                                                                                    <div>
                                                                                                        <strong className="block text-red-600 mb-1">📸 필수 촬영 컷</strong>
                                                                                                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{guideData.requiredShots}</p>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                } catch (e) {
                                                                                    return "제작 가이드 로딩 오류";
                                                                                }
                                                                            })()
                                                                        ) : (
                                                                            msg.content
                                                                        )}
                                                                    </div>
                                                                    <span className="text-[10px] text-muted-foreground/70 mt-2 font-medium px-1">
                                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {/* Auto-render Guide Card after Rate Card (Brand View: Justify End) */}
                                                            {msg.content.startsWith('[RATE_CARD_JSON]') && renderGuideCard()}
                                                        </React.Fragment>
                                                    )
                                                })
                                            }
                                        </div>

                                        {/* Message Input Area */}
                                        <div className="p-4 bg-background border-t border-border z-10 sticky bottom-0">
                                            <div className="flex gap-2 items-end max-w-4xl mx-auto">
                                                <Textarea
                                                    value={chatMessage}
                                                    onChange={(e) => setChatMessage(e.target.value)}
                                                    placeholder="메시지를 입력하세요..."
                                                    className="min-h-[44px] max-h-[120px] resize-none border-border focus:border-primary focus:ring-primary/20 bg-muted/30/50"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault()
                                                            handleSendMessage()
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    onClick={handleSendMessage}
                                                    disabled={isSendingMessage || !chatMessage.trim()}
                                                    className="h-[44px] px-6 rounded-xl bg-primary hover:bg-primary/90 shadow-sm transition-all hover:scale-105 active:scale-95"
                                                >
                                                    {isSendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Contract Tab */}
                            < TabsContent value="contract" className="flex-1 overflow-y-auto p-10 bg-muted/30 data-[state=active]:flex flex-col items-center" >
                                <div className="w-full max-w-3xl animate-in zoom-in-95 duration-300">
                                    <div className="bg-background p-10 rounded-3xl shadow-xl border border-border/50 flex flex-col h-full">
                                        <div className="text-center mb-10">
                                            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 rotate-3">
                                                <FileText className="h-10 w-10 text-primary" />
                                            </div>
                                            <h3 className="text-2xl font-black text-foreground tracking-tight">협업 전자 계약서</h3>
                                            <p className="text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">대화 내용을 분석하여 법적 효력을 갖춘 표준 계약서 초안을 생성합니다.</p>
                                        </div>

                                        <div className="space-y-5 flex-1 flex flex-col min-h-0">
                                            <div className="flex justify-between items-end px-1">
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-black text-foreground uppercase tracking-tight">계약 조항 초안</h4>
                                                    <p className="text-xs text-muted-foreground/70 font-medium">실시간 합의 내용이 자동으로 반영됩니다.</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="bg-primary/5 text-primary text-xs font-black gap-2 h-9 px-4 rounded-xl hover:bg-primary/10 hover:text-primary active:scale-95 transition-all shadow-sm"
                                                    onClick={handleGenerateContract}
                                                    disabled={isGeneratingContract || !chatProposal?.brand_condition_confirmed || !chatProposal?.influencer_condition_confirmed}
                                                >
                                                    {isGeneratingContract ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
                                                    {(!chatProposal?.brand_condition_confirmed || !chatProposal?.influencer_condition_confirmed)
                                                        ? "조건 확정 후 계약 생성 가능"
                                                        : "AI 대화 기반 계약 자동 생성"}
                                                </Button>
                                            </div>

                                            <div className="flex-1 p-8 bg-muted/30/80 rounded-3xl border border-border text-sm text-foreground/90 leading-relaxed font-mono min-h-[300px] overflow-y-auto shadow-inner relative whitespace-pre-wrap selection:bg-primary/20">
                                                {generatedContract ? (
                                                    <div>
                                                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                                                            <strong>Tip:</strong> 이 내용은 AI가 생성한 초안의 일부(요약)입니다. 전체 내용은 하단의 '전체 내용 본문 보기'를 통해 확인하세요.
                                                        </div>
                                                        {generatedContract.slice(0, 500)}...
                                                        <div className="mt-4 text-center text-muted-foreground text-xs">
                                                            (이하 생략)
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full opacity-30 select-none">
                                                        <p className="text-lg font-bold">계약서 초안을 작성해주세요</p>
                                                        <p className="text-[11px] mt-1">상단의 자동 생성 버튼을 누르면 대화를 분석합니다.</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-center flex gap-3 justify-center">
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="text-xs font-bold text-muted-foreground underline underline-offset-4 decoration-slate-300 hover:text-primary transition-colors"
                                                    onClick={() => setIsFullContractOpen(true)}
                                                >
                                                    계약서 전체 내용 본문 보기
                                                </Button>
                                                {chatProposal?.contract_content && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs h-7 gap-1"
                                                        onClick={handleDownloadContract}
                                                    >
                                                        <FileText className="h-3 w-3" /> PDF 다운로드
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-8 mt-auto">
                                            <Button
                                                className="w-full h-14 text-lg font-black bg-slate-900 hover:bg-black rounded-2xl shadow-xl transition-all active:scale-[0.98] group"
                                                onClick={handleSendContract}
                                                disabled={!generatedContract || isSendingContract || chatProposal?.contract_status === 'signed'}
                                            >
                                                <Send className="mr-3 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                {chatProposal?.contract_status === 'sent' ? "수정된 계약서 다시 보내기" : isSendingContract ? "발송 중..." : "작성된 계약서 크리에이터에게 발송하기"}
                                            </Button>
                                            <p className="text-center text-[10px] text-muted-foreground/70 mt-4 font-medium uppercase tracking-widest">
                                                Electronic Signature Powered by CreadyPick Secure™
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent >

                            <TabsContent value="shipping" className="flex-1 overflow-y-auto p-12 bg-muted/30 data-[state=active]:flex flex-col items-center">
                                <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Product Delivery Section */}
                                    <div className="bg-background border border-border rounded-[30px] p-10 shadow-lg">
                                        <div className="flex items-center gap-6 mb-8 border-b border-border/50 pb-6">
                                            <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                                                <Package className="h-8 w-8 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-foreground tracking-tight">제품 배송 관리</h3>
                                                <p className="text-muted-foreground mt-1">크리에이터에게 제품을 발송하고 운송장 번호를 등록하세요.</p>
                                            </div>
                                        </div>

                                        {chatProposal?.contract_status !== 'signed' ? (
                                            <div className="text-center py-10 bg-muted/30 rounded-2xl border border-dashed text-muted-foreground/70">
                                                <p className="font-bold">🔒 계약이 완료되지 않았습니다</p>
                                                <p className="text-xs mt-1">계약이 체결되면 배송 관리 기능이 활성화됩니다.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="bg-muted/30 p-6 rounded-2xl border border-border">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="font-bold text-foreground flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-muted-foreground" /> 배송지 정보
                                                        </h4>
                                                        {!chatProposal.shipping_address && (
                                                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">미입력</span>
                                                        )}
                                                    </div>

                                                    {chatProposal.shipping_address ? (
                                                        <div className="space-y-3 text-sm">
                                                            <div className="flex gap-4">
                                                                <span className="text-muted-foreground w-16 shrink-0">받는 분</span>
                                                                <span className="font-bold text-foreground">{chatProposal.shipping_name}</span>
                                                            </div>
                                                            <div className="flex gap-4">
                                                                <span className="text-muted-foreground w-16 shrink-0">연락처</span>
                                                                <span className="font-bold text-foreground">{chatProposal.shipping_phone}</span>
                                                            </div>
                                                            <div className="flex gap-4">
                                                                <span className="text-muted-foreground w-16 shrink-0">주소</span>
                                                                <span className="font-bold text-foreground break-keep">{chatProposal.shipping_address}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-muted-foreground/70 text-sm py-4 text-center">
                                                            크리에이터가 아직 배송 정보를 입력하지 않았습니다.
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="border-t border-border/50 pt-6">
                                                    <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-muted-foreground" /> 운송장 등록
                                                    </h4>

                                                    {chatProposal.tracking_number ? (
                                                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col gap-4">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-emerald-700 font-bold text-xs uppercase mb-1">Status: Shipped</p>
                                                                    <p className="text-foreground font-black text-lg">{chatProposal.tracking_number}</p>
                                                                </div>
                                                                <Button variant="outline" size="sm" className="h-8 text-xs bg-background text-muted-foreground hover:text-foreground"
                                                                    onClick={() => {
                                                                        if (confirm("운송장 번호를 수정하시겠습니까?")) {
                                                                            setTrackingInput(chatProposal.tracking_number || "");
                                                                        }
                                                                    }}>
                                                                    발송 완료됨
                                                                </Button>
                                                            </div>
                                                            {chatProposal.delivery_status === 'delivered' && (
                                                                <div className="bg-background/60 p-3 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm">
                                                                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                                                                    크리에이터가 제품을 수령 하였습니다.
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-3">
                                                            <Input
                                                                placeholder="운송장 번호를 입력하세요"
                                                                className="h-12 bg-background text-lg font-mono tracking-widest"
                                                                value={trackingInput}
                                                                onChange={(e) => setTrackingInput(e.target.value)}
                                                                disabled={!chatProposal.shipping_address}
                                                            />
                                                            <Button
                                                                className="h-12 w-24 font-bold bg-slate-900 rounded-xl"
                                                                onClick={handleUpdateShipping}
                                                                disabled={!chatProposal.shipping_address || isUpdatingShipping}
                                                            >
                                                                {isUpdatingShipping ? <Loader2 className="h-5 w-5 animate-spin" /> : "발송"}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="content" className="flex-1 overflow-y-auto p-12 bg-muted/30 data-[state=active]:flex flex-col items-center">
                                <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Result Management Section */}
                                    <div className={`border border-border rounded-[30px] p-8 transition-all ${chatProposal?.content_submission_status === 'submitted' ? 'bg-indigo-50 border-indigo-200 shadow-xl dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-background shadow-lg opacity-90'}`}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center rotate-3 shadow-sm ${chatProposal?.content_submission_status === 'submitted' ? 'bg-indigo-600 text-white' : 'bg-muted'}`}>
                                                <Star className={`h-6 w-6 ${chatProposal?.content_submission_status === 'submitted' ? 'text-white' : 'text-muted-foreground/70'}`} />
                                            </div>
                                            <h3 className={`text-xl font-bold ${chatProposal?.content_submission_status === 'submitted' ? 'text-indigo-900' : 'text-foreground'}`}>작업 결과물 관리</h3>
                                            {chatProposal?.content_submission_status && (
                                                <Badge className={`${chatProposal?.content_submission_status === 'submitted' ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-muted-foreground'}`}>
                                                    {chatProposal?.content_submission_status === 'submitted' ? '제출됨' : chatProposal?.content_submission_status}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Work Submission Display */}
                                        {(chatProposal?.content_submission_url || chatProposal?.content_submission_file_url) ? (
                                            <div className="space-y-4">
                                                <p className="text-muted-foreground mb-2 text-sm font-medium">크리에이터가 작업물을 제출했습니다.</p>

                                                {/* Embedded Work Preview for Brand */}
                                                <div className="mb-6 overflow-hidden rounded-xl border border-indigo-100 dark:border-indigo-900 bg-background shadow-sm">
                                                    {chatProposal.content_submission_file_url ? (
                                                        <div className="aspect-video w-full bg-slate-900 flex items-center justify-center relative group">
                                                            {chatProposal.content_submission_file_url.match(/\.(mp4|mov|webm)$/i) ? (
                                                                <video
                                                                    src={chatProposal.content_submission_file_url}
                                                                    controls
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={chatProposal.content_submission_file_url}
                                                                    alt="Submission Preview"
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            )}
                                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button size="xs" variant="secondary" onClick={() => window.open(chatProposal.content_submission_file_url, '_blank')} className="h-7 text-[10px] font-bold">
                                                                    전체화면
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : chatProposal.content_submission_url ? (
                                                        <div className="aspect-video w-full bg-muted flex flex-col items-center justify-center p-6 text-center">
                                                            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                                                                <ExternalLink className="h-5 w-5 text-indigo-500" />
                                                            </div>
                                                            <p className="text-sm font-bold text-foreground mb-1 truncate max-w-full px-4">
                                                                {chatProposal.content_submission_url}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mb-4">제출된 외부 링크입니다.</p>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => window.open(chatProposal.content_submission_url, '_blank')}
                                                                className="h-8 text-xs border-indigo-200 text-indigo-600 font-bold"
                                                            >
                                                                링크 열기
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="p-12 text-center text-muted-foreground/70">
                                                            <p className="text-sm">제출된 내용이 없습니다.</p>
                                                        </div>
                                                    )}

                                                    {(chatProposal.content_submission_url || chatProposal.content_submission_file_url) && (
                                                        <div className="p-3 bg-muted/30 border-t border-border/50 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-white bg-indigo-500 px-1.5 py-0.5 rounded font-bold">
                                                                    {chatProposal.content_submission_file_url ? 'FILE' : 'LINK'}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                                    {chatProposal.content_submission_file_url
                                                                        ? chatProposal.content_submission_file_url.split('/').pop()?.split('_v')[0]
                                                                        : chatProposal.content_submission_url
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                {chatProposal.content_submission_file_url && (
                                                                    <Button size="xs" variant="ghost" className="h-6 text-[10px] text-indigo-600" asChild>
                                                                        <a href={chatProposal.content_submission_file_url} download>다운로드</a>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {chatProposal?.status !== 'completed' && (
                                                    <div className="flex gap-2 justify-end mt-4">
                                                        {chatProposal?.content_submission_status !== 'approved' && (
                                                            <Button
                                                                onClick={async () => {
                                                                    if (!chatProposal) return;
                                                                    if (!confirm("모든 수정이 완료 되었으며, 최종본으로 승인 하시겠습니까?")) return;
                                                                    const updateData = { content_submission_status: 'approved' };
                                                                    const isCampaign = !!chatProposal?.campaignId || (chatProposal as any)?.type === 'creator_apply';
                                                                    try {
                                                                        if (isCampaign) {
                                                                            await updateProposal(chatProposal.id, updateData);
                                                                        } else {
                                                                            await updateBrandProposal(chatProposal.id, updateData);
                                                                        }
                                                                        setChatProposal((prev: any) => (prev ? { ...prev, ...updateData } : prev));
                                                                        alert("수정본 전달이 완료되었습니다! 정산 단계로 이동합니다.");
                                                                    } catch (e) {
                                                                        console.error(e);
                                                                        alert("오류가 발생했습니다.");
                                                                    }
                                                                }}
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                                            >
                                                                수정본 전달 완료 (최종 승인)
                                                            </Button>
                                                        )}

                                                        <Button
                                                            disabled={chatProposal?.content_submission_status !== 'approved'}
                                                            onClick={async () => {
                                                                if (!chatProposal) return;
                                                                if (!confirm("프로젝트를 완료 처리하시겠습니까?")) return;
                                                                const updateData = { status: 'completed', completed_at: new Date().toISOString() };
                                                                const isCampaign = !!chatProposal?.campaignId || (chatProposal as any)?.type === 'creator_apply';
                                                                try {
                                                                    if (isCampaign) {
                                                                        await updateProposal(chatProposal.id, updateData);
                                                                    } else {
                                                                        await updateBrandProposal(chatProposal.id, updateData);
                                                                    }
                                                                    setChatProposal((prev: any) => (prev ? { ...prev, ...updateData } : prev));
                                                                    alert("프로젝트가 완료되었습니다!");
                                                                } catch (e) {
                                                                    console.error(e);
                                                                    alert("오류가 발생했습니다.");
                                                                }
                                                            }}
                                                            className={`${chatProposal?.content_submission_status === 'approved' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-200 text-muted-foreground/70 cursor-not-allowed'} text-white font-bold transition-all`}
                                                        >
                                                            프로젝트 최종 완료
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-20 bg-muted/30 rounded-[20px] border border-dashed text-muted-foreground/70">
                                                <div className="h-16 w-16 bg-background rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                    <Clock className="h-8 w-8 text-slate-300" />
                                                </div>
                                                <p className="font-bold">크리에이터가 작업물을 준비 중입니다.</p>
                                                <p className="text-xs mt-1">제출이 완료되면 이곳에서 확인할 수 있습니다.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Feedback Section Integrated inside Content Tab */}
                                    <div className="bg-background border border-border rounded-[30px] p-8 shadow-lg">
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                                                <Send className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <h4 className="text-lg font-bold text-foreground">작업물 피드백</h4>
                                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold ml-2">Dedicated Feed</span>
                                        </div>

                                        <div className="bg-muted/30/50 rounded-2xl border border-border overflow-hidden flex flex-col h-[400px]">
                                            {/* Feedback Messages List */}
                                            <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={workFeedbackChatRef}>
                                                {contextSubmissionFeedback
                                                    .filter(f => {
                                                        if (!chatProposal) return false
                                                        const isCampaign = !!chatProposal?.campaignId || (chatProposal as any)?.type === 'creator_apply'
                                                        return isCampaign
                                                            ? f.proposal_id === chatProposal?.id?.toString()
                                                            : f.brand_proposal_id === chatProposal?.id?.toString()
                                                    })
                                                    .length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/70 gap-2 opacity-60">
                                                        <div className="p-3 bg-background rounded-full shadow-sm">
                                                            <Info className="h-5 w-5" />
                                                        </div>
                                                        <p className="text-sm font-medium">피드백 대화 내역이 없습니다.</p>
                                                        <p className="text-[10px]">작업물에 대한 수정 요청이나 의견을 남겨주세요.</p>
                                                    </div>
                                                ) : (
                                                    contextSubmissionFeedback
                                                        .filter(f => {
                                                            const isCampaign = !!chatProposal?.campaignId || (chatProposal as any)?.type === 'creator_apply'
                                                            return isCampaign
                                                                ? f.proposal_id === chatProposal?.id?.toString()
                                                                : f.brand_proposal_id === chatProposal?.id?.toString()
                                                        })
                                                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                                                        .map((f) => (
                                                            <div key={f.id} className={`flex ${f.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                                                                <div className={`max-w-[85%] ${f.sender_id === user?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                                                                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${f.sender_id === user?.id
                                                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                                                        : 'bg-background border border-border text-foreground rounded-tl-none'
                                                                        }`}>
                                                                        {f.content}
                                                                    </div>
                                                                    <span className="text-[9px] text-muted-foreground/70 mt-1 px-1">
                                                                        {new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                )}
                                            </div>

                                            {/* Feedback Input */}
                                            <div className="p-4 bg-background border-t border-border">
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="피드백을 입력하세요..."
                                                        className="h-10 text-sm bg-muted/30 border-none focus:ring-1 focus:ring-indigo-600/20"
                                                        value={feedbackMsg}
                                                        onChange={(e) => setFeedbackMsg(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                                                handleSendFeedback()
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        className="h-10 px-4 font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-all"
                                                        onClick={handleSendFeedback}
                                                        disabled={!feedbackMsg.trim() || isSendingFeedback}
                                                    >
                                                        {isSendingFeedback ? <Loader2 className="h-4 w-4 animate-spin" /> : "전송"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs >
                    </div >
                </DialogContent >
            </Dialog >

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
            <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
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
            </AlertDialog>

            {/* Read-only Proposal Dialog */}
            <ReadonlyProposalDialog
                open={showReadonlyProposalDialog}
                onOpenChange={setShowReadonlyProposalDialog}
                proposal={readonlyProposal}
            />
        </div>
    )
}

export default function BrandDashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <BrandDashboardContent />
        </Suspense>
    )
}
