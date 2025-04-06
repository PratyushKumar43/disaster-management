import { createClient, Session, AuthError } from '@supabase/supabase-js';

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
    // Create with improved options for reliability and error handling
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: true, // Enable token refresh for more reliable authentication
        storageKey: 'supabase-auth-token', // Explicit storage key
        detectSessionInUrl: false // Disable automatic detection which can cause issues
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-application-name': 'disaster-management-app' // Custom header for tracking/debugging
        },
        fetch: (url, options = {}) => {
          // Add timeout to prevent hanging requests
          const timeoutController = new AbortController();
          const timeoutId = setTimeout(() => timeoutController.abort(), 30000); // 30 second timeout
          
          return fetch(url, {
            ...options,
            signal: timeoutController.signal
          }).finally(() => {
            clearTimeout(timeoutId);
          });
        }
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

// Create a client instance with error handling
let supabaseClient;

try {
  // Create the client
  supabaseClient = getSupabaseClient();
  
  // Basic diagnostic check (non-blocking)
  supabaseClient.auth.getSession().then(({ data, error }: { data: { session: Session | null }, error: AuthError | null }) => {
    if (error) {
      console.warn('Supabase authentication diagnostic check failed:', error.message);
    } else {
      console.log('Supabase client initialized successfully');
    }
  }).catch((err: Error) => {
    console.warn('Supabase diagnostic check exception:', err.message);
  });
} catch (error) {
  console.error('Critical error initializing Supabase client:', error);
  // Use fallback with basic settings
  supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { auth: { persistSession: false } }
  );
}

// Export a default client for convenience
export const supabase = supabaseClient; 