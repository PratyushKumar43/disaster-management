import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'

export const metadata: Metadata = {
  title: 'Disaster Management',
  description: 'Disaster Management Application',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
