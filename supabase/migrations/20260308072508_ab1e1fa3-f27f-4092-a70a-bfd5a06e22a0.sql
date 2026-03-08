-- Invoices table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text,
  customer_address text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_rate numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  balance_due numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  notes text,
  terms text,
  user_id uuid NOT NULL,
  sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can create own invoices" ON public.invoices
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own invoices" ON public.invoices
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own invoices" ON public.invoices
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();