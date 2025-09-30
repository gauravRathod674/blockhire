import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
// Correctly import the AuthProvider
import { AuthProvider } from "../contexts/AuthContext"
import "./globals.css"

export const metadata: Metadata = {
  title: "BlockHire - Blockchain Employee Verification",
  description: "Tamper-proof employee background verification using blockchain technology",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* AuthProvider now correctly wraps the entire application */}
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
