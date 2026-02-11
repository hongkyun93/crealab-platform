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
import { Badge } from "@/components/ui/badge"
import { ChevronRight, FileText, Megaphone, Pencil, Rocket, ShoppingBag, Trash2 } from "lucide-react"

interface DetailsModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    data: any
    type: 'moment' | 'campaign'
    proposals?: any[]
    onViewProposal: (proposalId: string) => void
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
}

export function DetailsModal({
    isOpen,
    onOpenChange,
    data,
    type,
    proposals = [],
    onViewProposal,
    onEdit,
    onDelete
}: DetailsModalProps) {
    if (!data) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {type === 'moment' ? <Rocket className="h-5 w-5 text-blue-500" /> : <Megaphone className="h-5 w-5 text-purple-500" />}
                        {type === 'moment' ? data.title || data.event : data.productName || data.product}
                    </DialogTitle>
                    <DialogDescription>
                        {type === 'moment' ? '등록된 모먼트 상세 정보 및 제안 현황' : '지원한 캠페인 상세 정보 및 제안 현황'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Details Section */}
                    <div className="rounded-lg border bg-slate-50 p-4 space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4" />상세 내용
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {type === 'moment' ? (
                                <>
                                    <div>
                                        <span className="text-muted-foreground block mb-1">카테고리</span>
                                        <span className="font-medium">{data.category}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block mb-1">광고 가능 아이템</span>
                                        <span className="font-medium">{data.targetProduct}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground block mb-1">설명</span>
                                        <p className="whitespace-pre-wrap text-slate-700">{data.description}</p>
                                    </div>
                                    {data.tags && (
                                        <div className="col-span-2 flex flex-wrap gap-2 mt-2">
                                            {data.tags.map((tag: string, i: number) => (
                                                <Badge key={i} variant="secondary">#{tag}</Badge>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div>
                                        <span className="text-muted-foreground block mb-1">브랜드</span>
                                        <span className="font-medium">{data.brand}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block mb-1">예산</span>
                                        <span className="font-medium">{data.budget}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground block mb-1">모집 내용</span>
                                        <p className="whitespace-pre-wrap text-slate-700">{data.description}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Proposals Section */}
                    <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                            <ShoppingBag className="h-4 w-4" /> 받은 제안 목록 ({proposals.length})
                        </h4>

                        {proposals.length > 0 ? (
                            <div className="space-y-3">
                                {proposals.map((prop, idx) => (
                                    <div key={prop.id || idx} className="flex items-center justify-between p-4 rounded-lg border bg-white shadow-sm hover:border-primary/50 transition-colors">
                                        <div className="space-y-1">
                                            <div className="font-medium flex items-center gap-2">
                                                {prop.brand_name || "Brand"}
                                                <Badge variant="outline" className="text-xs">{prop.product_name}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {prop.message || "제안 내용 없음"}
                                            </p>
                                            <div className="text-xs text-slate-500">
                                                제안일: {prop.created_at ? new Date(prop.created_at).toLocaleDateString() : '-'}
                                            </div>
                                        </div>
                                        <Button size="sm" onClick={() => onViewProposal(prop.id)}>
                                            제안 보기 <ChevronRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                                아직 도착한 제안이 없습니다.
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex justify-between sm:justify-between w-full">
                    {type === 'moment' ? (
                        <div className="flex gap-2">
                            <Button variant="outline" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => onEdit?.(data.id)}>
                                <Pencil className="h-4 w-4 mr-2" /> 수정하기
                            </Button>
                            <Button variant="outline" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete?.(data.id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> 삭제하기
                            </Button>
                        </div>
                    ) : <div></div>}
                    <Button variant="outline" onClick={() => onOpenChange(false)}>닫기</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
