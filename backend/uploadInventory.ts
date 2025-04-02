import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
const envPath = path.resolve(process.cwd(), '..', '.env.local');
console.log(`Loading environment variables from ${envPath}`);
dotenv.config({ path: envPath });

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'defined' : 'undefined');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'defined' : 'undefined');
  process.exit(1);
}

console.log('Initializing Supabase client with service role key');
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface InventoryItem {
  state: string;
  district: string;
  department_type: string;
  department_name: string;
  item_code: number;
  item_name: string;
  quantity: number | null;
  created_at: string;
}

// Function to clean and process data
function processData(data: any[]): InventoryItem[] {
  return data.map(row => ({
    state: row.State || '',
    district: row.District || '',
    department_type: row.Department_Type || '',
    department_name: row.Department_Name || '',
    item_code: parseInt(row.Item_Code) || 0,
    item_name: (row.Item_Name || '').replace('DESC : ', ''),
    quantity: parseInt(row.Quantity) || null,
    created_at: new Date().toISOString()
  }));
}

// Function to bulk upload data to Supabase
async function uploadInventory() {
  try {
    // Path to the Excel file (in the root directory)
    const filePath = path.resolve(process.cwd(), '..', 'cleaned_inventory_28-03.xlsx');
    console.log(`Reading Excel file from ${filePath}`);

    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Read ${rawData.length} rows from Excel file`);
    console.log('Sample first row:', JSON.stringify(rawData[0]));

    // Process data
    const processedData = processData(rawData);
    console.log(`Processed ${processedData.length} rows for upload`);
    console.log('Sample processed first row:', JSON.stringify(processedData[0]));

    // Check if table already has data
    const { count, error: countError } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking existing data:', countError);
      process.exit(1);
    }

    console.log(`Current inventory count: ${count}`);
    if (count && count > 0) {
      console.log('Table already has data. Clearing existing data...');
      
      try {
        // Clear existing data with a better approach
        const { error: deleteError } = await supabase
          .from('inventory')
          .delete()
          .gte('id', '00000000-0000-0000-0000-000000000000'); // This will match all valid UUIDs

        if (deleteError) {
          console.error('Error deleting existing data with first approach:', deleteError);
          
          // Try second approach - delete all without condition
          console.log('Trying second approach to clear data...');
          const { error: secondDeleteError } = await supabase
            .from('inventory')
            .delete()
            .not('id', 'is', null);
            
          if (secondDeleteError) {
            console.error('Error with second delete approach:', secondDeleteError);
            console.log('Skipping delete and proceeding with upload...');
          } else {
            console.log('Existing data cleared successfully with second approach');
          }
        } else {
          console.log('Existing data cleared successfully');
        }
      } catch (error) {
        console.error('Exception during delete operation:', error);
        console.log('Skipping delete and proceeding with upload...');
      }
    }

    // Insert data in chunks to avoid timeouts and payload limits
    const chunkSize = 1000;
    console.log(`Uploading data in chunks of ${chunkSize} rows`);
    
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < processedData.length; i += chunkSize) {
      const chunk = processedData.slice(i, i + chunkSize);
      const chunkNumber = Math.floor(i / chunkSize) + 1;
      const totalChunks = Math.ceil(processedData.length / chunkSize);
      
      console.log(`Processing chunk ${chunkNumber}/${totalChunks} (${chunk.length} rows)`);
      
      try {
        const { error } = await supabase
          .from('inventory')
          .insert(chunk);

        if (error) {
          console.error(`Error inserting chunk ${chunkNumber}:`, error);
          errorCount += chunk.length;
        } else {
          console.log(`Successfully inserted chunk ${chunkNumber}`);
          successCount += chunk.length;
        }
      } catch (err) {
        console.error(`Exception in chunk ${chunkNumber}:`, err);
        errorCount += chunk.length;
      }
      
      // Add a small delay between chunks to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\nUpload Complete!');
    console.log(`Successfully uploaded ${successCount} rows`);
    console.log(`Failed to upload ${errorCount} rows`);
    
    // Verify final count
    const { count: finalCount, error: finalCountError } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });
      
    if (finalCountError) {
      console.error('Error checking final count:', finalCountError);
    } else {
      console.log(`Final inventory count: ${finalCount}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error in upload process:', error);
    process.exit(1);
  }
}

// Execute the function
console.log('Starting inventory upload process...');
uploadInventory(); 