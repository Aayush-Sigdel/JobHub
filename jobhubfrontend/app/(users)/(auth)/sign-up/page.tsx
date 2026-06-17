import { SignUpModal } from "@/components/auth/sign-up-modal";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-muted/20">
      <SignUpModal />
    </div>
  );
}
