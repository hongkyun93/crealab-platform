import { redirect } from 'next/navigation'

export default async function RedirectToEditCampaignRoute({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    redirect(`/brand/campaign/${id}`)
}
