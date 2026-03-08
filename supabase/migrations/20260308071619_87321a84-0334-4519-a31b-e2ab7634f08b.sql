
-- Fix chat_messages: drop public ALL policy, add authenticated policies with user_id
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Allow all access to chat_messages" ON public.chat_messages;

CREATE POLICY "Users can view own chat messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
  ON public.chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix currencies: drop public ALL policy, add read for all authenticated, write for admin/owner only
DROP POLICY IF EXISTS "Allow all access to currencies" ON public.currencies;

CREATE POLICY "Authenticated users can read currencies"
  ON public.currencies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins and owners can insert currencies"
  ON public.currencies FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Only admins and owners can update currencies"
  ON public.currencies FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Only admins and owners can delete currencies"
  ON public.currencies FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));
