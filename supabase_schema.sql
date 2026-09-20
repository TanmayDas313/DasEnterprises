-- ====================================================================
-- DAS ENTERPRISE — SUPABASE DATABASE SCHEMA & RLS SECURITY POLICIES
-- ====================================================================
-- Execute this script in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ====================================================================

-- 1. Create the customer_enquiries table
CREATE TABLE IF NOT EXISTS public.customer_enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  business_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  industry TEXT,
  product TEXT,
  message TEXT,
  source TEXT NOT NULL CHECK (source IN ('contact', 'free_demo', 'get_started', 'product_enquiry')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for fast sorting by newest enquiries
CREATE INDEX IF NOT EXISTS idx_customer_enquiries_created_at 
  ON public.customer_enquiries (created_at DESC);

-- Index for searching by email & source
CREATE INDEX IF NOT EXISTS idx_customer_enquiries_email 
  ON public.customer_enquiries (email);

-- ====================================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on the table
ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow public anonymous insert" ON public.customer_enquiries;
DROP POLICY IF EXISTS "Allow authenticated admin select" ON public.customer_enquiries;
DROP POLICY IF EXISTS "Allow authenticated admin delete" ON public.customer_enquiries;

-- Policy 1: Allow public visitors (anonymous) to INSERT enquiries only
CREATE POLICY "Allow public anonymous insert"
  ON public.customer_enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND length(trim(name)) > 0 AND
    email IS NOT NULL AND length(trim(email)) > 0 AND
    phone IS NOT NULL AND length(trim(phone)) > 0 AND
    source IS NOT NULL
  );

-- Policy 2: Allow ONLY authenticated users (Admins) to READ enquiries
CREATE POLICY "Allow authenticated admin select"
  ON public.customer_enquiries
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Allow ONLY authenticated users (Admins) to DELETE enquiries
CREATE POLICY "Allow authenticated admin delete"
  ON public.customer_enquiries
  FOR DELETE
  TO authenticated
  USING (true);

-- ====================================================================
-- Verification Check:
-- Public (anon) cannot SELECT, UPDATE, or DELETE enquiries.
-- Enquiries are inserted safely and securely.
-- ====================================================================
