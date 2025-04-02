import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Log environment variables for debugging
    console.log('DB Test API called');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'defined' : 'undefined');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'defined' : 'undefined');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'defined' : 'undefined');

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'Missing Supabase credentials' 
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // List all tables to check database access
    const { data: tables, error: tablesError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
      
    if (tablesError) {
      console.error('Error listing tables:', tablesError);
      
      // Fallback - try direct query on inventory table
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .limit(1);
        
      if (inventoryError) {
        console.error('Error querying inventory table:', inventoryError);
        return res.status(500).json({ 
          success: false, 
          error: `Database error: ${inventoryError.message}`,
          tablesError: tablesError.message
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Direct inventory query successful',
        inventoryData: inventory,
        tables: ['inventory (confirmed)']
      });
    }
    
    // Check specifically for inventory table
    const availableTables = tables?.map(t => t.tablename);
    const hasInventoryTable = availableTables?.includes('inventory');
    
    // Try to get a record from inventory table if it exists
    let inventoryData = null;
    let inventoryError = null;
    
    if (hasInventoryTable) {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .limit(1);
      
      inventoryData = data;
      inventoryError = error;
    }
    
    return res.status(200).json({
      success: true,
      tables: availableTables || [],
      hasInventoryTable,
      inventoryData,
      inventoryError: inventoryError ? inventoryError.message : null
    });
  } catch (error) {
    console.error('DB test error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 