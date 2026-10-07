import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Suspense } from "react"

import { AppProviders } from "@/components/providers/app-providers"
import { SessionBootstrap } from "@/components/providers/session-bootstrap"
import { env } from "@/config/env"
import { siteConfig } from "@/config/site"

import "./globals.css"

const fontSans = Geist({ variable: "--font-sans", subsets: ["latin"] })
const fontMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfdfd" },
    { media: "(prefers-color-scheme: dark)", color: "#14181d" },
  ],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppProviders>
          {children}
          <Suspense fallback={null}>
            <SessionBootstrap />
          </Suspense>
        </AppProviders>
      </body>
    </html>
  )
}
