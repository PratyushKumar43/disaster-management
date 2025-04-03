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
    // Get pagination parameters from query
    const offset = parseInt(req.query.offset as string) || 0;
    // Limit chunk size to 20000 max to improve loading performance
    const requestedLimit = parseInt(req.query.limit as string) || 20000;
    const limit = Math.min(requestedLimit, 20000);

    console.log(`API: Fetching inventory items with offset ${offset} and limit ${limit}`);

    // Get Supabase client from singleton
    const supabase = getSupabaseClient();

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out after 15 seconds")), 15000);
    });

    // Build query with pagination
    let query = supabase
      .from('inventory')
      .select('*')
      .order('state', { ascending: true })
      .order('district', { ascending: true })
      .range(offset, offset + limit - 1);

    // Optional filters from query parameters
    if (req.query.state && req.query.state !== 'all') {
      query = query.eq('state', req.query.state);
    }

    if (req.query.district && req.query.district !== 'all') {
      query = query.eq('district', req.query.district);
    }

    if (req.query.department_type && req.query.department_type !== 'all') {
      query = query.eq('department_type', req.query.department_type);
    }

    // Execute the query with a timeout
    const result = await Promise.race([
      query,
      timeoutPromise
    ]) as any;

    const { data, error } = result;

    if (error) {
      console.error('Error fetching inventory items:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching inventory items',
        error: error.message
      });
    }

    console.log(`API: Successfully fetched ${data?.length || 0} items`);

    // Process items to ensure required fields
    const processedItems = (data || []).map(item => ({
      ...item,
      id: item.id || `temp-${Date.now()}-${Math.random()}`,
      created_at: item.created_at || new Date().toISOString()
    }));

    // Return data with metadata
    return res.status(200).json({
      success: true,
      items: processedItems,
      metadata: {
        offset,
        limit,
        returned: processedItems.length,
        hasMore: processedItems.length === limit
      }
    });
  } catch (error: any) {
    console.error('Exception in inventory API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message || 'Unknown error'
    });
  }
} 