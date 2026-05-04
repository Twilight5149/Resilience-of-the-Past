# Direct Supabase Setup Guide

This guide shows you how to connect directly to Supabase from the frontend, bypassing Edge Functions entirely.

## Step 1: Create the Database Table

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL from `DATABASE_SCHEMA.md` to create the `churches` table and set up Row Level Security

## Step 2: Create Storage Bucket

The SQL in `DATABASE_SCHEMA.md` creates a public storage bucket named `church-images`. Verify it exists:

1. Go to **Storage** in your Supabase dashboard
2. Check if `church-images` bucket exists
3. If not, create it manually:
   - Click "New bucket"
   - Name: `church-images`
   - Public: ✅ Yes (checked)
   - Click "Create"

## Step 3: Configure Supabase Credentials

Update `/src/app/services/churchApi.ts` with your Supabase credentials:

```typescript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Click **Project Settings** (gear icon)
3. Go to **API** section
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **Project API keys** → `anon public` → `SUPABASE_ANON_KEY`

## Step 4: Set Up Admin Authentication (Optional)

The Row Level Security policies require users to have an `admin` role to create/edit/delete churches.

### Option A: For Development (No Auth Required)

Temporarily modify the RLS policies to allow all operations:

```sql
-- Replace the restrictive policies with these during development
DROP POLICY IF EXISTS "Admins can insert churches" ON churches;
DROP POLICY IF EXISTS "Admins can update churches" ON churches;
DROP POLICY IF EXISTS "Admins can delete churches" ON churches;

CREATE POLICY "Anyone can insert churches" ON churches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update churches" ON churches FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete churches" ON churches FOR DELETE USING (true);

-- Storage policies
DROP POLICY IF EXISTS "Admins can upload church images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete church images" ON storage.objects;

CREATE POLICY "Anyone can upload church images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'church-images');

CREATE POLICY "Anyone can delete church images" ON storage.objects
  FOR DELETE USING (bucket_id = 'church-images');
```

### Option B: With Admin Authentication

1. **Create an admin user** in Supabase Auth:
   - Go to **Authentication** → **Users**
   - Click "Add user"
   - Enter email and password
   - Click "Create user"

2. **Set admin role** via SQL:
   ```sql
   UPDATE auth.users
   SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
   WHERE email = 'your-admin@email.com';
   ```

3. **Add login to your app** - Create a simple login form that uses Supabase auth:
   ```typescript
   import { getSupabaseClient } from './services/churchApi';

   async function login(email: string, password: string) {
     const supabase = getSupabaseClient();
     const { data, error } = await supabase.auth.signInWithPassword({
       email,
       password,
     });
     if (error) throw error;
     return data;
   }
   ```

## Step 5: Update ChurchManagement Component

Replace the current `ChurchManagement.tsx` with `ChurchManagementWithAPI.tsx`:

```bash
# Backup current version
mv src/app/components/pages/ChurchManagement.tsx src/app/components/pages/ChurchManagement.backup.tsx

# Use the API version
mv src/app/components/pages/ChurchManagementWithAPI.tsx src/app/components/pages/ChurchManagement.tsx
```

Or simply copy the code from `ChurchManagementWithAPI.tsx` into `ChurchManagement.tsx`.

## Step 6: Test the Connection

1. Navigate to `/church-management` in your app
2. Try adding a test church
3. Check your Supabase dashboard → **Table Editor** → `churches` to see if the data was saved

## Troubleshooting

### "relation 'churches' does not exist"
- Make sure you ran the SQL schema from `DATABASE_SCHEMA.md`
- Check the SQL Editor for any errors

### "new row violates row-level security policy"
- Either disable RLS policies (Option A above) or set up admin authentication (Option B)

### "The resource already exists" (storage bucket)
- The bucket already exists, you can ignore this or remove the bucket creation from the SQL

### Images not uploading
- Make sure the `church-images` bucket exists in Storage
- Verify the bucket is set to **public**
- Check storage policies are correctly set

### "Failed to fetch churches"
- Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check browser console for detailed error messages
- Make sure RLS policies allow SELECT (reading) for everyone

## Architecture

```
Frontend (React)
    ↓
Supabase Client (@supabase/supabase-js)
    ↓
Supabase Platform
    ├── PostgreSQL (churches table)
    └── Storage (church-images bucket)
```

No Edge Functions needed! The Supabase client handles everything directly.
