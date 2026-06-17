// app/@modal/(.)login/page.tsx
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RouteModal } from "@/components/web/route-modal";
import { SignUpModal } from "@/components/auth/sign-up-modal";

export default function SignupModal() {
  return (
    <RouteModal>
      <SignUpModal />
    </RouteModal>
  );
}
