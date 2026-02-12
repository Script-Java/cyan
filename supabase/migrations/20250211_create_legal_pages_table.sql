-- Create legal_pages table for managing legal content (Privacy Policy, Terms, etc.)
CREATE TABLE IF NOT EXISTS public.legal_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_type VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    visibility VARCHAR(20) DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups by page_type
CREATE INDEX IF NOT EXISTS idx_legal_pages_page_type ON public.legal_pages(page_type);
CREATE INDEX IF NOT EXISTS idx_legal_pages_visibility ON public.legal_pages(visibility);

-- Enable Row Level Security
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to read visible legal pages
CREATE POLICY "Allow public read visible legal pages" 
    ON public.legal_pages 
    FOR SELECT 
    USING (visibility = 'visible');

-- Policy: Allow authenticated users to read all legal pages (for admin)
CREATE POLICY "Allow authenticated read all legal pages" 
    ON public.legal_pages 
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Policy: Allow authenticated users to manage legal pages
CREATE POLICY "Allow authenticated manage legal pages" 
    ON public.legal_pages 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Insert default legal pages
INSERT INTO public.legal_pages (page_type, title, content, visibility) 
VALUES 
    ('privacy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>Your privacy policy content here.</p>', 'visible'),
    ('terms', 'Terms of Service', '<h1>Terms of Service</h1><p>Your terms of service content here.</p>', 'visible'),
    ('shipping', 'Shipping Policy', '<h1>Shipping Policy</h1><p>Your shipping policy content here.</p>', 'visible'),
    ('returns', 'Returns & Refunds', '<h1>Returns & Refunds</h1><p>Your returns and refunds policy here.</p>', 'visible')
ON CONFLICT (page_type) DO NOTHING;
