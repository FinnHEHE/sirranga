import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function BackButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-muted-foreground hover:text-orange transition-colors duration-300 font-sans"
    >
      <ArrowLeft className="h-5 w-5" />
      <span>Back to Home</span>
    </Link>
  )
}
