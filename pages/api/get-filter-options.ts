import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../lib/supabase-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get Supabase client from singleton
    const supabase = getSupabaseClient();
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out after 20 seconds")), 20000);
    });

    // Setup queries for states, districts, and department types
    const statesQuery = supabase
      .from('inventory')
      .select('state')
      .order('state')
      .limit(1000); // Limit to first 1000 unique values

    const districtsQuery = supabase
      .from('inventory')
      .select('district')
      .order('district')
      .limit(1000); // Limit to first 1000 unique values

    const departmentTypesQuery = supabase
      .from('inventory')
      .select('department_type')
      .order('department_type')
      .limit(1000); // Limit to first 1000 unique values

    // Execute all queries with timeouts
    const [statesResult, districtsResult, departmentTypesResult] = await Promise.all([
      Promise.race([statesQuery, timeoutPromise]),
      Promise.race([districtsQuery, timeoutPromise]),
      Promise.race([departmentTypesQuery, timeoutPromise])
    ]) as any[];

    // Process results to extract unique values
    let states: string[] = [];
    let districts: string[] = [];
    let departmentTypes: string[] = [];
    
    // Check for errors in each query
    let errorMessages = [];

    // Process states
    if (statesResult.error) {
      console.error('Error fetching states:', statesResult.error);
      errorMessages.push(`States error: ${statesResult.error.message}`);
    } else if (statesResult.data) {
      states = [...new Set(statesResult.data.map((item: any) => item.state))]
        .filter(Boolean)
        .sort();
    }

    // Process districts
    if (districtsResult.error) {
      console.error('Error fetching districts:', districtsResult.error);
      errorMessages.push(`Districts error: ${districtsResult.error.message}`);
    } else if (districtsResult.data) {
      districts = [...new Set(districtsResult.data.map((item: any) => item.district))]
        .filter(Boolean)
        .sort();
    }

    // Process department types
    if (departmentTypesResult.error) {
      console.error('Error fetching department types:', departmentTypesResult.error);
      errorMessages.push(`Department types error: ${departmentTypesResult.error.message}`);
    } else if (departmentTypesResult.data) {
      departmentTypes = [...new Set(departmentTypesResult.data.map((item: any) => item.department_type))]
        .filter(Boolean)
        .sort();
    }

    // If all queries failed, return an error
    if (errorMessages.length === 3) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch any filter options',
        errors: errorMessages
      });
    }

    // Return the filter options with metadata
    return res.status(200).json({
      success: true,
      states,
      districts,
      departmentTypes,
      counts: {
        states: states.length,
        districts: districts.length,
        departmentTypes: departmentTypes.length
      },
      warnings: errorMessages.length > 0 ? errorMessages : undefined
    });
  } catch (error: any) {
    console.error('Exception in get-filter-options API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message || 'Unknown error'
    });
  }
} 