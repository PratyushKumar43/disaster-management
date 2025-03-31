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

// Types
interface Department {
  id: string
  name: string
  type: string
  address: string
  contactPerson: string
  contactNumber: string
  contactEmail: string
  districtId: string
}

interface District {
  id: string
  name: string
  stateId: string
}

interface State {
  id: string
  name: string
}

interface InventoryItem {
  id: string
  itemCode: string
  itemName: string
  quantity: number
  source: string
  departmentId: string
  departmentName: string
  districtId: string
  districtName: string
  stateId: string
  stateName: string
}

// Mock data
const mockStates: State[] = [
  { id: "s1", name: "Maharashtra" },
  { id: "s2", name: "Karnataka" },
  { id: "s3", name: "Tamil Nadu" },
  { id: "s4", name: "Gujarat" },
]

const mockDistricts: District[] = [
  { id: "d1", name: "Mumbai", stateId: "s1" },
  { id: "d2", name: "Pune", stateId: "s1" },
  { id: "d3", name: "Bangalore", stateId: "s2" },
  { id: "d4", name: "Mysore", stateId: "s2" },
  { id: "d5", name: "Chennai", stateId: "s3" },
  { id: "d6", name: "Coimbatore", stateId: "s3" },
  { id: "d7", name: "Ahmedabad", stateId: "s4" },
  { id: "d8", name: "Surat", stateId: "s4" },
]

const mockDepartments: Department[] = [
  {
    id: "dep1",
    name: "Health Department",
    type: "Government",
    address: "123 Health St, Mumbai",
    contactPerson: "Dr. Sharma",
    contactNumber: "9876543210",
    contactEmail: "health@mumbai.gov.in",
    districtId: "d1",
  },
  {
    id: "dep2",
    name: "Education Department",
    type: "Government",
    address: "456 Education Rd, Mumbai",
    contactPerson: "Mr. Patil",
    contactNumber: "9876543211",
    contactEmail: "education@mumbai.gov.in",
    districtId: "d1",
  },
  {
    id: "dep3",
    name: "Health Department",
    type: "Government",
    address: "789 Health Ave, Pune",
    contactPerson: "Dr. Joshi",
    contactNumber: "9876543212",
    contactEmail: "health@pune.gov.in",
    districtId: "d2",
  },
  {
    id: "dep4",
    name: "IT Department",
    type: "Corporate",
    address: "101 Tech Park, Bangalore",
    contactPerson: "Ms. Reddy",
    contactNumber: "9876543213",
    contactEmail: "it@bangalore.gov.in",
    districtId: "d3",
  },
  {
    id: "dep5",
    name: "Agriculture Department",
    type: "Government",
    address: "202 Farm Rd, Mysore",
    contactPerson: "Mr. Kumar",
    contactNumber: "9876543214",
    contactEmail: "agri@mysore.gov.in",
    districtId: "d4",
  },
]

const mockInventoryItems: InventoryItem[] = [
  {
    id: "i1",
    itemCode: "MED001",
    itemName: "Paracetamol",
    quantity: 5,
    source: "Central Supply",
    departmentId: "dep1",
    departmentName: "Health Department",
    districtId: "d1",
    districtName: "Mumbai",
    stateId: "s1",
    stateName: "Maharashtra",
  },
  {
    id: "i2",
    itemCode: "MED002",
    itemName: "Antibiotics",
    quantity: 15,
    source: "State Supply",
    departmentId: "dep1",
    departmentName: "Health Department",
    districtId: "d1",
    districtName: "Mumbai",
    stateId: "s1",
    stateName: "Maharashtra",
  },
  {
    id: "i3",
    itemCode: "EDU001",
    itemName: "Textbooks",
    quantity: 100,
    source: "State Supply",
    departmentId: "dep2",
    departmentName: "Education Department",
    districtId: "d1",
    districtName: "Mumbai",
    stateId: "s1",
    stateName: "Maharashtra",
  },
  {
    id: "i4",
    itemCode: "MED003",
    itemName: "Surgical Masks",
    quantity: 8,
    source: "Local Purchase",
    departmentId: "dep3",
    departmentName: "Health Department",
    districtId: "d2",
    districtName: "Pune",
    stateId: "s1",
    stateName: "Maharashtra",
  },
  {
    id: "i5",
    itemCode: "IT001",
    itemName: "Laptops",
    quantity: 25,
    source: "Central Supply",
    departmentId: "dep4",
    departmentName: "IT Department",
    districtId: "d3",
    districtName: "Bangalore",
    stateId: "s2",
    stateName: "Karnataka",
  },
  {
    id: "i6",
    itemCode: "AGR001",
    itemName: "Fertilizers",
    quantity: 50,
    source: "State Supply",
    departmentId: "dep5",
    departmentName: "Agriculture Department",
    districtId: "d4",
    districtName: "Mysore",
    stateId: "s2",
    stateName: "Karnataka",
  },
]

export default function InventoryManagement() {
  const { toast } = useToast()
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockInventoryItems)
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>(mockInventoryItems)

  // Filter states
  const [selectedState, setSelectedState] = useState<string>("")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")

  // Available options based on filters
  const [availableDistricts, setAvailableDistricts] = useState<District[]>(mockDistricts)
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>(mockDepartments)

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null)

  // Form states
  const [newItem, setNewItem] = useState({
    itemCode: "",
    itemName: "",
    quantity: 0,
    source: "",
    stateId: "",
    districtId: "",
    departmentId: "",
  })

  // Loading state
  const [isLoading, setIsLoading] = useState(false)

  // Update available districts when state changes
  useEffect(() => {
    if (selectedState) {
      setAvailableDistricts(mockDistricts.filter((district) => district.stateId === selectedState))
    } else {
      setAvailableDistricts(mockDistricts)
    }
    setSelectedDistrict("")
    setSelectedDepartment("")
  }, [selectedState])

  // Update available departments when district changes
  useEffect(() => {
    if (selectedDistrict) {
      setAvailableDepartments(mockDepartments.filter((department) => department.districtId === selectedDistrict))
    } else if (selectedState) {
      const districtIds = mockDistricts
        .filter((district) => district.stateId === selectedState)
        .map((district) => district.id)
      setAvailableDepartments(mockDepartments.filter((department) => districtIds.includes(department.districtId)))
    } else {
      setAvailableDepartments(mockDepartments)
    }
    setSelectedDepartment("")
  }, [selectedDistrict, selectedState])

  // Filter items based on selected filters
  useEffect(() => {
    let filtered = [...inventoryItems]

    if (selectedState) {
      filtered = filtered.filter((item) => item.stateId === selectedState)
    }

    if (selectedDistrict) {
      filtered = filtered.filter((item) => item.districtId === selectedDistrict)
    }

    if (selectedDepartment) {
      filtered = filtered.filter((item) => item.departmentId === selectedDepartment)
    }

    setFilteredItems(filtered)
  }, [inventoryItems, selectedState, selectedDistrict, selectedDepartment])

  // Update form state when state changes in the form
  useEffect(() => {
    if (newItem.stateId) {
      setNewItem((prev) => ({ ...prev, districtId: "", departmentId: "" }))
    }
  }, [newItem.stateId])

  // Update form state when district changes in the form
  useEffect(() => {
    if (newItem.districtId) {
      setNewItem((prev) => ({ ...prev, departmentId: "" }))
    }
  }, [newItem.districtId])

  // Handle adding a new item
  const handleAddItem = () => {
    setIsLoading(true)

    // Validate form
    if (!newItem.stateId || !newItem.districtId || !newItem.departmentId || !newItem.itemCode || !newItem.itemName) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Get names for the IDs
    const state = mockStates.find((s) => s.id === newItem.stateId)
    const district = mockDistricts.find((d) => d.id === newItem.districtId)
    const department = mockDepartments.find((d) => d.id === newItem.departmentId)

    if (!state || !district || !department) {
      toast({
        title: "Error",
        description: "Invalid selection",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Create new item
    const newInventoryItem: InventoryItem = {
      id: `i${inventoryItems.length + 1}`,
      itemCode: newItem.itemCode,
      itemName: newItem.itemName,
      quantity: newItem.quantity,
      source: newItem.source,
      departmentId: newItem.departmentId,
      departmentName: department.name,
      districtId: newItem.districtId,
      districtName: district.name,
      stateId: newItem.stateId,
      stateName: state.name,
    }

    // Simulate API call
    setTimeout(() => {
      setInventoryItems((prev) => [...prev, newInventoryItem])
      setAddModalOpen(false)
      setNewItem({
        itemCode: "",
        itemName: "",
        quantity: 0,
        source: "",
        stateId: "",
        districtId: "",
        departmentId: "",
      })
      setIsLoading(false)
      toast({
        title: "Success",
        description: "Item added successfully",
      })
    }, 1000)
  }

  // Handle deleting an item
  const handleDeleteItem = () => {
    if (!itemToDelete) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setInventoryItems((prev) => prev.filter((item) => item.id !== itemToDelete.id))
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      setIsLoading(false)
      toast({
        title: "Success",
        description: "Item deleted successfully",
      })
    }, 1000)
  }

  // Get department details
  const getDepartmentDetails = (departmentId: string) => {
    return mockDepartments.find((dep) => dep.id === departmentId)
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedState("")
    setSelectedDistrict("")
    setSelectedDepartment("")
  }

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
              className="mt-2 w-full bg-lime-200 dark:bg-zinc-700 hover:bg-lime-300 dark:hover:bg-zinc-600 text-lime-900 dark:text-white border-lime-400 dark:border-zinc-600"
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
                      {mockStates.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
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
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
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
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
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
                    <TableHead className="text-lime-900 dark:text-white">Source</TableHead>
                    <TableHead className="text-lime-900 dark:text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const department = getDepartmentDetails(item.departmentId)

                      return (
                        <TableRow
                          key={item.id}
                          className="group hover:bg-lime-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <TableCell className="text-lime-900 dark:text-white">{item.stateName}</TableCell>
                          <TableCell className="text-lime-900 dark:text-white">{item.districtName}</TableCell>
                          <TableCell>
                            {department ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help flex items-center gap-1 underline decoration-dotted text-lime-900 dark:text-white">
                                      {item.departmentName}
                                      <Info className="h-4 w-4 text-lime-600 dark:text-lime-400" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="w-80 p-4 bg-white dark:bg-zinc-900 border-lime-200 dark:border-zinc-700">
                                    <div className="space-y-2">
                                      <h4 className="font-semibold text-lime-900 dark:text-white">{department.name}</h4>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="text-lime-700 dark:text-lime-400">Type:</div>
                                        <div className="text-lime-900 dark:text-white">{department.type}</div>
                                        <div className="text-lime-700 dark:text-lime-400">Address:</div>
                                        <div className="text-lime-900 dark:text-white">{department.address}</div>
                                        <div className="text-lime-700 dark:text-lime-400">Contact Person:</div>
                                        <div className="text-lime-900 dark:text-white">{department.contactPerson}</div>
                                        <div className="text-lime-700 dark:text-lime-400">Contact Number:</div>
                                        <div className="text-lime-900 dark:text-white">{department.contactNumber}</div>
                                        <div className="text-lime-700 dark:text-lime-400">Contact Email:</div>
                                        <div className="text-lime-900 dark:text-white">{department.contactEmail}</div>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-lime-900 dark:text-white">{item.departmentName}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-lime-900 dark:text-white">{item.itemCode}</TableCell>
                          <TableCell className="text-lime-900 dark:text-white">{item.itemName}</TableCell>
                          <TableCell>
                            {item.quantity < 10 ? (
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
                            )}
                          </TableCell>
                          <TableCell className="text-lime-900 dark:text-white">{item.source}</TableCell>
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
                      )
                    })
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
                <Select value={newItem.stateId} onValueChange={(value) => setNewItem({ ...newItem, stateId: value })}>
                  <SelectTrigger id="state" className="bg-white dark:bg-zinc-800 border-lime-200 dark:border-zinc-700">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStates.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district" className="text-lime-900 dark:text-white">
                  District *
                </Label>
                <Select
                  value={newItem.districtId}
                  onValueChange={(value) => setNewItem({ ...newItem, districtId: value })}
                  disabled={!newItem.stateId}
                >
                  <SelectTrigger
                    id="district"
                    className="bg-white dark:bg-zinc-800 border-lime-200 dark:border-zinc-700"
                  >
                    <SelectValue placeholder={newItem.stateId ? "Select District" : "Select State first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDistricts
                      .filter((district) => district.stateId === newItem.stateId)
                      .map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-lime-900 dark:text-white">
                  Department *
                </Label>
                <Select
                  value={newItem.departmentId}
                  onValueChange={(value) => setNewItem({ ...newItem, departmentId: value })}
                  disabled={!newItem.districtId}
                >
                  <SelectTrigger
                    id="department"
                    className="bg-white dark:bg-zinc-800 border-lime-200 dark:border-zinc-700"
                  >
                    <SelectValue placeholder={newItem.districtId ? "Select Department" : "Select District first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDepartments
                      .filter((department) => department.districtId === newItem.districtId)
                      .map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemCode" className="text-lime-900 dark:text-white">
                  Item Code *
                </Label>
                <Input
                  id="itemCode"
                  value={newItem.itemCode}
                  onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })}
                  placeholder="e.g. MED001"
                  className="bg-white dark:bg-zinc-800 border-lime-200 dark:border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemName" className="text-lime-900 dark:text-white">
                  Item Name *
                </Label>
                <Input
                  id="itemName"
                  value={newItem.itemName}
                  onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
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

              <div className="space-y-2">
                <Label htmlFor="source" className="text-lime-900 dark:text-white">
                  Source
                </Label>
                <Input
                  id="source"
                  value={newItem.source}
                  onChange={(e) => setNewItem({ ...newItem, source: e.target.value })}
                  placeholder="e.g. Central Supply"
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
                  Are you sure you want to delete this item from {itemToDelete.departmentName}?
                  <div className="mt-2 p-2 border rounded bg-lime-50 dark:bg-zinc-800 border-lime-200 dark:border-zinc-700">
                    <p className="text-lime-900 dark:text-white">
                      <strong>Item:</strong> {itemToDelete.itemName}
                    </p>
                    <p className="text-lime-900 dark:text-white">
                      <strong>Code:</strong> {itemToDelete.itemCode}
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

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}

