import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

export function UserAvatar({
  name,
  image,
  className,
}: {
  name: string | null | undefined
  image?: string | null
  className?: string
}) {
  return (
    <Avatar className={cn("size-8", className)}>
      {image ? <AvatarImage src={image} alt="" /> : null}
      <AvatarFallback className="bg-accent text-xs font-medium text-accent-foreground">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
