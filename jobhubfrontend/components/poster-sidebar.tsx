"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart,
  Settings,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Post a Job",
    href: "/post-job",
    icon: PlusCircle,
  },
  {
    title: "Discover Talent",
    href: "/discover",
    icon: Users,
  },
  {
    title: "Manage Jobs",
    href: "/manage-jobs",
    icon: Briefcase,
  },
  {
    title: "My Candidates",
    href: "/candidates",
    icon: Users,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function PosterSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-card/50 backdrop-blur-xl md:flex">
      <div className="flex h-16 shrink-0 items-center px-6 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <div className="size-8 rounded-full bg-brand flex items-center justify-center text-brand-foreground">
            J
          </div>
          JobHub <span className="text-brand text-sm ml-1 font-medium px-2 py-0.5 rounded-full bg-brand/10">Employer</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="grid gap-1 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-brand text-brand-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <div className="rounded-lg bg-secondary/50 p-4 text-sm">
          <p className="font-semibold text-foreground mb-1">Need help?</p>
          <p className="text-muted-foreground mb-3">Check our employer guide or contact support.</p>
          <Link href="/support" className="text-brand hover:underline font-medium">
            Contact Support
          </Link>
        </div>
      </div>
    </aside>
  );
}
