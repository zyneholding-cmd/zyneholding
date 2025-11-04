-- Create customers table for CRM
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'lead'))
);

-- Create calendar_events table
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  event_type TEXT DEFAULT 'meeting',
  attendees UUID[] DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_event_type CHECK (event_type IN ('meeting', 'call', 'deadline', 'reminder', 'other')),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  folder TEXT DEFAULT 'general',
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Users can view all customers"
ON public.customers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create customers"
ON public.customers FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update customers"
ON public.customers FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete customers"
ON public.customers FOR DELETE TO authenticated USING (true);

-- RLS Policies for calendar_events
CREATE POLICY "Users can view all events"
ON public.calendar_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create events"
ON public.calendar_events FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their events or assigned events"
ON public.calendar_events FOR UPDATE TO authenticated
USING (auth.uid() = created_by OR auth.uid() = ANY(attendees));

CREATE POLICY "Users can delete their events"
ON public.calendar_events FOR DELETE TO authenticated
USING (auth.uid() = created_by);

-- RLS Policies for documents
CREATE POLICY "Users can view all documents"
ON public.documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can upload documents"
ON public.documents FOR INSERT TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their documents"
ON public.documents FOR UPDATE TO authenticated
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their documents"
ON public.documents FOR DELETE TO authenticated
USING (auth.uid() = uploaded_by);

-- Add triggers for updated_at
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();