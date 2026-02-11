import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Archive, Briefcase, X } from "lucide-react"

interface GuideDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: any
}

export function GuideDialog({ open, onOpenChange, data }: GuideDialogProps) {
    if (!data) return null

    // Helper to clean excess newlines
    const cleanText = (text: string) => {
        if (!text) return ""
        return text.split('\n').filter(line => line.trim() !== '').join('\n\n')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden bg-white border-none shadow-2xl max-h-[90vh] flex flex-col">
                <div className="relative h-28 shrink-0 bg-slate-900 flex items-center px-6 justify-between">
                    <div className="flex items-center gap-4 overflow-hidden">
                        {data.imageUrl && (
                            <div className="h-16 w-16 rounded-lg bg-white/10 shrink-0 overflow-hidden border border-white/20">
                                {data.imageUrl.startsWith('http') ? (
                                    <img src={data.imageUrl} alt="Product" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl bg-slate-800 text-white">
                                        {data.imageUrl.slice(0, 1)}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="min-w-0">
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none mb-1">제작 가이드</Badge>
                            <DialogTitle className="text-xl font-bold text-white truncate">
                                {data.name}
                            </DialogTitle>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10" onClick={() => onOpenChange(false)}>
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <div className="p-6 overflow-y-auto bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column: Selling Points */}
                        <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-full">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg border-b border-slate-100 pb-3 mb-2">
                                <div className="p-1.5 bg-emerald-100 rounded-md">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <h3>소구 포인트</h3>
                            </div>
                            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                                {data.sellingPoints ? cleanText(data.sellingPoints) : <span className="text-slate-400">내용 없음</span>}
                            </div>
                        </div>

                        {/* Right Column: Required Shots */}
                        <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-full">
                            <div className="flex items-center gap-2 text-rose-600 font-bold text-lg border-b border-slate-100 pb-3 mb-2">
                                <div className="p-1.5 bg-rose-100 rounded-md">
                                    <Archive className="h-5 w-5" />
                                </div>
                                <h3>필수 촬영 컷</h3>
                            </div>
                            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                                {data.requiredShots ? cleanText(data.requiredShots) : <span className="text-slate-400">내용 없음</span>}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button size="lg" className="font-bold bg-slate-900 hover:bg-black px-8" onClick={() => onOpenChange(false)}>
                            확인 완료
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
