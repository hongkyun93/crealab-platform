---
description: After modifying any Supabase table interactions (insert/update/select) or adding new DB columns, run the DB column audit to catch mismatches early.
---

# DB Column Audit Workflow

Run this workflow whenever you modify code that interacts with Supabase tables, or when adding/removing database columns.

## Steps

// turbo-all

1. Run the DB column audit script:
```bash
cd /Users/kimhongkyun/Crealab/crealab-platform && npm run audit:db
```

2. If the audit reports mismatches:
   - For **columns used in code but missing from DB**: Either add the column to the master schema (`supabase/migrations/00_master_schema_v4.sql`) and create a migration, OR remove the column reference from the code.
   - For **RPC warnings**: Update the `get_current_user_info()` function in Supabase SQL Editor to include the missing fields.

3. After fixing, run the audit again to verify all issues are resolved.

4. Run `npm run build` to verify the build still succeeds.

## When to Run
- After adding new fields to any Supabase table
- After adding new `.from('table').insert()` or `.update()` calls  
- After modifying the `get_current_user_info()` RPC
- After modifying `SettingsView.tsx` or any provider that reads user data
- Before committing changes that touch database interaction code
