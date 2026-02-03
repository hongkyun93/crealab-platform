
import { NextResponse } from 'next/server'

export async function GET() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        return NextResponse.json({ error: 'Missing env vars' })
    }

    try {
        const restUrl = `${url}/rest/v1/`
        const response = await fetch(restUrl, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        })

        return NextResponse.json({
            status: 'Raw Fetch Completed',
            target_url: restUrl,
            response: {
                status: response.status, // 401 means key is wrong for this URL
                status_text: response.statusText,
            },
            env_check: {
                url_looks_valid: url.startsWith('https://') && url.includes('.supabase.co'),
                key_length: key.length,
                key_start: key.substring(0, 5),  // Show start to verify format
                key_end: key.substring(key.length - 5) // Show end to see if it changed from DOSUY
            }
        })
    } catch (e: any) {
        return NextResponse.json({
            status: 'Raw Fetch Exception',
            error: e.message
        })
    }
}
