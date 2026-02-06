"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Bell, Briefcase, Calendar, ChevronRight, Plus, Rocket, Settings, ShoppingBag, User, Trash2, Pencil, BadgeCheck, Search, ExternalLink, Filter, Send, Gift, Megaphone, FileText, Upload, X, Package } from "lucide-react"
import Link from "next/link"
import { usePlatform, MOCK_INFLUENCER_USER } from "@/components/providers/platform-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SignatureCanvas from 'react-signature-canvas'
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { useEffect, useState, useRef } from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

// Removed static MY_EVENTS


const POPULAR_TAGS = [
    "✈️ 여행", "💄 뷰티", "💊 건강", "💉 시술/병원", "👗 패션", "🍽️ 맛집",
    "🏡 리빙/인테리어", "💍 웨딩/결혼", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
    "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
    "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
]

import { Suspense } from "react"

// Define the Dialog component outside to prevent re-creation and focus loss issues
function ApplyDialog({
    open,
    onOpenChange,
    selectedCampaign,
    appealMessage,
    setAppealMessage,
    desiredCost,
    setDesiredCost,
    onSubmit,
    isApplying,
    onClose
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCampaign: any;
    appealMessage: string;
    setAppealMessage: (val: string) => void;
    desiredCost: string;
    setDesiredCost: (val: string) => void;
    onSubmit: () => void;
    isApplying: boolean;
    onClose: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>캠페인 지원하기</DialogTitle>
                    <DialogDescription>
                        {selectedCampaign?.brand} - {selectedCampaign?.product}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="message">어필 메시지</Label>
                        <Textarea
                            id="message"
                            value={appealMessage}
                            onChange={(e) => setAppealMessage(e.target.value)}
                            className="min-h-[150px]"
                            placeholder="브랜드에게 전달할 메시지와 본인의 강점을 어필해보세요."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cost">희망 원고료 (선택)</Label>
                        <Input
                            id="cost"
                            value={desiredCost}
                            onChange={(e) => setDesiredCost(e.target.value)}
                            placeholder="예: 100000 (숫자만 입력)"
                            type="number"
                        />
                        <p className="text-xs text-muted-foreground">
                            브랜드가 제시한 예산: {selectedCampaign?.budget}
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>취소</Button>
                    <Button onClick={onSubmit} disabled={isApplying}>
                        {isApplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        지원서 보내기
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function InfluencerDashboardContent() {
    const {
        user, updateUser, campaigns, events, isLoading, notifications, resetData,
        brandProposals, updateBrandProposal, sendMessage, messages: allMessages, deleteEvent, proposals, updateProposal,
        products, switchRole, updateEvent, supabase
    } = usePlatform()

    const displayUser = user || MOCK_INFLUENCER_USER

    const router = useRouter()
    const searchParams = useSearchParams()
    const initialView = searchParams.get('view') || "dashboard"
    const [currentView, setCurrentView] = useState(initialView)
    const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null)

    // Filter events (Admins see all, users see theirs)
    const displayEvents = displayUser.type === 'admin' ? events : events.filter((e: any) => e.influencerId === displayUser.id || e.handle === displayUser.handle)
    const pastMoments = displayEvents.filter((e: any) => e.status === 'completed')
    const upcomingMoments = displayEvents.filter((e: any) => e.status !== 'completed')
    const myEvents = events.filter((e: any) => e.influencerId === displayUser.id || e.handle === displayUser.handle) // For personal stats

    const filteredProposalsByMoment = selectedMomentId
        ? (brandProposals?.filter((p: any) => p.event_id === selectedMomentId) || [])
        : []

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
            setChatProposal(prev => ({ ...prev, contract_status: status, influencer_signature: signatureData }))

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

            setChatProposal(prev => ({ ...prev, ...updateData }))

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

            // Update local state
            setChatProposal(prev => ({ ...prev, ...updateData }))

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
    const [isSaving, setIsSaving] = useState(false)

    // Apply Modal States
    const [applyModalOpen, setApplyModalOpen] = useState(false)
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
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
    const [submissionUrl, setSubmissionUrl] = useState("")
    const [submissionFile, setSubmissionFile] = useState<File | null>(null)
    const [isSubmittingContent, setIsSubmittingContent] = useState(false)
    const [isReuploading, setIsReuploading] = useState(false)

    const handleContentSubmission = async () => {
        if (!chatProposal) return
        if (!submissionUrl && !submissionFile) {
            alert("링크 또는 파일을 입력해주세요.")
            return
        }

        setIsSubmittingContent(true)
        try {
            const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'creator_apply'
            const proposalId = chatProposal.id?.toString()
            const brandId = isCampaignProposal ? chatProposal.campaign?.brand_id : chatProposal.brand_id

            let fileUrl = ""

            // Actual File Upload using Supabase Storage
            if (submissionFile) {
                const fileExt = submissionFile.name.split('.').pop()
                const fileName = `${proposalId}_${Date.now()}.${fileExt}` // Unique path per proposal
                const filePath = `submissions/${fileName}`

                console.log('Uploading file to:', filePath)

                const { data, error } = await supabase.storage
                    .from('submissions')
                    .upload(filePath, submissionFile, {
                        cacheControl: '3600',
                        upsert: true
                    })

                if (error) {
                    console.error('Supabase Upload Error:', error)
                    if (error.message?.includes('bucket')) {
                        // Fallback message if bucket missing
                        alert("업로드 실패: 'submissions' 버킷이 존재하지 않거나 권한이 없습니다.")
                    } else {
                        alert(`파일 업로드 실패: ${error.message}`)
                    }
                    throw error
                }

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('submissions')
                    .getPublicUrl(filePath)

                fileUrl = publicUrl
                console.log('File uploaded successfully. URL:', fileUrl)
            }

            const currentVersion = chatProposal.content_submission_version || 0.9
            const nextVersion = parseFloat((currentVersion + 0.1).toFixed(1))

            const updateData = {
                content_submission_url: submissionUrl,
                content_submission_file_url: fileUrl || undefined,
                content_submission_status: 'submitted',
                content_submission_date: new Date().toISOString(),
                content_submission_version: nextVersion
            }

            if (isCampaignProposal) {
                await updateProposal(proposalId, updateData)
            } else {
                await updateBrandProposal(proposalId, updateData)
            }

            setChatProposal(prev => ({ ...prev, ...updateData }))

            await sendMessage(brandId, `✅ 작업물(v${nextVersion}) 제출을 완료했습니다! 확인 부탁드립니다.`, isCampaignProposal ? proposalId : undefined, isCampaignProposal ? undefined : proposalId)

            alert(`작업물(v${nextVersion})이 제출되었습니다.`)
            setSubmissionUrl("")
            setSubmissionFile(null)
            setIsReuploading(false)
        } catch (e) {
            console.error("Submission failed:", e)
            alert("제출 중 오류가 발생했습니다.")
        } finally {
            setIsSubmittingContent(false)
        }
    }

    // Chat states
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [chatProposal, setChatProposal] = useState<any>(null)
    const [chatMessage, setChatMessage] = useState("")
    const [generatedContract, setGeneratedContract] = useState("")
    const [isGeneratingContract, setIsGeneratingContract] = useState(false)

    const handleGenerateContract = async () => {
        if (!chatProposal || !user) return

        setIsGeneratingContract(true)
        try {
            const influencerMessages = allMessages.filter(m => m.proposalId?.toString() === chatProposal.id?.toString())

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

    const filteredProducts = products?.filter(p =>
        p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        p.brandName?.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearchQuery.toLowerCase())
    ) || []

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

    // Initialize state when user loads or view changes
    useEffect(() => {
        if (displayUser) {
            setEditName(displayUser.name || "")
            setEditBio(displayUser.bio || "")
            setEditHandle(displayUser.handle || "")
            setEditFollowers(displayUser.followers?.toString() || "")
            setEditPhone(displayUser.phone || "")
            setEditAddress(displayUser.address || "")
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
    }, [searchParams, currentView])


    useEffect(() => {
        if (!isLoading && !user) {
            // router.push("/login") // Guest browsing allowed
        } else if (user && user.type === 'brand' && user.id !== 'guest_influencer') {
            router.push('/brand')
        }
    }, [isLoading, user, router])

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
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
                address: editAddress
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
        await updateBrandProposal(proposalId, status)
        if (status === 'accepted' || status === 'pending') {
            const proposal = brandProposals.find(p => p.id === proposalId)
            if (proposal) {
                setChatProposal(proposal)
                setIsChatOpen(true)

                // Send confirmation message to brand
                if (status === 'accepted') {
                    await sendMessage(proposal.brand_id, "협업 제안을 수락했습니다! 대화를 통해 상세 내용을 협의해요.")
                }
            }
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
                <div className="bg-white/80 p-2 rounded text-[11px] text-muted-foreground italic line-clamp-2">
                    "{proposal.message}"
                </div>
                <Button variant="outline" size="sm" className="w-full text-[10px] h-7 font-bold border-primary/30 text-primary hover:bg-primary/10">
                    상태: {proposal.status === 'accepted' ? '수락됨' : '제안됨'}
                </Button>
            </Card>
        )
    }

    const handleSendMessage = async () => {
        if (!chatMessage.trim() || !chatProposal || isSendingMessage) return
        const receiverId = chatProposal.brand_id || chatProposal.brandId || chatProposal.toId || chatProposal.brand?.id
        if (!receiverId) return

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
        if (status === 'new') return brandProposals?.filter(p => (!p.status || p.status === 'offered') && p.influencer_id === displayUser.id)
        if (status === 'applied') return brandProposals?.filter(p => p.status === 'applied' && p.influencer_id === displayUser.id)
        return brandProposals?.filter(p => p.status === status && p.influencer_id === displayUser.id)
    }



    const handleFollowerPreset = (val: number) => {
        setEditFollowers(val.toString())
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
                                                    <span className="font-medium text-foreground/80">일정:</span> {item.eventDate}
                                                </div>
                                                {item.postingDate && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                        <Send className="h-3 w-3 shrink-0" />
                                                        <span className="font-medium text-foreground/80">업로드:</span> {item.postingDate}
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
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold tracking-tight">내 모먼트 관리</h1>
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
                                    {upcomingMoments.find(e => e.id === selectedMomentId) && (
                                        <Card className="p-6 border-l-4 border-l-primary shadow-md">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-xs font-semibold text-primary mb-1 block">
                                                        {upcomingMoments.find(e => e.id === selectedMomentId)?.category}
                                                    </span>
                                                    <h2 className="text-2xl font-bold">
                                                        {upcomingMoments.find(e => e.id === selectedMomentId)?.event}
                                                    </h2>
                                                </div>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/creator/edit/${selectedMomentId}`}>
                                                        수정하기
                                                    </Link>
                                                </Button>
                                            </div>
                                            <p className="text-muted-foreground mb-6 whitespace-pre-wrap leading-relaxed bg-muted/30 p-4 rounded-md">
                                                {upcomingMoments.find(e => e.id === selectedMomentId)?.description}
                                            </p>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="bg-muted/50 p-3 rounded-md">
                                                    <span className="text-muted-foreground block mb-1">일정</span>
                                                    <span className="font-semibold">{upcomingMoments.find(e => e.id === selectedMomentId)?.date}</span>
                                                </div>
                                                <div className="bg-muted/50 p-3 rounded-md">
                                                    <span className="text-muted-foreground block mb-1">희망 제품</span>
                                                    <span className="font-semibold">{upcomingMoments.find(e => e.id === selectedMomentId)?.targetProduct}</span>
                                                </div>
                                            </div>
                                        </Card>
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
                            <>
                                {/* Stats Overview */}
                                <div className="grid gap-4 md:grid-cols-3">
                                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setCurrentView('past_moments')}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">지나간 모먼트</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{pastMoments.length}</div>
                                            <p className="text-xs text-muted-foreground mt-1">완료된 모먼트 기록 확인</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setCurrentView('proposals')}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">받은 제안</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{brandProposals?.length || 0}</div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {brandProposals?.filter(p => !p.status || p.status === 'offered').length}개의 신규 제안
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">프로필 조회수</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">128</div>
                                            <p className="text-xs text-muted-foreground mt-1">지난주 대비 +14%</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Upcoming Moments List */}
                                <section className="space-y-4">
                                    <h2 className="text-xl font-semibold">다가오는 모먼트</h2>
                                    <div className="grid gap-4">
                                        <div className="grid gap-4">
                                            {upcomingMoments.length === 0 ? (
                                                <div className="text-center py-10 border rounded-lg border-dashed text-muted-foreground">
                                                    등록된 다가오는 모먼트가 없습니다. 새로운 모먼트를 등록해보세요!
                                                </div>
                                            ) : upcomingMoments.map((event) => (
                                                <Card
                                                    key={event.id}
                                                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
                                                    onClick={() => setSelectedMomentId(event.id as any)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg font-bold bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0`}>
                                                            {event.date && event.date.includes("월") ? event.date.split(" ")[0] : "D-Day"}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{event.event}</h3>

                                                            <div className="flex flex-col gap-1 mt-2">
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                                                    <span className="font-medium">일정:</span> {event.eventDate || "미정"}
                                                                </div>
                                                                {event.postingDate && (
                                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                        <Send className="h-3.5 w-3.5 text-primary" />
                                                                        <span className="font-medium">업로드:</span> {event.postingDate}
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <Gift className="h-3.5 w-3.5 text-primary" />
                                                                    <span className="font-medium">희망 제품:</span> {event.targetProduct || "미정"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 md:gap-2 w-full md:w-auto justify-end mt-4 md:mt-0">
                                                        <div className="text-right hidden md:block mr-2">
                                                            <div className="font-medium text-emerald-600">
                                                                {brandProposals?.filter((p: any) => p.event_id === event.id).length || 0}개의 제안
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">확인하기 →</div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm("모먼트를 마감하시겠습니까? 마감된 모먼트는 '지나간 모먼트' 탭으로 이동합니다.")) {
                                                                    updateEvent(event.id, { status: "completed" });
                                                                }
                                                            }}
                                                        >
                                                            마감하기
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                                            title="모먼트 삭제"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm("정말로 이 모먼트를 삭제하시겠습니까?")) {
                                                                    deleteEvent(event.id);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* Recommended Matches from Context */}
                                <section className="space-y-4">
                                    <h2 className="text-xl font-semibold">추천 브랜드 매칭</h2>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {campaigns.map((getCampaign) => (
                                            <Link key={getCampaign.id} href={`/campaign/${getCampaign.id}`}>
                                                <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex gap-4">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0">
                                                                {getCampaign.brand[0]}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold">{getCampaign.product}</h3>
                                                                <p className="text-sm text-emerald-500 font-medium">
                                                                    {getCampaign.matchScore ? `${getCampaign.matchScore}% 일치` : '매칭 분석 중'}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {getCampaign.brand} • {getCampaign.budget}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button size="icon" variant="ghost">
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}
                    </div>
                )
            case "proposals":
                // 1. Inbound (Received from Brands) - Waiting
                const inboundProposals = brandProposals?.filter((p: any) => !p.status || p.status === 'offered' || p.status === 'negotiating') || []

                // 2. Outbound (Applied to Campaigns) - Waiting
                const outboundApplications = proposals?.filter((p: any) => p.type === 'creator_apply' && (p.status === 'pending' || p.status === 'viewed')) || []

                // 3. Active (In Progress) - Both sources
                const activeInbound = brandProposals?.filter((p: any) => p.status === 'accepted' || p.status === 'signed') || []
                const activeOutbound = proposals?.filter((p: any) => p.status === 'accepted' || p.status === 'signed') || []
                const allActive = [...activeInbound, ...activeOutbound].sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())

                // 4. Completed - Both sources
                const completedInbound = brandProposals?.filter((p: any) => p.status === 'completed') || []
                const completedOutbound = proposals?.filter((p: any) => p.status === 'completed') || []
                const allCompleted = [...completedInbound, ...completedOutbound].sort((a, b) => new Date(b.completed_at || b.created_at || 0).getTime() - new Date(a.completed_at || a.created_at || 0).getTime())

                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col gap-4">
                            <h1 className="text-3xl font-bold tracking-tight">협업 워크스페이스</h1>
                            <p className="text-muted-foreground">브랜드와 진행 중인 모든 협업을 한곳에서 관리하세요.</p>
                        </div>

                        <Tabs defaultValue="inbound" className="w-full">
                            <TabsList className="flex flex-wrap h-auto w-full justify-start gap-2 bg-transparent p-0">
                                <TabsTrigger value="inbound" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full">
                                    받은 제안 <span className="ml-2 bg-muted-foreground/20 px-1.5 py-0.5 rounded text-xs">{inboundProposals.length}</span>
                                </TabsTrigger>
                                <TabsTrigger value="outbound" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full">
                                    보낸 지원 <span className="ml-2 bg-muted-foreground/20 px-1.5 py-0.5 rounded text-xs">{outboundApplications.length}</span>
                                </TabsTrigger>
                                <TabsTrigger value="active" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full text-emerald-700 font-medium">
                                    진행중 <span className="ml-2 bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-xs">{allActive.length}</span>
                                </TabsTrigger>
                                <TabsTrigger value="completed" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full text-slate-600 font-medium">
                                    완료됨 <span className="ml-2 bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs">{allCompleted.length}</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Tab 1: Inbound (Received) */}
                            <TabsContent value="inbound" className="space-y-4 mt-6">
                                {inboundProposals.length > 0 ? (
                                    inboundProposals.map((proposal: any) => (
                                        <Card key={proposal.id} className="p-6 border-l-4 border-l-emerald-500 cursor-pointer hover:shadow-lg transition-all" onClick={() => { setChatProposal(proposal); setIsChatOpen(true); }}>
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-xl">{proposal.brand_name?.[0] || "B"}</div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-bold text-xl">{proposal.brand_name}</h3>
                                                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">New Offer</Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-1">{proposal.product_name} • {proposal.product_type === 'gift' ? '제품 협찬' : '대여'}</p>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">{new Date(proposal.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="bg-muted/30 p-4 rounded-lg text-sm">
                                                        <span className="font-bold text-emerald-600 mr-2">{proposal.compensation_amount}</span>
                                                        <span className="text-muted-foreground">{proposal.message}</span>
                                                    </div>
                                                    <div className="flex gap-2 justify-end">
                                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(proposal.id, 'accepted'); }}>수락하기</Button>
                                                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setChatProposal(proposal); setIsChatOpen(true); }}>상세 보기</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">아직 도착한 제안이 없습니다.</div>
                                )}
                            </TabsContent>

                            {/* Tab 2: Outbound (Sent) */}
                            <TabsContent value="outbound" className="space-y-4 mt-6">
                                {outboundApplications.length > 0 ? (
                                    outboundApplications.map((proposal: any) => (
                                        <Card key={proposal.id} className="p-6 border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition-all" onClick={() => { setChatProposal(proposal); setIsChatOpen(true); }}>
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xl">{proposal.brand_name?.[0] || "C"}</div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="div flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold text-xl">{proposal.brand_name} 캠페인</h3>
                                                            <p className="text-sm text-muted-foreground mt-1">지원 메시지: "{proposal.message}"</p>
                                                        </div>
                                                        <Badge variant="outline">지원 완료</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">아직 지원한 캠페인이 없습니다.</div>
                                )}
                            </TabsContent>

                            {/* Tab 3: Active (In Progress) */}
                            <TabsContent value="active" className="space-y-4 mt-6">
                                {allActive.length > 0 ? (
                                    allActive.map((proposal: any) => (
                                        <Card key={proposal.id} className="p-6 border-l-4 border-l-emerald-600 bg-emerald-50/10 cursor-pointer hover:shadow-lg hover:border-emerald-600 transition-all" onClick={() => { setChatProposal(proposal); setIsChatOpen(true); }}>
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 border-2 border-emerald-200 overflow-hidden">
                                                    {/* Unified Avatar Logic needed, simpler fallback for now */}
                                                    <span className="font-bold text-lg text-emerald-700">{proposal.brand_name?.[0] || "W"}</span>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold text-xl flex items-center gap-2">
                                                                {proposal.product_name || proposal.brand_name + " 프로젝트"}
                                                                <Badge className="bg-emerald-600 hover:bg-emerald-700">진행중</Badge>
                                                            </h3>
                                                            <p className="text-sm text-emerald-800 font-medium mt-1">{proposal.brand_name}</p>
                                                        </div>
                                                        <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">워크스페이스 입장</Button>
                                                    </div>
                                                    <div className="mt-4 flex gap-4 text-xs text-muted-foreground bg-white/50 p-3 rounded-lg border border-emerald-100">
                                                        <div>
                                                            <span className="block font-bold text-slate-700">계약 상태</span>
                                                            <span className={proposal.contract_status === 'signed' ? "text-emerald-600" : "text-amber-600"}>
                                                                {proposal.contract_status === 'signed' ? '체결 완료' : '서명 대기중'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="block font-bold text-slate-700">시작일</span>
                                                            {new Date(proposal.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground bg-muted/20">현재 진행중인 프로젝트가 없습니다.</div>
                                )}
                            </TabsContent>

                            {/* Tab 4: Completed */}
                            <TabsContent value="completed" className="space-y-4 mt-6">
                                {allCompleted.length > 0 ? (
                                    allCompleted.map((proposal: any) => (
                                        <Card key={proposal.id} className="p-6 opacity-80 hover:opacity-100 transition-all bg-slate-50 cursor-pointer" onClick={() => { setChatProposal(proposal); setIsChatOpen(true); }}>
                                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 font-bold">
                                                    {proposal.brand_name?.[0] || "C"}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="font-bold text-lg text-slate-700 line-through decoration-slate-400">{proposal.product_name}</h3>
                                                        <Badge variant="outline" className="border-slate-400 text-slate-500">COMPLETED</Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-1">{proposal.brand_name} • {proposal.completed_at ? new Date(proposal.completed_at).toLocaleDateString() : '완료됨'}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">완료된 프로젝트 내역이 없습니다.</div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                )


            case "past_moments":
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')}>
                                <ChevronRight className="h-4 w-4 rotate-180" /> 돌아가기
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight">지나간 모먼트</h1>
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
                                                    <span className="font-medium">업로드:</span> {event.postingDate}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Gift className="h-3.5 w-3.5 text-primary" />
                                                <span className="font-medium">희망 제품:</span> {event.targetProduct || "미정"}
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
                                        <div className={`w-2 h-2 mt-2 rounded-full ${notif.read ? "bg-gray-300" : "bg-red-500"}`}></div>
                                        <div>
                                            <p className="text-sm">{notif.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{notif.date}</p>
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
                                <div className="space-y-2">
                                    <Label htmlFor="name">활동명 (닉네임)</Label>
                                    <Input
                                        id="name"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
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
                                            placeholder="Ex: 10000"
                                            className="max-w-[200px]"
                                        />
                                        <span className="text-sm text-muted-foreground">명</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {[
                                            { label: "나노 (<1만)", val: 1000 },
                                            { label: "마이크로 (1~10만)", val: 10000 },
                                            { label: "그로잉 (10~30만)", val: 100000 },
                                            { label: "미드 (30~50만)", val: 300000 },
                                            { label: "매크로 (50~100만)", val: 500000 },
                                            { label: "메가 (>100만)", val: 1000000 }
                                        ].map((preset) => (
                                            <Button
                                                key={preset.label}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleFollowerPreset(preset.val)}
                                                className="rounded-full text-xs"
                                            >
                                                {preset.label}
                                            </Button>
                                        ))}
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
                                        placeholder="010-0000-0000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">주소 (제품 수령)</Label>
                                    <Input
                                        id="address"
                                        value={editAddress}
                                        onChange={(e) => setEditAddress(e.target.value)}
                                        placeholder="서울시 강남구..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">한줄 소개</Label>
                                    <Textarea
                                        id="bio"
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        placeholder="나를 표현하는 멋진 한마디를 적어주세요."
                                    />
                                </div>
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
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSaveProfile} disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    저장하기
                                </Button>
                            </CardFooter>
                        </Card>

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
                    </div>
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
                            <div className="flex w-full max-w-sm items-center space-x-2">
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
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {filteredProducts.map((product) => (
                                    <Link href={`/creator/products/${product.id}`} key={product.id}>
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
                                                <span className="text-primary group-hover:underline">협업 제안하기</span>
                                                <ChevronRight className="ml-auto h-3 w-3 text-primary" />
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )

            case "discover-campaigns":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">브랜드 캠페인 둘러보기</h1>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    브랜드가 등록한 캠페인을 확인하고 지원해보세요.
                                </p>
                            </div>
                        </div>

                        {campaigns.filter(c => c.status !== 'closed').length === 0 ? (
                            <Card className="p-20 text-center border-dashed bg-muted/20">
                                <Megaphone className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground">등록된 캠페인이 없습니다.</h3>
                            </Card>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {campaigns.filter(c => c.status !== 'closed').map((camp) => (
                                    <Card key={camp.id} className="flex flex-col h-full hover:shadow-lg transition-all border-border/60 hover:border-primary/50 group cursor-pointer">
                                        <CardHeader>
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                                    {/* Split by comma if multiple categories */}
                                                    {camp.category ? camp.category.split(',')[0] : '카테고리 없음'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {camp.date ? new Date(camp.date).toLocaleDateString() : new Date().toLocaleDateString()}
                                                </span>
                                            </div>
                                            <CardTitle className="text-lg font-bold line-clamp-1">{camp.product}</CardTitle>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {camp.brand?.[0] || 'B'}
                                                </div>
                                                <span className="text-sm text-muted-foreground font-medium">{camp.brand}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-4">
                                            <div className="bg-muted/30 p-3 rounded-lg text-sm space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">제공 혜택</span>
                                                    <span className="font-bold text-emerald-600">{camp.budget}</span>
                                                </div>
                                                {camp.target && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">모집 대상</span>
                                                        <span className="font-medium truncate max-w-[150px]">{camp.target}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                                {camp.description}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="pt-0 mt-auto">
                                            <Button
                                                className="w-full gap-2 group-hover:bg-primary group-hover:text-white transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleApplyClick(camp);
                                                }}
                                            >
                                                <Send className="h-4 w-4" /> 지원하기
                                            </Button>
                                        </CardFooter>
                                    </Card>
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
        setAppealMessage(`안녕하세요! ${campaign.brand}의 ${campaign.product} 캠페인에 제안하고 싶습니다.\n\n[제안 내용]\n`)
        setDesiredCost("")
        setApplyModalOpen(true)
    }

    const handleSubmitApplication = async () => {
        if (!appealMessage) {
            alert("어피 메시지를 입력해주세요.")
            return
        }

        setIsApplying(true)
        try {
            const { submitCampaignApplication } = await import('@/app/actions/proposal')

            const cost = desiredCost ? parseInt(desiredCost.replace(/[^0-9]/g, '')) : undefined

            const result = await submitCampaignApplication(selectedCampaign.id, appealMessage, cost)

            if (result.error) {
                alert(result.error)
            } else {
                alert("지원서가 성공적으로 발송되었습니다!")
                setApplyModalOpen(false)
            }
        } catch (error) {
            console.error("Application error:", error)
            alert("지원 중 오류가 발생했습니다.")
        } finally {
            setIsApplying(false)
        }
    }


    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                    {/* Sidebar ... */}

                    {/* ... skipping sidebar code ... */}
                    <aside className="hidden lg:flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-2 py-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
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
                                <Calendar className="mr-2 h-4 w-4" /> 내 모먼트
                            </Button>
                            <Button
                                variant={currentView === "discover-moments" ? "secondary" : "ghost"}
                                className="w-full justify-start text-primary font-medium"
                                onClick={() => setCurrentView("discover-moments")}
                            >
                                <Search className="mr-2 h-4 w-4" /> 모먼트 둘러보기
                            </Button>
                            <Button
                                variant={currentView === "discover-campaigns" ? "secondary" : "ghost"}
                                className="w-full justify-start text-primary font-medium"
                                onClick={() => setCurrentView("discover-campaigns")}
                            >
                                <Megaphone className="mr-2 h-4 w-4" /> 캠페인 둘러보기
                            </Button>
                            <Button
                                variant={currentView === "proposals" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("proposals")}
                            >
                                <Briefcase className="mr-2 h-4 w-4" /> 협업 워크스페이스
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
                    <ApplyDialog
                        open={applyModalOpen}
                        onOpenChange={setApplyModalOpen}
                        selectedCampaign={selectedCampaign}
                        appealMessage={appealMessage}
                        setAppealMessage={setAppealMessage}
                        desiredCost={desiredCost}
                        setDesiredCost={setDesiredCost}
                        onSubmit={handleSubmitApplication}
                        isApplying={isApplying}
                        onClose={() => setApplyModalOpen(false)}
                    />

                    {/* Chat Dialog ... existing code ... */}
                    <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                        <DialogContent className="sm:max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl">
                            <div className="flex h-full">
                                {/* Left Sidebar: Deal Status & Workflow */}
                                <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
                                    <div className="p-6 border-b border-slate-200 bg-white">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                                {chatProposal?.brand_name?.[0] || "B"}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight">{chatProposal?.brand_name}</h3>
                                                <p className="text-xs text-muted-foreground">{chatProposal?.product_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${chatProposal?.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                                chatProposal?.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-indigo-100 text-indigo-700'
                                                }`}>
                                                {chatProposal?.status === 'accepted' ? '진행 중' :
                                                    chatProposal?.status === 'rejected' ? '거절됨' : '협의 중'}
                                            </span>
                                            <span className="text-xs font-medium text-emerald-600 ml-auto">
                                                {chatProposal?.compensation_amount}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Workflow Steps - Dynamic & Clickable */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">진행 단계</h4>
                                            <ul className="space-y-1">
                                                {(() => {
                                                    // Determine current step index
                                                    // 0: Negotiation (Default)
                                                    // 1: Contract (Accepted status)
                                                    // 2: Shipping (Contract Signed)
                                                    // 3: Content (Shipped)
                                                    // 4: Complete (Completed)

                                                    let currentStepIndex = 0;
                                                    if (chatProposal?.status === 'accepted' || chatProposal?.status === 'completed') currentStepIndex = 1;
                                                    if (chatProposal?.contract_status === 'signed') currentStepIndex = 2;
                                                    if (chatProposal?.delivery_status === 'shipped' || chatProposal?.delivery_status === 'delivered') currentStepIndex = 3;
                                                    if (chatProposal?.status === 'completed') currentStepIndex = 4;

                                                    const steps = [
                                                        { id: 0, label: "조건 조율 및 확정", tab: "chat" },
                                                        { id: 1, label: "전자 계약서 (서명/발송)", tab: "contract" },
                                                        { id: 2, label: "제품 배송/수령", tab: "work" },
                                                        { id: 3, label: "콘텐츠 작업 및 제출", tab: "work" },
                                                        { id: 4, label: "최종 완료 및 정산", tab: "work" }
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
                                                                        isCurrent ? 'text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 shadow-sm' :
                                                                            'text-slate-400 opacity-60 hover:opacity-100 hover:bg-slate-50'}
                                                                `}
                                                            >
                                                                <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 
                                                                    ${isDone ? 'bg-emerald-500 border-emerald-500' :
                                                                        isCurrent ? 'bg-white border-indigo-500 animate-pulse' :
                                                                            'border-slate-300'}
                                                                `} />
                                                                {isCurrent && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-bold">NOW</span>}
                                                                {step.label}
                                                            </li>
                                                        );
                                                    });
                                                })()}
                                            </ul>
                                        </div>

                                        {/* Quick Actions Placeholder */}
                                        <div className="px-2">
                                            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-xs">
                                                <p className="font-bold text-indigo-900 mb-1">💡 Tip</p>
                                                <p className="text-indigo-700 leading-relaxed">
                                                    계약 단계에서는 표준 계약서가 자동으로 생성됩니다.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-400 text-center">
                                        Crealab Secure Workspace™
                                    </div>
                                </div>

                                {/* Right Content: Chat & Workspaces */}
                                <Tabs value={activeProposalTab} onValueChange={setActiveProposalTab} className="flex-1 flex flex-col min-w-0 bg-white">
                                    <div className="px-6 py-4 border-b border-gray-100 shrink-0 flex flex-row items-center justify-between">
                                        <div>
                                            <DialogTitle className="text-lg">협업 워크스페이스</DialogTitle>
                                            <DialogDescription>브랜드와 협업을 진행하세요.</DialogDescription>
                                        </div>
                                        <TabsList className="grid w-[300px] grid-cols-3">
                                            <TabsTrigger value="chat">소통</TabsTrigger>
                                            <TabsTrigger value="contract">계약</TabsTrigger>
                                            <TabsTrigger value="work">작업물</TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 m-0 data-[state=active]:flex">
                                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/10">
                                            {/* Proposal Detail Box (at the top of chat) */}
                                            {chatProposal && (
                                                <div className="mb-6 p-5 bg-white border border-primary/20 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex items-center justify-between mb-4 border-b border-primary/10 pb-2">
                                                        <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                                            <BadgeCheck className="h-5 w-5" /> 협업 제안 상세
                                                        </h4>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${chatProposal.status === 'accepted' ? 'bg-emerald-500 text-white' :
                                                            chatProposal.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-primary text-white'
                                                            }`}>
                                                            {chatProposal.status === 'accepted' ? '수락됨' :
                                                                chatProposal.status === 'rejected' ? '거절됨' :
                                                                    chatProposal.status === 'pending' ? '보류 중' : '검토 요청됨'}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                                            <div className="space-y-1">
                                                                <p className="text-muted-foreground">브랜드 / 제품</p>
                                                                <p className="font-bold text-sm truncate">{chatProposal.brand_name} / {chatProposal.product_name}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-muted-foreground">제시 원고료</p>
                                                                <p className="font-bold text-emerald-600 text-sm">{chatProposal.compensation_amount}</p>
                                                            </div>
                                                        </div>

                                                        <div className="p-3 bg-muted/20 rounded-lg border border-primary/5">
                                                            <p className="text-[11px] text-muted-foreground mb-1">브랜드 메시지</p>
                                                            <p className="text-xs italic leading-relaxed whitespace-pre-wrap text-foreground/80">"{chatProposal.message}"</p>
                                                        </div>

                                                        {/* Action Buttons inside Chat (Available in all views now) */}
                                                        {(chatProposal.status === 'offered' || !chatProposal.status) && (
                                                            <div className="flex gap-2 pt-2">
                                                                <Button
                                                                    size="sm"
                                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold h-9"
                                                                    onClick={() => handleStatusUpdate(chatProposal.id, 'accepted')}
                                                                >
                                                                    수락하기
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="flex-1 font-bold h-9 border-amber-200 text-amber-700 hover:bg-amber-50"
                                                                    onClick={() => handleStatusUpdate(chatProposal.id, 'pending')}
                                                                >
                                                                    보류
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {allMessages
                                                .filter((m: any) => {
                                                    if (!chatProposal) return false
                                                    const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'creator_apply'

                                                    // Filter by the correct ID column
                                                    if (isCampaignProposal) {
                                                        return m.proposalId?.toString() === chatProposal.id?.toString()
                                                    } else {
                                                        return m.brandProposalId?.toString() === chatProposal.id?.toString()
                                                    }
                                                })
                                                .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                                .map((msg: any, idx: any) => (
                                                    <div key={idx} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[85%] flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                                                            <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.senderId === user?.id
                                                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                                : 'bg-white border rounded-tl-none'
                                                                }`}>
                                                                {msg.content}
                                                                {/* Only show proposal card for the very first message in the thread */}
                                                                {idx === 0 && msg.proposalId && renderProposalCard(msg.proposalId)}
                                                                <span className="block text-[10px] opacity-70 mt-1">
                                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        <div className="p-4 border-t bg-white">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="메시지를 입력하세요..."
                                                    value={chatMessage}
                                                    onChange={(e) => setChatMessage(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                />
                                                <Button onClick={handleSendMessage}>전송</Button>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Contract Tab View */}
                                    <TabsContent value="contract" className="flex-1 overflow-y-auto p-6 bg-slate-50 data-[state=active]:flex flex-col items-center justify-center">
                                        <div className="w-full max-w-2xl bg-white p-10 rounded-xl shadow-sm border border-slate-200">
                                            <div className="text-center mb-8">
                                                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                    <FileText className="h-8 w-8 text-slate-400" />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900">표준 계약서 검토</h3>
                                                <p className="text-slate-500 mt-2">브랜드와 협의된 내용으로 작성된 계약서입니다.<br />꼼꼼히 확인 후 서명해주세요.</p>
                                            </div>

                                            {chatProposal?.contract_status === 'sent' || chatProposal?.contract_status === 'signed' ? (
                                                <div className="space-y-4 mb-8">
                                                    <div className="flex justify-between items-center px-1">
                                                        <h4 className="text-sm font-bold text-slate-700">
                                                            계약서 내용
                                                            {chatProposal.contract_status === 'signed' && <span className="ml-2 text-emerald-600">(서명 완료됨)</span>}
                                                        </h4>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 leading-relaxed font-mono min-h-[200px] overflow-y-auto max-h-[400px] whitespace-pre-wrap">
                                                        {chatProposal.contract_content || "계약서 내용을 불러오는 중..."}
                                                    </div>

                                                    {chatProposal.contract_status !== 'signed' && (
                                                        <div className="grid grid-cols-3 gap-3 mt-6">
                                                            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleContractResponse('rejected')}>
                                                                거절
                                                            </Button>
                                                            <Button variant="outline" className="border-amber-200 text-amber-600 hover:bg-amber-50" onClick={() => handleContractResponse('negotiating')}>
                                                                보류/수정요청
                                                            </Button>
                                                            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleStartSigning}>
                                                                동의 및 서명
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {chatProposal.contract_status === 'signed' && (
                                                        <Button className="w-full" disabled variant="secondary">
                                                            <BadgeCheck className="mr-2 h-4 w-4" /> 이미 서명된 계약서입니다
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                                    <p>아직 계약서가 도착하지 않았습니다.</p>
                                                    <p className="text-xs mt-1">브랜드가 계약서를 발송하면 이곳에서 확인할 수 있습니다.</p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Work Tab View - Product Delivery & Content */}
                                    <TabsContent value="work" className="flex-1 overflow-y-auto p-6 bg-slate-50 data-[state=active]:flex flex-col items-center justify-start">
                                        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-slate-200 mt-4">
                                            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                                                <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900">제품 배송 / 작업물 관리</h3>
                                                    <p className="text-sm text-slate-500">협찬 제품 수령을 위한 정보를 입력하고 결과물을 제출하세요.</p>
                                                </div>
                                            </div>

                                            {chatProposal?.contract_status !== 'signed' ? (
                                                <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed text-slate-500">
                                                    <p className="mb-2">🔒 계약이 완료되지 않았습니다.</p>
                                                    <p className="text-xs">계약서 서명을 완료하면 제품 배송 단계가 활성화됩니다.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-8">
                                                    {/* Step 1: Shipping Info */}
                                                    <div>
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="font-bold flex items-center gap-2">
                                                                <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">STEP 1</span>
                                                                배송지 정보 입력
                                                            </h4>
                                                            {chatProposal.shipping_address && (
                                                                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                                                    <BadgeCheck className="h-3 w-3" /> 제출 완료
                                                                </span>
                                                            )}
                                                        </div>

                                                        {chatProposal.shipping_address ? (
                                                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm space-y-2">
                                                                <div className="grid grid-cols-[80px_1fr]">
                                                                    <span className="text-slate-500">받는 분</span>
                                                                    <span className="font-medium text-slate-900">{chatProposal.shipping_name}</span>
                                                                </div>
                                                                <div className="grid grid-cols-[80px_1fr]">
                                                                    <span className="text-slate-500">연락처</span>
                                                                    <span className="font-medium text-slate-900">{chatProposal.shipping_phone}</span>
                                                                </div>
                                                                <div className="grid grid-cols-[80px_1fr]">
                                                                    <span className="text-slate-500">주소</span>
                                                                    <span className="font-medium text-slate-900">{chatProposal.shipping_address}</span>
                                                                </div>

                                                                <div className="mt-4 pt-4 border-t border-slate-200">
                                                                    {chatProposal.tracking_number ? (
                                                                        <div className="space-y-3">
                                                                            <div className="bg-white p-3 rounded border border-emerald-100 flex items-center gap-3">
                                                                                <Package className="h-5 w-5 text-emerald-600" />
                                                                                <div className="flex-1">
                                                                                    <p className="text-xs text-emerald-600 font-bold mb-0.5">배송이 시작되었습니다!</p>
                                                                                    <p className="text-sm font-bold text-slate-900">운송장 번호: {chatProposal.tracking_number}</p>
                                                                                </div>
                                                                            </div>

                                                                            {/* Product Received Confirmation Logic */}
                                                                            {chatProposal.delivery_status === 'delivered' ? (
                                                                                <div className="bg-emerald-50 text-emerald-700 text-sm font-bold p-3 rounded flex items-center gap-2 justify-center">
                                                                                    <BadgeCheck className="h-4 w-4" />
                                                                                    제품 수령이 완료되었습니다.
                                                                                </div>
                                                                            ) : (
                                                                                <Button
                                                                                    type="button"
                                                                                    onClick={handleProductReceived}
                                                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                                                                    variant="default"
                                                                                >
                                                                                    <Package className="mr-2 h-4 w-4" />
                                                                                    제품 수령 완료 (클릭하여 확인)
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                                            브랜드에서 제품 발송을 준비하고 있습니다.
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div className="flex justify-end">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            setShippingName(displayUser.name || "")
                                                                            setShippingPhone(displayUser.phone || "")
                                                                            setShippingAddress(displayUser.address || "")
                                                                        }}
                                                                        className="text-xs h-8"
                                                                    >
                                                                        <User className="mr-2 h-3 w-3" /> 프로필 정보 불러오기
                                                                    </Button>
                                                                </div>
                                                                <div className="grid md:grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label>받는 분 성함</Label>
                                                                        <Input value={shippingName} onChange={e => setShippingName(e.target.value)} placeholder="홍길동" />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>연락처</Label>
                                                                        <Input value={shippingPhone} onChange={e => setShippingPhone(e.target.value)} placeholder="010-1234-5678" />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>배송지 주소</Label>
                                                                    <Input value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} placeholder="도로명 주소 입력" />
                                                                </div>
                                                                <Button onClick={handleSaveShippingInfo} disabled={isSavingShipping} className="w-full">
                                                                    {isSavingShipping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                    배송지 정보 제출하기
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="border-t border-slate-100 my-6" />

                                                    {/* Step 2: Content Submission (Unlocked after delivery) */}
                                                    <div className={`mt-6 transition-opacity ${chatProposal.delivery_status !== 'delivered' ? 'opacity-50 pointer-events-none' : ''}`}>
                                                        <h4 className="font-bold flex items-center gap-2 mb-4">
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${chatProposal.delivery_status === 'delivered' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>STEP 2</span>
                                                            작업물 제출
                                                        </h4>

                                                        {chatProposal.delivery_status !== 'delivered' ? (
                                                            <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed">
                                                                <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                                                <p className="text-sm text-slate-500 font-bold">제품 수령 완료 버튼을 누른 후 제출할 수 있습니다.</p>
                                                                <p className="text-xs text-slate-400 mt-1">상단의 '제품 수령 완료' 버튼을 눌러주세요.</p>
                                                            </div>
                                                        ) : (chatProposal.content_submission_status === 'submitted' || chatProposal.content_submission_status === 'approved') && !isReuploading ? (
                                                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="flex items-center gap-2 text-indigo-700 font-bold">
                                                                        <BadgeCheck className="h-5 w-5" />
                                                                        제출 완료
                                                                        <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full ml-1">
                                                                            v{chatProposal.content_submission_version?.toFixed(1) || "1.0"}
                                                                        </span>
                                                                    </div>
                                                                    {chatProposal.status !== 'completed' && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => setIsReuploading(true)}
                                                                            className="text-xs h-7 px-2 text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100"
                                                                        >
                                                                            수정 / 재제출
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-indigo-600 mb-4">
                                                                    브랜드의 검토를 기다리고 있습니다.
                                                                </p>
                                                                {chatProposal.content_submission_url && (
                                                                    <div className="bg-white p-3 rounded border text-sm text-slate-600 mb-2 truncate">
                                                                        Link: {chatProposal.content_submission_url}
                                                                    </div>
                                                                )}
                                                                {chatProposal.content_submission_file_url && (
                                                                    <div className="bg-white p-3 rounded border text-sm text-slate-600 truncate">
                                                                        File: {chatProposal.content_submission_file_url}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                {isReuploading && (
                                                                    <div className="flex justify-between items-center px-1 mb-2">
                                                                        <span className="text-xs font-bold text-indigo-600">
                                                                            ✨ v{(parseFloat(((chatProposal.content_submission_version || 0.9) + 0.1).toFixed(1)))} 버전으로 업데이트
                                                                        </span>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => setIsReuploading(false)}
                                                                            className="text-xs h-6 text-slate-400 hover:text-red-500"
                                                                        >
                                                                            취소
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                                <Tabs defaultValue="link" className="w-full">
                                                                    <TabsList className="grid w-full grid-cols-2">
                                                                        <TabsTrigger value="link">링크 제출</TabsTrigger>
                                                                        <TabsTrigger value="file">파일 업로드</TabsTrigger>
                                                                    </TabsList>

                                                                    <TabsContent value="link" className="space-y-4 pt-4">
                                                                        <div className="space-y-2">
                                                                            <Label>콘텐츠 링크 (YouTube, Instagram 등)</Label>
                                                                            <Input
                                                                                placeholder="https://..."
                                                                                value={submissionUrl}
                                                                                onChange={(e) => setSubmissionUrl(e.target.value)}
                                                                            />
                                                                            <p className="text-xs text-muted-foreground">
                                                                                업로드한 콘텐츠의 URL을 입력해주세요.
                                                                            </p>
                                                                        </div>
                                                                    </TabsContent>

                                                                    <TabsContent value="file" className="space-y-4 pt-4">
                                                                        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                                                            <input
                                                                                type="file"
                                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                                onChange={(e) => {
                                                                                    const file = e.target.files?.[0]
                                                                                    if (file) {
                                                                                        if (file.size > 500 * 1024 * 1024) {
                                                                                            alert("파일 크기는 500MB를 초과할 수 없습니다.")
                                                                                            return
                                                                                        }
                                                                                        setSubmissionFile(file)
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                                                            <p className="font-medium text-sm">
                                                                                {submissionFile ? submissionFile.name : "클릭하여 파일 업로드"}
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                                최대 500MB (MP4, MOV, JPG, PNG)
                                                                            </p>
                                                                        </div>
                                                                    </TabsContent>
                                                                </Tabs>

                                                                <Button onClick={handleContentSubmission} disabled={isSubmittingContent} className="w-full">
                                                                    {isSubmittingContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                    {isReuploading ? "수정된 작업물 제출하기" : "작업물 제출하기"}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>


                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Full Contract Viewer Dialog */}
                    <Dialog open={isFullContractOpen} onOpenChange={setIsFullContractOpen}>
                        <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col p-6 overflow-hidden">
                            <DialogHeader className="mb-4">
                                <DialogTitle>표준 광고 협업 계약서</DialogTitle>
                                <DialogDescription>작성된 계약서의 전체 내용입니다.</DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 rounded-xl border border-slate-200 font-mono text-sm whitespace-pre-wrap">
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

                </div>
            </main >
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
                        <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden relative group">
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
                        <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                            <span>마우스나 터치로 서명하세요.</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-slate-400 hover:text-red-500"
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
        </div>
    )
}

export default function InfluencerDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <InfluencerDashboardContent />
        </Suspense>
    )
}
