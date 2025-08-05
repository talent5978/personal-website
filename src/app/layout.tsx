import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/components/LanguageProvider'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Personal Website',
  description: 'A full-stack personal website with games and forum',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <Navigation />
          <main>
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  )
}
