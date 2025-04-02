import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Log environment variables (without exposing actual values)
    console.log('API Route: Checking environment variables');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'defined' : 'undefined');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'defined' : 'undefined');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'defined' : 'undefined');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'Missing Supabase credentials in environment variables' 
      });
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test connection by fetching a single record
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .limit(1);
    
    if (error) {
      return res.status(500).json({ 
        success: false, 
        error: `Database error: ${error.message}` 
      });
    }
    
    // Get some basic stats
    const { count, error: countError } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      return res.status(500).json({ 
        success: false, 
        error: `Count error: ${countError.message}`
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Successfully connected to Supabase',
      hasData: Array.isArray(data) && data.length > 0,
      totalRecords: count || 0,
      sample: data && data.length > 0 ? data[0] : null
    });
  } catch (error) {
    console.error('API connection test error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 