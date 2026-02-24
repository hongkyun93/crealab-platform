import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
        return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // IG 자격증명 + 캐시 조회
    const { data: channel } = await supabase
        .from('social_channels')
        .select('id, ig_user_id, ig_access_token, ig_demographics')
        .eq('user_id', userId)
        .eq('platform', 'instagram')
        .not('ig_user_id', 'is', null)
        .maybeSingle()

    if (!channel?.ig_user_id || !channel?.ig_access_token) {
        return NextResponse.json({ error: 'Instagram 계정이 연결되지 않았습니다.' }, { status: 404 })
    }

    // 팔로워 인구통계 API 호출 (최신 v19.0+ 방식)
    // follower_demographics: breakdown=age,gender,city,country 각각 별도 요청 필요
    const [ageRes, genderRes, cityRes] = await Promise.all([
        fetch(
            `https://graph.facebook.com/v19.0/${channel.ig_user_id}/insights` +
            `?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=age` +
            `&access_token=${channel.ig_access_token}`
        ),
        fetch(
            `https://graph.facebook.com/v19.0/${channel.ig_user_id}/insights` +
            `?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=gender` +
            `&access_token=${channel.ig_access_token}`
        ),
        fetch(
            `https://graph.facebook.com/v19.0/${channel.ig_user_id}/insights` +
            `?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=city` +
            `&access_token=${channel.ig_access_token}`
        ),
    ])

    const [ageData, genderData, cityData] = await Promise.all([
        ageRes.json(), genderRes.json(), cityRes.json()
    ])

    const hasError = ageData.error || genderData.error || cityData.error
    if (hasError) {
        // API 에러 시 캐시된 데이터 반환
        if (channel.ig_demographics) {
            return NextResponse.json({ demographics: channel.ig_demographics, cached: true })
        }
        const errMsg = (ageData.error || genderData.error || cityData.error)?.message
        return NextResponse.json({ error: errMsg }, { status: 400 })
    }

    // breakdown 파싱 헬퍼: data[0].total_value.breakdowns[0].results → { dimension_value: value }
    const parseBreakdown = (raw: any): Record<string, number> => {
        const results = raw?.data?.[0]?.total_value?.breakdowns?.[0]?.results || []
        const map: Record<string, number> = {}
        for (const r of results) {
            map[r.dimension_values?.[0] || r.name || ''] = r.value || 0
        }
        return map
    }

    const demographics = {
        audience_gender_age: parseBreakdown(genderData),  // gender breakdown
        audience_age: parseBreakdown(ageData),            // age breakdown
        audience_city: parseBreakdown(cityData),           // city breakdown
    }

    // DB에 캐시 저장
    await supabase
        .from('social_channels')
        .update({ ig_demographics: demographics })
        .eq('id', channel.id)

    return NextResponse.json({ demographics, cached: false })
}
