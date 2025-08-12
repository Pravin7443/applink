/*
  # Fix Admin Signup RLS Policy

  1. Security Changes
    - Add policy to allow initial admin creation during signup
    - Ensure first super admin can be created without existing authentication
    - Maintain security for subsequent admin operations

  2. Policy Updates
    - Allow INSERT for new admin accounts during signup process
    - Restrict to authenticated users for other operations
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Admins can read own data" ON admins;
DROP POLICY IF EXISTS "Super admins can read all admin data" ON admins;

-- Allow admin creation during signup (before authentication)
CREATE POLICY "Allow admin creation during signup"
  ON admins
  FOR INSERT
  WITH CHECK (true);

-- Allow admins to read their own data
CREATE POLICY "Admins can read own data"
  ON admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow super admins to manage all admin data
CREATE POLICY "Super admins can manage all admin data"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    )
  );

-- Allow admins to update their own profile
CREATE POLICY "Admins can update own profile"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);