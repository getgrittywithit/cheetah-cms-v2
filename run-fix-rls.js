#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jvzqtyzblkvkrihtequd.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2enF0eXpibGt2a3JpaHRlcXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4MjQ0MywiZXhwIjoyMDY2OTU4NDQzfQ.lFrR3ygl_Wel0UpoHdJ4En2uJOd5vN4uPVlPUXsnlI0';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRLS() {
  console.log('🔧 Fixing RLS policies...\n');

  // Using supabase-js we can't run raw SQL directly, so let's use the REST API
  const queries = [
    `DROP POLICY IF EXISTS "Allow all operations on brand_profiles" ON brand_profiles`,
    `DROP POLICY IF EXISTS "Allow all operations on social_accounts" ON social_accounts`,
    `CREATE POLICY "Allow public read on brand_profiles" ON brand_profiles FOR SELECT USING (true)`,
    `CREATE POLICY "Allow public read on social_accounts" ON social_accounts FOR SELECT USING (true)`,
    `CREATE POLICY "Allow service role write on brand_profiles" ON brand_profiles FOR INSERT WITH CHECK (auth.role() = 'service_role')`,
    `CREATE POLICY "Allow service role write on social_accounts" ON social_accounts FOR INSERT WITH CHECK (auth.role() = 'service_role')`
  ];

  // Execute each query using fetch to the Supabase REST API
  const baseUrl = supabaseUrl.replace('.supabase.co', '.supabase.co/rest/v1/rpc');
  
  for (const query of queries) {
    console.log(`📝 Executing: ${query.substring(0, 50)}...`);
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        },
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) {
        console.log(`⚠️  Query might not be supported via REST API`);
      }
    } catch (error) {
      console.log(`⚠️  REST API query not available`);
    }
  }

  // Instead, let's test if we can update the RLS by checking current access
  console.log('\n🔍 Testing current access levels...');
  
  // Test with anon key
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2enF0eXpibGt2a3JpaHRlcXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODI0NDMsImV4cCI6MjA2Njk1ODQ0M30.Pyq00_qFaJUhl-Sldb7nSqR-kP3RREfiwOCGZ5NC-Pw';
  const supabaseAnon = createClient(supabaseUrl, anonKey);
  
  const { data: beforeData } = await supabaseAnon.from('brand_profiles').select('id, name');
  console.log('❓ Anon key access (before):', beforeData?.length || 0, 'brands');

  console.log('\n📋 Current brands in database:');
  const { data: brands } = await supabase.from('brand_profiles').select('id, name, created_at');
  if (brands) {
    brands.forEach(brand => {
      console.log(`  - ${brand.name} (ID: ${brand.id})`);
    });
  }

  console.log('\n⚠️  RLS policies need to be updated manually in Supabase SQL Editor.');
  console.log('📝 Please run the following SQL in your Supabase dashboard:\n');
  
  const sqlScript = `-- Fix RLS policies to allow reading brands
-- This will make brands publicly readable

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow all operations on brand_profiles" ON brand_profiles;
DROP POLICY IF EXISTS "Allow all operations on social_accounts" ON social_accounts;

-- Create new policies that allow public read
CREATE POLICY "Allow public read on brand_profiles" ON brand_profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on social_accounts" ON social_accounts
  FOR SELECT USING (true);

-- Optional: Keep write operations restricted
CREATE POLICY "Allow authenticated write on brand_profiles" ON brand_profiles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow authenticated write on social_accounts" ON social_accounts
  FOR INSERT WITH CHECK (auth.role() = 'service_role');`;

  console.log('```sql');
  console.log(sqlScript);
  console.log('```');
  
  console.log('\n🔗 Go to: https://jvzqtyzblkvkrihtequd.supabase.co/sql');
  console.log('📋 Copy and run the SQL above');
  console.log('🔄 Then refresh your Content tab - brands should appear!');
}

fixRLS().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('💥 Error:', error);
  process.exit(1);
});