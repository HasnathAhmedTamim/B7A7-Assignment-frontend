"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { MapPinIcon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { filtersToSearchParams } from "@/lib/property-filters"

const schema = z.object({
  search: z.string().trim().max(100, "Keep your search under 100 characters"),
  city: z.string().trim().max(100, "Keep the city under 100 characters"),
})
type Values = z.infer<typeof schema>

export function HeroSearch() {
  const router = useRouter()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { search: "", city: "" },
  })

  const onSubmit = form.handleSubmit((values) => {
    const qs = filtersToSearchParams({
      search: values.search || undefined,
      city: values.city || undefined,
    }).toString()
    router.push(qs ? `/properties?${qs}` : "/properties")
  })

  const error = form.formState.errors.search?.message ?? form.formState.errors.city?.message

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="flex w-full max-w-2xl flex-col gap-2 rounded-xl border bg-card p-2 shadow-sm sm:flex-row"
    >
      <label className="flex flex-1 items-center gap-2 px-2">
        <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">Search homes</span>
        <Input
          {...form.register("search")}
          placeholder="Apartment, studio, neighbourhood…"
          className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
      </label>
      <span className="hidden w-px bg-border sm:block" aria-hidden />
      <label className="flex items-center gap-2 px-2 sm:w-48">
        <MapPinIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">City</span>
        <Input
          {...form.register("city")}
          placeholder="City"
          className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
      </label>
      <Button type="submit" size="lg" className="h-10 px-5">
        Search
      </Button>
      {error ? (
        <p role="alert" className="px-2 text-sm text-destructive sm:sr-only">
          {error}
        </p>
      ) : null}
    </form>
  )
}
