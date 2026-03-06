import fetch from 'node-fetch'
import dotenv from 'dotenv'
import fs from 'fs'
dotenv.config({ path: '.env.local' })

const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`

async function run() {
  try {
    const res = await fetch(url)
    const data = await res.json()
    // Dump it to a file so we can analyze it
    fs.writeFileSync('remote-schema.json', JSON.stringify(data, null, 2))
    
    // Quick summary
    const paths = Object.keys(data.paths)
    const tables = paths.filter(p => p.startsWith('/') && !p.startsWith('/rpc/')).map(p => p.slice(1))
    const rpcs = paths.filter(p => p.startsWith('/rpc/')).map(p => p.slice(5))
    
    console.log(`Found ${tables.length} tables/views and ${rpcs.length} RPCs.`)
    
    if (rpcs.includes('get_team_dashboard_summary')) {
        console.log("✅ get_team_dashboard_summary IS in the OpenAPI spec!")
    } else {
        console.log("❌ get_team_dashboard_summary is NOT in the OpenAPI spec!")
    }

    if (data.definitions?.moment_proposals?.properties?.creator_team_id) {
        console.log("✅ moment_proposals HAS creator_team_id!")
    } else {
        console.log("❌ moment_proposals lacks creator_team_id!")
    }
  } catch (e) {
    console.error(e)
  }
}
run()
