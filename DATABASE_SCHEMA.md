# Supabase Database Schema for Church Management

## Table Creation

Create this table in your Supabase dashboard (SQL Editor):

```sql
-- Create churches table
CREATE TABLE churches (
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

-- Create index for faster queries
CREATE INDEX idx_churches_city ON churches(city);
CREATE INDEX idx_churches_country ON churches(country);

-- Enable Row Level Security
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anyone can view churches)
CREATE POLICY "Public can view churches"
  ON churches
  FOR SELECT
  USING (true);

-- Only authenticated admins can insert
CREATE POLICY "Admins can insert churches"
  ON churches
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Only authenticated admins can update
CREATE POLICY "Admins can update churches"
  ON churches
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Only authenticated admins can delete
CREATE POLICY "Admins can delete churches"
  ON churches
  FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create storage bucket for church images (run this in SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('church-images', 'church-images', true)
ON CONFLICT DO NOTHING;

-- Storage policies for church images
CREATE POLICY "Public can view church images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'church-images');

CREATE POLICY "Admins can upload church images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'church-images' AND
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can delete church images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'church-images' AND
    auth.jwt() ->> 'role' = 'admin'
  );
```

## Notes

1. **Row Level Security (RLS)**: Configured so anyone can view churches, but only authenticated admins can add/edit/delete
2. **Admin Role**: You'll need to set the `role` claim in user metadata when creating admin users
3. **Storage Bucket**: Church images are stored in a public bucket named `church-images`
4. **Array Field**: `images` is a PostgreSQL array storing multiple image URLs

## Setting Admin Role

When you create an admin user in Supabase Auth, add this to their user metadata:

```json
{
  "role": "admin"
}
```

Or via SQL:
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';
```
