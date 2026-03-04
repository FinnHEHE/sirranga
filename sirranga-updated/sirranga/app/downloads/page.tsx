"use client"

import { PageTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { FileText, Download, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import useSWR from "swr"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

function getFileExtension(name: string): string {
  const ext = name.split(".").pop()?.toUpperCase() || "FILE"
  return ext
}

async function fetchDownloads() {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from("uploads").list("", {
    sortBy: { column: "created_at", order: "desc" },
  })
  if (error) throw error
  return (data || []).filter((f) => f.name !== ".emptyFolderPlaceholder")
}

function DownloadFileCard({
  file,
}: {
  file: { name: string; metadata?: { size?: number }; created_at?: string }
}) {
  const displayName = file.name.replace(/^\d+_/, "")
  const ext = getFileExtension(displayName)
  const size = file.metadata?.size ? formatFileSize(file.metadata.size) : "Unknown"

  function handleDownload() {
    const supabase = createClient()
    const { data } = supabase.storage.from("uploads").getPublicUrl(file.name)
    if (data?.publicUrl) {
      const a = document.createElement("a")
      a.href = data.publicUrl
      a.download = displayName
      a.target = "_blank"
      a.click()
    }
  }

  return (
    <div className="aspect-square flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-teal bg-card p-6 transition-all duration-300 hover:border-orange hover:shadow-[0_0_30px_rgba(0,128,128,0.15)] hover:scale-[1.03]">
      <div className="text-teal">
        <FileText className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-sans text-foreground text-center truncate w-full px-2">
        {displayName}
      </h3>
      <p className="text-sm text-muted-foreground text-center">{ext} File</p>
      <p className="text-xs text-muted-foreground">{size}</p>
      <button
        onClick={handleDownload}
        className="mt-auto flex items-center gap-2 rounded-lg bg-orange px-6 py-2 text-sm font-sans text-primary-foreground transition-all duration-300 hover:brightness-110 hover:scale-105"
      >
        <Download className="h-4 w-4" />
        Download
      </button>
    </div>
  )
}

export default function DownloadsPage() {
  const { data: files, isLoading } = useSWR("downloads-list", fetchDownloads, {
    refreshInterval: 10000,
  })

  return (
    <PageTransition>
      <main className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <BackButton />
          </div>

          <h1 className="text-4xl md:text-5xl font-sans text-orange mb-4">
            Downloads
          </h1>
          <p className="text-muted-foreground text-lg mb-12">
            Files uploaded to the site
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-teal" />
            </div>
          ) : !files || files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <FileText className="h-16 w-16 mb-4 opacity-50" />
              <p className="font-sans text-xl">No downloads available yet</p>
              <p className="text-sm mt-2">
                Files will appear here once uploaded
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {files.map((file) => (
                <DownloadFileCard key={file.name} file={file} />
              ))}
            </div>
          )}
        </div>
      </main>
    </PageTransition>
  )
}
