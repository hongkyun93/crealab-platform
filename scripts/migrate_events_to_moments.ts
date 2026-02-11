import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateEventsToMoments() {
    console.log('🚀 Starting migration from influencer_events to life_moments...')

    try {
        // 1. Fetch all data from influencer_events
        const { data: events, error: fetchError } = await supabase
            .from('influencer_events')
            .select('*')
            .order('created_at', { ascending: true })

        if (fetchError) {
            console.error('❌ Error fetching influencer_events:', fetchError)
            return
        }

        if (!events || events.length === 0) {
            console.log('✅ No data to migrate from influencer_events')
            return
        }

        console.log(`📊 Found ${events.length} events to migrate`)

        // 2. Check for existing records in life_moments to avoid duplicates
        const { data: existingMoments, error: checkError } = await supabase
            .from('life_moments')
            .select('id, influencer_id, title, created_at')

        if (checkError) {
            console.error('❌ Error checking life_moments:', checkError)
            return
        }

        const existingSet = new Set(
            (existingMoments || []).map(m => `${m.influencer_id}-${m.title}-${m.created_at}`)
        )

        // 3. Map influencer_events to life_moments format
        const momentsToInsert = events
            .filter(event => {
                const key = `${event.influencer_id}-${event.title}-${event.created_at}`
                return !existingSet.has(key)
            })
            .map(event => ({
                // Common fields
                influencer_id: event.influencer_id,
                title: event.title,
                description: event.description,
                target_product: event.target_product,
                event_date: event.event_date,
                posting_date: event.posting_date,
                category: event.category,
                tags: event.tags,
                is_verified: event.is_verified,
                status: event.status,
                is_mock: event.is_mock,
                is_private: event.is_private,
                schedule: event.schedule || {},
                guide: event.guide,
                created_at: event.created_at,
                updated_at: event.updated_at,

                // life_moments specific fields (set defaults)
                name: null,
                icon: null,
                price_video: null,

                // Note: date_flexible from influencer_events is NOT migrated
                // because life_moments doesn't have this column
            }))

        if (momentsToInsert.length === 0) {
            console.log('✅ All events already exist in life_moments (no duplicates to insert)')
            return
        }

        console.log(`📝 Inserting ${momentsToInsert.length} new moments...`)

        // 4. Insert in batches to avoid timeout
        const batchSize = 100
        let inserted = 0

        for (let i = 0; i < momentsToInsert.length; i += batchSize) {
            const batch = momentsToInsert.slice(i, i + batchSize)

            const { data, error: insertError } = await supabase
                .from('life_moments')
                .insert(batch)
                .select()

            if (insertError) {
                console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, insertError)
                console.error('   Details:', insertError.message)
                continue
            }

            inserted += batch.length
            console.log(`✅ Inserted batch ${i / batchSize + 1}: ${batch.length} records (Total: ${inserted}/${momentsToInsert.length})`)
        }

        console.log(`\n🎉 Migration complete!`)
        console.log(`   - Total events in influencer_events: ${events.length}`)
        console.log(`   - Already existed in life_moments: ${events.length - momentsToInsert.length}`)
        console.log(`   - Newly inserted: ${inserted}`)
        console.log(`\n⚠️  Note: 'date_flexible' column from influencer_events was NOT migrated`)
        console.log(`   because life_moments table doesn't have this column.`)

    } catch (error) {
        console.error('❌ Migration failed:', error)
    }
}

// Run migration
migrateEventsToMoments()
    .then(() => {
        console.log('\n✅ Script completed')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error)
        process.exit(1)
    })
