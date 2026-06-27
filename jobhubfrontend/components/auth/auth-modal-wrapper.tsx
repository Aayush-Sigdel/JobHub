import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import React from "react";

export function AuthModalWrapper({ 
  isOpen, 
  setIsOpen, 
  children 
}: { 
  isOpen: boolean; 
  setIsOpen: (open: boolean) => void; 
  children: React.ReactNode;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[fit-content] w-full p-0 border-0 bg-transparent shadow-none overflow-hidden sm:rounded-[32px]">
        <DialogTitle className="sr-only">Authentication Modal</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
