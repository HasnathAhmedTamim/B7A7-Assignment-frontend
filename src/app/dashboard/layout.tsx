import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function TenantLayout({ children }: LayoutProps<"/dashboard">) {
  return <DashboardShell role="TENANT">{children}</DashboardShell>
}
