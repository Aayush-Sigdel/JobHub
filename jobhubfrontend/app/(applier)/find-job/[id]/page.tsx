"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Clock, Building, Bookmark, Share2, Briefcase, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock Data for Job Details
const JOB_DETAIL = {
  id: "j1",
  title: "Senior Full Stack Developer",
  company: "TechNova",
  logoUrl: "",
  location: "Remote",
  salary: "$130k - $160k",
  type: "Full-time",
  postedAt: "2 hours ago",
  applicants: 42,
  tags: ["React", "Node.js", "TypeScript", "AWS", "Next.js"],
  about: `We are looking for an experienced Senior Full Stack Developer to join our core product team. You will be responsible for building and maintaining robust, scalable web applications that serve millions of users daily. 

As a senior member of the team, you will mentor junior developers, participate in system design and architecture discussions, and help shape the future of our tech stack.`,
  responsibilities: [
    "Design and develop scalable, high-performance web applications.",
    "Collaborate with cross-functional teams to define, design, and ship new features.",
    "Identify and resolve performance and scalability issues.",
    "Participate in code reviews and advocate for best practices.",
    "Write clean, maintainable, and well-tested code."
  ],
  requirements: [
    "5+ years of experience in full-stack web development.",
    "Deep expertise in React, Node.js, and TypeScript.",
    "Experience with cloud platforms like AWS or GCP.",
    "Strong understanding of web security and performance optimization.",
    "Excellent communication and collaboration skills."
  ],
  benefits: [
    "Competitive salary and equity package.",
    "Comprehensive health, dental, and vision insurance.",
    "Unlimited PTO and flexible working hours.",
    "Stipend for home office setup and professional development.",
    "Remote-first culture with annual company retreats."
  ]
};

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams; // In a real app, fetch data based on ID
  const job = JOB_DETAIL;

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-sans text-foreground pb-20 pt-8">
      <div className="max-w-[1000px] mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link href="/find-job" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6">
          ← Back to jobs
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="flex items-start gap-5">
              <div className="rounded-2xl border border-border/50 bg-white p-2 shadow-sm shrink-0">
                <Avatar className="h-20 w-20 rounded-xl">
                  <AvatarImage src={job.logoUrl} alt={job.company} className="object-cover" />
                  <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-black text-2xl">
                    {job.company.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="pt-1">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-2">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] font-semibold text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Building className="h-4 w-4 text-primary" />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {job.postedAt}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {job.tags.map(tag => (
                    <span key={tag} className="bg-secondary/50 border border-secondary text-secondary-foreground px-3 py-1 rounded-md text-[13px] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row md:flex-col gap-3 shrink-0 mt-2 md:mt-0 w-full md:w-auto">
              <Button size="lg" className="flex-1 md:w-40 font-black text-[15px] shadow-sm">
                Apply Now <Zap className="h-4 w-4 ml-1.5 fill-current" />
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="lg" className="flex-1 md:w-auto px-0 font-bold border-border shadow-sm">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="flex-1 md:w-auto px-0 font-bold border-border shadow-sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border/60">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-muted-foreground">Salary</span>
              <span className="font-bold flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-green-500" />{job.salary}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-muted-foreground">Job Type</span>
              <span className="font-bold flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-blue-500" />{job.type}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-muted-foreground">Location</span>
              <span className="font-bold flex items-center gap-1.5"><MapPin className="h-4 w-4 text-orange-500" />{job.location}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-muted-foreground">Applicants</span>
              <span className="font-bold flex items-center gap-1.5"><UsersIcon className="h-4 w-4 text-purple-500" />{job.applicants} applied</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8 items-start mt-8">
          
          <div className="flex-1 flex flex-col gap-8 w-full">
            <section className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <h2 className="text-xl font-black mb-4">About the role</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">
                {job.about}
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <h2 className="text-xl font-black mb-4">Responsibilities</h2>
              <ul className="space-y-3">
                {job.responsibilities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-muted-foreground font-medium">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <h2 className="text-xl font-black mb-4">Requirements</h2>
              <ul className="space-y-3">
                {job.requirements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-muted-foreground font-medium">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <h2 className="text-xl font-black mb-4">Benefits & Perks</h2>
              <ul className="space-y-3">
                {job.benefits.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-muted-foreground font-medium">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6 sticky top-24">
            <div className="bg-foreground text-background rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-lg font-black mb-2 relative z-10">Ready to apply?</h3>
              <p className="text-muted/80 text-sm font-medium mb-6 relative z-10">
                Ensure your profile is up to date before submitting your application.
              </p>
              <Button size="lg" className="w-full bg-[#f5a623] hover:bg-[#e0961c] text-foreground font-black shadow-md border-0 relative z-10">
                Apply for this role
              </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
              <h3 className="font-black mb-4 text-[15px]">About {job.company}</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-lg shrink-0">
                  {job.company.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold">{job.company}</div>
                  <div className="text-sm font-medium text-muted-foreground">Technology</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-4 line-clamp-3">
                TechNova is a leading provider of cloud-based software solutions for enterprise companies worldwide. We are on a mission to simplify complex workflows.
              </p>
              <Button variant="outline" className="w-full font-bold shadow-sm">
                View Company Profile
              </Button>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

// Custom icon since Users might not be imported correctly in my mockup
const UsersIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
