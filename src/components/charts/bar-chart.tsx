"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export type BarDatum = { label: string; value: number }

export default function SimpleBarChart({
  data,
  seriesLabel,
  formatValue = (value) => value.toLocaleString(),
  color = "var(--chart-1)",
  className,
}: {
  data: BarDatum[]
  seriesLabel: string
  formatValue?: (value: number) => string
  color?: string
  className?: string
}) {
  const config = { value: { label: seriesLabel, color } } satisfies ChartConfig

  return (
    <ChartContainer config={config} className={className}>
      <BarChart data={data} margin={{ left: 4, right: 4, top: 8 }} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(value: number) => formatValue(value)}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <span className="font-medium tabular-nums">{formatValue(Number(value))}</span>
              )}
            />
          }
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} maxBarSize={48} />
      </BarChart>
    </ChartContainer>
  )
}
