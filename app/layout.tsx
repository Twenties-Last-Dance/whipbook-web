import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Whipbook',
  description: 'Interactive audiobook player with word-level synchronization',
  keywords: ['audiobook', 'reading', 'literature', 'interactive'],
  authors: [{ name: 'Whipbook Team' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: [
      { url: '/whipbook.png', sizes: '32x32', type: 'image/png' },
      { url: '/whipbook.png', sizes: '16x16', type: 'image/png' }
    ],
    shortcut: '/whipbook.png',
    apple: '/whipbook.png',
  },
  manifest: '/manifest.json',
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