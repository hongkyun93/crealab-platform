import { CampaignForm } from "@/components/forms/CampaignForm"

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <CampaignForm mode="edit" campaignId={id} />
}
