import { BookmarkIcon } from "@/components/ui/bookmark";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const jobtracker = () => {
  return (
    <DropdownMenu>
      <div className="flex items-center gap-2.5">
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2.5">
            <BookmarkIcon size={20} />
          </div>
        </DropdownMenuTrigger>
      </div>
    </DropdownMenu>
  );
};
export default jobtracker;
