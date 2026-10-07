"use client"

import { ImageIcon, ImagePlusIcon, Trash2Icon } from "lucide-react"
import Image from "next/image"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { useDeletePropertyImage, useUploadPropertyImages } from "@/hooks/use-landlord"
import { pluralize } from "@/lib/format"
import { MAX_PHOTO_BYTES, MAX_PROPERTY_PHOTOS } from "@/lib/validation/property"
import type { PropertyDetail, PropertyImage } from "@/types/models"

export function PropertyPhotosCard({ property }: { property: PropertyDetail }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadPropertyImages(property.id)
  const remove = useDeletePropertyImage(property.id)
  const [previews, setPreviews] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [deleting, setDeleting] = useState<PropertyImage | null>(null)

  const { images } = property
  const remaining = MAX_PROPERTY_PHOTOS - images.length

  const onFiles = (chosen: File[]) => {
    if (inputRef.current) inputRef.current.value = ""
    if (chosen.length === 0) return

    const pictures = chosen.filter((file) => file.type.startsWith("image/"))
    if (pictures.length < chosen.length) {
      toast.error("Only image files can be added, such as JPG or PNG.")
    }
    const small = pictures.filter((file) => file.size <= MAX_PHOTO_BYTES)
    if (small.length < pictures.length) {
      toast.error(
        `${pluralize(pictures.length - small.length, "photo")} skipped: larger than 5 MB.`,
      )
    }
    const accepted = small.slice(0, Math.max(remaining, 0))
    if (accepted.length < small.length) {
      toast.error(
        `A property can have ${MAX_PROPERTY_PHOTOS} photos, so only ${pluralize(accepted.length, "photo")} ${accepted.length === 1 ? "was" : "were"} added.`,
      )
    }
    if (accepted.length === 0) return

    const urls = accepted.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    setProgress(0)
    upload.mutate(
      { files: accepted, onProgress: setProgress },
      {
        onSettled: () => {
          urls.forEach((url) => URL.revokeObjectURL(url))
          setPreviews([])
        },
      },
    )
  }

  const deletingIndex = deleting ? images.findIndex((image) => image.id === deleting.id) : -1

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
        <CardDescription>
          The first photo is the cover renters see in search. Up to {MAX_PROPERTY_PHOTOS} photos, 5
          MB each ({images.length} of {MAX_PROPERTY_PHOTOS} used).
        </CardDescription>
        <CardAction>
          <Button
            size="sm"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={remaining <= 0 || upload.isPending}
          >
            <ImagePlusIcon data-icon="inline-start" />
            Add photos
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {images.length === 0 && previews.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No photos yet"
            description="Homes with photos get more requests. Add a few of the rooms, kitchen and building."
            className="border-dashed bg-transparent"
            action={
              <Button size="sm" onClick={() => inputRef.current?.click()}>
                <ImagePlusIcon data-icon="inline-start" />
                Add the first photos
              </Button>
            }
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image, i) => (
              <li
                key={image.id}
                className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted"
              >
                <Image
                  src={image.url}
                  alt={`Photo ${i + 1} of ${property.title}`}
                  fill
                  sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 50vw"
                  className="object-cover"
                />
                {i === 0 ? <Badge className="absolute top-2 left-2">Cover</Badge> : null}
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="absolute top-2 right-2 shadow-sm"
                  aria-label={`Delete photo ${i + 1}`}
                  disabled={remove.isPending && remove.variables === image.id}
                  onClick={() => setDeleting(image)}
                >
                  <Trash2Icon />
                </Button>
              </li>
            ))}
            {previews.map((url) => (
              <li
                key={url}
                className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted"
              >
                <Image src={url} alt="" fill unoptimized className="object-cover opacity-60" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <Spinner />
                </span>
              </li>
            ))}
          </ul>
        )}

        {upload.isPending ? (
          <div className="space-y-1" aria-live="polite">
            <Progress value={progress} aria-label="Photo upload progress" />
            <p className="text-xs text-muted-foreground">
              {progress < 100
                ? `Uploading ${pluralize(previews.length, "photo")}… ${progress}%`
                : "Processing…"}
            </p>
          </div>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => onFiles(Array.from(event.target.files ?? []))}
        />
      </CardContent>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this photo?"
        description={
          deletingIndex === 0 && images.length > 1
            ? "This is the cover photo. The next photo becomes the cover."
            : "Renters will no longer see it on your listing."
        }
        confirmLabel="Delete photo"
        destructive
        pending={remove.isPending}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })
        }
      />
    </Card>
  )
}
