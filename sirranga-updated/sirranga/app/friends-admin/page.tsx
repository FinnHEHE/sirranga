"use client"

import { useState, useRef, useCallback } from "react"
import { PageTransition } from "@/components/page-transition"
import {
  Lock,
  UserPlus,
  Upload,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  ImageIcon,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import useSWR, { mutate } from "swr"

async function fetchFriends() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("friends")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === "friendssecret") {
      onLogin()
    } else {
      setError(true)
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div
        className={`w-full max-w-md transition-transform duration-300 ${
          shaking ? "animate-[shake_0.5s_ease-in-out]" : ""
        }`}
      >
        <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-teal bg-card p-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal/10 text-teal">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-sans text-foreground">Friends Admin</h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter the password to manage friends
          </p>
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder="Enter password..."
              className="w-full rounded-lg border-2 border-teal/50 bg-background px-4 py-3 text-foreground font-sans placeholder:text-muted-foreground focus:border-orange focus:outline-none transition-colors duration-300"
            />
            {error && (
              <p className="text-sm text-destructive text-center">
                Incorrect password. Try again.
              </p>
            )}
            <button
              type="submit"
              className="rounded-lg bg-orange px-6 py-3 font-sans text-primary-foreground transition-all duration-300 hover:brightness-110 hover:scale-[1.02]"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function FriendsAdminDashboard() {
  const [name, setName] = useState("")
  const [rank, setRank] = useState("")
  const [quote, setQuote] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: friends, isLoading } = useSWR("friends-admin-list", fetchFriends, {
    refreshInterval: 5000,
  })

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    },
    []
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !rank.trim() || !quote.trim()) {
      setStatus({ type: "error", message: "All text fields are required." })
      setTimeout(() => setStatus(null), 3000)
      return
    }

    setSubmitting(true)
    setStatus(null)

    const supabase = createClient()
    let imageUrl: string | null = null

    if (imageFile) {
      const timestamp = Date.now()
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const filePath = `${timestamp}_${safeName}`

      const { error: uploadError } = await supabase.storage
        .from("friend-images")
        .upload(filePath, imageFile)

      if (uploadError) {
        setSubmitting(false)
        setStatus({ type: "error", message: "Image upload failed." })
        setTimeout(() => setStatus(null), 3000)
        return
      }

      const { data: urlData } = supabase.storage
        .from("friend-images")
        .getPublicUrl(filePath)

      imageUrl = urlData.publicUrl
    }

    const { error } = await supabase.from("friends").insert({
      name: name.trim(),
      rank: rank.trim(),
      quote: quote.trim(),
      image_url: imageUrl,
    })

    setSubmitting(false)

    if (error) {
      setStatus({ type: "error", message: "Failed to add friend." })
    } else {
      setStatus({ type: "success", message: `${name} added successfully!` })
      setName("")
      setRank("")
      setQuote("")
      setImageFile(null)
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      mutate("friends-admin-list")
    }

    setTimeout(() => setStatus(null), 3000)
  }

  async function handleDelete(id: string, imageUrl: string | null) {
    const supabase = createClient()

    if (imageUrl) {
      const fileName = imageUrl.split("/").pop()
      if (fileName) {
        await supabase.storage.from("friend-images").remove([fileName])
      }
    }

    await supabase.from("friends").delete().eq("id", id)
    mutate("friends-admin-list")
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-sans text-orange mb-12">
          Friends Admin
        </h1>

        {/* Status */}
        {status && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border-2 px-6 py-4 transition-all duration-300 ${
              status.type === "success"
                ? "border-teal bg-teal/5 text-teal"
                : "border-destructive bg-destructive/5 text-destructive"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <p className="font-sans">{status.message}</p>
          </div>
        )}

        {/* Add Friend Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-12 rounded-xl border-2 border-teal bg-card p-8"
        >
          <h2 className="flex items-center gap-2 text-2xl font-sans text-foreground mb-6">
            <UserPlus className="h-6 w-6 text-teal" />
            Add a Friend
          </h2>

          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-sans text-muted-foreground mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Friend's name..."
                className="w-full rounded-lg border-2 border-teal/50 bg-background px-4 py-3 text-foreground font-sans placeholder:text-muted-foreground focus:border-orange focus:outline-none transition-colors duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-sans text-muted-foreground mb-2">
                Rank / Title
              </label>
              <input
                type="text"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="e.g. Meme Specialist, Gaming Legend..."
                className="w-full rounded-lg border-2 border-teal/50 bg-background px-4 py-3 text-foreground font-sans placeholder:text-muted-foreground focus:border-orange focus:outline-none transition-colors duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-sans text-muted-foreground mb-2">
                Quote
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="A funny or memorable quote..."
                rows={3}
                className="w-full rounded-lg border-2 border-teal/50 bg-background px-4 py-3 text-foreground font-sans placeholder:text-muted-foreground focus:border-orange focus:outline-none transition-colors duration-300 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-sans text-muted-foreground mb-2">
                Profile Image (optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-4 rounded-lg border-2 border-dashed border-teal/50 bg-background px-4 py-4 cursor-pointer transition-colors duration-300 hover:border-orange"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-16 w-16 rounded-full object-cover border-2 border-teal"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal/10 text-teal">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <p className="font-sans text-foreground">
                    {imageFile ? imageFile.name : "Click to upload an image"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {imageFile ? "Click to change" : "JPG, PNG, GIF accepted"}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-lg bg-orange px-6 py-3 font-sans text-primary-foreground transition-all duration-300 hover:brightness-110 hover:scale-[1.02] disabled:opacity-60 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Add Friend
                </>
              )}
            </button>
          </div>
        </form>

        {/* Friends List */}
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-sans text-foreground mb-6">
            <Users className="h-6 w-6 text-teal" />
            Current Friends ({friends?.length || 0})
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal" />
            </div>
          ) : !friends || friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground rounded-xl border-2 border-teal/30 bg-card">
              <Users className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-sans">No friends added yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-4 rounded-xl border-2 border-teal/50 bg-card px-6 py-4 transition-all duration-300 hover:border-teal"
                >
                  {friend.image_url ? (
                    <img
                      src={friend.image_url}
                      alt={friend.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-teal shrink-0"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/10 text-teal shrink-0">
                      <Users className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-foreground truncate">
                      {friend.name}
                    </p>
                    <p className="text-sm text-orange truncate">{friend.rank}</p>
                    <p className="text-xs text-muted-foreground truncate italic">
                      {'"'}
                      {friend.quote}
                      {'"'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(friend.id, friend.image_url)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-destructive/50 text-destructive transition-all duration-300 hover:bg-destructive hover:text-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FriendsAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <PageTransition>
      {isAuthenticated ? (
        <FriendsAdminDashboard />
      ) : (
        <LoginScreen onLogin={() => setIsAuthenticated(true)} />
      )}
    </PageTransition>
  )
}
