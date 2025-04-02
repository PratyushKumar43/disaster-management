import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local file
const envPath = path.resolve(process.cwd(), '..', '.env.local');
console.log(`Looking for .env.local at: ${envPath}`);
if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log(`Warning: .env.local file not found at ${envPath}`);
}

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'defined' : 'undefined');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'defined' : 'undefined');
  process.exit(1);
}

console.log('Initializing Supabase client with service role key');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixInventoryTable() {
  try {
    console.log('Checking inventory table...');
    
    // Test connection
    console.log('Testing connection to Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('inventory')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('Error testing connection:', testError);
      console.log('\nInventory table may not exist. Here are the SQL commands to create it:\n');
      
      console.log(`
-- Create inventory table
CREATE TABLE public.inventory (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    state text NOT NULL,
    district text NOT NULL,
    department_type text NOT NULL,
    department_name text NOT NULL,
    item_code integer NOT NULL,
    item_name text NOT NULL,
    quantity integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX inventory_state_idx ON public.inventory (state);
CREATE INDEX inventory_district_idx ON public.inventory (district);
CREATE INDEX inventory_department_type_idx ON public.inventory (department_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access (read only)
CREATE POLICY "Allow anonymous read access"
  ON public.inventory
  FOR SELECT
  TO anon
  USING (true);

-- Create policy for authenticated users (full access)
CREATE POLICY "Allow authenticated full access"
  ON public.inventory
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for service role (full access)
CREATE POLICY "Allow service role full access"
  ON public.inventory
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
      `);
      
      console.log('You can run these commands in the Supabase SQL Editor (https://app.supabase.com/project/_/sql)');
      return;
    }
    
    console.log('Connection successful!');
    
    if (testData && testData.length > 0) {
      console.log('Found inventory data:', testData[0]);
    } else {
      console.log('Inventory table exists but is empty');
    }
    
    // Check RLS policies
    console.log('\nChecking Row Level Security (RLS) policies...');
    
    // We can't directly query the policies easily through the API
    // So we'll try to access with anon key to see if RLS is properly configured
    const anonUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!anonKey) {
      console.error('Missing anon key, cannot test RLS');
      return;
    }
    
    const anonClient = createClient(anonUrl, anonKey);
    const { data: anonData, error: anonError } = await anonClient
      .from('inventory')
      .select('count')
      .limit(1);
    
    if (anonError) {
      console.error('Error accessing with anon key, RLS might be blocking access:', anonError);
      
      console.log('\nHere are commands to fix RLS policies:\n');
      console.log(`
-- Make sure Row Level Security (RLS) is enabled
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if needed
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.inventory;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.inventory;
DROP POLICY IF EXISTS "Allow service role full access" ON public.inventory;

-- Create policy for anonymous access (read only)
CREATE POLICY "Allow anonymous read access"
  ON public.inventory
  FOR SELECT
  TO anon
  USING (true);

-- Create policy for authenticated users (full access)
CREATE POLICY "Allow authenticated full access"
  ON public.inventory
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for service role (full access)
CREATE POLICY "Allow service role full access"
  ON public.inventory
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
      `);
    } else {
      console.log('RLS is properly configured! Anonymous access is working.');
    }
    
    console.log('\nInventory table check completed.');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixInventoryTable(); 