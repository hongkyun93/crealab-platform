import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 허용된 버킷 목록 (접근 가능한 버킷만 허용)
const ALLOWED_BUCKETS = ['avatars', 'campaigns', 'submissions', 'workspace-files', 'product-images']

export async function POST(req: NextRequest) {
    try {
        // 1. 인증 확인 (서버사이드)
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
        }

        // 2. FormData 수신
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        const bucket = (formData.get('bucket') as string) || 'avatars'
        const folder = (formData.get('folder') as string) || user.id

        // 3. 버킷 허용 목록 검증
        if (!ALLOWED_BUCKETS.includes(bucket)) {
            return NextResponse.json({ error: `허용되지 않는 버킷입니다: ${bucket}` }, { status: 400 })
        }

        if (!file) {
            return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
        }

        // 4. 파일 크기 검증 (10MB 상한)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: '파일 크기는 10MB 이하여야 합니다.' }, { status: 400 })
        }

        // 5. Admin 클라이언트로 Storage 업로드 (RLS 및 navigator.locks 우회)
        const admin = createAdminClient()
        const ext = file.name.split('.').pop() || 'bin'
        const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
        const filePath = folder ? `${folder}/${safeFileName}` : safeFileName

        const buffer = Buffer.from(await file.arrayBuffer())

        const { error: uploadError } = await admin.storage
            .from(bucket)
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true,
            })

        if (uploadError) {
            console.error('[upload API] Storage error:', uploadError)
            return NextResponse.json({ error: uploadError.message }, { status: 500 })
        }

        // 6. Public URL 반환
        const { data } = admin.storage.from(bucket).getPublicUrl(filePath)
        const publicUrl = `${data.publicUrl}?t=${Date.now()}`

        return NextResponse.json({ url: publicUrl, path: filePath })

    } catch (e: any) {
        console.error('[upload API] Error:', e)
        return NextResponse.json({ error: e.message || '서버 오류' }, { status: 500 })
    }
}
