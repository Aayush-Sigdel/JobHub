import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode } from "react";

export const SignInModal = ({ children }: { children: ReactNode }) => {
  return (
    <Dialog>
      {/* "children" allows you to pass any button or link to trigger this modal */}
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome back</DialogTitle>
        </DialogHeader>
        {/* Auth form logic goes here */}
      </DialogContent>
    </Dialog>
  );
};
