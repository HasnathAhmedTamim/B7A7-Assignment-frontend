import type { ReactNode } from "react"

export function ContentPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string
  title: string
  intro?: ReactNode
  children: ReactNode
}) {
  return (
    <>
      <section className="border-b bg-sidebar">
        <div className="mx-auto w-full max-w-4xl space-y-3 px-4 py-14 sm:px-6">
          {eyebrow ? <p className="text-sm font-medium text-primary">{eyebrow}</p> : null}
          <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
          {intro ? <p className="max-w-2xl text-lg text-muted-foreground">{intro}</p> : null}
        </div>
      </section>
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">{children}</div>
    </>
  )
}
