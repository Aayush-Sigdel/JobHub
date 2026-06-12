import { SearchBar } from "@/components/ui/search";
import { ThemeToggle } from "../../../../components/layout/theme-toggle";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NavigationBar = () => {
  return (
    <div className="flex ">
      <div className="flex items-center w-1/2 gap-x-4 ">
        <h1 className="text-4xl font-bold font-heading">
          Job
          <span className="text-amber-500">Hub</span>
        </h1>
        <SearchBar />
      </div>
      <div className="flex items-center gap-4 font-heading text-4xl font-bold justify-center w-1/2 ">
        <Link href={"/"} className={buttonVariants({ variant: "ghost" })}>
          Home
        </Link>
        <Link href={"/about"} className={buttonVariants({ variant: "ghost" })}>
          About
        </Link>
        <Link
          href={"/contact"}
          className={buttonVariants({ variant: "ghost" })}
        >
          Contract
        </Link>
      </div>

      <div className="flex items-center gap-4 w-1/2 justify-end">
        <Link href={"/profie"}>
          <Avatar>
            <AvatarImage
              src={"/placeholder-user.jpg"}
              alt="user profile"
              className="grayscale"
            />
            <AvatarFallback>PP</AvatarFallback>
          </Avatar>
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
};
export default NavigationBar;
