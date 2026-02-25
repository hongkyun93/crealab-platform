"use client"

import { useAuth } from '@/components/providers/auth-provider';
import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { uploadFileViaAPI } from '@/lib/upload';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Download, FileIcon, ImageIcon, Loader2, UploadCloud } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useWorkspaceStore } from '../hooks/use-workspace-store';

// 허용 MIME 타입 (문서, PDF, GIF만) — chat-area.tsx와 동일 기준
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/gif',
]
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface WorkspaceFile {
    id: string;
    file_name: string;
    file_url: string;
    file_size: number | null;
    file_type: string | null;
    created_at: string;
    uploader_id: string | null;
}

export function FileSharePanel() {
    const proposal = useWorkspaceStore((state) => state.proposal)
    const { supabase } = useAuth()
    const { user } = useUnifiedProvider()

    const [files, setFiles] = useState<WorkspaceFile[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const p = proposal as any
    // 격리 키: workspace_id 우선, 없으면 proposal id별 fallback 컬럼
    const workspaceId: string | undefined = p?.workspace_id
    const proposalId: string | undefined = p?.id?.toString()
    const isMomentProposal = !!p?.moment_id
    const isCampaignProposal = p?.type === 'creator_apply' || !!p?.campaignId

    // 파일 목록 조회
    const fetchFiles = useCallback(async () => {
        if (!proposalId) return
        setIsLoading(true)
        try {
            let query = supabase
                .from('workspace_files')
                .select('*')
                .order('created_at', { ascending: false })

            if (workspaceId) {
                query = query.eq('workspace_id', workspaceId)
            } else if (isMomentProposal) {
                query = query.eq('moment_proposal_id', proposalId)
            } else if (isCampaignProposal) {
                query = query.eq('proposal_id', proposalId)
            } else {
                // product_application
                query = query.eq('product_application_id', proposalId)
            }

            const { data, error } = await query
            if (error) {
                console.error('[FileSharePanel] Fetch error:', error)
                return
            }
            setFiles(data || [])
        } catch (e) {
            console.error('[FileSharePanel] Exception:', e)
        } finally {
            setIsLoading(false)
        }
    }, [supabase, workspaceId, proposalId, isMomentProposal, isCampaignProposal])

    useEffect(() => {
        fetchFiles()
    }, [fetchFiles])

    // 파일 유효성 검사
    const validateFile = (file: File): string | null => {
        if (file.size > MAX_FILE_SIZE)
            return `파일 크기가 5MB를 초과합니다. (${(file.size / 1024 / 1024).toFixed(1)}MB)`
        const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
        if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext))
            return `허용되지 않는 파일 형식입니다. PDF, DOC, DOCX, GIF만 업로드 가능합니다.`
        return null
    }

    // 업로드
    const uploadFile = async (file: File) => {
        if (!user?.id || !proposalId) {
            toast.error('로그인이 필요합니다.')
            return
        }
        const error = validateFile(file)
        if (error) { toast.error(error); return }

        setIsUploading(true)
        try {
            const folder = workspaceId || proposalId
            const publicUrl = await uploadFileViaAPI(file, 'workspace-files', folder)

            // workspace_files 테이블에 기록
            const insertData: any = {
                workspace_id: workspaceId || null,
                uploader_id: user.id,
                file_name: file.name,
                file_url: publicUrl,
                file_size: file.size,
                file_type: file.type,
            }
            if (isMomentProposal) {
                insertData.moment_proposal_id = proposalId
            } else if (isCampaignProposal) {
                insertData.proposal_id = proposalId
            } else {
                insertData.product_application_id = proposalId
            }

            const { error: dbError } = await supabase
                .from('workspace_files')
                .insert(insertData)

            if (dbError) {
                toast.error('파일 정보 저장에 실패했습니다.')
                console.error('[FileSharePanel] DB insert error:', dbError)
                return
            }

            toast.success('파일이 업로드되었습니다.')
            await fetchFiles()
        } catch (e) {
            toast.error('업로드 중 오류가 발생했습니다.')
            console.error('[FileSharePanel] Exception:', e)
        } finally {
            setIsUploading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) uploadFile(file)
        e.target.value = ''
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) uploadFile(file)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = () => setIsDragOver(false)

    // 파일 타입별 섹션 분류
    const pdfFiles = files.filter(f => f.file_type === 'application/pdf' || f.file_name.endsWith('.pdf'))
    const otherFiles = files.filter(f => !(f.file_type === 'application/pdf' || f.file_name.endsWith('.pdf')))

    return (
        <div className="flex flex-col h-full bg-background/50 border-l border-border/50">
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-bold text-sm">공유 파일</h3>
                <span className="text-xs text-muted-foreground">
                    {isLoading ? '...' : `${files.length}개`}
                </span>
            </div>

            {/* File List */}
            <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Section: 계약 문서 (PDF) */}
                        {pdfFiles.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                    계약 문서
                                    <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full">
                                        {pdfFiles.length}
                                    </span>
                                </h4>
                                <div className="space-y-2">
                                    {pdfFiles.map(f => (
                                        <FileItem key={f.id} file={f} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section: 참고 자료 (DOC, DOCX, GIF) */}
                        {otherFiles.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                    참고 자료
                                    <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                                        {otherFiles.length}
                                    </span>
                                </h4>
                                <div className="space-y-2">
                                    {otherFiles.map(f => (
                                        <FileItem key={f.id} file={f} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {files.length === 0 && !isLoading && (
                            <div className="text-center py-6 text-xs text-muted-foreground">
                                공유된 파일이 없습니다
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>

            {/* Upload Area */}
            <div className="p-4 border-t border-border/50 bg-background">
                <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/gif"
                    onChange={handleFileChange}
                />
                <div
                    className={cn(
                        'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group',
                        isDragOver
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/20 hover:bg-muted/30',
                        isUploading && 'pointer-events-none opacity-50'
                    )}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                        {isUploading
                            ? <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            : <UploadCloud className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        }
                    </div>
                    <p className="text-xs font-medium mb-1">
                        {isUploading ? '업로드 중...' : '파일을 드래그하거나 클릭하여 업로드'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">최대 5MB (PDF, DOC, DOCX, GIF)</p>
                </div>
            </div>
        </div>
    )
}

function FileItem({ file }: { file: WorkspaceFile }) {
    const isPdf = file.file_type === 'application/pdf' || file.file_name.endsWith('.pdf')
    const isGif = file.file_type === 'image/gif' || file.file_name.endsWith('.gif')
    const type: 'pdf' | 'image' | 'doc' = isPdf ? 'pdf' : isGif ? 'image' : 'doc'

    const formatSize = (bytes: number | null) => {
        if (!bytes) return ''
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    }

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit'
            }).replace(/\. /g, '.').replace('.', '')
        } catch { return '' }
    }

    return (
        <div className="group flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border/50">
            <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                type === 'pdf' ? "bg-red-50 text-red-600" :
                    type === 'image' ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600"
            )}>
                {type === 'image' ? <ImageIcon className="w-4 h-4" /> : <FileIcon className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-none mb-1.5">{file.file_name}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {file.file_size && <span>{formatSize(file.file_size)}</span>}
                    {file.file_size && <span>•</span>}
                    <span>{formatDate(file.created_at)}</span>
                </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                <a href={file.file_url} target="_blank" rel="noopener noreferrer" download={file.file_name}>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Download className="w-3 h-3" />
                    </Button>
                </a>
            </div>
        </div>
    )
}
