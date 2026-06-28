import { Video, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileIntroVideo() {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-input transition-colors cursor-pointer group">
      <div>
        <h2 className="text-xl font-bold mb-2">Intro video</h2>
        <p className="text-muted-foreground text-sm mb-6">Introduce yourself and make a connection with potential clients.</p>
        <Button variant="outline" className="rounded-lg font-semibold bg-card group-hover:bg-muted">
          <Plus className="w-4 h-4 mr-2" /> Add intro video
        </Button>
      </div>
      <div className="bg-success/10 w-32 h-24 rounded-xl flex items-center justify-center border border-success/20 flex-shrink-0 relative">
        <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-sm relative z-10 border border-success/30">
          <Video className="w-5 h-5 text-success" />
         </div>
      </div>
    </div>
  );
}
