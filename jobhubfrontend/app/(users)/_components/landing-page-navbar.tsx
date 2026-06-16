import Link from "next/link";
import Logo from "./logo";
import { Separator } from "@/components/ui/separator";

const LandingPageNavbar = () => {
  return (
    <nav className="w-full flex justify-between items-center py-6 px-6 md:px-12 lg:px-24">
      <Logo />
      <div className="hidden md:flex items-center gap-8 font-black text-sm uppercase tracking-wider text-black">
        <Link
          className="underline-offset-8 hover:underline decoration-[3px] transition-all"
          href="#"
        >
          Explore jobs
        </Link>
        <Link
          className="underline-offset-8 hover:underline decoration-[3px] transition-all"
          href="#"
        >
          Discover Companies
        </Link>

        <Separator orientation="vertical" className="bg-black/20 h-5" />

        <Link
          className="underline-offset-8 hover:underline decoration-[3px] transition-all"
          href="#"
        >
          For Employers
        </Link>
      </div>

      <div className="flex md:hidden items-center">
        <Link
          href="#"
          className="font-bold text-black border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
        >
          Menu
        </Link>
      </div>
    </nav>
  );
};

export default LandingPageNavbar;
