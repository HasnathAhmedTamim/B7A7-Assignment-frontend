import type { Metadata } from "next"

import { siteConfig } from "@/config/site"

/** Title, description, canonical URL and Open Graph/Twitter tags for a public page. */
export function publicMetadata({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}): Metadata {
  const fullTitle = `${title} · ${siteConfig.name}`
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      url: path,
    },
    twitter: { card: "summary", title: fullTitle, description },
  }
}
