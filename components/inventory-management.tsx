"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Filter,
  X,
  Info,
  Trash2,
  Package,
  ShoppingCart,
  Users,
  Bell,
  AlertTriangle,
  Package2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Building, BarChart3, Settings } from "lucide-react"
import { 
  getInventoryItems, 
  createInventoryItem, 
  deleteInventoryItem, 
  getUniqueStates, 
  getUniqueDistricts, 
  getUniqueDepartmentTypes 
} from "@/backend/inventory"
import type { InventoryItem } from "@/backend/inventory"
import { checkSupabaseConnection } from "@/backend/supabase"
import { createClient } from "@supabase/supabase-js"
import { DataLoadingProgress } from "@/components/DataLoadingProgress"

// Types
interface Department {
  id: string;
  name: string;
  type: string;
  address: string;
  contactPerson: string;
  contactNumber: string;
  contactEmail: string;
  district: string;
}

interface District {
  id: string;
  name: string;
  state: string;
}

interface State {
  id: string;
  name: string;
}

export default function InventoryManagement() {
  const { toast } = useToast()
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // States for filter dropdowns
  const [states, setStates] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [departments, setDepartments] = useState<string[]>([])

  // Filter states
  const [selectedState, setSelectedState] = useState<string>("all")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")

  // Available options based on filters
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([])
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([])

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null)

  // Form states
  const [newItem, setNewItem] = useState({
    state: "",
    district: "",
    department_type: "",
    department_name: "",
    item_code: 0,
    item_name: "",
    quantity: 0,
  })

  // Add these state variables in the component
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const pageCount = Math.ceil(filteredItems.length / itemsPerPage)

  // Add this new state
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    hasData?: boolean;
  } | null>(null);

  // State for full data storage
  const [fullInventoryData, setFullInventoryData] = useState<InventoryItem[]>([]);

  // State for loading filters
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  // State for loading progress
  const [loadingProgress, setLoadingProgress] = useState({ 
    current: 0, 
    total: 0, 
    percentage: 0 
  });

  // Initial data loading
  useEffect(() => {
    console.log("Initial component mount - loading data");
    
    // Fetch data and filter options
    fetchAllInventoryData();
    fetchFilterOptions();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch inventory items on component mount
  useEffect(() => {
    try {
      console.log("Component mounted, fetching data...");
      
      // Check Supabase connection first
      checkSupabaseConnection().then(status => {
        console.log("Supabase connection status:", status);
        setConnectionStatus(status);
        
        if (status.success) {
          // Fetch filter options and data separately
          fetchAllFilterOptions();
          fetchAllInventoryData();
        } else {
          toast({
            title: "Connection Error",
            description: `Failed to connect to database: ${status.error}`,
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error("Error in initial data fetch:", error);
      toast({
        title: "Error",
        description: "Failed to initialize component data",
        variant: "destructive",
      });
    }
  }, []);

  // Function to fetch ALL inventory data and extract filter options
  const fetchAllInventoryData = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching inventory data with pagination");
      
      // Show loading notification
      toast({
        title: "Loading",
        description: "Fetching inventory data... This might take a moment for large datasets.",
      });
      
      // Get total count to estimate progress
      let totalEstimated = 0;
      let items: any[] = [];
      
      try {
        // Use backend function to get total count
        const countResponse = await fetch('/api/inventory-count');
        const countData = await countResponse.json();
        
        if (countData.success) {
          totalEstimated = countData.count || 0;
          console.log(`Total estimated items: ${totalEstimated}`);
          setLoadingProgress({ current: 0, total: totalEstimated, percentage: 0 });
        } else {
          console.warn("Could not get exact count, using estimate");
          totalEstimated = 300000; // Fallback estimate
        }
      } catch (error) {
        console.error("Error fetching count:", error);
        totalEstimated = 300000; // Fallback estimate
      }
      
      // Fetch data in chunks of 10,000 records (reduced from 100,000)
      const pageSize = 10000;
      const totalPages = Math.ceil(totalEstimated / pageSize);
      console.log(`Will fetch data in ${totalPages} chunks of ${pageSize} items each`);
      
      // Track retries and successful chunks
      let retries = 0;
      let successfulChunks = 0;
      const maxRetries = 3;
      
      for (let page = 0; page < totalPages; page++) {
        const offset = page * pageSize;
        console.log(`Fetching chunk ${page + 1}/${totalPages} (items ${offset} to ${offset + pageSize - 1})`);
        
        setLoadingProgress({ 
          current: offset, 
          total: totalEstimated, 
          percentage: Math.round((offset / totalEstimated) * 100) 
        });
        
        let chunkSuccess = false;
        let attempts = 0;
        
        // Try up to maxRetries times for each chunk
        while (!chunkSuccess && attempts < maxRetries) {
          try {
            attempts++;
            // Fetch items with the current offset and limit
            const response = await fetch(`/api/inventory?offset=${offset}&limit=${pageSize}`);
            
            if (!response.ok) {
              console.error(`Error fetching chunk ${page + 1} (attempt ${attempts}): HTTP ${response.status}`);
              
              if (attempts >= maxRetries) {
                console.warn(`Failed to fetch chunk ${page + 1} after ${maxRetries} attempts, continuing to next chunk`);
                break;
              }
              
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
              continue;
            }
            
            const data = await response.json();
            
            if (data.success && data.items && data.items.length > 0) {
              console.log(`Received ${data.items.length} items in chunk ${page + 1}`);
              items = [...items, ...data.items];
              
              // Update progress
              setLoadingProgress({ 
                current: items.length, 
                total: totalEstimated, 
                percentage: Math.round((items.length / totalEstimated) * 100)
              });
              
              chunkSuccess = true;
              successfulChunks++;
              
              // If we got fewer items than requested, we've reached the end
              if (data.items.length < pageSize) {
                console.log(`Reached end of data at ${items.length} items (less than page size)`);
                page = totalPages; // Exit the outer loop
                break;
              }
            } else {
              console.log(`No more data in chunk ${page + 1}`);
              page = totalPages; // Exit the outer loop
              break; // No more data
            }
          } catch (error) {
            console.error(`Error fetching chunk ${page + 1} (attempt ${attempts}):`, error);
            
            if (attempts >= maxRetries) {
              console.warn(`Failed to fetch chunk ${page + 1} after ${maxRetries} attempts, continuing to next chunk`);
              retries++;
              break;
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
          }
        }
        
        // If we've had 3 consecutive chunk failures, break out
        if (retries >= 3 && successfulChunks === 0) {
          console.error("Too many consecutive failures, aborting data fetch");
          break;
        }
      }
      
      console.log(`Received ${items.length} items in total`);
      
      // Update progress to indicate data is loaded
      setLoadingProgress({ 
        current: items.length, 
        total: items.length, 
        percentage: 100 
      });
      
      if (items && items.length > 0) {
        // Ensure all items have the required fields
        const processedItems = items.map(item => ({
          ...item,
          id: item.id || `temp-${Date.now()}-${Math.random()}`,
          created_at: item.created_at || new Date().toISOString()
        }));
        
        // Store dataset for filtering
        setFullInventoryData(processedItems);
        
        // Set initial display data (all items)
        setInventoryItems(processedItems);
        setFilteredItems(processedItems);
        setTotalItems(processedItems.length);
        
        // Extract unique values for filters from the full dataset
        const uniqueStates = [...new Set(processedItems.map(item => item.state))]
          .filter(Boolean)
          .sort();
          
        const uniqueDistricts = [...new Set(processedItems.map(item => item.district))]
          .filter(Boolean)
          .sort();
          
        const uniqueDeptTypes = [...new Set(processedItems.map(item => item.department_type))]
          .filter(Boolean)
          .sort();
        
        console.log(`Extracted from full dataset: ${uniqueStates.length} states, ${uniqueDistricts.length} districts, ${uniqueDeptTypes.length} department types`);
        console.log("First 5 states:", uniqueStates.slice(0, 5));
        console.log("First 5 districts:", uniqueDistricts.slice(0, 5));
        console.log("First 5 department types:", uniqueDeptTypes.slice(0, 5));
        
        // Update state with extracted values
        setStates(uniqueStates);
        setDistricts(uniqueDistricts);
        setAvailableDistricts(uniqueDistricts);
        setDepartments(uniqueDeptTypes);
        setAvailableDepartments(uniqueDeptTypes);
        
        toast({
          title: "Success",
          description: `Loaded ${processedItems.length} inventory items with ${uniqueStates.length} states, ${uniqueDistricts.length} districts, and ${uniqueDeptTypes.length} department types`,
        });
      } else {
        console.error("No inventory items found in database");
        
        // Try to load filter options directly if we couldn't get items
        fetchAllFilterOptionsFromApi();
        
        setFullInventoryData([]);
        setInventoryItems([]);
        setFilteredItems([]);
        setTotalItems(0);
        
        toast({
          title: "Information",
          description: "No inventory items found in the database.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      
      // Try to load filter options directly if we couldn't get items
      fetchAllFilterOptionsFromApi();
      
      toast({
        title: "Error",
        description: "Failed to load complete inventory data. Attempting to load filter options separately.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all filter options at once from the new API endpoint
  const fetchAllFilterOptionsFromApi = async () => {
    try {
      console.log("Fetching all filter options at once from API...");
      const response = await fetch('/api/get-filter-options');
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`API returned filter options: ${data.counts.states} states, ${data.counts.districts} districts, ${data.counts.departmentTypes} department types`);
        
        // Update all filter options at once
        if (data.states && data.states.length > 0) {
          setStates(data.states);
          console.log(`Set ${data.states.length} states. First few: ${data.states.slice(0, 5).join(', ')}...`);
        }
        
        if (data.districts && data.districts.length > 0) {
          setDistricts(data.districts);
          setAvailableDistricts(data.districts);
          console.log(`Set ${data.districts.length} districts. First few: ${data.districts.slice(0, 5).join(', ')}...`);
        }
        
        if (data.departmentTypes && data.departmentTypes.length > 0) {
          setDepartments(data.departmentTypes);
          setAvailableDepartments(data.departmentTypes);
          console.log(`Set ${data.departmentTypes.length} department types. First few: ${data.departmentTypes.slice(0, 5).join(', ')}...`);
        }
        
        return true;
      } else {
        console.error("API returned an error:", data);
        return false;
      }
    } catch (error) {
      console.error("Error fetching all filter options from API:", error);
      return false;
    }
  }
  
  // Fetch filter options - now tries new combined endpoint first
  const fetchFilterOptions = async () => {
    try {
      console.log("Fetching filter options...");
      setIsLoadingFilters(true);
      
      // Try the new combined endpoint first
      const success = await fetchAllFilterOptionsFromApi();
      
      if (success) {
        console.log("Successfully loaded all filter options at once");
        setIsLoadingFilters(false);
        return;
      }
      
      // Fallback to individual API calls if the combined endpoint fails
      console.log("Falling back to individual API calls for filter options");
      
      // Fetch states
      await fetchStatesFromApi();
      
      // Fetch all districts
      await fetchDistrictsFromApi();
      
      // Fetch all department types via backend
      try {
        const deptTypes = await getUniqueDepartmentTypes();
        if (deptTypes && deptTypes.length > 0) {
          console.log(`Found ${deptTypes.length} department types`);
          setDepartments(deptTypes);
          setAvailableDepartments(deptTypes);
        } else {
          console.log("No department types found, using default values");
          const defaultDeptTypes = ["Fire", "Health", "Police", "Other", "PWD"];
          setDepartments(defaultDeptTypes);
          setAvailableDepartments(defaultDeptTypes);
        }
      } catch (error) {
        console.error("Error fetching department types:", error);
        const defaultDeptTypes = ["Fire", "Health", "Police", "Other", "PWD"];
        setDepartments(defaultDeptTypes);
        setAvailableDepartments(defaultDeptTypes);
      }
      
      setIsLoadingFilters(false);
    } catch (error) {
      console.error("Error fetching filter options:", error);
      
      setIsLoadingFilters(false);
      toast({
        title: "Error",
        description: "Failed to load filter options. Using default values.",
        variant: "destructive",
      });
      
      // Set default values for critical UI elements
      const defaultStates = ["Rajasthan", "Assam", "Kerala", "Andhra Pradesh"];
      const defaultDistricts = ["Ajmer", "Bongaigaon", "Charaideo", "Darrang", "Dhubri"];
      const defaultDeptTypes = ["Fire", "Health", "Police", "Other", "PWD"];
      
      setStates(defaultStates);
      setDistricts(defaultDistricts);
      setAvailableDistricts(defaultDistricts);
      setDepartments(defaultDeptTypes);
      setAvailableDepartments(defaultDeptTypes);
    }
  }

  // Backup method to fetch states from API
  const fetchStatesFromApi = async () => {
    try {
      console.log("Fetching all states from API endpoint...");
      const response = await fetch('/api/get-states');
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.states && data.states.length > 0) {
        console.log(`API returned ${data.states.length} states. First few: ${data.states.slice(0, 5).join(', ')}...`);
        setStates(data.states);
        return data.states;
      } else {
        console.error("API returned no states or encountered an error:", data);
        const defaultStates = ["Rajasthan", "Assam", "Kerala", "Andhra Pradesh"];
        setStates(defaultStates);
        return defaultStates;
      }
    } catch (error) {
      console.error("Error fetching states from API:", error);
      const defaultStates = ["Rajasthan", "Assam", "Kerala", "Andhra Pradesh"];
      setStates(defaultStates);
      return defaultStates;
    }
  }
  
  // Backup method to fetch districts from API
  const fetchDistrictsFromApi = async (stateFilter?: string) => {
    try {
      console.log(`Fetching all districts from API endpoint...${stateFilter ? ` for state ${stateFilter}` : ''}`);
      let url = '/api/get-districts';
      
      if (stateFilter && stateFilter !== 'all') {
        url += `?state=${encodeURIComponent(stateFilter)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.districts && data.districts.length > 0) {
        console.log(`API returned ${data.districts.length} districts. First few: ${data.districts.slice(0, 5).join(', ')}...`);
        if (!stateFilter || stateFilter === 'all') {
          setDistricts(data.districts);
          setAvailableDistricts(data.districts);
        } else {
          setAvailableDistricts(data.districts);
        }
        return data.districts;
      } else {
        console.error("API returned no districts or encountered an error:", data);
        const defaultDistricts = ["Ajmer", "Bongaigaon", "Charaideo", "Darrang", "Dhubri"];
        
        if (!stateFilter || stateFilter === 'all') {
          setDistricts(defaultDistricts);
          setAvailableDistricts(defaultDistricts);
        } else {
          setAvailableDistricts(defaultDistricts);
        }
        return defaultDistricts;
      }
    } catch (error) {
      console.error("Error fetching districts from API:", error);
      const defaultDistricts = ["Ajmer", "Bongaigaon", "Charaideo", "Darrang", "Dhubri"];
      
      if (!stateFilter || stateFilter === 'all') {
        setDistricts(defaultDistricts);
        setAvailableDistricts(defaultDistricts);
      } else {
        setAvailableDistricts(defaultDistricts);
      }
      return defaultDistricts;
    }
  }

  // Filter items based on selected filters - now uses the full dataset
  useEffect(() => {
    console.log("Applying filters to full dataset:", {
      state: selectedState,
      district: selectedDistrict,
      department: selectedDepartment
    });
    
    // Start with the full dataset
    let filtered = [...fullInventoryData];
    
    // Apply filters
    if (selectedState && selectedState !== "all") {
      console.log(`Filtering by state: ${selectedState}`);
      filtered = filtered.filter((item) => item.state === selectedState);
    }
    
    if (selectedDistrict && selectedDistrict !== "all") {
      console.log(`Filtering by district: ${selectedDistrict}`);
      filtered = filtered.filter((item) => item.district === selectedDistrict);
    }
    
    if (selectedDepartment && selectedDepartment !== "all") {
      console.log(`Filtering by department: ${selectedDepartment}`);
      filtered = filtered.filter((item) => item.department_type === selectedDepartment);
    }
    
    console.log(`After filtering: ${filtered.length} items remain`);
    setFilteredItems(filtered);
    
  }, [fullInventoryData, selectedState, selectedDistrict, selectedDepartment]);

  // Reset filters and refresh data
  const resetFilters = () => {
    console.log("Resetting all filters");
    setSelectedState("all");
    setSelectedDistrict("all");
    setSelectedDepartment("all");
    // No need to call fetchInventoryItems here as the useEffect will handle it
    // Just update UI to show we're filtering again
    toast({
      title: "Filters Reset",
      description: "Showing all inventory items",
    });
  }

  // Update available districts when state changes
  useEffect(() => {
    if (selectedState && selectedState !== "all") {
      console.log(`State changed to ${selectedState}, filtering districts...`);
      
      // Filter the full list of districts based on selected state
      // For "all", we'll set all districts as available later
      try {
        // Get all districts for this state directly from backend
        getUniqueDistricts(selectedState).then(filteredDistricts => {
          if (filteredDistricts && filteredDistricts.length > 0) {
            console.log(`Found ${filteredDistricts.length} districts for state ${selectedState}`);
            setAvailableDistricts(filteredDistricts);
          } else {
            console.log(`No districts found for state ${selectedState}, using default districts`);
            setAvailableDistricts(districts); // Use all districts as fallback
          }
        });
      } catch (error) {
        console.error("Error filtering districts:", error);
        setAvailableDistricts(districts);
      }
    } else {
      // For "all" state, show all districts
      console.log("State set to 'all', showing all districts");
      setAvailableDistricts(districts);
    }
    
    // Reset the selected district and department when state changes
    setSelectedDistrict("all");
    setSelectedDepartment("all");
  }, [selectedState, districts]);

  // Update available departments when district changes
  useEffect(() => {
    console.log(`District changed to ${selectedDistrict}, filtering departments...`);
    
    if ((selectedState && selectedState !== "all") || (selectedDistrict && selectedDistrict !== "all")) {
      try {
        // Get departments based on filters
        getUniqueDepartmentTypes(
          selectedState !== "all" ? selectedState : undefined,
          selectedDistrict !== "all" ? selectedDistrict : undefined
        ).then(filteredDepartments => {
          if (filteredDepartments && filteredDepartments.length > 0) {
            console.log(`Found ${filteredDepartments.length} departments with filters`);
            setAvailableDepartments(filteredDepartments);
          } else {
            console.log("No departments found with filters, using all departments");
            setAvailableDepartments(departments); // Use all departments as fallback
          }
        });
      } catch (error) {
        console.error("Error filtering departments:", error);
        setAvailableDepartments(departments);
      }
    } else {
      // For "all" filters, show all departments
      console.log("No specific filters, showing all departments");
      setAvailableDepartments(departments);
    }
    
    // Reset the selected department when district changes
    setSelectedDepartment("all");
  }, [selectedState, selectedDistrict, departments]);

  // Update form state when state changes in the form
  useEffect(() => {
    if (newItem.state) {
      const fetchDistrictsForState = async () => {
        try {
          const districts = await getUniqueDistricts(newItem.state);
          
          if (districts && districts.length > 0) {
            setAvailableDistricts(districts);
          } else {
            console.error("No districts found for state");
            setAvailableDistricts([]);
          }
        } catch (error) {
          console.error("Error fetching districts:", error);
          setAvailableDistricts([]);
        }
      };
      
      fetchDistrictsForState();
      setNewItem((prev) => ({ ...prev, district: "", department_type: "", department_name: "" }));
    }
  }, [newItem.state]);

  // Update form state when district changes in the form
  useEffect(() => {
    if (newItem.district) {
      const fetchDepartmentsForDistrict = async () => {
        try {
          const departmentTypes = await getUniqueDepartmentTypes(newItem.state, newItem.district);
          
          if (departmentTypes && departmentTypes.length > 0) {
            setAvailableDepartments(departmentTypes);
          } else {
            console.error("No department types found for district");
            setAvailableDepartments([]);
          }
        } catch (error) {
          console.error("Error fetching departments:", error);
          setAvailableDepartments([]);
        }
      };
      
      fetchDepartmentsForDistrict();
      setNewItem((prev) => ({ ...prev, department_type: "", department_name: "" }));
    }
  }, [newItem.district, newItem.state]);

  // Handle adding a new item
  const handleAddItem = async () => {
    try {
      setIsLoading(true);
      
      console.log("Adding new inventory item:", newItem);
      
      // Validate required fields
      const errors = [];
      if (!newItem.state) errors.push("State is required");
      if (!newItem.district) errors.push("District is required");
      if (!newItem.department_type) errors.push("Department type is required");
      if (!newItem.department_name) errors.push("Department name is required");
      if (!newItem.item_code) errors.push("Item code is required");
      if (!newItem.item_name) errors.push("Item name is required");
      
      if (errors.length > 0) {
        console.error("Validation errors:", errors);
        toast({
          title: "Error",
          description: errors.join(", "),
          variant: "destructive",
        });
        return;
      }
      
      const newItemData = await createInventoryItem(newItem);
      console.log("Create item response:", newItemData);

      if (newItemData) {
        setAddModalOpen(false);
        setNewItem({
          state: "",
          district: "",
          department_type: "",
          department_name: "",
          item_code: 0,
          item_name: "",
          quantity: 0,
        });
        console.log("Item added successfully:", newItemData);
        toast({
          title: "Success",
          description: "Item added successfully",
        });
        // Refresh the inventory items list
        fetchAllInventoryData();
      } else {
        console.error("Failed to add item");
        toast({
          title: "Error",
          description: "Failed to add item. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "An error occurred while adding the item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle deleting an item
  const handleDeleteItem = async () => {
    if (!itemToDelete || !itemToDelete.id) {
      console.error("No item selected for deletion or item has no ID");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Deleting inventory item:", itemToDelete.id);
      
      const success = await deleteInventoryItem(itemToDelete.id);
      console.log("Delete item response:", success);

      if (success) {
        setInventoryItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
        setFilteredItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        console.log("Item deleted successfully");
        toast({
          title: "Success",
          description: "Item deleted successfully",
        });
      } else {
        console.error("Failed to delete item");
        toast({
          title: "Error",
          description: "Failed to delete item. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  // Get current items for the current page
  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredItems.slice(startIndex, endIndex)
  }

  // Initial load debugging
  useEffect(() => {
    try {
      // Log environment variables (safely)
      console.log("Frontend environment variables available:", {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "defined" : "undefined",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "defined" : "undefined"
      });
      
      // Verify that backend modules are imported correctly
      console.log("Backend functions imported:", {
        getInventoryItems: typeof getInventoryItems,
        getUniqueStates: typeof getUniqueStates,
        getUniqueDistricts: typeof getUniqueDistricts,
        getUniqueDepartmentTypes: typeof getUniqueDepartmentTypes,
        createInventoryItem: typeof createInventoryItem,
        deleteInventoryItem: typeof deleteInventoryItem,
      });
    } catch (error) {
      console.error("Error checking environment:", error);
    }
  }, []);

  // Function to check Supabase connection
  const checkSupabaseConnection = async () => {
    try {
      const response = await fetch('/api/check-connection');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking connection:", error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Function to fetch ALL filter options
  const fetchAllFilterOptions = async () => {
    console.log("Starting fetchAllFilterOptions...");
    setIsLoadingFilters(true);
    
    try {
      // Try the API endpoint first
      const success = await fetchAllFilterOptionsFromApi();
      
      if (success) {
        console.log("Successfully loaded all filter options from API");
        setIsLoadingFilters(false);
        return;
      }
      
      // If API fails, use the fetchFilterOptions as fallback
      console.log("API approach failed, using fetchFilterOptions fallback");
      await fetchFilterOptions();
    } catch (error) {
      console.error("Error in fetchAllFilterOptions:", error);
      await fetchFilterOptions(); // Fallback to other method
    } finally {
      setIsLoadingFilters(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <motion.div
        className="w-64 bg-lime-50 dark:bg-black border-r border-lime-200 dark:border-zinc-800 hidden md:block"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 border-b border-lime-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-lime-900 dark:text-lime-400 flex items-center">
            <Package2 className="mr-2 h-5 w-5" />
            Inventory System
          </h2>
        </div>
        <div className="p-4">
          <nav className="space-y-2">
            <a
              href="#"
              className="flex items-center p-2 rounded-md text-lime-900 dark:text-white bg-lime-200 dark:bg-zinc-800"
            >
              <Package className="mr-2 h-5 w-5" />
              Inventory
            </a>
            <a
              href="#"
              className="flex items-center p-2 rounded-md text-lime-700 dark:text-zinc-400 hover:bg-lime-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Orders
            </a>
            <a
              href="#"
              className="flex items-center p-2 rounded-md text-lime-700 dark:text-zinc-400 hover:bg-lime-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Users className="mr-2 h-5 w-5" />
              Suppliers
            </a>
            <a
              href="#"
              className="flex items-center p-2 rounded-md text-lime-700 dark:text-zinc-400 hover:bg-lime-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Building className="mr-2 h-5 w-5" />
              Departments
            </a>
            <a
              href="#"
              className="flex items-center p-2 rounded-md text-lime-700 dark:text-zinc-400 hover:bg-lime-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Reports
            </a>
            <a
              href="#"
              className="flex items-center p-2 rounded-md text-lime-700 dark:text-zinc-400 hover:bg-lime-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </a>
          </nav>
        </div>
        <div className="absolute bottom-0 p-4 w-64">
          <div className="p-4 bg-lime-100 dark:bg-zinc-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium text-lime-900 dark:text-white">Low Stock Alert</span>
            </div>
            <p className="text-sm text-lime-700 dark:text-zinc-300">
              You have 2 items with critically low stock levels.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full bg-lime-200 dark:bg-zinc-700 hover:bg-lime-300 dark:hover:bg-zinc-600"
            >
              View Items
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-black border-b border-lime-200 dark:border-zinc-800 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            <motion.h1
              className="text-2xl font-bold text-lime-900 dark:text-white"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Inventory Management
            </motion.h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-lime-50 dark:bg-black">
          {/* Filters */}
          <motion.div
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center mb-4">
              <Filter className="mr-2 h-5 w-5 text-lime-700 dark:text-lime-400" />
              <h2 className="text-xl font-semibold text-lime-900 dark:text-white">Filters</h2>
              {(selectedState || selectedDistrict || selectedDepartment) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="ml-auto flex items-center gap-1 text-lime-700 dark:text-lime-400 hover:text-lime-900 hover:dark:text-white"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state-filter" className="text-lime-900 dark:text-white">
                  State
                </Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger
                    id="state-filter"
                    className="w-full bg-white dark:bg-zinc-800 border-lime-200 dark:border-zinc-700"
                  >
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All States</SelectItem>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district-filter" className="text-lime-900 dark:text-white">
                  District
                </Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
                  <SelectTrigger
                    id="district-filter"
                    className="w-full bg-white dark:bg-zinc-800 border-lime-200 dark:border-zinc-700"
                  >
                    <SelectValue placeholder={selectedState ? "Select District" : "Select State first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Districts</SelectItem>
                      {availableDistricts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department-filter" className="text-lime-900 dark:text-white">
                  Department
                </Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled={!selectedState}>
                  <SelectTrigger
                    id="department-filter"
                    className="w-full bg-white dark:bg-zinc-800 border-lime-200 dark:border-zinc-700"
                  >
                    <SelectValue placeholder={selectedState ? "Select Department" : "Select State first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Departments</SelectItem>
                      {availableDepartments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Inventory Table */}
          <motion.div
            className="bg-white dark:bg-zinc-900 rounded-lg border border-lime-200 dark:border-zinc-800 shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-lime-50 dark:bg-zinc-800 hover:bg-lime-50 dark:hover:bg-zinc-800">
                    <TableHead className="text-lime-900 dark:text-white">State</TableHead>
                    <TableHead className="text-lime-900 dark:text-white">District</TableHead>
                    <TableHead className="text-lime-900 dark:text-white">Department Name</TableHead>
                    <TableHead className="text-lime-900 dark:text-white">Item Code</TableHead>
                    <TableHead className="text-lime-900 dark:text-white">Item Name</TableHead>
                    <TableHead className="text-lime-900 dark:text-white">Quantity</TableHead>
                    <TableHead className="text-lime-900 dark:text-white">Created At</TableHead>
                    <TableHead className="text-lime-900 dark:text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <div className="flex items-center justify-center">
                          <span className="animate-spin mr-2">⏳</span>
                          Loading...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : getCurrentItems().length > 0 ? (
                    getCurrentItems().map((item) => (
                      <TableRow
                        key={item.id}
                        className="group hover:bg-lime-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <TableCell className="text-lime-900 dark:text-white">{item.state}</TableCell>
                        <TableCell className="text-lime-900 dark:text-white">{item.district}</TableCell>
                        <TableCell>
                          {item.department_name}
                        </TableCell>
                        <TableCell className="text-lime-900 dark:text-white">{item.item_code}</TableCell>
                        <TableCell className="text-lime-900 dark:text-white">{item.item_name}</TableCell>
                        <TableCell>
                          {item.quantity !== null && (
                            item.quantity < 10 ? (
                              <Badge variant="destructive" className="animate-pulse">
                                {item.quantity}
                              </Badge>
                            ) : item.quantity < 20 ? (
                              <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500">
                                {item.quantity}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-lime-700 dark:text-lime-400 border-lime-400 dark:border-lime-700"
                              >
                                {item.quantity}
                              </Badge>
                            )
                          )}
                        </TableCell>
                        <TableCell className="text-lime-900 dark:text-white">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setItemToDelete(item)
                              setDeleteDialogOpen(true)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-lime-700 dark:text-lime-400">
                        No inventory items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination Controls */}
            {filteredItems.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-lime-200 dark:border-zinc-800">
                <div className="flex items-center text-sm text-lime-700 dark:text-lime-400">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredItems.length)} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="border-lime-200 dark:border-zinc-700 text-lime-700 dark:text-lime-400"
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-lime-200 dark:border-zinc-700 text-lime-700 dark:text-lime-400"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-lime-700 dark:text-lime-400">
                    Page {currentPage} of {pageCount || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pageCount || pageCount === 0}
                    className="border-lime-200 dark:border-zinc-700 text-lime-700 dark:text-lime-400"
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pageCount)}
                    disabled={currentPage === pageCount || pageCount === 0}
                    className="border-lime-200 dark:border-zinc-700 text-lime-700 dark:text-lime-400"
                  >
                    Last
                  </Button>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1) // Reset to first page when changing items per page
                    }}
                    id="items-per-page"
                    aria-label="Items per page"
                    className="h-8 px-2 text-sm rounded border border-lime-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-lime-700 dark:text-lime-400"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Add New Item Button */}
      <motion.div
        className="fixed bottom-6 right-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => setAddModalOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg bg-lime-500 hover:bg-lime-600 text-white"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add New Item</span>
        </Button>
      </motion.div>

      {/* Add New Item Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-900 border-lime-200 dark:border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-lime-900 dark:text-white">Add New Inventory Item</DialogTitle>
            <DialogDescription className="text-lime-700 dark:text-lime-400">
              Fill in the details to add a new inventory item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state" className="text-lime-900 dark:text-white">
                  State *
                </Label>
                <Select value={newItem.state} onValueChange={(value) => setNewItem({ ...newItem, state: value })}>
                  <SelectTrigger id="state" className="bg-white dark:bg-zinc-800 border-lime-200 dark:border-zinc-700">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district" className="text-lime-900 dark:text-white">
                  District *
                </Label>
                <Select
                  value={newItem.district}
                  onValueChange={(value) => setNewItem({ ...newItem, district: value })}
                  disabled={!newItem.state}
                >
                  <SelectTrigger
                    id="district"
                    className="bg-white dark:bg-zinc-800 border-lime-200 dark:border-zinc-700"
                  >
                    <SelectValue placeholder={newItem.state ? "Select District" : "Select State first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {newItem.state ? availableDistricts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      )) : null}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-lime-900 dark:text-white">
                  Department Type *
                </Label>
                <Select
                  value={newItem.department_type}
                  onValueChange={(value) => setNewItem({ ...newItem, department_type: value })}
                  disabled={!newItem.district}
                >
                  <SelectTrigger
                    id="department"
                    className="bg-white dark:bg-zinc-800 border-lime-200 dark:border-zinc-700"
                  >
                    <SelectValue placeholder={newItem.district ? "Select Department Type" : "Select District first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {newItem.district ? availableDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      )) : null}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentName" className="text-lime-900 dark:text-white">
                  Department Name *
                </Label>
                <Input
                  id="departmentName"
                  value={newItem.department_name}
                  onChange={(e) => setNewItem({ ...newItem, department_name: e.target.value })}
                  placeholder="e.g. Health Department"
                  className="bg-white dark:bg-zinc-800 border-lime-200 dark:border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemCode" className="text-lime-900 dark:text-white">
                  Item Code *
                </Label>
                <Input
                  id="itemCode"
                  value={newItem.item_code}
                  onChange={(e) => setNewItem({ ...newItem, item_code: Number.parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 1001"
                  className="bg-white dark:bg-zinc-800 border-lime-200 dark:border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemName" className="text-lime-900 dark:text-white">
                  Item Name *
                </Label>
                <Input
                  id="itemName"
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                  placeholder="e.g. Paracetamol"
                  className="bg-white dark:bg-zinc-800 border-lime-200 dark:border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-lime-900 dark:text-white">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 0 })}
                  className="bg-white dark:bg-zinc-800 border-lime-200 dark:border-zinc-700"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddModalOpen(false)}
              className="border-lime-200 dark:border-zinc-700 text-lime-700 dark:text-lime-400"
            >
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={isLoading} className="bg-lime-500 hover:bg-lime-600 text-white">
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Adding...
                </>
              ) : (
                "Add Item"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border-lime-200 dark:border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lime-900 dark:text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-lime-700 dark:text-lime-400">
              {itemToDelete && (
                <>
                  Are you sure you want to delete this item from {itemToDelete.department_name}?
                  <div className="mt-2 p-2 border rounded bg-lime-50 dark:bg-zinc-800 border-lime-200 dark:border-zinc-700">
                    <p className="text-lime-900 dark:text-white">
                      <strong>Item:</strong> {itemToDelete.item_name}
                    </p>
                    <p className="text-lime-900 dark:text-white">
                      <strong>Code:</strong> {itemToDelete.item_code}
                    </p>
                    <p className="text-lime-900 dark:text-white">
                      <strong>Quantity:</strong> {itemToDelete.quantity}
                    </p>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-lime-200 dark:border-zinc-700 text-lime-700 dark:text-lime-400">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Display loading progress indicator when loading */}
      {isLoading && loadingProgress.total > 0 && (
        <DataLoadingProgress 
          current={loadingProgress.current} 
          total={loadingProgress.total} 
          percentage={loadingProgress.percentage} 
        />
      )}

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}

