
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode
}

export function IconButton({ icon, className, children, ...props }: IconButtonProps) {
  return (
    <Button className={cn("flex items-center gap-2", className)} {...props}>
      {icon}
      {children}
    </Button>
  )
}
