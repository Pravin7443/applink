/*
  # Create company_settings table

  1. New Tables
    - `company_settings`
      - `id` (uuid, primary key)
      - `company_name` (text, not null)
      - `company_logo` (text, optional)
      - `contact_email` (text, not null)
      - `contact_phone` (text, not null)
      - `address` (text, not null)
      - `upi_ids` (text array)
      - `payment_gateway_config` (jsonb)
      - `notification_settings` (jsonb)
      - `created_at` (timestamp with time zone, default now())
      - `updated_at` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on `company_settings` table
    - Add policy for authenticated admins to manage company settings
*/

CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  company_logo text,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  address text NOT NULL,
  upi_ids text[] DEFAULT '{}',
  payment_gateway_config jsonb DEFAULT '{}',
  notification_settings jsonb DEFAULT '{"email": true, "sms": true, "whatsapp": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage company settings"
  ON company_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

-- Create trigger for company_settings table
CREATE TRIGGER update_company_settings_updated_at 
  BEFORE UPDATE ON company_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();