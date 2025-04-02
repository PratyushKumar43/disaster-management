import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Supabase connection info
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'Missing database credentials'
      });
    }

    // Create Supabase client with service role key (required for RLS operations)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. First check if the inventory table exists
    const { data: tableData, error: tableError } = await supabase
      .from('inventory')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('Error checking inventory table:', tableError);
      return res.status(500).json({
        error: 'Database error',
        details: tableError.message,
        hint: 'The inventory table may not exist'
      });
    }

    // 2. Generate SQL to fix RLS
    // Since we can't directly execute SQL via the JS client, we'll return the SQL for manual execution
    const fixRlsSql = `
-- Enable RLS on the inventory table
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

    // Return success with instructions
    return res.status(200).json({
      success: true,
      message: 'Inventory table verified. SQL for RLS fixes is included.',
      sql: fixRlsSql,
      instructions: 'Execute this SQL in the Supabase SQL Editor to fix Row Level Security policies'
    });

  } catch (error) {
    console.error('Error in fix-rls API:', error);
    return res.status(500).json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 