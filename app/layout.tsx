import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Whipbook',
  description: 'Interactive audiobook player with word-level synchronization',
  keywords: ['audiobook', 'reading', 'literature', 'interactive'],
  authors: [{ name: 'Whipbook Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}