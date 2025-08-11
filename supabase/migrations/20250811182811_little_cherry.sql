/*
  # Create employees table

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `full_name` (text, not null)
      - `email` (text, unique, not null)
      - `mobile_number` (text, not null)
      - `upi_id` (text, not null)
      - `status` (text, default 'pending')
      - `role` (text, default 'employee')
      - `created_by` (uuid, references admins)
      - `created_at` (timestamp with time zone, default now())
      - `updated_at` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on `employees` table
    - Add policy for authenticated admins to manage employees
*/

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  mobile_number text NOT NULL,
  upi_id text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked')),
  role text DEFAULT 'employee',
  created_by uuid REFERENCES admins(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

-- Create trigger for employees table
CREATE TRIGGER update_employees_updated_at 
  BEFORE UPDATE ON employees 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();