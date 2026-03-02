const fs = require('fs');
const path = './supabase/migrations/00_master_schema_v6.sql';
let sql = fs.readFileSync(path, 'utf8');

// Remove references to creator_team_id and brand_team_id
// 1. Remove from triggers (set_proposal_team_ids logic)
sql = sql.replace(/IF TG_TABLE_NAME = 'campaign_proposals'[\s\S]*?END IF;/g, '');
sql = sql.replace(/IF TG_TABLE_NAME = 'brand_proposals'[\s\S]*?END IF;/g, '');
sql = sql.replace(/IF TG_TABLE_NAME = 'moment_proposals' THEN[\s\S]*?IF NEW\.brand_id IS NOT NULL AND NEW\.brand_team_id IS NULL THEN[\s\S]*?NEW\.brand_team_id := \([\s\S]*?SELECT team_id FROM public\.team_members[\s\S]*?WHERE user_id = NEW\.brand_id[\s\S]*?LIMIT 1[\s\S]*?\);[\s\S]*?END IF;[\s\S]*?END IF;/g, '');


// 2. Remove columns
sql = sql.replace(/    creator_team_id uuid,/g, '');
sql = sql.replace(/    brand_team_id uuid,/g, '');

// 3. Remove INDEXES
sql = sql.replace(/CREATE INDEX idx_brand_proposals_creator_team_id[\s\S]*?;/g, '');
sql = sql.replace(/CREATE INDEX idx_campaign_applications_creator_team_id[\s\S]*?;/g, '');
sql = sql.replace(/-- Name: idx_brand_proposals_creator_team_id[\s\S]*?--/g, '');
sql = sql.replace(/-- Name: idx_campaign_applications_creator_team_id[\s\S]*?--/g, '');

// 4. Remove FK CONSTRAINTS
sql = sql.replace(/ALTER TABLE ONLY public\.product_applications\n\s*ADD CONSTRAINT brand_proposals_creator_team_id_fkey[\s\S]*?;/g, '');
sql = sql.replace(/ALTER TABLE ONLY public\.campaign_applications\n\s*ADD CONSTRAINT campaign_applications_creator_team_id_fkey[\s\S]*?;/g, '');
sql = sql.replace(/ALTER TABLE ONLY public\.moment_proposals\n\s*ADD CONSTRAINT moment_proposals_creator_team_id_fkey[\s\S]*?;/g, '');
sql = sql.replace(/-- Name: product_applications brand_proposals_creator_team_id_fkey[\s\S]*?--/g, '');
sql = sql.replace(/-- Name: campaign_applications campaign_applications_creator_team_id_fkey[\s\S]*?--/g, '');
sql = sql.replace(/-- Name: moment_proposals moment_proposals_creator_team_id_fkey[\s\S]*?--/g, '');


// 5. Remove RLS POLICIES (Simplifying the policies to remove the team_id checks since they don't exist anymore on these tables)
sql = sql.replace(/OR \(brand_team_id IN \( SELECT public\.get_user_team_ids\(auth\.uid\(\)\) AS get_user_team_ids\)\)/g, '');
sql = sql.replace(/OR \(creator_team_id IN \( SELECT public\.get_user_team_ids\(auth\.uid\(\)\) AS get_user_team_ids\)\)/g, '');

fs.writeFileSync(path, sql, 'utf8');
console.log('Fixed creator_team_id and brand_team_id errors');
