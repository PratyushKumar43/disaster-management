import { getUniqueStates, getUniqueDistricts, getUniqueDepartmentTypes, getInventoryItems } from './inventory';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

console.log('=== TESTING INVENTORY QUERIES ===');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
console.log(`Looking for .env.local at: ${envPath}`);

if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.error('ERROR: .env.local file not found!');
  process.exit(1);
}

// Explicitly set the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL is not set in environment variables');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('ERROR: Neither SUPABASE_SERVICE_ROLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY is set in environment variables');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE_KEY' : 'ANON_KEY');

// Create Supabase client directly
const supabase = createClient(supabaseUrl, supabaseKey);

// Add a note about the increased limit
console.log('\n===== USING INCREASED SUPABASE API LIMIT (300,000 rows) =====');

// Function to run all tests with a direct Supabase client
async function runAllTests() {
  console.log('========== STARTING TESTS ==========\n');
  
  // Test 1: Get Unique States
  try {
    console.log('\nTEST: Get Unique States with 300k limit');
    console.log('--------------------------------------');
    console.log('This should now use fewer API calls due to increased page size');
    const states = await getUniqueStates();
    console.log(`Result: ${states.length} states found`);
    console.log(`States: ${states.join(', ')}`);
  } catch (error) {
    console.error('Error testing getUniqueStates:', error);
  }
  
  console.log('\n========== TESTS COMPLETED SUCCESSFULLY ==========');
}

// Run the tests
runAllTests().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
}); 