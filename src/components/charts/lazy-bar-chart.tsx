"use client"

import dynamic from "next/dynamic"

import { Skeleton } from "@/components/ui/skeleton"

/** Recharts is large; load it only on pages that actually draw a chart. */
export const LazyBarChart = dynamic(() => import("./bar-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
})

export type { BarDatum } from "./bar-chart"
