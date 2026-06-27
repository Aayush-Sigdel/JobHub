import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  ArrowBigDown,
  ArrowLeftIcon,
  BackpackIcon,
  Bell,
  Radio,
} from "lucide-react";

const JobTracker = () => {
  return (
    <div className="rounded-md border p-6 shadow-sm h-200">
      <h2 className="font-medium flex items-center gap-2 text-lg text-muted-foreground">
        <ArrowLeftIcon />
        Job Tracker
      </h2>

      <div className="flex items-center justify-between mt-8 gap-4">
        <div className="flex items-center gap-8">
          <button className="flex items-center gap-1.5 rounded-full border  bg-white/5 px-4 py-2 text-sm font-medium text-base hover:bg-gray-500 hover:text-accent-foreground shadow-sm ">
            Saved
          </button>
          <button className="flex items-center gap-1.5 rounded-full border  bg-white/5 px-4 py-2 text-sm font-medium text-base hover:bg-gray-500 hover:text-accent-foreground shadow-sm ">
            In Progress
          </button>
          <button className="flex items-center gap-1.5 rounded-full border  bg-white/5 px-4 py-2 text-sm font-medium text-base hover:bg-gray-500 hover:text-accent-foreground shadow-sm ">
            Applied
          </button>
          <button className="flex items-center gap-1.5 rounded-full border  bg-white/5 px-4 py-2 text-sm font-medium text-base hover:bg-gray-500 hover:text-accent-foreground shadow-sm ">
            Interview
          </button>
          <button className="flex items-center gap-1.5 rounded-full border  bg-white/5 px-4 py-2 text-sm font-medium text-base hover:bg-gray-500 hover:text-accent-foreground shadow-sm ">
            Archived
          </button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex gap-2 rounded-full border px-4 py-2">
            Date Posted <ArrowBigDown />
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem>Last 24 Hours</DropdownMenuItem>
            <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
            <DropdownMenuItem>Last 30 Days</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default JobTracker;
