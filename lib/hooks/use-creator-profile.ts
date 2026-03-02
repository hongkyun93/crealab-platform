import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export interface CreatorProfile {
    id: string
    displayName: string
    handle: string
    avatarUrl: string
    description: string
    primaryRegion: string
    tags: string[]
    priceVideo: number
    priceFeed: number
    priceStory: number
    collabCount: number                 // campaign_performance 완료 건수
    avgEngagementRate: number | null     // 실제 캠페인 평균 참여율 (없으면 null)
    channels: {
        id: string
        platform: string
        handle: string
        followersCount: number
        isPrimary: boolean
        igUserId?: string  // Instagram API 인증 여부
        igDemographics?: Record<string, any>  // 팔로워 인구통계 캐시
    }[]
    moments: {
        id: string
        title: string
        momentDate: string
        targetProduct: string
        status: string
    }[]
}

/**
 * Fetches creator profile data for the profile card dialog.
 * Queries: profiles + social_channels + life_moments (public only, max 3)
 */
export function useCreatorProfile(creatorId: string | null) {
    const [profile, setProfile] = useState<CreatorProfile | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!creatorId) {
            setProfile(null)
            return
        }

        let cancelled = false
        const supabase = createClient()

        const fetchProfile = async () => {
            setIsLoading(true)
            setError(null)

            try {
                // Query 1: profiles + social_channels (JOIN)
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select(`
                        id,
                        display_name,
                        instagram_handle,
                        avatar_url,
                        description,
                        primary_region,
                        tags,
                        price_video,
                        price_feed,
                        price_story,
                        social_channels(id, platform, handle, followers_count, is_primary, ig_user_id, ig_demographics)
                    `)
                    .eq('id', creatorId)
                    .single()

                if (profileError) {
                    console.error('[useCreatorProfile] Profile fetch error:', profileError)
                    if (!cancelled) setError(profileError.message)
                    return
                }

                // Query 2: public moments (max 3, newest first)
                const { data: momentsData, error: momentsError } = await supabase
                    .from('life_moments')
                    .select('id, title, moment_start_date, target_product, status')
                    .eq('creator_id', creatorId)
                    .eq('is_private', false)
                    .order('created_at', { ascending: false })
                    .limit(3)

                if (momentsError) {
                    console.error('[useCreatorProfile] Moments fetch error:', momentsError)
                    // Non-fatal: still show profile without moments
                }

                // Query 3: campaign_performance stats
                const { data: perfData } = await supabase
                    .from('campaign_performance')
                    .select('engagement_rate')
                    .eq('creator_id', creatorId)

                const validEr = (perfData || []).filter((p: any) => p.engagement_rate && p.engagement_rate > 0)
                const avgEngagementRate = validEr.length > 0
                    ? validEr.reduce((s: number, p: any) => s + p.engagement_rate, 0) / validEr.length
                    : null
                const collabCount = (perfData || []).length

                if (!cancelled && profileData) {
                    setProfile({
                        id: profileData.id,
                        displayName: profileData.display_name || 'Creator',
                        handle: profileData.instagram_handle || '',
                        avatarUrl: profileData.avatar_url || '',
                        description: profileData.description || '',
                        primaryRegion: profileData.primary_region || '',
                        tags: profileData.tags || [],
                        priceVideo: profileData.price_video || 0,
                        priceFeed: profileData.price_feed || 0,
                        priceStory: profileData.price_story || 0,
                        collabCount,
                        avgEngagementRate,
                        channels: ((profileData as any).social_channels || []).map((c: any) => ({
                            id: c.id,
                            platform: c.platform || '',
                            handle: c.handle || '',
                            followersCount: c.followers_count || 0,
                            isPrimary: c.is_primary || false,
                            igUserId: c.ig_user_id || undefined,
                            igDemographics: c.ig_demographics || undefined,
                        })),
                        moments: (momentsData || []).map((m: any) => ({
                            id: m.id,
                            title: m.title || '',
                            momentDate: m.moment_start_date || '',
                            targetProduct: m.target_product || '',
                            status: m.status || 'recruiting',
                        })),
                    })
                }
            } catch (err: any) {
                console.error('[useCreatorProfile] Exception:', err)
                if (!cancelled) setError(err.message || 'Unknown error')
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        fetchProfile()

        return () => {
            cancelled = true
        }
    }, [creatorId])

    return { profile, isLoading, error }
}
