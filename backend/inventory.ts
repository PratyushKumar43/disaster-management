import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { validateInventoryItem } from './dataProcessing';
import { getSupabaseClient, getSupabaseAdminClient } from './supabase';

// Log environment information at startup
console.log('=== Inventory Module Initialization ===');
console.log('Environment:', typeof window === 'undefined' ? 'server' : 'browser');

// Define interfaces for better type safety
export interface InventoryItem {
  id: string;
  state: string;
  district: string;
  department_type: string;
  department_name: string;
  item_code: number;
  item_name: string;
  quantity: number | null;
  created_at: string;
  [key: string]: any; // For any additional fields
}

export interface FilterOptions {
  state?: string;
  district?: string;
  department_type?: string;
  department_name?: string;
  item_code?: number;
  item_name?: string;
  limit?: number;
  offset?: number;
}

// Create a new inventory item
export async function createInventoryItem(item: any): Promise<InventoryItem | null> {
  try {
    console.log('Creating new inventory item:', item);
    
    // Use admin client for write operations to bypass RLS
    const supabase = getSupabaseAdminClient();
    
    // Validate the item
    const errors = []
    if (!item.state) errors.push('State is required')
    if (!item.district) errors.push('District is required')
    if (!item.department_type) errors.push('Department type is required')
    if (!item.department_name) errors.push('Department name is required')
    if (!item.item_code) errors.push('Item code is required')
    if (!item.item_name) errors.push('Item name is required')
    
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return null;
    }
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise<{ data: null, error: any }>((_, reject) => {
      setTimeout(() => {
        reject({ 
          data: null, 
          error: { message: "Create request timed out after 15 seconds" } 
        });
      }, 15000);
    });
    
    // Execute create with timeout
    const result = await Promise.race([
      supabase
        .from('inventory')
        .insert({
          state: item.state,
          district: item.district,
          department_type: item.department_type,
          department_name: item.department_name,
          item_code: item.item_code,
          item_name: item.item_name,
          quantity: item.quantity || null
        })
        .select(),
      timeoutPromise
    ]) as any;
    
    const { data, error } = result;
    
    if (error) {
      console.error('Error creating inventory item:', error);
      return null;
    }
    
    console.log('Successfully created item:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Unexpected error creating inventory item:', error);
    return null;
  }
}

// Delete an inventory item by ID
export async function deleteInventoryItem(id: string): Promise<boolean> {
  try {
    console.log(`Deleting inventory item with ID: ${id}`);
    
    // Use admin client for write operations to bypass RLS
    const supabase = getSupabaseAdminClient();
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise<{ error: any }>((_, reject) => {
      setTimeout(() => {
        reject({ 
          error: { message: "Delete request timed out after 10 seconds" } 
        });
      }, 10000);
    });
    
    // Execute delete with timeout
    const result = await Promise.race([
      supabase.from('inventory').delete().eq('id', id),
      timeoutPromise
    ]) as any;
    
    const { error } = result;
    
    if (error) {
      console.error('Error deleting inventory item:', error);
      return false;
    }
    
    console.log(`Successfully deleted inventory item with ID: ${id}`);
    return true;
  } catch (error) {
    console.error('Unexpected error deleting inventory item:', error);
    return false;
  }
}

// Update an existing inventory item
export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
  try {
    console.log(`Updating inventory item with ID: ${id}`, updates);
    
    // Use admin client for write operations to bypass RLS
    const supabase = getSupabaseAdminClient();
    
    // Validate the update - must have at least one field to update
    if (Object.keys(updates).length === 0) {
      console.error('No update fields provided');
      return null;
    }
    
    // Build the update object with only allowed fields
    const allowedFields = [
      'state', 'district', 'department_type', 'department_name',
      'item_code', 'item_name', 'quantity'
    ];
    
    const updateData: Record<string, any> = {};
    
    // Only include allowed fields
    for (const field of allowedFields) {
      if (field in updates) {
        updateData[field] = (updates as any)[field];
      }
    }
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise<{ data: null, error: any }>((_, reject) => {
      setTimeout(() => {
        reject({ 
          data: null, 
          error: { message: "Update request timed out after 15 seconds" } 
        });
      }, 15000);
    });
    
    // Execute update with timeout
    const result = await Promise.race([
      supabase
        .from('inventory')
        .update(updateData)
        .eq('id', id)
        .select(),
      timeoutPromise
    ]) as any;
    
    const { data, error } = result;
    
    if (error) {
      console.error('Error updating inventory item:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error('No inventory item found with ID:', id);
      return null;
    }
    
    console.log('Successfully updated item:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Unexpected error updating inventory item:', error);
    return null;
  }
}

// Get inventory items with optional filtering
export async function getInventoryItems(filters: FilterOptions = {}): Promise<InventoryItem[]> {
  console.log('getInventoryItems called with filters:', JSON.stringify(filters));
  
  const {
    state,
    district,
    department_type,
    department_name,
    item_code,
    item_name,
    limit, // Use for manual pagination if specified
    offset = 0
  } = filters;
  
  try {
    const supabase = getSupabaseClient();
    
    console.log('Building query with:', {
      state, district, department_type, department_name, item_code, item_name, limit, offset
    });
    
    // If a specific limit is requested, use it directly
    if (limit !== undefined) {
      console.log(`Using specified limit: ${limit}`);
      
      // Start with a query from the inventory table
      let query = supabase.from('inventory').select('*');
      
      // Apply filters only if they are defined and not 'all'
      if (state && state !== 'all') {
        console.log('Applying state filter:', state);
        query = query.eq('state', state);
      }
      
      if (district && district !== 'all') {
        console.log('Applying district filter:', district);
        query = query.eq('district', district);
      }
      
      if (department_type && department_type !== 'all') {
        console.log('Applying department_type filter:', department_type);
        query = query.eq('department_type', department_type);
      }
      
      if (department_name && department_name !== 'all') {
        console.log('Applying department_name filter:', department_name);
        query = query.eq('department_name', department_name);
      }
      
      if (item_code) {
        console.log('Applying item_code filter:', item_code);
        query = query.eq('item_code', item_code);
      }
      
      if (item_name && item_name !== 'all') {
        console.log('Applying item_name filter:', item_name);
        query = query.eq('item_name', item_name);
      }
      
      // Apply ordering - order by state, district for better grouping
      query = query.order('state', { ascending: true })
                   .order('district', { ascending: true })
                   .order('department_type', { ascending: true });
      
      // Apply pagination
      console.log('Setting pagination - limit:', limit, 'offset:', offset);
      query = query.range(offset, offset + limit - 1);
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise<{ data: null, error: any }>((_, reject) => {
        setTimeout(() => {
          reject({ 
            data: null, 
            error: { message: "Request timed out after 15 seconds" } 
          });
        }, 15000);
      });
      
      console.log('Executing inventory query with limit...');
      const startTime = Date.now();
      
      // Execute query with timeout
      const result = await Promise.race([query, timeoutPromise]);
      const { data, error, status } = result as any;
      
      const endTime = Date.now();
      
      console.log(`Query completed in ${endTime - startTime}ms with status ${status}`);
      
      if (error) {
        console.error('Error fetching inventory items:', error);
        return [];
      }
      
      console.log(`Fetched ${data?.length || 0} inventory items successfully`);
      
      // Make sure all items have the required fields
      const processedItems = (data || []).map((item: InventoryItem) => ({
        ...item,
        id: item.id || `temp-${Date.now()}-${Math.random()}`, // Ensure id exists
        created_at: item.created_at || new Date().toISOString(), // Ensure created_at exists
      }));
      
      return processedItems;
    } 
    // Otherwise, use chunked requests with retries to get all results
    else {
      console.log('No limit specified - using chunked requests with retries to fetch ALL data');
      
      // Get count to estimate total pages needed (with timeout)
      const countTimeoutPromise = new Promise<{ count: number, error: any }>((_, reject) => {
        setTimeout(() => {
          reject({ 
            count: 0, 
            error: { message: "Count request timed out after 10 seconds" } 
          });
        }, 10000);
      });
      
      let countQuery = supabase
        .from('inventory')
        .select('*', { count: 'exact', head: true });
        
      // Apply filters to the count query
      if (state && state !== 'all') {
        console.log('Applying state filter:', state);
        countQuery = countQuery.eq('state', state);
      }
      
      if (district && district !== 'all') {
        console.log('Applying district filter:', district);
        countQuery = countQuery.eq('district', district);
      }
      
      if (department_type && department_type !== 'all') {
        console.log('Applying department_type filter:', department_type);
        countQuery = countQuery.eq('department_type', department_type);
      }
      
      if (department_name && department_name !== 'all') {
        console.log('Applying department_name filter:', department_name);
        countQuery = countQuery.eq('department_name', department_name);
      }
      
      if (item_code) {
        console.log('Applying item_code filter:', item_code);
        countQuery = countQuery.eq('item_code', item_code);
      }
      
      if (item_name && item_name !== 'all') {
        console.log('Applying item_name filter:', item_name);
        countQuery = countQuery.eq('item_name', item_name);
      }
      
      const countResult = await Promise.race([countQuery, countTimeoutPromise]);
      const { count, error: countError } = countResult as any;
        
      if (countError) {
        console.error('Error getting count:', countError);
        console.log('Using fallback estimate for count');
        // Continue with fallback count
      }
      
      const totalCount = count || 300000; // Fallback to 300,000 if count fails
      console.log(`Total estimated rows: ${totalCount}`);
      
      if (totalCount === 0) {
        console.log('No data found in database');
        return [];
      }
      
      // Use smaller chunks to prevent timeouts (10,000 instead of 300,000)
      const pageSize = 10000;
      const totalPages = Math.ceil(totalCount / pageSize);
      console.log(`Will fetch data in ${totalPages} chunks of ${pageSize} items each`);
      
      // Collect all rows
      let allRows: InventoryItem[] = [];
      const maxRetries = 3;
      
      // Process chunks sequentially with retries for better reliability
      for (let page = 0; page < totalPages; page++) {
        const from = page * pageSize;
        const to = from + pageSize - 1;
        
        console.log(`Fetching chunk ${page + 1}/${totalPages} (rows ${from}-${to})`);
        
        let success = false;
        let attempts = 0;
        
        while (!success && attempts < maxRetries) {
          attempts++;
          
          try {
            // Build query for this chunk
            let query = supabase.from('inventory').select('*');
            
            // Apply filters only if they are defined and not 'all'
            if (state && state !== 'all') {
              query = query.eq('state', state);
            }
            
            if (district && district !== 'all') {
              query = query.eq('district', district);
            }
            
            if (department_type && department_type !== 'all') {
              query = query.eq('department_type', department_type);
            }
            
            if (department_name && department_name !== 'all') {
              query = query.eq('department_name', department_name);
            }
            
            if (item_code) {
              query = query.eq('item_code', item_code);
            }
            
            if (item_name && item_name !== 'all') {
              query = query.eq('item_name', item_name);
            }
            
            // Apply ordering - order by state, district for better grouping
            query = query.order('state', { ascending: true })
                       .order('district', { ascending: true })
                       .order('department_type', { ascending: true });
            
            // Apply pagination for this chunk
            query = query.range(from, to);
            
            // Add timeout for this request
            const timeoutPromise = new Promise<{ data: null, error: any }>((_, reject) => {
              setTimeout(() => {
                reject({ 
                  data: null, 
                  error: { message: `Chunk ${page + 1} request timed out after 15 seconds` } 
                });
              }, 15000);
            });
            
            // Execute the query with timeout
            const chunkResult = await Promise.race([query, timeoutPromise]);
            const { data, error, status } = chunkResult as any;
            
            if (error) {
              console.error(`Error fetching chunk ${page + 1} (attempt ${attempts}):`, error);
              
              if (attempts >= maxRetries) {
                console.warn(`Failed to fetch chunk ${page + 1} after ${maxRetries} attempts, continuing to next chunk`);
                break;
              }
              
              // Exponential backoff before retry
              const delay = Math.min(1000 * Math.pow(2, attempts), 8000);
              console.log(`Retrying after ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            
            // Process the chunk data
            if (data && data.length > 0) {
              console.log(`Received ${data.length} rows for chunk ${page + 1} with status ${status}`);
              allRows = [...allRows, ...data];
              success = true;
            } else {
              console.log(`No data in chunk ${page + 1} - we've reached the end`);
              page = totalPages; // Exit the loop
              break;
            }
          } catch (error) {
            console.error(`Exception in chunk ${page + 1} (attempt ${attempts}):`, error);
            
            if (attempts >= maxRetries) {
              console.warn(`Failed to fetch chunk ${page + 1} after ${maxRetries} attempts, continuing to next chunk`);
              break;
            }
            
            // Exponential backoff before retry
            const delay = Math.min(1000 * Math.pow(2, attempts), 8000);
            console.log(`Retrying after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
        
        // If we've completely failed to retrieve any data after several chunks, exit early
        if (page >= 3 && allRows.length === 0) {
          console.error('Failed to retrieve any data after trying multiple chunks, aborting');
          break;
        }
      }
      
      console.log(`Total rows fetched: ${allRows.length}`);
      
      if (allRows.length === 0) {
        console.log('No inventory items found in database');
        return [];
      }
      
      // Log unique states, districts and department_types in the fetched data
      const uniqueStates = [...new Set(allRows.map(item => item.state))].filter(Boolean);
      const uniqueDistricts = [...new Set(allRows.map(item => item.district))].filter(Boolean);
      const uniqueDeptTypes = [...new Set(allRows.map(item => item.department_type))].filter(Boolean);
      
      console.log(`Data contains ${uniqueStates.length} unique states: ${uniqueStates.slice(0, 10).join(', ')}${uniqueStates.length > 10 ? '...' : ''}`);
      console.log(`Data contains ${uniqueDistricts.length} unique districts: ${uniqueDistricts.slice(0, 10).join(', ')}${uniqueDistricts.length > 10 ? '...' : ''}`);
      console.log(`Data contains ${uniqueDeptTypes.length} unique department types: ${uniqueDeptTypes.slice(0, 10).join(', ')}${uniqueDeptTypes.length > 10 ? '...' : ''}`);
      
      if (allRows.length > 0) {
        console.log('First item:', JSON.stringify(allRows[0]));
        console.log('Last item:', JSON.stringify(allRows[allRows.length - 1]));
      }
      
      // Make sure all items have the required fields
      const processedItems = allRows.map((item: InventoryItem) => ({
        ...item,
        id: item.id || `temp-${Date.now()}-${Math.random()}`, // Ensure id exists
        created_at: item.created_at || new Date().toISOString(), // Ensure created_at exists
      }));
      
      return processedItems;
    }
  } catch (error) {
    console.error('Exception in getInventoryItems:', error);
    return [];
  }
}

// Function to get unique states with pagination and error handling
export async function getUniqueStates(): Promise<string[]> {
  console.log('Getting unique states...');
  
  try {
    const supabase = getSupabaseClient();
    
    // Using pagination to get all states in chunks
    const pageSize = 1000;
    let page = 0;
    let allRows: any[] = [];
    let hasMore = true;
    let timeoutMs = 10000; // 10 second timeout
    
    console.log('Fetching unique states with pagination...');
    
    // Loop until we have all states or hit an error
    while (hasMore) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      console.log(`Fetching states page ${page + 1} (rows ${from}-${to})`);
      
      // Create timeout promise
      const timeoutPromise = new Promise<{ data: null, error: any }>((_, reject) => {
        setTimeout(() => {
          reject({ 
            data: null, 
            error: { message: `States query timed out after ${timeoutMs/1000} seconds` } 
          });
        }, timeoutMs);
      });
      
      try {
        // Execute query with timeout
        const result = await Promise.race([
          supabase
            .from('inventory')
            .select('state')
            .order('state')
            .range(from, to),
          timeoutPromise
        ]);
        
        const { data, error } = result as any;
        
        if (error) {
          console.error(`Error fetching states page ${page + 1}:`, error);
          break;
        }
        
        // Process the results
        if (data && data.length > 0) {
          console.log(`Received ${data.length} state entries in page ${page + 1}`);
          allRows = [...allRows, ...data];
          
          // Check if we should continue fetching
          if (data.length < pageSize) {
            hasMore = false;
            console.log('End of data reached for states');
          } else {
            page++;
          }
        } else {
          hasMore = false;
          console.log('No more state data available');
        }
      } catch (error) {
        console.error(`Exception fetching states page ${page + 1}:`, error);
        // Continue to results processing with what we have
        break;
      }
    }
    
    // Extract unique states from the rows
    console.log(`Processing ${allRows.length} total state entries...`);
    const uniqueStates = [...new Set(allRows.map(item => item.state))]
      .filter(Boolean) // Remove empty values
      .sort();
    
    console.log(`Found ${uniqueStates.length} unique states`);
    
    return uniqueStates;
  } catch (error) {
    console.error('Exception in getUniqueStates:', error);
    return [];
  }
}

// Function to get unique districts with pagination and error handling
export async function getUniqueDistricts(state?: string): Promise<string[]> {
  console.log(`Getting unique districts${state ? ` for state: ${state}` : ''}...`);
  
  try {
    const supabase = getSupabaseClient();
    
    // Using pagination to get all districts in chunks
    const pageSize = 1000;
    let page = 0;
    let allRows: any[] = [];
    let hasMore = true;
    let timeoutMs = 10000; // 10 second timeout
    
    console.log('Fetching unique districts with pagination...');
    
    // Loop until we have all districts or hit an error
    while (hasMore) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      console.log(`Fetching districts page ${page + 1} (rows ${from}-${to})`);
      
      // Create timeout promise
      const timeoutPromise = new Promise<{ data: null, error: any }>((_, reject) => {
        setTimeout(() => {
          reject({ 
            data: null, 
            error: { message: `Districts query timed out after ${timeoutMs/1000} seconds` } 
          });
        }, timeoutMs);
      });
      
      try {
        // Build the query
        let query = supabase
          .from('inventory')
          .select('district')
          .order('district');
        
        // Add state filter if provided
        if (state && state !== 'all') {
          query = query.eq('state', state);
        }
        
        // Apply pagination
        query = query.range(from, to);
        
        // Execute query with timeout
        const result = await Promise.race([query, timeoutPromise]);
        const { data, error } = result as any;
        
        if (error) {
          console.error(`Error fetching districts page ${page + 1}:`, error);
          break;
        }
        
        // Process the results
        if (data && data.length > 0) {
          console.log(`Received ${data.length} district entries in page ${page + 1}`);
          allRows = [...allRows, ...data];
          
          // Check if we should continue fetching
          if (data.length < pageSize) {
            hasMore = false;
            console.log('End of data reached for districts');
          } else {
            page++;
          }
        } else {
          hasMore = false;
          console.log('No more district data available');
        }
      } catch (error) {
        console.error(`Exception fetching districts page ${page + 1}:`, error);
        // Continue to results processing with what we have
        break;
      }
    }
    
    // Extract unique districts from the rows
    console.log(`Processing ${allRows.length} total district entries...`);
    const uniqueDistricts = [...new Set(allRows.map(item => item.district))]
      .filter(Boolean) // Remove empty values
      .sort();
    
    console.log(`Found ${uniqueDistricts.length} unique districts`);
    
    return uniqueDistricts;
  } catch (error) {
    console.error('Exception in getUniqueDistricts:', error);
    return [];
  }
}

// Function to get unique department types with pagination and error handling
export async function getUniqueDepartmentTypes(state?: string, district?: string): Promise<string[]> {
  console.log(`Getting unique department types${state ? ` for state: ${state}` : ''}${district ? ` and district: ${district}` : ''}...`);
  
  try {
    const supabase = getSupabaseClient();
    
    // Using pagination to get all department types in chunks
    const pageSize = 1000;
    let page = 0;
    let allRows: any[] = [];
    let hasMore = true;
    let timeoutMs = 10000; // 10 second timeout
    
    console.log('Fetching unique department types with pagination...');
    
    // Loop until we have all department types or hit an error
    while (hasMore) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      console.log(`Fetching department types page ${page + 1} (rows ${from}-${to})`);
      
      // Create timeout promise
      const timeoutPromise = new Promise<{ data: null, error: any }>((_, reject) => {
        setTimeout(() => {
          reject({ 
            data: null, 
            error: { message: `Department types query timed out after ${timeoutMs/1000} seconds` } 
          });
        }, timeoutMs);
      });
      
      try {
        // Build the query
        let query = supabase
          .from('inventory')
          .select('department_type')
          .order('department_type');
        
        // Add state filter if provided
        if (state && state !== 'all') {
          query = query.eq('state', state);
        }
        
        // Add district filter if provided
        if (district && district !== 'all') {
          query = query.eq('district', district);
        }
        
        // Apply pagination
        query = query.range(from, to);
        
        // Execute query with timeout
        const result = await Promise.race([query, timeoutPromise]);
        const { data, error } = result as any;
        
        if (error) {
          console.error(`Error fetching department types page ${page + 1}:`, error);
          break;
        }
        
        // Process the results
        if (data && data.length > 0) {
          console.log(`Received ${data.length} department type entries in page ${page + 1}`);
          allRows = [...allRows, ...data];
          
          // Check if we should continue fetching
          if (data.length < pageSize) {
            hasMore = false;
            console.log('End of data reached for department types');
          } else {
            page++;
          }
        } else {
          hasMore = false;
          console.log('No more department type data available');
        }
      } catch (error) {
        console.error(`Exception fetching department types page ${page + 1}:`, error);
        // Continue to results processing with what we have
        break;
      }
    }
    
    // Extract unique department types from the rows
    console.log(`Processing ${allRows.length} total department type entries...`);
    const uniqueDeptTypes = [...new Set(allRows.map(item => item.department_type))]
      .filter(Boolean) // Remove empty values
      .sort();
    
    console.log(`Found ${uniqueDeptTypes.length} unique department types`);
    
    return uniqueDeptTypes;
  } catch (error) {
    console.error('Exception in getUniqueDepartmentTypes:', error);
    return [];
  }
}

// Debug function to test database connectivity and data retrieval
export async function debugDatabase(): Promise<any> {
  console.log('===============================');
  console.log('STARTING DATABASE DEBUG CHECKS');
  console.log('===============================');
  
  const results: any = {
    connectivity: null,
    count: null,
    states: null,
    districts: null,
    departmentTypes: null,
    sampleItems: null,
    errors: []
  };
  
  try {
    // 1. Check Supabase connectivity
    console.log('\n--- Checking Supabase connectivity ---');
    const supabase = getSupabaseClient();
    
    try {
      // Simple ping test
      const startTime = Date.now();
      const { data, error } = await supabase.from('inventory').select('id').limit(1);
      const endTime = Date.now();
      
      if (error) {
        console.error('❌ Connectivity test failed:', error);
        results.connectivity = {
          success: false,
          error: error.message,
          time: endTime - startTime
        };
        results.errors.push(`Connectivity test failed: ${error.message}`);
      } else {
        console.log(`✅ Connectivity test passed in ${endTime - startTime}ms`);
        results.connectivity = {
          success: true,
          time: endTime - startTime
        };
      }
    } catch (error: any) {
      console.error('❌ Exception in connectivity test:', error);
      results.connectivity = {
        success: false,
        error: error.message || 'Unknown error'
      };
      results.errors.push(`Connectivity test exception: ${error.message}`);
    }
    
    // 2. Get total count
    console.log('\n--- Getting total count ---');
    try {
      const startTime = Date.now();
      const countResult = await Promise.race([
        supabase.from('inventory').select('*', { count: 'exact', head: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Count query timed out')), 10000))
      ]) as any;
      const endTime = Date.now();
      
      const { count, error } = countResult;
      
      if (error) {
        console.error('❌ Count test failed:', error);
        results.count = {
          success: false,
          error: error.message,
          time: endTime - startTime
        };
        results.errors.push(`Count test failed: ${error.message}`);
      } else {
        console.log(`✅ Count test passed: ${count} items found in ${endTime - startTime}ms`);
        results.count = {
          success: true,
          count,
          time: endTime - startTime
        };
      }
    } catch (error: any) {
      console.error('❌ Exception in count test:', error);
      results.count = {
        success: false,
        error: error.message || 'Unknown error'
      };
      results.errors.push(`Count test exception: ${error.message}`);
    }
    
    // 3. Get unique states
    console.log('\n--- Getting unique states ---');
    try {
      const startTime = Date.now();
      const states = await getUniqueStates();
      const endTime = Date.now();
      
      if (states.length === 0) {
        console.warn('⚠️ No states found');
        results.states = {
          success: true,
          count: 0,
          time: endTime - startTime,
          warning: 'No states found'
        };
      } else {
        console.log(`✅ Found ${states.length} unique states in ${endTime - startTime}ms`);
        console.log(`   First 5 states: ${states.slice(0, 5).join(', ')}...`);
        results.states = {
          success: true,
          count: states.length,
          sample: states.slice(0, 5),
          time: endTime - startTime
        };
      }
    } catch (error: any) {
      console.error('❌ Exception in states test:', error);
      results.states = {
        success: false,
        error: error.message || 'Unknown error'
      };
      results.errors.push(`States test exception: ${error.message}`);
    }
    
    // 4. Get unique districts
    console.log('\n--- Getting unique districts ---');
    try {
      const startTime = Date.now();
      const districts = await getUniqueDistricts();
      const endTime = Date.now();
      
      if (districts.length === 0) {
        console.warn('⚠️ No districts found');
        results.districts = {
          success: true,
          count: 0,
          time: endTime - startTime,
          warning: 'No districts found'
        };
      } else {
        console.log(`✅ Found ${districts.length} unique districts in ${endTime - startTime}ms`);
        console.log(`   First 5 districts: ${districts.slice(0, 5).join(', ')}...`);
        results.districts = {
          success: true,
          count: districts.length,
          sample: districts.slice(0, 5),
          time: endTime - startTime
        };
      }
    } catch (error: any) {
      console.error('❌ Exception in districts test:', error);
      results.districts = {
        success: false,
        error: error.message || 'Unknown error'
      };
      results.errors.push(`Districts test exception: ${error.message}`);
    }
    
    // 5. Get unique department types
    console.log('\n--- Getting unique department types ---');
    try {
      const startTime = Date.now();
      const deptTypes = await getUniqueDepartmentTypes();
      const endTime = Date.now();
      
      if (deptTypes.length === 0) {
        console.warn('⚠️ No department types found');
        results.departmentTypes = {
          success: true,
          count: 0,
          time: endTime - startTime,
          warning: 'No department types found'
        };
      } else {
        console.log(`✅ Found ${deptTypes.length} unique department types in ${endTime - startTime}ms`);
        console.log(`   First 5 department types: ${deptTypes.slice(0, 5).join(', ')}...`);
        results.departmentTypes = {
          success: true,
          count: deptTypes.length,
          sample: deptTypes.slice(0, 5),
          time: endTime - startTime
        };
      }
    } catch (error: any) {
      console.error('❌ Exception in department types test:', error);
      results.departmentTypes = {
        success: false,
        error: error.message || 'Unknown error'
      };
      results.errors.push(`Department types test exception: ${error.message}`);
    }
    
    // 6. Get some sample items
    console.log('\n--- Getting sample inventory items ---');
    try {
      const startTime = Date.now();
      const items = await getInventoryItems({ limit: 10 });
      const endTime = Date.now();
      
      if (items.length === 0) {
        console.warn('⚠️ No inventory items found');
        results.sampleItems = {
          success: true,
          count: 0,
          time: endTime - startTime,
          warning: 'No inventory items found'
        };
      } else {
        console.log(`✅ Found ${items.length} inventory items in ${endTime - startTime}ms`);
        results.sampleItems = {
          success: true,
          count: items.length,
          time: endTime - startTime,
          sample: items.map(item => ({
            id: item.id,
            state: item.state,
            district: item.district,
            department_type: item.department_type,
            item_name: item.item_name
          }))
        };
      }
    } catch (error: any) {
      console.error('❌ Exception in sample items test:', error);
      results.sampleItems = {
        success: false,
        error: error.message || 'Unknown error'
      };
      results.errors.push(`Sample items test exception: ${error.message}`);
    }
    
    // Summary
    console.log('\n===============================');
    console.log('DATABASE DEBUG CHECKS SUMMARY');
    console.log('===============================');
    
    const allSuccessful = Object.entries(results)
      .filter(([key]) => key !== 'errors')
      .every(([_, value]) => (value as any)?.success);
    
    if (allSuccessful) {
      console.log('✅ All database checks passed');
    } else {
      console.error(`❌ Some database checks failed (${results.errors.length} errors)`);
      console.error('Errors:', results.errors);
    }
    
    return results;
  } catch (error: any) {
    console.error('Critical error in debugDatabase:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}