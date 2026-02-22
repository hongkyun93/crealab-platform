"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileIcon, UploadCloud, Download, Trash2, Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { toast } from 'sonner';

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/gif',
]
const ALLOWED_EXT = ['.pdf', '.doc', '.docx', '.gif']
const BUCKET = 'workspace-files'

interface WorkspaceFile {
    id: string
    file_name: string
    file_url: string
    file_size: number
    file_type: string
    created_at: string
    uploader_id: string
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
    } catch { return '' }
}

export function FileSharePanel() {
    const proposal = useWorkspaceStore((state) => state.proposal) as any
    const { supabase, user } = useUnifiedProvider()

    const [files, setFiles] = useState<WorkspaceFile[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const workspaceId: string | undefined = proposal?.workspace_id

    // Fetch files for this workspace
    const fetchFiles = useCallback(async () => {
        if (!workspaceId) return
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('workspace_files')
                .select('*')
                .eq('workspace_id', workspaceId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setFiles(data || [])
        } catch (err) {
            console.error('[FileSharePanel] Fetch error:', err)
        } finally {
            setIsLoading(false)
        }
    }, [supabase, workspaceId])

    useEffect(() => {
        fetchFiles()
    }, [fetchFiles])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !workspaceId || !user?.id) return

        // Validate type
        if (!ALLOWED_MIME.includes(file.type)) {
            toast.error(`PDF, DOC, DOCX, GIF 파일만 업로드할 수 있습니다.`)
            return
        }

        // Validate size
        if (file.size > MAX_SIZE_BYTES) {
            toast.error(`파일 크기는 10MB를 초과할 수 없습니다. (현재: ${formatBytes(file.size)})`)
            return
        }

        setIsUploading(true)
        try {
            const ext = file.name.split('.').pop()
            const path = `${workspaceId}/${Date.now()}_${file.name}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(path, file, { contentType: file.type, upsert: false })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
            const publicUrl = urlData.publicUrl

            // Save metadata to DB
            const { error: dbError } = await supabase.from('workspace_files').insert({
                workspace_id: workspaceId,
                uploader_id: user.id,
                file_name: file.name,
                file_url: publicUrl,
                file_size: file.size,
                file_type: file.type,
            })

            if (dbError) throw dbError

            toast.success(`✓ ${file.name} 업로드 완료`)
            await fetchFiles()
        } catch (err: any) {
            console.error('[FileSharePanel] Upload error:', err)
            toast.error('업로드에 실패했습니다: ' + (err.message || ''))
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleDelete = async (fileId: string, filePath: string) => {
        if (!confirm('이 파일을 삭제하시겠습니까?')) return
        try {
            // Extract storage path from URL
            const url = new URL(filePath)
            const storagePath = url.pathname.split(`/object/public/${BUCKET}/`)[1]

            // Delete from storage
            if (storagePath) {
                await supabase.storage.from(BUCKET).remove([storagePath])
            }

            // Delete from DB
            const { error } = await supabase.from('workspace_files').delete().eq('id', fileId)
            if (error) throw error

            toast.success('파일이 삭제됐습니다.')
            setFiles(prev => prev.filter(f => f.id !== fileId))
        } catch (err: any) {
            toast.error('삭제 실패: ' + (err.message || ''))
        }
    }

    // Empty state
    if (!workspaceId) return null

    return (
        <div className="flex flex-col h-full bg-background/50 border-l border-border/50">
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-sm">공유 파일</h3>
                <span className="text-xs text-muted-foreground">
                    {isLoading ? '...' : `${files.length}개`}
                </span>
            </div>

            {/* File List */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <FileText className="h-8 w-8 text-muted-foreground/40 mb-3" />
                            <p className="text-xs text-muted-foreground">공유된 파일이 없습니다</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">
                                아래에서 PDF 또는 문서를 업로드하세요
                            </p>
                        </div>
                    ) : (
                        files.map(file => (
                            <FileItem
                                key={file.id}
                                file={file}
                                isOwner={file.uploader_id === user?.id}
                                onDelete={() => handleDelete(file.id, file.file_url)}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Upload Area */}
            <div className="p-4 border-t border-border/50 bg-background shrink-0">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_EXT.join(',')}
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
                <div
                    className={cn(
                        "border-2 border-dashed border-muted-foreground/20 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-colors group",
                        isUploading
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:bg-muted/30 hover:border-primary/30 cursor-pointer"
                    )}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mb-2.5 group-hover:bg-primary/10 transition-colors">
                        {isUploading
                            ? <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            : <UploadCloud className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        }
                    </div>
                    <p className="text-xs font-medium mb-0.5">
                        {isUploading ? '업로드 중...' : '클릭하여 파일 업로드'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">PDF, DOC, DOCX, GIF · 최대 10MB</p>
                </div>
            </div>
        </div>
    )
}

function FileItem({
    file,
    isOwner,
    onDelete,
}: {
    file: WorkspaceFile
    isOwner: boolean
    onDelete: () => void
}) {
    const isPdf = file.file_type === 'application/pdf'
    const isGif = file.file_type === 'image/gif'

    return (
        <div className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
            <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 overflow-hidden",
                isPdf ? "bg-red-50 text-red-600" : isGif ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
            )}>
                <FileIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-none mb-1.5">{file.file_name}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{formatBytes(file.file_size)}</span>
                    <span>·</span>
                    <span>{formatDate(file.created_at)}</span>
                </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
                <Button
                    variant="ghost" size="icon"
                    className="h-6 w-6"
                    onClick={() => window.open(file.file_url, '_blank')}
                    title="다운로드"
                >
                    <Download className="w-3 h-3" />
                </Button>
                {isOwner && (
                    <Button
                        variant="ghost" size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-500"
                        onClick={onDelete}
                        title="삭제"
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                )}
            </div>
        </div>
    )
}
