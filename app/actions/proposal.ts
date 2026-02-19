'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitCampaignApplication(
    campaignId: string,
    data: {
        message: string;
        price?: number;
        motivation?: string;
        content_plan?: string;
        portfolio_links?: string[];
        instagram_handle?: string;
        insight_screenshot?: string;
    }
) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다.' }

    // [AUDIT FIX] Fetch user's team_id to ensure visibility
    const { data: teamMember } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .single()

    const influencerTeamId = teamMember?.team_id

    const { error } = await supabase
        .from('campaign_applications')
        .insert({
            campaign_id: campaignId,
            influencer_id: user.id,
            influencer_team_id: influencerTeamId, // [FIX] Set team_id
            message: data.message,
            price_offer: data.price,
            motivation: data.motivation,
            content_plan: data.content_plan,
            portfolio_links: data.portfolio_links,
            instagram_handle: data.instagram_handle,
            insight_screenshot: data.insight_screenshot,
            status: 'applied'
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

    const { error } = await supabase
        .from('campaign_applications')
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

    // [AUDIT FIX] Fetch user's team_id
    const { data: teamMember } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .single()

    const brandTeamId = teamMember?.team_id

    const proposalData = {
        ...data,
        brand_id: user.id,
        brand_team_id: brandTeamId, // [FIX] Set brand_team_id
        status: 'offered'
    }

    // Check if it's a Moment Proposal
    if (data.event_id) {
        const momentProposalData = {
            brand_id: user.id,
            brand_team_id: brandTeamId, // [FIX] Set brand_team_id
            influencer_id: data.influencer_id,
            moment_id: data.event_id,
            message: data.message,
            price_offer: data.compensation_amount ? parseInt(data.compensation_amount.replace(/[^0-9]/g, '')) : 0,
            status: 'offered',
            conditions: {
                group: 'moment_proposal',
                product_name: data.product_name,
                product_type: data.product_type,
                has_incentive: data.has_incentive,
                incentive_detail: data.incentive_detail,
                content_type: data.content_type,
                product_url: data.product_url,
                desired_date: data.desired_date,
                date_flexible: data.date_flexible,
                video_guide: data.video_guide,
                condition_draft_submission_date: data.condition_draft_submission_date,
                condition_final_submission_date: data.condition_final_submission_date,
                condition_upload_date: data.condition_upload_date,
                condition_secondary_usage_period: data.condition_secondary_usage_period
            }
        }

        console.log('[submitDirectProposal] Inserting into moment_proposals:', momentProposalData)

        const { data: result, error } = await supabase
            .from('moment_proposals')
            .insert(momentProposalData)
            .select()
            .single()

        if (error) {
            console.error('Moment Proposal Error:', error)
            return { error: `모먼트 제안 실패: ${error.message}` }
        }

        // Notify
        if (result.influencer_id) {
            const brandName = user.user_metadata?.display_name || user.email?.split('@')[0] || "브랜드"
            await supabase
                .from('notifications')
                .insert({
                    recipient_id: result.influencer_id,
                    sender_id: user.id,
                    content: `${brandName}님이 모먼트 협업을 제안했습니다.`,
                    type: 'proposal_received',
                    reference_id: result.id,
                    is_read: false
                })
        }

        revalidatePath('/brand')
        revalidatePath('/creator')
        return { success: true, data: result }
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
