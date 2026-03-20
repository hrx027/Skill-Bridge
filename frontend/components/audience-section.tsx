"use client"

import { GraduationCap, RefreshCcw, Heart } from "lucide-react"

const audiences = [
  {
    icon: GraduationCap,
    title: "Recent Graduates",
    description: "You've got the degree, but job listings feel like a foreign language. We translate them into actionable steps.",
    quote: "I finally understand what 'cloud-native' actually means—and how to learn it.",
    quoteName: "Sarah, CS Graduate",
  },
  {
    icon: RefreshCcw,
    title: "Career Switchers",
    description: "Changing industries is scary. We help you see which skills transfer and which ones to build.",
    quote: "Coming from finance, I didn't know where to start in tech. Now I have a 6-month plan.",
    quoteName: "Marcus, Former Analyst",
  },
  {
    icon: Heart,
    title: "Mentors & Coaches",
    description: "Stop guessing what your mentees need. Get data-backed recommendations for their growth.",
    quote: "My mentees love having a clear roadmap. It makes our sessions so much more productive.",
    quoteName: "Jennifer, Tech Lead",
  },
]

export function AudienceSection() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-20 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-muted-foreground text-sm tracking-wide uppercase mb-4">
            Who it&apos;s for
          </p>
          
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6 text-balance">
            Wherever you are in your journey,<br />
            <span className="text-primary">we meet you there.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {audiences.map((audience) => (
            <div 
              key={audience.title}
              className="relative"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <audience.icon className="w-7 h-7 text-primary" />
              </div>
              
              <h3 className="font-serif text-2xl mb-3">
                {audience.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                {audience.description}
              </p>
              
              <div className="border-l-2 border-primary/30 pl-4">
                <p className="text-sm italic text-foreground/80">
                  &ldquo;{audience.quote}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  — {audience.quoteName}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
