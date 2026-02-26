import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        // 1. Verify current user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: '인증되지 않은 요청입니다.' },
                { status: 401 }
            )
        }

        const userId = user.id

        // 2. Parse optional reason
        let reason = ''
        try {
            const body = await request.json()
            reason = body.reason || ''
        } catch {
            // No body is fine
        }

        // 3. Soft delete: mark profile as deleted (preserves collaboration history)
        const adminClient = createAdminClient()

        // Save deletion record for audit
        try {
            await adminClient.from('account_deletions').insert({
                user_id: userId,
                email: user.email,
                reason,
                deleted_at: new Date().toISOString(),
            })
        } catch (e: any) {
            // Table might not exist yet, that's ok
            console.warn(`[Account Delete] Could not save deletion record:`, e.message)
        }

        // 4. Clean up user data
        // Anonymize profile
        await adminClient.from('profiles').update({
            display_name: '탈퇴한 사용자',
            avatar_url: null,
            email: null,
        }).eq('id', userId)

        // Remove influencer details
        await adminClient.from('influencer_details').delete().eq('id', userId)

        // Remove influencer events (moments)
        await adminClient.from('influencer_events').delete().eq('influencer_id', userId)


        // 5. Delete the auth user (requires Service Role)
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

        if (deleteError) {
            console.error(`[Account Delete] Failed to delete auth user:`, deleteError)
            return NextResponse.json(
                { error: '계정 삭제 중 오류가 발생했습니다. 관리자에게 문의해주세요.' },
                { status: 500 }
            )
        }


        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[Account Delete] Unexpected error:', error)
        return NextResponse.json(
            { error: error.message || '알 수 없는 오류가 발생했습니다.' },
            { status: 500 }
        )
    }
}
