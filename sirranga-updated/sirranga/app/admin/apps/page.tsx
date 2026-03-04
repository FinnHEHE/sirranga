"use client"

import { useState } from "react"
import Link from "next/link"
import { PageTransition } from "@/components/page-transition"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Gamepad2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import useSWR, { mutate } from "swr"

async function fetchApps() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("apps")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}

export default function AdminAppsPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [icon, setIcon] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const { data: apps, isLoading } = useSWR("admin-apps-list", fetchApps, {
    refreshInterval: 5000,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setStatus({ type: "error", message: "Title and description are required." })
      setTimeout(() => setStatus(null), 3000)
      return
    }

    setSubmitting(true)
    setStatus(null)

    const supabase = createClient()
    const { error } = await supabase.from("apps").insert({
      title: title.trim(),
      description: description.trim(),
      url: url.trim() || null,
      icon: icon.trim() || null,
    })

    setSubmitting(false)

    if (error) {
      setStatus({ type: "error", message: "Failed to add app." })
    } else {
      setStatus({ type: "success", message: `${title} added successfully!` })
      setTitle("")
      setDescription("")
      setUrl("")
      setIcon("")
      mutate("admin-apps-list")
    }

    setTimeout(() => setStatus(null), 3000)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from("apps").delete().eq("id", id)
    mutate("admin-apps-list")
  }

  return (
    <PageTransition>
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-sans text-muted-foreground transition-colors duration-300 hover:text-orange"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-sans text-orange mb-12">
            Apps Admin
          </h1>

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

          {/* Add App Form */}
          <form
            onSubmit={handleSubmit}
            className="mb-12 rounded-xl border-2 border-teal bg-card p-8"
          >
            <h2 className="flex items-center gap-2 text-2xl font-sans text-foreground mb-6">
              <Plus className="h-6 w-6 text-teal" />
              Add an App
            </h2>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-sans text-muted-foreground mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="App name..."
                  className="w-full rounded-lg border-2 border-teal/50 bg-background px-4 py-3 text-foreground font-sans placeholder:text-muted-foreground focus:border-orange focus:outline-none transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-sans text-muted-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does the app do..."
                  rows={2}
                  className="w-full rounded-lg border-2 border-teal/50 bg-background px-4 py-3 text-foreground font-sans placeholder:text-muted-foreground focus:border-orange focus:outline-none transition-colors duration-300 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-sans text-muted-foreground mb-2">
                  URL (optional)
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border-2 border-teal/50 bg-background px-4 py-3 text-foreground font-sans placeholder:text-muted-foreground focus:border-orange focus:outline-none transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-sans text-muted-foreground mb-2">
                  Icon emoji or text (optional)
                </label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. 🎮 or 🧮"
                  className="w-full rounded-lg border-2 border-teal/50 bg-background px-4 py-3 text-foreground font-sans placeholder:text-muted-foreground focus:border-orange focus:outline-none transition-colors duration-300"
                />
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
                    <Plus className="h-5 w-5" />
                    Add App
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Apps List */}
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-sans text-foreground mb-6">
              <Gamepad2 className="h-6 w-6 text-teal" />
              Current Apps ({apps?.length || 0})
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-teal" />
              </div>
            ) : !apps || apps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground rounded-xl border-2 border-teal/30 bg-card">
                <Gamepad2 className="h-12 w-12 mb-3 opacity-50" />
                <p className="font-sans">No apps added yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 rounded-xl border-2 border-teal/50 bg-card px-6 py-4 transition-all duration-300 hover:border-teal"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/10 text-2xl shrink-0">
                      {app.icon || "📦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-foreground truncate">{app.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {app.description}
                      </p>
                      {app.url && (
                        <p className="text-xs text-teal truncate">{app.url}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(app.id)}
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
    </PageTransition>
  )
}
