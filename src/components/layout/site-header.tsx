"use client"

import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense, useState } from "react"

import { Logo } from "@/components/shared/logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { publicNav } from "@/config/nav"
import { cn } from "@/lib/utils"

import { UserMenu } from "./user-menu"

type Variant = "desktop" | "mobile"

const linkStyles: Record<Variant, { base: string; active: string }> = {
  desktop: {
    base: "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
    active: "font-medium text-foreground",
  },
  mobile: {
    base: "rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
    active: "bg-accent text-accent-foreground",
  },
}

function NavLinks({
  variant,
  activeHref,
  onNavigate,
}: {
  variant: Variant
  activeHref?: (href: string) => boolean
  onNavigate?: () => void
}) {
  const styles = linkStyles[variant]
  return publicNav.map((item) => {
    const active = activeHref?.(item.href) ?? false
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(styles.base, active && styles.active)}
      >
        {item.title}
      </Link>
    )
  })
}

function ActiveNavLinks(props: { variant: Variant; onNavigate?: () => void }) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  return <NavLinks {...props} activeHref={isActive} />
}

function MainNav(props: { variant: Variant; onNavigate?: () => void }) {
  return (
    <Suspense fallback={<NavLinks {...props} />}>
      <ActiveNavLinks {...props} />
    </Suspense>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Logo />
            </SheetHeader>
            <nav aria-label="Main" className="flex flex-col gap-1 px-4">
              <MainNav variant="mobile" onNavigate={() => setOpen(false)} />
            </nav>
          </SheetContent>
        </Sheet>

        <Logo />

        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 md:flex">
          <MainNav variant="desktop" />
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
