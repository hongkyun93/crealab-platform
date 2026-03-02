/**
 * File validation utilities for message attachments
 * Validates file size and type before upload
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
const ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const

export interface FileValidationResult {
    valid: boolean
    error?: string
}

/**
 * Validate file before upload
 * @param file - File object to validate
 * @returns Validation result with error message if invalid
 */
export function validateFile(file: File): FileValidationResult {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `파일 크기는 ${formatFileSize(MAX_FILE_SIZE)} 이하여야 합니다. (현재: ${formatFileSize(file.size)})`
        }
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type as any)) {
        return {
            valid: false,
            error: '지원하지 않는 파일 형식입니다. (이미지, PDF, Word, Excel만 가능)'
        }
    }

    return { valid: true }
}

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get file icon based on file type
 * @param fileType - MIME type
 * @returns Icon name for lucide-react
 */
export function getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return 'image'
    if (fileType === 'application/pdf') return 'file-text'
    if (fileType.includes('word')) return 'file-text'
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'table'
    return 'file'
}

/**
 * Check if file is an image
 * @param fileType - MIME type
 * @returns true if image
 */
export function isImage(fileType: string): boolean {
    return fileType.startsWith('image/')
}

/**
 * Check if file is a video
 * @param fileType - MIME type
 * @returns true if video
 */
export function isVideo(fileType: string): boolean {
    return fileType.startsWith('video/')
}

// Content upload limits (videos + images for content submission)
const MAX_CONTENT_FILE_SIZE = 150 * 1024 * 1024 // 150MB
const CONTENT_ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'video/x-msvideo',
    'application/pdf',
] as const

/**
 * Validate content file before upload (videos, images — 500MB limit)
 * @param file - File object to validate
 * @returns Validation result with error message if invalid
 */
export function validateContentFile(file: File): FileValidationResult {
    if (file.size > MAX_CONTENT_FILE_SIZE) {
        return {
            valid: false,
            error: `파일 크기는 ${formatFileSize(MAX_CONTENT_FILE_SIZE)} 이하여야 합니다. (현재: ${formatFileSize(file.size)})`
        }
    }

    if (!CONTENT_ALLOWED_TYPES.includes(file.type as any)) {
        return {
            valid: false,
            error: '지원하지 않는 파일 형식입니다. (영상: MP4/MOV/WebM, 이미지: JPG/PNG/GIF/WebP, PDF)'
        }
    }

    return { valid: true }
}
