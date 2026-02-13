"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Gift, Megaphone, Send, User, X, CheckCircle2, Instagram, Youtube, MessageCircle, Hash, Link as LinkIcon, Users, Loader2, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useState, useRef } from "react"
import { CampaignDetailContent } from "@/components/campaign/campaign-detail-content"

interface CampaignDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    campaign: any
    onApply: (campaign: any) => void
}

export function CampaignDetailDialog({
    open,
    onOpenChange,
    campaign,
    onApply
}: CampaignDetailDialogProps) {
    const [isImageUploading, setIsImageUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    if (!campaign) return null

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            alert("파일 크기는 5MB 이하여야 합니다.")
            return
        }

        setIsImageUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `campaign-images/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('campaigns')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('campaigns')
                .getPublicUrl(filePath)

            // Update campaign image in DB
            const { error: updateError } = await supabase
                .from('campaigns')
                .update({ image: publicUrl })
                .eq('id', campaign.id)

            if (updateError) throw updateError

            // Optimistic update (or reload page)
            campaign.image = publicUrl
            // Note: Since we can't easily force-refresh the parent without a prop, 
            // we rely on the mutation and visually updating the local object if possible, 
            // or just alerting. Ideally, onApply or onClose would trigger a refresh.
            // For now, simple alert.
            alert("이미지가 변경되었습니다. 새로고침하면 적용됩니다.")

        } catch (error: any) {
            console.error("Image upload error:", error)
            alert("이미지 업로드에 실패했습니다. (권한이 없거나 오류 발생)")
        } finally {
            setIsImageUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const today = new Date()
    const dDay = campaign.recruitment_deadline
        ? Math.ceil((new Date(campaign.recruitment_deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : null

    const CHANNELS = [
        { id: "instagram", label: "인스타그램", icon: "📸" },
        { id: "youtube", label: "유튜브", icon: "▶️" },
        { id: "tiktok", label: "틱톡", icon: "🎵" },
        { id: "blog", label: "블로그", icon: "📝" },
        { id: "shorts", label: "유튜브 숏츠", icon: "⚡" },
        { id: "reels", label: "인스타 릴스", icon: "🎞️" }
    ]

    const getChannelLabel = (id: string) => CHANNELS.find(c => c.id === id)?.label || id
    const getChannelIcon = (id: string) => CHANNELS.find(c => c.id === id)?.icon || ""

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 gap-0 bg-white border-0 shadow-2xl 
                w-full h-[100dvh] max-w-none rounded-none 
                md:h-[90vh] md:max-w-6xl md:rounded-xl overflow-hidden flex flex-col md:block">
                <DialogTitle className="sr-only">{campaign.product || "캠페인 상세 정보"}</DialogTitle>

                <CampaignDetailContent
                    campaign={campaign}
                    onImageUpload={async (file) => {
                        // Create a fake event to reuse the existing handler logic or just call upload logic directly
                        // We will extract the upload logic to be cleaner or just wrap it here.
                        // Ideally we should refactor handleImageUpload to take a File, but the existing one takes an Event.
                        // Let's quickly wrap it.
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);

                        // Create a synthetic event
                        const event = {
                            target: {
                                files: dataTransfer.files
                            }
                        } as unknown as React.ChangeEvent<HTMLInputElement>;

                        await handleImageUpload(event);
                    }}
                    renderAction={() => (
                        <Button
                            onClick={() => {
                                onOpenChange(false);
                                onApply(campaign);
                            }}
                            className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
                        >
                            <Send className="h-5 w-5 mr-2" />
                            협업 제안하기
                        </Button>
                    )}
                    isUploading={isImageUploading}
                    onClose={() => onOpenChange(false)}
                />
            </DialogContent >
        </Dialog >
    )
}

