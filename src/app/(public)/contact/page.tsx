import { ClockIcon, MailIcon, MessageCircleQuestionIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { ContactForm } from "@/components/contact-form"
import { ContentPage } from "@/components/layout/content-page"
import { Card, CardContent } from "@/components/ui/card"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get help with a request, booking, payment or listing.",
}

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact"
      title="We're here to help"
      intro="Questions about a booking, a payment or your listing? Send us a message and include your reference if you have one."
    >
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_18rem]">
        <ContactForm />
        <div className="space-y-3">
          <Card size="sm">
            <CardContent className="flex gap-3">
              <MailIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 text-sm">
                <p className="font-medium">Email</p>
                <a
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="break-all text-muted-foreground hover:text-primary"
                >
                  {siteConfig.supportEmail}
                </a>
              </div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex gap-3">
              <ClockIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <div className="text-sm">
                <p className="font-medium">Response time</p>
                <p className="text-muted-foreground">Within one working day, Sunday to Thursday.</p>
              </div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex gap-3">
              <MessageCircleQuestionIcon
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              <div className="text-sm">
                <p className="font-medium">Quick answers</p>
                <p className="text-muted-foreground">
                  Many questions are covered in the{" "}
                  <Link href="/faq" className="text-primary underline-offset-4 hover:underline">
                    FAQ
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentPage>
  )
}
