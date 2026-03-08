
-- Business listings table
CREATE TABLE public.business_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location TEXT,
  team_size TEXT,
  website TEXT,
  requirements TEXT,
  salary_range TEXT,
  benefits TEXT[] DEFAULT '{}',
  culture TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  positions JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft',
  rating NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.business_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage own listings" ON public.business_listings
FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Anyone can view published listings" ON public.business_listings
FOR SELECT USING (status = 'published');

-- Business applications table
CREATE TABLE public.business_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_listings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  skills TEXT[] DEFAULT '{}',
  experience_level TEXT DEFAULT 'intermediate',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.business_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit business applications" ON public.business_applications
FOR INSERT WITH CHECK (true);

CREATE POLICY "Business owners can view applications" ON public.business_applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.business_listings bl
    WHERE bl.id = business_id AND bl.owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can update applications" ON public.business_applications
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.business_listings bl
    WHERE bl.id = business_id AND bl.owner_id = auth.uid()
  )
);

-- Member permissions table
CREATE TABLE public.member_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.profiles(id),
  permission_key TEXT NOT NULL,
  allowed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, permission_key)
);

ALTER TABLE public.member_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and owners can manage permissions" ON public.member_permissions
FOR ALL USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner')
) WITH CHECK (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner')
);

CREATE POLICY "Users can view own permissions" ON public.member_permissions
FOR SELECT USING (auth.uid() = user_id);

-- Inbox messages table
CREATE TABLE public.inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  receiver_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can send messages" ON public.inbox_messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view own messages" ON public.inbox_messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can update own received messages" ON public.inbox_messages
FOR UPDATE USING (auth.uid() = receiver_id);

-- Enable realtime for inbox
ALTER PUBLICATION supabase_realtime ADD TABLE public.inbox_messages;

-- Add job_title to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
