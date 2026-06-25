-- Add artist_no as a sequential auto-incrementing immutable number
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS artist_no SERIAL;

-- Add is_live boolean to control visibility on the user dashboard
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT true;

-- Create duplicate approvals table for tracking allowed duplicates
CREATE TABLE IF NOT EXISTS public.duplicate_approvals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name text NOT NULL, -- e.g., 'phone_no' or 'alias'
  field_value text NOT NULL, -- e.g., '9876543210' or 'DJ Nova'
  requested_by text,
  approved_by text,
  reason text,
  draft_data JSONB, -- Temporarily holds the artist profile payload until approved
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: We are NOT adding a strict UNIQUE constraint to artists(phone_no) or artists(alias) 
-- because the system allows duplicates if they are approved by a Super Admin.
-- The uniqueness rule will be enforced strictly at the application layer.
