"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Users, ArrowRight, Sparkles } from "lucide-react";

interface CompanyInfo {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  coverUrl?: string;
  location: string;
  employees: string;
  openJobs: number;
  tags: string[];
}

const FEATURED_COMPANIES: CompanyInfo[] = [
  {
    id: "c1",
    name: "Linear",
    description: "The issue tracking tool and project system built for high-performance software teams.",
    coverUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    location: "San Francisco, CA (Hybrid)",
    employees: "50-150 employees",
    openJobs: 8,
    tags: ["React", "TypeScript", "GraphQL"],
  },
  {
    id: "c2",
    name: "Vercel",
    description: "The platform for frontend developers, providing seamless deployment, preview, and serverless compute.",
    coverUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    location: "Remote Worldwide",
    employees: "200-500 employees",
    openJobs: 14,
    tags: ["Next.js", "Rust", "Edge Functions"],
  },
  {
    id: "c3",
    name: "Supabase",
    description: "The open source Firebase alternative. Build production-grade backends in a weekend.",
    coverUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
    location: "Remote / Singapore",
    employees: "100-250 employees",
    openJobs: 6,
    tags: ["PostgreSQL", "Go", "TypeScript"],
  },
];

export function CompanySpotlight() {
  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-end justify-between px-0.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-black tracking-tight text-foreground">
              Company Spotlight
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              <Sparkles className="h-3 w-3" /> Top Hiring
            </span>
          </div>
          <p className="text-[13px] text-muted-foreground font-medium mt-0.5">
            Discover engineering teams matching your background and skills.
          </p>
        </div>

        <Link
          href="/find-job"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
        >
          View all companies <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Grid of Company Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURED_COMPANIES.map((company) => (
          <div
            key={company.id}
            className="group relative rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md flex flex-col justify-between"
          >
            {/* Cover Banner */}
            <div className="relative h-24 w-full overflow-hidden bg-muted">
              {company.coverUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${company.coverUrl})` }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Logo */}
              <div className="absolute -bottom-4 left-4">
                <Avatar className="h-12 w-12 border-2 border-card bg-card shadow-sm rounded-xl">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-base rounded-lg">
                    {company.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Content */}
            <div className="pt-6 pb-4 px-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                    {company.name}
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                    {company.openJobs} Roles
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1 font-medium">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {company.location}
                  </span>
                </div>

                <p className="text-[12px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                  {company.description}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {company.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold bg-muted px-2 py-0.5 rounded text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-border/60">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs font-semibold justify-between h-8 px-2 hover:bg-muted group/btn text-foreground"
                >
                  <Link href={`/find-job?query=${encodeURIComponent(company.name)}`}>
                    <span>Explore Open Roles</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
