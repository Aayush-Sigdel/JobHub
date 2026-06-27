import {
  CreditCardIcon,
  HelpCircleIcon,
  LogOutIcon,
  SettingsIcon,
  ShareIcon,
  UserCircleIcon,
  UsersIcon,
} from "lucide-react";
import { motion } from "motion/react";
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
            <div className="p-[2px] rounded-full border border-border bg-muted cursor-pointer transition-transform hover:scale-105">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                KS
              </div>
            </div>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          asChild
          className="w-72 rounded-2xl border border-border p-0 shadow-lg text-foreground bg-background outline-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.35, duration: 0.5 }}
            className="p-2 bg-background rounded-2xl border border-border"
          >
          {/* <div className="px-3 py-2.5 border-b border-white/6 mb-1">
            <p className="text-sm font-medium text-zinc-100">kamal subedi</p>
            <p className="text-xs text-zinc-500 mt-0.5">subedivaii@gmail.com</p>
          </div> */}
          <div className="flex px-3 py-3 border-b border-border mb-2">
            <div className="flex items-center gap-2.5">
              <button className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors">
                <ShareIcon size={14} />
                Share
              </button>
            </div>
            <div className="flex items-center gap-2.5 ml-auto">
              <div className="p-[2px] rounded-full border border-border bg-muted cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  KS
                </div>
              </div>
            </div>
          </div>
          <DropdownMenuItem className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors focus:bg-muted">
            <UserCircleIcon size={16} strokeWidth={2} />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors focus:bg-muted">
            <UsersIcon size={16} strokeWidth={2} />
            Community
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors focus:bg-muted">
            <CreditCardIcon size={16} strokeWidth={2} />
            <span className="flex-1">Subscription</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors focus:bg-muted">
            <SettingsIcon size={16} strokeWidth={2} />
            <span className="flex-1">Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-border h-px" />

          <DropdownMenuItem className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors focus:bg-muted">
            <HelpCircleIcon size={16} strokeWidth={2} />
            Help center
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-border h-px" />

          <DropdownMenuItem className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer transition-colors focus:bg-destructive/10 focus:text-destructive">
            <LogOutIcon size={16} strokeWidth={2} />
            Sign out
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
      </div>
    </DropdownMenu>
  );
}

export { DropdownMenuIcons as DropdownMenuProfileIcons };
