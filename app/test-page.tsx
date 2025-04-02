"use client";

import { useState, useEffect } from "react";
import { getInventoryItems, getUniqueStates, getUniqueDistricts, getUniqueDepartmentTypes } from "@/backend/inventory";
import { Button } from "@/components/ui/button";

interface InventoryItem {
  id: string;
  state: string;
  district: string;
  department_type: string;
  department_name: string;
  item_code: number;
  item_name: string;
  quantity: number | null;
  created_at: string;
}

export default function TestPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [departmentTypes, setDepartmentTypes] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      addLog("Fetching inventory items...");
      
      const result = await getInventoryItems({ limit: 5 });
      
      if (result.success && result.data) {
        setItems(result.data);
        addLog(`Successfully fetched ${result.data.length} items`);
      } else {
        addLog(`Error fetching items: ${JSON.stringify(result.error)}`);
      }
    } catch (error) {
      addLog(`Exception fetching items: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      setLoading(true);
      addLog("Fetching states...");
      
      const result = await getUniqueStates();
      
      if (result.success && result.data) {
        setStates(result.data);
        addLog(`Successfully fetched ${result.data.length} states`);
      } else {
        addLog(`Error fetching states: ${JSON.stringify(result.error)}`);
      }
    } catch (error) {
      addLog(`Exception fetching states: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      setLoading(true);
      addLog("Fetching districts...");
      
      const result = await getUniqueDistricts();
      
      if (result.success && result.data) {
        setDistricts(result.data);
        addLog(`Successfully fetched ${result.data.length} districts`);
      } else {
        addLog(`Error fetching districts: ${JSON.stringify(result.error)}`);
      }
    } catch (error) {
      addLog(`Exception fetching districts: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentTypes = async () => {
    try {
      setLoading(true);
      addLog("Fetching department types...");
      
      const result = await getUniqueDepartmentTypes();
      
      if (result.success && result.data) {
        setDepartmentTypes(result.data);
        addLog(`Successfully fetched ${result.data.length} department types`);
      } else {
        addLog(`Error fetching department types: ${JSON.stringify(result.error)}`);
      }
    } catch (error) {
      addLog(`Exception fetching department types: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Backend Test Page</h1>
      
      <div className="flex flex-wrap gap-4 mb-8">
        <Button onClick={fetchItems} disabled={loading}>
          Fetch Inventory Items
        </Button>
        <Button onClick={fetchStates} disabled={loading}>
          Fetch States
        </Button>
        <Button onClick={fetchDistricts} disabled={loading}>
          Fetch Districts
        </Button>
        <Button onClick={fetchDepartmentTypes} disabled={loading}>
          Fetch Department Types
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded h-80 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
            {logs.length === 0 && <div className="text-gray-500">No logs yet. Click a button to test.</div>}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded h-80 overflow-y-auto">
            {items.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Inventory Items ({items.length})</h3>
                <pre className="text-xs">{JSON.stringify(items, null, 2)}</pre>
              </div>
            )}
            
            {states.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">States ({states.length})</h3>
                <pre className="text-xs">{JSON.stringify(states, null, 2)}</pre>
              </div>
            )}
            
            {districts.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Districts ({districts.length})</h3>
                <pre className="text-xs">{JSON.stringify(districts, null, 2)}</pre>
              </div>
            )}
            
            {departmentTypes.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Department Types ({departmentTypes.length})</h3>
                <pre className="text-xs">{JSON.stringify(departmentTypes, null, 2)}</pre>
              </div>
            )}
            
            {items.length === 0 && states.length === 0 && districts.length === 0 && departmentTypes.length === 0 && (
              <div className="text-gray-500">No results yet. Click a button to test.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 