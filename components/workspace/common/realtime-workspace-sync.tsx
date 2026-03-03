"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useWorkspaceStore } from "@/components/workspace/hooks/use-workspace-store"
import { useEffect } from "react"
import { toast } from "sonner"

export function RealtimeWorkspaceSync() {
    const { supabase } = useAuth()
    const proposal = useWorkspaceStore((state) => state.proposal)
    const updateProposal = useWorkspaceStore((state) => state.updateProposal)

    useEffect(() => {
        if (!proposal?.id) return

        let tableName = ""
        if ((proposal as any).moment_id || (proposal as any).momentId) {
            tableName = "moment_proposals"
        } else if ((proposal as any).campaign_id || (proposal as any).campaignId) {
            tableName = "campaign_applications"
        } else {
            tableName = "product_applications"
        }

        console.log(`[RealtimeWorkspaceSync] Subscribing to ${tableName} id: ${proposal.id}`)

        const channel = supabase
            .channel(`workspace-sync-${proposal.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: tableName,
                    filter: `id=eq.${proposal.id}`,
                },
                (payload) => {
                    console.log("[RealtimeWorkspaceSync] Received update:", payload.new)
                    // Optimistically update the UI with any incoming changes from the other party
                    updateProposal(payload.new as any)

                    // Specific toast for signature
                    const oldDoc = payload.old as any;
                    const newDoc = payload.new as any;

                    if (!oldDoc.brand_signature && newDoc.brand_signature) {
                        toast.success("상대방(브랜드)이 계약서 서명을 완료했습니다.")
                    }
                    if (!oldDoc.creator_signature && newDoc.creator_signature) {
                        toast.success("상대방(크리에이터)이 계약서 서명을 완료했습니다.")
                    }
                }
            )
            .subscribe((status, err) => {
                if (err) {
                    console.error("[RealtimeWorkspaceSync] Subscription error:", err)
                }
            })

        return () => {
            console.log(`[RealtimeWorkspaceSync] Unsubscribing from ${tableName} id: ${proposal.id}`)
            supabase.removeChannel(channel)
        }
    }, [proposal?.id, supabase, updateProposal])

    return null // Invisible component purely for logic
}
