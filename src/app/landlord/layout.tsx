import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function LandlordLayout({ children }: LayoutProps<"/landlord">) {
  return <DashboardShell role="LANDLORD">{children}</DashboardShell>
}
