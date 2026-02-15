
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkEvents() {
    console.log('Checking influencer_events table...')

    const { count, error } = await supabase
        .from('influencer_events')
        .select('*', { count: 'exact', head: true })

    if (error) {
        console.error('Error fetching events:', error)
        return
    }

    console.log(`Total events in DB (Service Role): ${count}`)

    if (count === 0) {
        console.log('Use seed script to generate data.')
    } else {
        // Fetch a sample to see status
        const { data: sample, error: sampleError } = await supabase
            .from('influencer_events')
            .select('id, title, status, influencer_id, is_private, created_at')
            .limit(5)

        if (sampleError) {
            console.error('Error fetching sample:', sampleError)
        } else {
            console.log('Sample events:', sample)
        }
    }
}

checkEvents()
