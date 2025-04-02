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
    console.log('API: Checking Supabase connection...');
    
    // Get Supabase client from singleton
    const supabase = getSupabaseClient();

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out after 5 seconds")), 5000);
    });

    // Perform a simple query to check connection
    const result = await Promise.race([
      supabase.from('inventory').select('id', { count: 'exact', head: true }),
      timeoutPromise
    ]) as any;

    const { count, error } = result;

    if (error) {
      console.error('Database connection error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // If we get here, connection was successful
    return res.status(200).json({
      success: true,
      message: 'Successfully connected to database',
      inventoryCount: count || 0,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL 
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 15)}...` 
        : 'Not configured',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Exception checking database connection:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error while checking database connection',
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 