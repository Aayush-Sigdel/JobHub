"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Mail, HelpCircle, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PosterHeader() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Listings", href: "/manage-jobs", hasDropdown: true },
    { name: "Candidates", href: "/candidates", hasDropdown: true },
    { name: "Analytics", href: "/analytics", hasDropdown: true },
  ];

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b bg-card px-4 md:px-8 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 font-black text-3xl tracking-tighter text-foreground">
          JobHub<span className="text-brand">.</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-[15px] font-semibold text-muted-foreground ml-4">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 hover:text-foreground transition-colors py-2",
                pathname === link.href || pathname.startsWith(`${link.href}/`) 
                  ? "text-foreground" 
                  : ""
              )}
            >
              {link.name}
              {link.hasDropdown && <ChevronDown className="h-4 w-4 opacity-50" />}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-5">
        <button className="text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand border-2 border-white" />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Mail className="h-5 w-5" />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>
        
        <Avatar className="h-9 w-9 border-2 border-transparent hover:border-brand/20 cursor-pointer transition-colors ml-2">
          <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
          <AvatarFallback className="bg-emerald-700 text-white font-bold text-xs">AS</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
