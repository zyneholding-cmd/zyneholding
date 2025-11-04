-- Fix foreign keys to reference profiles instead of auth.users
ALTER TABLE public.tasks
DROP CONSTRAINT tasks_assignee_id_fkey,
DROP CONSTRAINT tasks_created_by_fkey;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_assignee_id_fkey 
  FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD CONSTRAINT tasks_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also fix task_history
ALTER TABLE public.task_history
DROP CONSTRAINT task_history_changed_by_fkey;

ALTER TABLE public.task_history
ADD CONSTRAINT task_history_changed_by_fkey 
  FOREIGN KEY (changed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;