import { MomentForm } from "@/components/forms/MomentForm"

export default async function EditMomentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <MomentForm mode="edit" eventId={id} />
}
