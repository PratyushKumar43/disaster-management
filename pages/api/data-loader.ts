import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get query parameters
    const { offset = '0', limit = '5000' } = req.query;
    const offsetNum = parseInt(offset as string, 10);
    const limitNum = parseInt(limit as string, 10);

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

    // Create Supabase client with service role key for maximum access
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if we need metadata (count)
    const needsCount = offsetNum === 0;
    
    // Get total count if this is the first request
    let totalCount = 0;
    if (needsCount) {
      const { count, error: countError } = await supabase
        .from('inventory')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error('Error getting count:', countError);
      } else {
        totalCount = count || 0;
        console.log(`Total count of inventory items: ${totalCount}`);
      }
    }

    // Get chunk of data
    console.log(`Fetching items from ${offsetNum} to ${offsetNum + limitNum - 1}`);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .range(offsetNum, offsetNum + limitNum - 1)
      .order('state')
      .order('district');

    if (error) {
      console.error('Database error fetching items:', error);
      return res.status(500).json({ 
        error: 'Database error',
        details: error.message
      });
    }

    // Get unique values for filters if this is the first request
    let filterOptions = {};
    if (needsCount && data && data.length > 0) {
      // Extract unique values for filters
      const uniqueStates = [...new Set(data.map(item => item.state))]
        .filter(Boolean)
        .sort();
        
      const uniqueDistricts = [...new Set(data.map(item => item.district))]
        .filter(Boolean)
        .sort();
        
      const uniqueDeptTypes = [...new Set(data.map(item => item.department_type))]
        .filter(Boolean)
        .sort();
        
      filterOptions = {
        states: uniqueStates,
        districts: uniqueDistricts,
        departmentTypes: uniqueDeptTypes
      };
      
      console.log(`Extracted filter options: ${uniqueStates.length} states, ${uniqueDistricts.length} districts, ${uniqueDeptTypes.length} department types`);
    }

    // Return the data chunk
    return res.status(200).json({ 
      success: true,
      items: data || [],
      count: data?.length || 0,
      totalCount: needsCount ? totalCount : undefined,
      hasMore: data && data.length === limitNum,
      filterOptions: needsCount ? filterOptions : undefined,
      nextOffset: data && data.length === limitNum ? offsetNum + limitNum : null
    });

  } catch (error) {
    console.error('Error in data-loader API:', error);
    return res.status(500).json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 