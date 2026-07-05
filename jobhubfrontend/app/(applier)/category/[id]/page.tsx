"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Search, ChevronDown, Check, Bookmark, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { JobCard } from "../../_components/job-card";

// MOCK DATA
const MOCK_CATEGORY_JOBS = [
  {
    id: "j1",
    title: "Senior Full Stack Developer",
    company: "TechNova",
    location: "Remote",
    salary: "$130k - $160k",
    type: "Full-time",
    postedAt: "2 hours ago",
    tags: ["React", "Node.js", "TypeScript"],
    featured: true,
  },
  {
    id: "j2",
    title: "Frontend Engineer",
    company: "CloudScale",
    location: "San Francisco, CA",
    salary: "$120k - $150k",
    type: "Full-time",
    postedAt: "1 day ago",
    tags: ["Vue.js", "Tailwind", "REST"],
    featured: false,
  },
  {
    id: "j3",
    title: "Backend Architect",
    company: "DataIQ",
    location: "New York, NY",
    salary: "$160k - $190k",
    type: "Full-time",
    postedAt: "2 days ago",
    tags: ["Go", "Kubernetes", "AWS"],
    featured: false,
  },
  {
    id: "j4",
    title: "React Native Developer",
    company: "AppFlow",
    location: "London, UK (Hybrid)",
    salary: "£80k - £100k",
    type: "Contract",
    postedAt: "3 days ago",
    tags: ["React Native", "Mobile", "iOS"],
    featured: false,
  },
];

// Helper to format the slug into a readable title
const formatCategoryName = (slug: string) => {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const categoryName = formatCategoryName(resolvedParams.id);

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-sans text-foreground pb-20 pt-8">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: FILTERS & PREFERENCES */}
        <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6 sticky top-24">
          
          {/* Header for sidebar */}
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-[15px] tracking-tight text-foreground">Filters</h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            
            {/* Active Preferences Box (Inspiration from WTJ light green box) */}
            <div className="bg-[#eaf5fc] p-5 border-b border-border">
              <h3 className="font-bold text-[15px] text-foreground mb-3">{categoryName} Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {[categoryName, "Senior Level", "Remote", "Full-time", "$100k+"].map(pref => (
                  <div key={pref} className="flex items-center gap-1 bg-white border border-[#4a73e8]/20 text-[#4a73e8] px-2.5 py-1 rounded-md text-[13px] font-semibold shadow-sm">
                    {pref}
                    <X className="h-3.5 w-3.5 ml-1 cursor-pointer hover:text-destructive transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* Editable Filters */}
            <div className="p-5 flex flex-col gap-5">
              <h3 className="font-bold text-[15px] text-foreground">Edit parameters</h3>
              
              <div className="flex justify-between items-center py-2 cursor-pointer group border-b border-border/60 pb-4">
                <span className="text-[14px] font-bold text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-3">
                  <Briefcase className="h-4 w-4" /> Role
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex justify-between items-center py-2 cursor-pointer group border-b border-border/60 pb-4">
                <span className="text-[14px] font-bold text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-3">
                  <MapPin className="h-4 w-4" /> Location
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex justify-between items-center py-2 cursor-pointer group border-b border-border/60 pb-4">
                <span className="text-[14px] font-bold text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-3">
                  <Search className="h-4 w-4" /> Contract and salary
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>

              <Button className="w-full mt-2 font-bold h-11 bg-foreground text-background hover:bg-foreground/90 rounded-lg">
                Update Results
              </Button>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: MAIN CONTENT */}
        <main className="flex-1 w-full flex flex-col gap-6">
          
          {/* Top Bar: Tabs and Sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Pill Tabs (Inspiration from WTJ yellow/white active tabs) */}
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-border shadow-sm">
              <button className="bg-[#f5a623] text-foreground font-bold text-[14px] px-4 py-1.5 rounded-md flex items-center gap-2 transition-colors shadow-sm">
                Matches <span className="bg-foreground text-background text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">12</span>
              </button>
              <button className="hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-[14px] px-4 py-1.5 rounded-md flex items-center gap-2 transition-colors">
                Saved <span className="bg-muted-foreground/20 text-foreground text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">3</span>
              </button>
              <button className="hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-[14px] px-4 py-1.5 rounded-md flex items-center gap-2 transition-colors">
                Seen <span className="bg-muted-foreground/20 text-foreground text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">45</span>
              </button>
            </div>

            <Button variant="outline" className="bg-white border-border shadow-sm font-bold h-10 px-4 rounded-lg">
              Any time <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Job Feed */}
          {MOCK_CATEGORY_JOBS.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
              {MOCK_CATEGORY_JOBS.map((job) => (
                <JobCard key={job.id} {...job} />
              ))}
            </div>
          ) : (
            /* Empty State Implementation mimicking the image */
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="relative w-48 h-48 mb-8 bg-[#eaf5fc] rounded-xl transform -rotate-6 shadow-sm border border-[#4a73e8]/20 flex items-center justify-center">
                <Search className="h-16 w-16 text-[#4a73e8]" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3">No jobs in sight</h3>
              <p className="text-muted-foreground font-medium max-w-md mx-auto mb-8 leading-relaxed">
                New roles are on their way, your alerts are set. In the meantime, go back and save any roles that caught your eye so you can apply when you're ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-[#f5a623] hover:bg-[#e0961c] text-foreground font-bold h-12 px-8 rounded-lg shadow-sm">
                  Review seen jobs
                </Button>
                <Button variant="outline" className="bg-white border-border text-foreground font-bold h-12 px-8 rounded-lg shadow-sm">
                  Enrich my profile
                </Button>
              </div>
            </div>
          )}
          
        </main>
      </div>
    </div>
  );
}
