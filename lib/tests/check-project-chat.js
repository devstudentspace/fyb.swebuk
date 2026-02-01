
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
  const { data, error } = await supabase
    .from('project_chat')
    .select('*')
    .limit(1);
    
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Sample Row:', data[0]);
    // If no row, we can't see columns easily without introspection, but error would tell us if table missing.
    // To check columns properly:
    const { error: insertError } = await supabase.from('project_chat').insert({
       project_id: '00000000-0000-0000-0000-000000000000', // Dummy
       user_id: '00000000-0000-0000-0000-000000000000',
       message: 'test',
       message_type: 'text',
       read_by: [] // Try inserting this
    });
    
    if (insertError) console.log('Insert Error (likely missing column):', insertError.message);
    else console.log('Insert with read_by accepted (but failed FK likely)');
  }
}

checkSchema();
