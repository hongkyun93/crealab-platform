import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        // 1. 인증 확인 (서버사이드)
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
        }

        // 2. 파일 수신
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
        }

        // 3. 파일 유효성 검사
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: '이미지 파일만 업로드 가능합니다.' }, { status: 400 })
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다.' }, { status: 400 })
        }

        // 4. Admin 클라이언트로 Storage 업로드 (RLS 우회)
        const admin = createAdminClient()
        const ext = file.name.split('.').pop() || 'jpg'
        const filePath = `${user.id}/${user.id}-${Date.now()}.${ext}`
        const buffer = Buffer.from(await file.arrayBuffer())

        const { error: uploadError } = await admin.storage
            .from('avatars')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true,
            })

        if (uploadError) {
            console.error('[avatar-upload] Storage error:', uploadError)
            return NextResponse.json({ error: uploadError.message }, { status: 500 })
        }

        // 5. Public URL 반환
        const { data } = admin.storage.from('avatars').getPublicUrl(filePath)
        const publicUrl = `${data.publicUrl}?t=${Date.now()}`

        return NextResponse.json({ url: publicUrl })

    } catch (e: any) {
        console.error('[avatar-upload] Error:', e)
        return NextResponse.json({ error: e.message || '서버 오류' }, { status: 500 })
    }
}
