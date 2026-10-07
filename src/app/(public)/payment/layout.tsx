import type { Metadata } from "next"

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function PaymentLayout({ children }: LayoutProps<"/payment">) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 px-4 py-10 sm:py-16" aria-live="polite">
      {children}
    </div>
  )
}
