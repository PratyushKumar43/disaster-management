import { NextApiRequest, NextApiResponse } from 'next';
import { debugDatabase } from '../../backend/inventory';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('Running database debug checks...');
    
    // Run the debug function
    const results = await debugDatabase();
    
    // Return the results
    return res.status(200).json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in debug-database API:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error running database debug checks',
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 