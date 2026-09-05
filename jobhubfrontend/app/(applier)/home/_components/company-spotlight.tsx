"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import { formatSkillName } from "@/lib/utils";

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

function CompanyLogo({ name }: { name: string }) {
  switch (name) {
    case "Linear":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-[#5E6AD2]"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Linear Logo"
        >
          <path d="M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z" />
        </svg>
      );
    case "Vercel":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 fill-foreground"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Vercel Logo"
        >
          <path d="m12 1.608 12 20.784H0Z" />
        </svg>
      );
    case "Supabase":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-[#3ECF8E]"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Supabase Logo"
        >
          <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z" />
        </svg>
      );
    default:
      return (
        <span className="font-bold text-xs text-foreground">
          {name.slice(0, 2).toUpperCase()}
        </span>
      );
  }
}

const FEATURED_COMPANIES: CompanyInfo[] = [
  {
    id: "c1",
    name: "Linear",
    description: "The issue tracking tool and project system built for high-performance software teams.",
    coverUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    logoUrl: "/images/companies/linear.svg",
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
    logoUrl: "/images/companies/vercel.svg",
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
    logoUrl: "/images/companies/supabase.svg",
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
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Featured Companies
          </h2>
          <p className="text-xs text-muted-foreground font-normal mt-0.5">
            Discover active engineering teams hiring now.
          </p>
        </div>

        <Link
          href="/find-job"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0 transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Grid of Company Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURED_COMPANIES.map((company) => (
          <div
            key={company.id}
            className="group relative rounded-2xl border border-border bg-card overflow-hidden shadow-xs transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 flex flex-col justify-between"
          >
            {/* Cover Banner */}
            <div className="relative h-20 w-full overflow-hidden bg-muted/60 border-b border-border/50">
              {company.coverUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105 opacity-90"
                  style={{ backgroundImage: `url(${company.coverUrl})` }}
                />
              )}

              {/* Real Brand Logo Badge */}
              <div className="absolute -bottom-3 left-4">
                <div className="h-10 w-10 border-2 border-card bg-card shadow-xs rounded-xl flex items-center justify-center">
                  <CompanyLogo name={company.name} />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="pt-5 pb-4 px-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-bold text-sm text-foreground group-hover:underline transition-colors truncate">
                    {company.name}
                  </h3>
                  <span className="text-[10px] font-bold bg-primary text-black px-2.5 py-0.5 rounded-full shadow-xs shrink-0">
                    {company.openJobs} Roles
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                  <span className="truncate">{company.location}</span>
                </div>

                <p className="text-[12px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                  {company.description}
                </p>

                {/* Tech tags - neutral without greenish tint */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {company.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold bg-muted text-foreground px-2 py-0.5 rounded-md border border-border/60 transition-colors"
                    >
                      {formatSkillName(tag)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-border/50">
                <Button
                  asChild
                  size="sm"
                  className="w-full text-xs font-bold justify-between h-8 px-3 rounded-xl bg-primary text-black hover:bg-primary/90 shadow-xs transition-all cursor-pointer"
                >
                  <Link href={`/find-job?query=${encodeURIComponent(company.name)}`}>
                    <span>View Roles</span>
                    <ArrowRight className="h-3.5 w-3.5" />
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
