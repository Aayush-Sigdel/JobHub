// app/@modal/(.)login/page.tsx
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RouteModal } from "@/components/web/route-modal";
import { SignInModal } from "@/components/auth/sign-in-modal";

export default function LoginModal() {
  return (
    <RouteModal>
      <SignInModal />
    </RouteModal>
  );
}
