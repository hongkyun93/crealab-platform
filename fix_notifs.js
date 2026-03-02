require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // DB에 텍스트 형태로 이미 굳어져 들어간 'undefined' 문자열을 실제 모먼트 이름으로 바꿔줍니다.
  const { data: notifs } = await supabase.from('notifications').select('*').ilike('content', '%undefined%');
  for (const n of notifs || []) {
      const momentId = n.reference_id;
      if (momentId) {
          const { data: momentData } = await supabase.from('life_moments').select('title').eq('id', momentId).single();
          if (momentData && momentData.title) {
              const newContent = n.content.replace("'undefined'", `'${momentData.title}'`);
              await supabase.from('notifications').update({ content: newContent }).eq('id', n.id);
              console.log(`Updated notif ${n.id} to: ${newContent}`);
          }
      }
  }
}
run();
