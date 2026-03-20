"use client"

import Link from "next/link"
import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { clearAuth, getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/resume/upload", label: "Upload Resume" },
  { href: "/resume/match", label: "Resume Match" },
  { href: "/insights", label: "AI Insights" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/interview", label: "Interview" },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const user = useMemo(() => getCurrentUser(), [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold">Skill Bridge</Link>
        <div className="text-sm text-muted-foreground">{user?.name || "Guest"}</div>
      </header>
      <div className="grid md:grid-cols-[220px_1fr]">
        <aside className="border-r p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded px-3 py-2 text-sm ${pathname === link.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              {link.label}
            </Link>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              clearAuth()
              window.location.href = "/auth/signin"
            }}
          >
            Sign out
          </Button>
        </aside>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
