import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vacai',
  description: 'Document your vacations with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='bg-gray-50 text dark:bg-gray-900 font-medium text-gray-900 dark:text-white'>
      <body>{children}</body>
    </html>
  )
}
