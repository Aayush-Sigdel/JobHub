import { BookmarkIcon } from "@/components/ui/bookmark";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const jobtracker = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <BookmarkIcon size={20} />
        </button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
};
export default jobtracker;
