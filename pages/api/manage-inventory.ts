import { NextApiRequest, NextApiResponse } from 'next';
import { createInventoryItem, deleteInventoryItem, updateInventoryItem } from '../../backend/inventory';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Handle different HTTP methods
    switch (req.method) {
      case 'POST':
        return await handleCreate(req, res);
      case 'PUT':
        return await handleUpdate(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        });
    }
  } catch (error: any) {
    console.error('Error in manage-inventory API:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message || 'Unknown error'
    });
  }
}

// Handle creating a new inventory item
async function handleCreate(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('API: Creating new inventory item');
    
    // Get item data from request body
    const itemData = req.body;
    
    if (!itemData) {
      return res.status(400).json({
        success: false,
        message: 'No item data provided'
      });
    }
    
    // Validate required fields
    const requiredFields = ['state', 'district', 'department_type', 'department_name', 'item_code', 'item_name'];
    const missingFields = requiredFields.filter(field => !itemData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }
    
    // Create the item using backend function
    const newItem = await createInventoryItem(itemData);
    
    if (!newItem) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create inventory item'
      });
    }
    
    // Return the created item
    return res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      item: newItem
    });
  } catch (error: any) {
    console.error('Error creating inventory item:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error creating inventory item',
      error: error.message || 'Unknown error'
    });
  }
}

// Handle deleting an inventory item
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }
    
    console.log(`API: Deleting inventory item with ID: ${id}`);
    
    // Delete the item using backend function
    const success = await deleteInventoryItem(id);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete inventory item'
      });
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting inventory item:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error deleting inventory item',
      error: error.message || 'Unknown error'
    });
  }
}

// Handle updating an inventory item
async function handleUpdate(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }
    
    // Get update data from request body
    const updateData = req.body;
    
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update data provided'
      });
    }
    
    console.log(`API: Updating inventory item with ID: ${id}`);
    
    // Update the item using backend function
    const updatedItem = await updateInventoryItem(id, updateData);
    
    if (!updatedItem) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update inventory item'
      });
    }
    
    // Return the updated item
    return res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      item: updatedItem
    });
  } catch (error: any) {
    console.error('Error updating inventory item:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error updating inventory item',
      error: error.message || 'Unknown error'
    });
  }
} 