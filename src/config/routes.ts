import type { Role } from "@/types/models"

export const roleHome: Record<Role, string> = {
  ADMIN: "/admin",
  LANDLORD: "/landlord",
  TENANT: "/dashboard",
}

/** Route prefixes and the roles allowed to open them. Checked in `proxy.ts`. */
export const protectedRoutes: ReadonlyArray<{ prefix: string; roles: readonly Role[] }> = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/landlord", roles: ["LANDLORD"] },
  { prefix: "/dashboard", roles: ["TENANT"] },
  { prefix: "/payment", roles: ["TENANT", "ADMIN"] },
]

/** Pages that make no sense for a signed-in user. */
export const guestOnlyRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]

export function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function isProtectedPath(pathname: string) {
  return protectedRoutes.some((route) => matchesPrefix(pathname, route.prefix))
}

/** Only allow same-origin relative redirects after login. */
export function safeRedirectPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return null
  }
  return value
}

export function canAccess(pathname: string, role: Role) {
  const route = protectedRoutes.find((r) => matchesPrefix(pathname, r.prefix))
  return !route || route.roles.includes(role)
}
