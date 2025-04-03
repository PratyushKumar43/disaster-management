import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Enable debug mode to log detailed information
const DEBUG = true;

// Get Supabase URL and anon key from environment variables
// These are public and safe to use in browser code
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Service role key should only be used on the server side
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if credentials are available and log warnings in development
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'defined' : 'undefined');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'defined' : 'undefined');
  console.error('Please check your .env.local file and restart the server.');
}

if (DEBUG) {
  console.log('=== Supabase Client Initialization ===');
  console.log('Environment:', typeof window === 'undefined' ? 'server' : 'browser');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'defined' : 'undefined');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'defined' : 'undefined');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'defined' : 'undefined');
}

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

// Function to get the Supabase client (singleton pattern)
export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  if (DEBUG) {
    console.log('Creating new Supabase client instance');
  }
  
  supabaseInstance = createClient(
    supabaseUrl || '', 
    supabaseAnonKey || '',
    {
      auth: {
        persistSession: false // Prevent multiple GoTrueClient warnings
      }
    }
  );
  
  // Add debug wrapper for common methods
  if (DEBUG) {
    const originalFrom = supabaseInstance.from.bind(supabaseInstance);
    supabaseInstance.from = (table: string) => {
      console.log(`Supabase query: accessing table '${table}'`);
      const builder = originalFrom(table);
      
      // Wrap select method for debugging
      const originalSelect = builder.select.bind(builder);
      builder.select = function(columns: any, options: any) {
        console.log(`Supabase query: select from '${table}'`, { columns, options });
        return originalSelect(columns, options);
      };
      
      return builder;
    };
  }
  
  return supabaseInstance;
}

// Function to get Supabase admin client with service role key
// This should only be used on the server side for admin operations
export function getSupabaseAdminClient(): SupabaseClient {
  // Check if we're in the browser - shouldn't use service role key there
  if (typeof window !== 'undefined') {
    console.error('Warning: Attempted to use admin client in browser environment');
    return getSupabaseClient(); // Fallback to standard client in browser
  }

  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }
  
  if (!supabaseServiceKey) {
    console.warn('Service role key not available, falling back to anon key');
    return getSupabaseClient();
  }
  
  if (DEBUG) {
    console.log('Creating new Supabase admin client instance with service role');
  }

  supabaseAdminInstance = createClient(
    supabaseUrl || '',
    supabaseServiceKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
  
  return supabaseAdminInstance;
}

// For backward compatibility, export a singleton instance
export const supabase = getSupabaseClient();

// Export a function to check connectivity
export async function checkSupabaseConnection() {
  try {
    if (DEBUG) {
      console.log('Testing Supabase connection...');
    }
    
    const client = getSupabaseClient();
    
    // Simple ping test - try to get one row from the inventory table
    const { data, error } = await client
      .from('inventory')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error: error.message };
    }
    
    // Extract count value from the response
    const count = data ? (data as any).count || 0 : 0;
    
    if (DEBUG) {
      console.log('Supabase connection successful', `total count: ${count}`);
    }
    
    return { 
      success: true, 
      message: 'Supabase connection successful', 
      count: count
    };
  } catch (error) {
    console.error('Exception checking Supabase connection:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 