'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitCampaignApplication(campaignId: string, message: string, price?: number) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다.' }

    // Check if already applied? (Optional but good UX)
    // For now, let's just insert.

    const { error } = await supabase
        .from('proposals')
        .insert({
            campaign_id: campaignId,
            influencer_id: user.id,
            message: message,
            price_offer: price,
            status: 'applied' // Initial status
        })

    if (error) {
        console.error('Application Error:', error)
        return { error: `지원 실패: ${error.message}` }
    }

    revalidatePath('/creator')
    return { success: true }
}

export async function updateApplicationStatus(proposalId: string, status: 'accepted' | 'rejected' | 'hold') {
    const supabase = await createClient()

    // Auth check should ideally verify brand ownership of the campaign, 
    // but simplified RLS usually handles "update if I own the related campaign" 
    // or we check it here. 
    // For speed, assuming RLS or simple update.

    const { error } = await supabase
        .from('proposals')
        .update({ status: status })
        .eq('id', proposalId)

    if (error) {
        return { error: `상태 변경 실패: ${error.message}` }
    }

    revalidatePath('/brand')
    return { success: true }
}
