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
import { ArrowBigDown, ArrowLeftIcon } from "lucide-react";
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
    <div className="grid grid-cols-[1fr_120px_160px_120px] gap-2 border-b px-4 py-2 text-xs font-bold text-muted-foreground">
      <span>Jobs</span>
      <span>Connections</span>
      <span>Notes</span>
      <span></span>
    </div>
  );

  return (
    <div className="rounded-md border p-6 shadow-sm mt-10">
      <h2 className="font-medium flex items-center gap-2 text-lg text-muted-foreground">
        <ArrowLeftIcon /> Job Tracker
      </h2>

      <div className="flex items-center justify-between mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between border-b">
            <TabsList>
              <TabsTrigger value="saved">Saved</TabsTrigger>

              <InProgressTabTrigger
                isActive={activeTab === "progress"}
                confirmedValue={confirmedType}
                onConfirm={handleProgressConfirm}
              />

              <TabsTrigger value="applied">Applied</TabsTrigger>
              <TabsTrigger value="interview">Interview</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex gap-2 rounded-full border px-4 py-2 text-sm mb-1">
                Date Posted <ArrowBigDown />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Last 24 Hours</DropdownMenuItem>
                <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
                <DropdownMenuItem>Last 30 Days</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <TabsContent value="saved">
            {columnHeaders}
            {jobs.map((job) => (
              <JobCard key={job.id} {...job} />
            ))}
          </TabsContent>

          <TabsContent value="progress">
            <InProgress type={confirmedType} />
          </TabsContent>

          <TabsContent value="applied">
            {columnHeaders}
            {jobs.map((job) => (
              <Applied key={job.id} {...job} />
            ))}
          </TabsContent>

          <TabsContent value="interview">
            {columnHeaders}
            {jobs.map((job) => (
              <Interview key={job.id} {...job} />
            ))}
          </TabsContent>

          <TabsContent value="archived">
            {columnHeaders}
            {jobs.map((job) => (
              <Archived key={job.id} {...job} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JobTracker;
