"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle, DatabaseIcon, RefreshCw } from 'lucide-react'
import { supabase } from '@/backend/supabase'

export function SupabaseCheck() {
  const [loading, setLoading] = useState(true)
  const [apiTestLoading, setApiTestLoading] = useState(false)
  const [inventoryTestLoading, setInventoryTestLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [directQueryResponse, setDirectQueryResponse] = useState<any>(null)
  const [tablesInfo, setTablesInfo] = useState<any>(null)

  // Check environment variables 
  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? true : false,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? true : false
  }

  // Function to test API connection
  const testApiEndpoint = async () => {
    setApiTestLoading(true)
    setApiResponse(null)
    
    try {
      // First try the health check endpoint
      const healthResponse = await fetch('/api/health-check')
      const healthData = await healthResponse.json()
      
      // Then try the DB test endpoint
      const dbResponse = await fetch('/api/db-test')
      const dbData = await dbResponse.json()
      
      setApiResponse({
        health: healthData,
        dbTest: dbData
      })
    } catch (err) {
      console.error('API test error:', err)
      setApiResponse({
        error: err instanceof Error ? err.message : 'Failed to connect to API'
      })
    } finally {
      setApiTestLoading(false)
    }
  }

  // Function to test direct Supabase connection from client
  const testDirectConnection = async () => {
    setInventoryTestLoading(true)
    setDirectQueryResponse(null)
    
    try {
      // Try to get one record from inventory table
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .limit(1)
      
      if (error) {
        throw error
      }
      
      setDirectQueryResponse({
        success: true,
        data,
        count: data?.length || 0
      })
    } catch (err) {
      console.error('Direct query error:', err)
      setDirectQueryResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    } finally {
      setInventoryTestLoading(false)
    }
  }

  // Function to list tables in database
  const listTables = async () => {
    setLoading(true)
    setTablesInfo(null)
    
    try {
      // First try to get tables via RPC
      let tablesResult = null
      let tablesError = null
      
      try {
        const { data, error } = await supabase.rpc('get_tables')
        if (!error) {
          tablesResult = data
        } else {
          tablesError = error
        }
      } catch (e) {
        tablesError = e
      }
      
      // Fallback: Try to query the inventory table directly
      const { data: inventoryCount, error: inventoryError } = await supabase
        .from('inventory')
        .select('*', { count: 'exact', head: true })
        
      setTablesInfo({
        tables: tablesResult,
        tablesError: tablesError ? String(tablesError) : null,
        inventoryCount: inventoryCount ? inventoryCount.length : 0,
        inventoryExists: !inventoryError,
        inventoryError: inventoryError ? inventoryError.message : null
      })
    } catch (err) {
      console.error('Tables check error:', err)
      setTablesInfo({
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Run tests on component mount
  useEffect(() => {
    testApiEndpoint()
    testDirectConnection()
    listTables()
  }, [])

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DatabaseIcon className="mr-2 h-5 w-5" /> 
            Supabase Connection Status
          </CardTitle>
          <CardDescription>
            Diagnostics to check database connectivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Environment Check */}
          <div className="border rounded-md p-4">
            <h3 className="font-semibold mb-2">Environment Variables</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center">
                {envCheck.NEXT_PUBLIC_SUPABASE_URL ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span>NEXT_PUBLIC_SUPABASE_URL</span>
              </div>
              <div className="flex items-center">
                {envCheck.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              </div>
            </div>
          </div>
          
          {/* API Endpoint Test */}
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">API Endpoint Test</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testApiEndpoint} 
                disabled={apiTestLoading}
              >
                {apiTestLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Testing...</>
                ) : (
                  <><RefreshCw className="h-4 w-4 mr-2" /> Retry</>
                )}
              </Button>
            </div>
            
            {apiTestLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Testing API endpoints...</span>
              </div>
            ) : apiResponse ? (
              <div className="space-y-2 text-sm">
                <div>
                  <div className="font-medium">Health Check:</div>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(apiResponse.health, null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="font-medium">Database Test:</div>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(apiResponse.dbTest, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic">No API test results yet</div>
            )}
          </div>
          
          {/* Direct Connection Test */}
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Direct Supabase Query Test</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testDirectConnection} 
                disabled={inventoryTestLoading}
              >
                {inventoryTestLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Testing...</>
                ) : (
                  <><RefreshCw className="h-4 w-4 mr-2" /> Retry</>
                )}
              </Button>
            </div>
            
            {inventoryTestLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Testing direct Supabase connection...</span>
              </div>
            ) : directQueryResponse ? (
              <div className="space-y-2 text-sm">
                <div>
                  <div className="font-medium">Query Result:</div>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(directQueryResponse, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic">No direct query results yet</div>
            )}
          </div>
          
          {/* Tables Info */}
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Database Tables Check</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={listTables} 
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking...</>
                ) : (
                  <><RefreshCw className="h-4 w-4 mr-2" /> Refresh</>
                )}
              </Button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Checking database tables...</span>
              </div>
            ) : tablesInfo ? (
              <div className="space-y-2 text-sm">
                <div className="font-medium">Database Tables:</div>
                <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(tablesInfo, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-gray-500 italic">No tables information yet</div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              testApiEndpoint();
              testDirectConnection();
              listTables();
            }}
          >
            Refresh All Tests
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 