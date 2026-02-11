"use client"

import React, { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Megaphone, Send, Loader2 } from "lucide-react"
import { usePlatform } from "@/components/providers/platform-provider"
import { ApplyDialog } from "@/app/creator/components/ApplyDialog"
import { CampaignDetailDialog } from "@/app/creator/components/CampaignDetailDialog"

export default function BrandCampaignsPage() {
    const {
        campaigns,
        user,
        isLoading,
    } = usePlatform()

    const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
    const [isCampaignDetailOpen, setIsCampaignDetailOpen] = useState(false)

    // Application form states
    const [appealMessage, setAppealMessage] = useState("")
    const [desiredCost, setDesiredCost] = useState("")
    const [motivation, setMotivation] = useState("")
    const [contentPlan, setContentPlan] = useState("")
    const [portfolioLinks, setPortfolioLinks] = useState("")
    const [instagramHandle, setInstagramHandle] = useState("")
    const [insightFile, setInsightFile] = useState<File | null>(null)
    const [isApplying, setIsApplying] = useState(false)

    // AI Planning states
    const [isAIPlanning, setIsAIPlanning] = useState(false)
    const [aiPlanResult, setAiPlanResult] = useState("")
    const [isAIPlanModalOpen, setIsAIPlanModalOpen] = useState(false)

    // Debug: log campaigns data
    React.useEffect(() => {
        console.log('Brand Campaigns Page - campaigns:', campaigns)
        console.log('Brand Campaigns Page - isLoading:', isLoading)
    }, [campaigns, isLoading])

    // Filter active campaigns
    const activeCampaigns = campaigns?.filter(c => c.status !== 'closed') || []

    const handleApplyClick = (campaign: any) => {
        setSelectedCampaign(campaign)
        setAppealMessage("")
        setDesiredCost("")
        setMotivation("")
        setContentPlan("")
        setPortfolioLinks("")
        setInstagramHandle(user?.handle || "")
        setInsightFile(null)
        setIsApplyDialogOpen(true)
    }

    const handleSubmitApplication = async () => {
        if (!instagramHandle || !motivation || !contentPlan) {
            alert("활동 계정, 지원 동기, 콘텐츠 제작 계획은 필수 입력 항목입니다.")
            return
        }

        setIsApplying(true)
        try {
            const { submitCampaignApplication } = await import('@/app/actions/proposal')
            const { createClient } = await import('@/lib/supabase/client')

            let insightUrl = null
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

            const cost = desiredCost ? parseInt(desiredCost.replace(/[^0-9]/g, '')) : undefined
            const pLinks = portfolioLinks.split('\n').map(l => l.trim()).filter(Boolean)

            const result = await submitCampaignApplication(selectedCampaign.id, {
                message: appealMessage,
                price: cost,
                motivation,
                content_plan: contentPlan,
                portfolio_links: pLinks,
                instagram_handle: instagramHandle,
                insight_screenshot: insightUrl || undefined
            })

            if (result.success) {
                alert("지원이 완료되었습니다!")
                setIsApplyDialogOpen(false)
                // Reset form
                setAppealMessage("")
                setDesiredCost("")
                setMotivation("")
                setContentPlan("")
                setPortfolioLinks("")
                setInsightFile(null)
            } else {
                throw new Error(result.error || "지원 실패")
            }
        } catch (error: any) {
            console.error('Application error:', error)
            alert(`지원 실패: ${error.message}`)
        } finally {
            setIsApplying(false)
        }
    }

    const handleGenerateAIPlan = async () => {
        if (!selectedCampaign) return

        setIsAIPlanning(true)
        try {
            const { generateContentPlan } = await import('@/app/actions/ai')
            const result = await generateContentPlan({
                campaignName: selectedCampaign.product,
                campaignDescription: selectedCampaign.description,
                targetAudience: selectedCampaign.target,
                brandName: selectedCampaign.brand
            })

            if (result.success && result.plan) {
                setAiPlanResult(result.plan)
                setIsAIPlanModalOpen(true)
            } else {
                throw new Error(result.error || "AI 계획 생성 실패")
            }
        } catch (error: any) {
            console.error('AI planning error:', error)
            alert(`AI 계획 생성 실패: ${error.message}`)
        } finally {
            setIsAIPlanning(false)
        }
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        )
    }

    return (
        <>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">브랜드 캠페인 둘러보기</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            브랜드가 등록한 캠페인을 확인하고 지원해보세요.
                        </p>
                    </div>
                </div>

                {activeCampaigns.length === 0 ? (
                    <Card className="p-20 text-center border-dashed bg-muted/20">
                        <Megaphone className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground">등록된 캠페인이 없습니다.</h3>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {activeCampaigns.map((camp) => (
                            <Card
                                key={camp.id}
                                className="flex flex-col h-full hover:shadow-lg transition-all border-border/60 hover:border-primary/50 group cursor-pointer"
                                onClick={() => {
                                    setSelectedCampaign(camp);
                                    setIsCampaignDetailOpen(true);
                                }}
                            >
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                            {camp.category ? camp.category.split(',')[0] : '카테고리 없음'}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {camp.date ? new Date(camp.date).toLocaleDateString() : new Date().toLocaleDateString()}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg font-bold line-clamp-1">{camp.product}</CardTitle>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden">
                                            {camp.brandAvatar ? (
                                                <img src={camp.brandAvatar} alt={camp.brand} className="h-full w-full object-cover" />
                                            ) : (
                                                camp.brand?.[0] || 'B'
                                            )}
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

            {/* Dialogs */}
            <ApplyDialog
                isOpen={isApplyDialogOpen}
                onClose={() => setIsApplyDialogOpen(false)}
                campaign={selectedCampaign}
                appealMessage={appealMessage}
                setAppealMessage={setAppealMessage}
                desiredCost={desiredCost}
                setDesiredCost={setDesiredCost}
                motivation={motivation}
                setMotivation={setMotivation}
                contentPlan={contentPlan}
                setContentPlan={setContentPlan}
                portfolioLinks={portfolioLinks}
                setPortfolioLinks={setPortfolioLinks}
                instagramHandle={instagramHandle}
                setInstagramHandle={setInstagramHandle}
                insightFile={insightFile}
                setInsightFile={setInsightFile}
                onSubmit={handleSubmitApplication}
                isApplying={isApplying}
                onGenerateAIPlan={handleGenerateAIPlan}
                isAIPlanning={isAIPlanning}
                aiPlanResult={aiPlanResult}
                isAIPlanModalOpen={isAIPlanModalOpen}
                setIsAIPlanModalOpen={setIsAIPlanModalOpen}
            />

            <CampaignDetailDialog
                isOpen={isCampaignDetailOpen}
                onClose={() => setIsCampaignDetailOpen(false)}
                campaign={selectedCampaign}
                onApply={handleApplyClick}
            />
        </>
    )
}
