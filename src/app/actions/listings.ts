"use server"

import { updateTag } from "next/cache"

import { PROPERTIES_TAG, propertyTag } from "@/lib/api/public"
import { getSession } from "@/lib/auth/get-session"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Expires the cached public listings after a change made through the API (new property,
 * edited rooms, approved request…) so browsers see it on the next visit.
 */
export async function refreshPublicListings(propertyId?: string) {
  const session = await getSession()
  if (!session) return
  updateTag(PROPERTIES_TAG)
  if (propertyId && UUID.test(propertyId)) updateTag(propertyTag(propertyId))
}
