"use client"

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative overflow-hidden"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun 
        className={`h-5 w-5 transition-all duration-500 ${theme === 'light' 
          ? 'rotate-0 scale-100' 
          : '-rotate-90 scale-0'}`}
      />
      <Moon 
        className={`absolute h-5 w-5 transition-all duration-500 ${theme === 'dark' 
          ? 'rotate-0 scale-100' 
          : 'rotate-90 scale-0'}`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
