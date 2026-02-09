'use server'

import { createClient } from '@/lib/supabase/server'
import { getLongLivedUserAccessToken, getInstagramBusinessAccount, getInstagramProfile } from '@/lib/instagram'
import { revalidatePath } from 'next/cache'

export async function connectInstagramAccount(shortLivedToken: string) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // 1. Exchange for Long-Lived Token
        const longLivedToken = await getLongLivedUserAccessToken(shortLivedToken);

        // 2. Get Instagram Business Account ID
        const accounts = await getInstagramBusinessAccount(longLivedToken);
        // Note: For now, we take the first connected one. 
        // In future, we could return a list for user to select if multiple exist.

        // 3. Fetch Profile Data
        const profile = await getInstagramProfile(accounts.instagramId, longLivedToken);

        // 4. Save to Database
        const { error } = await supabase
            .from('instagram_accounts')
            .upsert({
                user_id: user.id,
                instagram_user_id: accounts.instagramId,
                access_token: longLivedToken,
                page_id: accounts.pageId,
                username: profile.username,
                profile_picture_url: profile.profile_picture_url,
                follower_count: profile.followers_count,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

        if (error) throw error;

        revalidatePath('/creator')
        return { success: true }
    } catch (error: any) {
        console.error('Instagram Connection Error:', error)
        return { error: error.message || 'Failed to connect Instagram account' }
    }
}

export async function disconnectInstagramAccount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('instagram_accounts')
        .delete()
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/creator')
    return { success: true }
}
