-- Add new columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock numeric DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock numeric DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode text;

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- Create chat_messages table for AI memory
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for chat messages
CREATE POLICY "Allow all access to chat_messages"
ON chat_messages FOR ALL
USING (true)
WITH CHECK (true);

-- Create currencies table
CREATE TABLE IF NOT EXISTS currencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  symbol text NOT NULL,
  rate numeric NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on currencies
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;

-- Create policy for currencies
CREATE POLICY "Allow all access to currencies"
ON currencies FOR ALL
USING (true)
WITH CHECK (true);

-- Insert default currencies
INSERT INTO currencies (code, symbol, rate) VALUES
('USD', '$', 1),
('EUR', '€', 0.92),
('GBP', '£', 0.79),
('PKR', '₨', 278),
('INR', '₹', 83)
ON CONFLICT (code) DO NOTHING;

-- Create settings table for user preferences
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on app_settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for app_settings
CREATE POLICY "Allow all access to app_settings"
ON app_settings FOR ALL
USING (true)
WITH CHECK (true);

-- Insert default currency setting
INSERT INTO app_settings (key, value) VALUES
('currency', 'USD')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;