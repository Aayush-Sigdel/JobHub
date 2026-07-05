import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, ArrowRight, MessageSquare, Briefcase, ChevronLeft, ChevronRight, CheckCircle2, ChevronRight as ChevronRightIcon } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Profile Banner */}
      <div className="bg-white rounded-lg border shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-transparent">
            <AvatarImage src="/placeholder.jpg" />
            <AvatarFallback className="bg-emerald-700 text-white text-xl font-bold">AS</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-3">
              Aayush S
              <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground/80 bg-brand/10 px-2 py-0.5 rounded-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-brand flex items-center justify-center">
                  <span className="h-1 w-1 bg-white rounded-full"></span>
                </span>
                New Employer
              </span>
            </h1>
            <div className="flex items-center gap-4 mt-1 text-sm font-medium">
              <span className="text-muted-foreground">@aayushsigdell</span>
              <Link href="/upgrade" className="text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground transition-colors">
                Upgrade to Premium Employer
              </Link>
            </div>
          </div>
        </div>
        <Button variant="outline" className="font-semibold px-4 flex items-center gap-2 rounded-md">
          <span className="h-2 w-2 rounded-full bg-success"></span>
          Available
          <ChevronRightIcon className="h-4 w-4 ml-2 text-muted-foreground" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Orders / Job Listings */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Active Listings</h2>
              <Button variant="outline" size="sm" className="font-semibold text-xs h-8">
                Listings <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="bg-[#fafafa] border rounded-md p-6 flex items-center justify-center text-sm font-medium text-muted-foreground">
              No active job listings
            </div>
          </div>

          {/* Respond to Candidates */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Respond to candidates</h2>
            <div className="flex items-center gap-2 border-b pb-4 mb-4">
              <Button variant="secondary" className="font-semibold h-10 px-4 bg-[#f5f5f5] hover:bg-[#ebebeb] text-foreground border-transparent">
                <MessageSquare className="mr-2 h-4 w-4" /> Messages
              </Button>
              <Button variant="outline" className="font-semibold h-10 px-4 text-muted-foreground border-border hover:bg-secondary/50">
                <Briefcase className="mr-2 h-4 w-4" /> Applications (0)
              </Button>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <button className="px-3 py-1 bg-secondary rounded-full text-xs font-bold text-foreground">All</button>
              <button className="px-3 py-1 bg-transparent border hover:bg-secondary/50 rounded-full text-xs font-semibold text-muted-foreground">Unread (0)</button>
            </div>

            <div className="space-y-0">
              {[
                { name: "kshiwsankar", time: "9 months ago", msg: '"hi what if you built the project for single player is is it least to adapt to multiplayer after"', avatar: "bg-blue-100 text-blue-700", init: "K" },
                { name: "Kane W", time: "9 months ago", msg: '"yo are you free too make me a prototype for a 2d game"', avatar: "bg-orange-100 text-orange-700", init: "KW" },
                { name: "numbered4", time: "11 months ago", msg: '""', avatar: "bg-amber-100 text-amber-700", init: "N" },
                { name: "chr_harr_51391", time: "11 months ago", msg: '""', avatar: "bg-emerald-100 text-emerald-700", init: "C" },
              ].map((msg, i) => (
                <div key={i} className="flex gap-4 py-4 border-b last:border-0 hover:bg-[#fafafa] -mx-6 px-6 transition-colors cursor-pointer group">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`${msg.avatar} font-bold text-sm`}>{msg.init}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[15px]">{msg.name}</span>
                      <span className="text-xs text-muted-foreground font-medium">{msg.time}</span>
                    </div>
                    <p className="text-sm text-foreground/80 truncate font-medium">
                      {msg.msg}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Path to next level */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Your path to top employer</h2>
              <div className="flex items-center">
                {/* Progress steps simulation */}
                <div className="flex items-center bg-[#f5f5f5] rounded-full p-1">
                  <div className="h-6 w-6 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                    <CheckCircle2 className="h-4 w-4 fill-brand text-white" />
                  </div>
                  <div className="flex items-center gap-1 px-2">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="h-3.5 w-3.5 rounded-full bg-[#e4e5e7] flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-[#b5b6ba]" />
                      </div>
                    ))}
                    <div className="h-5 w-5 rounded-full bg-[#e4e5e7] flex items-center justify-center ml-1">
                      <span className="text-[10px] font-bold text-white">+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-4">CONVERT NEW CANDIDATES</p>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
                  <Briefcase className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] mb-1">Post a new job listing to attract talent</h3>
                  <p className="text-sm text-muted-foreground font-medium">Showcase your company culture to look more professional and win more applicants</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Resources</h2>
                <p className="text-sm text-muted-foreground font-medium">Insights, tips, and tools to grow your team on JobHub.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border text-muted-foreground" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border text-foreground hover:bg-secondary/50">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden max-w-xs hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-40 bg-emerald-50 flex items-center justify-center">
                <div className="h-16 w-12 bg-emerald-900 rounded-full border-4 border-emerald-800 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-6 bg-emerald-700 rounded-full"></div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5 mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"></span>
                  5 MIN READ
                </p>
                <h3 className="font-bold text-lg leading-tight mb-4">How to avoid spam and stay safe on JobHub</h3>
                <Link href="/resources" className="text-sm font-semibold underline decoration-muted-foreground underline-offset-4 flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" /> Read article
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Profile Strength */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-xl font-bold">Profile Strength</h2>
              <div className="text-xl font-bold">11 <span className="text-sm text-muted-foreground font-medium">/ 12</span></div>
            </div>
            <p className="text-sm font-medium text-foreground/80 leading-relaxed mb-4">
              A strong profile helps you stand out and attract better candidates.
            </p>
            <div className="h-2.5 w-full bg-[#f5f5f5] rounded-full overflow-hidden mb-6">
              <div className="h-full bg-foreground w-[90%] rounded-full"></div>
            </div>
            <Button variant="outline" className="font-semibold text-sm w-full sm:w-auto hover:bg-secondary/50">
              Complete profile
            </Button>
          </div>

          {/* Track Performance */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Track your performance</h2>
            <div className="space-y-3 mb-6">
              <div className="border rounded-md p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Hired in June</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-md p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Active listings</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="border rounded-md p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Success score</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </div>
            <Link href="/analytics" className="text-sm font-semibold text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground transition-colors">
              View more analytics
            </Link>
          </div>

          {/* Share Feedback */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 leading-tight pr-4">Share feedback to shape your dashboard</h2>
            <Button variant="outline" className="font-semibold text-sm hover:bg-secondary/50">
              Give feedback
            </Button>
          </div>

        </div>
      </div>
      
      {/* Footer-like area */}
      <div className="pt-12 border-t mt-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm font-medium text-muted-foreground pb-8">
        <div>
          <h4 className="font-bold text-foreground mb-4">Categories</h4>
          <ul className="space-y-3">
            <li>Graphics & Design</li>
            <li>Programming & Tech</li>
            <li>Digital Marketing</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-foreground mb-4">For Candidates</h4>
          <ul className="space-y-3">
            <li>How JobHub Works</li>
            <li>Success Stories</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-foreground mb-4">For Employers</h4>
          <ul className="space-y-3">
            <li>Post a Job</li>
            <li>Employer Guide</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
