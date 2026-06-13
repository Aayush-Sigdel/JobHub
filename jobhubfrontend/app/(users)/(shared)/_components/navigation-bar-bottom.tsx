"use client";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import NavLink from "@/components/web/nav-link";
import Image from "next/image";

const NavigationBarBottom = () => {
  return (
    <div className="w-full bg-background border-b border-background-200">
      <nav className="flex justify-around py-2 items-center">
        <NavLink href={"#"}>
          <div className="flex items-center justify-center h-2 ">
            <Image
              src="/icons/Fire.gif"
              alt="fire icon"
              width={18}
              height={10}
            />
            <span className="ml-2 text-sm font-semibold text-amber-500">
              Latest Jobs
            </span>
          </div>
        </NavLink>
        <NavLink href={"#"}>Full Stack</NavLink>
        <NavLink href={"#"}>Frontend Developer</NavLink>
        <NavLink href={"#"}>Backend Developer</NavLink>
        <NavLink href={"#"}>Data Scientist</NavLink>
        <NavLink href={"#"}>DevOps Engineer</NavLink>
        <NavLink href={"#"}>Mobile Developer</NavLink>
        <NavLink href={"#"}>UI/UX Designer</NavLink>
        <NavLink href={"#"}>Product Manager</NavLink>
        <NavLink href={"#"}>QA Engineer</NavLink>
        <NavLink href={"#"}>Cloud Engineer</NavLink>
        <NavLink href={"#"}>more</NavLink>
      </nav>
    </div>
  );
};

export default NavigationBarBottom;
