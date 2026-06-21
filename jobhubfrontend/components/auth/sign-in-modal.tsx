import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

export const SignInModal = () => {
  return (
    <div className="w-full max-w-md p-8 ">
      <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
      <p className="text-muted-foreground mb-6">
        Enter your details to sign Kamal in to your JobHub account.
      </p>

      <div className="flex flex-col gap-4">
        <div className="h-10 w-full border rounded-md bg-muted/20 flex items-center px-3 text-sm text-muted-foreground">
          Email
        </div>
        <div className="h-10 w-full border rounded-md bg-muted/20 flex items-center px-3 text-sm text-muted-foreground">
          Password
        </div>
        <Button className="w-full">Sign In</Button>
      </div>
    </div>
  );
};
