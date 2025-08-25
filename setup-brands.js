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

async function setupBrands() {
  try {
    console.log('🚀 Setting up brands...');
    
    // Check if brands already exist
    const { data: existingBrands, error: checkError } = await supabase
      .from('brand_profiles')
      .select('id, name')
      .limit(5);
    
    if (checkError) {
      console.error('❌ Error checking existing brands:', checkError);
      return;
    }

    console.log('📊 Existing brands:', existingBrands);

    if (existingBrands && existingBrands.length > 0) {
      console.log('✅ Brands already exist:', existingBrands.map(b => b.name).join(', '));
      return;
    }

    // Create Daily Dish Dash brand
    console.log('📝 Creating Daily Dish Dash brand...');
    const { data: dailyDishBrand, error: dailyDishError } = await supabase
      .from('brand_profiles')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        name: 'Daily Dish Dash',
        description: 'Quick, delicious recipes and food inspiration for busy people',
        industry: 'Food & Cooking',
        target_audience: 'Busy professionals and home cooks looking for quick, tasty meal solutions',
        tone_of_voice: 'Friendly, helpful, and enthusiastic about food',
        brand_personality: ['Approachable', 'Encouraging', 'Practical', 'Food-passionate'],
        primary_color: '#FF6B6B',
        secondary_color: '#4ECDC4',
        tagline: 'Quick meals made simple',
        unique_value_proposition: 'Create content for Daily Dish Dash, focusing on quick, delicious, and accessible recipes for busy people',
        is_default: true
      })
      .select()
      .single();

    if (dailyDishError) {
      console.error('❌ Error creating Daily Dish Dash:', dailyDishError);
      return;
    }

    console.log('✅ Created Daily Dish Dash brand:', dailyDishBrand.id);

    // Create Facebook social account
    console.log('📱 Creating Facebook social account...');
    const { error: facebookError } = await supabase
      .from('social_accounts')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        brand_profile_id: dailyDishBrand.id,
        platform: 'facebook',
        account_handle: 'dailydishdash',
        access_token: 'EAAXBvf0ZCpwgBO3jkghS2RwN7MXTXckeKyZAqK7ZB14ar2mWavmv7jZBcIv9wZBDzXZB6HwTD4ZCWj5YBDubNZCkKrgmsrs6z60C173aexpXosO0OZAPgZCE9zRQlDt5veSoTJ9o8nmby5LTamNdk3hgXnTv1ogb47Rg9b6bxGQFlQiJsP3flT2Jik6BAsdcUHpN1d2WpZARLfq8DGZCZA7dl4VCV',
        account_id: '605708122630363',
        is_active: true,
        posting_enabled: true
      });

    if (facebookError) {
      console.error('❌ Error creating Facebook account:', facebookError);
    } else {
      console.log('✅ Created Facebook social account');
    }

    // Create Instagram social account
    console.log('📱 Creating Instagram social account...');
    const { error: instagramError } = await supabase
      .from('social_accounts')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        brand_profile_id: dailyDishBrand.id,
        platform: 'instagram',
        account_handle: 'dailydishdash',
        access_token: '',
        account_id: 'dailydishdash',
        is_active: false,
        posting_enabled: false
      });

    if (instagramError) {
      console.error('❌ Error creating Instagram account:', instagramError);
    } else {
      console.log('✅ Created Instagram social account');
    }

    // Verify the setup
    console.log('🔍 Verifying setup...');
    const { data: verifyBrands, error: verifyError } = await supabase
      .from('brand_profiles')
      .select(`
        *,
        social_accounts (*)
      `)
      .eq('name', 'Daily Dish Dash');

    if (verifyError) {
      console.error('❌ Error verifying setup:', verifyError);
    } else {
      console.log('✅ Setup complete! Brand created with social accounts:');
      console.log(JSON.stringify(verifyBrands, null, 2));
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupBrands().then(() => {
  console.log('🎉 Brand setup completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Setup failed:', error);
  process.exit(1);
});