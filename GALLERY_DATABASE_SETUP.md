# Gallery Database Setup

To enable the gallery management feature, you need to create the `gallery_images` table in your Supabase database.

## Instructions

1. **Log in to Supabase** at https://app.supabase.com
2. **Select your project**
3. **Go to SQL Editor** (left sidebar)
4. **Create a new query** and paste the following SQL:

```sql
-- Create gallery_images table
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  image_alt VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_order ON public.gallery_images(order_index ASC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_active ON public.gallery_images(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active gallery images
CREATE POLICY "Allow public read" ON public.gallery_images
  FOR SELECT
  USING (is_active = true);

-- Allow service role (admin) to manage all gallery images
CREATE POLICY "Allow admin manage" ON public.gallery_images
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

5. **Click Run** (or press Ctrl+Enter)
6. You should see "Success" message

## Adding Gallery Images

Now you can manage gallery images through the admin panel:

1. **Go to your admin dashboard**
2. **Click on Gallery Management** (in the admin navigation)
3. **Upload and manage featured gallery images**

## API Endpoints

### Public
- `GET /api/gallery` - Get active gallery images

### Admin (requires authentication)
- `GET /api/admin/gallery/all` - Get all gallery images (including inactive)
- `POST /api/admin/gallery` - Create new gallery image
- `PUT /api/admin/gallery/:id` - Update gallery image
- `DELETE /api/admin/gallery/:id` - Delete gallery image
- `PATCH /api/admin/gallery/reorder` - Reorder gallery images

## Troubleshooting

If you encounter any issues:
1. Make sure you're logged in as an admin user
2. Verify that the `gallery_images` table was created successfully in the Database section
3. Check that RLS policies are enabled
