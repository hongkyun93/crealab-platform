"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FileText, Megaphone, Search, Settings, ShoppingBag, User } from "lucide-react"

interface ProductGuideDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    product: any
}

export function ProductGuideDialog({
    isOpen,
    onOpenChange,
    product
}: ProductGuideDialogProps) {
    if (!product) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        🛍️ 제작 가이드: {product.name}
                        {product.category && <Badge variant="outline">{product.category}</Badge>}
                    </DialogTitle>
                    <DialogDescription>
                        브랜드가 요청한 콘텐츠 제작 필수 가이드라인입니다. 반드시 확인해주세요.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* 1. Account Tag */}
                    {product.account_tag && (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h4 className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                                <User className="h-4 w-4 text-indigo-600" /> 필수 태그 계정
                            </h4>
                            <div className="text-lg font-mono text-indigo-600 bg-white px-3 py-1 rounded border border-indigo-100 inline-block">
                                {product.account_tag.startsWith('@') ? product.account_tag : `@${product.account_tag}`}
                            </div>
                        </div>
                    )}

                    {/* 2. Hashtags */}
                    {product.tags && product.tags.length > 0 && (
                        <div>
                            <h4 className="flex items-center gap-2 font-bold text-slate-900 mb-3">
                                <Search className="h-4 w-4 text-pink-500" /> 필수 해시태그
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 3. Selling Points */}
                        {product.selling_points && (
                            <Card className="shadow-sm">
                                <CardHeader className="pb-2 bg-amber-50/50">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-900">
                                        <Megaphone className="h-4 w-4 text-indigo-600" /> 소구 포인트 (Selling Points)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 text-sm whitespace-pre-line leading-relaxed text-slate-700">
                                    {product.selling_points}
                                </CardContent>
                            </Card>
                        )}

                        {/* 4. Required Shots */}
                        {product.required_shots && (
                            <Card className="shadow-sm">
                                <CardHeader className="pb-2 bg-emerald-50/50">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-900">
                                        <ShoppingBag className="h-4 w-4 text-emerald-600" /> 필수 연출 컷
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 text-sm whitespace-pre-line leading-relaxed text-slate-700">
                                    {product.required_shots}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* 5. Content Guide */}
                    {product.content_guide && (
                        <div>
                            <h4 className="flex items-center gap-2 font-bold text-slate-900 mb-2 border-b pb-2">
                                <FileText className="h-4 w-4 text-blue-600" /> 필수 포함 내용 (가이드)
                            </h4>
                            <div className="bg-blue-50/30 p-4 rounded-lg text-sm whitespace-pre-line leading-relaxed text-slate-800">
                                {product.content_guide}
                            </div>
                        </div>
                    )}

                    {/* 6. Format Guide */}
                    {product.format_guide && (
                        <div>
                            <h4 className="flex items-center gap-2 font-bold text-slate-900 mb-2 border-b pb-2">
                                <Settings className="h-4 w-4 text-slate-600" /> 필수 형식 (포맷)
                            </h4>
                            <div className="bg-slate-50 p-4 rounded-lg text-sm whitespace-pre-line leading-relaxed text-slate-800">
                                {product.format_guide}
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>닫기</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
