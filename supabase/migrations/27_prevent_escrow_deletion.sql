-- Migration 27: Prevent Hard Deletion of Active Escrow Workspaces & Proposals
-- Prevents leaving orphaned settlements without refunding the brand deposit.

CREATE OR REPLACE FUNCTION public.fn_prevent_delete_with_escrow()
RETURNS trigger AS $$
DECLARE
    v_prop_type text;
    v_prop_id text;
BEGIN
    -- Determine the proposal type and ID based on the table being deleted from
    IF TG_TABLE_NAME = 'product_applications' THEN
        v_prop_type   := 'product_application';
        v_prop_id     := OLD.id::text;
    ELSIF TG_TABLE_NAME = 'moment_proposals' THEN
        v_prop_type   := 'moment_proposal';
        v_prop_id     := OLD.id::text;
    ELSIF TG_TABLE_NAME = 'campaign_applications' THEN
        v_prop_type   := 'campaign_application';
        v_prop_id     := OLD.id::text;
    ELSIF TG_TABLE_NAME = 'workspaces' THEN
        v_prop_type   := OLD.original_proposal_type;
        v_prop_id     := OLD.original_proposal_id::text;
    END IF;

    -- If we couldn't determine the type/id (e.g., malformed workspace row), just let it delete to prevent blocking cleanup of bad data
    IF v_prop_type IS NULL OR v_prop_id IS NULL THEN
        RETURN OLD;
    END IF;

    -- Check if there is an active escrow settlement attached to this proposal
    IF EXISTS (
        SELECT 1 FROM public.settlements 
        WHERE proposal_id = v_prop_id 
          AND proposal_type = v_prop_type 
          AND status = 'escrow'
    ) THEN
        RAISE EXCEPTION 'Cannot delete % (ID: %) because it has an active escrow settlement. Please change its status to "canceled" first to process the refund.', TG_TABLE_NAME, OLD.id;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply BEFORE DELETE triggers to all relevant tables

DROP TRIGGER IF EXISTS trg_prevent_delete_product_apps ON public.product_applications;
CREATE TRIGGER trg_prevent_delete_product_apps
    BEFORE DELETE ON public.product_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_prevent_delete_with_escrow();

DROP TRIGGER IF EXISTS trg_prevent_delete_moment_props ON public.moment_proposals;
CREATE TRIGGER trg_prevent_delete_moment_props
    BEFORE DELETE ON public.moment_proposals
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_prevent_delete_with_escrow();

DROP TRIGGER IF EXISTS trg_prevent_delete_campaign_apps ON public.campaign_applications;
CREATE TRIGGER trg_prevent_delete_campaign_apps
    BEFORE DELETE ON public.campaign_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_prevent_delete_with_escrow();

DROP TRIGGER IF EXISTS trg_prevent_delete_workspaces ON public.workspaces;
CREATE TRIGGER trg_prevent_delete_workspaces
    BEFORE DELETE ON public.workspaces
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_prevent_delete_with_escrow();
