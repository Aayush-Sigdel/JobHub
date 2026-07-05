"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/animated-tabs";
import { ChevronDown, Briefcase, Search } from "lucide-react";
import JobCard from "@/components/job-tracker/JobCard";
import InProgress from "@/components/job-tracker/In-Progress";
import Applied from "@/components/job-tracker/Applied";
import Interview from "@/components/job-tracker/Interview";
import Archived from "@/components/job-tracker/Archived-jobs";
import { InProgressTabTrigger } from "@/components/dropdown/dropdown-with-radio";

const JobTracker = () => {
  const [activeTab, setActiveTab] = useState("saved");
  const [confirmedType, setConfirmedType] = useState<"draft" | "clicked-apply">(
    "clicked-apply",
  );

  function handleProgressConfirm(val: string) {
    setConfirmedType(val as "draft" | "clicked-apply");
    setActiveTab("progress"); // switches tab on Select
  }

  const jobs = [
    {
      id: 1,
      title: "Online Checkout Specialist",
      company: "inDrive",
      location: "Kathmandu, Nepal (Remote)",
      posted: "2 days ago",
      logo: "https://logo.clearbit.com/indrive.com",
      connections: 0,
      easyApply: false,
    },
    {
      id: 2,
      title: "Frontend Developer",
      company: "Leapfrog",
      location: "Kathmandu",
      posted: "1 week ago",
      logo: "https://logo.clearbit.com/indrive.com",
      connections: 5,
      easyApply: true,
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "XYZ Company",
      location: "Bharatpur, Nepal",
      posted: "11 days ago",
      logo: "",
      connections: 3,
      easyApply: true,
    },
    {
      id: 4,
      title: "Scientist",
      company: "NASA",
      location: "America",
      posted: "5 days ago",
      logo: "",
      connections: 2,
      easyApply: false,
    },
  ];

  const columnHeaders = (
    <div className="grid grid-cols-[1fr_120px_160px_120px] gap-2 border-b border-border bg-[#f9f9f8] px-6 py-4 text-[13px] font-bold text-muted-foreground">
      <span>Role & Company</span>
      <span>Connections</span>
      <span>Notes</span>
      <span className="text-right">Action</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f7f5] pb-20 pt-8 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center rounded-full border border-border bg-white px-2.5 py-0.5 text-[12px] font-bold text-foreground mb-4 shadow-sm">
              <Briefcase className="h-3.5 w-3.5 mr-1.5 text-[#f5a623]" /> Candidate Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-2">
              My Job Tracker
            </h1>
            <p className="text-[15px] font-medium text-muted-foreground">
              Monitor your saved jobs, active applications, and upcoming interviews in one place.
            </p>
          </div>
          
          {/* Global Search / Filter for Tracker */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search applications..." 
                className="h-10 pl-9 pr-4 rounded-lg border border-border bg-white text-[14px] font-medium shadow-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Tracker Container */}
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            
            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border bg-white px-6 py-3 gap-4">
              <div className="overflow-x-auto pb-1 sm:pb-0 -mx-6 px-6 sm:mx-0 sm:px-0">
                <TabsList className="bg-transparent p-0 flex items-center gap-2">
                  <TabsTrigger 
                    value="saved" 
                    className="data-[state=active]:bg-[#f5a623] data-[state=active]:text-foreground data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-bold text-[14px] transition-colors"
                  >
                    Saved <span className="ml-2 bg-foreground/10 px-1.5 py-0.5 rounded-full text-[11px]">4</span>
                  </TabsTrigger>

                  <div className="data-[state=active]:bg-[#f5a623] data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg font-bold text-[14px] transition-colors">
                    <InProgressTabTrigger
                      isActive={activeTab === "progress"}
                      confirmedValue={confirmedType}
                      onConfirm={handleProgressConfirm}
                    />
                  </div>

                  <TabsTrigger 
                    value="applied" 
                    className="data-[state=active]:bg-[#f5a623] data-[state=active]:text-foreground data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-bold text-[14px] transition-colors"
                  >
                    Applied <span className="ml-2 bg-foreground/10 px-1.5 py-0.5 rounded-full text-[11px]">2</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="interview" 
                    className="data-[state=active]:bg-[#f5a623] data-[state=active]:text-foreground data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-bold text-[14px] transition-colors"
                  >
                    Interview <span className="ml-2 bg-foreground/10 px-1.5 py-0.5 rounded-full text-[11px]">1</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="archived" 
                    className="data-[state=active]:bg-[#f5a623] data-[state=active]:text-foreground data-[state=active]:shadow-sm px-4 py-2 rounded-lg font-bold text-[14px] transition-colors"
                  >
                    Archived
                  </TabsTrigger>
                </TabsList>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-[13px] font-bold text-foreground shadow-sm hover:bg-[#f7f7f5] transition-colors whitespace-nowrap">
                  Date Posted <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 font-medium text-[13px]">
                  <DropdownMenuItem className="cursor-pointer">Last 24 Hours</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">Last 7 Days</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">Last 30 Days</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">All Time</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Tab Contents */}
            <div className="bg-white min-h-[400px]">
              <TabsContent value="saved" className="m-0 border-none outline-none">
                {columnHeaders}
                <div className="divide-y divide-border">
                  {jobs.map((job) => (
                    <div key={job.id} className="px-2 hover:bg-[#f9f9f8] transition-colors">
                      <JobCard {...job} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="progress" className="m-0 border-none outline-none">
                <div className="p-6">
                  <InProgress type={confirmedType} />
                </div>
              </TabsContent>

              <TabsContent value="applied" className="m-0 border-none outline-none">
                {columnHeaders}
                <div className="divide-y divide-border">
                  {jobs.map((job) => (
                    <div key={job.id} className="px-2 hover:bg-[#f9f9f8] transition-colors">
                      <Applied {...job} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="interview" className="m-0 border-none outline-none">
                {columnHeaders}
                <div className="divide-y divide-border">
                  {jobs.map((job) => (
                    <div key={job.id} className="px-2 hover:bg-[#f9f9f8] transition-colors">
                      <Interview {...job} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="archived" className="m-0 border-none outline-none">
                {columnHeaders}
                <div className="divide-y divide-border">
                  {jobs.map((job) => (
                    <div key={job.id} className="px-2 hover:bg-[#f9f9f8] transition-colors">
                      <Archived {...job} />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

      </div>
    </div>
  );
};

export default JobTracker;
