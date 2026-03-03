"use client"

import { useUnifiedProvider } from '@/components/providers/unified-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { SubmissionFeedback } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
    AlertCircle, BookmarkPlus,
    CheckCircle2, Clock, Download, FileVideo, Loader2, Maximize, MessageSquare, Pause, Play, Send, Upload, Video, Volume2, VolumeX, X
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useWorkspaceStore } from '../hooks/use-workspace-store'
import { ChatArea } from './chat-area'
import { compressVideo } from '@/lib/video-compressor'

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}

function isVideoUrl(url: string): boolean {
    return /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(url) ||
        url.includes('/storage/v1/object/')
}

function isYouTubeUrl(url: string): boolean {
    return /youtube\.com|youtu\.be/i.test(url)
}

function getYouTubeEmbedUrl(url: string): string {
    const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
    return m ? `https://www.youtube.com/embed/${m[1]}?enablejsapi=1` : url
}

// ─── component ────────────────────────────────────────────────────────────────

interface VideoReviewPanelProps {
    userType: 'creator' | 'brand'
}

export function VideoReviewPanel({ userType }: VideoReviewPanelProps) {
    const proposal = useWorkspaceStore((state) => state.proposal)
    const {
        updateProductApplication,
        updateMomentProposal,
        updateProposal,
        refreshData,
        sendSubmissionFeedback,
        fetchSubmissionFeedback,
        supabase,
        sendNotification,
    } = useUnifiedProvider() as any

    // ── video refs ──
    const videoRef = useRef<HTMLVideoElement>(null)
    const feedbackTextareaRef = useRef<HTMLTextAreaElement>(null)
    const feedbackListRef = useRef<HTMLDivElement>(null)
    // ref map: feedbackId → chip DOM element (for scroll-to on arrow click)
    const feedbackChipRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

    // ── video state ──
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [hoveredBookmark, setHoveredBookmark] = useState<string | null>(null)

    // ── bookmark / feedback state ──
    const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null)
    const [feedbackInput, setFeedbackInput] = useState('')
    const [isSendingFeedback, setIsSendingFeedback] = useState(false)
    // [FIX] 로컴 피드백 state: useUnifiedProvider의 useMemo가 stale하면 context 값은 업데이트 안 됨.
    // fetchSubmissionFeedback이 직접 배열을 return하므로 그 값으로 로컴 state를 관리.
    const [localFeedbacks, setLocalFeedbacks] = useState<SubmissionFeedback[]>([])

    // ── final/clean urls (creator only) ──
    const [finalUrl, setFinalUrl] = useState('')
    const [cleanUrl, setCleanUrl] = useState('')
    const [isSavingFinal, setIsSavingFinal] = useState(false)
    const [isFinalApproving, setIsFinalApproving] = useState(false)
    const [finalUploadMode, setFinalUploadMode] = useState<'link' | 'file'>('link')
    const [cleanUploadMode, setCleanUploadMode] = useState<'link' | 'file'>('link')
    const [finalUploadProgress, setFinalUploadProgress] = useState(0)
    const [cleanUploadProgress, setCleanUploadProgress] = useState(0)
    const finalFileInputRef = useRef<HTMLInputElement>(null)
    const cleanFileInputRef = useRef<HTMLInputElement>(null)
    // ── revision upload (creator only) ──
    const [revisionUrl, setRevisionUrl] = useState('')
    const [isSavingRevision, setIsSavingRevision] = useState(false)
    const [revisionUploadMode, setRevisionUploadMode] = useState<'link' | 'file'>('file')
    const [revisionUploadProgress, setRevisionUploadProgress] = useState(0)
    const [revisionCompressProgress, setRevisionCompressProgress] = useState(0)
    const revisionFileInputRef = useRef<HTMLInputElement>(null)
    // ── draft upload (creator only — initial submission) ──
    const [draftUrl, setDraftUrl] = useState('')
    const [isSavingDraft, setIsSavingDraft] = useState(false)
    const [draftUploadMode, setDraftUploadMode] = useState<'link' | 'file'>('file')
    const [draftUploadProgress, setDraftUploadProgress] = useState(0)
    const [draftCompressProgress, setDraftCompressProgress] = useState(0)
    const draftFileInputRef = useRef<HTMLInputElement>(null)
    // ── brand review tab ──
    const [isMarkingReview, setIsMarkingReview] = useState(false)
    // ── video error fallback (e.g. MPEG-4 NotSupportedError) ──
    const [videoError, setVideoError] = useState(false)

    // ── proposal helpers ──
    const isMoment = (proposal as any)?.target_type === 'moment' || !!(proposal as any)?.moment_id
    const isCampaign = (proposal as any)?.target_type === 'campaign' || !!(proposal as any)?.campaign_id || !!(proposal as any)?.campaignId
    const proposalId = proposal?.id?.toString()
    const workspaceId = (proposal as any)?.workspace_id?.toString()

    const [videoTab, setVideoTab] = useState<'draft' | 'final' | 'clean'>('draft')

    // ── video url ──
    const draftFileUrl = (proposal as any)?.content_submission_file_url || ''
    const draftLinkUrl = (proposal as any)?.content_submission_url || ''
    const draftUrlData = draftFileUrl || draftLinkUrl
    const finalUrlData = (proposal as any)?.content_final_url || ''
    const cleanUrlData = (proposal as any)?.content_clean_url || ''

    // Set the currently visible video based on the selected tab
    const activeVideoUrl = videoTab === 'clean' ? cleanUrlData : videoTab === 'final' ? finalUrlData : draftUrlData
    const isNative = !!activeVideoUrl && isVideoUrl(activeVideoUrl)
    const isBrandApproved = !!(proposal as any)?.content_final_approved_at
    // ── revision gate: set when brand clicks "검토 완료" OR "수정 요청" ──
    const isRevisionRequested = !!(proposal as any)?.content_revision_requested_at
        || (proposal as any)?.content_submission_status === 'revision_requested'

    // ── feedbacks: 로컴 state를 신뢰 (context useMemo stale 문제 회피) ──
    const feedbacks: SubmissionFeedback[] = localFeedbacks
    const bookmarks = feedbacks.filter(f => f.video_timestamp_seconds != null)

    // ── reset videoError when video source changes ──
    useEffect(() => { setVideoError(false) }, [activeVideoUrl])

    // ── INITIAL FETCH on mount ──
    useEffect(() => {
        if (!workspaceId) return
        fetchSubmissionFeedback(workspaceId).then((result: SubmissionFeedback[]) => {
            if (result && Array.isArray(result)) setLocalFeedbacks(result)
        })
    }, [workspaceId]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── prefill final/clean urls ──
    useEffect(() => {
        if (proposal) {
            setFinalUrl((proposal as any).content_final_url || '')
            setCleanUrl((proposal as any).content_clean_url || '')
        }
    }, [proposal])

    // ─── video event handlers ─────────────────────────────────────────────────

    const handleVideoTimeUpdate = useCallback(() => {
        if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
    }, [])

    const handleVideoLoadedMetadata = useCallback(() => {
        if (videoRef.current) setDuration(videoRef.current.duration)
    }, [])

    const handlePlayPause = () => {
        if (!videoRef.current) return
        if (isPlaying) { videoRef.current.pause() } else { videoRef.current.play() }
        setIsPlaying(!isPlaying)
    }

    const handleMute = () => {
        if (!videoRef.current) return
        videoRef.current.muted = !isMuted
        setIsMuted(!isMuted)
    }

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || !duration) return
        const rect = e.currentTarget.getBoundingClientRect()
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        videoRef.current.currentTime = ratio * duration
    }

    const handleFullscreen = () => {
        videoRef.current?.requestFullscreen?.()
    }

    const seekTo = (seconds: number) => {
        if (!videoRef.current) return
        videoRef.current.currentTime = seconds
        videoRef.current.play()
        setIsPlaying(true)
    }

    // ▼ 화살표 클릭: 영상을 해당 구간으로 이동 + 해당 피드백 칩을 화면에 보이도록 스크롤
    const seekAndScrollToFeedback = (feedbackId: string, seconds: number) => {
        seekTo(seconds)
        setTimeout(() => {
            const chipEl = feedbackChipRefs.current.get(feedbackId)
            if (chipEl) {
                chipEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
                // 잠깐 highlight 효과
                chipEl.style.outline = '2px solid hsl(var(--primary))'
                setTimeout(() => { chipEl.style.outline = '' }, 1200)
            }
        }, 80)
    }

    // ─── bookmark handler ─────────────────────────────────────────────────────

    const handleBookmarkCurrent = () => {
        if (!videoRef.current || !duration) return
        videoRef.current.pause()
        setIsPlaying(false)
        setPendingTimestamp(videoRef.current.currentTime)
        setTimeout(() => feedbackTextareaRef.current?.focus(), 50)
    }

    const handleCancelBookmark = () => {
        setPendingTimestamp(null)
        setFeedbackInput('')
    }

    // ─── send feedback ────────────────────────────────────────────────────────

    const handleSendFeedback = async () => {
        if (!workspaceId || !feedbackInput.trim() || isSendingFeedback) return
        setIsSendingFeedback(true)
        try {
            await sendSubmissionFeedback(
                workspaceId,
                feedbackInput.trim(),
                pendingTimestamp ?? null
            )
            setFeedbackInput('')
            setPendingTimestamp(null)
            // [FIX] fetchSubmissionFeedback의 return value로 직접 로컴 state 업데이트
            const result: SubmissionFeedback[] = await fetchSubmissionFeedback(workspaceId)
            if (result && Array.isArray(result)) setLocalFeedbacks(result)
        } catch (e) {
            console.error('[VideoReviewPanel] send feedback error:', e)
            toast.error('피드백 전송 중 오류가 발생했습니다.')
        } finally {
            setIsSendingFeedback(false)
        }
    }

    // ─── delete feedback ──────────────────────────────────────────────────────

    const handleDeleteFeedback = async (feedbackId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        // 즉시 UI에서 제거 (optimistic)
        setLocalFeedbacks(prev => prev.filter(f => f.id !== feedbackId))
        feedbackChipRefs.current.delete(feedbackId)
        try {
            const { error } = await supabase
                .from('submission_feedback')
                .delete()
                .eq('id', feedbackId)
            if (error) {
                console.error('[VideoReviewPanel] delete feedback error:', error)
                // 실패 시 원복
                const result: SubmissionFeedback[] = await fetchSubmissionFeedback(workspaceId)
                if (result && Array.isArray(result)) setLocalFeedbacks(result)
                toast.error('삭제에 실패했습니다.')
            }
        } catch (err) {
            console.error('[VideoReviewPanel] delete error:', err)
        }
    }

    // ─── brand: final approval ────────────────────────────────────────────────

    const handleFinalApprove = async () => {
        if (!proposalId || isFinalApproving) return
        setIsFinalApproving(true)
        try {
            const updates = {
                content_final_approved_at: new Date().toISOString(),
                content_submission_status: 'approved' as const
            }
            let success = false
            if (isMoment) { success = await updateMomentProposal(proposalId, updates) }
            else if (isCampaign) { success = await updateProposal(proposalId, updates) }
            else { success = await updateProductApplication(proposalId, updates) }

            if (success) {
                useWorkspaceStore.getState().updateProposal(updates)
                refreshData()
                toast.success('최종 승인이 완료되었습니다.')
            }
        } catch (e) {
            console.error('[VideoReviewPanel] final approve error:', e)
            toast.error('최종 승인 중 오류가 발생했습니다.')
        } finally {
            setIsFinalApproving(false)
        }
    }

    // ─── creator: save initial draft url ─────────────────────────────────────
    // Called when no video yet — first submission from creator

    const handleSaveDraft = async () => {
        if (!proposalId || !draftUrl.trim() || isSavingDraft) return
        setIsSavingDraft(true)
        try {
            const updates: any = {
                content_submission_url: draftUrl.trim(),
                content_submission_file_url: null,
                content_submission_status: 'submitted',
                content_submission_date: new Date().toISOString(),
                content_submission_version: 1,
            }
            let success = false
            if (isMoment) { success = await updateMomentProposal(proposalId, updates) }
            else if (isCampaign) { success = await updateProposal(proposalId, updates) }
            else { success = await updateProductApplication(proposalId, updates) }
            if (success) {
                useWorkspaceStore.getState().updateProposal(updates)
                refreshData()
                setDraftUrl('')
                toast.success('초안 링크가 제출되었습니다. 브랜드가 검토한 후 피드백을 줍니다.')
            }
        } catch (e) {
            console.error('[VideoReviewPanel] save draft error:', e)
            toast.error('제출 중 오류가 발생했습니다.')
        } finally {
            setIsSavingDraft(false)
        }
    }

    // ─── creator: upload initial draft file ──────────────────────────────────

    const handleDraftFileUpload = async (file: File) => {
        if (!proposalId || isSavingDraft) return
        setIsSavingDraft(true)
        setDraftUploadProgress(0)
        setDraftCompressProgress(0)

        try {
            const { data: sessionData } = await supabase.auth.getSession()
            const token = sessionData?.session?.access_token
            if (!token) throw new Error('인증 세션이 없습니다.')

            // 프론트엔드 압축 (비디오일 경우만 진행)
            const compressedFile = await compressVideo(file, (p) => {
                setDraftCompressProgress(Math.round(p * 100))
            })

            const ext = compressedFile.name.split('.').pop() || 'mp4'
            const path = `content/${proposalId}/draft_${Date.now()}.${ext}`
            const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/submissions/${path}`
            const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/submissions/${path}`

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) setDraftUploadProgress(Math.round((e.loaded / e.total) * 100))
                })
                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) resolve()
                    else reject(new Error(`업로드 실패: ${xhr.status}`))
                })
                xhr.addEventListener('error', () => reject(new Error('네트워크 오류')))
                xhr.open('POST', url)
                xhr.setRequestHeader('Authorization', `Bearer ${token}`)
                xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
                xhr.setRequestHeader('x-upsert', 'true')
                xhr.send(compressedFile)
            })

            const updates: any = {
                content_submission_file_url: fileUrl,
                content_submission_url: null,
                content_submission_status: 'submitted',
                content_submission_date: new Date().toISOString(),
                content_submission_version: 1,
            }
            let success = false
            if (isMoment) { success = await updateMomentProposal(proposalId, updates) }
            else if (isCampaign) { success = await updateProposal(proposalId, updates) }
            else { success = await updateProductApplication(proposalId, updates) }

            if (success) {
                useWorkspaceStore.getState().updateProposal(updates)
                refreshData()
                toast.success('초안 파일이 제출되었습니다.')
            }
        } catch (e: any) {
            console.error('[VideoReviewPanel] draft file upload error:', e)
            toast.error(e.message || '업로드 실패')
        } finally {
            setIsSavingDraft(false)
            setDraftUploadProgress(0)
            setDraftCompressProgress(0)
            if (draftFileInputRef.current) draftFileInputRef.current.value = ''
        }
    }

    // ─── brand: mark review complete (검토 완료) ──────────────────────────────
    // Sets content_revision_requested_at + status → unlocks creator's revision upload

    const handleMarkReviewComplete = async () => {
        if (!proposalId || isMarkingReview) return
        setIsMarkingReview(true)
        try {
            const updates: any = {
                content_revision_requested_at: new Date().toISOString(),
                content_submission_status: 'revision_requested', // [FIX] brand/info-panel 수정 버튼 상태 동기화
            }
            let success = false
            if (isMoment) { success = await updateMomentProposal(proposalId, updates) }
            else if (isCampaign) { success = await updateProposal(proposalId, updates) }
            else { success = await updateProductApplication(proposalId, updates) }
            if (success) {
                useWorkspaceStore.getState().updateProposal(updates)
                refreshData()
                toast.success('검토 완료. 크리에이터가 수정본을 업로드할 수 있습니다.')
            }
        } catch (e) {
            console.error('[VideoReviewPanel] mark review complete error:', e)
            toast.error('오류가 발생했습니다.')
        } finally {
            setIsMarkingReview(false)
        }
    }

    // ─── creator: save revision url (link) ─────────────────────────────────────
    // Replaces content_submission_url, clears content_revision_requested_at

    const handleSaveRevision = async () => {
        if (!proposalId || !revisionUrl.trim() || isSavingRevision) return
        setIsSavingRevision(true)
        try {
            const updates: any = {
                content_submission_url: revisionUrl.trim(),
                content_submission_file_url: null,          // 기존 파일 지우고 링크 표시
                content_revision_requested_at: null,
                content_submission_status: 'submitted',
                content_submission_version: ((proposal as any)?.content_submission_version || 1) + 1,
            }
            let success = false
            if (isMoment) { success = await updateMomentProposal(proposalId, updates) }
            else if (isCampaign) { success = await updateProposal(proposalId, updates) }
            else { success = await updateProductApplication(proposalId, updates) }
            if (success) {
                useWorkspaceStore.getState().updateProposal(updates)
                refreshData()
                setRevisionUrl('')
                toast.success('수정본이 제출되었습니다.')
            }
        } catch (e) {
            console.error('[VideoReviewPanel] save revision error:', e)
            toast.error('제출 중 오류가 발생했습니다.')
        } finally {
            setIsSavingRevision(false)
        }
    }

    // ─── creator: upload revision file ───────────────────────────────────────

    const handleRevisionFileUpload = async (file: File) => {
        if (!proposalId || isSavingRevision) return
        setIsSavingRevision(true)
        setRevisionUploadProgress(0)
        setRevisionCompressProgress(0)

        try {
            const { data: sessionData } = await supabase.auth.getSession()
            const token = sessionData?.session?.access_token
            if (!token) throw new Error('인증 세션이 없습니다.')

            // 프론트엔드 압축 (비디오일 경우만 진행)
            const compressedFile = await compressVideo(file, (p) => {
                setRevisionCompressProgress(Math.round(p * 100))
            })

            const ext = compressedFile.name.split('.').pop() || 'mp4'
            const path = `content/${proposalId}/revision_${Date.now()}.${ext}`
            const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/submissions/${path}`

            const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/submissions/${path}`

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) setRevisionUploadProgress(Math.round((e.loaded / e.total) * 100))
                })
                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) resolve()
                    else reject(new Error(`업로드 실패: ${xhr.status}`))
                })
                xhr.addEventListener('error', () => reject(new Error('네트워크 오류')))
                xhr.open('POST', url)
                xhr.setRequestHeader('Authorization', `Bearer ${token}`)
                xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
                xhr.setRequestHeader('x-upsert', 'true')
                xhr.send(compressedFile)
            })

            const updates: any = {
                content_submission_file_url: fileUrl,
                content_submission_url: null,
                content_revision_requested_at: null,
                content_submission_status: 'submitted',
                content_submission_version: ((proposal as any)?.content_submission_version || 1) + 1,
            }
            let success = false
            if (isMoment) { success = await updateMomentProposal(proposalId, updates) }
            else if (isCampaign) { success = await updateProposal(proposalId, updates) }
            else { success = await updateProductApplication(proposalId, updates) }
            if (success) {
                useWorkspaceStore.getState().updateProposal(updates)
                refreshData()
                toast.success('수정본 파일이 제출되었습니다.')
            }
        } catch (e: any) {
            console.error('[VideoReviewPanel] revision file upload error:', e)
            toast.error(e.message || '업로드 실패')
        } finally {
            setIsSavingRevision(false)
            setRevisionUploadProgress(0)
            if (revisionFileInputRef.current) revisionFileInputRef.current.value = ''
        }
    }

    // ─── creator: upload final/clean file ────────────────────────────────────

    const uploadFinalFile = async (type: 'final' | 'clean', file: File) => {
        if (!proposalId || isSavingFinal) return
        setIsSavingFinal(true)
        const setProgress = type === 'final' ? setFinalUploadProgress : setCleanUploadProgress
        setProgress(0)
        try {
            const { data: sessionData } = await supabase.auth.getSession()
            const token = sessionData?.session?.access_token
            if (!token) throw new Error('인증 세션이 없습니다.')

            const ext = file.name.split('.').pop() || 'mp4'
            const path = `content/${proposalId}/${type}_${Date.now()}.${ext}`
            const uploadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/submissions/${path}`
            const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/submissions/${path}`

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
                })
                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) resolve()
                    else reject(new Error(`업로드 실패: ${xhr.status}`))
                })
                xhr.addEventListener('error', () => reject(new Error('네트워크 오류')))
                xhr.open('POST', uploadUrl)
                xhr.setRequestHeader('Authorization', `Bearer ${token}`)
                xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
                xhr.setRequestHeader('x-upsert', 'true')
                xhr.send(file)
            })

            // 업로드된 URL을 해당 state에 세팅 (나머지 링크와 함께 handleSaveFinalUrls로 저장)
            if (type === 'final') setFinalUrl(fileUrl)
            else setCleanUrl(fileUrl)

            toast.success(`${type === 'final' ? '최종본' : '클린본'} 파일이 업로드되었습니다. "제출하기"를 눌러 저장하세요.`)
        } catch (e: any) {
            console.error('[VideoReviewPanel] upload final file error:', e)
            toast.error(e.message || '업로드 실패')
        } finally {
            setIsSavingFinal(false)
            setProgress(0)
            if (type === 'final' && finalFileInputRef.current) finalFileInputRef.current.value = ''
            if (type === 'clean' && cleanFileInputRef.current) cleanFileInputRef.current.value = ''
        }
    }

    // ─── creator: save final + clean urls ────────────────────────────────────

    const handleSaveFinalUrls = async () => {
        if (!proposalId || (!finalUrl.trim() && !cleanUrl.trim())) {
            toast.error('최종본 또는 클린본 링크를 입력해주세요.')
            return
        }
        setIsSavingFinal(true)
        try {
            const updates: any = {}
            if (finalUrl.trim()) updates.content_final_url = finalUrl.trim()
            if (cleanUrl.trim()) updates.content_clean_url = cleanUrl.trim()

            let success = false
            if (isMoment) { success = await updateMomentProposal(proposalId, updates) }
            else if (isCampaign) { success = await updateProposal(proposalId, updates) }
            else { success = await updateProductApplication(proposalId, updates) }

            if (success) {
                useWorkspaceStore.getState().updateProposal(updates)
                refreshData()
                toast.success('최종본/클린본이 제출되었습니다.')

                // 정산 관리는 이제 100% DB 트리거(fn_handle_settlement_lifecycle)에 의존하므로
                // 프론트엔드에서의 강제 insert 로직은 제거됨 (Race condition 및 Mismatch 방지)
            }
        } catch (e) {
            console.error('[VideoReviewPanel] save final error:', e)
            toast.error('제출 중 오류가 발생했습니다.')
        } finally {
            setIsSavingFinal(false)
        }
    }

    // ─── render: progress bar + ▼ bookmark arrows ─────────────────────────────
    // ▼ arrows are positioned at (video_timestamp_seconds / duration * 100)%
    // Clicking an arrow: seeks video + scrolls matching feedback chip into view

    const renderProgressWithBookmarks = () => {
        if (!isNative) return null

        return (
            <div className="px-0.5 mt-2">
                {/* Progress bar — clicking seeks */}
                <div
                    className="relative h-2 bg-muted rounded-full cursor-pointer"
                    onClick={handleSeek}
                >
                    {/* Playback progress fill */}
                    <div
                        className="absolute top-0 left-0 h-full bg-primary rounded-full pointer-events-none"
                        style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                    />
                    {/* Thin amber tick marks ON the bar (visual only) */}
                    {duration > 0 && bookmarks.map(b => (
                        <div
                            key={`tick-${b.id}`}
                            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 pointer-events-none z-10"
                            style={{ left: `${(b.video_timestamp_seconds! / duration) * 100}%` }}
                        />
                    ))}
                </div>

                {/* ▼ Arrow markers BELOW the bar */}
                {duration > 0 && bookmarks.length > 0 && (
                    <div className="relative h-5 mt-0.5">
                        {bookmarks.map(b => {
                            const pct = (b.video_timestamp_seconds! / duration) * 100
                            return (
                                <button
                                    key={`arrow-${b.id}`}
                                    className="absolute -translate-x-1/2 flex flex-col items-center group/bookmark z-20"
                                    style={{ left: `${pct}%` }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        seekAndScrollToFeedback(b.id, b.video_timestamp_seconds!)
                                    }}
                                    onMouseEnter={() => setHoveredBookmark(b.id)}
                                    onMouseLeave={() => setHoveredBookmark(null)}
                                    title={`${formatTime(b.video_timestamp_seconds!)} — ${b.content}`}
                                >
                                    {/* ▼ CSS triangle */}
                                    <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-amber-400 group-hover/bookmark:border-t-amber-600 transition-colors drop-shadow" />
                                </button>
                            )
                        })}

                        {/* Hover tooltip */}
                        {hoveredBookmark && (() => {
                            const b = bookmarks.find(x => x.id === hoveredBookmark)
                            if (!b || !duration) return null
                            const pct = (b.video_timestamp_seconds! / duration) * 100
                            return (
                                <div
                                    className="absolute bottom-6 bg-popover border border-border text-popover-foreground text-xs rounded-lg px-2 py-1.5 shadow-lg w-[180px] z-30 pointer-events-none"
                                    style={{
                                        left: `${pct}%`,
                                        transform: `translateX(${pct > 80 ? '-90%' : pct < 10 ? '0%' : '-50%'})`
                                    }}
                                >
                                    <p className="font-mono text-amber-500 font-semibold mb-0.5">{formatTime(b.video_timestamp_seconds!)}</p>
                                    {b.sender_name && <p className="text-muted-foreground text-[10px]">{b.sender_name}</p>}
                                    <p className="leading-snug mt-0.5 whitespace-pre-wrap">{b.content}</p>
                                </div>
                            )
                        })()}
                    </div>
                )}
            </div>
        )
    }

    // ─── render: feedback area (below video, inside red box) ─────────────────
    //
    // This is the entire "빨간박스" area:
    // - Saved bookmark chips (click to seek)
    // - Bookmark button (captures current timestamp, pauses video)
    // - Pending timestamp badge
    // - Feedback textarea + send button

    const renderFeedbackArea = () => {
        const hasSavedFeedbacks = feedbacks.length > 0

        return (
            <div className="border border-border/60 rounded-xl bg-muted/5 flex flex-col gap-2 p-3">
                {/* Header row */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">영상 피드백</span>
                    <span className="text-[10px] text-muted-foreground">{feedbacks.length}개 저장됨 · 북마크 {bookmarks.length}개</span>
                </div>
                {/* 색상 범례 */}
                <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />크리에이터
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />브랜드
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />MCN
                    </span>
                </div>

                {/* Saved feedback chips — ref'd so ▼ arrows can scroll to them */}
                {hasSavedFeedbacks && (
                    <div ref={feedbackListRef} className="flex flex-wrap gap-1.5">
                        {feedbacks.map(fb => {
                            // ── sender 역할 분류 ──────────────────────────────────
                            const brandId = (proposal as any)?.brand_id
                            const creatorId = (proposal as any)?.creator_id
                            const isCreator = fb.sender_id === creatorId
                            const isBrand = fb.sender_id === brandId
                            // MCN = brand도 creator도 아닌 sender (proxy mode)
                            const isMcn = !isCreator && !isBrand

                            // ── chip 색상 ──────────────────────────────────────
                            // 타임스탬프 있는 경우: 각 역할의 진한 버전
                            // 타임스탬프 없는 경우: 같은 역할 계열의 옅은 버전
                            const chipStyle = (() => {
                                if (isCreator) return fb.video_timestamp_seconds != null
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                                    : 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900 hover:bg-emerald-50'
                                if (isBrand) return fb.video_timestamp_seconds != null
                                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
                                    : 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900 hover:bg-indigo-50'
                                // MCN proxy
                                return fb.video_timestamp_seconds != null
                                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                                    : 'bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900 hover:bg-amber-50'
                            })()

                            return (
                                <div
                                    key={fb.id}
                                    ref={el => {
                                        if (el) feedbackChipRefs.current.set(fb.id, el as any)
                                        else feedbackChipRefs.current.delete(fb.id)
                                    }}
                                    className={cn(
                                        "group/chip flex items-center gap-1 text-[10px] rounded-full pl-2 pr-1 py-0.5 border transition-all max-w-[220px] cursor-pointer",
                                        chipStyle
                                    )}
                                    onClick={() => {
                                        if (fb.video_timestamp_seconds != null && isNative) {
                                            seekAndScrollToFeedback(fb.id, fb.video_timestamp_seconds)
                                        }
                                    }}
                                    title={`${isCreator ? '🎨 크리에이터' : isBrand ? '💼 브랜드' : '🏢 MCN'} · ${fb.sender_name || ''}\n${fb.content}`}
                                >
                                    {fb.video_timestamp_seconds != null && (
                                        <Clock className="h-2.5 w-2.5 shrink-0" />
                                    )}
                                    {fb.video_timestamp_seconds != null && (
                                        <span className="font-mono font-bold shrink-0">{formatTime(fb.video_timestamp_seconds)}</span>
                                    )}
                                    <span className="opacity-80 flex-1 whitespace-pre-wrap leading-tight py-0.5">{fb.content}</span>
                                    {/* X 삭제 버튼 */}
                                    <button
                                        className="shrink-0 ml-0.5 rounded-full p-0.5 opacity-0 group-hover/chip:opacity-100 hover:bg-black/10 dark:hover:bg-white/20 transition-all"
                                        onClick={(e) => handleDeleteFeedback(fb.id, e)}
                                        title="삭제"
                                    >
                                        <X className="h-2.5 w-2.5" />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Pending timestamp badge */}
                {pendingTimestamp !== null && (
                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-2.5 py-1.5">
                        <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span className="text-xs text-amber-700 dark:text-amber-300 font-mono font-bold">{formatTime(pendingTimestamp)}</span>
                        <span className="text-xs text-amber-600/70">에 고정됨</span>
                        <button
                            className="ml-auto text-amber-500 hover:text-amber-700"
                            onClick={handleCancelBookmark}
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}

                {/* Input row: bookmark btn + textarea + send btn */}
                <div className="flex gap-2 items-end">
                    {/* Bookmark capture button */}
                    {isNative && (
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "shrink-0 gap-1.5 text-xs h-9 px-3 transition-colors",
                                pendingTimestamp !== null
                                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                                    : 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                            )}
                            onClick={handleBookmarkCurrent}
                            disabled={!duration}
                            title="현재 재생시점을 북마크"
                        >
                            <BookmarkPlus className="h-3.5 w-3.5" />
                            {pendingTimestamp !== null ? formatTime(pendingTimestamp) : formatTime(currentTime)}
                        </Button>
                    )}

                    {/* Feedback textarea */}
                    <Textarea
                        ref={feedbackTextareaRef}
                        placeholder={
                            pendingTimestamp !== null
                                ? `${formatTime(pendingTimestamp)} 구간에 대한 피드백...`
                                : userType === 'brand'
                                    ? '타임스탬프 없이 피드백을 남길 수도 있습니다...'
                                    : '크리에이터 메모를 남기세요...'
                        }
                        value={feedbackInput}
                        onChange={e => setFeedbackInput(e.target.value)}
                        className="text-xs min-h-[36px] max-h-[80px] resize-none flex-1"
                        onKeyDown={e => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSendFeedback()
                        }}
                    />

                    {/* Send button */}
                    <Button
                        size="icon"
                        className="shrink-0 h-9 w-9"
                        onClick={handleSendFeedback}
                        disabled={isSendingFeedback || !feedbackInput.trim()}
                        title="피드백 저장 (Cmd+Enter)"
                    >
                        {isSendingFeedback
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Send className="h-4 w-4" />
                        }
                    </Button>
                </div>

                <p className="text-[10px] text-muted-foreground/60 text-right">Cmd+Enter로 전송</p>
            </div>
        )
    }

    // ─── render: video player ───────────────────────────────────────────

    const renderVideoPlayerOrPlaceholder = () => {
        if (!activeVideoUrl) {
            // ── 크리에이터: 초안 업로드 폼 ──
            if (userType === 'creator') {
                return (
                    <div className="border border-border/60 rounded-xl bg-muted/5 flex flex-col gap-3 p-4">
                        <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4 text-primary" />
                            <h4 className="text-sm font-bold">초안 영상 업로드</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            수정 전 초안 영상을 업로드하세요. 브랜드가 엁에서 영상을 보면서 피드백을 남길 수 있습니다.
                        </p>

                        {/* 모드 전환 버튼 (파일 / 링크) */}
                        <div className="flex gap-1 p-0.5 bg-muted rounded-lg w-full max-w-[240px]">
                            <button
                                type="button"
                                onClick={() => setDraftUploadMode('file')}
                                className={cn(
                                    'flex-1 text-[11px] font-medium py-1 rounded-md transition-all',
                                    draftUploadMode === 'file'
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                📁 파일 (자동 압축)
                            </button>
                            <button
                                type="button"
                                onClick={() => setDraftUploadMode('link')}
                                className={cn(
                                    'flex-1 text-[11px] font-medium py-1 rounded-md transition-all',
                                    draftUploadMode === 'link'
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                🔗 외부 링크
                            </button>
                        </div>

                        {draftUploadMode === 'link' ? (
                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://drive.google.com/... 또는 유튜브 비공개 URL"
                                    value={draftUrl}
                                    onChange={e => setDraftUrl(e.target.value)}
                                    className="text-sm h-9 flex-1"
                                />
                                <Button
                                    size="sm"
                                    className="shrink-0 gap-1.5"
                                    onClick={handleSaveDraft}
                                    disabled={isSavingDraft || !draftUrl.trim()}
                                >
                                    {isSavingDraft ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                    링크 제출
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <input
                                    ref={draftFileInputRef}
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) handleDraftFileUpload(file)
                                    }}
                                />
                                {isSavingDraft ? (
                                    <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                                        {/* 압축 프로그레스 */}
                                        {draftCompressProgress > 0 && draftCompressProgress < 100 && (
                                            <div className="space-y-1 mb-3">
                                                <div className="flex justify-between text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                                                    <span>영상을 확인용 품질로 최적화 중...</span>
                                                    <span>{draftCompressProgress}%</span>
                                                </div>
                                                <div className="w-full bg-indigo-100 dark:bg-indigo-950/50 rounded-full h-1.5">
                                                    <div
                                                        className="bg-indigo-500 h-1.5 rounded-full transition-all"
                                                        style={{ width: `${draftCompressProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {/* 업로드 프로그레스 */}
                                        {(draftCompressProgress === 100 || draftUploadProgress > 0) && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                                    <span>서버로 업로드 중...</span>
                                                    <span>{draftUploadProgress}%</span>
                                                </div>
                                                <div className="w-full bg-muted-foreground/20 rounded-full h-1.5">
                                                    <div
                                                        className="bg-green-500 h-1.5 rounded-full transition-all"
                                                        style={{ width: `${draftUploadProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Button
                                        className="w-full gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-900/60"
                                        size="sm"
                                        onClick={() => draftFileInputRef.current?.click()}
                                        disabled={isSavingDraft}
                                    >
                                        <FileVideo className="h-4 w-4" />
                                        직접 파일 선택 (자동으로 압축되어 올라갑니다)
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )
            }
            // ── 브랜드: 크리에이터 초안 대기 안내 ──
            return (
                <div className="flex flex-col items-center justify-center bg-muted/10 rounded-xl border border-dashed border-border/50 text-muted-foreground gap-3 min-h-[200px] p-6">
                    <FileVideo className="h-10 w-10 opacity-30" />
                    <p className="text-sm font-medium">초안 제출 대기 중</p>
                    <p className="text-xs opacity-60 text-center">크리에이터가 초안 영상을 업로드하면 여기에 표시되고<br />워크스페이스 체팅으로 안내해 드립니다.</p>
                </div>
            )
        }

        if (isYouTubeUrl(activeVideoUrl)) {
            return (
                <div className="flex flex-col gap-2">
                    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
                        <iframe
                            src={getYouTubeEmbedUrl(activeVideoUrl)}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>YouTube 영상은 타임스탬프 북마크가 지원되지 않습니다</span>
                    </div>
                </div>
            )
        }

        // Native video — with error fallback for unsupported formats (e.g. MPEG-4)
        if (videoError) {
            return (
                <div className="flex flex-col items-center justify-center bg-muted/20 rounded-xl border border-amber-200 dark:border-amber-800 gap-3 min-h-[200px] p-6">
                    <AlertCircle className="h-10 w-10 text-amber-500 opacity-70" />
                    <p className="text-sm font-medium">브라우저에서 직접 재생할 수 없는 파일입니다</p>
                    <p className="text-xs text-muted-foreground text-center">MPEG-4, AVI 등 일부 포맷은 브라우저 재생이 제한됩니다.<br />아래 버튼으로 다운로드하거나 외부에서 확인하세요.</p>
                    <a
                        href={activeVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary underline underline-offset-2"
                    >
                        <FileVideo className="h-4 w-4" />
                        파일 열기 / 다운로드
                    </a>
                </div>
            )
        }

        return (
            <div className="flex flex-col gap-1">
                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group">
                    <video
                        ref={videoRef}
                        src={activeVideoUrl}
                        className="w-full h-full object-contain"
                        onTimeUpdate={handleVideoTimeUpdate}
                        onLoadedMetadata={handleVideoLoadedMetadata}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        onError={() => setVideoError(true)}
                    />
                    {/* Controls overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={handlePlayPause}>
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={handleMute}>
                                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                            <span className="text-white text-xs font-mono tabular-nums">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                            <div className="flex-1" />
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={handleFullscreen}>
                                <Maximize className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Progress bar + ▼ markers */}
                {renderProgressWithBookmarks()}
            </div>
        )
    }

    const renderTabs = () => {
        if (!draftUrlData && !finalUrlData && !cleanUrlData) return null

        return (
            <div className="flex gap-1.5 p-1 bg-muted/60 rounded-lg shrink-0 overflow-x-auto mt-1 mb-2">
                <button
                    onClick={() => setVideoTab('draft')}
                    disabled={!draftUrlData}
                    className={cn(
                        "flex-1 min-w-[80px] text-[11px] font-bold py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1.5",
                        videoTab === 'draft' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
                        !draftUrlData && "opacity-40 cursor-not-allowed"
                    )}
                >
                    <Video className="h-3 w-3" />
                    수정본 {draftUrlData ? '' : '(대기)'}
                </button>
                <button
                    onClick={() => setVideoTab('final')}
                    disabled={!finalUrlData}
                    className={cn(
                        "flex-1 min-w-[80px] text-[11px] font-bold py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1.5",
                        videoTab === 'final' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
                        !finalUrlData && "opacity-40 cursor-not-allowed"
                    )}
                >
                    <FileVideo className="h-3 w-3" />
                    최종본 {finalUrlData ? '' : '(대기)'}
                </button>
                {finalUrlData && (
                    <a href={finalUrlData} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center bg-background/50 hover:bg-background border rounded-md px-2 text-muted-foreground hover:text-primary transition-colors" title="다운로드/새창열기">
                        <Download className="h-3 w-3" />
                    </a>
                )}
                <button
                    onClick={() => setVideoTab('clean')}
                    disabled={!cleanUrlData}
                    className={cn(
                        "flex-1 min-w-[80px] text-[11px] font-bold py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1.5",
                        videoTab === 'clean' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
                        !cleanUrlData && "opacity-40 cursor-not-allowed"
                    )}
                >
                    <FileVideo className="h-3 w-3" />
                    클린본 {cleanUrlData ? '' : '(대기)'}
                </button>
                {cleanUrlData && (
                    <a href={cleanUrlData} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center bg-background/50 hover:bg-background border rounded-md px-2 text-muted-foreground hover:text-primary transition-colors" title="다운로드/새창열기">
                        <Download className="h-3 w-3" />
                    </a>
                )}
            </div>
        )
    }

    const renderVideoArea = () => {
        return (
            <div className="flex flex-col">
                {renderTabs()}
                {renderVideoPlayerOrPlaceholder()}
            </div>
        )
    }

    // ─── render: bottom action area ───────────────────────────────────────

    const renderActionArea = () => {
        // ── BRAND ──────────────────────────────────────────
        if (userType === 'brand') {
            const isCompleted = proposal?.status === 'completed' || proposal?.content_submission_status === 'completed'
            const isFullySubmitted = !!finalUrlData && !!cleanUrlData

            // • 최종 승인 완료 상태
            if (isBrandApproved) {
                if (isCompleted) {
                    return (
                        <div className="shrink-0 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 bg-emerald-50 dark:bg-emerald-950/20 flex flex-col gap-3 text-sm">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                <span>협업이 모두 완료되었습니다.</span>
                            </div>
                            <p className="text-[11px] text-emerald-600/80">정산 승인이 완료되어 지급 대기 중입니다.</p>
                        </div>
                    )
                }

                if (isFullySubmitted) {
                    return (
                        <div className="shrink-0 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 bg-emerald-50 dark:bg-emerald-950/20 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-bold">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                <span>크리에이터가 최종본과 클린본 제출을 완료했습니다.</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                    size="sm"
                                    onClick={async () => {
                                        if (!proposalId) return;
                                        const updates: any = { status: 'settlement', content_submission_status: 'completed' };
                                        let success = false;
                                        if (isMoment) success = await updateMomentProposal(proposalId, updates);
                                        else if (isCampaign) success = await updateProposal(proposalId, updates);
                                        else success = await updateProductApplication(proposalId, updates);
                                        if (success) {
                                            useWorkspaceStore.getState().updateProposal(updates);
                                            useWorkspaceStore.getState().setCurrentStage('settlement');
                                            refreshData();
                                            toast.success('협업 완료 및 정산 승인되었습니다. 크리에이터가 성과를 제출합니다. 🎉');
                                            const creatorId = (proposal as any)?.creator_id || (proposal as any)?.creatorId || (proposal as any)?.influencer?.id;
                                            if (creatorId) {
                                                sendNotification(creatorId, '협업이 완료되었습니다! 인사이트 성과를 제출해주세요.', 'collaboration_complete', proposalId);
                                            }
                                        }
                                    }}
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> 협업 완료 및 정산 승인
                                </Button>
                            </div>
                            <p className="text-[10px] text-emerald-600/70 text-center">
                                완료 버튼을 누르면 크리에이터에게 비용 지급이 승인되며 수정이 불가능합니다.
                            </p>
                        </div>
                    )
                }

                return (
                    <div className="shrink-0 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 bg-emerald-50 dark:bg-emerald-950/20 flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        최종 승인 완료 · 크리에이터의 최종본/클린본 제출 대기 중
                    </div>
                )
            }

            // • 영상이 없으면
            if (!activeVideoUrl) return null

            // • 검토 중 / 검토 완료 화면
            return (
                <div className="shrink-0 border border-border/60 rounded-xl bg-muted/10 flex flex-col gap-3 p-4">
                    {/* ――― 검토 스테이터스 선택 탭 ――― */}
                    <div>
                        <p className="text-xs font-bold text-muted-foreground mb-2">현재 검토 상태</p>
                        <div className="flex gap-2">
                            {/* 탭 1: 피드백 수정요청 (검토 완료) */}
                            <button
                                onClick={handleMarkReviewComplete}
                                disabled={isMarkingReview || isRevisionRequested}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-bold transition-all",
                                    isRevisionRequested
                                        ? 'bg-orange-500 border-orange-500 text-white cursor-default'
                                        : 'border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 bg-background'
                                )}
                            >
                                {isMarkingReview
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : isRevisionRequested
                                        ? <CheckCircle2 className="h-3.5 w-3.5" />
                                        : <MessageSquare className="h-3.5 w-3.5" />
                                }
                                {isRevisionRequested ? '수정요청 완료' : '피드백 수정요청'}
                            </button>

                            {/* 탭 2: 검토 완료 (수정요청 취소 - 다시 성검) */}
                            {isRevisionRequested && (
                                <button
                                    onClick={async () => {
                                        if (!proposalId || isMarkingReview) return
                                        setIsMarkingReview(true)
                                        try {
                                            const updates: any = {
                                                content_revision_requested_at: null,
                                                content_submission_status: 'submitted', // [FIX] 취소 시 submitted로 복원
                                            }
                                            let ok = false
                                            if (isMoment) ok = await updateMomentProposal(proposalId, updates)
                                            else if (isCampaign) ok = await updateProposal(proposalId, updates)
                                            else ok = await updateProductApplication(proposalId, updates)
                                            if (ok) {
                                                useWorkspaceStore.getState().updateProposal(updates)
                                                refreshData()
                                                toast.success('수정요청이 취소되었습니다.')
                                            }
                                        } catch { toast.error('오류') }
                                        finally { setIsMarkingReview(false) }
                                    }}
                                    disabled={isMarkingReview}
                                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-xs text-muted-foreground hover:bg-accent transition-all"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    취소
                                </button>
                            )}
                        </div>

                        {isRevisionRequested && (
                            <p className="text-[11px] text-orange-600 dark:text-orange-400 mt-2 pl-0.5">
                                ⚠️ 크리에이터에게 수정본 업로드가 허락되었습니다.
                                크리에이터가 수정본을 올리면 다시 검토할 수 있습니다.
                            </p>
                        )}
                    </div>

                    {/* ――― 최종 컨펌 버튼 ――― */}
                    <div className="border-t border-border/40 pt-3">
                        <p className="text-[11px] text-muted-foreground mb-2">피드백을 모두 수렴하고, 수정이 완료되면 최종 승인하세요.</p>
                        <Button
                            className="w-full gap-2"
                            onClick={handleFinalApprove}
                            disabled={isFinalApproving || isRevisionRequested}
                            title={isRevisionRequested ? '수정본 검토 후 승인 가능' : ''}
                        >
                            {isFinalApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            {isRevisionRequested ? '최종 컨펌 (수정본 업로드 대기 중)' : '최종 컨펌 — 크리에이터에게 최종본 요청'}
                        </Button>
                    </div>
                </div>
            )
        }

        // ── CREATOR ──────────────────────────────────────────
        if (userType === 'creator') {
            return (
                <div className="flex flex-col gap-3">

                    {/* ――― 수정본 업로드 섹션 ―――
                         브랜드가 "검토 완료" 누른 후에만 활성화됨 */}
                    <div className={cn(
                        "shrink-0 border rounded-xl p-4 flex flex-col gap-3 transition-all",
                        isRevisionRequested
                            ? 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20'
                            : 'border-border/40 bg-muted/10 opacity-50 pointer-events-none'
                    )}>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                isRevisionRequested ? 'border-orange-500 bg-orange-500' : 'border-muted-foreground'
                            )}>
                                {isRevisionRequested && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <h4 className="text-sm font-bold">
                                수정본 업로드
                                {!isRevisionRequested && (
                                    <span className="ml-2 text-xs text-muted-foreground font-normal">(브랜드의 검토 완료 후 활성화)</span>
                                )}
                            </h4>
                        </div>
                        {isRevisionRequested && (
                            <div className="pl-7 space-y-3">
                                <p className="text-[11px] text-orange-600 dark:text-orange-400">
                                    ⚠️ 수정본을 업로드하면 <strong>이전 업로드본이 대체</strong>됩니다.
                                    피드백을 충분히 반영한 후 제출해주세요.
                                </p>

                                {/* 파일 / 링크 모드 전환 — 링크 입력 비활성화 (주석처리)
                                <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setRevisionUploadMode('file')}
                                        className={cn(
                                            'flex-1 text-[11px] font-medium py-1 rounded-md transition-all',
                                            revisionUploadMode === 'file'
                                                ? 'bg-background shadow-sm text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        📁 파일 업로드
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRevisionUploadMode('link')}
                                        className={cn(
                                            'flex-1 text-[11px] font-medium py-1 rounded-md transition-all',
                                            revisionUploadMode === 'link'
                                                ? 'bg-background shadow-sm text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        🔗 링크 입력
                                    </button>
                                </div>
                                */}

                                {/* 파일 업로드 모드 */}
                                {(revisionUploadMode === 'file' || revisionUploadMode === 'link') && (
                                    <div className="space-y-2">
                                        <input
                                            ref={revisionFileInputRef}
                                            type="file"
                                            accept="video/*,image/*,.pdf"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleRevisionFileUpload(file)
                                            }}
                                        />
                                        {isSavingRevision ? (
                                            <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                                                {/* 압축 프로그레스 */}
                                                {revisionCompressProgress > 0 && revisionCompressProgress < 100 && (
                                                    <div className="space-y-1 mb-3">
                                                        <div className="flex justify-between text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                                                            <span>영상을 확인용 품질로 최적화 중...</span>
                                                            <span>{revisionCompressProgress}%</span>
                                                        </div>
                                                        <div className="w-full bg-indigo-100 dark:bg-indigo-950/50 rounded-full h-1.5">
                                                            <div
                                                                className="bg-indigo-500 h-1.5 rounded-full transition-all"
                                                                style={{ width: `${revisionCompressProgress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                {/* 업로드 프로그레스 */}
                                                {(revisionCompressProgress === 100 || revisionUploadProgress > 0) && (
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                                            <span>서버로 업로드 중...</span>
                                                            <span>{revisionUploadProgress}%</span>
                                                        </div>
                                                        <div className="w-full bg-muted-foreground/20 rounded-full h-1.5">
                                                            <div
                                                                className="bg-orange-500 h-1.5 rounded-full transition-all"
                                                                style={{ width: `${revisionUploadProgress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <Button
                                                className="w-full gap-2"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => revisionFileInputRef.current?.click()}
                                                disabled={isSavingRevision}
                                            >
                                                {isSavingRevision
                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    : <Upload className="h-3.5 w-3.5" />
                                                }
                                                파일 선택하여 업로드
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* 링크 입력 모드 — 비활성화 (주석처리)
                                {revisionUploadMode === 'link' && (
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="https://drive.google.com/... 또는 유튜브 비공개 URL"
                                            value={revisionUrl}
                                            onChange={e => setRevisionUrl(e.target.value)}
                                            className="text-sm h-9"
                                        />
                                        <Button
                                            className="w-full gap-2"
                                            size="sm"
                                            onClick={handleSaveRevision}
                                            disabled={isSavingRevision || !revisionUrl.trim()}
                                        >
                                            {isSavingRevision ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                            수정본 제출하기
                                        </Button>
                                    </div>
                                )}
                                */}
                            </div>
                        )}
                    </div>

                    {/* ――― 최종본 / 클린본 제출 섹션 ―――
                         브랜드의 최종 컨펌(최종 승인) 후에만 활성화 */}
                    <div className={cn(
                        "shrink-0 border rounded-xl p-4 flex flex-col gap-3 transition-all",
                        isBrandApproved
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-border/40 bg-muted/10 opacity-50 pointer-events-none'
                    )}>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                isBrandApproved ? 'border-primary bg-primary' : 'border-muted-foreground'
                            )}>
                                {isBrandApproved && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <h4 className="text-sm font-bold">
                                최종본 / 클린본 제출
                                {!isBrandApproved && (
                                    <span className="ml-2 text-xs text-muted-foreground font-normal">(브랜드 최종 컨펌 후 활성화)</span>
                                )}
                            </h4>
                        </div>
                        <div className="space-y-4 pl-7">
                            {/* hidden file inputs */}
                            <input
                                ref={finalFileInputRef}
                                type="file"
                                accept="video/*,image/*,.pdf"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) uploadFinalFile('final', file)
                                }}
                            />
                            <input
                                ref={cleanFileInputRef}
                                type="file"
                                accept="video/*,image/*,.pdf"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) uploadFinalFile('clean', file)
                                }}
                            />

                            {/* ── 최종본 ── */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground">최종본</label>
                                <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
                                    <button type="button" onClick={() => setFinalUploadMode('file')}
                                        className={cn('flex-1 text-[11px] font-medium py-1 rounded-md transition-all',
                                            finalUploadMode === 'file' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                                        📁 파일 업로드
                                    </button>
                                    <button type="button" onClick={() => setFinalUploadMode('link')}
                                        className={cn('flex-1 text-[11px] font-medium py-1 rounded-md transition-all',
                                            finalUploadMode === 'link' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                                        🔗 링크 입력
                                    </button>
                                </div>
                                {finalUploadMode === 'file' ? (
                                    isSavingFinal && finalUploadProgress > 0 ? (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                                <span>업로드 중...</span><span>{finalUploadProgress}%</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-1.5">
                                                <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${finalUploadProgress}%` }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <Button size="sm" variant="outline" className="w-full gap-2"
                                            onClick={() => finalFileInputRef.current?.click()} disabled={isSavingFinal}>
                                            {isSavingFinal ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                            최종본 파일 선택
                                        </Button>
                                    )
                                ) : (
                                    <Input placeholder="https://drive.google.com/... 또는 유튜브 비공개"
                                        value={finalUrl} onChange={e => setFinalUrl(e.target.value)} className="text-sm h-9" />
                                )}
                                {finalUrl && <p className="text-[10px] text-primary truncate">✅ {finalUrl}</p>}
                            </div>

                            {/* ── 클린본 ── */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground">클린본</label>
                                <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
                                    <button type="button" onClick={() => setCleanUploadMode('file')}
                                        className={cn('flex-1 text-[11px] font-medium py-1 rounded-md transition-all',
                                            cleanUploadMode === 'file' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                                        📁 파일 업로드
                                    </button>
                                    <button type="button" onClick={() => setCleanUploadMode('link')}
                                        className={cn('flex-1 text-[11px] font-medium py-1 rounded-md transition-all',
                                            cleanUploadMode === 'link' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                                        🔗 링크 입력
                                    </button>
                                </div>
                                {cleanUploadMode === 'file' ? (
                                    isSavingFinal && cleanUploadProgress > 0 ? (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                                <span>업로드 중...</span><span>{cleanUploadProgress}%</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-1.5">
                                                <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${cleanUploadProgress}%` }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <Button size="sm" variant="outline" className="w-full gap-2"
                                            onClick={() => cleanFileInputRef.current?.click()} disabled={isSavingFinal}>
                                            {isSavingFinal ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                            클린본 파일 선택
                                        </Button>
                                    )
                                ) : (
                                    <Input placeholder="https://drive.google.com/..."
                                        value={cleanUrl} onChange={e => setCleanUrl(e.target.value)} className="text-sm h-9" />
                                )}
                                {cleanUrl && <p className="text-[10px] text-primary truncate">✅ {cleanUrl}</p>}
                            </div>

                            <Button className="w-full gap-2 mt-1" size="sm"
                                onClick={handleSaveFinalUrls}
                                disabled={isSavingFinal || (!finalUrl.trim() && !cleanUrl.trim())}>
                                {isSavingFinal ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                최종본/클린본 제출하기
                            </Button>
                        </div>
                    </div>

                </div>
            )
        }

        return null
    }

    // ─── main render ──────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col lg:flex-row h-full w-full bg-background overflow-hidden">

            {/* ── LEFT/CENTER: video + feedback area + action ── */}
            <div className="flex-1 flex flex-col gap-3 p-4 min-w-0 overflow-y-auto lg:border-r border-border/50">

                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                        <FileVideo className="h-4 w-4 text-primary" />
                        콘텐츠 리뷰
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                            version {(proposal as any)?.content_submission_version || 1}
                        </span>
                    </h3>
                    <div className={cn(
                        "text-xs font-bold px-2 py-1 rounded-full",
                        isBrandApproved
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    )}>
                        {isBrandApproved ? '✅ 최종 승인됨' : '🔄 검토 중'}
                    </div>
                </div>

                {/* Video player */}
                {renderVideoArea()}

                {/* Bottom Sticky Area (Feedback & Actions) */}
                <div className="mt-auto flex flex-col gap-3 pt-4">
                    {/* ── 피드백 입력 ── */}
                    {renderFeedbackArea()}

                    {/* Brand approve / Creator final submit */}
                    {renderActionArea()}
                </div>
            </div>

            {/* ── RIGHT: existing workspace ChatArea (Desktop Only) ── */}
            {/* 모바일에서는 하단 '대화' 탭을 통해 보장되므로 비디오 뷰 내장 채팅은 숨김 처리하여 스와이프나 레이아웃 깨짐 방지 */}
            <div className="hidden lg:flex w-[300px] shrink-0 flex-col border-l border-border/50">
                {/* Chat header label */}
                <div className="p-3 border-b border-border/50 flex items-center gap-2 shrink-0">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    <h4 className="text-xs font-bold">워크스페이스 채팅</h4>
                </div>
                {/* Reuse the existing ChatArea — reads proposal from store, messages from context */}
                <ChatArea className="flex-1 min-h-0" />
            </div>

        </div>
    )
}
