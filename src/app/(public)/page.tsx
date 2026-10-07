import { siteConfig } from "@/config/site"

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-24">
      <h1 className="text-3xl font-semibold">{siteConfig.name}</h1>
      <p className="mt-2 text-muted-foreground">{siteConfig.tagline}</p>
    </main>
  )
}
