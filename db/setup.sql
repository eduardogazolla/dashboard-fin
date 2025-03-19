-- Create authorized_users table to store which users can access the dashboard
CREATE TABLE IF NOT EXISTS authorized_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for the authorized_users table
ALTER TABLE authorized_users ENABLE ROW LEVEL SECURITY;

-- Only allow authorized users to see the authorized_users table
CREATE POLICY "Authorized users can view authorized_users"
  ON authorized_users
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM authorized_users));

-- Only allow admins to insert/update/delete authorized_users
CREATE POLICY "Only admins can modify authorized_users"
  ON authorized_users
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM authorized_users WHERE is_admin = true));

-- Update transactions table to reference auth.users
ALTER TABLE transactions 
  DROP CONSTRAINT IF EXISTS transactions_user_id_fkey,
  ADD CONSTRAINT transactions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Update categories table to reference auth.users
ALTER TABLE categories 
  DROP CONSTRAINT IF EXISTS categories_user_id_fkey,
  ADD CONSTRAINT categories_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create RLS policies for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only view transactions if they are authorized
CREATE POLICY "Users can view all transactions if authorized"
  ON transactions
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM authorized_users));

-- Users can only insert their own transactions
CREATE POLICY "Users can insert their own transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own transactions
CREATE POLICY "Users can update their own transactions"
  ON transactions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own transactions
CREATE POLICY "Users can delete their own transactions"
  ON transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Users can only view categories if they are authorized
CREATE POLICY "Users can view all categories if authorized"
  ON categories
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM authorized_users));

-- Users can only insert their own categories
CREATE POLICY "Users can insert their own categories"
  ON categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own categories
CREATE POLICY "Users can update their own categories"
  ON categories
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own categories
CREATE POLICY "Users can delete their own categories"
  ON categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Insert initial authorized users (replace with your actual user IDs)
-- You'll need to create these users first through the Supabase Auth UI or API
INSERT INTO authorized_users (user_id, is_admin) 
VALUES 
  ('USER_ID_1', true),  -- Replace USER_ID_1 with the actual UUID of the first user
  ('USER_ID_2', false)  -- Replace USER_ID_2 with the actual UUID of the second user
ON CONFLICT (user_id) DO NOTHING;

