'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import * as echarts from 'echarts';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, CloudSun, Box, BarChart3, Sliders, MapPin, Phone, Mail, Twitter, Facebook, Linkedin, Instagram, Brain } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
    // Initialize chart
    const chartDom = document.getElementById('activity-chart');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Emergency Calls', 'Resource Deployment', 'Evacuations']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Emergency Calls',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: [120, 132, 101, 134, 90, 230, 210],
            color: '#4caf50'
          },
          {
            name: 'Resource Deployment',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: [220, 182, 191, 234, 290, 330, 310],
            color: '#2196f3'
          },
          {
            name: 'Evacuations',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: [150, 232, 201, 154, 190, 330, 410],
            color: '#ff9800'
          }
        ]
      };
      myChart.setOption(option);
      window.addEventListener('resize', () => {
        myChart.resize();
      });
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background border-b border-border/40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="text-primary h-6 w-6" />
            <span className="text-foreground font-bold text-xl">Disaster Management</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-foreground/80 hover:text-primary transition-colors cursor-pointer whitespace-nowrap">Home</Link>
            <Link href="/weather" className="text-foreground/80 hover:text-primary transition-colors cursor-pointer whitespace-nowrap">Weather</Link>
            <Link href="/inventory" className="text-foreground/80 hover:text-primary transition-colors cursor-pointer whitespace-nowrap">Resources</Link>
            <Link href="/dashboard" className="text-foreground/80 hover:text-primary transition-colors cursor-pointer whitespace-nowrap">Dashboard</Link>
            <Link href="/ai-analysis" className="text-foreground/80 hover:text-primary transition-colors cursor-pointer whitespace-nowrap">AI Analysis</Link>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="outline" className="ml-2">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://public.readdy.ai/ai/img_res/39d84f28cfd15a8704c5a6b1caf7c787.jpg')`,
            opacity: 0.8
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#2B3B1B]/90 to-transparent z-10"></div>
        <div className="relative z-20 max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl">
            <h1
              className={`text-5xl font-bold text-white mb-6 transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            >
              Administrator Portal for Disaster Management
            </h1>
            <p
              className={`text-xl text-white/90 mb-8 transition-opacity duration-1000 delay-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            >
              Manage inventory, monitor weather forecasts, and configure system settings efficiently for effective disaster response and recovery.
            </p>
            <div className={`transition-opacity duration-1000 delay-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
              <Link href="/dashboard" passHref>
                <Button className="bg-white text-[#2B3B1B] hover:bg-white/90 !rounded-button whitespace-nowrap cursor-pointer mr-4">
                  Open Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Key Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#2B3B1B] mb-4">Key Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides powerful tools for effective disaster management,
              from inventory tracking to real-time weather monitoring.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {/* Card 1 */}
            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Box className="text-green-600 h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-[#2B3B1B]">Inventory Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Track and manage relief supplies across regions with real-time updates and alerts.
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Link href="/inventory" passHref style={{ width: '100%' }}>
                  <Button variant="outline" className="border-[#2B3B1B] text-[#2B3B1B] hover:bg-[#2B3B1B] hover:text-white transition-colors !rounded-button whitespace-nowrap w-full cursor-pointer">
                    Manage Inventory
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            {/* Card 2 */}
            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <CloudSun className="text-blue-600 h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-[#2B3B1B]">Weather Forecasting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Access comprehensive weather data for planning and early response to potential disasters.
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Link href="/weather" passHref style={{ width: '100%' }}>
                  <Button variant="outline" className="border-[#2B3B1B] text-[#2B3B1B] hover:bg-[#2B3B1B] hover:text-white transition-colors !rounded-button whitespace-nowrap w-full cursor-pointer">
                    View Forecasts
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            {/* Card 3 */}
            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="text-purple-600 h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-[#2B3B1B]">Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  View all disaster management activities and critical statistics in one place.
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard" passHref style={{ width: '100%' }}>
                  <Button variant="outline" className="border-[#2B3B1B] text-[#2B3B1B] hover:bg-[#2B3B1B] hover:text-white transition-colors !rounded-button whitespace-nowrap w-full cursor-pointer">
                    Open Dashboard
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            {/* Card 4 */}
            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Sliders className="text-amber-600 h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-[#2B3B1B]">System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Customize the system to meet specific regional requirements and preferences.
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Link href="/settings" passHref style={{ width: '100%' }}>
                  <Button variant="outline" className="border-[#2B3B1B] text-[#2B3B1B] hover:bg-[#2B3B1B] hover:text-white transition-colors !rounded-button whitespace-nowrap w-full cursor-pointer">
                    Configure Settings
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            {/* Card 5 - AI Disaster Analysis */}
            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Brain className="text-indigo-600 h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-[#2B3B1B]">AI Disaster Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Leverage AI to analyze disaster data, predict resource needs, and optimize emergency response plans.
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Link href="/ai-analysis" passHref style={{ width: '100%' }}>
                  <Button variant="outline" className="border-[#2B3B1B] text-[#2B3B1B] hover:bg-[#2B3B1B] hover:text-white transition-colors !rounded-button whitespace-nowrap w-full cursor-pointer">
                    View AI Insights
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      {/* Activity Chart Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#2B3B1B] mb-4">Activity Overview</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Monitor emergency response activities and resource allocation across regions.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div id="activity-chart" className="w-full h-[400px]"></div>
          </div>
        </div>
      </div>
      {/* Call to Action */}
      <div className="py-20 bg-gradient-to-r from-[#2B3B1B] to-[#3C4F2A]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to get started?</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Join our network of disaster management professionals and gain access to powerful tools for effective response and recovery.
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button className="bg-white text-[#2B3B1B] hover:bg-white/90 !rounded-button whitespace-nowrap cursor-pointer">
              Get Started
            </Button>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-background border-t border-border/40 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="text-foreground h-6 w-6" />
                <span className="text-foreground font-bold text-xl">Disaster Management</span>
              </div>
              <p className="text-gray-600 mb-4">
                Providing advanced tools for effective disaster management and response.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-[#2B3B1B] transition-colors cursor-pointer">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-[#2B3B1B] transition-colors cursor-pointer">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-[#2B3B1B] transition-colors cursor-pointer">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-[#2B3B1B] transition-colors cursor-pointer">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Features</h3>
              <ul className="space-y-2">
                <li><Link href="/inventory" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Inventory Management</Link></li>
                <li><Link href="/weather" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Weather Forecasting</Link></li>
                <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Dashboard</Link></li>
                <li><Link href="/settings" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">System Settings</Link></li>
                <li><Link href="/ai-analysis" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">AI Disaster Analysis</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Resource Allocation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">API Reference</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Training Videos</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Case Studies</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Support Center</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <MapPin className="text-primary h-4 w-4 mt-1 mr-2" />
                  <span className="text-muted-foreground">123 Emergency Lane, Crisis City, CA 90210</span>
                </li>
                <li className="flex items-start">
                  <Phone className="text-primary h-4 w-4 mt-1 mr-2" />
                  <span className="text-muted-foreground">+1 (555) 911-HELP</span>
                </li>
                <li className="flex items-start">
                  <Mail className="text-primary h-4 w-4 mt-1 mr-2" />
                  <span className="text-muted-foreground">support@disastermanagement.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground mb-4 md:mb-0">© {new Date().getFullYear()} Disaster Management. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Terms of Service</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
      {/* Icons are now handled by Lucide React */}
    </div>
  );
}

