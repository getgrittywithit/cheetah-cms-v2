-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user
INSERT INTO profiles (id, email, name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@cheetah.com', 'Admin User')
ON CONFLICT (id) DO NOTHING;