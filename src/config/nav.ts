import {
  BarChart3Icon,
  BuildingIcon,
  CalendarCheckIcon,
  ClipboardListIcon,
  CreditCardIcon,
  HistoryIcon,
  InboxIcon,
  LayoutDashboardIcon,
  SearchIcon,
  UserCogIcon,
  UsersIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react"

import type { Role } from "@/types/models"

export type NavItem = { title: string; href: string; icon: LucideIcon; exact?: boolean }
export type NavSection = { title?: string; items: NavItem[] }

export const publicNav = [
  { title: "Browse homes", href: "/properties" },
  { title: "How it works", href: "/how-it-works" },
  { title: "About", href: "/about" },
  { title: "FAQ", href: "/faq" },
  { title: "Contact", href: "/contact" },
] as const

export const dashboardNav: Record<Role, NavSection[]> = {
  TENANT: [
    {
      items: [
        { title: "Overview", href: "/dashboard", icon: LayoutDashboardIcon, exact: true },
        { title: "Find a home", href: "/properties", icon: SearchIcon },
      ],
    },
    {
      title: "Renting",
      items: [
        { title: "My requests", href: "/dashboard/requests", icon: ClipboardListIcon },
        { title: "My bookings", href: "/dashboard/bookings", icon: CalendarCheckIcon },
        { title: "Payments", href: "/dashboard/payments", icon: CreditCardIcon },
      ],
    },
    {
      title: "Account",
      items: [{ title: "Profile", href: "/dashboard/profile", icon: UserCogIcon }],
    },
  ],
  LANDLORD: [
    {
      items: [{ title: "Overview", href: "/landlord", icon: LayoutDashboardIcon, exact: true }],
    },
    {
      title: "Portfolio",
      items: [
        { title: "Properties", href: "/landlord/properties", icon: BuildingIcon },
        { title: "Rental requests", href: "/landlord/requests", icon: InboxIcon },
        { title: "Bookings", href: "/landlord/bookings", icon: CalendarCheckIcon },
        { title: "Earnings", href: "/landlord/earnings", icon: WalletIcon },
      ],
    },
    {
      title: "Account",
      items: [{ title: "Profile", href: "/landlord/profile", icon: UserCogIcon }],
    },
  ],
  ADMIN: [
    {
      items: [{ title: "Overview", href: "/admin", icon: BarChart3Icon, exact: true }],
    },
    {
      title: "Moderation",
      items: [
        { title: "Users", href: "/admin/users", icon: UsersIcon },
        { title: "Properties", href: "/admin/properties", icon: BuildingIcon },
        { title: "Bookings", href: "/admin/bookings", icon: CalendarCheckIcon },
        { title: "Payments", href: "/admin/payments", icon: CreditCardIcon },
        { title: "Audit log", href: "/admin/audit-logs", icon: HistoryIcon },
      ],
    },
    {
      title: "Account",
      items: [{ title: "Profile", href: "/admin/profile", icon: UserCogIcon }],
    },
  ],
}

export const profileHref: Record<Role, string> = {
  TENANT: "/dashboard/profile",
  LANDLORD: "/landlord/profile",
  ADMIN: "/admin/profile",
}
