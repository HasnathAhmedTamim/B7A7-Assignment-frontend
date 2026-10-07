import type { Metadata } from "next"

import { TenantOverview } from "@/components/tenant/tenant-overview"

export const metadata: Metadata = { title: "Overview" }

export default function TenantOverviewPage() {
  return <TenantOverview />
}
