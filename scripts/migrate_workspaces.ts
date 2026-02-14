
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL; // Try standard env vars

    if (!connectionString) {
        console.error('Error: DATABASE_URL or POSTGRES_URL environment variable is not set locally.');
        console.log('Please insure .env.local exists and contains the connection string.');
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase/many cloud DBs
    });

    try {
        console.log('Connecting to database...');
        await client.connect();

        // The SQL file path relative to this script
        // Note: The SQL file is in the artifact directory, but I will embed the SQL content directly here to avoid path issues
        // since I cannot reliably access the artifact path from this script execution context if files move.
        // Wait, I can pass the content via the write_to_file content.
        // Let's execute the SQL string directly.

        const sql = `
-- 1. Create Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    brand_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    origin_type TEXT NOT NULL CHECK (origin_type IN ('campaign', 'direct', 'moment')),
    origin_id TEXT NOT NULL,
    
    status TEXT NOT NULL DEFAULT 'active',
    
    project_name TEXT,
    project_avatar TEXT,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(origin_type, origin_id)
);

-- 2. Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Workspaces viewable by participants" ON public.workspaces;
CREATE POLICY "Workspaces viewable by participants" ON public.workspaces
    FOR SELECT USING (auth.uid() = brand_id OR auth.uid() = creator_id);

-- 4. Sync Function
CREATE OR REPLACE FUNCTION public.sync_proposal_to_workspace()
RETURNS TRIGGER AS $$
DECLARE
    ws_status TEXT;
    p_name TEXT;
    p_avatar TEXT;
    b_id UUID;
    c_id UUID;
BEGIN
    IF NEW.status IN ('rejected', 'cancelled', 'applied', 'pending') THEN
        RETURN NEW;
    END IF;

    ws_status := CASE 
        WHEN NEW.status = 'completed' THEN 'completed'
        WHEN NEW.status IN ('offered', 'negotiating') THEN 'negotiating'
        ELSE 'active'
    END;

    IF TG_TABLE_NAME = 'campaign_proposals' THEN
        SELECT brand_id INTO b_id FROM public.campaigns WHERE id = NEW.campaign_id;
        c_id := NEW.influencer_id;
        
        -- Get Campaign Info
        SELECT title INTO p_name FROM public.campaigns WHERE id = NEW.campaign_id;
        SELECT avatar_url INTO p_avatar FROM public.profiles WHERE id = b_id;
        
    ELSIF TG_TABLE_NAME = 'moment_proposals' THEN
        b_id := NEW.brand_id;
        c_id := NEW.influencer_id;
        SELECT title INTO p_name FROM public.life_moments WHERE id = NEW.moment_id;
        SELECT avatar_url INTO p_avatar FROM public.profiles WHERE id = b_id;

    ELSIF TG_TABLE_NAME = 'brand_proposals' THEN
        b_id := NEW.brand_id;
        c_id := NEW.influencer_id;
        p_name := NEW.product_name;
        SELECT avatar_url INTO p_avatar FROM public.profiles WHERE id = b_id;
    END IF;

    -- Upsert Workspace
    INSERT INTO public.workspaces (
        brand_id, creator_id, origin_type, origin_id, status, project_name, project_avatar, updated_at
    ) VALUES (
        b_id, c_id, 
        CASE 
            WHEN TG_TABLE_NAME = 'campaign_proposals' THEN 'campaign'
            WHEN TG_TABLE_NAME = 'brand_proposals' THEN 'direct'
            WHEN TG_TABLE_NAME = 'moment_proposals' THEN 'moment'
        END,
        NEW.id::text,
        ws_status,
        p_name,
        p_avatar,
        NOW()
    )
    ON CONFLICT (origin_type, origin_id) DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create Triggers
DROP TRIGGER IF EXISTS tr_sync_cw_campaign ON public.campaign_proposals;
CREATE TRIGGER tr_sync_cw_campaign
    AFTER INSERT OR UPDATE ON public.campaign_proposals
    FOR EACH ROW EXECUTE FUNCTION public.sync_proposal_to_workspace();

DROP TRIGGER IF EXISTS tr_sync_cw_brand ON public.brand_proposals;
CREATE TRIGGER tr_sync_cw_brand
    AFTER INSERT OR UPDATE ON public.brand_proposals
    FOR EACH ROW EXECUTE FUNCTION public.sync_proposal_to_workspace();

DROP TRIGGER IF EXISTS tr_sync_cw_moment ON public.moment_proposals;
CREATE TRIGGER tr_sync_cw_moment
    AFTER INSERT OR UPDATE ON public.moment_proposals
    FOR EACH ROW EXECUTE FUNCTION public.sync_proposal_to_workspace();

-- 6. Backfill
DO $$
BEGIN
    UPDATE public.campaign_proposals SET updated_at = updated_at WHERE status IN ('accepted', 'started', 'completed', 'negotiating');
    UPDATE public.brand_proposals SET updated_at = updated_at WHERE status IN ('offered', 'negotiating', 'accepted', 'completed');
    UPDATE public.moment_proposals SET updated_at = updated_at WHERE status IN ('offered', 'negotiating', 'accepted', 'completed');
END $$;
    `;

        console.log('Running migration SQL...');
        await client.query(sql);
        console.log('Migration completed successfully.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
