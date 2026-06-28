import { FileText } from "lucide-react";

export function ProfileQuickLinks() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-[17px] font-bold mb-4">Quick Links</h2>
      <div className="flex items-center gap-3 cursor-pointer hover:underline text-foreground/90 dark:text-gray-200 font-semibold text-[15px]">
        <FileText className="w-5 h-5 text-muted-foreground" />
        Gigs
      </div>
    </div>
  );
}
