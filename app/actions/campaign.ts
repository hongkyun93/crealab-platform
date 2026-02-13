'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createCampaign(formData: FormData) {
    const supabase = await createClient()

    // 1. Check Auth (Must be logged in)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: '로그인이 필요합니다.' }
    }

    // 2. Get Data from Form
    const title = formData.get('title') as string
    const product = formData.get('product') as string
    const category = formData.get('category') as string
    const budget = formData.get('budget') as string
    const target = formData.get('target') as string
    const descriptionRaw = formData.get('description') as string
    const eventDate = formData.get('eventDate') as string
    const postingDate = formData.get('postingDate') as string
    const tags = formData.get('tags') as string
    const image = formData.get('image') as string

    // 3. Insert into DB
    const { error } = await supabase
        .from('campaigns')
        .insert({
            brand_id: user.id,
            title: title || `[${category}] ${product} 캠페인`, // Fallback for safety
            product_name: product,
            category: category,
            budget: budget,
            target: target,
            description: descriptionRaw,
            image: image,
            status: 'active',
            event_date: eventDate,
            posting_date: postingDate,
            tags: (tags || "").split(',').map(tag => tag.trim()).filter(Boolean),
            // New Fields
            recruitment_count: formData.get('recruitmentCount') ? parseInt(formData.get('recruitmentCount') as string) : null,
            recruitment_deadline: formData.get('recruitmentDeadline') as string,
            channels: (formData.get('channels') as string || "").split(',').filter(Boolean),
            reference_link: formData.get('referenceLink') as string,
            hashtags: (formData.get('hashtags') as string || "").split(',').map(tag => tag.trim()).filter(Boolean),
            selection_announcement_date: formData.get('selectionDate') as string,
            min_followers: formData.get('minFollowers') ? parseInt(formData.get('minFollowers') as string) : null,
            max_followers: formData.get('maxFollowers') ? parseInt(formData.get('maxFollowers') as string) : null
        })

    if (error) {
        console.error('Campaign Create Error FULL OBJECT:', JSON.stringify(error, null, 2))
        return { error: `등록 실패: ${error.message} (Code: ${error.code})` }
    }

    // 4. Return Success
    return { success: true }
}

export async function updateCampaign(id: string, formData: FormData) {
    const supabase = await createClient()

    // 1. Check Auth (Must be logged in)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: '로그인이 필요합니다.' }
    }

    // 2. Get Data from Form
    const title = formData.get('title') as string
    const product = formData.get('product') as string
    const category = formData.get('category') as string
    const budget = formData.get('budget') as string
    const target = formData.get('target') as string
    const descriptionRaw = formData.get('description') as string
    const eventDate = formData.get('eventDate') as string
    const postingDate = formData.get('postingDate') as string
    const tags = formData.get('tags') as string
    const image = formData.get('image') as string

    // 3. Update DB
    const { error } = await supabase
        .from('campaigns')
        .update({
            title: title || `[${category}] ${product} 캠페인`, // Fallback for safety
            product_name: product,
            category: category,
            budget: budget,
            target: target,
            description: descriptionRaw,
            image: image,
            event_date: eventDate,
            posting_date: postingDate,
            tags: (tags || "").split(',').map(tag => tag.trim()).filter(Boolean),
            // New Fields
            recruitment_count: formData.get('recruitmentCount') ? parseInt(formData.get('recruitmentCount') as string) : null,
            recruitment_deadline: formData.get('recruitmentDeadline') as string,
            channels: (formData.get('channels') as string || "").split(',').filter(Boolean),
            reference_link: formData.get('referenceLink') as string,
            hashtags: (formData.get('hashtags') as string || "").split(',').map(tag => tag.trim()).filter(Boolean),
            selection_announcement_date: formData.get('selectionDate') as string,
            min_followers: formData.get('minFollowers') ? parseInt(formData.get('minFollowers') as string) : null,
            max_followers: formData.get('maxFollowers') ? parseInt(formData.get('maxFollowers') as string) : null
        })
        .eq('id', id)
        .eq('brand_id', user.id) // Ensure ownership

    if (error) {
        console.error('Campaign Update Error FULL OBJECT:', JSON.stringify(error, null, 2))
        return { error: `수정 실패: ${error.message} (Code: ${error.code})` }
    }

    return { success: true }
}

export async function deleteCampaign(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다.' }

    const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
        .eq('brand_id', user.id)

    if (error) {
        return { error: `삭제 실패: ${error.message}` }
    }

    return { success: true }
}

export async function updateCampaignStatus(id: string, status: 'active' | 'closed') {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다.' }

    const { error } = await supabase
        .from('campaigns')
        .update({ status: status })
        .eq('id', id)
        .eq('brand_id', user.id)

    if (error) {
        return { error: `상태 변경 실패: ${error.message}` }
    }

    return { success: true }
}
