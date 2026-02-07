"use client"

import React from "react"
import { RateCardMessage } from "@/components/chat/rate-card-message"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    Image as ImageIcon,
    ExternalLink,
    Upload,
    Gift,
    Star,
    Briefcase,
    Link as LinkIcon,
    AtSign,
    Hash
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SignatureCanvas from 'react-signature-canvas'
import Link from "next/link"
import { useEffect, useState, Suspense, useRef } from "react"
import { usePlatform, MOCK_BRAND_USER } from "@/components/providers/platform-provider"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

const POPULAR_TAGS = [
    "✈️ 여행", "💄 뷰티", "👗 패션", "🍽️ 맛집",
    "🏡 리빙/인테리어", "💍 웨딩/결혼", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
    "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
    "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
]

function BrandDashboardContent() {
    const {
        events, user, resetData, isLoading, campaigns, deleteCampaign,
        brandProposals, updateBrandProposal, deleteBrandProposal, sendMessage, messages: allMessages,
        updateUser, products, addProduct, updateProduct, deleteProduct, deleteEvent, supabase, createBrandProposal,
        switchRole, proposals, updateCampaignStatus, updateProposal, notifications, sendNotification, refreshData
    } = usePlatform()

    // Force data refresh on mount to avoid stale data from navigation
    useEffect(() => {
        refreshData()
    }, [refreshData])

    const displayUser = user || MOCK_BRAND_USER


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
    const [favoriteEvents, setFavoriteEvents] = useState<Set<string>>(new Set())

    // Collaboration Workspace State
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [chatProposal, setChatProposal] = useState<any>(null)
    const [chatMessage, setChatMessage] = useState("")
    const [generatedContract, setGeneratedContract] = useState("")
    const [isGeneratingContract, setIsGeneratingContract] = useState(false)
    const [isSendingContract, setIsSendingContract] = useState(false)
    const [workspaceTab, setWorkspaceTab] = useState("inbound") // Lifted state for sidebar control
    const [activeProposalTab, setActiveProposalTab] = useState("chat") // Controlled tab state for Proposal Dialog

    // Sync contract content from proposal when loaded or switched
    useEffect(() => {
        if (chatProposal?.contract_content) {
            setGeneratedContract(chatProposal.contract_content)
        } else {
            setGeneratedContract("")
        }
    }, [chatProposal])

    const handleGenerateContract = async () => {
        if (!chatProposal || !user) return

        setIsGeneratingContract(true)
        try {
            const influencerId = chatProposal.influencer_id || chatProposal.influencerId
            const influencerMessages = allMessages.filter(m => m.proposalId?.toString() === chatProposal.id?.toString())

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
            const isCampaignProposal = (chatProposal as any).type === 'creator_apply' || !!(chatProposal as any).campaignId

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

        if (!confirm("서명과 함께 계약서를 발송하시겠습니까? 발송 후에는 수정이 불가능합니다.")) return

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
            const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'creator_apply'
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

    useEffect(() => {
        if (!isLoading && !user) {
            // router.push('/login') // Guest browsing allowed
        } else if (user && user.type === 'influencer' && user.id !== 'guest_influencer') {
            router.push('/creator')
        }
    }, [user, router, isLoading])

    // Sync view with URL
    useEffect(() => {
        const view = searchParams.get('view')
        if (view) {
            const mappedView = view === "dashboard" ? "my-campaigns" : view
            if (mappedView !== currentView) {
                setCurrentView(mappedView)
            }
        }
    }, [searchParams, currentView])

    const handlePresetClick = (key: string) => {
        setFollowerFilter(key)
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

    const handleManualChange = (type: 'min' | 'max', value: string) => {
        if (type === 'min') setMinFollowers(value)
        else setMaxFollowers(value)
        setFollowerFilter("custom")
    }

    const getFilteredAndSortedEvents = () => {
        let result = [...events]
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
            result = result.filter(e => favoriteEvents.has(e.id))
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

    const handlePropose = (influencer: any) => {
        setSelectedInfluencer(influencer)
        setOfferProduct("")
        setProductType("gift")
        setCompensation("")
        setHasIncentive(false)
        setIncentiveDetail("")
        setContentType("")
        setMessage(`안녕하세요, ${influencer.influencer}님! ${influencer.category} 콘텐츠를 인상 깊게 보았습니다. 저희 브랜드의 신제품과 잘 어울릴 것 같아 제안 드립니다.`)
        setProposeModalOpen(true)
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
                message: message
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
            alert(`${selectedInfluencer?.influencer}님에게 제안서가 성공적으로 발송되었습니다!`)
            setProposeModalOpen(false)

            // Refresh the data to show the new proposal immediately
            resetData()
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
            setIsSubmitting(false)
        }
    }

    const handleEditProduct = (product: any) => {
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
    }


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

            if (editingProductId) {
                await updateProduct(editingProductId, productData)
            } else {
                await addProduct(productData)
            }

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

    const renderContent = () => {
        switch (currentView) {
            case "discover":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">모먼트 검색</h1>
                                <p className="text-muted-foreground mt-1">우리 브랜드와 딱 맞는 모먼트를 가진 크리에이터를 찾아보세요.</p>
                            </div>
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="gap-2">
                                            <Filter className="h-4 w-4" />
                                            {sortOrder === "latest" ? "최신 등록순" : sortOrder === "followers_high" ? "팔로워 많은순" : "정렬"}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>정렬 기준</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                                            <DropdownMenuRadioItem value="latest">최신 등록순</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="followers_high">팔로워 많은순</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="verified">인증된 크리에이터</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Filters */}
                        <Card className="bg-background/50 backdrop-blur-sm">
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
                                                variant={followerFilter === opt.k ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePresetClick(opt.k)}
                                                className="rounded-full"
                                            >
                                                {opt.l}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 md:items-start">
                                    <span className="text-sm font-semibold w-24 pt-2">모먼트 상태</span>
                                    <div className="flex flex-wrap gap-2 flex-1">
                                        <Button
                                            variant={statusFilter === "all" ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setStatusFilter("all")}
                                        >
                                            전체보기
                                        </Button>
                                        <Button
                                            variant={statusFilter === "upcoming" ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setStatusFilter("upcoming")}
                                        >
                                            다가오는 모먼트
                                        </Button>
                                        <Button
                                            variant={statusFilter === "past" ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setStatusFilter("past")}
                                        >
                                            지나간 모먼트
                                        </Button>
                                        <Button
                                            variant={statusFilter === "favorites" ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setStatusFilter("favorites")}
                                            className="gap-1.5"
                                        >
                                            <Star className="h-3.5 w-3.5 text-yellow-500" fill={statusFilter === "favorites" ? "currentColor" : "none"} />
                                            즐겨찾기만 보기
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 md:items-start pt-2 border-t border-border/40">
                                    <span className="text-sm font-semibold w-24 pt-2">영상 단가</span>
                                    <div className="flex flex-wrap gap-2 flex-1">
                                        {PRICE_FILTER_RANGES.map(range => (
                                            <Button
                                                key={range.k}
                                                variant={priceFilter === range.k ? "secondary" : "ghost"}
                                                size="sm"
                                                onClick={() => setPriceFilter(range.k)}
                                            >
                                                {range.l}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 md:items-start pt-2 border-t border-border/40">
                                    <span className="text-sm font-semibold w-24 pt-2">전문 분야</span>
                                    <div className="flex flex-wrap gap-2 flex-1">
                                        <Button
                                            variant={selectedTag === null ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setSelectedTag(null)}
                                        >
                                            전체
                                        </Button>
                                        {POPULAR_TAGS.map(tag => (
                                            <Button
                                                key={tag}
                                                variant={selectedTag === tag ? "secondary" : "ghost"}
                                                size="sm"
                                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                                className={selectedTag === tag ? 'bg-primary/10 text-primary' : ''}
                                            >
                                                {tag}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredEvents.map((item) => {
                                const isFavorite = favoriteEvents.has(item.id)
                                return (
                                    <Link key={item.id} href={`/event/${item.id}`} className="block group">
                                        <Card className="overflow-hidden transition-all hover:shadow-lg border-border/60 bg-background flex flex-col h-full cursor-pointer relative">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    const newFavorites = new Set(favoriteEvents);
                                                    if (isFavorite) {
                                                        newFavorites.delete(item.id);
                                                    } else {
                                                        newFavorites.add(item.id);
                                                    }
                                                    setFavoriteEvents(newFavorites);
                                                }}
                                            >
                                                <Star
                                                    className={`h-4 w-4 transition-colors ${isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
                                                    fill={isFavorite ? 'currentColor' : 'none'}
                                                />
                                            </Button>
                                            <CardHeader className="pb-3 flex-row gap-3 items-start space-y-0">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg overflow-hidden">
                                                    {item.avatar && item.avatar.startsWith('http') ? (
                                                        <img src={item.avatar} alt={item.influencer} className="h-full w-full object-cover" />
                                                    ) : (
                                                        item.avatar
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-bold truncate">{item.influencer}</h4>
                                                        {user?.type === 'admin' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-muted-foreground hover:text-red-500 rounded-full"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    if (confirm("정말로 이 모먼트를 삭제하시겠습니까?")) {
                                                                        deleteEvent(item.id).catch(() => alert("삭제에 실패했습니다."));
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">{item.handle}</p>
                                                    <span className="text-[10px] font-medium bg-secondary/50 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                        {(item.followers || 0).toLocaleString()} 팔로워
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3 flex-1 relative">
                                                {item.status === 'completed' && (
                                                    <div className="absolute top-[-14px] right-4 z-10">
                                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                                            지나간 모먼트
                                                        </span>
                                                    </div>
                                                )}
                                                <h3 className="font-bold text-base line-clamp-2 mb-2">{item.event}</h3>

                                                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mb-3 bg-muted/30 p-2 rounded-lg">
                                                    {item.targetProduct && (
                                                        <div className="flex items-center gap-2">
                                                            <Gift className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                                            <span className="font-medium">희망제품:</span>
                                                            <span className="truncate flex-1">{item.targetProduct}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                                        <span className="font-medium">모먼트일:</span> {item.eventDate || "미정"}
                                                    </div>
                                                    {item.postingDate && (
                                                        <div className="flex items-center gap-2">
                                                            <Send className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                                            <span className="font-medium">예상업로드:</span> {item.postingDate}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-foreground/70 line-clamp-3">{item.description}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.tags.slice(0, 3).map(t => (
                                                        <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{t}</span>
                                                    ))}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="p-4 border-t">
                                                <Button
                                                    className="w-full"
                                                    variant="secondary"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handlePropose(item);
                                                    }}
                                                >
                                                    협업 제안
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )
            case "my-campaigns":
                const selectedCampaign = myCampaigns.find(c => c.id === selectedCampaignId)
                const campaignProposals = proposals.filter(p => p.campaignId === selectedCampaign?.id && p.type === 'creator_apply')

                // Detail View
                if (selectedCampaignId && selectedCampaign) {
                    return (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedCampaignId(null)} className="gap-1 pl-0 hover:bg-transparent hover:text-primary">
                                    <ArrowRight className="h-4 w-4 rotate-180" /> 목록으로 돌아가기
                                </Button>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px]">
                                {/* Left: Campaign Detail Card */}
                                <Card className="h-fit">
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <Badge variant="outline" className="w-fit">{selectedCampaign.category}</Badge>
                                                <CardTitle className="text-2xl font-bold">{selectedCampaign.product}</CardTitle>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/brand/edit/${selectedCampaign.id}`}>수정하기</Link>
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Description Box */}
                                        <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
                                            <h4 className="text-sm font-bold text-muted-foreground mb-3">상세 내용</h4>
                                            <p className="whitespace-pre-wrap leading-relaxed text-sm">
                                                {selectedCampaign.description}
                                            </p>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/10 p-4 rounded-xl">
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-muted-foreground">일정</span>
                                                <p className="font-medium text-sm">{selectedCampaign.eventDate || "미정"}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-muted-foreground">모집 대상</span>
                                                <p className="font-medium text-sm">{selectedCampaign.target || "전체"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-muted-foreground">제공 혜택</span>
                                                <p className="font-bold text-emerald-600 text-sm">{selectedCampaign.budget || "협의"}</p>
                                            </div>
                                            {selectedCampaign.postingDate && (
                                                <div className="space-y-1 md:col-span-2">
                                                    <span className="text-xs font-bold text-muted-foreground">업로드 일정</span>
                                                    <p className="font-medium text-sm">{selectedCampaign.postingDate}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Right: Proposals */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 font-bold text-lg">
                                        <Package className="h-5 w-5" /> 도착한 제안
                                    </div>

                                    <div className="bg-muted/10 rounded-xl border min-h-[400px] p-4">
                                        {campaignProposals.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3 py-10">
                                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                                    <Bell className="h-5 w-5 opacity-30" />
                                                </div>
                                                <p className="text-sm">이 캠페인에 도착한 제안이 아직 없습니다.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {campaignProposals.map((p: any) => (
                                                    <Card key={p.id} className="overflow-hidden hover:shadow-md transition-all border-l-4 border-l-primary">
                                                        <CardHeader className="p-4 pb-2">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold overflow-hidden">
                                                                        {p.influencerAvatar ? <img src={p.influencerAvatar} alt="" className="w-full h-full object-cover" /> : p.influencerName?.[0]}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-sm">{p.influencerName}</div>
                                                                        <div className="text-[10px] text-muted-foreground">{new Date(p.date).toLocaleDateString()}</div>
                                                                    </div>
                                                                </div>
                                                                <Badge variant={p.status === 'accepted' ? 'default' : (p.status === 'viewed' ? 'outline' : 'secondary')} className="text-[10px] h-5">
                                                                    {p.status === 'accepted' ? '수락됨' : '대기중'}
                                                                </Badge>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="p-4 pt-2 space-y-2">
                                                            <div className="bg-muted/30 p-2.5 rounded text-xs text-foreground/80 italic leading-relaxed">
                                                                "{p.message}"
                                                            </div>
                                                            <div className="flex justify-between items-center text-xs pt-1">
                                                                <span className="text-muted-foreground">희망 비용</span>
                                                                <span className="font-bold text-emerald-600">{p.cost ? `${p.cost.toLocaleString()}원` : "협의"}</span>
                                                            </div>
                                                        </CardContent>
                                                        <CardFooter className="p-2 bg-muted/5 grid grid-cols-2 gap-2">
                                                            {p.status !== 'accepted' && (
                                                                <Button
                                                                    size="sm"
                                                                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                                                                    onClick={async () => {
                                                                        if (confirm('수락하시겠습니까?')) {
                                                                            const { updateApplicationStatus } = await import('@/app/actions/proposal')
                                                                            await updateApplicationStatus(p.id.toString(), 'accepted')
                                                                            alert('수락되었습니다')
                                                                            window.location.reload()
                                                                        }
                                                                    }}
                                                                >
                                                                    수락
                                                                </Button>
                                                            )}
                                                            <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                                                                <Link href="/message">채팅</Link>
                                                            </Button>
                                                        </CardFooter>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                // List View
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">내 캠페인 관리</h1>
                                <p className="text-muted-foreground mt-1">등록하신 캠페인 공고를 관리하고 지원자를 확인하세요.</p>
                            </div>
                            <Button asChild className="gap-2">
                                <Link href="/brand/new"><Plus className="h-4 w-4" /> 새 캠페인 등록</Link>
                            </Button>
                        </div>

                        {myCampaigns.length === 0 ? (
                            <Card className="p-12 text-center border-dashed">
                                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-bold">등록된 캠페인이 없습니다.</h3>
                                <Button asChild className="mt-4"><Link href="/brand/new">캠페인 등록하기</Link></Button>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {myCampaigns.map((c) => {
                                    const appCount = proposals.filter(p => p.campaignId === c.id && p.type === 'creator_apply').length
                                    return (
                                        <Card
                                            key={c.id}
                                            className="group hover:shadow-md transition-all cursor-pointer border-border/60"
                                            onClick={() => setSelectedCampaignId(c.id)}
                                        >
                                            <div className="flex flex-col md:flex-row">
                                                {/* Main Content */}
                                                <div className="flex-1 p-6">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Badge variant="outline" className="text-xs font-normal">{c.category}</Badge>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'active' ? 'text-emerald-600 bg-emerald-100' : 'text-gray-500 bg-gray-100'}`}>
                                                            {c.status === 'active' ? '● 모집중' : '● 마감됨'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground ml-auto md:hidden">{new Date(c.date).toLocaleDateString()}</span>
                                                    </div>

                                                    <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">{c.product}</h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg">
                                                        <div className="space-y-1">
                                                            <div className="text-xs font-bold text-foreground">제공 혜택</div>
                                                            <div className="text-emerald-600 font-bold">{c.budget || "협의"}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-xs font-bold text-foreground">모집 대상</div>
                                                            <div>{c.target || "전체"}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-xs font-bold text-foreground">상세 내용</div>
                                                            <div className="line-clamp-1 text-xs">{c.description}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Action Area */}
                                                <div className="border-t md:border-t-0 md:border-l p-4 md:w-48 bg-muted/5 flex flex-row md:flex-col items-center justify-between md:justify-center gap-2">
                                                    <div className="text-center">
                                                        <div className="text-xs text-muted-foreground mb-1">도착한 제안</div>
                                                        <div className={`text-xl font-bold ${appCount > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                                            {appCount}개
                                                        </div>
                                                    </div>

                                                    <Button variant="ghost" size="sm" className="h-8 text-primary font-bold gap-1" asChild>
                                                        <Link href="/brand?view=proposals">워크스페이스로 이동 <ArrowRight className="h-3 w-3" /></Link>
                                                    </Button>

                                                    <div className="flex gap-1 mt-2" onClick={e => e.stopPropagation()}>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" asChild>
                                                            <Link href={`/brand/edit/${c.id}`}><Pencil className="h-3.5 w-3.5" /></Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => deleteCampaign(c.id)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={`h-7 px-2 text-xs ${c.status === 'active' ? 'text-red-500 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                if (confirm(c.status === 'active' ? "캠페인을 마감하시겠습니까? 더 이상 지원을 받을 수 없습니다." : "캠페인을 다시 진행하시겠습니까?")) {
                                                                    updateCampaignStatus(c.id.toString(), c.status === 'active' ? 'closed' : 'active')
                                                                }
                                                            }}
                                                        >
                                                            {c.status === 'active' ? '마감하기' : '진행하기'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )

            case "proposals":
                // 1. Inbound (Received Applications from Creators) - Waiting
                // Source: 'proposals' table (Creator applied to My Campaign)
                const inboundApplications = proposals?.filter((p: any) => p.status === 'pending' || p.status === 'viewed') || []

                // 2. Outbound (Sent Offers to Creators) - Waiting
                // Source: 'brand_proposals' table (I offered to Creator)
                const outboundOffers = brandProposals?.filter(p => !p.status || p.status === 'offered' || p.status === 'negotiating') || []

                // 3. Active (In Progress) - Both sources
                const activeInbound = proposals?.filter((p: any) => p.status === 'accepted' || p.status === 'signed') || []
                const activeOutbound = brandProposals?.filter((p: any) => p.status === 'accepted' || p.status === 'signed') || []
                const allActive = [...activeInbound, ...activeOutbound].sort((a: any, b: any) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())

                // 4. Completed - Both sources
                const completedInbound = proposals?.filter((p: any) => p.status === 'completed') || []
                const completedOutbound = brandProposals?.filter((p: any) => p.status === 'completed') || []
                const allCompleted = [...completedInbound, ...completedOutbound].sort((a: any, b: any) => new Date(b.completed_at || b.created_at || b.date).getTime() - new Date(a.completed_at || a.created_at || a.date).getTime())

                const handleStatusUpdate = async (id: string | number, status: 'accepted' | 'rejected' | 'hold') => {
                    if (confirm(`이 지원서를 ${status === 'accepted' ? '수락' : status === 'hold' ? '보류' : '거절'}하시겠습니까?`)) {
                        try {
                            const { updateApplicationStatus } = await import('@/app/actions/proposal')
                            const result = await updateApplicationStatus(id.toString(), status)
                            if (result.error) alert(result.error)
                            else {
                                alert("상태가 변경되었습니다.")
                                window.location.reload()
                            }
                        } catch (err) {
                            alert("상태 변경 중 오류가 발생했습니다.")
                        }
                    }
                }

                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">협업 워크스페이스</h1>
                                <p className="text-muted-foreground mt-1">크리에이터와 진행 중인 모든 협업을 한곳에서 관리하세요.</p>
                            </div>
                            <Button className="gap-2" asChild>
                                <Link href="/brand/new">
                                    <Plus className="h-4 w-4" /> 공고 올리기
                                </Link>
                            </Button>
                        </div>

                        <Tabs value={workspaceTab} onValueChange={setWorkspaceTab} className="w-full">
                            <TabsList className="flex flex-wrap h-auto w-full justify-start gap-2 bg-transparent p-0">
                                <TabsTrigger value="inbound" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full">
                                    받은 지원 <span className="ml-2 bg-muted-foreground/20 px-1.5 py-0.5 rounded text-xs">{inboundApplications.length}</span>
                                </TabsTrigger>
                                <TabsTrigger value="outbound" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full">
                                    보낸 제안 <span className="ml-2 bg-muted-foreground/20 px-1.5 py-0.5 rounded text-xs">{outboundOffers.length}</span>
                                </TabsTrigger>
                                <TabsTrigger value="active" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full text-emerald-700 font-medium">
                                    진행중 <span className="ml-2 bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-xs">{allActive.length}</span>
                                </TabsTrigger>
                                <TabsTrigger value="completed" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full text-slate-600 font-medium">
                                    완료됨 <span className="ml-2 bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs">{allCompleted.length}</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Tab 1: Inbound (Creator applied to me) */}
                            <TabsContent value="inbound" className="mt-6 space-y-4">
                                {inboundApplications.length > 0 ? (
                                    inboundApplications.map((p: any) => (
                                        <Card key={p.id} className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all cursor-pointer" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-3">
                                                        <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center overflow-hidden font-bold text-xl">
                                                            {p.influencerAvatar ? <img src={p.influencerAvatar} className="h-full w-full object-cover" /> : (p.influencerName?.[0] || 'C')}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-bold text-lg">{p.influencerName}</h3>
                                                                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">New Application</Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                <span className="font-bold text-foreground">{p.campaignName || p.productName}</span> 캠페인 지원
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(p.id, 'accepted'); }} className="bg-emerald-600 hover:bg-emerald-700">수락하기</Button>
                                                        <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(p.id, 'rejected'); }}>거절하기</Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pb-3 px-6">
                                                <div className="bg-muted/30 p-4 rounded-lg border border-purple-100 text-sm">
                                                    <span className="font-bold text-purple-700 mr-2">희망 비용: {p.cost ? `${parseInt(p.cost).toLocaleString()}원` : '협의'}</span>
                                                    <span className="text-muted-foreground">"{p.message}"</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">도착한 지원서가 없습니다.</div>
                                )}
                            </TabsContent>

                            {/* Tab 2: Outbound (I offered mostly) */}
                            <TabsContent value="outbound" className="mt-6 space-y-4">
                                {outboundOffers.length > 0 ? (
                                    outboundOffers.map((p: any) => (
                                        <Card key={p.id} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all cursor-pointer" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
                                            <div className="flex flex-col md:flex-row gap-6 p-6">
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xl">
                                                    {p.influencer_name?.[0] || "C"}
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold text-xl">{p.influencer_name}</h3>
                                                            <p className="text-sm text-muted-foreground mt-1">제안 제품: {p.product_name}</p>
                                                        </div>
                                                        <Badge variant="outline">제안 보냄 ({p.status})</Badge>
                                                    </div>
                                                    <div className="bg-muted/30 p-4 rounded-lg text-sm">
                                                        <span className="font-bold text-blue-600 mr-2">{p.compensation_amount}</span>
                                                        <span className="text-muted-foreground">"{p.message}"</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">보낸 제안이 없습니다.</div>
                                )}
                            </TabsContent>

                            {/* Tab 3: Active */}
                            <TabsContent value="active" className="mt-6 space-y-4">
                                {allActive.length > 0 ? (
                                    allActive.map((p: any) => {
                                        const creatorName = p.influencerName || p.influencer_name;
                                        const projName = p.product_name || p.productName || p.campaignName;
                                        const avatar = p.influencerAvatar;

                                        return (
                                            <Card key={p.id} className="border-l-4 border-l-emerald-600 bg-emerald-50/10 cursor-pointer hover:shadow-lg transition-all" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
                                                <div className="flex flex-col md:flex-row gap-6 p-6">
                                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 border-2 border-emerald-200 overflow-hidden">
                                                        {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <span className="font-bold text-lg text-emerald-700">{creatorName?.[0] || "C"}</span>}
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-bold text-xl flex items-center gap-2">
                                                                    {projName}
                                                                    <Badge className="bg-emerald-600 hover:bg-emerald-700">진행중</Badge>
                                                                </h3>
                                                                <p className="text-sm text-emerald-800 font-medium mt-1">With {creatorName}</p>
                                                            </div>
                                                            <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">워크스페이스 입장</Button>
                                                        </div>
                                                        <div className="mt-4 flex gap-4 text-xs text-muted-foreground bg-white/50 p-3 rounded-lg border border-emerald-100">
                                                            <div>
                                                                <span className="block font-bold text-slate-700">계약 상태</span>
                                                                <span className={p.contract_status === 'signed' ? "text-emerald-600" : "text-amber-600"}>
                                                                    {p.contract_status === 'signed'
                                                                        ? '체결 완료'
                                                                        : (p.brand_condition_confirmed && p.influencer_condition_confirmed)
                                                                            ? '서명 대기중'
                                                                            : '조건 조율중'
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="block font-bold text-slate-700">시작일</span>
                                                                {new Date(p.created_at || p.date).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground bg-muted/20">진행중인 프로젝트가 없습니다.</div>
                                )}
                            </TabsContent>

                            {/* Tab 4: Completed */}
                            <TabsContent value="completed" className="mt-6 space-y-4">
                                {allCompleted.length > 0 ? (
                                    allCompleted.map((p: any) => {
                                        const creatorName = p.influencerName || p.influencer_name;
                                        const projName = p.product_name || p.productName || p.campaignName;

                                        return (
                                            <Card key={p.id} className="opacity-80 hover:opacity-100 transition-all bg-slate-50 cursor-pointer" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
                                                <div className="flex flex-col md:flex-row gap-6 items-center p-6">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 font-bold">
                                                        {creatorName?.[0] || "C"}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center">
                                                            <h3 className="font-bold text-lg text-slate-700 line-through decoration-slate-400">{projName}</h3>
                                                            <Badge variant="outline" className="border-slate-400 text-slate-500">COMPLETED</Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-500 mt-1">With {creatorName} • {p.completed_at ? new Date(p.completed_at).toLocaleDateString() : '완료됨'}</p>
                                                    </div>
                                                </div>
                                            </Card>
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">완료된 프로젝트가 없습니다.</div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                )
            case "my-products":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">내 브랜드 제품</h1>
                                <p className="text-muted-foreground mt-1">크리에이터들이 제안하거나 살펴볼 수 있는 우리 브랜드의 제품군입니다.</p>
                            </div>
                            <Button className="gap-2" onClick={() => setProductModalOpen(true)}>
                                <Plus className="h-4 w-4" /> 제품 등록하기
                            </Button>
                        </div>

                        {myProducts.length === 0 ? (
                            <Card className="p-12 text-center border-dashed">
                                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-bold">등록된 제품이 없습니다.</h3>
                                <p className="text-muted-foreground mb-6">제품을 등록하면 크리에이터들이 협업 제안 시 참고할 수 있습니다.</p>
                                <Button onClick={() => setProductModalOpen(true)}>제품 등록하기</Button>
                            </Card>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {myProducts.map((p) => (
                                    <Card key={p.id} className="overflow-hidden flex flex-col h-full border-border/60 hover:shadow-md transition-all">
                                        <div className="aspect-square bg-muted flex items-center justify-center text-4xl relative group">
                                            {p.image.startsWith('http') ? (
                                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{p.image}</span>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Button size="icon" variant="secondary" className="rounded-full h-10 w-10">
                                                    <ImageIcon className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{p.category}</span>
                                                    <CardTitle className="text-lg font-bold mt-0.5 line-clamp-1">{p.name}</CardTitle>
                                                </div>
                                                <span className="text-sm font-bold text-foreground shrink-0">{p.price > 0 ? `${p.price.toLocaleString()}원` : "가격 미정"}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 pb-4">
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                                {p.description || "등록된 상세 설명이 없습니다."}
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] font-bold text-muted-foreground w-16 shrink-0 uppercase">Key Points</span>
                                                    <span className="text-xs text-foreground line-clamp-1">{p.points || "-"}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] font-bold text-muted-foreground w-16 shrink-0 uppercase">Required</span>
                                                    <span className="text-xs text-foreground line-clamp-1">{p.shots || "-"}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="border-t pt-4 bg-muted/10 flex gap-2">
                                            <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs gap-1" asChild>
                                                <a href={p.link} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-3 w-3" /> 웹사이트
                                                </a>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => handleEditProduct(p)}
                                            >
                                                <Pencil className="h-3 w-3" /> 수정
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2 text-xs gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => {
                                                    if (confirm("정말로 이 제품을 삭제하시겠습니까?")) {
                                                        deleteProduct(p.id).catch(() => alert("삭제에 실패했습니다."));
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" /> 삭제
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )
            case "discover-products":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">브랜드 제품 둘러보기</h1>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    다른 브랜드의 제품을 둘러보고 협업 아이디어를 얻어보세요.
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
                                    <Card key={product.id} className="h-full overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 bg-background border-border/60 group">
                                        <div className="aspect-square bg-muted flex items-center justify-center text-6xl overflow-hidden relative">
                                            {product.image?.startsWith('http') ? (
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            ) : (
                                                <span className="transition-transform group-hover:scale-125">{product.image || "📦"}</span>
                                            )}
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
                                            {product.link && (
                                                <a
                                                    href={product.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline flex items-center gap-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    제품 보기 <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )
            case "notifications":
                const sortedNotifications = [...(notifications || [])].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                                    <Bell className="h-8 w-8 text-primary" /> 알림 센터
                                </h1>
                                <p className="text-slate-500 mt-1">캠페인 지원 및 협업 진행 상황을 실시간으로 확인하세요.</p>
                            </div>
                        </div>

                        {sortedNotifications.length === 0 ? (
                            <Card className="p-20 text-center border-dashed bg-slate-50/50 rounded-[40px] border-2">
                                <Bell className="mx-auto h-16 w-16 text-slate-200 mb-6" />
                                <h3 className="text-xl font-bold text-slate-900">새로운 알림이 없습니다.</h3>
                                <p className="text-sm text-slate-400 mt-2">중요한 협업 업데이트가 발생하면 여기에 실시간으로 표시됩니다.</p>
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
                                            <div className={`mt-1 h-14 w-14 shrink-0 rounded-[22px] flex items-center justify-center transition-all group-hover:scale-110 shadow-sm ${n.is_read ? 'bg-slate-100 text-slate-400' : 'bg-primary/10 text-primary'}`}>
                                                {(n.content || "").includes('지원') || (n.content || "").includes('제안') ? <Briefcase className="h-7 w-7" /> :
                                                    (n.content || "").includes('계약') || (n.content || "").includes('서명') ? <FileText className="h-7 w-7" /> :
                                                        (n.content || "").includes('배송') || (n.content || "").includes('운송장') ? <Package className="h-7 w-7" /> : <Bell className="h-7 w-7" />}
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Notification</span>
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">{new Date(n.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-[15px] font-bold text-slate-800 leading-snug mb-2 group-hover:text-primary transition-colors">{n.content}</p>
                                                <div className="flex items-center gap-2">
                                                    {!n.is_read && (
                                                        <Badge className="text-[9px] h-5 px-2 font-black bg-primary rounded-lg shadow-md border-0 uppercase">New Update</Badge>
                                                    )}
                                                    <span className="text-[11px] text-slate-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">워크스페이스로 이동하여 확인하기 →</span>
                                                </div>
                                            </div>
                                            <div className="self-center">
                                                <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
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
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <h1 className="text-3xl font-bold tracking-tight">브랜드 설정</h1>
                        <Card className="max-w-2xl">
                            <CardHeader>
                                <CardTitle>브랜드 프로필</CardTitle>
                                <CardDescription>크리에이터에게 보여질 브랜드 정보를 관리합니다.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="b-name">브랜드명</Label>
                                    <Input id="b-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="b-web">공식 웹사이트</Label>
                                    <Input id="b-web" className="pl-9" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} placeholder="https://" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="b-phone">대표 연락처</Label>
                                    <Input id="b-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="02-0000-0000" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="b-address">브랜드 주소</Label>
                                    <Input id="b-address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="서울시 강남구..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="b-bio">브랜드 소개</Label>
                                    <Textarea id="b-bio" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="브랜드의 비전과 가치를 설명해주세요." className="min-h-[120px]" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSaveProfile} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "저장하기"}
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card className="max-w-2xl border-red-100 bg-red-50/10 mt-6">
                            <CardHeader>
                                <CardTitle className="text-red-600 flex items-center gap-2">
                                    계정 유형 전환
                                </CardTitle>
                                <CardDescription>
                                    크리에이터 계정으로 전환하시겠습니까? 계정 유형을 변경하면 크리에이터 전용 대시보드를 사용하게 됩니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground mb-4">
                                    * 전환 후에도 브랜드 정보는 유지되지만, 대시보드 인터페이스가 크리에이터용으로 변경됩니다.
                                </p>
                                <Button
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                    onClick={async () => {
                                        if (confirm("정말로 크리에이터 계정으로 전환하시겠습니까?")) {
                                            await switchRole('influencer');
                                        }
                                    }}
                                >
                                    크리에이터 계정으로 전환하기
                                </Button>
                            </CardContent>
                        </Card>
                    </div >
                )
            default:
                return null
        }
    }

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

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
                            <Button
                                variant={currentView === "proposals" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("proposals")}
                            >
                                <Briefcase className="mr-2 h-4 w-4" /> 협업 워크스페이스
                            </Button>
                            {currentView === "proposals" && (
                                <div className="ml-9 space-y-1 mt-1 border-l pl-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`w-full justify-start text-xs h-8 ${workspaceTab === 'inbound' ? 'bg-primary/20 text-primary font-bold' : 'text-muted-foreground'}`}
                                        onClick={() => setWorkspaceTab("inbound")}
                                    >
                                        받은 지원서
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
                                        className={`w-full justify-start text-xs h-8 ${workspaceTab === 'completed' ? 'bg-slate-100 text-slate-700 font-medium' : 'text-muted-foreground'}`}
                                        onClick={() => setWorkspaceTab("completed")}
                                    >
                                        완료됨
                                    </Button>
                                </div>
                            )}
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
                                <Input id="p-pay" value={compensation} onChange={(e) => setCompensation(e.target.value)} placeholder="0원 (또는 협의)" />
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="p-inc" checked={hasIncentive} onCheckedChange={(c) => setHasIncentive(c as boolean)} />
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
                        <div className="grid grid-cols-4 gap-4">
                            <Label htmlFor="p-msg" className="text-right pt-2 text-xs font-bold">전달 메시지</Label>
                            <div className="col-span-3 space-y-1">
                                <Textarea id="p-msg" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[100px]" />
                                <p className="text-xs text-muted-foreground pt-1">
                                    * 크리에이터가 제안을 수락하면 예상 단가를 열람할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    </div>
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
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingProductId ? "제품 수정" : "우리 브랜드 제품 등록"}</DialogTitle>
                        <DialogDescription>
                            {editingProductId ? "제품 정보를 수정해주세요." : "크리에이터가 확인하고 제안할 수 있도록 제품 상세 정보를 입력해 주세요."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                        {/* Left Column: Basic Info & Social */}
                        <div className="space-y-6">
                            <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                                    <Package className="h-4 w-4" /> 기본 정보
                                </h4>
                                <div className="space-y-2">
                                    <Label htmlFor="op-name">제품명 <span className="text-red-500">*</span></Label>
                                    <Input id="op-name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="예: 보이브 룸 스프레이 필로우토크" className="bg-white" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="op-cat">카테고리 <span className="text-red-500">*</span></Label>
                                        <Select value={newProductCategory} onValueChange={setNewProductCategory}>
                                            <SelectTrigger id="op-cat" className="bg-white">
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
                                        <Input id="op-price" type="number" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} placeholder="0" className="bg-white" />
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
                                            className="w-full bg-white"
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
                                        className="bg-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
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
                                        className="bg-white"
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
                                        className="bg-white"
                                    />
                                </div>
                                <div className="bg-white p-3 rounded-lg text-xs text-muted-foreground flex items-start gap-2 border border-slate-200">
                                    <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                    <span>
                                        <span className="font-bold text-red-500">*[광고] 또는 [협찬] 문구</span>를 상단에 필수로 기재해달라는 안내가 자동으로 포함됩니다.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Detailed Guide */}
                        <div className="space-y-6">
                            <div className="space-y-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm h-full">
                                <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
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
                <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-slate-50">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold text-slate-900">제작 가이드 미리보기</DialogTitle>
                        <DialogDescription className="text-center">
                            크리에이터에게 보여질 가이드 화면입니다.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden my-2">
                        {/* Header Image */}
                        <div className="h-40 bg-slate-100 relative group">
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
                            <div className="text-center space-y-2 border-b border-slate-100 pb-6">
                                <h3 className="text-xl font-black text-slate-900">{newProductName || "제품명 없음"}</h3>
                                <p className="text-lg font-bold text-primary">
                                    {newProductPrice ? `${parseInt(newProductPrice).toLocaleString()}원` : "가격 미정"}
                                </p>
                                <p className="text-sm text-slate-500 leading-relaxed px-4">
                                    {newProductDescription || "제품 설명이 없습니다."}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> 소구 포인트
                                    </h4>
                                    <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50 text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap">
                                        {newProductPoints || "-"}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <FileText className="h-3 w-3" /> 필수 가이드
                                    </h4>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-3">
                                        {newProductContentGuide && (
                                            <div>
                                                <strong className="block text-slate-700 mb-1">필수 포함 내용</strong>
                                                <p className="text-slate-600 whitespace-pre-wrap">{newProductContentGuide}</p>
                                            </div>
                                        )}
                                        {newProductFormatGuide && (
                                            <div>
                                                <strong className="block text-slate-700 mb-1">필수 형식</strong>
                                                <p className="text-slate-600 whitespace-pre-wrap">{newProductFormatGuide}</p>
                                            </div>
                                        )}
                                        {!newProductContentGuide && !newProductFormatGuide && <p className="text-slate-400">등록된 필수 가이드가 없습니다.</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <AtSign className="h-3 w-3" /> 태그 및 계정
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {newProductAccountTag && (
                                            <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-700 shadow-sm">
                                                {newProductAccountTag}
                                            </span>
                                        )}
                                        {newProductHashtags.split(/[\s,]+/).filter(t => t).map((tag, i) => (
                                            <span key={i} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-600">
                                                {tag.startsWith('#') ? tag : `#${tag}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
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
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Premium Deal Room Dialog */}
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <DialogContent className="max-w-[1100px] p-0 overflow-hidden flex h-[85vh] bg-white border-0 shadow-2xl rounded-2xl">
                    <div className="flex h-full w-full">
                        {/* Left Sidebar: Deal Info & Workflow */}
                        <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 animate-in slide-in-from-left duration-300">
                            <div className="p-6 border-b border-white bg-gradient-to-br from-slate-50 to-slate-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-14 w-14 rounded-full border-2 border-white shadow-md overflow-hidden bg-white flex items-center justify-center font-bold text-xl text-primary">
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
                                        <h3 className="font-bold text-lg text-slate-900 truncate">{chatProposal?.influencer_name || chatProposal?.influencerName}</h3>
                                        <p className="text-xs text-slate-500 truncate">{chatProposal?.product_name || "제품 협력"}</p>
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
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">진행 단계</h4>
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
                                                    { id: 2, label: "제품 발송/제공", tab: "work" },
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
                                                                    isCurrent ? 'text-primary font-bold bg-primary/5 border border-primary/10 shadow-sm' :
                                                                        'text-slate-400 opacity-60 hover:opacity-100 hover:bg-slate-50'}
                                                            `}
                                                        >
                                                            <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 
                                                                ${isDone ? 'bg-emerald-500 border-emerald-500' :
                                                                    isCurrent ? 'bg-white border-primary animate-pulse' :
                                                                        'border-slate-300'}
                                                            `} />
                                                            {isCurrent && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold">NOW</span>}
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

                                                    const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'creator_apply';
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
                                            <p className="text-[10px] text-slate-400 mt-2 text-center">
                                                * 정산 및 성과 보고가 끝난 후 눌러주세요.
                                            </p>
                                        </div>
                                    )}

                                    <div className="px-2">
                                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-xs shadow-sm">
                                            <p className="font-bold text-primary mb-2 flex items-center gap-1.5">
                                                <Info className="h-3.5 w-3.5" /> MD's Tip
                                            </p>
                                            <p className="text-slate-600 leading-relaxed">
                                                크리에이터에게 <strong>계약서</strong>를 먼저 발송해주세요. 서명이 완료되면 다음 단계로 넘어갑니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto p-4 border-t border-slate-200 bg-slate-100/50 text-[10px] text-slate-400 text-center font-medium tracking-tight">
                                CreadyPick Secure Workspace™
                            </div>
                        </div>

                        {/* Right Content: Workspace Tabs */}
                        <Tabs value={activeProposalTab} onValueChange={setActiveProposalTab} className="flex-1 flex flex-col min-w-0 bg-white shadow-inner">
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
                                <div>
                                    <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">진행 워크스페이스</DialogTitle>
                                    <DialogDescription className="text-slate-500 text-sm">{chatProposal?.influencer_name}님과의 협업 공간입니다.</DialogDescription>
                                </div>
                                <TabsList className="bg-slate-100 p-1 rounded-xl h-11">
                                    <TabsTrigger value="chat" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">소통</TabsTrigger>
                                    <TabsTrigger value="contract" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">계약 관리</TabsTrigger>
                                    <TabsTrigger value="work" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">작업물/배송 관리</TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Chat Tab */}
                            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 m-0 data-[state=active]:flex bg-slate-50/30">
                                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                    {/* Proposal Box (Top of chat) */}
                                    {chatProposal && (
                                        <div className="mb-8 p-6 bg-white border border-primary/20 rounded-2xl shadow-md animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                                                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                                    <BadgeCheck className="h-5 w-5" /> 협업 제안 정보
                                                </h4>
                                                <span className="text-[10px] font-bold text-slate-400">ID: {chatProposal.id}</span>
                                            </div>
                                            <div className="space-y-5">
                                                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    <div className="space-y-1.5">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">크리에이터</p>
                                                        <p className="font-bold text-sm text-slate-900 truncate">{chatProposal.influencer_name}</p>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">제시 협업비</p>
                                                        <p className="font-bold text-primary text-sm">
                                                            {chatProposal.cost ? `${parseInt(chatProposal.cost).toLocaleString()}원` : chatProposal.compensation_amount || '협의'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-white p-4 rounded-xl border-l-4 border-primary shadow-sm">
                                                    <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-tight">발송된 협업 제안 메시지</p>
                                                    <p className="text-sm italic leading-relaxed text-slate-700 whitespace-pre-wrap">"{chatProposal.message}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Condition Confirmation Card (Mutual Agreement) */}
                                    {chatProposal && (
                                        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in slide-in-from-top-5 duration-700">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                    <BadgeCheck className="h-5 w-5 text-indigo-600" /> 조건 확정 (Mutual Confirmation)
                                                </h4>
                                                {chatProposal.brand_condition_confirmed && chatProposal.influencer_condition_confirmed ? (
                                                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full border border-indigo-200">
                                                        ✅ 양측 확정 완료
                                                    </span>
                                                ) : (
                                                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200">
                                                        ⏳ 확정 대기 중
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mb-4">
                                                계약서 작성 전, 협의된 조건(금액, 일정 등)에 대해 양측이 최종 확정을 해야 합니다.<br />
                                                양측 모두 확정 버튼을 누르면 계약서 생성 단계로 넘어갑니다.
                                            </p>
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Brand Status */}
                                                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${chatProposal.brand_condition_confirmed ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Brand (본인)</span>
                                                    {chatProposal.brand_condition_confirmed ? (
                                                        <div className="text-indigo-700 font-bold text-sm flex items-center gap-1">
                                                            <BadgeCheck className="h-4 w-4" /> 확정 완료
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            className="h-8 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md"
                                                            onClick={async () => {
                                                                if (!confirm("현재 협의된 조건으로 확정하시겠습니까?")) return;
                                                                const isCampaignProposal = !!chatProposal.campaignId || chatProposal.type === 'creator_apply';
                                                                const proposalId = chatProposal.id.toString();
                                                                if (isCampaignProposal) {
                                                                    await updateProposal(proposalId, { brand_condition_confirmed: true });
                                                                } else {
                                                                    await updateBrandProposal(proposalId, { brand_condition_confirmed: true });
                                                                }
                                                                setChatProposal(prev => ({ ...prev, brand_condition_confirmed: true }));
                                                                // Notify Creator
                                                                const receiverId = chatProposal.influencer_id || chatProposal.influencerId || chatProposal.influencer?.id;
                                                                if (receiverId) {
                                                                    await sendNotification(receiverId, `✅ [조건 확정] 브랜드가 조건을 최종 확정했습니다.`, 'condition_confirmed', proposalId);
                                                                    await sendMessage(receiverId, "✅ [시스템 알림] 브랜드가 조건을 최종 확정했습니다. 크리에이터님도 확정해주세요.", undefined, proposalId);
                                                                }
                                                            }}
                                                        >
                                                            조건 확정하기
                                                        </Button>
                                                    )}
                                                </div>

                                                {/* Influencer Status */}
                                                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${chatProposal.influencer_condition_confirmed ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Creator</span>
                                                    {chatProposal.influencer_condition_confirmed ? (
                                                        <div className="text-indigo-700 font-bold text-sm flex items-center gap-1">
                                                            <BadgeCheck className="h-4 w-4" /> 확정 완료
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-400 font-bold text-xs flex items-center gap-1 animate-pulse">
                                                            <Loader2 className="h-3 w-3" /> 대기 중...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Real Messages */}
                                    {allMessages
                                        .filter(m => {
                                            if (!chatProposal) return false
                                            const pId = chatProposal.influencer_id || chatProposal.influencerId || chatProposal.influencer?.id

                                            // 1. Basic User Match
                                            const isUserMatch = (m.senderId === user?.id && m.receiverId === pId) || (m.senderId === pId && m.receiverId === user?.id)
                                            if (!isUserMatch) return false

                                            // 2. Strict Context Match (Proposal ID)
                                            const isCampaignProposal = (chatProposal as any).type === 'creator_apply' || !!(chatProposal as any).campaignId
                                            const currentProposalId = chatProposal.id?.toString()

                                            if (isCampaignProposal) {
                                                // Must match proposalId (for Campaign Applications)
                                                // We use loose check (==) to handle string/number differences safely
                                                return m.proposalId == currentProposalId
                                            } else {
                                                // Must match brandProposalId (for Direct Offers)
                                                return m.brandProposalId == currentProposalId
                                            }
                                        })
                                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                        .map((msg, idx) => {
                                            // Helper to render Guide Card (Brand View)
                                            const renderGuideCard = () => {
                                                // In Brand Page, chatProposal has product info, or we look up in global products
                                                const pId = chatProposal?.product_id;
                                                const pName = chatProposal?.product_name;

                                                // Try to find full product details
                                                // We can use the global 'products' list if available, or 'myProducts'
                                                // 'myProducts' is defined in the component scope
                                                const prod = pId ? myProducts.find(p => p.id === pId) : null;

                                                // If not found in myProducts (maybe simplified object), check if chatProposal has cached fields?
                                                // Actually myProducts should have it.
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
                                                            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tr-none p-4 shadow-sm text-left relative">
                                                                <div className="w-[280px]">
                                                                    <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                                                                        <div className="bg-emerald-100 text-emerald-600 p-1 rounded-md">
                                                                            <Package className="h-4 w-4" />
                                                                        </div>
                                                                        <span className="font-bold text-sm text-slate-700">제작 가이드 {pName}</span>
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
                                                                                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{gData.sellingPoints}</p>
                                                                            </div>
                                                                        )}
                                                                        {gData.requiredShots && (
                                                                            <div>
                                                                                <strong className="block text-red-600 mb-1">📸 필수 촬영 컷</strong>
                                                                                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{gData.requiredShots}</p>
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
                                                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
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
                                                                                <div className="w-[280px] bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-hidden text-left">
                                                                                    <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                                                                                        <div className="bg-emerald-100 text-emerald-600 p-1 rounded-md">
                                                                                            <Package className="h-4 w-4" />
                                                                                        </div>
                                                                                        <span className="font-bold text-sm text-slate-700">제작 가이드 (자동 발송)</span>
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
                                                                                                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{guideData.sellingPoints}</p>
                                                                                            </div>
                                                                                        )}
                                                                                        {guideData.requiredShots && (
                                                                                            <div>
                                                                                                <strong className="block text-red-600 mb-1">📸 필수 촬영 컷</strong>
                                                                                                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{guideData.requiredShots}</p>
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
                                                            <span className="text-[10px] text-slate-400 mt-2 font-medium px-1">
                                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {/* Auto-render Guide Card after Rate Card (Brand View: Justify End) */}
                                                    {msg.content.startsWith('[RATE_CARD_JSON]') && renderGuideCard()}
                                                </React.Fragment>
                                            )
                                        })}
                                </div>

                                <div className="p-6 border-t bg-white shadow-2xl z-10">
                                    <div className="flex gap-3 max-w-4xl mx-auto">
                                        <Input
                                            className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl px-4"
                                            placeholder="메시지를 입력하세요..."
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            disabled={isSendingMessage}
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={isSendingMessage || !chatMessage.trim()}
                                            className="h-12 w-20 rounded-xl font-bold transition-all shadow-md active:scale-95"
                                        >
                                            {isSendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : "전송"}
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Contract Tab */}
                            <TabsContent value="contract" className="flex-1 overflow-y-auto p-10 bg-slate-50 data-[state=active]:flex flex-col items-center">
                                <div className="w-full max-w-3xl animate-in zoom-in-95 duration-300">
                                    <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 flex flex-col h-full">
                                        <div className="text-center mb-10">
                                            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 rotate-3">
                                                <FileText className="h-10 w-10 text-primary" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">협업 전자 계약서</h3>
                                            <p className="text-slate-500 mt-3 max-w-md mx-auto leading-relaxed">대화 내용을 분석하여 법적 효력을 갖춘 표준 계약서 초안을 생성합니다.</p>
                                        </div>

                                        <div className="space-y-5 flex-1 flex flex-col min-h-0">
                                            <div className="flex justify-between items-end px-1">
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">계약 조항 초안</h4>
                                                    <p className="text-xs text-slate-400 font-medium">실시간 합의 내용이 자동으로 반영됩니다.</p>
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

                                            <div className="flex-1 p-8 bg-slate-50/80 rounded-3xl border border-slate-200 text-sm text-slate-700 leading-relaxed font-mono min-h-[300px] overflow-y-auto shadow-inner relative whitespace-pre-wrap selection:bg-primary/20">
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
                                                    className="text-xs font-bold text-slate-500 underline underline-offset-4 decoration-slate-300 hover:text-primary transition-colors"
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
                                                disabled={!generatedContract || isSendingContract || chatProposal?.contract_status === 'sent'}
                                            >
                                                <Send className="mr-3 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                {chatProposal?.contract_status === 'sent' ? "이미 발송되었습니다" : isSendingContract ? "발송 중..." : "작성된 계약서 크리에이터에게 발송하기"}
                                            </Button>
                                            <p className="text-center text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-widest">
                                                Electronic Signature Powered by CreadyPick Secure™
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Work Tab */}
                            <TabsContent value="work" className="flex-1 overflow-y-auto p-12 bg-slate-50 data-[state=active]:flex flex-col items-center">
                                <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                    {/* Product Delivery Section */}
                                    <div className="bg-white border border-slate-200 rounded-[30px] p-10 shadow-lg">
                                        <div className="flex items-center gap-6 mb-8 border-b border-slate-100 pb-6">
                                            <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                                                <Package className="h-8 w-8 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">제품 배송 관리</h3>
                                                <p className="text-slate-500 mt-1">크리에이터에게 제품을 발송하고 운송장 번호를 등록하세요.</p>
                                            </div>
                                        </div>

                                        {chatProposal?.contract_status !== 'signed' ? (
                                            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed text-slate-400">
                                                <p className="font-bold">🔒 계약이 완료되지 않았습니다</p>
                                                <p className="text-xs mt-1">계약이 체결되면 배송 관리 기능이 활성화됩니다.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-slate-500" /> 배송지 정보
                                                        </h4>
                                                        {!chatProposal.shipping_address && (
                                                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">미입력</span>
                                                        )}
                                                    </div>

                                                    {chatProposal.shipping_address ? (
                                                        <div className="space-y-3 text-sm">
                                                            <div className="flex gap-4">
                                                                <span className="text-slate-500 w-16 shrink-0">받는 분</span>
                                                                <span className="font-bold text-slate-900">{chatProposal.shipping_name}</span>
                                                            </div>
                                                            <div className="flex gap-4">
                                                                <span className="text-slate-500 w-16 shrink-0">연락처</span>
                                                                <span className="font-bold text-slate-900">{chatProposal.shipping_phone}</span>
                                                            </div>
                                                            <div className="flex gap-4">
                                                                <span className="text-slate-500 w-16 shrink-0">주소</span>
                                                                <span className="font-bold text-slate-900 break-keep">{chatProposal.shipping_address}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-400 text-sm py-4 text-center">
                                                            크리에이터가 아직 배송 정보를 입력하지 않았습니다.
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="border-t border-slate-100 pt-6">
                                                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-slate-500" /> 운송장 등록
                                                    </h4>

                                                    {chatProposal.tracking_number ? (
                                                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col gap-4">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-emerald-700 font-bold text-xs uppercase mb-1">Status: Shipped</p>
                                                                    <p className="text-slate-900 font-black text-lg">{chatProposal.tracking_number}</p>
                                                                </div>
                                                                <Button variant="outline" size="sm" className="h-8 text-xs bg-white text-slate-500 hover:text-slate-900"
                                                                    onClick={() => {
                                                                        if (confirm("운송장 번호를 수정하시겠습니까?")) {
                                                                            // Logic to allow clear/edit could go here. For now simple toggle or just input below
                                                                            // A simple way is to clear local state to show input, but state comes from DB.
                                                                            // Let's just show the input below to overwrite.
                                                                        }
                                                                    }}>
                                                                    발송 완료됨
                                                                </Button>
                                                            </div>
                                                            {chatProposal.delivery_status === 'delivered' && (
                                                                <div className="bg-white/60 p-3 rounded-xl flex items-center gap-2 text-emerald-800 font-bold text-sm">
                                                                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                                                                    크리에이터가 제품을 수령 하였습니다.
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-3">
                                                            <Input
                                                                placeholder="운송장 번호를 입력하세요"
                                                                className="h-12 bg-white text-lg font-mono tracking-widest"
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

                                    {/* Existing Result Management Section */}
                                    {/* Work Result (Submission) Section */}
                                    <div className={`border border-slate-200 rounded-[30px] p-8 transition-all ${chatProposal?.content_submission_status === 'submitted' ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-100/50 opacity-70 hover:opacity-100'}`}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center rotate-3 shadow-sm ${chatProposal?.content_submission_status === 'submitted' ? 'bg-indigo-600 text-white' : 'bg-white'}`}>
                                                <Star className={`h-6 w-6 ${chatProposal?.content_submission_status === 'submitted' ? 'text-white' : 'text-slate-400'}`} />
                                            </div>
                                            <h3 className={`text-xl font-bold ${chatProposal?.content_submission_status === 'submitted' ? 'text-indigo-900' : 'text-slate-900'}`}>작업 결과물</h3>
                                            {chatProposal?.content_submission_status && (
                                                <Badge className={`${chatProposal?.content_submission_status === 'submitted' ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-600'}`}>
                                                    {chatProposal?.content_submission_status === 'submitted' ? '제출됨' : chatProposal?.content_submission_status}
                                                </Badge>
                                            )}
                                        </div>

                                        {(chatProposal?.content_submission_url || chatProposal?.content_submission_file_url) ? (
                                            <div className="space-y-4">
                                                <p className="text-slate-600 mb-2 text-sm font-medium">크리에이터가 작업물을 제출했습니다.</p>

                                                <div className="grid gap-3">
                                                    {chatProposal?.content_submission_url && (
                                                        <div className="bg-white p-4 rounded-xl border border-indigo-100 flex items-center justify-between group hover:border-indigo-300 transition-colors">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                                                                    <LinkIcon className="h-5 w-5" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs text-indigo-500 font-bold mb-0.5">CONTENT LINK</p>
                                                                    <p className="text-sm font-bold text-slate-800 truncate">{chatProposal?.content_submission_url}</p>
                                                                </div>
                                                            </div>
                                                            <Button size="sm" variant="ghost" className="text-indigo-600" asChild>
                                                                <a href={chatProposal?.content_submission_url} target="_blank" rel="noopener noreferrer">열기</a>
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {chatProposal?.content_submission_file_url && (
                                                        <div className="bg-white p-4 rounded-xl border border-indigo-100 flex items-center justify-between group hover:border-indigo-300 transition-colors">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                                                                    <FileText className="h-5 w-5" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs text-indigo-500 font-bold mb-0.5">ATTACHED FILE</p>
                                                                    <p className="text-sm font-bold text-slate-800 truncate">
                                                                        {chatProposal?.content_submission_file_url.split('/').pop()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button size="sm" variant="ghost" className="text-indigo-600" asChild>
                                                                <a href={chatProposal?.content_submission_file_url} target="_blank" rel="noopener noreferrer">다운로드</a>
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                {chatProposal?.status !== 'completed' && (
                                                    <div className="flex gap-2 justify-end mt-4">
                                                        <Button
                                                            onClick={async () => {
                                                                if (!chatProposal) return;
                                                                if (!confirm("프로젝트를 완료 처리하시겠습니까?")) return;
                                                                // Handle completion logic
                                                                const updateData = { status: 'completed', completed_at: new Date().toISOString() };
                                                                // Use specific update function based on proposal type
                                                                const isCampaign = !!chatProposal?.campaignId || chatProposal?.type === 'creator_apply';
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
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                                        >
                                                            승인 및 프로젝트 완료
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-slate-500 mb-6 text-sm">
                                                    크리에이터가 콘텐츠 초안이나 최종 발행본을 업로드하면 이곳에서 확인하고 피드백을 전달할 수 있습니다.
                                                </p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center text-slate-400 text-xs py-8">
                                                        아직 등록된 결과물이 없습니다.
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </DialogContent>
            </Dialog>

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
                        <Button onClick={performContractSend} disabled={isSendingContract} className="gap-2">
                            {isSendingContract ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                            서명 완료 및 발송
                        </Button>
                    </DialogFooter>
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

        </div >
    )
}

export default function BrandDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <BrandDashboardContent />
        </Suspense>
    )
}
