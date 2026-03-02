import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    // Vercel Cron Security Authentication
    const authHeader = req.headers.get('Authorization');
    if (
        process.env.NODE_ENV === 'production' &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Use Service Role to bypass RLS and perform admin updates
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const cutoffDate = sevenDaysAgo.toISOString();

        // Find workspaces where content is submitted but not approved for > 7 days
        // content_submission_status can be 'submitted' or 'approved' (if 'approved' but they never clicked "Final Complete Workspace")
        const { data: workspaces, error } = await supabase
            .from('workspaces')
            .select('id, original_proposal_id, original_proposal_type')
            .in('status', ['in_progress'])
            .in('content_submission_status', ['submitted', 'approved'])
            .not('content_submission_date', 'is', null)
            .lt('content_submission_date', cutoffDate);

        if (error) {
            console.error("Cron Query Error:", error);
            throw error;
        }

        if (!workspaces || workspaces.length === 0) {
            return NextResponse.json({ message: "No workspaces to auto-approve.", count: 0 });
        }

        const updates = [];
        for (const ws of workspaces) {
            if (!ws.original_proposal_id || !ws.original_proposal_type) continue;

            const now = new Date().toISOString();
            const payload = {
                status: 'completed',
                content_final_approved_at: now
            };

            if (ws.original_proposal_type === 'moment_proposal') {
                updates.push(supabase.from('moment_proposals').update(payload).eq('id', ws.original_proposal_id));
            } else if (ws.original_proposal_type === 'product_application') {
                updates.push(supabase.from('product_applications').update(payload).eq('id', ws.original_proposal_id));
            } else if (ws.original_proposal_type === 'campaign_application') {
                updates.push(supabase.from('campaign_applications').update(payload).eq('id', ws.original_proposal_id));
            }
        }

        await Promise.all(updates);

        return NextResponse.json({
            message: `Successfully auto-approved ${updates.length} workspaces.`,
            count: updates.length,
            processedIds: workspaces.map(w => w.id)
        });

    } catch (err: any) {
        console.error("Auto-approve cron error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
