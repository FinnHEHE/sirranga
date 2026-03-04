"use client"

import { PageTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { FriendCard } from "@/components/friend-card"
import { Users, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import useSWR from "swr"

async function fetchFriends() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("friends")
    .select("*")
    .order("created_at", { ascending: true })
  if (error) throw error
  return data || []
}

export default function FriendsPage() {
  const { data: friends, isLoading } = useSWR("friends-list", fetchFriends, {
    refreshInterval: 10000,
  })

  return (
    <PageTransition>
      <main className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <BackButton />
          </div>

          <h1 className="text-4xl md:text-5xl font-sans text-orange mb-12">
            Friends
          </h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-teal" />
            </div>
          ) : !friends || friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Users className="h-16 w-16 mb-4 opacity-50" />
              <p className="font-sans text-xl">No friends added yet</p>
              <p className="text-sm mt-2">
                Friends will appear here once added by the admin
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {friends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  name={friend.name}
                  rank={friend.rank}
                  quote={friend.quote}
                  imageUrl={friend.image_url}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </PageTransition>
  )
}
