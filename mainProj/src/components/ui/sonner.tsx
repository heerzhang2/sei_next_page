"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:dynht-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:dynht-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:dynht-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:dynht-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
