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
    const product = formData.get('product') as string
    const category = formData.get('category') as string
    const budget = formData.get('budget') as string
    const target = formData.get('target') as string
    const descriptionRaw = formData.get('description') as string

    // Combine details into description field since DB schema is strict
    const fullDescription = `
[카테고리] ${category}
[제공 혜택] ${budget}
[원하는 크리에이터] ${target}
[상세 내용]
${descriptionRaw}
  `.trim()

    const title = `[${category}] ${product} 캠페인`

    // 3. Insert into DB
    const { error } = await supabase
        .from('campaigns')
        .insert({
            brand_id: user.id,
            title: title,
            product_name: product,
            description: fullDescription,
            status: 'active'
            // budget_min/max, image_url, etc. are optional/omitted for now
        })

    if (error) {
        console.error('Campaign Create Error:', error)
        return { error: '캠페인 등록 중 오류가 발생했습니다: ' + error.message }
    }

    // 4. Return Success
    return { success: true }
}
