import Link from "next/link";
import Logo from "./logo";

const LandingPageNavbar = () => {
  return (
    <nav className="w-full flex justify-between items-center py-6 px-6 md:px-12 lg:px-24">
      <Logo />
      <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-800">
        <Link className="hover:text-black transition-colors" href="#">
          Explore jobs
        </Link>
        <Link className="hover:text-black transition-colors" href="#">
          Discover Companies
        </Link>

        <div className="w-px h-5 bg-slate-800/20"></div>

        <Link className="hover:text-black transition-colors" href="#">
          For Employers
        </Link>
      </div>

      <div className="flex md:hidden items-center">
        <Link
          href="#"
          className="font-medium text-slate-800 hover:text-black transition-colors"
        >
          Menu
        </Link>
      </div>
    </nav>
  );
};

export default LandingPageNavbar;
