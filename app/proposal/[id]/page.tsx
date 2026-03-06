import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProposalClientView } from './proposal-client-view'

// Server Component
export default async function ProposalLandingPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // 1. Fetch Portfolio Link Details
    const { data: portfolio, error } = await supabase
        .from('mcn_portfolio_links')
        .select(`
            *,
            team:teams (
                id,
                name,
                logo_url
            )
        `)
        .eq('id', params.id)
        .single()

    if (error || !portfolio) {
        console.error('Portfolio fetch error:', error)
        notFound()
    }

    // Check expiration
    if (portfolio.expires_at && new Date(portfolio.expires_at) < new Date()) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800">만료된 제안서입니다</h1>
                    <p className="text-slate-500 mt-2">이 포트폴리오 링크는 유효기간이 지났습니다.</p>
                </div>
            </div>
        )
    }

    // 2. Fetch Creator Data
    let creators: any[] = []
    if (portfolio.creator_ids && portfolio.creator_ids.length > 0) {
        const { data: creatorData, error: creatorError } = await supabase
            .from('profiles')
            .select(`
                id,
                display_name,
                avatar_url,
                instagram_handle,
                followers_count,
                price_video,
                price_feed,
                tags,
                category
            `)
            .in('id', portfolio.creator_ids)

        if (!creatorError && creatorData) {
            creators = creatorData
        } else {
            console.error('Failed to fetch creators:', creatorError)
        }
    }

    // 3. Render Client Component with data
    return <ProposalClientView portfolio={portfolio} creators={creators} />
}
