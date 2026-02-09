"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AvatarUploadProps {
    uid: string
    url?: string | null
    onUpload: (url: string) => void
    size?: number
    className?: string
}

export function AvatarUpload({ uid, url, onUpload, size = 150, className }: AvatarUploadProps) {
    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(url || null)

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${uid}-${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            // 1. Upload to 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    upsert: true
                })

            if (uploadError) {
                throw uploadError
            }

            // 2. Get Public URL
            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            if (data) {
                setAvatarUrl(data.publicUrl)
                onUpload(data.publicUrl)
            }

        } catch (error: any) {
            console.error("Avatar upload error:", error)
            alert('이미지 업로드 실패: ' + (error.message || "알 수 없는 오류"))
        } finally {
            setUploading(false)
            // Reset input so the same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div className={cn("relative group", className)} style={{ width: size, height: size }}>
            <div
                className="rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center relative cursor-pointer group-hover:border-slate-400 transition-colors"
                style={{ width: size, height: size }}
                onClick={() => fileInputRef.current?.click()}
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-4xl text-slate-300 font-bold">
                        {uid ? uid.charAt(0).toUpperCase() : "?"}
                    </span>
                )}

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-8 h-8" />
                </div>

                {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}
            </div>

            <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleUpload}
                ref={fileInputRef}
                className="hidden"
                disabled={uploading}
            />
        </div>
    )
}
