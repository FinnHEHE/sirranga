import type { Metadata } from 'next'
import { Fredoka } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-fredoka',
})

export const metadata: Metadata = {
  title: "Finn's (SirRangas) Official Website",
  description: "Finn's personal website - Apps, Downloads, Friends & more",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${fredoka.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
