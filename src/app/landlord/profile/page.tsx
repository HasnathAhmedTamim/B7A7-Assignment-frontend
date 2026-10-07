import type { Metadata } from "next"

import { ProfileSettings } from "@/components/account/profile-settings"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Profile" }

export default function LandlordProfilePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Profile" description="Your contact details and account information." />
      <ProfileSettings />
    </div>
  )
}
