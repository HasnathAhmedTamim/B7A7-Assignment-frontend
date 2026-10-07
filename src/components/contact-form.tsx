"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { MailIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { SelectField, TextareaField, TextField } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { siteConfig } from "@/config/site"

const topics = [
  { value: "renting", label: "Help with renting" },
  { value: "listing", label: "Help with a listing" },
  { value: "payment", label: "A payment or refund" },
  { value: "account", label: "My account" },
  { value: "other", label: "Something else" },
] as const

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100, "Keep your name under 100 characters"),
  topic: z.enum(topics.map((t) => t.value) as [string, ...string[]], { error: "Choose a topic" }),
  reference: z.string().trim().max(60, "Keep the reference under 60 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters)")
    .max(2000, "Keep your message under 2000 characters"),
})
type Values = z.infer<typeof schema>

/** Opens the visitor's email app with a pre-filled message; there is no contact API to post to. */
export function ContactForm() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", topic: "renting", reference: "", message: "" },
  })

  const onSubmit = form.handleSubmit((values) => {
    const topic = topics.find((t) => t.value === values.topic)?.label ?? values.topic
    const subject = `${topic}${values.reference ? ` (ref ${values.reference})` : ""}`
    const body = `${values.message}\n\n— ${values.name}`
    window.location.assign(
      `mailto:${siteConfig.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    )
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FieldGroup className="gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField control={form.control} name="name" label="Your name" autoComplete="name" />
          <SelectField control={form.control} name="topic" label="Topic" options={topics} />
        </div>
        <TextField
          control={form.control}
          name="reference"
          label="Booking or payment reference (optional)"
          placeholder="e.g. 3F2A9C1B"
        />
        <TextareaField
          control={form.control}
          name="message"
          label="Message"
          rows={6}
          maxLength={2000}
        />
      </FieldGroup>
      <Button type="submit">
        <MailIcon data-icon="inline-start" />
        Open in your email app
      </Button>
    </form>
  )
}
