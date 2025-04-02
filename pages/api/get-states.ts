import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Supabase connection info
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'Missing database credentials'
      });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('API: Fetching all unique states...');
    
    // Use PostgreSQL DISTINCT to get unique states directly from the database
    // This is much more efficient than fetching all records and filtering in JS
    const { data, error } = await supabase
      .from('inventory')
      .select('state')
      .not('state', 'is', null)
      .not('state', 'eq', '')
      .order('state');

    if (error) {
      console.error('Database error fetching states:', error);
      return res.status(500).json({ 
        error: 'Database error',
        details: error.message
      });
    }

    // Extract unique states with a Set to deduplicate
    const uniqueStates = [...new Set(data.map(item => item.state))]
      .filter(Boolean) // Remove any empty values
      .sort();

    console.log(`API: Found ${uniqueStates.length} unique states`);

    // Return the states
    return res.status(200).json({ 
      success: true,
      states: uniqueStates,
      count: uniqueStates.length
    });

  } catch (error) {
    console.error('Error in get-states API:', error);
    return res.status(500).json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 