import { useAuth } from '@/components/providers/auth-provider'
import { validateFile } from '@/lib/utils/file-validation'
import { useState } from 'react'

export interface UploadedFile {
    url: string // Storage path
    name: string // Original filename
    size: number // File size in bytes
    type: string // MIME type
}

export interface UseFileUploadReturn {
    uploadFile: (file: File) => Promise<UploadedFile>
    uploading: boolean
    progress: number
    error: string | null
}

/**
 * Hook for uploading files to Supabase Storage
 * Validates file, uploads to user's folder, returns file metadata
 */
export function useFileUpload(): UseFileUploadReturn {
    const { user, supabase } = useAuth()
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const uploadFile = async (file: File): Promise<UploadedFile> => {
        if (!user) {
            throw new Error('로그인이 필요합니다')
        }

        // Validate file
        const validation = validateFile(file)
        if (!validation.valid) {
            setError(validation.error!)
            throw new Error(validation.error)
        }

        setUploading(true)
        setProgress(0)
        setError(null)

        try {
            // Generate unique filename with timestamp
            const timestamp = Date.now()
            const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
            const filePath = `${user.id}/${timestamp}_${cleanName}`

            console.log('[FileUpload] Uploading:', filePath)

            // Upload to Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from('message-files')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                })

            if (uploadError) {
                console.error('[FileUpload] Upload error:', uploadError)
                throw new Error(`업로드 실패: ${uploadError.message}`)
            }

            console.log('[FileUpload] Upload complete:', data.path)

            // Return file metadata
            return {
                url: data.path,
                name: file.name,
                size: file.size,
                type: file.type
            }
        } catch (err: any) {
            console.error('[FileUpload] Exception:', err)
            setError(err.message || '파일 업로드 중 오류가 발생했습니다')
            throw err
        } finally {
            setUploading(false)
            setProgress(0)
        }
    }

    return { uploadFile, uploading, progress, error }
}
