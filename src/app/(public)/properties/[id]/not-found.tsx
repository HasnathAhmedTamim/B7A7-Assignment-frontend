import { HomeIcon } from "lucide-react"
import Link from "next/link"

import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export default function PropertyNotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-20">
      <EmptyState
        icon={HomeIcon}
        title="This home isn't available"
        description="It may have been rented out, unpublished or removed by the landlord."
        action={
          <Button asChild>
            <Link href="/properties">Browse other homes</Link>
          </Button>
        }
      />
    </div>
  )
}
