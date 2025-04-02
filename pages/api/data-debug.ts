import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check environment variables
    console.log('Data Debug API called');
    console.log('Environment variables:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'defined' : 'undefined');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'defined' : 'undefined');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'defined' : 'undefined');

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase credentials',
        env: {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'defined' : 'undefined',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'defined' : 'undefined',
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'defined' : 'undefined'
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test data retrieval
    // 1. Basic connection test
    const { data: basicData, error: basicError } = await supabase
      .from('inventory')
      .select('*')
      .limit(1);
      
    if (basicError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to connect to inventory table',
        details: basicError
      });
    }
    
    // 2. Get unique states
    const { data: statesData, error: statesError } = await supabase
      .from('inventory')
      .select('state');
      
    const uniqueStates = statesData && statesData.length > 0 
      ? [...new Set(statesData.map(item => item.state))].filter(Boolean).sort()
      : [];
      
    // 3. Get unique districts
    const { data: districtsData, error: districtsError } = await supabase
      .from('inventory')
      .select('district');
      
    const uniqueDistricts = districtsData && districtsData.length > 0 
      ? [...new Set(districtsData.map(item => item.district))].filter(Boolean).sort()
      : [];
      
    // 4. Get unique department types
    const { data: deptsData, error: deptsError } = await supabase
      .from('inventory')
      .select('department_type');
      
    const uniqueDepts = deptsData && deptsData.length > 0 
      ? [...new Set(deptsData.map(item => item.department_type))].filter(Boolean).sort()
      : [];
      
    // Return results
    return res.status(200).json({
      success: true,
      basicTest: {
        success: !basicError,
        data: basicData && basicData.length > 0 ? basicData[0] : null,
        count: basicData?.length || 0
      },
      states: {
        success: !statesError,
        count: uniqueStates.length,
        data: uniqueStates.slice(0, 10),
        hasMore: uniqueStates.length > 10
      },
      districts: {
        success: !districtsError,
        count: uniqueDistricts.length,
        data: uniqueDistricts.slice(0, 10),
        hasMore: uniqueDistricts.length > 10
      },
      departmentTypes: {
        success: !deptsError,
        count: uniqueDepts.length,
        data: uniqueDepts
      },
      env: {
        NODE_ENV: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('API data-debug error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 