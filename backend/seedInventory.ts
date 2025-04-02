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

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

// Sample data
const sampleStates = ['Assam', 'Kerala'];
const sampleDistricts = {
  'Assam': ['Bongaigaon', 'Charaideo', 'Darrang', 'Dhubri', 'Dibrugarh', 'Hojai', 'Jorhat', 'Kamrup', 'Karbi Anglong', 'Nagaon', 'Nalbari', 'Sonitpur', 'Tinsukia', 'West Karbi Anglong'],
  'Kerala': ['Malappuram', 'Kozhikode', 'Thrissur', 'Ernakulam', 'Thiruvananthapuram']
};
const sampleDeptTypes = ['Fire', 'Health', 'Police', 'Other'];
const sampleDeptNames = {
  'Fire': ['Fire and Emergency Services', 'Fire Station', 'District Fire Office'],
  'Health': ['District Hospital', 'Primary Health Center', 'Community Health Center', 'Medical College Hospital'],
  'Police': ['District Police HQ', 'Police Station', 'Traffic Police', 'Special Branch'],
  'Other': ['District Administration', 'Revenue Office', 'Civil Defense', 'District Transport Office']
};
const sampleItems = [
  { code: 101, name: 'First Aid Kit' },
  { code: 102, name: 'Fire Extinguisher' },
  { code: 103, name: 'Emergency Blanket' },
  { code: 104, name: 'Flashlight' },
  { code: 105, name: 'Walkie Talkie' },
  { code: 106, name: 'Stretcher' },
  { code: 107, name: 'Life Jacket' },
  { code: 108, name: 'Rope' },
  { code: 109, name: 'Rain Coat' },
  { code: 110, name: 'Gloves' }
];

// Function to generate random quantity
function getRandomQuantity() {
  return Math.floor(Math.random() * 100);
}

// Function to get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to generate sample inventory items
async function generateSampleData(count: number) {
  console.log(`Generating ${count} sample inventory items...`);
  
  const inventoryItems = [];
  
  for (let i = 0; i < count; i++) {
    const state = getRandomItem(sampleStates);
    const district = getRandomItem(sampleDistricts[state]);
    const deptType = getRandomItem(sampleDeptTypes);
    const deptName = getRandomItem(sampleDeptNames[deptType]);
    const item = getRandomItem(sampleItems);
    
    inventoryItems.push({
      state,
      district,
      department_type: deptType,
      department_name: deptName,
      item_code: item.code,
      item_name: item.name,
      quantity: getRandomQuantity()
    });
  }
  
  return inventoryItems;
}

// Function to insert data into Supabase
async function seedInventoryTable() {
  console.log('Starting inventory table seeding...');
  
  try {
    // Check if table is empty first
    const { count, error: countError } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error checking inventory count:', countError);
      return;
    }
    
    if (count && count > 0) {
      console.log(`Inventory table already contains ${count} items.`);
      const shouldContinue = process.argv.includes('--force');
      
      if (!shouldContinue) {
        console.log('Use --force flag to add sample data anyway.');
        return;
      } else {
        console.log('Force flag detected, proceeding to add more sample data...');
      }
    }
    
    // Generate sample data
    const sampleItems = await generateSampleData(50);
    console.log(`Generated ${sampleItems.length} sample items`);
    
    // Insert in batches to avoid timeout
    const batchSize = 10;
    const batches = Math.ceil(sampleItems.length / batchSize);
    
    console.log(`Inserting data in ${batches} batches...`);
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, sampleItems.length);
      const batch = sampleItems.slice(start, end);
      
      console.log(`Inserting batch ${i+1}/${batches} (${batch.length} items)...`);
      
      const { data, error } = await supabase
        .from('inventory')
        .insert(batch)
        .select();
        
      if (error) {
        console.error(`Error inserting batch ${i+1}:`, error);
      } else {
        console.log(`Successfully inserted batch ${i+1}: ${data.length} items`);
      }
    }
    
    console.log('Seed operation completed');
    
    // Verify the insertion by counting items
    const { count: newCount, error: newCountError } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });
      
    if (newCountError) {
      console.error('Error checking new inventory count:', newCountError);
    } else {
      console.log(`Inventory table now contains ${newCount || 0} items`);
    }
    
  } catch (error) {
    console.error('Error in seed operation:', error);
  }
}

// Run the seed function
seedInventoryTable()
  .catch(err => console.error('Fatal error in seed process:', err))
  .finally(() => console.log('Seed process completed')); 