import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envLocalPath = path.resolve(process.cwd(), '..', '.env.local');
console.log('Looking for .env.local at:', envLocalPath);

if (fs.existsSync(envLocalPath)) {
  console.log('Loading environment variables from', envLocalPath);
  dotenv.config({ path: envLocalPath });
} else {
  console.log('.env.local not found, checking for .env');
  dotenv.config();
}

// We need service role key for this
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials. Service role key is required.');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Using SERVICE ROLE key to fix RLS policies');
const supabase = createClient(supabaseUrl, serviceKey);

async function fixRowLevelSecurity() {
  console.log('\n=== FIXING ROW LEVEL SECURITY FOR INVENTORY TABLE ===');
  
  // First check if table exists
  console.log('\nChecking if inventory table exists:');
  try {
    const { data: invData, error: invError } = await supabase
      .from('inventory')
      .select('*')
      .limit(1);
      
    if (invError) {
      console.error('❌ Error accessing inventory table:', invError);
      console.log('Cannot fix RLS until table is accessible');
      return;
    }
    
    console.log('✅ Inventory table exists and is accessible');
  } catch (error) {
    console.error('Exception checking table existence:', error);
    return;
  }

  // Step 1: Execute SQL to enable RLS on the table if not already enabled
  console.log('\n1. Enabling Row Level Security on inventory table:');
  try {
    const { data: enableRlsData, error: enableRlsError } = await supabase.rpc(
      'execute_sql',
      { query: `ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;` }
    );
    
    if (enableRlsError) {
      console.error('❌ Error enabling RLS:', enableRlsError);
      
      // Try an alternative approach with direct REST API call
      console.log('Trying alternative approach...');
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        },
        body: JSON.stringify({
          query: `ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;`
        })
      });
      
      if (!response.ok) {
        console.error('❌ Alternative approach also failed:', await response.text());
        console.log('Continuing with other steps...');
      } else {
        console.log('✅ Alternative approach successful');
      }
    } else {
      console.log('✅ RLS enabled successfully');
    }
  } catch (error) {
    console.error('Exception enabling RLS:', error);
    console.log('Continuing with other steps...');
  }
  
  // Step 2: Create a policy for anonymous read access
  console.log('\n2. Creating policy for anonymous read access:');
  try {
    // First, try to drop existing policy if it exists (to avoid errors)
    const dropPolicyQuery = `
      DROP POLICY IF EXISTS anon_read_access ON public.inventory;
    `;
    
    await supabase.rpc('execute_sql', { query: dropPolicyQuery })
      .catch(err => console.log('Note: Policy might not exist yet, continuing...'));
    
    // Now create the policy
    const createPolicyQuery = `
      CREATE POLICY anon_read_access ON public.inventory
      FOR SELECT
      TO anon
      USING (true);
    `;
    
    const { error: createPolicyError } = await supabase.rpc(
      'execute_sql',
      { query: createPolicyQuery }
    );
    
    if (createPolicyError) {
      console.error('❌ Error creating read policy:', createPolicyError);
      
      // Try SQL auth directly if RPC fails
      console.log('Falling back to SQL auth directly...');
      
      // Create an auth client
      const { data: authData, error: authError } = await supabase.auth.admin.createClient({
        global: {
          db: {
            schema: 'public'
          }
        }
      });
      
      if (authError) {
        console.error('❌ Auth client creation failed:', authError);
      } else {
        console.log('✅ Auth client created, attempting direct SQL execution...');
        // Attempt would continue here with the auth client
      }
    } else {
      console.log('✅ Anonymous read policy created successfully');
    }
  } catch (error) {
    console.error('Exception creating read policy:', error);
  }
  
  // Step 3: Check if the policy was applied successfully
  console.log('\n3. Verifying anonymous access:');
  try {
    // Create a new temporary anon client to test access
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!anonKey) {
      console.error('❌ Missing anon key for verification');
      return;
    }
    
    const anonClient = createClient(supabaseUrl, anonKey);
    
    // Test query with anon client
    const { data: testData, error: testError } = await anonClient
      .from('inventory')
      .select('id, state, district')
      .limit(3);
      
    if (testError) {
      console.error('❌ Verification failed:', testError);
      console.log('RLS may still be restricting access');
    } else {
      console.log('✅ Anonymous access verification successful!');
      console.log(`Retrieved ${testData?.length || 0} records`);
    }
  } catch (error) {
    console.error('Exception verifying access:', error);
  }
  
  // Step 4: Generate SQL for manual execution if automatic approaches failed
  console.log('\n4. SQL commands for manual execution if needed:');
  const manualSql = `
-- Connect to your database using psql or the Supabase SQL editor and run:

-- Enable RLS on the table
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Create policy allowing anonymous read access
DROP POLICY IF EXISTS anon_read_access ON public.inventory;
CREATE POLICY anon_read_access ON public.inventory
FOR SELECT
TO anon
USING (true);

-- Verify policy exists
SELECT tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'inventory';
`;

  console.log(manualSql);
}

// Run the function
fixRowLevelSecurity()
  .catch(err => console.error('Fatal error:', err))
  .finally(() => console.log('\nRLS fix attempt completed')); 