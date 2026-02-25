/**
 * 서버사이드 Storage 업로드 헬퍼
 * navigator.locks 문제(Vercel AbortError 수정의 부작용)를 우회하기 위한 공통 유틸리티
 *
 * 사용법:
 *   const url = await uploadFileViaAPI(file, 'avatars', 'user-id')
 */
export async function uploadFileViaAPI(
    file: File,
    bucket: string = 'avatars',
    folder: string = ''
): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', bucket)
    if (folder) formData.append('folder', folder)

    const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    })

    const result = await res.json()

    if (!res.ok) {
        throw new Error(result.error || '업로드 실패')
    }

    return result.url as string
}
