"use client"

import { SearchIcon, XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { cn } from "@/lib/utils"

/** A search box that reports its trimmed value after the user pauses typing. */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  label = "Search",
  className,
  delay = 350,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
  delay?: number
}) {
  const [draft, setDraft] = useState(value)
  const debounced = useDebouncedValue(draft, delay)
  const onChangeRef = useRef(onChange)
  const lastReported = useRef(value)

  useEffect(() => {
    onChangeRef.current = onChange
  })

  // Follow external changes (e.g. "Clear filters" or browser back).
  useEffect(() => {
    if (value !== lastReported.current) {
      lastReported.current = value
      setDraft(value)
    }
  }, [value])

  useEffect(() => {
    const next = debounced.trim()
    if (next !== lastReported.current) {
      lastReported.current = next
      onChangeRef.current(next)
    }
  }, [debounced])

  return (
    <InputGroup className={cn("bg-background", className)}>
      <InputGroupAddon>
        <SearchIcon aria-hidden />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        maxLength={100}
      />
      {draft ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setDraft("")}>
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}
