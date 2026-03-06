import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing service role key");

  const sql = `
-- Migration: Add missing name column to teams table
ALTER TABLE IF EXISTS public.teams 
ADD COLUMN IF NOT EXISTS name text;

UPDATE public.teams SET name = slug WHERE name IS NULL;
ALTER TABLE public.teams ALTER COLUMN name SET NOT NULL;
  `;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  });

  if (res.ok) {
    console.log("Migration applied successfully.");
  } else {
    console.error("Migration failed:", await res.text());
  }
}
run();
