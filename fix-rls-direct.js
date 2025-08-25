#!/usr/bin/env node

const { Client } = require('pg');

async function fixRLS() {
  // Create connection with the pooler URL
  const connectionString = 'postgresql://postgres.jvzqtyzblkvkrihtequd:$kSfqdgVM9jMf3!Y@aws-0-us-east-2.pooler.supabase.com:5432/postgres';
  
  const client = new Client({
    connectionString: connectionString
  });

  try {
    console.log('🔌 Connecting to Supabase via pooler...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // First, check current RLS status
    console.log('📊 Checking current RLS status...');
    const rlsCheck = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('brand_profiles', 'social_accounts')
    `);
    
    console.log('Current RLS status:');
    rlsCheck.rows.forEach(row => {
      console.log(`  - ${row.tablename}: RLS ${row.rowsecurity ? 'ENABLED' : 'DISABLED'}`);
    });

    // Drop existing policies
    console.log('\n🗑️  Dropping existing policies...');
    try {
      await client.query(`DROP POLICY IF EXISTS "Allow all operations on brand_profiles" ON brand_profiles`);
      await client.query(`DROP POLICY IF EXISTS "Allow all operations on social_accounts" ON social_accounts`);
      console.log('✅ Old policies dropped');
    } catch (err) {
      console.log('⚠️  No existing policies to drop');
    }

    // Create new policies for public read access
    console.log('\n📝 Creating new RLS policies...');
    
    await client.query(`
      CREATE POLICY "Allow public read on brand_profiles" 
      ON brand_profiles 
      FOR SELECT 
      USING (true)
    `);
    console.log('✅ Created public read policy for brand_profiles');

    await client.query(`
      CREATE POLICY "Allow public read on social_accounts" 
      ON social_accounts 
      FOR SELECT 
      USING (true)
    `);
    console.log('✅ Created public read policy for social_accounts');

    // Add write restrictions (optional)
    await client.query(`
      CREATE POLICY "Allow service role write on brand_profiles" 
      ON brand_profiles 
      FOR INSERT 
      WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
    `);
    
    await client.query(`
      CREATE POLICY "Allow service role write on social_accounts" 
      ON social_accounts 
      FOR INSERT 
      WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
    `);
    console.log('✅ Created write policies for service role only');

    // Verify the brands are accessible
    console.log('\n🔍 Verifying brands are accessible...');
    const brands = await client.query(`
      SELECT b.id, b.name, COUNT(s.id) as social_accounts_count
      FROM brand_profiles b
      LEFT JOIN social_accounts s ON b.id = s.brand_profile_id
      GROUP BY b.id, b.name
      ORDER BY b.created_at DESC
    `);

    console.log('\n✅ Brands in database:');
    brands.rows.forEach(brand => {
      console.log(`  - ${brand.name} (${brand.social_accounts_count} social accounts)`);
    });

    console.log('\n🎉 RLS policies fixed successfully!');
    console.log('🔄 Please refresh your Content tab - brands should now appear!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('password')) {
      console.log('\n⚠️  Password authentication failed.');
      console.log('The password might need to be escaped differently.');
    }
  } finally {
    await client.end();
    console.log('\n🔌 Connection closed');
  }
}

// Install pg if needed
const { exec } = require('child_process');
exec('npm list pg', (error, stdout) => {
  if (error) {
    console.log('📦 Installing pg package...');
    exec('npm install pg', (installError) => {
      if (!installError) {
        fixRLS();
      } else {
        console.error('Failed to install pg:', installError);
      }
    });
  } else {
    fixRLS();
  }
});