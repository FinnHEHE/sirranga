"use client"

import Link from "next/link"
import { type ReactNode } from "react"

interface NavCardProps {
  href: string
  title: string
  icon: ReactNode
}

export function NavCard({ href, title, icon }: NavCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="aspect-square flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-teal bg-card transition-all duration-300 hover:border-orange hover:shadow-[0_0_30px_rgba(0,128,128,0.15)] hover:scale-[1.03]">
        <div className="text-teal transition-colors duration-300 group-hover:text-orange">
          {icon}
        </div>
        <span className="text-xl font-sans text-foreground transition-colors duration-300 group-hover:text-orange">
          {title}
        </span>
      </div>
    </Link>
  )
}
