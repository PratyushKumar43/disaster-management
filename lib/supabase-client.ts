import { createClient } from '@supabase/supabase-js';

// Singleton instance
let supabaseInstance: any = null;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

/**
 * Get the Supabase client instance (singleton pattern)
 * This prevents multiple instances of the client which can cause warnings
 */
export function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  // Track connection attempts
  connectionAttempts++;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials:');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'defined' : 'undefined');
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'defined' : 'undefined');
    throw new Error('Missing Supabase credentials');
  }
  
  console.log('Creating new Supabase client instance');
  
  try {
    // Create with persistSession: false to avoid GoTrueClient warnings
    // Add additional options for better stability
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      db: {
        schema: 'public'
      }
    });
    
    return supabaseInstance;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      console.log(`Retrying connection (attempt ${connectionAttempts} of ${MAX_CONNECTION_ATTEMPTS})`);
      return getSupabaseClient();
    }
    
    // Final fallback with minimal options
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    });
    
    return supabaseInstance;
  }
}

// Export a default client for convenience
export const supabase = getSupabaseClient(); 