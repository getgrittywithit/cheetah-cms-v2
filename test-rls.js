#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Test with both anon and service keys
const supabaseUrl = 'https://jvzqtyzblkvkrihtequd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2enF0eXpibGt2a3JpaHRlcXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODI0NDMsImV4cCI6MjA2Njk1ODQ0M30.Pyq00_qFaJUhl-Sldb7nSqR-kP3RREfiwOCGZ5NC-Pw';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2enF0eXpibGt2a3JpaHRlcXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4MjQ0MywiZXhwIjoyMDY2OTU4NDQzfQ.lFrR3ygl_Wel0UpoHdJ4En2uJOd5vN4uPVlPUXsnlI0';

async function testRLS() {
  console.log('🔍 Testing RLS with different keys...\n');

  // Test with anon key
  console.log('1️⃣ Testing with ANON key:');
  const supabaseAnon = createClient(supabaseUrl, anonKey);
  
  const { data: anonData, error: anonError } = await supabaseAnon
    .from('brand_profiles')
    .select('id, name')
    .limit(5);
  
  if (anonError) {
    console.log('❌ Anon key error:', anonError.message);
  } else {
    console.log('✅ Anon key returned:', anonData?.length || 0, 'brands');
    if (anonData?.length) {
      console.log('   Brands:', anonData.map(b => b.name));
    }
  }

  console.log('\n2️⃣ Testing with SERVICE ROLE key:');
  const supabaseService = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  const { data: serviceData, error: serviceError } = await supabaseService
    .from('brand_profiles')
    .select('id, name')
    .limit(5);
  
  if (serviceError) {
    console.log('❌ Service key error:', serviceError.message);
  } else {
    console.log('✅ Service key returned:', serviceData?.length || 0, 'brands');
    if (serviceData?.length) {
      console.log('   Brands:', serviceData.map(b => b.name));
    }
  }

  console.log('\n3️⃣ Testing the exact query from the API:');
  const { data: fullData, error: fullError } = await supabaseService
    .from('brand_profiles')
    .select(`
      *,
      social_accounts (*)
    `)
    .order('created_at', { ascending: false });
  
  if (fullError) {
    console.log('❌ Full query error:', fullError.message);
  } else {
    console.log('✅ Full query returned:', fullData?.length || 0, 'brands');
  }

  console.log('\n📊 Summary:');
  console.log('- If anon key returns 0 but service key returns data: RLS is blocking');
  console.log('- If both return 0: Database connection or table issue');
  console.log('- If both return data: The API is not using service key properly');
}

testRLS().then(() => {
  console.log('\n✅ Test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});