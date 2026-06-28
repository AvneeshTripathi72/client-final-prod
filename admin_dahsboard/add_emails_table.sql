CREATE TABLE IF NOT EXISTS public.emails (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  email_type text NOT NULL,
  status text DEFAULT 'sent',
  sent_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS policies
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- Allow insert by service role / authenticated users (via API)
CREATE POLICY "Enable insert for authenticated users" 
ON public.emails FOR INSERT 
WITH CHECK (true);

-- Allow select for authenticated admins
CREATE POLICY "Enable read access for authenticated admins"
ON public.emails FOR SELECT 
USING (auth.role() = 'authenticated');
