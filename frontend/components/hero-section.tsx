"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Upload, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="min-h-[90vh] flex flex-col justify-center px-6 md:px-12 lg:px-20 py-16">
      <div className="max-w-4xl">
        <p className="text-muted-foreground text-sm tracking-wide uppercase mb-6">
          Your career companion
        </p>
        
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-tight text-balance mb-8">
          Bridge the gap between{" "}
          <span className="text-primary italic">where you are</span>
          {" "}and{" "}
          <span className="text-primary italic">where you want to be</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-12">
          Upload your resume, tell us your dream role, and we&apos;ll map out exactly what skills 
          you need and how to get them. No more guessing. Just clarity.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            asChild
            size="lg" 
            className="rounded-full px-8 py-6 text-base group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Link href="/resume/upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload your resume
            <ArrowRight className={`w-4 h-4 ml-2 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
            </Link>
          </Button>
          
          <Button 
            asChild
            variant="outline" 
            size="lg" 
            className="rounded-full px-8 py-6 text-base border-2"
          >
            <Link href="/dashboard">
            <Sparkles className="w-4 h-4 mr-2" />
            See how it works
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 hidden lg:block" />
      <div className="absolute bottom-40 right-40 w-48 h-48 bg-accent/10 rounded-full blur-2xl -z-10 hidden lg:block" />
    </section>
  )
}
