"use client"

import { useState } from "react"
import { ArrowRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CTASection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
    }
  }

  return (
    <section className="px-6 md:px-12 lg:px-20 py-24">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-muted-foreground text-sm tracking-wide uppercase mb-4">
          Ready to start?
        </p>
        
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6 text-balance">
          Your dream role is closer<br />
          than you think.
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          Join thousands of professionals who&apos;ve found clarity in their career journey. 
          We&apos;ll help you get there too.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 rounded-full border-2 text-base"
                required
              />
            </div>
            <Button type="submit" size="lg" className="rounded-full h-14 px-8 group">
              Get started
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        ) : (
          <div className="bg-primary/10 text-primary px-8 py-6 rounded-2xl inline-block">
            <p className="font-medium">You&apos;re on the list!</p>
            <p className="text-sm mt-1 text-primary/80">We&apos;ll be in touch soon with your personalized roadmap.</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground mt-6">
          Free to try. No credit card required.
        </p>
      </div>
    </section>
  )
}
