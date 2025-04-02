import type { InventoryItem } from './inventory';

/**
 * Validates an inventory item for required fields and proper data types
 * 
 * @param item The inventory item to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateInventoryItem(item: Partial<InventoryItem>): string[] {
  const errors: string[] = [];

  // Only validate fields that are present in the partial item
  if ('state' in item && !item.state) {
    errors.push('State is required');
  }
  
  if ('district' in item && !item.district) {
    errors.push('District is required');
  }
  
  if ('department_type' in item && !item.department_type) {
    errors.push('Department type is required');
  }
  
  if ('department_name' in item && !item.department_name) {
    errors.push('Department name is required');
  }
  
  if ('item_code' in item && (item.item_code === undefined || item.item_code === null)) {
    errors.push('Item code is required');
  }
  
  if ('item_name' in item && !item.item_name) {
    errors.push('Item name is required');
  }
  
  return errors;
}

/**
 * Process raw data from Excel/CSV into proper inventory items
 * 
 * @param rawData The raw data from import
 * @returns Processed inventory items
 */
export function processData(rawData: any[]): Partial<InventoryItem>[] {
  return rawData.map(row => {
    return {
      state: row.State || row.state,
      district: row.District || row.district,
      department_type: row.Department_Type || row.department_type,
      department_name: row.Department_Name || row.department_name,
      item_code: parseInt(row.Item_Code || row.item_code) || 0,
      item_name: row.Item_Name || row.item_name,
      quantity: row.Quantity ? parseInt(row.Quantity) : row.quantity ? parseInt(row.quantity) : null,
    };
  });
}

/**
 * Bulk upload inventory items to database
 * 
 * @param items Array of inventory items to upload
 * @param supabase Supabase client instance
 * @returns Object containing counts of successful and failed uploads
 */
export async function bulkUploadInventory(
  items: Partial<InventoryItem>[],
  supabase: any,
  batchSize = 1000
): Promise<{ success: number; failed: number }> {
  let successCount = 0;
  let failedCount = 0;

  // Process in batches to avoid timeouts
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert(batch);
      
      if (error) {
        console.error(`Error uploading batch ${i / batchSize + 1}:`, error);
        failedCount += batch.length;
      } else {
        console.log(`Successfully uploaded batch ${i / batchSize + 1} (${batch.length} items)`);
        successCount += batch.length;
      }
    } catch (error) {
      console.error(`Exception uploading batch ${i / batchSize + 1}:`, error);
      failedCount += batch.length;
    }
  }

  return { success: successCount, failed: failedCount };
} 