"use client"

import { BarChart3, Route, MessageSquare, Users } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Gap Analysis",
    description: "We compare your skills against real job postings and show you exactly what's missing. No surprises in interviews.",
  },
  {
    icon: Route,
    title: "Learning Roadmap",
    description: "Get a personalized path with courses, projects, and resources—organized by how long they take, not how much they cost.",
  },
  {
    icon: MessageSquare,
    title: "Mock Interviews",
    description: "Practice with questions tailored to the skills you're building. Get comfortable before the real thing.",
  },
  {
    icon: Users,
    title: "For Mentors Too",
    description: "Guiding someone's career? Use data-backed insights to help your mentees find their path.",
  },
]

export function FeatureCards() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-20 bg-card">
      <div className="max-w-6xl mx-auto">
        <p className="text-muted-foreground text-sm tracking-wide uppercase mb-4">
          What we do
        </p>
        
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6 max-w-3xl text-balance">
          We help you see the path forward.{" "}
          <span className="text-muted-foreground">Not just another job board.</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group p-8 rounded-3xl border border-border/50 bg-background hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              
              <h3 className="font-serif text-xl md:text-2xl mb-3">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              
              <div className="mt-6 text-primary text-sm font-medium cursor-pointer hover:underline underline-offset-4">
                Learn more →
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
