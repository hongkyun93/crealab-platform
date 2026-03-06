import { supabase, CREATORS } from './seed-ir-data'

// The team ID for "CreadyPick"
const CREADYPICK_TEAM_ID = '8c998fdd-1f3b-47e0-8711-79a760460089'

async function seed() {
  console.log(`Starting to insert ${CREATORS.length} creators...`)
  let successCount = 0
  let errorCount = 0

  for (const c of CREATORS) {
    const email = `mock_${c.instagram_handle.replace(/[^a-zA-Z0-9]/g, '')}@mock.creadypick.com`
    
    const profilePayload = {
      email: email,
      display_name: c.display_name,
      instagram_handle: c.instagram_handle,
      role: 'creator',
      is_mock: true,
      description: c.description,
      tags: c.tags,
      followers_count: c.followers_count,
      price_video: c.price_video,
      price_feed: c.price_feed,
      price_story: c.price_story,
      primary_region: c.primary_region,
    }

    // Since upsert without PK fails, let's select first
    const { data: existingProfiles, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      
    if (selectError) {
      console.error(`Error checking profile for ${c.display_name}:`, selectError.message)
      errorCount++
      continue
    }

    let profileId: string;

    if (existingProfiles && existingProfiles.length > 0) {
      // Update existing
      profileId = existingProfiles[0].id;
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profilePayload)
        .eq('id', profileId)

      if (updateError) {
        console.error(`Error updating profile for ${c.display_name}:`, updateError.message)
        errorCount++
        continue
      }
    } else {
      // Create auth user first to get a valid UUID for profiles (due to FK constraint on auth.users generally)
      // Actually, if profiles doesn't strictly enforce auth.users FK, we can generate a UUID.
      // But typically profiles.id references auth.users.id
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'password123',
        email_confirm: true,
      })
      
      if (authError && authError.message !== 'User already registered') {
         console.error(`Error creating auth user for ${c.display_name}:`, authError.message)
         errorCount++
         continue
      }
      
      // If user exists in auth (but not profile), fetch the auth user
      let userId = authData?.user?.id
      if (!userId) {
         const { data: existingAuthUsers } = await supabase.auth.admin.listUsers()
         const matchedUser = existingAuthUsers.users.find(u => u.email === email)
         if (matchedUser) userId = matchedUser.id
         else {
           console.error(`Could not derive auth user ID for ${c.display_name}`)
           errorCount++
           continue
         }
      }

      profileId = userId!
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: profileId, ...profilePayload })

      if (insertError) {
        console.error(`Error inserting profile for ${c.display_name}:`, insertError.message)
        errorCount++
        continue
      }
    }

    // Now assign this creator to the CreadyPick team
    const { error: teamCheckError, data: existingTeamMembers } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', CREADYPICK_TEAM_ID)
      .eq('user_id', profileId)

    if (!existingTeamMembers || existingTeamMembers.length === 0) {
       const { error: teamError } = await supabase
         .from('team_members')
         .insert({
           team_id: CREADYPICK_TEAM_ID,
           user_id: profileId,
           role: 'member'
         })
         
       if (teamError) {
         console.error(`Error adding ${c.display_name} to CreadyPick team:`, teamError.message)
       } else {
         successCount++
       }
    } else {
       // Already in team
       successCount++
    }
  }

  console.log(`Done! Profiles inserted/updated and assigned to team: ${successCount}. Errors: ${errorCount}`)
}

seed()
