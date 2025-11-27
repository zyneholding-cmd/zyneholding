-- Create table for user's selected business tools
CREATE TABLE IF NOT EXISTS public.user_business_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Enable RLS
ALTER TABLE public.user_business_tools ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own tools
CREATE POLICY "Users can view their own business tools"
  ON public.user_business_tools FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business tools"
  ON public.user_business_tools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business tools"
  ON public.user_business_tools FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business tools"
  ON public.user_business_tools FOR DELETE
  USING (auth.uid() = user_id);