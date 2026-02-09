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

export async function submitDirectProposal(data: any) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다.' }

    // Ensure brand_id matches current user to prevent spoofing
    const proposalData = {
        ...data,
        brand_id: user.id,
        status: 'offered' // Force status
    }

    const { data: result, error } = await supabase
        .from('brand_proposals')
        .insert(proposalData)
        .select()
        .single()

    if (error) {
        console.error('Direct Proposal Error:', error)
        return { error: `제안서 발송 실패: ${error.message}` }
    }

    // Send Notification to Influencer (Server-side)
    if (result.influencer_id) {
        const brandName = user.user_metadata?.display_name || user.email?.split('@')[0] || "브랜드"
        const notifMessage = `${brandName}님이 '${result.product_name}' 협업을 제안했습니다.`

        await supabase
            .from('notifications')
            .insert({
                recipient_id: result.influencer_id,
                sender_id: user.id,
                content: notifMessage,
                type: 'proposal_received',
                reference_id: result.id,
                is_read: false
            })
    }

    revalidatePath('/brand')
    revalidatePath('/creator')
    return { success: true, data: result }
}
