import InventoryManagement from "@/components/inventory-management"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="inventory-theme">
      <main className="min-h-screen">
        <InventoryManagement />
      </main>
    </ThemeProvider>
  )
}

