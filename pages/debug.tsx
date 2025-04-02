import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, X, AlertTriangle, AlertCircle, Server } from 'lucide-react';

export default function DebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [countStatus, setCountStatus] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<any>(null);
  const [inventoryStatus, setInventoryStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setConnectionStatus(null);
    setCountStatus(null);
    setFilterStatus(null);
    setInventoryStatus(null);
    
    try {
      // Test database connection
      console.log('Testing database connection...');
      const connResponse = await fetch('/api/check-connection');
      const connData = await connResponse.json();
      setConnectionStatus({
        success: connResponse.ok && connData.success,
        data: connData,
        time: new Date().toISOString()
      });
      
      // Test inventory count
      console.log('Testing inventory count API...');
      const countResponse = await fetch('/api/inventory-count');
      const countData = await countResponse.json();
      setCountStatus({
        success: countResponse.ok && countData.success,
        data: countData,
        time: new Date().toISOString()
      });
      
      // Test filter options
      console.log('Testing filter options API...');
      const filterResponse = await fetch('/api/get-filter-options');
      const filterData = await filterResponse.json();
      setFilterStatus({
        success: filterResponse.ok && filterData.success,
        data: filterData,
        time: new Date().toISOString()
      });
      
      // Test inventory data (first page only)
      console.log('Testing inventory data API (first page)...');
      const invResponse = await fetch('/api/inventory?offset=0&limit=10');
      const invData = await invResponse.json();
      setInventoryStatus({
        success: invResponse.ok && invData.success,
        data: {
          ...invData,
          items: invData.items ? `${invData.items.length} items retrieved` : 'No items'
        },
        time: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to render status
  const renderStatus = (status: any, title: string) => {
    if (!status) return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Test not run yet</p>
        </CardContent>
      </Card>
    );
    
    return (
      <Card className={`mb-4 ${status.success ? 'border-green-500' : 'border-red-500'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status.success ? 
              <Check className="w-5 h-5 text-green-500" /> : 
              <X className="w-5 h-5 text-red-500" />
            }
            {title}
          </CardTitle>
          <CardDescription>
            Tested at {new Date(status.time).toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-auto max-h-40 text-xs">
            {JSON.stringify(status.data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Server className="mr-2 h-6 w-6" />
          <h1 className="text-3xl font-bold">System Diagnostics</h1>
        </div>
        
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Diagnostic Tool</AlertTitle>
          <AlertDescription>
            This page tests critical system components to help diagnose issues.
          </AlertDescription>
        </Alert>
        
        <div className="mb-6">
          <Button 
            onClick={runTests}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Running Tests...' : 'Run System Tests'}
          </Button>
        </div>
        
        <div>
          {renderStatus(connectionStatus, 'Database Connection')}
          {renderStatus(countStatus, 'Inventory Count API')}
          {renderStatus(filterStatus, 'Filter Options API')}
          {renderStatus(inventoryStatus, 'Inventory Data API')}
        </div>
      </div>
    </div>
  );
} 