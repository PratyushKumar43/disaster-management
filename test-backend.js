// Simple script to test backend functions
// Register ts-node to handle TypeScript files
require('ts-node/register');
require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Log environment variables (without revealing secrets)
console.log('Environment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[DEFINED]' : '[UNDEFINED]');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '[DEFINED]' : '[UNDEFINED]');

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBackend() {
  try {
    console.log('\n--- TESTING SUPABASE CONNECTION ---');
    
    // Test basic query
    console.log('Fetching 3 inventory items...');
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .limit(3);
    
    if (error) {
      console.error('Error querying inventory:', error);
    } else {
      console.log(`Successfully retrieved ${data.length} items:`);
      console.log(JSON.stringify(data, null, 2));
    }
    
    // Load our inventory functions
    try {
      console.log('\n--- TESTING BACKEND FUNCTIONS ---');
      // Import the TypeScript module with the .ts extension
      const inventory = require('./backend/inventory.ts');
      console.log('Backend module loaded successfully');
      
      // Test getInventoryItems
      console.log('\nTesting getInventoryItems...');
      const items = await inventory.getInventoryItems({ limit: 3 });
      console.log(`Found ${items.success ? items.data.length : 0} items`);
      if (items.success && items.data.length > 0) {
        console.log('First item:', JSON.stringify(items.data[0], null, 2));
      }
      
      // Test getUniqueStates
      console.log('\nTesting getUniqueStates...');
      const states = await inventory.getUniqueStates();
      console.log(`Found ${states.success ? states.data.length : 0} unique states`);
      if (states.success && states.data.length > 0) {
        console.log('States:', JSON.stringify(states.data, null, 2));
      }
      
      // Test getUniqueDistricts
      console.log('\nTesting getUniqueDistricts...');
      const districts = await inventory.getUniqueDistricts();
      console.log(`Found ${districts.success ? districts.data.length : 0} unique districts`);
      if (districts.success && districts.data.length > 0) {
        console.log('First 5 districts:', JSON.stringify(districts.data.slice(0, 5), null, 2));
      }
    } catch (err) {
      console.error('Error loading backend functions:', err);
      console.error(err.stack);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testBackend(); 