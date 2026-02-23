"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { useRef, useState } from "react"
import { toast } from "sonner"

interface ImageUploaderProps {
    value: string
    onChange: (url: string) => void
    bucket?: string
    folder?: string
    maxSizeMB?: number
    label?: string
    description?: string
}

export function ImageUploader({
    value,
    onChange,
    bucket = "campaigns",
    folder = "images",
    maxSizeMB = 5,
    label = "이미지",
    description = `최대 ${maxSizeMB}MB`
}: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`)
            return
        }

        setIsUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${folder}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath)

            onChange(publicUrl)
            toast.success("이미지가 업로드되었습니다.")
        } catch (error: any) {
            console.error("Image upload error:", error)
            toast.error("이미지 업로드에 실패했습니다.")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleRemove = () => {
        onChange("")
    }

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <div className="flex gap-4 items-start">
                {/* Preview */}
                <div className="relative h-24 w-24 rounded-lg border-2 border-dashed flex items-center justify-center hover:border-primary/50 transition-colors bg-muted/30 overflow-hidden group">
                    {value ? (
                        <>
                            <Image
                                src={value}
                                alt="Preview"
                                fill
                                className="object-cover rounded-lg"
                            />
                            <button
                                onClick={handleRemove}
                                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </>
                    ) : (
                        <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                </div>

                {/* Upload Button */}
                <div className="flex-1 space-y-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                    />
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full sm:w-auto"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                업로드 중...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                이미지 업로드
                            </>
                        )}
                    </Button>
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
