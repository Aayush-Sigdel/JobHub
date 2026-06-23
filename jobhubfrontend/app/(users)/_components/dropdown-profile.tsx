import {
  CreditCardIcon,
  HelpCircleIcon,
  LogOutIcon,
  SettingsIcon,
  ShareIcon,
  UserCircleIcon,
  UsersIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DropdownMenuIcons() {
  return (
    <DropdownMenu>
      <div className="flex items-center gap-2.5">
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2.5">
            <div className="p-[2px] rounded-full bg-gradient-to-br  via-blue-500 to-amber-400 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br  flex items-center justify-center text-xs font-semibold text-white">
                KS
              </div>
            </div>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-100 rounded-2xl border border-white/8 bg-zinc-900 p-1.5 shadow-2xl shadow-black/40"
        >
          {/* <div className="px-3 py-2.5 border-b border-white/6 mb-1">
            <p className="text-sm font-medium text-zinc-100">kamal subedi</p>
            <p className="text-xs text-zinc-500 mt-0.5">subedivaii@gmail.com</p>
          </div> */}
          <div className=" flex px-3 py-2.5 border-b border-white/6 mb-1">
            <div className="flex items-center gap-2.5">
              <button className="flex items-center gap-1.5 rounded-full border  bg-white/5 px-4 py-2 text-sm font-medium text-base ">
                <ShareIcon size={14} />
                Share
              </button>
            </div>
            <div className="flex items-center gap-2.5 ml-auto">
              <div className="p-[2px] rounded-full bg-gradient-to-br  via-blue-500 to-amber-400 cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br  flex items-center justify-center text-xs font-semibold text-white">
                  KS
                </div>
              </div>
            </div>
          </div>
          <DropdownMenuItem className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-violet-300 bg-violet-500/10 hover:bg-violet-500/15 hover:text-violet-200 cursor-pointer">
            <UserCircleIcon size={16} className="text-violet-400" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/6 hover:text-zinc-100 cursor-pointer">
            <UsersIcon size={16} />
            Community
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/6 hover:text-zinc-100 cursor-pointer">
            <CreditCardIcon size={16} />
            <span className="flex-1">Subscription</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/6 hover:text-zinc-100 cursor-pointer">
            <SettingsIcon size={16} />
            <span className="flex-1">Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-white/6" />

          <DropdownMenuItem className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/6 hover:text-zinc-100 cursor-pointer">
            <HelpCircleIcon size={16} />
            Help center
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-white/6" />

          <DropdownMenuItem className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/8 hover:text-red-300 cursor-pointer">
            <LogOutIcon size={16} />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  );
}

export { DropdownMenuIcons as DropdownMenuProfileIcons };
