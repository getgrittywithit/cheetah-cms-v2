#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jvzqtyzblkvkrihtequd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2enF0eXpibGt2a3JpaHRlcXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4MjQ0MywiZXhwIjoyMDY2OTU4NDQzfQ.lFrR3ygl_Wel0UpoHdJ4En2uJOd5vN4uPVlPUXsnlI0';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugApi() {
  try {
    console.log('🔍 Testing the exact same query as the API...');
    
    // This is the exact query from src/app/api/brands/route.ts:53-59
    const { data: dbBrands, error } = await supabase
      .from('brand_profiles')
      .select(`
        *,
        social_accounts (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    console.log('✅ Raw database response:');
    console.log(JSON.stringify(dbBrands, null, 2));
    
    console.log('\n📊 Brand count:', dbBrands?.length || 0);
    
    if (dbBrands && dbBrands.length > 0) {
      console.log('\n🏷️ Brand names:', dbBrands.map(b => b.name));
    }

  } catch (error) {
    console.error('💥 Debug failed:', error);
  }
}

debugApi().then(() => {
  console.log('\n🎉 Debug completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});