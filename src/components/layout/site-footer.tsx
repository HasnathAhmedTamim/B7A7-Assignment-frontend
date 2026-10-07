import Link from "next/link"

import { LogoMark } from "@/components/shared/logo"
import { siteConfig } from "@/config/site"

const columns = [
  {
    title: "Renters",
    links: [
      { title: "Browse homes", href: "/properties" },
      { title: "How it works", href: "/how-it-works" },
      { title: "Create an account", href: "/register" },
    ],
  },
  {
    title: "Landlords",
    links: [
      { title: "List a property", href: "/register" },
      { title: "Landlord dashboard", href: "/landlord" },
      { title: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "About", href: "/about" },
      { title: "Contact", href: "/contact" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t bg-sidebar">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <LogoMark />
            {siteConfig.name}
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">{siteConfig.description}</p>
        </div>
        {columns.map((column) => (
          <div key={column.title} className="space-y-3">
            <h2 className="text-sm font-medium">{column.title}</h2>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <p className="mx-auto w-full max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          Rents are listed in Bangladeshi Taka (BDT). Card payments are processed securely by
          Stripe.
        </p>
      </div>
    </footer>
  )
}
