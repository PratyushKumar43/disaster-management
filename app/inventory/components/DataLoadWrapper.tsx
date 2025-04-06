"use client"

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import InventoryManagement from "./inventory-management";
import { getInventoryItems } from "@/backend/inventory";
import type { InventoryItem } from "@/backend/inventory";

export default function DataLoadWrapper() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [filterOptions, setFilterOptions] = useState<{
    states: string[];
    districts: string[];
    departmentTypes: string[];
  }>({
    states: [],
    districts: [],
    departmentTypes: []
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);

      // First try the optimized API endpoint
      try {
        await loadDataFromApi();
      } catch (apiError) {
        console.error("Error loading from API, falling back to direct method:", apiError);
        await loadDataDirectly();
      }
    } catch (error) {
      console.error("Failed to load inventory data:", error);
      setError("Failed to load inventory data. Please try refreshing the page.");
      toast({
        title: "Error",
        description: "Failed to load inventory data. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDataFromApi = async () => {
    let allItems: InventoryItem[] = [];
    let offset = 0;
    let hasMore = true;
    const limit = 5000;

    while (hasMore) {
      const response = await fetch(`/api/data-loader?offset=${offset}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        if (data.items && data.items.length > 0) {
          allItems = [...allItems, ...data.items];
          
          // Update progress
          const progress = data.totalCount 
            ? Math.min(Math.round((allItems.length / data.totalCount) * 100), 99)
            : Math.min(allItems.length / 1000, 99);
          setLoadingProgress(progress);
          
          // Show toast notification for progress
          if (allItems.length % 10000 === 0) {
            toast({
              title: "Loading Data",
              description: `Loaded ${allItems.length} items so far...`,
            });
          }
          
          // If this is the first chunk, also set filter options
          if (offset === 0 && data.filterOptions) {
            setFilterOptions(data.filterOptions);
          }
          
          // Check if we have more data to fetch
          if (data.hasMore) {
            offset = data.nextOffset;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      } else {
        throw new Error(data.error || "Failed to fetch data");
      }
    }
    
    console.log(`Successfully loaded ${allItems.length} inventory items`);
    setInventoryData(allItems);
    setLoadingProgress(100);
    
    // Final toast notification
    toast({
      title: "Success",
      description: `Loaded all ${allItems.length} inventory items`,
    });
  };

  const loadDataDirectly = async () => {
    // Fallback method that fetches data directly using backend functions
    let allItems: InventoryItem[] = [];
    let currentOffset = 0;
    let hasMore = true;
    const chunkSize = 5000;
    
    while (hasMore) {
      try {
        console.log(`Fetching items from offset ${currentOffset} with limit ${chunkSize}`);
        
        const items = await getInventoryItems({
          limit: chunkSize,
          offset: currentOffset,
        });
        
        if (items && items.length > 0) {
          allItems = [...allItems, ...items];
          currentOffset += items.length;
          
          // Update progress (rough estimate assuming 300k total records)
          const estimatedTotal = 300000;
          const progress = Math.min(Math.round((allItems.length / estimatedTotal) * 100), 99);
          setLoadingProgress(progress);
          
          // Show progress notification
          if (allItems.length % 10000 === 0) {
            toast({
              title: "Loading Data",
              description: `Loaded ${allItems.length} items so far...`,
            });
          }
          
          // Extract filter options from first chunk
          if (currentOffset === items.length) {
            const uniqueStates = [...new Set(items.map(item => item.state))]
              .filter(Boolean)
              .sort();
              
            const uniqueDistricts = [...new Set(items.map(item => item.district))]
              .filter(Boolean)
              .sort();
              
            const uniqueDeptTypes = [...new Set(items.map(item => item.department_type))]
              .filter(Boolean)
              .sort();
              
            setFilterOptions({
              states: uniqueStates,
              districts: uniqueDistricts,
              departmentTypes: uniqueDeptTypes
            });
          }
          
          // Check if we have more data to fetch
          if (items.length < chunkSize) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`Error fetching chunk at offset ${currentOffset}:`, error);
        hasMore = false;
      }
    }
    
    console.log(`Successfully loaded ${allItems.length} inventory items directly`);
    setInventoryData(allItems);
    setLoadingProgress(100);
    
    // Final toast notification
    toast({
      title: "Success",
      description: `Loaded all ${allItems.length} inventory items`,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-2xl font-bold mb-4">Loading Inventory Data...</div>
        <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-lime-500 transition-all duration-300 ease-in-out"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
        <div className="text-sm text-gray-500">{loadingProgress}% complete</div>
        <p className="mt-4 text-center max-w-md">
          Loading all inventory data. This may take a moment for large datasets...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-2xl font-bold mb-4 text-red-500">Error Loading Data</div>
        <p className="text-center max-w-md mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-lime-500 text-white rounded hover:bg-lime-600 transition-colors"
          onClick={() => loadAllData()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return <InventoryManagement preloadedData={inventoryData} filterOptions={filterOptions} />;
} 