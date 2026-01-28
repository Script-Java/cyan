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
