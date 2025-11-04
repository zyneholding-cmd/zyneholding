-- Create tasks table for Kanban board
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('todo', 'in_progress', 'done')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high'))
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policies: All authenticated users can view tasks
CREATE POLICY "Users can view all tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (true);

-- Users can create tasks
CREATE POLICY "Users can create tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Users can update tasks they created or are assigned to
CREATE POLICY "Users can update their tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by OR auth.uid() = assignee_id);

-- Only creators can delete tasks
CREATE POLICY "Users can delete their created tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Create task_history table for tracking changes
CREATE TABLE public.task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on history
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;

-- Users can view task history
CREATE POLICY "Users can view task history"
ON public.task_history
FOR SELECT
TO authenticated
USING (true);

-- System can insert history (via trigger)
CREATE POLICY "System can insert task history"
ON public.task_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = changed_by);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Function to log status changes
CREATE OR REPLACE FUNCTION public.log_task_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.task_history (task_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to log status changes
CREATE TRIGGER log_task_status_change_trigger
AFTER UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.log_task_status_change();