"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type StatusTab<V extends string> = { value: V; label: string; count?: number }

/** Filter tabs for client-side lists; scrolls horizontally on narrow screens. */
export function StatusTabs<V extends string>({
  tabs,
  value,
  onValueChange,
  label,
}: {
  tabs: StatusTab<V>[]
  value: V
  onValueChange: (value: V) => void
  label: string
}) {
  return (
    <Tabs value={value} onValueChange={(next) => onValueChange(next as V)}>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <TabsList aria-label={label}>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-3">
              {tab.label}
              {tab.count !== undefined ? (
                <span className="ml-1 text-xs text-muted-foreground tabular-nums">{tab.count}</span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )
}
