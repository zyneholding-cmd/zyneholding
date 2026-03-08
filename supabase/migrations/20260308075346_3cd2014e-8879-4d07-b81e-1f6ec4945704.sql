
-- Drop all existing restrictive policies on customers
DROP POLICY IF EXISTS "Users can create customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view all customers" ON public.customers;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Users can view all customers"
  ON public.customers FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create customers"
  ON public.customers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update customers"
  ON public.customers FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Users can delete customers"
  ON public.customers FOR DELETE TO authenticated
  USING (true);
