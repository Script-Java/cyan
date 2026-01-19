-- Create blogs table with all required columns
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  author VARCHAR(255) DEFAULT 'Admin',
  featured_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  visibility VARCHAR(20) DEFAULT 'hidden',
  show_in_listing BOOLEAN DEFAULT TRUE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_visibility ON blogs(visibility);
CREATE INDEX IF NOT EXISTS idx_blogs_show_in_listing ON blogs(show_in_listing);

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated admins to manage blogs
CREATE POLICY "Enable admin blog management" ON blogs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'authenticated')
  WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');

-- RLS Policy: Allow public read for visible blogs
CREATE POLICY "Allow public read visible blogs" ON blogs
  FOR SELECT
  USING (visibility = 'visible' AND show_in_listing = true);
