"use client"

import { SlidersHorizontalIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { SearchInput } from "@/components/shared/search-input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { formatMoney } from "@/lib/format"
import { propertyTypeLabel } from "@/lib/labels"
import {
  activeFilterCount,
  SORT_OPTIONS,
  sortValue,
  type PropertyFilters,
} from "@/lib/property-filters"

import { FilterPanel } from "./filter-panel"
import { useFilters } from "./filters-context"

type Chip = { key: string; label: string; clear: Partial<PropertyFilters> }

function chipsFor(filters: PropertyFilters): Chip[] {
  const chips: Chip[] = []
  if (filters.city)
    chips.push({ key: "city", label: `City: ${filters.city}`, clear: { city: undefined } })
  if (filters.location)
    chips.push({
      key: "location",
      label: `Area: ${filters.location}`,
      clear: { location: undefined },
    })
  if (filters.minRent !== undefined || filters.maxRent !== undefined) {
    const label =
      filters.minRent !== undefined && filters.maxRent !== undefined
        ? `${formatMoney(filters.minRent)} – ${formatMoney(filters.maxRent)}`
        : filters.minRent !== undefined
          ? `From ${formatMoney(filters.minRent)}`
          : `Up to ${formatMoney(filters.maxRent)}`
    chips.push({ key: "rent", label, clear: { minRent: undefined, maxRent: undefined } })
  }
  if (filters.propertyType)
    chips.push({
      key: "type",
      label: propertyTypeLabel[filters.propertyType],
      clear: { propertyType: undefined },
    })
  if (filters.bedrooms !== undefined)
    chips.push({ key: "beds", label: `${filters.bedrooms} bed`, clear: { bedrooms: undefined } })
  if (filters.bathrooms !== undefined)
    chips.push({
      key: "baths",
      label: `${filters.bathrooms} bath`,
      clear: { bathrooms: undefined },
    })
  if (filters.available)
    chips.push({ key: "available", label: "Free rooms only", clear: { available: undefined } })
  return chips
}

export function PropertyToolbar() {
  const { filters, update, reset } = useFilters()
  const [sheetOpen, setSheetOpen] = useState(false)
  const chips = chipsFor(filters)
  const count = activeFilterCount(filters)

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchInput
          value={filters.search ?? ""}
          onChange={(search) => update({ search: search || undefined })}
          placeholder="Search by title, description, city or address"
          label="Search homes"
          className="h-9 sm:flex-1"
        />
        <div className="flex gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-9 flex-1 lg:hidden">
                <SlidersHorizontalIcon data-icon="inline-start" />
                Filters
                {count > 0 ? <Badge className="ml-1 h-4 min-w-4 px-1">{count}</Badge> : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Narrow down homes by location, rent and size.</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6">
                <FilterPanel onApplied={() => setSheetOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <Select
            value={sortValue(filters)}
            onValueChange={(value) => {
              const option = SORT_OPTIONS.find((o) => o.value === value)
              if (option) update({ sortBy: option.sortBy, sortOrder: option.sortOrder })
            }}
          >
            <SelectTrigger className="h-9 flex-1 sm:w-48" aria-label="Sort homes">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {chips.length > 0 ? (
        <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
          {chips.map((chip) => (
            <li key={chip.key}>
              <Button
                variant="secondary"
                size="xs"
                className="rounded-full"
                onClick={() => update(chip.clear)}
                aria-label={`Remove filter ${chip.label}`}
              >
                {chip.label}
                <XIcon data-icon="inline-end" />
              </Button>
            </li>
          ))}
          <li>
            <Button variant="link" size="xs" onClick={reset}>
              Clear all
            </Button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}
