import type React from "react"
interface ContentSectionProps {
  id: string
  title: string
  children: React.ReactNode
}

export function ContentSection({ id, title, children }: ContentSectionProps) {
  return (
    <section id={id} className="scroll-mt-16 mb-16">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
    </section>
  )
}

