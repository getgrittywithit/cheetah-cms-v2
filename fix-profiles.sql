-- Check what columns exist in profiles table
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';

-- Insert admin user with just the columns that exist
INSERT INTO profiles (id, email) 
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@cheetah.com')
ON CONFLICT (id) DO NOTHING;