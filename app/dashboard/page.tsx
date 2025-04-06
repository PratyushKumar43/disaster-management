"use client";

import Link from "next/link";
import { ThemeProvider } from "@/app/inventory/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Cloud, 
  Settings, 
  BarChart, 
  Users, 
  Bell,
  ArrowRightCircle,
  AlertCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Skeleton } from "@/components/ui/skeleton";
import RecentActivityFeed from "./components/RecentActivityFeed";

// Define interfaces
interface InventoryStats {
  totalItems: number;
  lowStockAlerts: number;
  activeRegions: number;
  isLoading: boolean;
}

interface InventoryItem {
  id: number;
  quantity: number;
  district?: string;
}

export default function Dashboard() {
  // State for inventory stats
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    lowStockAlerts: 0,
    activeRegions: 0,
    isLoading: true
  });
  
  // Fetch inventory statistics from Supabase
  useEffect(() => {
    async function fetchInventoryStats() {
      try {
        // Use extremely simple queries to avoid any syntax errors or server issues
        // Just count all items
        const totalItemsQuery = supabase
          .from('inventory')
          .select('*', { count: 'exact', head: true });
        
        // Get all inventory with quantities for client-side filtering
        const inventoryWithQuantityQuery = supabase
          .from('inventory')
          .select('id, quantity');
        
        // Get all districts for client-side processing
        const districtsQuery = supabase
          .from('inventory')
          .select('district');
        
        // Execute all queries in parallel
        const [totalItemsResult, inventoryWithQuantityResult, districtsResult] = await Promise.all([
          totalItemsQuery,
          inventoryWithQuantityQuery,
          districtsQuery
        ]);
        
        // Handle each result individually with client-side processing
        const totalItems = totalItemsResult.error ? 0 : (totalItemsResult.count || 0);
        
        // Process low stock items on the client side
        const inventoryItems: InventoryItem[] = inventoryWithQuantityResult.error ? [] : (inventoryWithQuantityResult.data || []);
        const lowStockCount = inventoryItems.filter(
          (item: InventoryItem) => typeof item.quantity === 'number' && item.quantity < 10 && item.quantity > 0
        ).length;
        
        // Process districts to get unique values
        const districtsData: InventoryItem[] = districtsResult.error ? [] : (districtsResult.data || []);
        const uniqueDistricts = [...new Set(districtsData.map((item: InventoryItem) => item.district).filter(Boolean))];
        
        // Set stats with collected data
        setStats({
          totalItems,
          lowStockAlerts: lowStockCount,
          activeRegions: uniqueDistricts.length,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching inventory stats:', error);
        setStats({
          totalItems: 0,
          lowStockAlerts: 0,
          activeRegions: 0,
          isLoading: false
        });
      }
    }
    
    fetchInventoryStats();
    
    // Set up real-time subscription for inventory changes
    const subscription = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'inventory' 
      }, () => {
        // Refresh stats when inventory changes
        fetchInventoryStats();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return (
    <ThemeProvider defaultTheme="light" storageKey="admin-theme">
      <div className="min-h-screen flex flex-col bg-primaryBlue-50">
        {/* Header */}
        <header className="bg-white shadow-sm py-4 border-b border-primaryBlue-200">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-primaryBlue-900">Disaster Management | Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative text-primaryBlue-600 hover:text-primaryBlue-700">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
              <Link href="/" className="text-primaryBlue-600 hover:text-primaryBlue-800 transition-colors">
                Return to Home
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-primaryBlue-200 col-span-1 lg:col-span-3">
              <h2 className="text-xl font-semibold text-primaryBlue-900 mb-4">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primaryBlue-50 p-4 rounded-md border border-primaryBlue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primaryBlue-700">Total Inventory Items</p>
                      {stats.isLoading ? (
                        <Skeleton className="h-8 w-24 bg-primaryBlue-100" />
                      ) : (
                        <p className="text-2xl font-bold text-primaryBlue-900">{stats.totalItems.toLocaleString()}</p>
                      )}
                    </div>
                    <Package className="h-10 w-10 text-primaryBlue-500" />
                  </div>
                </div>
                <div className="bg-primaryBlue-50 p-4 rounded-md border border-primaryBlue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primaryBlue-700">Low Stock Alerts</p>
                      {stats.isLoading ? (
                        <Skeleton className="h-8 w-24 bg-primaryBlue-100" />
                      ) : (
                        <p className="text-2xl font-bold text-primaryBlue-900">
                          {stats.lowStockAlerts}
                          {stats.lowStockAlerts > 0 && (
                            <span className="ml-2 text-xs text-red-500 animate-pulse">
                              <AlertCircle className="h-4 w-4 inline-block" />
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <Bell className="h-10 w-10 text-primaryBlue-500" />
                  </div>
                </div>
                <div className="bg-primaryBlue-50 p-4 rounded-md border border-primaryBlue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primaryBlue-700">Active Regions</p>
                      {stats.isLoading ? (
                        <Skeleton className="h-8 w-24 bg-primaryBlue-100" />
                      ) : (
                        <p className="text-2xl font-bold text-primaryBlue-900">{stats.activeRegions}</p>
                      )}
                    </div>
                    <Users className="h-10 w-10 text-primaryBlue-500" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Access */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-primaryBlue-200 col-span-1 lg:col-span-2">
              <h2 className="text-xl font-semibold text-primaryBlue-900 mb-4">Quick Access</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/inventory" className="flex items-center p-4 bg-primaryBlue-50 rounded-md border border-primaryBlue-200 hover:bg-primaryBlue-100 transition-colors">
                  <Package className="h-8 w-8 text-primaryBlue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-primaryBlue-900">Inventory Management</h3>
                    <p className="text-sm text-primaryBlue-700">Manage relief supplies</p>
                  </div>
                  <ArrowRightCircle className="h-5 w-5 text-primaryBlue-500 ml-auto" />
                </Link>
                <Link href="/weather" className="flex items-center p-4 bg-primaryBlue-50 rounded-md border border-primaryBlue-200 hover:bg-primaryBlue-100 transition-colors">
                  <Cloud className="h-8 w-8 text-primaryBlue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-primaryBlue-900">Weather Forecasting</h3>
                    <p className="text-sm text-primaryBlue-700">Real-time weather updates</p>
                  </div>
                  <ArrowRightCircle className="h-5 w-5 text-primaryBlue-500 ml-auto" />
                </Link>
                <Link href="/settings" className="flex items-center p-4 bg-primaryBlue-50 rounded-md border border-primaryBlue-200 hover:bg-primaryBlue-100 transition-colors">
                  <Settings className="h-8 w-8 text-primaryBlue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-primaryBlue-900">System Settings</h3>
                    <p className="text-sm text-primaryBlue-700">Configure system preferences</p>
                  </div>
                  <ArrowRightCircle className="h-5 w-5 text-primaryBlue-500 ml-auto" />
                </Link>
                <Link href="#" className="flex items-center p-4 bg-primaryBlue-50 rounded-md border border-primaryBlue-200 hover:bg-primaryBlue-100 transition-colors">
                  <BarChart className="h-8 w-8 text-primaryBlue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-primaryBlue-900">Reports</h3>
                    <p className="text-sm text-primaryBlue-700">View analytics and data</p>
                  </div>
                  <ArrowRightCircle className="h-5 w-5 text-primaryBlue-500 ml-auto" />
                </Link>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-primaryBlue-200">
              <h2 className="text-xl font-semibold text-primaryBlue-900 mb-4">Recent Activity</h2>
              <ul className="space-y-3">
                <RecentActivityFeed isLoading={stats.isLoading} />
              </ul>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white shadow-sm py-4 border-t border-primaryBlue-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-2 md:mb-0">
                <p className="text-sm text-primaryBlue-700">&copy; {new Date().getFullYear()} Disaster Management. All rights reserved.</p>
              </div>
              <div className="flex space-x-4">
                <Link href="/terms" className="text-sm text-primaryBlue-600 hover:text-primaryBlue-800 transition-colors">Terms</Link>
                <Link href="/privacy" className="text-sm text-primaryBlue-600 hover:text-primaryBlue-800 transition-colors">Privacy</Link>
                <Link href="/contact" className="text-sm text-primaryBlue-600 hover:text-primaryBlue-800 transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
