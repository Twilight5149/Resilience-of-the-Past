# ChurchHistory - Local Setup Instructions

## Prerequisites
- Node.js 18+ installed
- VS Code (or any code editor)
- Git (optional)

## Setup Steps

### 1. Create New Project
```bash
# Create project directory
mkdir church-history
cd church-history

# Initialize package.json
npm init -y
```

### 2. Install Dependencies
```bash
# Install all required packages
pnpm install react react-dom react-router lucide-react
pnpm install -D vite @vitejs/plugin-react @tailwindcss/vite
```

### 3. Copy Project Files
Copy all files from this Figma Make project:
- `/src/` directory (entire folder)
- `vite.config.ts`
- `package.json` (merge dependencies)

### 4. Project Structure
```
church-history/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Signup.tsx
│   │   │   │   ├── ChurchSearch.tsx
│   │   │   │   ├── ChurchDetail.tsx
│   │   │   │   ├── UserDashboard.tsx
│   │   │   │   ├── ExpertDashboard.tsx
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   └── NotFound.tsx
│   │   │   └── Root.tsx
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   └── mockData.ts
│   ├── styles/
│   │   └── theme.css
│   └── main.tsx
├── vite.config.ts
└── package.json
```

### 5. Run Development Server
```bash
# Start the dev server
pnpm dev

# Or with npm
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Assets & Images

### Current Setup (No Download Needed)
The app currently uses **Unsplash** URLs for church images:
- Images load directly from `https://images.unsplash.com/`
- No local downloads required
- Works as long as you have internet connection

### Optional: Use Local Images
If you want to use local images instead:

1. Create an `images` folder:
```bash
mkdir public/images/churches
```

2. Download church images and save them to `public/images/churches/`

3. Update `mockData.ts` to use local paths:
```typescript
// Change from:
images: ["https://images.unsplash.com/photo-XXX?w=800"]

// To:
images: ["/images/churches/st-patricks.jpg"]
```

## Adding Backend (Supabase)

To enable real authentication and data storage:

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Create a free account and new project
3. Note your project URL and anon key

### 2. Install Supabase Client
```bash
pnpm install @supabase/supabase-js
```

### 3. Create Supabase Client
Create `src/utils/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 4. Create `.env` File
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 5. Database Schema
Create these tables in Supabase:

**Churches Table:**
```sql
CREATE TABLE churches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  denomination TEXT,
  founded INTEGER,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  lat DECIMAL,
  lng DECIMAL,
  description TEXT,
  history TEXT,
  architectural_style TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Expert Comments Table:**
```sql
CREATE TABLE expert_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id),
  expert_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  comment TEXT,
  recommendations TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Posts Table:**
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id),
  user_id UUID REFERENCES auth.users(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Google Maps Integration

To enable Google Maps:

### 1. Get API Key
1. Go to https://console.cloud.google.com
2. Enable Maps JavaScript API
3. Create an API key

### 2. Add to `.env`
```bash
VITE_GOOGLE_MAPS_API_KEY=your_api_key
```

### 3. Install Google Maps Package
```bash
pnpm install @react-google-maps/api
```

## Production Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Deployment Options

- **Vercel**: Connect your GitHub repo to Vercel
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Use `gh-pages` package
- **Cloudflare Pages**: Connect to Git repository

## Troubleshooting

### Vite Import Errors
If you see "Failed to resolve import" errors:
```bash
# Clear cache
rm -rf node_modules/.vite
pnpm install
```

### Port Already in Use
Change port in `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 3000
  }
})
```

## Next Steps

1. ✅ Run the app locally with mock data
2. 🔄 Connect Supabase for real authentication
3. 🔄 Add Google Maps API key
4. 🔄 Deploy to production
5. 🔄 Add your own church data

## Support

For issues or questions:
- Check the browser console for errors
- Verify all dependencies are installed
- Ensure environment variables are set correctly
