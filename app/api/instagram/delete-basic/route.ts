import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Meta 데이터 삭제 콜백 (Data Deletion Callback URL)
// Facebook 로그인 앱 설정 > 데이터 삭제 안내 URL 로 등록됨
// POST: Facebook이 서명된 요청을 보냄 → 삭제 확인 응답
// GET:  사용자가 직접 접근할 경우 안내 페이지

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>데이터 삭제 요청 - CreadyPick</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 60px auto; padding: 0 24px; }
    h1 { font-size: 1.5rem; }
    p { line-height: 1.7; color: #444; }
    a { color: #6366f1; }
  </style>
</head>
<body>
  <h1>CreadyPick 데이터 삭제 요청</h1>
  <p>
    Facebook 또는 Instagram 계정을 통해 CreadyPick에 연결한 경우,
    아래 이메일로 데이터 삭제를 요청하실 수 있습니다.
  </p>
  <p>
    <strong>이메일:</strong> <a href="mailto:support@creadypick.com">support@creadypick.com</a>
  </p>
  <p>
    요청 시 연결된 Instagram 사용자명 또는 Facebook 이메일을 함께 보내주세요.
    영업일 기준 3일 이내에 처리됩니다.
  </p>
  <p><a href="https://www.creadypick.com">← CreadyPick 홈으로</a></p>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const params = new URLSearchParams(body)
    const signedRequest = params.get('signed_request')

    if (!signedRequest) {
      return NextResponse.json({ error: 'signed_request missing' }, { status: 400 })
    }

    // signed_request 파싱 (Facebook spec)
    const [encodedSig, payload] = signedRequest.split('.')
    const appSecret = process.env.INSTAGRAM_APP_SECRET || ''

    // 서명 검증
    const expectedSig = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    if (encodedSig !== expectedSig) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'))
    const facebookUserId = data.user_id

    console.log('[data-deletion] Facebook user_id deletion requested:', facebookUserId)

    // ──────────────────────────────────────────
    // 실제 데이터 삭제
    // ──────────────────────────────────────────
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. social_channels에서 Facebook/Instagram user_id로 유저의 Supabase user_id 조회
    const { data: channel } = await adminClient
      .from('social_channels')
      .select('user_id')
      .eq('ig_user_id', facebookUserId)
      .maybeSingle()

    if (channel?.user_id) {
      const supabaseUserId = channel.user_id

      // 2. social_channels에서 해당 Instagram 연결 행 삭제
      await adminClient
        .from('social_channels')
        .delete()
        .eq('user_id', supabaseUserId)
        .eq('ig_user_id', facebookUserId)

      // 3. creator_details의 Instagram 관련 필드 초기화
      await adminClient
        .from('creator_details')
        .update({
          instagram_handle: null,
          instagram_followers: null,
        })
        .eq('id', supabaseUserId)

      console.log('[data-deletion] Deleted Instagram data for Supabase user:', supabaseUserId)
    } else {
      console.log('[data-deletion] No matching user found for Facebook user_id:', facebookUserId)
    }

    // 확인 응답 (Meta 스펙: confirmation_code + url 필수)
    const confirmationCode = `del_${facebookUserId}_${Date.now()}`
    return NextResponse.json({
      url: `https://www.creadypick.com/api/instagram/delete-basic?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    })
  } catch (err: any) {
    console.error('[data-deletion] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
