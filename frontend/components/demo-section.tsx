"use client"

import { useState } from "react"
import { Check, Clock, BookOpen, Code, Cloud, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const skillGaps = [
  { name: "Kubernetes", level: 85, status: "critical" },
  { name: "Terraform", level: 60, status: "moderate" },
  { name: "CI/CD Pipelines", level: 45, status: "learning" },
  { name: "AWS Solutions Architect", level: 30, status: "learning" },
]

const learningPath = [
  { 
    title: "Docker Fundamentals",
    provider: "Docker Official",
    duration: "8 hours",
    type: "Free",
    completed: true,
  },
  { 
    title: "Kubernetes for Developers",
    provider: "KubeAcademy",
    duration: "12 hours",
    type: "Free",
    completed: false,
    current: true,
  },
  { 
    title: "Terraform: Up & Running",
    provider: "HashiCorp Learn",
    duration: "6 hours",
    type: "Free",
    completed: false,
  },
  { 
    title: "AWS Cloud Practitioner",
    provider: "AWS Training",
    duration: "15 hours",
    type: "Free",
    completed: false,
  },
]

export function DemoSection() {
  const [activeTab, setActiveTab] = useState<"gaps" | "path">("gaps")

  return (
    <section className="px-6 md:px-12 lg:px-20 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-muted-foreground text-sm tracking-wide uppercase mb-4">
            See it in action
          </p>
          
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6 text-balance">
            From &ldquo;I don&apos;t know where to start&rdquo;<br />
            to &ldquo;I&apos;ve got this&rdquo;
          </h2>
        </div>

        {/* Demo Card */}
        <div className="bg-card rounded-3xl border border-border/50 overflow-hidden shadow-xl shadow-primary/5">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-border/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Cloud className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-xl">Target Role: Cloud Engineer</h3>
                <p className="text-muted-foreground text-sm">Based on your resume analysis</p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setActiveTab("gaps")}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === "gaps" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Skill Gaps
              </button>
              <button
                onClick={() => setActiveTab("path")}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === "path" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Learning Path
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {activeTab === "gaps" ? (
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  We analyzed 127 Cloud Engineer job postings. Here&apos;s what you&apos;re missing:
                </p>
                
                {skillGaps.map((skill) => (
                  <div key={skill.name} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{skill.name}</span>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        skill.status === "critical" 
                          ? "bg-destructive/10 text-destructive" 
                          : skill.status === "moderate"
                          ? "bg-accent/20 text-accent-foreground"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {skill.status === "critical" ? "High demand" : 
                         skill.status === "moderate" ? "Good to have" : "Learning"}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          skill.status === "critical" 
                            ? "bg-destructive" 
                            : skill.status === "moderate"
                            ? "bg-accent"
                            : "bg-primary"
                        }`}
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Required in {skill.level}% of job postings
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground mb-6">
                  Your personalized roadmap to becoming interview-ready:
                </p>
                
                {learningPath.map((item, index) => (
                  <div 
                    key={item.title}
                    className={`flex items-start gap-4 p-4 rounded-2xl transition-all ${
                      item.current 
                        ? "bg-primary/5 border border-primary/20" 
                        : item.completed
                        ? "opacity-60"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.completed 
                        ? "bg-primary text-primary-foreground" 
                        : item.current
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      {item.completed ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${item.completed ? "line-through" : ""}`}>
                          {item.title}
                        </h4>
                        {item.current && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Up next
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.provider}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {item.type}
                        </span>
                      </div>
                    </div>
                    
                    {!item.completed && (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 md:p-8 border-t border-border/50 bg-secondary/30">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <p className="text-sm text-muted-foreground">
                This is sample data. Upload your resume to see your personalized analysis.
              </p>
              <Button className="rounded-full">
                Try with your resume
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
