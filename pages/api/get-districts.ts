import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get query parameters
    const { state } = req.query;

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

    console.log(`API: Fetching all unique districts${state ? ' for state ' + state : ''}...`);
    
    // Build query
    let query = supabase
      .from('inventory')
      .select('district, state')
      .not('district', 'is', null)
      .not('district', 'eq', '')
      .order('district');
    
    // Add state filter if provided
    if (state && state !== 'all') {
      console.log(`API: Filtering districts by state: ${state}`);
      query = query.eq('state', state);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error('Database error fetching districts:', error);
      return res.status(500).json({ 
        error: 'Database error',
        details: error.message
      });
    }

    // Extract unique districts
    const uniqueDistricts = [...new Set(data.map(item => item.district))]
      .filter(Boolean) // Remove empty values
      .sort();

    console.log(`API: Found ${uniqueDistricts.length} unique districts${state ? ' for state ' + state : ''}`);
    console.log(`API: First few districts: ${uniqueDistricts.slice(0, 5).join(', ')}...`);

    // Return the districts
    return res.status(200).json({ 
      success: true,
      districts: uniqueDistricts,
      count: uniqueDistricts.length,
      state: state || 'all'
    });

  } catch (error) {
    console.error('Error in get-districts API:', error);
    return res.status(500).json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 