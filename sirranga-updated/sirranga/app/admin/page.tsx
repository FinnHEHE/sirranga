"use client"

import { useState } from "react"
import Link from "next/link"
import { PageTransition } from "@/components/page-transition"
import { Lock, Users, Upload, Gamepad2 } from "lucide-react"

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === "sirrangaadmin") {
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
          <h1 className="text-2xl font-sans text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter the password to access the admin panel
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
              autoFocus
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

function AdminDashboard() {
  const sections = [
    {
      href: "/admin/friends",
      title: "Friends",
      icon: <Users className="h-14 w-14" />,
    },
    {
      href: "/admin/upload",
      title: "Upload",
      icon: <Upload className="h-14 w-14" />,
    },
    {
      href: "/admin/apps",
      title: "Apps",
      icon: <Gamepad2 className="h-14 w-14" />,
    },
  ]

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-sans text-orange mb-12">
          Admin Panel
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {sections.map((s) => (
            <Link key={s.href} href={s.href} className="group block">
              <div className="aspect-square flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-teal bg-card transition-all duration-300 hover:border-orange hover:shadow-[0_0_30px_rgba(0,128,128,0.15)] hover:scale-[1.03]">
                <div className="text-teal transition-colors duration-300 group-hover:text-orange">
                  {s.icon}
                </div>
                <span className="text-xl font-sans text-foreground transition-colors duration-300 group-hover:text-orange">
                  {s.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <PageTransition>
      {isAuthenticated ? (
        <AdminDashboard />
      ) : (
        <LoginScreen onLogin={() => setIsAuthenticated(true)} />
      )}
    </PageTransition>
  )
}
