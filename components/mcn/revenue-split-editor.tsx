"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/providers/auth-provider"
import { toast } from "sonner"
import { X, Save, Users, Building2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface RevenueSplitEditorProps {
    teamId: string
    creator: {
        id: string
        name: string
        avatar: string | null
        currentRatio: number
    }
    onClose: () => void
    onSaved: (creatorId: string, newRatio: number) => void
}

export function RevenueSplitEditor({ teamId, creator, onClose, onSaved }: RevenueSplitEditorProps) {
    const { supabase } = useAuth()
    const [ratio, setRatio] = useState(Math.round(creator.currentRatio * 100)) // percent integer
    const [isSaving, setIsSaving] = useState(false)

    const creatorPct = ratio
    const mcnPct = 100 - ratio

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const newRatioDecimal = ratio / 100

            // Try RPC first; fallback to direct upsert
            const { error: rpcError } = await supabase.rpc('upsert_revenue_split', {
                target_team_id: teamId,
                target_creator_id: creator.id,
                new_ratio: newRatioDecimal,
            })

            if (rpcError) {
                // RPC not deployed yet — direct upsert
                const { error: upsertError } = await supabase
                    .from('mcn_revenue_splits')
                    .upsert({
                        team_id: teamId,
                        creator_id: creator.id,
                        split_ratio: newRatioDecimal,
                        effective_from: new Date().toISOString().split('T')[0],
                    }, { onConflict: 'team_id,creator_id' })

                if (upsertError) throw upsertError
            }

            toast.success(`${creator.name} 배분율이 ${ratio}%로 저장됐어요`)
            onSaved(creator.id, newRatioDecimal)
        } catch (err) {
            console.error('[RevenueSplitEditor] Save error:', err)
            toast.error('저장 중 오류가 발생했습니다')
        } finally {
            setIsSaving(false)
        }
    }

    const PRESETS = [
        { label: '9:1', creator: 90 },
        { label: '8:2', creator: 80 },
        { label: '7:3', creator: 70 },
        { label: '6:4', creator: 60 },
    ]

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-sm p-6 space-y-5"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="font-bold text-base">수익 배분율 설정</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">협업 수익을 어떻게 나눌지 결정하세요</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Creator info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={creator.avatar || ''} />
                        <AvatarFallback className="font-bold">{creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm">{creator.name}</p>
                        <p className="text-xs text-muted-foreground">현재 배분율: {Math.round(creator.currentRatio * 100)}%</p>
                    </div>
                </div>

                {/* Visual split bar */}
                <div className="space-y-3">
                    <div className="flex rounded-lg overflow-hidden h-10 text-sm font-semibold">
                        <div
                            className="flex items-center justify-center bg-blue-500 text-white transition-all duration-150"
                            style={{ width: `${creatorPct}%` }}
                        >
                            {creatorPct >= 20 && <><Users className="h-3.5 w-3.5 mr-1" />{creatorPct}%</>}
                        </div>
                        <div
                            className="flex items-center justify-center bg-violet-500 text-white transition-all duration-150"
                            style={{ width: `${mcnPct}%` }}
                        >
                            {mcnPct >= 15 && <><Building2 className="h-3.5 w-3.5 mr-1" />{mcnPct}%</>}
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                            크리에이터 {creatorPct}%
                        </span>
                        <span className="flex items-center gap-1 text-violet-600 font-medium">
                            MCN {mcnPct}%
                            <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                        </span>
                    </div>
                </div>

                {/* Range Slider */}
                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        크리에이터 배분율 조정
                    </label>
                    <input
                        type="range"
                        min={30}
                        max={95}
                        step={5}
                        value={ratio}
                        onChange={e => setRatio(Number(e.target.value))}
                        className="w-full h-2 rounded-full accent-primary cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>30%</span>
                        <span>95%</span>
                    </div>
                </div>

                {/* Quick presets */}
                <div className="flex gap-2 flex-wrap">
                    {PRESETS.map(p => (
                        <button
                            key={p.label}
                            type="button"
                            onClick={() => setRatio(p.creator)}
                            className={cn(
                                "flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all",
                                ratio === p.creator
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Example calculation */}
                <div className="p-3 rounded-lg bg-muted/50 text-xs space-y-1">
                    <p className="text-muted-foreground font-medium mb-1.5">예시 계산 (₩1,000,000 협업 시)</p>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">크리에이터 수령</span>
                        <span className="font-semibold text-blue-600">₩{(creatorPct * 10000).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">MCN 수수료</span>
                        <span className="font-semibold text-violet-600">₩{(mcnPct * 10000).toLocaleString()}</span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                    <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>
                        취소
                    </Button>
                    <Button className="flex-1 gap-1.5" onClick={handleSave} disabled={isSaving}>
                        <Save className="h-4 w-4" />
                        {isSaving ? '저장 중...' : '저장하기'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
