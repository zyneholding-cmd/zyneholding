
-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  profile_photo_url TEXT,
  bio TEXT,
  purpose TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  experience_level TEXT NOT NULL DEFAULT 'intermediate',
  categories TEXT[] DEFAULT '{}',
  portfolio_link TEXT,
  resume_url TEXT,
  hourly_rate NUMERIC,
  availability TEXT DEFAULT 'full-time',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application (public form)
CREATE POLICY "Anyone can submit applications"
  ON public.job_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins/owners can view applications
CREATE POLICY "Admins can view applications"
  ON public.job_applications
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- Only admins/owners can update applications (approve/reject)
CREATE POLICY "Admins can update applications"
  ON public.job_applications
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- Only owners can delete applications
CREATE POLICY "Owners can delete applications"
  ON public.job_applications
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role));

-- Create storage bucket for application files
INSERT INTO storage.buckets (id, name, public) VALUES ('application-files', 'application-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for application files
CREATE POLICY "Anyone can upload application files"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'application-files');

CREATE POLICY "Anyone can view application files"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'application-files');
