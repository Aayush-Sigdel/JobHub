import { SignInModal } from "@/components/auth/sign-in-modal";

export default function LoginPage() {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-muted/20">
      <SignInModal />
    </div>
  );
}
