import { CompassIcon } from "lucide-react"
import Link from "next/link"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col px-4 py-6 sm:px-8">
      <Logo />
      <main className="flex flex-1 items-center justify-center">
        <div className="max-w-md space-y-4 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <CompassIcon className="size-6" aria-hidden />
          </span>
          <p className="text-sm font-medium text-muted-foreground">404</p>
          <h1 className="text-2xl font-semibold">We couldn&apos;t find that page</h1>
          <p className="text-muted-foreground">
            The link may be broken, or the page may have moved.
          </p>
          <div className="flex justify-center gap-2">
            <Button asChild>
              <Link href="/">Go home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/properties">Browse homes</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
