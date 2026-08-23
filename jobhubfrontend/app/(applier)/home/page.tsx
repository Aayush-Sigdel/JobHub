"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  MapPin,
  Bookmark,
  Briefcase,
  TrendingUp,
  Users,
  ChevronRight,
  Zap,
} from "lucide-react";
import { JobCard } from "../_components/job-card";
import { CompanyCard } from "../_components/company-card";
import Link from "next/link";
import { api } from "@/lib/api";

const MOCK_JOBS = [
  {
    id: "j1",
    title: "Senior UI/UX Designer",
    company: "DesignShift",
    location: "London, UK (Hybrid)",
    salary: "£75k - £95k",
    type: "Full-time",
    postedAt: "Just now",
    tags: ["Figma", "Design Systems", "Prototyping"],
    featured: true,
  },
  {
    id: "j2",
    title: "Backend Engineer (Go)",
    company: "CloudScale",
    location: "Remote",
    salary: "$120k - $160k",
    type: "Full-time",
    postedAt: "3h ago",
    tags: ["Golang", "AWS", "Microservices"],
    featured: false,
  },
  {
    id: "j3",
    title: "Product Manager",
    company: "TechNova",
    location: "San Francisco, CA",
    salary: "$140k - $180k",
    type: "Full-time",
    postedAt: "5h ago",
    tags: ["Agile", "Strategy", "B2B SaaS"],
    featured: false,
  },
];

const MOCK_COMPANIES = [
  {
    id: "c1",
    name: "Linear",
    description:
      "A better way to build products. Linear is the issue tracking tool you'll enjoy using.",
    logoUrl: "https://github.com/shadcn.png",
    coverUrl:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    location: "San Francisco, CA",
    employees: "50-200",
    openJobs: 12,
  },
  {
    id: "c2",
    name: "Vercel",
    description:
      "Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.",
    logoUrl: "https://github.com/shadcn.png",
    coverUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    location: "Remote",
    employees: "200-500",
    openJobs: 24,
  },
];

export default function ApplierDiscoveryFeed() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get("/user/profile");
        if (res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error("Failed to load profile on home feed:", err);
      }
    }
    loadProfile();
  }, []);

  const userName = profile?.name || session?.user?.name || "Candidate";
  const userTitle = profile?.title || "Professional Developer";
  const userImage =
    profile?.imageUrl || (session?.user as any)?.imageUrl || session?.user?.image;
  const userLocation = profile?.location;
  const userSkills: string[] =
    profile?.skills?.map((s: any) => s.name) || [
      "React",
      "Node.js",
      "TypeScript",
    ];

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] p-4 md:p-6 lg:p-8 pt-8 font-sans text-foreground pb-20">
      <div className="max-w-[1300px] mx-auto flex flex-col lg:flex-row gap-8">
        {/* LEFT COLUMN: Mini Profile & Navigation (Sticky) */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-6">
          <div className="sticky top-24 flex flex-col gap-6">
            {/* User Mini Profile */}
            <div className="overflow-hidden border border-border bg-white rounded-xl shadow-sm">
              <div className="h-16 bg-[#eaf5fc] relative">
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white p-1">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={userImage} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="pt-10 pb-5 px-4 text-center">
                <Link
                  href="/candidate-profile"
                  className="font-bold text-[16px] hover:underline decoration-primary underline-offset-2 text-foreground truncate block"
                >
                  {userName}
                </Link>
                <p className="text-[13px] text-muted-foreground font-semibold mt-1 truncate">
                  {userTitle}
                </p>
                {userLocation && (
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5 flex items-center justify-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{userLocation}</span>
                  </p>
                )}

                <div className="mt-5 py-4 border-t border-b border-border/60 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-muted-foreground font-bold">
                      Profile Views
                    </span>
                    <span className="font-bold text-[#4a73e8]">47</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-muted-foreground font-bold">
                      Connections
                    </span>
                    <span className="font-bold text-foreground">
                      {profile?.connectionCount ?? 0}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-[13px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Bookmark className="h-4 w-4" /> My Saved Items
                </div>
              </div>
            </div>

            {/* Quick Filters / Nav */}
            <div className="border border-border bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 flex flex-col gap-1">
                <h3 className="font-bold text-[14px] text-foreground mb-2 px-2">
                  Discover
                </h3>
                <Button
                  variant="ghost"
                  className="justify-start font-bold text-foreground bg-[#f7f7f5] h-9 px-3 rounded-lg"
                >
                  <Briefcase className="h-4 w-4 mr-2" /> Jobs Feed
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start font-bold text-muted-foreground hover:text-foreground h-9 px-3 rounded-lg hover:bg-[#f7f7f5]"
                >
                  <Users className="h-4 w-4 mr-2" /> Companies
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start font-bold text-muted-foreground hover:text-foreground h-9 px-3 rounded-lg hover:bg-[#f7f7f5]"
                >
                  <TrendingUp className="h-4 w-4 mr-2" /> Projects & Open Source
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Main Feed */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Section: Top Companies Spotlight */}
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between px-1">
              <div>
                <h2 className="text-[20px] font-black text-foreground tracking-tight">
                  Company Spotlight
                </h2>
                <p className="text-[14px] text-muted-foreground font-medium">
                  Discover teams matching your tech stack.
                </p>
              </div>
              <Link
                href="#"
                className="text-[13px] font-bold text-[#4a73e8] hover:underline"
              >
                Explore all
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {MOCK_COMPANIES.map((company) => (
                <CompanyCard key={company.id} {...company} />
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-border/60 my-2" />

          {/* Section: Recommended Jobs */}
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between px-1">
              <div>
                <h2 className="text-[20px] font-black text-foreground tracking-tight">
                  Jobs for you
                </h2>
                <p className="text-[14px] text-muted-foreground font-medium">
                  Based on your profile and skills.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {MOCK_JOBS.map((job) => (
                <JobCard key={job.id} {...job} />
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full mt-2 font-bold h-12 bg-white border-border/60 hover:bg-[#f7f7f5] rounded-xl text-[14px]"
            >
              Show more jobs
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Trending / Suggestions */}
        <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-6">
          <div className="sticky top-24 flex flex-col gap-6">
            <div className="border border-border bg-white rounded-xl shadow-sm">
              <div className="p-5">
                <h3 className="font-bold text-[15px] text-foreground mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#f5a623] fill-[#f5a623]/20" />{" "}
                  Your Skills & Trending
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userSkills.slice(0, 8).map((skill) => (
                    <span
                      key={skill}
                      className="bg-[#f7f7f5] border border-border text-foreground text-[12px] font-bold px-2.5 py-1.5 rounded-md hover:bg-[#eaf5fc] hover:border-[#4a73e8]/30 hover:text-[#4a73e8] cursor-pointer transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[12px] text-center text-muted-foreground font-semibold">
              <div className="flex justify-center gap-3 mb-2 flex-wrap">
                <Link href="#" className="hover:underline hover:text-foreground">
                  About
                </Link>
                <Link href="#" className="hover:underline hover:text-foreground">
                  Accessibility
                </Link>
                <Link href="#" className="hover:underline hover:text-foreground">
                  Help Center
                </Link>
                <Link href="#" className="hover:underline hover:text-foreground">
                  Privacy & Terms
                </Link>
              </div>
              <p>JobHub Corporation © 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
