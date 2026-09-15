import React from "react";
import { AuthNavbar } from "@/components/auth/auth-navbar";
import "./auth.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-shell relative min-h-dvh w-full bg-background text-foreground flex flex-col">
      {/* Auth-Specific Navbar */}
      <AuthNavbar />

      {/* Main Auth Content */}
      <div className="w-full flex-1 flex flex-col">{children}</div>
    </div>
  );
}
