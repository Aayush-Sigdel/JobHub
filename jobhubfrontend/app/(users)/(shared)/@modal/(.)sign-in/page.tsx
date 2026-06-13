// app/@modal/(.)login/page.tsx
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RouteModal } from "@/components/web/route-modal";

export default function LoginModal() {
  return (
    <RouteModal>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Welcome back</DialogTitle>
        <DialogDescription>
          Enter your details to sign in to your JobHub account.
        </DialogDescription>
      </DialogHeader>

      <div className="py-6 flex flex-col gap-4">
        {/* Replace with your actual Form Component */}
        <div className="h-10 w-full border rounded-md bg-muted/20 flex items-center px-3 text-sm text-muted-foreground">
          Email
        </div>
        <div className="h-10 w-full border rounded-md bg-muted/20 flex items-center px-3 text-sm text-muted-foreground">
          Password
        </div>
        <Button className="w-full">Sign In</Button>
      </div>
    </RouteModal>
  );
}
