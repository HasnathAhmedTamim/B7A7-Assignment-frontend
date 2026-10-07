import { ShieldAlertIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { roleHome } from "@/config/routes"
import { getSession } from "@/lib/auth/get-session"
import { roleLabel } from "@/lib/labels"

export const metadata: Metadata = { title: "Access denied", robots: { index: false } }

async function HomeAction() {
  const session = await getSession()
  if (!session) {
    return (
      <Button asChild>
        <Link href="/login">Sign in</Link>
      </Button>
    )
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        You&apos;re signed in as {session.name} ({roleLabel[session.role]}).
      </p>
      <Button asChild>
        <Link href={roleHome[session.role]}>Go to my dashboard</Link>
      </Button>
    </div>
  )
}

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-svh flex-col px-4 py-6 sm:px-8">
      <Logo />
      <main className="flex flex-1 items-center justify-center">
        <div className="max-w-md space-y-4 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-warning/15 text-warning-foreground dark:text-warning">
            <ShieldAlertIcon className="size-6" aria-hidden />
          </span>
          <h1 className="text-2xl font-semibold">This area isn&apos;t available to your account</h1>
          <p className="text-muted-foreground">
            Each role has its own workspace. Tenants, landlords and admins see different tools.
          </p>
          <Suspense fallback={<Skeleton className="mx-auto h-9 w-40" />}>
            <HomeAction />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
