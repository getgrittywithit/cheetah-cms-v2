# Supabase Connection Guide for Claude

This guide explains how to connect to Supabase databases using various methods, including direct connections, poolers, and API clients.

## Connection Methods

### 1. PostgreSQL Direct Connection (psql)

When connecting to Supabase PostgreSQL databases, you'll receive a connection string like:
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

**Important**: Passwords with special characters must be URL-encoded in connection strings:
- `$` → `%24`
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `*` → `%2A`

#### Connection Types

**1. Direct Connection (IPv6)**
```bash
# Example: postgresql://postgres:[PASSWORD]@db.projectid.supabase.co:5432/postgres
psql "postgresql://postgres:URLEncodedPassword@db.projectid.supabase.co:5432/postgres"
```

**2. Session Pooler (IPv4 Compatible)**
```bash
# Example: postgresql://postgres.projectid:[PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres
psql "postgresql://postgres.projectid:URLEncodedPassword@aws-0-region.pooler.supabase.com:5432/postgres"
```

**3. Transaction Pooler**
```bash
# Port 6543 for transaction pooling
psql "postgresql://postgres:URLEncodedPassword@db.projectid.supabase.co:6543/postgres"
```

### 2. Supabase JavaScript Client

For application code, use the Supabase client library:

```javascript
const { createClient } = require('@supabase/supabase-js');

// Client with anon key (public access)
const supabaseUrl = 'https://projectid.supabase.co';
const supabaseAnonKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role key (full access)
const supabaseServiceKey = 'your-service-role-key';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

### 3. Environment Variables

Standard environment variable names for Supabase projects:

```bash
# Required for all connections
NEXT_PUBLIC_SUPABASE_URL=https://projectid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...

# Required for admin operations
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...

# Direct database connection (optional)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.projectid.supabase.co:5432/postgres
```

## Common Tasks

### 1. Test Database Connection

```bash
# Test connection with simple query
psql "postgresql://..." -c "SELECT version();"

# List all tables
psql "postgresql://..." -c "\dt"

# Check specific table
psql "postgresql://..." -c "SELECT COUNT(*) FROM your_table;"
```

### 2. Execute SQL Scripts

```bash
# Single command
psql "postgresql://..." -c "YOUR SQL COMMAND HERE"

# Multiple commands from file
psql "postgresql://..." -f script.sql

# Multiple commands inline
psql "postgresql://..." << 'EOF'
SELECT * FROM table1;
UPDATE table2 SET column = value;
EOF
```

### 3. Handle Row Level Security (RLS)

```javascript
// Test if RLS is blocking access
async function testRLS() {
  // Test with anon key
  const { data: anonData } = await supabase
    .from('your_table')
    .select('*');
  
  // Test with service key
  const { data: serviceData } = await supabaseAdmin
    .from('your_table')
    .select('*');
  
  console.log('Anon access:', anonData?.length || 0);
  console.log('Service access:', serviceData?.length || 0);
}
```

Common RLS fix for public read access:
```sql
-- Allow public read access
CREATE POLICY "Allow public read" ON your_table
  FOR SELECT USING (true);

-- Restrict writes to authenticated users
CREATE POLICY "Authenticated write" ON your_table
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## Troubleshooting

### 1. Password Authentication Failed
- Ensure special characters are URL-encoded
- Verify you're using the correct password (not including any trailing characters)
- Check if using the right connection type (direct vs pooler)

### 2. No Data Returned (but connection works)
- Check if RLS is enabled on the table
- Verify you're using the correct key (anon vs service role)
- Test with service role key to bypass RLS

### 3. Connection Refused
- Verify the host and port are correct
- Check if using IPv4 network (use pooler connection)
- Ensure project is not paused in Supabase dashboard

### 4. API Returns Empty Results
Common causes:
- Missing `SUPABASE_SERVICE_ROLE_KEY` environment variable
- RLS policies blocking access
- Incorrect table/column names
- Database connection using wrong project

## Quick Debug Script

```javascript
// Save as debug-supabase.js
const { createClient } = require('@supabase/supabase-js');

const url = 'https://your-project.supabase.co';
const anonKey = 'your-anon-key';
const serviceKey = 'your-service-key';

async function debug() {
  console.log('Testing Supabase connection...\n');
  
  const supabase = createClient(url, anonKey);
  const supabaseAdmin = createClient(url, serviceKey);
  
  // Test basic connection
  const { data: tables } = await supabaseAdmin
    .rpc('pg_tables', { schemaname: 'public' });
  
  console.log('Tables found:', tables?.length || 0);
  
  // Test specific table
  const tableName = 'your_table';
  const { data, error } = await supabaseAdmin
    .from(tableName)
    .select('*')
    .limit(5);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Records in ${tableName}:`, data?.length || 0);
  }
}

debug();
```

## Security Best Practices

1. **Never commit credentials** - Use environment variables
2. **Use appropriate keys** - Anon key for public, service key for admin
3. **Implement RLS** - Always use Row Level Security in production
4. **Rotate keys regularly** - Especially after any potential exposure
5. **Use connection pooling** - For serverless and high-traffic applications

## Additional Resources

- Supabase Dashboard: `https://[project-id].supabase.co`
- SQL Editor: `https://[project-id].supabase.co/sql`
- Connection strings: Project Settings → Database → Connection string
- API keys: Project Settings → API → API keys