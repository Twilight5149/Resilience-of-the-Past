# Image Troubleshooting Guide

## Why Are Images Not Loading?

Images won't display until you have:
1. ✅ Created the database table
2. ✅ Created the storage bucket
3. ✅ Added churches with images

## Quick Checklist

### 1. Database Table Created?
Run this in Supabase SQL Editor:
```sql
SELECT * FROM churches;
```

- **If you see "relation churches does not exist"**: Run the SQL from `QUICK_SETUP.md` Step 1
- **If you see "Success. No rows returned"**: Table exists but is empty - continue to Step 3

### 2. Storage Bucket Created?
1. Go to Supabase Dashboard → **Storage**
2. Look for a bucket named `church-images`
3. If missing, follow `QUICK_SETUP.md` Step 2

### 3. Add a Test Church with Images

Go to `/church-management` and add a test church:

**Option A: Use Image URL** (Fastest)
1. Fill in all required fields
2. In the "Images" section, paste a URL:
   ```
   https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800
   ```
3. Click "Add URL"
4. Submit the form

**Option B: Upload Image Files**
1. Fill in all required fields
2. Drag and drop an image file into the upload area
3. Wait for upload to complete
4. Submit the form

### 4. Verify Images Are Showing

After adding a church:
- ✅ Go to `/search` - should see the church card with image
- ✅ Click the church - should see full image on detail page
- ✅ Go to `/dashboard` - should see church card with image

## Common Issues

### "No churches found" message
**Cause**: Database table is empty
**Solution**: Add churches through `/church-management`

### Gray placeholder icon instead of image
**Cause**: Church was added without images
**Solution**:
1. Go to `/church-management`
2. Click Edit (pencil icon) on the church
3. Add image URL or upload file
4. Save changes

### Image upload fails
**Cause**: Storage bucket doesn't exist or lacks permissions
**Solution**:
1. Check bucket exists: Supabase Dashboard → Storage → `church-images`
2. Verify bucket is marked as **Public**
3. Check storage policies allow INSERT (see `QUICK_SETUP.md` Step 3)

### Images show briefly then disappear
**Cause**: Invalid image URL or CORS issue
**Solution**: Use direct image URLs from trusted sources like:
- Unsplash: `https://images.unsplash.com/...`
- Your own Supabase storage: `https://[project].supabase.co/storage/v1/object/public/...`

## Test Image URLs

Use these working image URLs for testing:

```
https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800
https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800
https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800
https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800
```

## Expected Behavior

✅ **With images**: Full photo displayed
✅ **Without images**: Gray placeholder with building icon
❌ **Broken image icon**: Invalid URL or CORS issue

## Still Having Issues?

Check browser console (F12) for error messages:
- **"Failed to fetch"**: Database table doesn't exist
- **"404 Not Found"**: Invalid image URL
- **"CORS error"**: Image URL blocks external access
- **Storage errors**: Check bucket exists and is public
