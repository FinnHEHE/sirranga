"use client"

import { useState, useCallback, useRef } from "react"
import Link from "next/link"
import { PageTransition } from "@/components/page-transition"
import {
  ArrowLeft,
  Upload,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import useSWR, { mutate } from "swr"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  return date.toLocaleDateString()
}

async function fetchUploads() {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from("uploads").list("", {
    sortBy: { column: "created_at", order: "desc" },
  })
  if (error) throw error
  return (data || []).filter((f) => f.name !== ".emptyFolderPlaceholder")
}

export default function AdminUploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set())
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: uploads, isLoading } = useSWR("admin-uploads-list", fetchUploads, {
    refreshInterval: 5000,
  })

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setUploadStatus(null)

    const supabase = createClient()
    let successCount = 0
    let errorCount = 0

    for (const file of Array.from(files)) {
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const filePath = `${timestamp}_${safeName}`

      const { error } = await supabase.storage
        .from("uploads")
        .upload(filePath, file)

      if (error) {
        errorCount++
      } else {
        successCount++
      }
    }

    setUploading(false)
    mutate("admin-uploads-list")

    if (errorCount > 0 && successCount > 0) {
      setUploadStatus({
        type: "error",
        message: `${successCount} uploaded, ${errorCount} failed`,
      })
    } else if (errorCount > 0) {
      setUploadStatus({ type: "error", message: "Upload failed. Please try again." })
    } else {
      setUploadStatus({
        type: "success",
        message: `${successCount} file${successCount > 1 ? "s" : ""} uploaded successfully!`,
      })
    }

    setTimeout(() => setUploadStatus(null), 4000)
  }, [])

  const handleDeleteFile = useCallback(async (fileName: string) => {
    setDeletingFiles((prev) => new Set(prev).add(fileName))
    const supabase = createClient()
    const { error } = await supabase.storage.from("uploads").remove([fileName])
    setDeletingFiles((prev) => {
      const next = new Set(prev)
      next.delete(fileName)
      return next
    })
    if (error) {
      setUploadStatus({ type: "error", message: "Failed to delete file." })
    } else {
      setUploadStatus({ type: "success", message: "File deleted successfully." })
    }
    mutate("admin-uploads-list")
    setTimeout(() => setUploadStatus(null), 3000)
  }, [])

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
            Upload Admin
          </h1>

          {uploadStatus && (
            <div
              className={`mb-6 flex items-center gap-3 rounded-xl border-2 px-6 py-4 transition-all duration-300 ${
                uploadStatus.type === "success"
                  ? "border-teal bg-teal/5 text-teal"
                  : "border-destructive bg-destructive/5 text-destructive"
              }`}
            >
              {uploadStatus.type === "success" ? (
                <CheckCircle className="h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0" />
              )}
              <p className="font-sans">{uploadStatus.message}</p>
            </div>
          )}

          {/* Drop Zone */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <div
            className={`mb-12 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-16 transition-all duration-300 cursor-pointer ${
              isDragging
                ? "border-orange bg-orange/5 scale-[1.01]"
                : "border-teal bg-card hover:border-orange"
            } ${uploading ? "pointer-events-none opacity-60" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              handleUpload(e.dataTransfer.files)
            }}
          >
            <div
              className={`transition-colors duration-300 ${
                isDragging ? "text-orange" : "text-teal"
              }`}
            >
              {uploading ? (
                <Loader2 className="h-12 w-12 animate-spin" />
              ) : (
                <Upload className="h-12 w-12" />
              )}
            </div>
            <p className="text-lg font-sans text-foreground">
              {uploading
                ? "Uploading..."
                : isDragging
                  ? "Drop files here"
                  : "Drag & drop files here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {uploading ? "Please wait" : "or click to browse your files"}
            </p>
          </div>

          {/* Uploads List */}
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-sans text-foreground mb-6">
              <Clock className="h-6 w-6 text-teal" />
              All Uploads ({uploads?.length || 0})
            </h2>
            <div className="flex flex-col gap-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-teal" />
                </div>
              ) : !uploads || uploads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground rounded-xl border-2 border-teal/30 bg-card">
                  <FileText className="h-12 w-12 mb-3 opacity-50" />
                  <p className="font-sans">No uploads yet</p>
                </div>
              ) : (
                uploads.map((upload) => (
                  <div
                    key={upload.name}
                    className="flex items-center gap-4 rounded-xl border-2 border-teal/50 bg-card px-6 py-4 transition-all duration-300 hover:border-teal"
                  >
                    <FileText className="h-8 w-8 shrink-0 text-teal" />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-foreground truncate">
                        {upload.name.replace(/^\d+_/, "")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {upload.metadata?.size
                          ? formatFileSize(upload.metadata.size)
                          : "Unknown size"}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0">
                      {upload.created_at ? formatDate(upload.created_at) : "Unknown"}
                    </span>
                    <button
                      onClick={() => handleDeleteFile(upload.name)}
                      disabled={deletingFiles.has(upload.name)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-destructive/50 text-destructive transition-all duration-300 hover:bg-destructive hover:text-foreground disabled:opacity-50 disabled:pointer-events-none"
                      aria-label={`Delete ${upload.name}`}
                    >
                      {deletingFiles.has(upload.name) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
