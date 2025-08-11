/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `payment_request_id` (uuid, references payment_requests)
      - `transaction_id` (text, unique, not null)
      - `amount` (decimal, not null)
      - `status` (text, default 'pending')
      - `payment_method` (text, not null)
      - `gateway_response` (jsonb)
      - `created_at` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on `transactions` table
    - Add policy for authenticated admins to view transactions
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id uuid REFERENCES payment_requests(id) ON DELETE CASCADE,
  transaction_id text UNIQUE NOT NULL,
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('success', 'failed', 'pending')),
  payment_method text NOT NULL,
  gateway_response jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );