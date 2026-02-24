import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET /api/instagram/callback?code=...&state={userId}
// Facebook OAuth 콜백 → 토큰 교환 → IG 계정 정보 저장
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const userId = searchParams.get('state')
    const error = searchParams.get('error')

    // 항상 메인 도메인(세션 쿠키가 있는 곳)으로 리다이렉트
    // www.creadypick.co.kr과 www.creadypick.com은 다른 도메인이라 쿠키 공유 안 됨
    const canonicalUrl = process.env.NEXT_PUBLIC_APP_URL || origin
    const settingsUrl = `${canonicalUrl}/creator?tab=settings`

    if (error || !code || !userId) {
        return NextResponse.redirect(`${settingsUrl}&ig_error=cancelled`)
    }

    try {
        const appId = process.env.INSTAGRAM_APP_ID!
        const appSecret = process.env.INSTAGRAM_APP_SECRET!
        const redirectUri = `${origin}/api/instagram/callback`

        // 1. 단기 토큰 교환
        const tokenRes = await fetch(
            `https://graph.facebook.com/v19.0/oauth/access_token` +
            `?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&client_secret=${appSecret}&code=${code}`
        )
        const tokenData = await tokenRes.json()
        if (tokenData.error) throw new Error(tokenData.error.message)
        const shortToken = tokenData.access_token

        // 2. 장기 토큰 교환 (60일 유효)
        const longTokenRes = await fetch(
            `https://graph.facebook.com/v19.0/oauth/access_token` +
            `?grant_type=fb_exchange_token&client_id=${appId}` +
            `&client_secret=${appSecret}&fb_exchange_token=${shortToken}`
        )
        const longTokenData = await longTokenRes.json()
        const accessToken = longTokenData.access_token || shortToken

        // 3. 내 정보 확인 (디버그)
        const meRes = await fetch(
            `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${accessToken}`
        )
        const meData = await meRes.json()
        console.log('[Instagram OAuth] me:', JSON.stringify(meData, null, 2))

        // 4. Facebook 페이지 목록 조회 (방법 A: /me/accounts)
        const pagesRes = await fetch(
            `https://graph.facebook.com/v19.0/me/accounts` +
            `?access_token=${accessToken}&fields=id,name,access_token,instagram_business_account`
        )
        const pagesData = await pagesRes.json()
        console.log('[Instagram OAuth] pages:', JSON.stringify(pagesData, null, 2))

        // 5. Facebook 페이지 목록 조회 (방법 B: nested fields)
        const me2Res = await fetch(
            `https://graph.facebook.com/v19.0/me` +
            `?fields=accounts{id,name,access_token,instagram_business_account{id,username,followers_count}}&access_token=${accessToken}`
        )
        const me2Data = await me2Res.json()
        console.log('[Instagram OAuth] me.accounts nested:', JSON.stringify(me2Data?.accounts, null, 2))

        let igUserId: string | null = null
        let pageAccessToken: string = accessToken

        // 방법 A에서 찾기
        for (const page of (pagesData.data || [])) {
            if (page.instagram_business_account?.id) {
                igUserId = page.instagram_business_account.id
                pageAccessToken = page.access_token || accessToken
                break
            }
        }

        // 방법 B에서 찾기
        if (!igUserId) {
            for (const page of (me2Data?.accounts?.data || [])) {
                if (page.instagram_business_account?.id) {
                    igUserId = page.instagram_business_account.id
                    pageAccessToken = page.access_token || accessToken
                    break
                }
            }
        }

        // 폴백: 페이지 없이 직접 연결된 IG 계정 시도
        if (!igUserId) {
            console.log('[Instagram OAuth] 페이지에서 IG 없음, 직접 조회 시도')
            const directRes = await fetch(
                `https://graph.facebook.com/v19.0/me?fields=id,name,instagram_business_account` +
                `&access_token=${accessToken}`
            )
            const directData = await directRes.json()
            console.log('[Instagram OAuth] direct me:', JSON.stringify(directData, null, 2))
            if (directData.instagram_business_account?.id) {
                igUserId = directData.instagram_business_account.id
            }
        }

        // 폴백 방법 C: Business Manager 경유 페이지 조회
        if (!igUserId) {
            console.log('[Instagram OAuth] Business Manager 경유 시도')
            const bizRes = await fetch(
                `https://graph.facebook.com/v19.0/me/businesses` +
                `?fields=id,name` +
                `&access_token=${accessToken}`
            )
            const bizData = await bizRes.json()
            console.log('[Instagram OAuth] businesses:', JSON.stringify(bizData, null, 2))

            for (const biz of (bizData.data || [])) {
                if (igUserId) break
                // owned_pages 조회
                const ownedRes = await fetch(
                    `https://graph.facebook.com/v19.0/${biz.id}/owned_pages` +
                    `?fields=id,name,access_token,instagram_business_account{id,username,followers_count}` +
                    `&access_token=${accessToken}`
                )
                const ownedData = await ownedRes.json()
                console.log(`[Instagram OAuth] biz ${biz.id} owned_pages:`, JSON.stringify(ownedData, null, 2))
                for (const page of (ownedData.data || [])) {
                    if (page.instagram_business_account?.id) {
                        igUserId = page.instagram_business_account.id
                        pageAccessToken = page.access_token || accessToken
                        break
                    }
                }
                if (igUserId) break

                // client_pages 조회
                const clientRes = await fetch(
                    `https://graph.facebook.com/v19.0/${biz.id}/client_pages` +
                    `?fields=id,name,access_token,instagram_business_account{id,username,followers_count}` +
                    `&access_token=${accessToken}`
                )
                const clientData = await clientRes.json()
                console.log(`[Instagram OAuth] biz ${biz.id} client_pages:`, JSON.stringify(clientData, null, 2))
                for (const page of (clientData.data || [])) {
                    if (page.instagram_business_account?.id) {
                        igUserId = page.instagram_business_account.id
                        pageAccessToken = page.access_token || accessToken
                        break
                    }
                }
            }
        }

        if (!igUserId) {
            console.log('[Instagram OAuth] IG 계정을 찾지 못함. 페이지 목록:', JSON.stringify(pagesData?.data?.map((p: any) => ({ id: p.id, name: p.name, hasIG: !!p.instagram_business_account })), null, 2))
            return NextResponse.redirect(`${settingsUrl}&ig_error=no_business_account`)
        }

        // 4. Instagram 계정 상세 정보 조회
        const igRes = await fetch(
            `https://graph.facebook.com/v19.0/${igUserId}` +
            `?fields=id,username,followers_count,media_count` +
            `&access_token=${pageAccessToken}`
        )
        const igInfo = await igRes.json()
        if (igInfo.error) throw new Error(igInfo.error.message)

        // 5. Supabase에 저장 (service role로 bypass RLS)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_ADMIN_KEY
        console.log('[Instagram OAuth] supabaseUrl:', !!supabaseUrl, 'serviceKey:', !!supabaseServiceKey, 'keyLen:', supabaseServiceKey?.length)
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error(`Missing Supabase env: url=${!!supabaseUrl}, key=${!!supabaseServiceKey}`)
        }
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 기존 instagram 채널이 있으면 업데이트, 없으면 삽입
        const { data: existing } = await supabase
            .from('social_channels')
            .select('id')
            .eq('user_id', userId)
            .eq('platform', 'instagram')
            .maybeSingle()

        if (existing?.id) {
            await supabase
                .from('social_channels')
                .update({
                    handle: igInfo.username || '',
                    followers_count: igInfo.followers_count || 0,
                    ig_user_id: igInfo.id,
                    ig_access_token: pageAccessToken,
                })
                .eq('id', existing.id)
        } else {
            await supabase
                .from('social_channels')
                .insert({
                    user_id: userId,
                    platform: 'instagram',
                    handle: igInfo.username || '',
                    followers_count: igInfo.followers_count || 0,
                    is_primary: true,
                    is_public: true,
                    ig_user_id: igInfo.id,
                    ig_access_token: pageAccessToken,
                })
        }

        return NextResponse.redirect(`${settingsUrl}&ig_connected=true`)
    } catch (err: any) {
        console.error('[Instagram OAuth] callback error:', err)
        const msg = encodeURIComponent(err?.message || String(err) || 'unknown')
        return NextResponse.redirect(`${settingsUrl}&ig_error=${msg}`)
    }
}
