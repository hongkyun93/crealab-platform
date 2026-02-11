import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Gift, Megaphone, Send, User, X } from "lucide-react"

interface CampaignDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    campaign: any
    onApply: (campaign: any) => void
}

export function CampaignDetailDialog({ open, onOpenChange, campaign, onApply }: CampaignDetailDialogProps) {
    if (!campaign) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0 bg-white border-0 shadow-2xl rounded-xl">
                {/* Header Image Area */}
                <div className="relative h-48 bg-slate-900 w-full shrink-0">
                    {campaign.image ? (
                        <img src={campaign.image} alt={campaign.product} className="w-full h-full object-cover opacity-80" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                            <Megaphone className="h-16 w-16 text-white/20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    <div className="absolute bottom-6 left-6 right-6 text-white">
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none mb-2 text-white">
                            {campaign.category || '카테고리 없음'}
                        </Badge>
                        <h2 className="text-2xl font-bold leading-tight">{campaign.product}</h2>
                        <div className="flex items-center gap-2 mt-2 text-white/90">
                            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30">
                                {campaign.brandAvatar ? (
                                    <img src={campaign.brandAvatar} alt={campaign.brand} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold">{campaign.brand?.[0]}</span>
                                )}
                            </div>
                            <span className="font-medium text-sm">{campaign.brand}</span>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                <Gift className="h-4 w-4" /> 제공 혜택
                            </div>
                            <div className="font-bold text-lg text-emerald-600">{campaign.budget}</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                <User className="h-4 w-4" /> 모집 대상
                            </div>
                            <div className="font-semibold text-slate-900">{campaign.target || '제한 없음'}</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-slate-400" />
                            캠페인 소개
                        </h3>
                        <div className="text-slate-600 leading-relaxed whitespace-pre-wrap bg-white">
                            {campaign.description}
                        </div>
                    </div>

                    {/* Campaign Details - Dates */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-slate-400" />
                            진행 일정
                        </h3>
                        <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">모집 마감</span>
                                <span className="font-medium">{campaign.date ? new Date(campaign.date).toLocaleDateString() : '상시 모집'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">콘텐츠 업로드</span>
                                <span className="font-medium">{campaign.postingDate ? new Date(campaign.postingDate).toLocaleDateString() : '협의'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 border-t bg-slate-50/50">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="h-12 px-6">
                        닫기
                    </Button>
                    <Button
                        onClick={() => {
                            onOpenChange(false);
                            onApply(campaign);
                        }}
                        className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2"
                    >
                        <Send className="h-4 w-4" />
                        지원하기
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
