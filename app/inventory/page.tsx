import { InventoryManagement } from "./components";
import { ThemeProvider } from "./components/ui/theme-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function InventoryPage() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="admin-theme">
      <div className="h-screen w-full flex flex-col bg-primaryBlue-50 overflow-auto">
        {/* Navbar */}
        <nav className="sticky top-0 z-10 bg-white shadow-sm py-2 border-b border-primaryBlue-200">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center">
              <Button asChild variant="ghost" className="mr-2 text-primaryBlue-600 hover:text-primaryBlue-700">
                <Link href="/dashboard">
                  <ArrowLeft className="h-5 w-5 mr-1" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" className="text-primaryBlue-600 hover:text-primaryBlue-700">
                <Link href="/">Home</Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow overflow-auto">
          <InventoryManagement />
        </main>
      </div>
    </ThemeProvider>
  );
}
