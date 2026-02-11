"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, Sparkles } from "lucide-react"

interface ApplyDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedCampaign: any
    appealMessage: string
    setAppealMessage: (val: string) => void
    desiredCost: string
    setDesiredCost: (val: string) => void
    motivation: string
    setMotivation: (val: string) => void
    contentPlan: string
    setContentPlan: (val: string) => void
    portfolioLinks: string
    setPortfolioLinks: (val: string) => void
    instagramHandle: string
    setInstagramHandle: (val: string) => void
    insightFile: File | null
    setInsightFile: (file: File | null) => void
    onSubmit: () => void
    isApplying: boolean
    onClose: () => void
    onGenerateAIPlan: (campaign: any) => void
    isAIPlanning: boolean
}

export function ApplyDialog({
    open,
    onOpenChange,
    selectedCampaign,
    appealMessage,
    setAppealMessage,
    desiredCost,
    setDesiredCost,
    motivation,
    setMotivation,
    contentPlan,
    setContentPlan,
    portfolioLinks,
    setPortfolioLinks,
    instagramHandle,
    setInstagramHandle,
    insightFile,
    setInsightFile,
    onSubmit,
    isApplying,
    onClose,
    onGenerateAIPlan,
    isAIPlanning
}: ApplyDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>캠페인 지원하기</DialogTitle>
                    <DialogDescription>
                        {selectedCampaign?.brand} - {selectedCampaign?.product}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                    <div className="space-y-2">
                        <Label htmlFor="handle">활동 계정 (인스타그램 ID) <span className="text-red-500">*</span></Label>
                        <Input
                            id="handle"
                            value={instagramHandle}
                            onChange={(e) => setInstagramHandle(e.target.value)}
                            placeholder="@example_id"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="motivation">지원 동기 <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="motivation"
                            value={motivation}
                            onChange={(e) => setMotivation(e.target.value)}
                            placeholder="이 캠페인에 지원하게 된 이유와 제품에 대한 관심을 표현해주세요."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="contentPlan">콘텐츠 제작 계획 <span className="text-red-500">*</span></Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                onClick={() => onGenerateAIPlan(selectedCampaign)}
                                disabled={isAIPlanning}
                            >
                                {isAIPlanning ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
                                AI 기획안 받기
                            </Button>
                        </div>
                        <Textarea
                            id="contentPlan"
                            value={contentPlan}
                            onChange={(e) => setContentPlan(e.target.value)}
                            className="min-h-[150px]"
                            placeholder="어떤 컨셉과 구도로 촬영할지 구체적으로 작성해주세요."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="portfolio">포트폴리오 링크 (선택)</Label>
                        <Textarea
                            id="portfolio"
                            value={portfolioLinks}
                            onChange={(e) => setPortfolioLinks(e.target.value)}
                            placeholder="관련된 콘텐츠 URL을 줄바꿈으로 구분하여 입력해주세요."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="insight">인사이트 캡처 (선택)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="insight"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setInsightFile(e.target.files[0])
                                    }
                                }}
                                className="cursor-pointer"
                            />
                            {insightFile && <span className="text-xs text-emerald-600 font-bold">선택됨</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">계정 도달수나 팔로워 인사이트 캡처를 첨부하면 선정 확률이 높아집니다.</p>
                    </div>

                    <div className="space-y-2 border-t pt-2">
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

                    <div className="space-y-2 border-t pt-2">
                        <Label htmlFor="message">추가 어필 메시지</Label>
                        <Textarea
                            id="message"
                            value={appealMessage}
                            onChange={(e) => setAppealMessage(e.target.value)}
                            className="min-h-[80px]"
                            placeholder="기타 브랜드에게 하고 싶은 말이 있다면 자유롭게 적어주세요."
                        />
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
