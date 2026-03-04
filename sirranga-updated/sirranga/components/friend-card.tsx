"use client"

import { User } from "lucide-react"

interface FriendCardProps {
  name: string
  rank: string
  quote: string
  imageUrl?: string | null
}

export function FriendCard({ name, rank, quote, imageUrl }: FriendCardProps) {
  return (
    <div className="group aspect-square relative rounded-xl border-2 border-teal bg-card overflow-hidden transition-all duration-300 hover:border-orange hover:shadow-[0_0_30px_rgba(0,128,128,0.15)] hover:scale-[1.03]">
      {/* Default state - name & rank */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 transition-opacity duration-300 group-hover:opacity-0">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal/10 text-teal">
          <User className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-sans text-foreground text-center">{name}</h3>
        <p className="text-sm text-muted-foreground text-center">{rank}</p>
      </div>

      {/* Hover state - image + quote */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-24 w-24 rounded-full object-cover border-2 border-teal"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal/10 text-teal">
            <User className="h-12 w-12" />
          </div>
        )}
        <h3 className="text-lg font-sans text-foreground text-center">{name}</h3>
        <div className="rounded-lg bg-teal/10 px-4 py-3 border border-teal/30">
          <p className="text-sm text-teal text-center italic">
            {'"'}
            {quote}
            {'"'}
          </p>
        </div>
      </div>
    </div>
  )
}
