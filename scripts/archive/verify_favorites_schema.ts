
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFavoritesTable() {
    console.log('Checking if "favorites" table exists...');

    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('count', { count: 'exact', head: true });

        if (error) {
            if (error.code === '42P01') {
                console.log('Result: Table "favorites" does NOT exist yet.');
            } else {
                console.error('Result: Error accessing "favorites" table:', error.message, error.code);
            }
        } else {
            console.log('Result: Table "favorites" exists and is accessible.');

            // Test Insert/Delete
            console.log('Testing INSERT/DELETE operations...');
            // 1. Get a user
            const { data: users, error: userError } = await supabase.from('profiles').select('id').limit(1);
            if (userError || !users || users.length === 0) {
                console.warn('Cannot test insert: No users found in "profiles" table.');
                return;
            }
            const userId = users[0].id;
            console.log('Using User ID:', userId);

            // 2. Insert Favorite
            const targetId = 'test-target-id-' + Date.now();
            const targetType = 'product';

            const { data: insertData, error: insertError } = await supabase
                .from('favorites')
                .insert({ user_id: userId, target_id: targetId, target_type: targetType })
                .select()
                .single();

            if (insertError) {
                console.error('INSERT Failed:', insertError.message);
            } else {
                console.log('INSERT Success:', insertData);

                // 3. Delete Favorite
                const { error: deleteError } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('id', insertData.id);

                if (deleteError) {
                    console.error('DELETE Failed:', deleteError.message);
                } else {
                    console.log('DELETE Success');
                }
            }
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkFavoritesTable();
