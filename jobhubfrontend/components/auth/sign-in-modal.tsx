import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Mail, TicketCheckIcon } from "lucide-react";
import Link from "next/link";
import {
  IconBrandApple,
  IconBrandFacebook,
  IconBrandGoogle,
} from "@tabler/icons-react";
import { Separator } from "../ui/separator";

export const SignInModal = () => {
  const newLocal = "/sign-up";
  return (
    <div className="flex w-1/2 h-[60vh] ">
      <div className="w-1/2 bg-[url(/auth.jpg)] bg-cover bg-center text-primary rounded-l-xl p-8 border-2 border-solid shadow-2xl">
        <h1 className="text-2xl font-bold flex items-center text-foreground">
          Success starts here
        </h1>
        <div className="mt-8 flex flex-col gap-4 text-sm ">
          <p className="flex items-center gap-2 font-bold text-foreground">
            <TicketCheckIcon className="w-4 h-4" />
            <span>Over 700 job categories</span>
          </p>
          <p className="flex items-center gap-2 font-bold text-foreground">
            <TicketCheckIcon className="w-4 h-4" />
            <span>Quality work done faster</span>
          </p>
          <p className="flex items-center gap-2 font-bold text-foreground">
            <TicketCheckIcon className="w-4 h-4" />
            <span>Access to talent and businesses across the globe</span>
          </p>
        </div>
      </div>
      <div className="w-1/2 rounded-r-xl shadow-2xl border-2 border-solid">
        <div className="align-items-center text-center p-8 mb-8  ">
          <h1 className="font-bold text-xl">Log into your account</h1>
          <p>
            Don’t have an account?{" "}
            <Link href={newLocal} className="text-primary hover:underline">
              Join here
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-4 px-8 ">
          <Button className="w-full">
            <IconBrandGoogle />
            Continue with Google
          </Button>
          <Button className="w-full">
            <IconBrandApple />
            Continue with Apple
          </Button>
          <Button className="w-full">
            <IconBrandFacebook />
            Continue with Facebook
          </Button>

          <div className="flex items-center mt-5 w-full align-items-center">
            <Separator className="flex-1" />
            <span>OR </span>
            <Separator className="flex-1" />
          </div>

          <Button className="w-full">
            <Mail /> Continue with email
          </Button>
        </div>
        <div className="mt-40 align-baseline text-center px-8 * text-sm text-muted-foreground ">
          <p>
            By joining, you agree to the Fiverr{" "}
            <Link href="/join" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and to occasionally receive emails from us. Please read our{" "}
            <Link href="/join" className="text-primary hover:underline">
              Privacy Policy
            </Link>{" "}
            to learn how we use your personal data.
          </p>
        </div>
      </div>
    </div>
  );
};
