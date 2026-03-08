
-- Add marketplace columns to business_listings
ALTER TABLE public.business_listings
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS application_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured_until timestamp with time zone;

-- Business positions table (multiple jobs per listing)
CREATE TABLE public.business_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.business_listings(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  requirements text,
  salary_range text,
  employment_type text DEFAULT 'full-time',
  experience_level text DEFAULT 'intermediate',
  skills_required text[] DEFAULT '{}',
  is_open boolean DEFAULT true,
  applications_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.business_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view positions of published listings" ON public.business_positions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.business_listings bl WHERE bl.id = business_positions.business_id AND (bl.status = 'published' OR bl.owner_id = auth.uid()))
  );

CREATE POLICY "Business owners can manage positions" ON public.business_positions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.business_listings bl WHERE bl.id = business_positions.business_id AND bl.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.business_listings bl WHERE bl.id = business_positions.business_id AND bl.owner_id = auth.uid())
  );

-- Business reviews table
CREATE TABLE public.business_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.business_listings(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  content text,
  reviewer_type text DEFAULT 'employee',
  is_anonymous boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(business_id, reviewer_id)
);

ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.business_reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON public.business_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews" ON public.business_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete own reviews" ON public.business_reviews
  FOR DELETE USING (auth.uid() = reviewer_id);

-- Hiring pipeline table
CREATE TABLE public.hiring_pipeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.business_applications(id) ON DELETE CASCADE NOT NULL,
  business_id uuid REFERENCES public.business_listings(id) ON DELETE CASCADE NOT NULL,
  stage text NOT NULL DEFAULT 'applied',
  notes text,
  interview_date timestamp with time zone,
  interview_type text,
  interview_link text,
  updated_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.hiring_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage pipeline" ON public.hiring_pipeline
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.business_listings bl WHERE bl.id = hiring_pipeline.business_id AND bl.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.business_listings bl WHERE bl.id = hiring_pipeline.business_id AND bl.owner_id = auth.uid())
  );

CREATE POLICY "Applicants can view own pipeline" ON public.hiring_pipeline
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.business_applications ba WHERE ba.id = hiring_pipeline.application_id AND ba.email = (SELECT email FROM public.profiles WHERE id = auth.uid()))
  );

-- Portfolio items table
CREATE TABLE public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  project_url text,
  category text,
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view portfolio items" ON public.portfolio_items
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own portfolio" ON public.portfolio_items
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Job offers table
CREATE TABLE public.job_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.business_listings(id) ON DELETE CASCADE NOT NULL,
  application_id uuid REFERENCES public.business_applications(id) ON DELETE CASCADE NOT NULL,
  applicant_email text NOT NULL,
  position_title text NOT NULL,
  salary text,
  start_date date,
  terms text,
  benefits text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamp with time zone DEFAULT now(),
  responded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage offers" ON public.job_offers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.business_listings bl WHERE bl.id = job_offers.business_id AND bl.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.business_listings bl WHERE bl.id = job_offers.business_id AND bl.owner_id = auth.uid())
  );

CREATE POLICY "Applicants can view own offers" ON public.job_offers
  FOR SELECT USING (
    applicant_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Applicants can update own offers" ON public.job_offers
  FOR UPDATE USING (
    applicant_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- Add position_id to business_applications
ALTER TABLE public.business_applications
  ADD COLUMN IF NOT EXISTS position_id uuid REFERENCES public.business_positions(id),
  ADD COLUMN IF NOT EXISTS applicant_user_id uuid;
