"use client";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import NavLink from "@/components/web/nav-link";
import Image from "next/image";

const categories = [
  {
    id: 1,
    name: "Full Stack",
    href: "#",
  },
  {
    id: 2,
    name: "Frontend Developer",
    href: "#",
  },
  {
    id: 3,
    name: "Backend Developer",
    href: "#",
  },
  {
    id: 4,
    name: "Data Scientist",
    href: "#",
  },
  {
    id: 5,
    name: "DevOps Engineer",
    href: "#",
  },
  {
    id: 6,
    name: "Mobile Developer",
    href: "#",
  },
  {
    id: 7,
    name: "UI/UX Designer",
    href: "#",
  },
  {
    id: 8,
    name: "Product Manager",
    href: "#",
  },
  {
    id: 9,
    name: "QA Engineer",
    href: "#",
  },
  {
    id: 10,
    name: "Cloud Engineer",
    href: "#",
  },
];

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

        {categories.map((category) => (
          <NavLink key={category.id} href={category.href}>
            {category.name}
          </NavLink>
        ))}
        <NavLink href={"#"}>more</NavLink>
      </nav>
    </div>
  );
};

export default NavigationBarBottom;
