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
      setTimeout(() => reject(new Error("Request timed out after 10 seconds")), 10000);
    });

    // Get total count of inventory items with a timeout
    const result = await Promise.race([
      supabase.from('inventory').select('*', { count: 'exact', head: true }),
      timeoutPromise
    ]) as any;

    const { count, error } = result;

    if (error) {
      console.error('Error getting inventory count:', error);
      
      // If it's a timeout, try an alternative approach with a count approximation
      try {
        console.log('Trying alternative count approximation approach...');
        
        // Simple approach: Get a sample of rows and use that to estimate
        const { data: sampleData, error: sampleError } = await supabase
          .from('inventory')
          .select('id')
          .limit(100)
          .order('id', { ascending: false });
        
        if (sampleError) {
          console.error('Error getting sample data:', sampleError);
          throw sampleError;
        }
        
        if (sampleData && sampleData.length > 0) {
          // If we have sample data, assume IDs are sequential and approximate
          // This is a rough estimate but better than nothing
          const highestId = Math.max(...sampleData.map(item => parseInt(item.id) || 0));
          const estimatedCount = Math.max(highestId, 1000);
          
          console.log(`Estimated count based on highest ID: ${estimatedCount}`);
          
          return res.status(200).json({
            success: true,
            count: estimatedCount,
            isEstimate: true
          });
        }
        
        // Fallback to default estimate
        throw new Error('Could not estimate count from sample');
      } catch (fallbackError) {
        console.error('Fallback count estimation also failed:', fallbackError);
        
        // Return a default count as last resort
        return res.status(200).json({
          success: true,
          count: 300000,
          isEstimate: true,
          isFallback: true
        });
      }
    }

    // Return the count
    return res.status(200).json({
      success: true,
      count: count || 0
    });
  } catch (error: any) {
    console.error('Exception in inventory-count API:', error);
    
    // Return a fallback count even in case of error
    return res.status(200).json({ 
      success: true,
      count: 300000,
      isEstimate: true,
      isFallback: true,
      errorMessage: error.message || 'Unknown error'
    });
  }
} 