/*
  # Create payment_requests table

  1. New Tables
    - `payment_requests`
      - `id` (uuid, primary key)
      - `bill_no` (text, unique, not null)
      - `amount` (decimal, not null)
      - `customer_name` (text, optional)
      - `customer_mobile` (text, not null)
      - `customer_email` (text, optional)
      - `employee_id` (uuid, optional, references employees)
      - `status` (text, default 'pending')
      - `payment_link` (text, not null)
      - `created_by` (uuid, references admins)
      - `created_at` (timestamp with time zone, default now())
      - `updated_at` (timestamp with time zone, default now())
      - `expires_at` (timestamp with time zone, not null)

  2. Security
    - Enable RLS on `payment_requests` table
    - Add policy for authenticated admins to manage payment requests
*/

CREATE TABLE IF NOT EXISTS payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_no text UNIQUE NOT NULL,
  amount decimal(10,2) NOT NULL,
  customer_name text,
  customer_mobile text NOT NULL,
  customer_email text,
  employee_id uuid REFERENCES employees(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  payment_link text NOT NULL,
  created_by uuid REFERENCES admins(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment requests"
  ON payment_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

-- Create trigger for payment_requests table
CREATE TRIGGER update_payment_requests_updated_at 
  BEFORE UPDATE ON payment_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();