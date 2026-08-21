import React from "react";
import { AuthNavbar } from "@/components/auth/auth-navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-white flex flex-col">
      {/* Auth-Specific Navbar */}
      <AuthNavbar />

      {/* Main Auth Content */}
      <div className="w-full flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
