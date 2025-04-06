'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, ArrowRight, BarChart3, ClipboardList, AlertTriangle, CloudLightning } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { getUniqueStates } from '@/backend/inventory';

export default function AIAnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDisaster, setSelectedDisaster] = useState('');
  const [analysisResult, setAnalysisResult] = useState<null | string>(null);
  const [states, setStates] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [stateError, setStateError] = useState<string | null>(null);

  // Fetch states from Supabase on component mount
  useEffect(() => {
    async function fetchStates() {
      setLoadingStates(true);
      setStateError(null);
      
      try {
        const statesList = await getUniqueStates();
        setStates(statesList || []);
      } catch (error) {
        console.error('Error fetching states:', error);
        setStateError('Failed to load states. Please try again later.');
      } finally {
        setLoadingStates(false);
      }
    }
    
    fetchStates();
  }, []);
  
  // Function to generate AI analysis
  const generateAnalysis = async () => {
    setLoading(true);
    // In a real implementation, this would call the Gemini API
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

    const mockAnalysis = `# Disaster Analysis Report for ${selectedState || 'All States'}
    
## Predicted Impact Areas
- **High Risk Zones**: Northern districts of ${selectedState || 'the selected region'} are at 73% risk level
- **Medium Risk Zones**: Central areas show moderate vulnerability (45% risk)
- **Low Risk Zones**: Southern districts have minimal exposure (12% risk)

## Resource Allocation Recommendations
1. **Emergency Medical Supplies**: Increase by 35% in high risk zones
2. **Temporary Shelters**: Deploy 20 additional units in northern districts
3. **Food & Water**: Pre-position 3-day supplies for estimated 5,000 affected people

## Timeline Projections
- **72 Hours Pre-Event**: Complete evacuation of highest risk areas
- **48 Hours Pre-Event**: Position all emergency response teams
- **24 Hours Pre-Event**: Activate all emergency protocols and communication systems

The AI confidence level for this analysis is 87% based on historical data patterns and current environmental conditions.`;

    setAnalysisResult(mockAnalysis);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background border-b border-border/40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="text-primary h-6 w-6" />
              <span className="text-foreground font-bold text-xl">AI Disaster Analysis</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-foreground/80 hover:text-primary transition-colors cursor-pointer whitespace-nowrap">Home</Link>
            <Link href="/weather" className="text-foreground/80 hover:text-primary transition-colors cursor-pointer whitespace-nowrap">Weather</Link>
            <Link href="/inventory" className="text-foreground/80 hover:text-primary transition-colors cursor-pointer whitespace-nowrap">Resources</Link>
            <Link href="/dashboard" className="text-foreground/80 hover:text-primary transition-colors cursor-pointer whitespace-nowrap">Dashboard</Link>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">AI Disaster Analysis</h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Leverage the power of artificial intelligence to analyze disaster data, predict resource needs, and optimize emergency response plans.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Parameters</CardTitle>
                <CardDescription>Configure your disaster analysis query</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">State/Region</label>
                  <Select value={selectedState} onValueChange={setSelectedState} disabled={loadingStates}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingStates ? "Loading states..." : stateError ? "Error loading states" : "Select state or region"} />
                    </SelectTrigger>
                    <SelectContent>
                      {states.length > 0 ? (
                        states.map((state) => (
                          <SelectItem key={state} value={state.toLowerCase().replace(/\s+/g, '')}>
                            {state}
                          </SelectItem>
                        ))
                      ) : stateError ? (
                        <SelectItem value="error" disabled>{stateError}</SelectItem>
                      ) : loadingStates ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        <SelectItem value="none" disabled>No states available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Disaster Type</label>
                  <Select value={selectedDisaster} onValueChange={setSelectedDisaster}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select disaster type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flood">Flood</SelectItem>
                      <SelectItem value="cyclone">Cyclone</SelectItem>
                      <SelectItem value="earthquake">Earthquake</SelectItem>
                      <SelectItem value="drought">Drought</SelectItem>
                      <SelectItem value="landslide">Landslide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Custom Query</label>
                  <Textarea 
                    placeholder="Enter specific details or questions (optional)"
                    className="min-h-[120px]"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={generateAnalysis}
                  disabled={loading || loadingStates || !!stateError}
                >
                  {loading ? 'Analyzing...' : 
                   loadingStates ? 'Loading states...' : 
                   stateError ? 'Cannot analyze' : 
                   'Generate Analysis'}
                  {!loading && !loadingStates && !stateError && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Types</CardTitle>
                <CardDescription>Available AI analysis capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-md">
                    <BarChart3 className="text-blue-600 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Predictive Impact Analysis</h4>
                    <p className="text-muted-foreground text-sm">Forecast the potential impact of disasters on different regions</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-md">
                    <ClipboardList className="text-green-600 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Resource Optimization</h4>
                    <p className="text-muted-foreground text-sm">Optimize resource allocation based on predicted needs</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-amber-100 p-2 rounded-md">
                    <AlertTriangle className="text-amber-600 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Early Warning System</h4>
                    <p className="text-muted-foreground text-sm">Generate early warnings based on environmental indicators</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-md">
                    <CloudLightning className="text-purple-600 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Weather Pattern Analysis</h4>
                    <p className="text-muted-foreground text-sm">Analyze weather patterns to predict potential disasters</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analysis Results */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>Insights generated by AI based on your parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="results" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="results">Results</TabsTrigger>
                    <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  </TabsList>
                  <TabsContent value="results" className="min-h-[500px]">
                    {analysisResult ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[500px] text-center">
                        <Brain className="text-muted-foreground h-16 w-16 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Analysis Generated Yet</h3>
                        <p className="text-muted-foreground max-w-md">
                          Select your parameters and click "Generate Analysis" to see AI-powered disaster insights.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="visualizations" className="min-h-[500px]">
                    <div className="flex flex-col items-center justify-center h-[500px] text-center">
                      <BarChart3 className="text-muted-foreground h-16 w-16 mb-4 opacity-20" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Visualizations Coming Soon</h3>
                      <p className="text-muted-foreground max-w-md">
                        This feature will display interactive charts and maps based on AI analysis.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="recommendations" className="min-h-[500px]">
                    <div className="flex flex-col items-center justify-center h-[500px] text-center">
                      <ClipboardList className="text-muted-foreground h-16 w-16 mb-4 opacity-20" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Recommendations Coming Soon</h3>
                      <p className="text-muted-foreground max-w-md">
                        This feature will provide detailed action recommendations based on the analysis.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
