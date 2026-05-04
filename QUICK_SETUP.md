# Quick Setup - Fix "Failed to fetch" Error

Your Supabase is connected! Now you need to create the database table.

## Step 1: Create the Churches Table

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `fxpvfulobjzoxcdlfmng`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Create churches table
CREATE TABLE IF NOT EXISTS churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  founded INTEGER NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  country TEXT NOT NULL,
  lat DECIMAL NOT NULL,
  lng DECIMAL NOT NULL,
  description TEXT NOT NULL,
  history TEXT NOT NULL,
  architectural_style TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  feast TEXT,
  diocese TEXT,
  unrated BOOLEAN DEFAULT false,
  structural_rating INTEGER CHECK (structural_rating >= 1 AND structural_rating <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_churches_city ON churches(city);
CREATE INDEX IF NOT EXISTS idx_churches_country ON churches(country);

-- Enable Row Level Security
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read churches
CREATE POLICY "Public can view churches"
  ON churches
  FOR SELECT
  USING (true);

-- Allow everyone to insert/update/delete (for development - tighten later!)
CREATE POLICY "Anyone can insert churches"
  ON churches
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update churches"
  ON churches
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete churches"
  ON churches
  FOR DELETE
  USING (true);
```

6. Click **RUN** (or press Ctrl+Enter / Cmd+Enter)
7. You should see "Success. No rows returned"

## Step 2: Create Storage Bucket for Images

1. Still in your Supabase dashboard, click **Storage** in the left sidebar
2. Click **New bucket**
3. Enter these details:
   - **Name**: `church-images`
   - **Public bucket**: ✅ Check this box
4. Click **Create bucket**

## Step 3: Set Storage Policies

1. Click on the `church-images` bucket you just created
2. Click **Policies** tab
3. Click **New policy**
4. Click **For full customization**
5. Add this policy for viewing images:
   - **Policy name**: `Public can view images`
   - **Policy definition**: SELECT
   - **Target roles**: `public`
   - Click **Review** then **Save**

6. Add another policy for uploading:
   - Click **New policy** again
   - **Policy name**: `Anyone can upload images`
   - **Policy definition**: INSERT
   - **Target roles**: `public`
   - **WITH CHECK expression**: `bucket_id = 'church-images'`
   - Click **Review** then **Save**

## Step 4: Test the App

1. Refresh your Make app
2. Navigate to `/church-management`
3. Try adding a test church
4. The church should appear in Search and Dashboard pages

## Troubleshooting

### Still getting "Failed to fetch"?
- Check the browser console for detailed error messages
- Make sure you ran ALL the SQL commands above
- Verify the bucket name is exactly `church-images`

### "relation churches does not exist"?
- You forgot to run the SQL in Step 1
- Go back and run the CREATE TABLE commands

### Images not uploading?
- Make sure the storage bucket is marked as **Public**
- Check that storage policies allow INSERT

### Row Level Security errors?
- The policies above allow everyone to do everything (for development)
- For production, you'll want to restrict INSERT/UPDATE/DELETE to admins only

## What's Next?

Once setup is complete, you can:
- Add churches through the Church Management page (`/church-management`)
- Search and browse churches (`/search`)
- View church details with images (`/church/:id`)
- Create posts about churches (`/dashboard`)

All images uploaded will automatically appear across all pages!
