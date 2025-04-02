import { useState, useEffect } from 'react'
import { supabase } from '@/backend/supabase'
import Head from 'next/head'

export default function TestPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])
  const [states, setStates] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [departmentTypes, setDepartmentTypes] = useState<string[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch a few records
        const { data: items, error: itemsError } = await supabase
          .from('inventory')
          .select('*')
          .limit(5)

        if (itemsError) {
          throw new Error(`Failed to fetch inventory items: ${itemsError.message}`)
        }

        setData(items || [])

        // Fetch unique states
        const { data: statesData, error: statesError } = await supabase
          .from('inventory')
          .select('state')

        if (statesError) {
          throw new Error(`Failed to fetch states: ${statesError.message}`)
        }

        if (statesData && statesData.length > 0) {
          const uniqueStates = [...new Set(statesData.map(item => item.state))].filter(Boolean).sort()
          setStates(uniqueStates)
        }

        // Fetch unique districts
        const { data: districtsData, error: districtsError } = await supabase
          .from('inventory')
          .select('district')

        if (districtsError) {
          throw new Error(`Failed to fetch districts: ${districtsError.message}`)
        }

        if (districtsData && districtsData.length > 0) {
          const uniqueDistricts = [...new Set(districtsData.map(item => item.district))].filter(Boolean).sort()
          setDistricts(uniqueDistricts)
        }

        // Fetch unique department types
        const { data: deptTypesData, error: deptTypesError } = await supabase
          .from('inventory')
          .select('department_type')

        if (deptTypesError) {
          throw new Error(`Failed to fetch department types: ${deptTypesError.message}`)
        }

        if (deptTypesData && deptTypesData.length > 0) {
          const uniqueDeptTypes = [...new Set(deptTypesData.map(item => item.department_type))].filter(Boolean).sort()
          setDepartmentTypes(uniqueDeptTypes)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <>
      <Head>
        <title>Supabase Data Test</title>
        <meta name="description" content="Testing Supabase data retrieval" />
      </Head>

      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Supabase Data Test</h1>

        {loading ? (
          <div className="animate-pulse">Loading data...</div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sample data */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Sample Inventory Items</h2>
              {data.length > 0 ? (
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                  {JSON.stringify(data, null, 2)}
                </pre>
              ) : (
                <p className="text-red-600">No inventory items found!</p>
              )}
            </div>

            {/* States */}
            <div>
              <h2 className="text-xl font-semibold mb-2">States ({states.length})</h2>
              {states.length > 0 ? (
                <div className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
                  <ul className="list-disc list-inside">
                    {states.slice(0, 20).map((state, index) => (
                      <li key={index}>{state}</li>
                    ))}
                    {states.length > 20 && <li>...and {states.length - 20} more</li>}
                  </ul>
                </div>
              ) : (
                <p className="text-red-600">No states found!</p>
              )}
            </div>

            {/* Districts */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Districts ({districts.length})</h2>
              {districts.length > 0 ? (
                <div className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
                  <ul className="list-disc list-inside">
                    {districts.slice(0, 20).map((district, index) => (
                      <li key={index}>{district}</li>
                    ))}
                    {districts.length > 20 && <li>...and {districts.length - 20} more</li>}
                  </ul>
                </div>
              ) : (
                <p className="text-red-600">No districts found!</p>
              )}
            </div>

            {/* Department Types */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Department Types ({departmentTypes.length})</h2>
              {departmentTypes.length > 0 ? (
                <div className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
                  <ul className="list-disc list-inside">
                    {departmentTypes.map((dept, index) => (
                      <li key={index}>{dept}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-red-600">No department types found!</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 text-sm text-gray-500">
          <p>Environment: {typeof window === 'undefined' ? 'Server' : 'Browser'}</p>
          <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Defined' : 'Undefined'}</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Defined' : 'Undefined'}</p>
        </div>
      </div>
    </>
  )
} 