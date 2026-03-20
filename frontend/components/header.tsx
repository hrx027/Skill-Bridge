"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Resume Match", href: "/resume/match" },
  { name: "Insights", href: "/insights" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="px-6 md:px-12 lg:px-20 py-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="font-serif text-xl">Skill Bridge</span>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="hidden md:flex items-center gap-3">
        <Button asChild variant="ghost" className="rounded-full">
          <Link href="/auth/signin">
          Sign in
          </Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/auth/signup">
          Get started
          </Link>
        </Button>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-background border-b border-border p-6 md:hidden z-50">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-lg py-2"
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-border my-2" />
            <Button asChild variant="ghost" className="rounded-full justify-start">
              <Link href="/auth/signin">
              Sign in
              </Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/auth/signup">
              Get started
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
