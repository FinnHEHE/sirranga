-- Create friends table
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rank TEXT NOT NULL,
  quote TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Allow public read access (no auth required for viewing friends)
CREATE POLICY "friends_select_all" ON public.friends
  FOR SELECT USING (true);

-- Allow public insert (admin pages use password, not auth)
CREATE POLICY "friends_insert_all" ON public.friends
  FOR INSERT WITH CHECK (true);

-- Allow public update
CREATE POLICY "friends_update_all" ON public.friends
  FOR UPDATE USING (true);

-- Allow public delete
CREATE POLICY "friends_delete_all" ON public.friends
  FOR DELETE USING (true);
