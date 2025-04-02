import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envLocalPath = path.resolve(process.cwd(), '..', '.env.local');
console.log('Looking for .env.local at:', envLocalPath);

if (fs.existsSync(envLocalPath)) {
  console.log('Loading environment variables from', envLocalPath);
  dotenv.config({ path: envLocalPath });
} else {
  console.log('.env.local not found, checking for .env');
  dotenv.config();
}

// Initialize Supabase client with ANON key only
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !anonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Using ANON key');
const supabase = createClient(supabaseUrl, anonKey);

async function checkAnonAccess() {
  console.log('\n=== CHECKING ANONYMOUS ACCESS TO INVENTORY TABLE ===');
  
  // Test 1: Simple select with fields
  console.log('\n1. Testing basic select access:');
  try {
    const { data: basicData, error: basicError } = await supabase
      .from('inventory')
      .select('id, state, district, department_type, department_name')
      .limit(3);
      
    if (basicError) {
      console.error('❌ Error with basic select:', basicError);
    } else {
      console.log('✅ Basic select successful');
      console.log(`Retrieved ${basicData?.length || 0} records`);
      if (basicData && basicData.length > 0) {
        console.log('Sample record:', basicData[0]);
      }
    }
  } catch (error) {
    console.error('Exception in basic select test:', error);
  }
  
  // Test 2: Get unique states
  console.log('\n2. Testing getting unique states:');
  try {
    const { data: statesData, error: statesError } = await supabase
      .from('inventory')
      .select('state');
      
    if (statesError) {
      console.error('❌ Error fetching states:', statesError);
    } else {
      console.log('✅ States query successful');
      console.log(`Retrieved ${statesData?.length || 0} state records`);
      
      // Extract unique states
      if (statesData && statesData.length > 0) {
        const uniqueStates = [...new Set(statesData.map(item => item.state))]
          .filter(Boolean)
          .sort();
          
        console.log(`Found ${uniqueStates.length} unique states:`, uniqueStates);
      }
    }
  } catch (error) {
    console.error('Exception in states test:', error);
  }
  
  // Test 3: Check filter access
  console.log('\n3. Testing filtering capabilities:');
  try {
    // First get a sample state to use in filter
    const { data: sampleData } = await supabase
      .from('inventory')
      .select('state')
      .limit(1);
      
    if (sampleData && sampleData.length > 0) {
      const stateToFilter = sampleData[0].state;
      console.log(`Using state "${stateToFilter}" for filter test`);
      
      const { data: filteredData, error: filteredError } = await supabase
        .from('inventory')
        .select('id, state, district, department_type')
        .eq('state', stateToFilter)
        .limit(3);
        
      if (filteredError) {
        console.error('❌ Error with filtered select:', filteredError);
      } else {
        console.log('✅ Filtered select successful');
        console.log(`Retrieved ${filteredData?.length || 0} records for state "${stateToFilter}"`);
      }
    } else {
      console.log('No sample data available for filter test');
    }
  } catch (error) {
    console.error('Exception in filter test:', error);
  }

  // Test 4: Check if RLS is restricting access
  console.log('\n4. Testing if Row Level Security is affecting queries:');
  try {
    // Count records as anon user
    const { count: anonCount, error: countError } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('❌ Error counting records:', countError);
      console.log('This could indicate a Row Level Security restriction');
    } else {
      console.log(`✅ Anonymous user can see ${anonCount || 0} total records`);
      console.log('Anon access appears to be working correctly');
    }
  } catch (error) {
    console.error('Exception in RLS test:', error);
  }
  
  // Test 5: Check performance for large dataset retrieval
  console.log('\n5. Testing retrieval of larger dataset (limit 100):');
  try {
    console.time('Large query');
    const { data: largeData, error: largeError } = await supabase
      .from('inventory')
      .select('id, state, district, department_type')
      .limit(100);
    console.timeEnd('Large query');
      
    if (largeError) {
      console.error('❌ Error with large query:', largeError);
    } else {
      console.log('✅ Large query successful');
      console.log(`Retrieved ${largeData?.length || 0} records`);
    }
  } catch (error) {
    console.error('Exception in large query test:', error);
  }
}

// Run the check
checkAnonAccess()
  .catch(err => console.error('Fatal error in check process:', err))
  .finally(() => console.log('\nAccess check completed')); 