# Backend Implementation Draft for Church Management

This is a draft implementation guide for your Supabase backend. Create these routes in your `/supabase/functions/server/index.tsx` file.

## Server Implementation Example

```typescript
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ============ CHURCH ROUTES ============

// GET all churches
app.get('/make-server-118381ba/churches', async (c) => {
  try {
    // Fetch all churches from KV store with prefix
    const churches = await kv.getByPrefix('church:');

    return c.json({
      success: true,
      churches: churches || []
    });
  } catch (error) {
    console.error('Error fetching churches:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch churches'
    }, 500);
  }
});

// GET single church by ID
app.get('/make-server-118381ba/churches/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const church = await kv.get(`church:${id}`);

    if (!church) {
      return c.json({
        success: false,
        error: 'Church not found'
      }, 404);
    }

    return c.json({
      success: true,
      church
    });
  } catch (error) {
    console.error('Error fetching church:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch church'
    }, 500);
  }
});

// POST create new church
app.post('/make-server-118381ba/churches', async (c) => {
  try {
    const churchData = await c.req.json();

    // Generate unique ID
    const id = crypto.randomUUID();
    const church = {
      id,
      ...churchData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in KV store
    await kv.set(`church:${id}`, church);

    return c.json({
      success: true,
      church
    }, 201);
  } catch (error) {
    console.error('Error creating church:', error);
    return c.json({
      success: false,
      error: 'Failed to create church'
    }, 500);
  }
});

// PUT update church
app.put('/make-server-118381ba/churches/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();

    // Get existing church
    const existingChurch = await kv.get(`church:${id}`);

    if (!existingChurch) {
      return c.json({
        success: false,
        error: 'Church not found'
      }, 404);
    }

    // Merge updates
    const updatedChurch = {
      ...existingChurch,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    // Save to KV store
    await kv.set(`church:${id}`, updatedChurch);

    return c.json({
      success: true,
      church: updatedChurch
    });
  } catch (error) {
    console.error('Error updating church:', error);
    return c.json({
      success: false,
      error: 'Failed to update church'
    }, 500);
  }
});

// DELETE church
app.delete('/make-server-118381ba/churches/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Check if church exists
    const existingChurch = await kv.get(`church:${id}`);

    if (!existingChurch) {
      return c.json({
        success: false,
        error: 'Church not found'
      }, 404);
    }

    // Delete from KV store
    await kv.del(`church:${id}`);

    return c.json({
      success: true,
      message: 'Church deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting church:', error);
    return c.json({
      success: false,
      error: 'Failed to delete church'
    }, 500);
  }
});

// ============ IMAGE UPLOAD ROUTE ============

app.post('/make-server-118381ba/upload-image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({
        success: false,
        error: 'No file provided'
      }, 400);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const bucketName = 'make-118381ba-churches';

    // Create bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
      });
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Create signed URL (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000);

    return c.json({
      success: true,
      imageUrl: signedUrlData?.signedUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return c.json({
      success: false,
      error: 'Failed to upload image'
    }, 500);
  }
});

// Start server
Deno.serve(app.fetch);
```

## Frontend Integration Example

Update your `ChurchManagement.tsx` to use the API:

```typescript
import { useState, useEffect } from "react";
import { fetchChurches, createChurch, updateChurch, deleteChurch, uploadImage } from "../../services/churchApi";

export default function ChurchManagement() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);

  // Load churches on mount
  useEffect(() => {
    loadChurches();
  }, []);

  const loadChurches = async () => {
    try {
      setLoading(true);
      const data = await fetchChurches();
      setChurches(data);
    } catch (error) {
      console.error('Failed to load churches:', error);
      alert('Failed to load churches');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingChurch) {
        const updated = await updateChurch(editingChurch.id, formData);
        setChurches(churches.map(c => c.id === updated.id ? updated : c));
      } else {
        const newChurch = await createChurch(formData as Omit<Church, 'id'>);
        setChurches([...churches, newChurch]);
      }

      handleCloseForm();
    } catch (error) {
      console.error('Failed to save church:', error);
      alert('Failed to save church');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this church?")) {
      try {
        await deleteChurch(id);
        setChurches(churches.filter(c => c.id !== id));
      } catch (error) {
        console.error('Failed to delete church:', error);
        alert('Failed to delete church');
      }
    }
  };

  const handleFiles = async (files: FileList) => {
    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file));
      const imageUrls = await Promise.all(uploadPromises);

      setFormData({
        ...formData,
        images: [...(formData.images || []), ...imageUrls],
      });
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Failed to upload images');
    }
  };

  // ... rest of your component
}
```

## Notes

1. **KV Store**: Churches are stored with keys like `church:uuid`
2. **Image Storage**: Images are uploaded to a private Supabase Storage bucket
3. **Signed URLs**: Images use signed URLs valid for 1 year
4. **Error Handling**: All routes include try-catch with detailed error logging
5. **CORS**: Enabled for frontend communication

## Testing

Use these curl commands to test your endpoints:

```bash
# Get all churches
curl -X GET https://your-project-id.supabase.co/functions/v1/make-server-118381ba/churches \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Create church
curl -X POST https://your-project-id.supabase.co/functions/v1/make-server-118381ba/churches \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Church","founded":2000,...}'

# Update church
curl -X PUT https://your-project-id.supabase.co/functions/v1/make-server-118381ba/churches/CHURCH_ID \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# Delete church
curl -X DELETE https://your-project-id.supabase.co/functions/v1/make-server-118381ba/churches/CHURCH_ID \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```
