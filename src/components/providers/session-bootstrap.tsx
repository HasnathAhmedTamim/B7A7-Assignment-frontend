import { getSession } from "@/lib/auth/get-session"

import { AuthBootstrap } from "./auth-bootstrap"

export async function SessionBootstrap() {
  const session = await getSession()
  return <AuthBootstrap user={session} />
}
