const fs = require('fs');
const path = './supabase/migrations/00_master_schema_v6.sql';
let sql = fs.readFileSync(path, 'utf8');

// Revert invalid PostgreSQL syntax
sql = sql.replace(/ADD CONSTRAINT IF NOT EXISTS/g, 'ADD CONSTRAINT');

// Revert other unnecessary IF NOT EXISTS since we already do DROP SCHEMA CASCADE
sql = sql.replace(/CREATE TABLE IF NOT EXISTS/g, 'CREATE TABLE');
sql = sql.replace(/CREATE OR REPLACE FUNCTION/g, 'CREATE FUNCTION');
sql = sql.replace(/CREATE TYPE IF NOT EXISTS/g, 'CREATE TYPE');

fs.writeFileSync(path, sql, 'utf8');
console.log('Fixed invalid syntax in 00_master_schema_v6.sql');
