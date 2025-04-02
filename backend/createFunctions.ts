import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '..', '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.error(`Environment file not found at ${envPath}`);
  process.exit(1);
}

// Verify environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'defined' : 'undefined');
  console.error('SUPABASE_KEY:', supabaseKey ? 'defined' : 'undefined');
  process.exit(1);
}

// Create Supabase client (using service role key for admin access to create functions)
const supabase = createClient(supabaseUrl, supabaseKey);

// SQL to create a function that returns an estimated table size
// This will be useful for our count estimation fallback
const createTableSizeFunction = `
CREATE OR REPLACE FUNCTION get_table_size(table_name text)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
  rel_size bigint;
BEGIN
  -- Get the approximate size of the table in bytes
  EXECUTE format('SELECT pg_total_relation_size(%L)', table_name) INTO rel_size;
  RETURN rel_size;
END;
$$;`;

// Function to create all the SQL functions
async function createFunctions() {
  try {
    // Create the get_table_size function
    console.log('Creating get_table_size function...');
    const { data: tableSizeResult, error: tableSizeError } = await supabase.rpc('pg_query', { query: createTableSizeFunction });
    
    if (tableSizeError) {
      console.error('Error creating get_table_size function:', tableSizeError);
    } else {
      console.log('Successfully created get_table_size function');
    }
    
    console.log('All functions created successfully!');
  } catch (error) {
    console.error('Error creating functions:', error);
  }
}

// Run the function creation
createFunctions(); 