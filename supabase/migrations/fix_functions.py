import re

with open('00_master_schema_v6.sql', 'r') as f:
    content = f.read()

# Make tables non-destructive
content = re.sub(r'CREATE TABLE (?!IF NOT EXISTS)', 'CREATE TABLE IF NOT EXISTS ', content)
# Make types non-destructive (PostgreSQL 12+)
content = re.sub(r'CREATE TYPE (?!.*?\sAS\s)(\w+)\.(\w+) AS', r'''DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '\2') THEN
        CREATE TYPE \1.\2 AS
    END IF;
END$$;
''', content)

# A simpler approach for types that works in Supabase:
content = re.sub(r'CREATE TYPE public\.(\w+) AS ENUM \((.*?)\);', r'''
DO $$ BEGIN
    CREATE TYPE public.\1 AS ENUM (\2);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
''', content, flags=re.DOTALL)

with open('00_master_schema_v6_safe.sql', 'w') as f:
    f.write(content)
