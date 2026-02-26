import re
import os

filepath = '/Users/kimhongkyun/Crealab/crealab-platform/supabase/migrations/00_master_schema_v6.sql'
with open(filepath, 'r') as f:
    content = f.read()

# 1. CREATE TABLE -> CREATE TABLE IF NOT EXISTS
content = re.sub(r'CREATE TABLE(?!\s+IF NOT EXISTS)', 'CREATE TABLE IF NOT EXISTS', content)

# 2. CREATE INDEX -> CREATE INDEX IF NOT EXISTS
content = re.sub(r'CREATE INDEX(?!\s+IF NOT EXISTS)', 'CREATE INDEX IF NOT EXISTS', content)

# 3. CREATE UNIQUE INDEX -> CREATE UNIQUE INDEX IF NOT EXISTS
content = re.sub(r'CREATE UNIQUE INDEX(?!\s+IF NOT EXISTS)', 'CREATE UNIQUE INDEX IF NOT EXISTS', content)

# 4. CREATE TYPE public.user_role AS ENUM -> DO $$ BEGIN CREATE TYPE...
def replace_enum(match):
    type_name = match.group(1)
    enum_values = match.group(2)
    return f"""DO $$ BEGIN
    CREATE TYPE {type_name} AS ENUM ({enum_values});
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;"""

content = re.sub(r'CREATE TYPE ([a-zA-Z0-9_\.]+) AS ENUM \((.*?)\);', replace_enum, content, flags=re.DOTALL)

# 5. CREATE FUNCTION -> CREATE OR REPLACE FUNCTION
content = re.sub(r'CREATE FUNCTION(?!\s+IF NOT EXISTS)', 'CREATE OR REPLACE FUNCTION', content)

# 6. ALTER TABLE ADD CONSTRAINT
def replace_constraint(match):
    full_statement = match.group(0)
    return f"""DO $$ BEGIN
    {full_statement}
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN duplicate_table THEN null;
    WHEN invalid_table_definition THEN null;
END $$;"""

content = re.sub(r'ALTER TABLE ONLY [^;]+ ADD CONSTRAINT [^;]+;', replace_constraint, content)

# 7. ALTER TABLE ... OWNER TO (ignore errors)
def replace_owner(match):
    full_statement = match.group(0)
    return f"""DO $$ BEGIN
    {full_statement}
EXCEPTION
    WHEN others THEN null;
END $$;"""

content = re.sub(r'ALTER TABLE [^\n]+ OWNER TO [^\n]+;', replace_owner, content)

# 8. CREATE TRIGGER (drop if exists first)
def replace_trigger(match):
    trigger_name = match.group(1)
    table_name = match.group(2)
    full_statement = match.group(0)
    return f"""DROP TRIGGER IF EXISTS {trigger_name} ON {table_name};
{full_statement}"""

content = re.sub(r'CREATE TRIGGER "?([a-zA-Z0-9_]+)"? (?:BEFORE|AFTER|INSTEAD OF) [^;]+ ON ([^\s]+) [^;]+;', replace_trigger, content)

# 9. CREATE POLICY (drop if exists first)
def replace_policy(match):
    policy_name = match.group(1)
    table_name = match.group(2)
    full_statement = match.group(0)
    return f"""DROP POLICY IF EXISTS {policy_name} ON {table_name};
{full_statement}"""

content = re.sub(r'CREATE POLICY ("?[a-zA-Z0-9_\s-]+"?) ON ([^\s]+) [^;]+;', replace_policy, content)

out_filepath = '/Users/kimhongkyun/Crealab/crealab-platform/supabase/migrations/00_master_schema_v6_safe.sql'
with open(out_filepath, 'w') as f:
    f.write(content)

print("Successfully created idempotent SQL file.")
